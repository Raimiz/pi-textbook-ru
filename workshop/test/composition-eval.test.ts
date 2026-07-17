import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  createRuntime,
  runInteractive,
  runJson,
  runPrint,
  type ModeIO,
  type RuntimeDeps,
} from "../src/composition.js";
import {
  EvalAssertionError,
  runEvalCase,
  runEvalSuite,
} from "../src/eval.js";
import type { ResourceCatalog } from "../src/resources.js";
import { ScriptedModel } from "../src/scripted-model.js";
import { InMemorySessionStore } from "../src/session.js";
import {
  objectSchema,
  stringValue,
  ToolRegistry,
} from "../src/tool.js";
import {
  assistantMessage,
  text,
  type ToolCall,
} from "../src/types.js";

function output(): {
  io: ModeIO;
  stdout: string[];
  stderr: string[];
  exitCodes: number[];
} {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCodes: number[] = [];
  return {
    stdout,
    stderr,
    exitCodes,
    io: {
      stdout: (chunk) => stdout.push(chunk),
      stderr: (chunk) => stderr.push(chunk),
      setExitCode: (code) => exitCodes.push(code),
    },
  };
}

function call(
  id: string,
  name: string,
  argumentsValue: unknown,
): ToolCall {
  return {
    type: "toolCall",
    id,
    name,
    arguments: argumentsValue,
  };
}

test("composition root 使用注入依赖，三种 adapter 共享核心语义", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "pi-composition-"));
  const resources: ResourceCatalog = {
    resources: [],
    templates: [],
    skills: [],
    diagnostics: [
      {
        level: "warning",
        code: "root_unreadable",
        message: "fixture",
      },
    ],
    diagnosticMessages: ["fixture"],
  };
  const session = new InMemorySessionStore();
  const tools = new ToolRegistry();
  tools.register({
    name: "echo",
    description: "echo a value",
    schema: objectSchema({ value: stringValue }),
    async execute({ value }) {
      return { content: [text(value)] };
    },
  });
  const deps: RuntimeDeps = {
    model: new ScriptedModel([
      assistantMessage([text("one")]),
      assistantMessage([text("two")]),
      assistantMessage(
        [call("echo-1", "echo", { value: "three" })],
        "toolUse",
      ),
      assistantMessage([text("three")]),
    ]),
    tools,
    session,
    resources,
    createId: (() => {
      let value = 0;
      return () => `entry-${++value}`;
    })(),
    now: () => 1,
  };
  const runtime = await createRuntime({ cwd: root }, deps);
  t.after(async () => {
    await runtime.dispose();
    await rm(root, { recursive: true, force: true });
  });

  const print = output();
  const interactive = output();
  const json = output();
  const printResult = await runPrint(runtime, "p1", print.io);
  const interactiveResult = await runInteractive(
    runtime,
    "p2",
    interactive.io,
  );
  const jsonResult = await runJson(runtime, "p3", json.io);

  assert.equal(runtime.session, session);
  assert.equal(runtime.resources, resources);
  assert.equal(print.stdout.join(""), "one");
  assert.equal(interactive.stdout.join(""), "two");
  assert.equal(printResult.status, "ok");
  assert.equal(interactiveResult.status, "ok");
  assert.equal(jsonResult.status, "ok");
  assert.equal(printResult.exitCode, 0);
  assert.equal(jsonResult.exitCode, 0);
  assert.deepEqual(print.exitCodes, [0]);
  assert.deepEqual(json.exitCodes, [0]);
  assert.deepEqual(print.stderr, ["[diagnostic] fixture\n"]);
  assert.deepEqual(json.stderr, ["[diagnostic] fixture\n"]);

  const wire = json.stdout.map((line) => JSON.parse(line));
  assert.deepEqual(
    wire.map((event) => event.seq),
    [1, 2, 3],
  );
  assert.deepEqual(
    wire.map((event) => event.type),
    ["tool_end", "text_delta", "result"],
  );
  assert.deepEqual(Object.keys(wire[0]).sort(), [
    "callId",
    "isError",
    "seq",
    "type",
    "v",
  ]);
  assert.equal(wire[0].callId, "echo-1");
  assert.equal(wire[0].isError, false);
  assert.equal(wire[2].status, "ok");
  assert.equal((wire[0] as Record<string, unknown>).runId, undefined);
  assert.equal((wire[0] as Record<string, unknown>).event, undefined);
  assert.equal((await session.entries()).length, 8);
});

