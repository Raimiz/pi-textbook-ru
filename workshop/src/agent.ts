import {
  runAgentLoop,
  type AgentRunResult,
  type LoopEvent,
} from "./agent-loop.js";
import type { ToolExecutor, ToolRegistry } from "./tool.js";
import {
  assistantMessage,
  userMessage,
  type AgentMessage,
  type Model,
  type UserMessage,
} from "./types.js";

export interface AgentState {
  status: "idle" | "running";
  messages: AgentMessage[];
  activeRunId?: number;
  lastReason?: AgentRunResult["reason"];
  streamingText: string;
  pendingToolCallIds: string[];
  diagnostics: string[];
}

export type AgentEvent =
  | { type: "run_start"; runId: number; message: UserMessage }
  | { type: "loop"; runId: number; event: LoopEvent }
  | { type: "run_end"; runId: number; result: AgentRunResult };

export function reduceAgentState(
  state: AgentState,
  event: AgentEvent,
): AgentState {
  if (event.type === "run_start") {
    return {
      ...state,
      status: "running",
      activeRunId: event.runId,
      messages: [...state.messages, event.message],
      streamingText: "",
      pendingToolCallIds: [],
    };
  }
  if (event.type === "loop") {
    const loop = event.event;
    if (
      loop.type === "model_event" &&
      loop.event.type === "text_delta"
    ) {
      return {
        ...state,
        streamingText: state.streamingText + loop.event.delta,
      };
    }
    if (loop.type === "tool_start") {
      return {
        ...state,
        pendingToolCallIds: [
          ...state.pendingToolCallIds,
          loop.call.id,
        ],
      };
    }
    if (loop.type === "tool_end" || loop.type === "tool_skipped") {
      return {
        ...state,
        pendingToolCallIds: state.pendingToolCallIds.filter(
          (id) => id !== loop.result.toolCallId,
        ),
      };
    }
    if (loop.type === "assistant_message") {
      return { ...state, streamingText: "" };
    }
  }
  if (event.type === "run_end") {
    return {
      status: "idle",
      messages: event.result.messages,
      lastReason: event.result.reason,
      streamingText: "",
      pendingToolCallIds: [],
      diagnostics: state.diagnostics,
    };
  }
  return state;
}

export class Agent {
  private state: AgentState = {
    status: "idle",
    messages: [],
    streamingText: "",
    pendingToolCallIds: [],
    diagnostics: [],
  };
  private readonly subscribers = new Set<(event: AgentEvent) => void>();
  private readonly steering: UserMessage[] = [];
  private readonly followUps: UserMessage[] = [];
  private abortController?: AbortController;
  private nextRunId = 1;

  constructor(
    private readonly options: {
      model: Model;
      tools: ToolRegistry;
      toolExecutor?: ToolExecutor;
      systemPrompt?: string;
      maxSteps?: number;
    },
  ) {}

  getState(): AgentState {
    return structuredClone(this.state);
  }

  subscribe(listener: (event: AgentEvent) => void): () => void {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  private emit(event: AgentEvent): void {
    this.state = reduceAgentState(this.state, event);
    this.subscribers.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        this.state = {
          ...this.state,
          diagnostics: [
            ...this.state.diagnostics,
            `subscriber: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ],
        };
      }
    });
  }

  steer(value: string): void {
    if (this.state.status !== "running") {
      throw new Error("steering 只在当前 run 尚未结束时有意义");
    }
    this.steering.push(userMessage(value));
  }

  followUp(value: string): void {
    if (this.state.status !== "running") {
      throw new Error("follow-up 只在当前 run 尚未结束时排队");
    }
    this.followUps.push(userMessage(value));
  }

  abort(): void {
    this.abortController?.abort();
  }

  async prompt(value: string): Promise<AgentRunResult> {
    if (this.state.status === "running") {
      throw new Error("Agent is busy");
    }

    const runId = this.nextRunId++;
    const message = userMessage(value);
    this.abortController = new AbortController();
    this.emit({ type: "run_start", runId, message });

    try {
      const result = await runAgentLoop({
        model: this.options.model,
        tools: this.options.tools,
        context: {
          systemPrompt: this.options.systemPrompt,
          messages: this.state.messages,
        },
        signal: this.abortController.signal,
        maxSteps: this.options.maxSteps,
        executeToolCall: this.options.toolExecutor,
        takeSteeringMessages: () => this.steering.splice(0),
        takeFollowUpMessages: () => this.followUps.splice(0),
        onEvent: (event) => this.emit({ type: "loop", runId, event }),
      });
      this.emit({ type: "run_end", runId, result });
      return result;
    } catch (error) {
      const failed = assistantMessage([], "error", {
        errorMessage:
          error instanceof Error ? error.message : String(error),
      });
      const result: AgentRunResult = {
        reason: "error",
        messages: [...this.state.messages, failed],
        steps: 0,
      };
      this.emit({ type: "run_end", runId, result });
      return result;
    } finally {
      this.abortController = undefined;
      this.steering.splice(0);
      this.followUps.splice(0);
    }
  }
}
