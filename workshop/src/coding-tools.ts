import { spawn } from "node:child_process";
import {
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import {
  objectSchema,
  optionalPositiveInteger,
  stringValue,
  ToolRegistry,
  type Tool,
  type ToolOutput,
} from "./tool.js";
import { text } from "./types.js";

export type ContainmentMode = "workspace" | "unrestricted";

export interface CodingToolsOptions {
  cwd: string;
  containment: ContainmentMode;
  maxReadBytes?: number;
  maxReadLines?: number;
  maxBashOutputBytes?: number;
  bashTimeoutMs?: number;
}

interface ReadDetails {
  path: string;
  bytes: number;
  lines: number;
  startLine: number;
  endLine: number;
  truncated: boolean;
}

interface WriteDetails {
  path: string;
  bytes: number;
}

interface EditDetails {
  path: string;
  oldBytes: number;
  newBytes: number;
  edits: number;
}

interface BashDetails {
  command: string;
  exitCode: number | null;
  timedOut: boolean;
  aborted: boolean;
  truncated: boolean;
}

class MutationQueue {
  private readonly tails = new Map<string, Promise<void>>();

  async run<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.tails.get(key) ?? Promise.resolve();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.catch(() => undefined).then(() => gate);
    this.tails.set(key, tail);

    await previous.catch(() => undefined);
    try {
      return await operation();
    } finally {
      release();
      if (this.tails.get(key) === tail) this.tails.delete(key);
    }
  }
}

const mutations = new MutationQueue();

function isInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function nearestExistingPath(candidate: string): Promise<string> {
  let cursor = candidate;
  while (true) {
    try {
      return await realpath(cursor);
    } catch {
      const parent = path.dirname(cursor);
      if (parent === cursor) throw new Error(`无法解析路径祖先：${candidate}`);
      cursor = parent;
    }
  }
}

async function resolvedPath(
  cwd: string,
  candidate: string,
  containment: ContainmentMode,
): Promise<string> {
  const root = path.resolve(cwd);
  const resolved = path.resolve(root, candidate);
  if (
    containment === "workspace" &&
    resolved !== root &&
    !resolved.startsWith(`${root}${path.sep}`)
  ) {
    throw new Error(`路径越过教学 workspace：${candidate}`);
  }
  if (containment === "workspace") {
    const [realRoot, realCandidateOrParent] = await Promise.all([
      realpath(root),
      nearestExistingPath(resolved),
    ]);
    if (!isInside(realRoot, realCandidateOrParent)) {
      throw new Error(`符号链接越过教学 workspace：${candidate}`);
    }
  }
  return resolved;
}