test("print/json 都用 stderr 与 exit code 表达失败，JSON 仍有唯一终态", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "pi-mode-error-"));
  const runtime = await createRuntime({
    cwd: root,
    model: new ScriptedModel([
      {
        stopReason: "error",
        errorMessage: "provider unavailable",
      },
      {
        stopReason: "aborted",
        errorMessage: "cancelled",
      },
    ]),
  });
  t.after(async () => {
    await runtime.dispose();
    await rm(root, { recursive: true, force: true });
  });

  const print = output();
  const printed = await runPrint(runtime, "fail", print.io);
  assert.equal(printed.exitCode, 1);
  assert.deepEqual(print.exitCodes, [1]);
  assert.equal(print.stdout.join(""), "");
  assert.match(print.stderr.join(""), /provider unavailable/);

  const json = output();
  const jsonRun = await runJson(runtime, "cancel", json.io);
  assert.equal(jsonRun.exitCode, 130);
  assert.deepEqual(json.exitCodes, [130]);
  assert.match(json.stderr.join(""), /cancelled/);
  const wire = json.stdout.map((line) => JSON.parse(line));
  assert.equal(wire.at(-1).type, "result");
  assert.equal(wire.at(-1).status, "aborted");
  assert.equal(
    wire.filter((event) => event.type === "result").length,
    1,
  );
});

test("composition 把 resource disclosure 与 extension hook 接入真实 loop", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "pi-runtime-resource-"));
  const skillRoot = path.join(root, ".pi", "skills", "guard");
  const skillFile = path.join(skillRoot, "SKILL.md");
  await mkdir(skillRoot, { recursive: true });
  await writeFile(
    skillFile,
    "---\nname: guard\ndescription: protect writes\n---\nAlways inspect before editing.",
    "utf8",
  );
  const resources: ResourceCatalog = {
    resources: [
      {
        kind: "skill",
        name: "guard",
        description: "protect writes",
        source: skillFile,
        root: skillRoot,
        scope: "project",
      },
    ],
    templates: [],
    skills: [
      {
        kind: "skill",
        name: "guard",
        description: "protect writes",
        source: skillFile,
        root: skillRoot,
        scope: "project",
      },
    ],
    diagnostics: [],
    diagnosticMessages: [],
  };
  const model = new ScriptedModel([
    assistantMessage(
      [call("echo-denied", "echo", { value: "blocked" })],
      "toolUse",
    ),
    assistantMessage([text("observed denial")]),
  ]);
  const tools = new ToolRegistry();
  tools.register({
    name: "echo",
    description: "echo",
    schema: objectSchema({ value: stringValue }),
    async execute({ value }) {
      return { content: [text(value)] };
    },
  });
  const runtime = await createRuntime(
    {
      cwd: root,
      systemPrompt: "base",
      activeSkills: ["guard"],
    },
    { model, tools, resources },
  );
  t.after(async () => {
    await runtime.dispose();
    await rm(root, { recursive: true, force: true });
  });
  runtime.extensions.context.on("beforeToolCall", () => ({
    decision: "deny",
    reason: "teaching policy",
  }));

  const result = await runtime.agent.prompt("go");
  await runtime.flush();
  const toolResult = result.messages.find(
    (message) => message.role === "toolResult",
  );
  assert.equal(toolResult?.role === "toolResult" && toolResult.isError, true);
  assert.match(
    toolResult?.role === "toolResult"
      ? toolResult.content[0].text
      : "",
    /teaching policy/,
  );
  assert.match(model.requests[0].systemPrompt ?? "", /Available resources/);
  assert.match(model.requests[0].systemPrompt ?? "", /Activated skill: guard/);
  assert.equal(runtime.activatedSkills[0].skill?.name, "guard");
});

