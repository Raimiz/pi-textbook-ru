import {
  runAgentLoop,
  type LoopEvent,
} from "../agent-loop.js";
import { ScriptedModel } from "../scripted-model.js";
import {
  objectSchema,
  stringValue,
  ToolRegistry,
  type Tool,
} from "../tool.js";
import {
  assistantMessage,
  text,
  type AssistantMessage,
  type ToolCall,
} from "../types.js";

export type PrologueOwner = "user" | "model" | "loop" | "tool";

export type PrologueTraceType =
  | "user_message"
  | "model_start"
  | "assistant_message"
  | "tool_start"
  | "tool_result";

export interface PrologueTraceEvent {
  step: number;
  owner: PrologueOwner;
  type: PrologueTraceType;
  detail: string;
  toolCallId?: string;
  environmentAction?: "read";
}

const README_FIXTURE = "# tiny-pi\n用于学习 Agent 内核的 TypeScript 项目。";

function textOf(message: AssistantMessage): string {
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

function firstToolCall(message: AssistantMessage): ToolCall | undefined {
  return message.content.find(
    (block): block is ToolCall => block.type === "toolCall",
  );
}

function appendTrace(
  trace: PrologueTraceEvent[],
  event: Omit<PrologueTraceEvent, "step">,
): void {
  trace.push({ step: trace.length + 1, ...event });
}

function observeLoopEvent(
  trace: PrologueTraceEvent[],
  event: LoopEvent,
): void {
  if (event.type === "model_event" && event.event.type === "start") {
    const turn =
      trace.filter((item) => item.type === "model_start").length + 1;
    appendTrace(trace, {
      owner: "model",
      type: "model_start",
      detail: `turn=${turn}`,
    });
    return;
  }

  if (event.type === "assistant_message") {
    const call = firstToolCall(event.message);
    appendTrace(trace, {
      owner: "model",
      type: "assistant_message",
      detail: call
        ? `stopReason=${event.message.stopReason} toolCall id=${call.id} name=${call.name} arguments=${JSON.stringify(call.arguments)}`
        : `stopReason=${event.message.stopReason} text=${JSON.stringify(textOf(event.message))}`,
      ...(call ? { toolCallId: call.id } : {}),
    });
    return;
  }

  if (event.type === "tool_start") {
    appendTrace(trace, {
      owner: "loop",
      type: "tool_start",
      detail: `id=${event.call.id} name=${event.call.name}`,
      toolCallId: event.call.id,
    });
    return;
  }

  if (event.type === "tool_end") {
    const output = event.result.content
      .map((block) => block.text)
      .join("");
    appendTrace(trace, {
      owner: "tool",
      type: "tool_result",
      detail: `id=${event.result.toolCallId} isError=${event.result.isError} content=${JSON.stringify(output)}`,
      toolCallId: event.result.toolCallId,
      environmentAction: "read",
    });
  }
}

/**
 * 运行完全离线的两轮 Agent：第一次请求 read，第二次依据结果结束。
 * 返回值只保留教材需要观察的七个语义里程碑。
 */
export async function runPrologueDemo(): Promise<
  PrologueTraceEvent[]
> {
  const trace: PrologueTraceEvent[] = [
    {
      step: 1,
      owner: "user",
      type: "user_message",
      detail: JSON.stringify("读取 README.md，并概括项目"),
    },
  ];

  const model = new ScriptedModel([
    assistantMessage(
      [
        {
          type: "toolCall",
          id: "call_1",
          name: "read",
          arguments: { path: "README.md" },
        },
      ],
      "toolUse",
      { timestamp: 1 },
    ),
    assistantMessage(
      [
        text(
          "这是一个用于学习 Agent 内核的 TypeScript 项目。",
        ),
      ],
      "stop",
      { timestamp: 2 },
    ),
  ]);

  const readTool: Tool<{ path: string }, { path: string }> = {
    name: "read",
    description: "读取序章内置的 README fixture",
    schema: objectSchema({ path: stringValue }),
    async execute({ path }) {
      if (path !== "README.md") {
        throw new Error(`fixture 中没有 ${path}`);
      }
      return {
        content: [text(README_FIXTURE)],
        details: { path },
      };
    },
  };
  const tools = new ToolRegistry();
  tools.register(readTool);

  const result = await runAgentLoop({
    model,
    tools,
    context: {
      messages: [
        {
          role: "user",
          content: [text("读取 README.md，并概括项目")],
          timestamp: 0,
        },
      ],
    },
    onEvent: (event) => observeLoopEvent(trace, event),
  });

  if (result.reason !== "stop") {
    throw new Error(`序章演示异常结束：${result.reason}`);
  }
  assertValidPrologueTrace(trace);
  return trace;
}

/**
 * 检查 call/result 因果关系。最终文本正确也不能弥补悬空调用。
 */
export function assertValidPrologueTrace(
  trace: PrologueTraceEvent[],
): void {
  const requested = new Set<string>();
  const completed = new Set<string>();

  trace.forEach((event, index) => {
    if (event.type === "tool_result") {
      if (!event.toolCallId || !requested.has(event.toolCallId)) {
        throw new Error("tool result 先于对应的 tool call");
      }
      if (completed.has(event.toolCallId)) {
        throw new Error(`tool call ${event.toolCallId} 出现重复结果`);
      }
      completed.add(event.toolCallId);
    }

    if (
      event.type === "assistant_message" &&
      event.toolCallId
    ) {
      if (requested.has(event.toolCallId)) {
        throw new Error(`tool call ${event.toolCallId} 重复`);
      }
      requested.add(event.toolCallId);
    }

    if (
      event.type === "tool_start" &&
      (!event.toolCallId || !requested.has(event.toolCallId))
    ) {
      throw new Error("tool start 先于对应的 tool call");
    }

    if (event.step !== index + 1) {
      throw new Error(`trace step 应为 ${index + 1}`);
    }
  });

  for (const callId of requested) {
    if (!completed.has(callId)) {
      throw new Error(`tool call ${callId} 缺少配对结果`);
    }
  }

  const final = trace.at(-1);
  if (
    final?.type !== "assistant_message" ||
    !final.detail.includes("stopReason=stop")
  ) {
    throw new Error("trace 必须以 stop assistant message 结束");
  }
}

export function formatPrologueTrace(
  trace: PrologueTraceEvent[],
): string {
  return trace
    .map(
      (event) =>
        `${String(event.step).padStart(2, "0")} ${event.type.padEnd(17)} owner=${event.owner} ${event.detail}`,
    )
    .join("\n");
}
