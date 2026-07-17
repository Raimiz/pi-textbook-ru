export type DemoEvent =
  | { type: "started"; requestId: string }
  | { type: "delta"; requestId: string; text: string }
  | {
      type: "finished";
      requestId: string;
      reason: "stop" | "length";
    }
  | { type: "aborted"; requestId: string };

/**
 * `never` 让新增事件但遗漏分支成为编译错误，而不是运行时沉默。
 */
export function formatEvent(event: DemoEvent): string {
  switch (event.type) {
    case "started":
      return `start ${event.requestId}`;
    case "delta":
      return `delta ${event.requestId} ${event.text}`;
    case "finished":
      return `finish ${event.requestId} ${event.reason}`;
    case "aborted":
      return `abort ${event.requestId}`;
    default: {
      const unreachable: never = event;
      return unreachable;
    }
  }
}

/**
 * 边界接受 unknown；只有通过最小运行时验证后才返回强类型事件。
 */
export function readDelta(value: unknown): DemoEvent {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "type" in value &&
    value.type === "delta" &&
    "requestId" in value &&
    typeof value.requestId === "string" &&
    "text" in value &&
    typeof value.text === "string"
  ) {
    return {
      type: "delta",
      requestId: value.requestId,
      text: value.text,
    };
  }
  throw new Error("invalid delta event");
}