test("结构化 eval 使用临时 workspace、composition root 与确定性报告", async () => {
  const editCall = call("edit-1", "edit", {
    path: "src/value.ts",
    oldText: "return 1",
    newText: "return 2",
  });
  const evalCase = {
    id: "fix-value",
    prompt: "fix it",
    files: {
      "src/value.ts": "export function value() { return 1; }\n",
    },
    script: [
      assistantMessage([editCall], "toolUse"),
      assistantMessage([text("fixed")]),
    ],
    assert(result: Awaited<ReturnType<typeof runEvalCase>>) {
      assert.equal(
        result.files["src/value.ts"],
        "export function value() { return 2; }\n",
      );
      assert.equal(result.metrics.turns, 2);
      assert.equal(result.metrics.toolCalls, 1);
      assert.equal(result.session.length, result.transcript.length);
    },
  };

  const first = await runEvalCase(evalCase);
  const second = await runEvalCase(evalCase);
  assert.equal(first.status, "passed");
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first).includes(os.tmpdir()), false);
  assert.deepEqual(
    first.session.map((entry) => entry.id),
    [
      "fix-value-entry-1",
      "fix-value-entry-2",
      "fix-value-entry-3",
      "fix-value-entry-4",
    ],
  );
  assert.ok(
    first.transcript.every((message) => message.timestamp === 0),
  );
});

test("eval 分开报告 protocol、task 与 infra failure，并继续 suite", async () => {
  const cases = [
    {
      id: "unpaired",
      prompt: "go",
      files: {},
      script: [
        assistantMessage(
          [
            call("duplicate-call", "read", { path: "x" }),
            call("duplicate-call", "read", { path: "y" }),
          ],
          "toolUse",
        ),
        assistantMessage([text("done")]),
      ],
      assert() {},
    },
    {
      id: "bad-task",
      prompt: "go",
      files: {},
      script: [assistantMessage([text("done")])],
      assert() {
        throw new EvalAssertionError("task_failed", {
          layer: "task",
          firstDivergence: "wrong final answer",
        });
      },
    },
    {
      id: "bad-fixture",
      prompt: "go",
      files: { "../escape.txt": "no" },
      script: [assistantMessage([text("unused")])],
      assert() {},
    },
    {
      id: "still-runs",
      prompt: "go",
      files: {},
      script: [assistantMessage([text("ok")])],
      assert() {},
    },
  ] as const;

  const results = await runEvalSuite(cases);
  assert.deepEqual(
    results.map((result) => result.status),
    ["protocol_failed", "task_failed", "infra_failed", "passed"],
  );
  assert.match(
    results[0].failure?.firstDivergence ?? "",
    /id 重复/,
  );
  assert.equal(results[3].passed, true);
});

test("tool 抛错会成为配对 result，而不是 runner infra failure", async () => {
  const tools = new ToolRegistry();
  tools.register({
    name: "explode",
    description: "throw",
    schema: objectSchema({ message: stringValue }),
    async execute() {
      throw new Error("boom");
    },
  });

  const result = await runEvalCase({
    id: "tool-error",
    prompt: "go",
    files: {},
    tools,
    script: [
      assistantMessage(
        [call("explode-1", "explode", { message: "boom" })],
        "toolUse",
      ),
      assistantMessage([text("recovered")]),
    ],
    assert(value) {
      const toolResult = value.transcript.find(
        (message) => message.role === "toolResult",
      );
      assert.equal(toolResult?.toolCallId, "explode-1");
      assert.equal(toolResult?.isError, true);
    },
  });

  assert.equal(result.status, "passed");
  assert.equal(result.metrics.toolCalls, 1);
});