async function atomicWrite(file: string, value: string): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.pi-tmp-${process.pid}-${Date.now()}`;
  try {
    await writeFile(temporary, value, "utf8");
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true }).catch(() => undefined);
  }
}

function createReadTool(options: Required<CodingToolsOptions>): Tool {
  return {
    name: "read",
    description: "按行数和字节上限读取 UTF-8 文件",
    schema: objectSchema({
      path: stringValue,
      offset: optionalPositiveInteger,
      limit: optionalPositiveInteger,
    }),
    async execute({ path: inputPath, offset, limit }) {
      const file = await resolvedPath(
        options.cwd,
        inputPath,
        options.containment,
      );
      const value = await readFile(file, "utf8");
      const sourceLines = value.split("\n");
      const startIndex = Math.max(0, (offset ?? 1) - 1);
      const requestedLines = Math.min(
        limit ?? options.maxReadLines,
        options.maxReadLines,
      );
      const endIndex = Math.min(
        sourceLines.length,
        startIndex + requestedLines,
      );
      let selected = sourceLines
        .slice(startIndex, endIndex)
        .map(
          (line, index) =>
            `${String(startIndex + index + 1).padStart(4, " ")}│ ${line}`,
        )
        .join("\n");
      let truncated = endIndex < sourceLines.length;
      const bytes = Buffer.byteLength(selected);
      if (bytes > options.maxReadBytes) {
        selected = Buffer.from(selected)
          .subarray(0, options.maxReadBytes)
          .toString("utf8");
        truncated = true;
      }
      if (truncated) {
        selected += `\n\n[Showing lines ${startIndex + 1}-${endIndex} of ${sourceLines.length}. Continue with offset=${endIndex + 1}.]`;
      }
      return {
        content: [text(selected)],
        details: {
          path: file,
          bytes: Buffer.byteLength(value),
          lines: sourceLines.length,
          startLine: startIndex + 1,
          endLine: endIndex,
          truncated,
        } satisfies ReadDetails,
      };
    },
  };
}

function createWriteTool(options: Required<CodingToolsOptions>): Tool {
  return {
    name: "write",
    description: "显式创建或完整覆盖一个 UTF-8 文件",
    schema: objectSchema({
      path: stringValue,
      content: stringValue,
    }),
    async execute({ path: inputPath, content }) {
      const file = await resolvedPath(
        options.cwd,
        inputPath,
        options.containment,
      );
      await mutations.run(file, () => atomicWrite(file, content));
      return {
        content: [text(`Wrote ${Buffer.byteLength(content)} bytes`)],
        details: {
          path: file,
          bytes: Buffer.byteLength(content),
        } satisfies WriteDetails,
      };
    },
  };
}

interface ExactEdit {
  oldText: string;
  newText: string;
}

function parseEditParameters(value: unknown): {
  path: string;
  edits: ExactEdit[];
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("参数必须是 object");
  }
  const input = value as Record<string, unknown>;
  const inputPath = stringValue(input.path);
  const rawEdits = Array.isArray(input.edits)
    ? input.edits
    : [{ oldText: input.oldText, newText: input.newText }];
  if (rawEdits.length === 0) throw new Error("edits 不能为空");
  const edits = rawEdits.map((edit) => {
    if (!edit || typeof edit !== "object" || Array.isArray(edit)) {
      throw new Error("每个 edit 必须是 object");
    }
    const record = edit as Record<string, unknown>;
    return {
      oldText: stringValue(record.oldText),
      newText: stringValue(record.newText),
    };
  });
  return { path: inputPath, edits };
}

function createEditTool(options: Required<CodingToolsOptions>): Tool {
  return {
    name: "edit",
    description: "先验证一批唯一精确匹配，再一次写回文件",
    schema: { parse: parseEditParameters },
    async execute({ path: inputPath, edits }) {
      const file = await resolvedPath(
        options.cwd,
        inputPath,
        options.containment,
      );
      return mutations.run(file, async () => {
        const current = await readFile(file, "utf8");
        let next = current;
        for (const [index, edit] of edits.entries()) {
          if (!edit.oldText) throw new Error(`edits[${index}].oldText 不能为空`);
          const first = next.indexOf(edit.oldText);
          if (first < 0) throw new Error(`edits[${index}] 没有匹配`);
          if (
            next.indexOf(edit.oldText, first + edit.oldText.length) >= 0
          ) {
            throw new Error(
              `edits[${index}] 匹配多次；请提供更精确的上下文`,
            );
          }
          next =
            next.slice(0, first) +
            edit.newText +
            next.slice(first + edit.oldText.length);
        }
        await atomicWrite(file, next);
        return {
          content: [text(`Applied ${edits.length} exact replacement(s)`)],
          details: {
            path: file,
            oldBytes: Buffer.byteLength(current),
            newBytes: Buffer.byteLength(next),
            edits: edits.length,
          } satisfies EditDetails,
        };
      });
    },
  };
}

function killProcessTree(
  pid: number | undefined,
  signal: NodeJS.Signals = "SIGTERM",
): void {
  if (!pid) return;
  try {
    process.kill(-pid, signal);
  } catch {
    try {
      process.kill(pid, signal);
    } catch {
      // 进程已经退出。
    }
  }
}

async function runCommand(
  command: string,
  options: Required<CodingToolsOptions>,
  signal?: AbortSignal,
): Promise<ToolOutput<BashDetails>> {
  if (
    options.containment === "workspace" &&
    /(^|[\s;&|])(?:\/|~\/|\.\.\/)/.test(command)
  ) {
    throw new Error("教学 guardrail 拒绝显式绝对路径或 ../");
  }
  if (signal?.aborted) {
    return {
      content: [text("Command was not started because the run was aborted.")],
      details: {
        command,
        exitCode: null,
        timedOut: false,
        aborted: true,
        truncated: false,
      },
      isError: true,
    };
  }

  const child = spawn(command, {
    cwd: options.cwd,
    shell: true,
    detached: process.platform !== "win32",
    env: process.env,
  });
  const chunks: Buffer[] = [];
  let bytes = 0;
  let truncated = false;
  let timedOut = false;
  let forceKill: ReturnType<typeof setTimeout> | undefined;

  const collect = (chunk: Buffer) => {
    if (bytes >= options.maxBashOutputBytes) {
      truncated = true;
      return;
    }
    const remaining = options.maxBashOutputBytes - bytes;
    const accepted = chunk.subarray(0, remaining);
    chunks.push(accepted);
    bytes += accepted.length;
    if (accepted.length < chunk.length) truncated = true;
  };

  child.stdout?.on("data", collect);
  child.stderr?.on("data", collect);

  const terminate = () => {
    killProcessTree(child.pid, "SIGTERM");
    forceKill ??= setTimeout(
      () => killProcessTree(child.pid, "SIGKILL"),
      500,
    );
  };
  const onAbort = () => terminate();
  signal?.addEventListener("abort", onAbort, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    terminate();
  }, options.bashTimeoutMs);

  const exitCode = await new Promise<number | null>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  }).finally(() => {
    clearTimeout(timeout);
    if (forceKill) clearTimeout(forceKill);
    signal?.removeEventListener("abort", onAbort);
  });

  const suffix = truncated ? "\n… [output truncated]" : "";
  const output = Buffer.concat(chunks).toString("utf8") + suffix;
  const isError = exitCode !== 0 || timedOut || signal?.aborted === true;
  return {
    content: [text(output || `(exit ${exitCode ?? "signal"})`)],
    details: {
      command,
      exitCode,
      timedOut,
      aborted: signal?.aborted === true,
      truncated,
    },
    isError,
  };
}

function createBashTool(options: Required<CodingToolsOptions>): Tool {
  return {
    name: "bash",
    description: "在指定 cwd 启动可取消、有超时和输出上限的子进程",
    schema: objectSchema({ command: stringValue }),
    execute({ command }, context) {
      return runCommand(command, options, context.signal);
    },
  };
}

/**
 * workspace 模式只是一层课程主动强化，减少常见误操作，不是安全 sandbox：
 * shell、符号链接和子进程仍需要操作系统级隔离。当前上游 Pi 默认也不提供 cwd jail。
 */
export function createCodingTools(
  input: CodingToolsOptions,
): ToolRegistry {
  const options: Required<CodingToolsOptions> = {
    maxReadBytes: 48_000,
    maxReadLines: 240,
    maxBashOutputBytes: 96_000,
    bashTimeoutMs: 30_000,
    ...input,
    cwd: path.resolve(input.cwd),
  };
  return new ToolRegistry([
    createReadTool(options),
    createWriteTool(options),
    createEditTool(options),
    createBashTool(options),
  ]);
}
