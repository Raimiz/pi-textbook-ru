import assert from "node:assert/strict";
import test from "node:test";
import {
  assertValidPrologueTrace,
  formatPrologueTrace,
  runPrologueDemo,
} from "../src/demo/prologue.js";
import {
  formatEvent,
  readDelta,
  type DemoEvent,
} from "../src/survival/events.js";
import { assistantMessage, text, textOf } from "../src/types.js";

test("序章离线运行投影为七个稳定里程碑", async () => {
  const trace = await runPrologueDemo();

  assert.deepEqual(
    trace.map((event) => event.type),
    [
      "user_message",
      "model_start",
      "assistant_message",
      "tool_start",
      "tool_result",
      "model_start",
      "assistant_message",
    ],
  );
  assert.deepEqual(
    trace.map((event) => event.owner),
    ["user", "model", "model", "loop", "tool", "model", "model"],
  );
  assert.deepEqual(
    trace
      .filter((event) => event.environmentAction)
      .map((event) => event.environmentAction),
    ["read"],
  );
  assert.equal(trace[2].toolCallId, "call_1");
  assert.equal(trace[4].toolCallId, "call_1");

  const formatted = formatPrologueTrace(trace);
  assert.match(formatted, /^01 user_message/m);
  assert.match(formatted, /05 tool_result\s+owner=tool/);
  assert.match(formatted, /07 assistant_message\s+owner=model/);
});

test("序章验收先暴露断裂的 call/result 因果关系", async () => {
  const trace = await runPrologueDemo();
  const withoutResult = trace
    .filter((event) => event.type !== "tool_result")
    .map((event, index) => ({ ...event, step: index + 1 }));
  assert.throws(
    () => assertValidPrologueTrace(withoutResult),
    /缺少配对结果/,
  );

  const result = trace.find(
    (event) => event.type === "tool_result",
  );
  assert.ok(result);
  const resultFirst = [
    result,
    ...trace.filter((event) => event !== result),
  ].map((event, index) => ({ ...event, step: index + 1 }));
  assert.throws(
    () => assertValidPrologueTrace(resultFirst),
    /先于对应的 tool call/,
  );
});

test("tagged union 的完成态覆盖全部事件分支", () => {
  const events: DemoEvent[] = [
    { type: "started", requestId: "r1" },
    { type: "delta", requestId: "r1", text: "Pi" },
    {
      type: "finished",
      requestId: "r1",
      reason: "stop",
    },
    { type: "aborted", requestId: "r2" },
  ];

  assert.deepEqual(events.map(formatEvent), [
    "start r1",
    "delta r1 Pi",
    "finish r1 stop",
    "abort r2",
  ]);
});

test("unknown 只在通过边界验证后成为 DemoEvent", () => {
  assert.deepEqual(
    readDelta({
      type: "delta",
      requestId: "r1",
      text: "Pi",
    }),
    {
      type: "delta",
      requestId: "r1",
      text: "Pi",
    },
  );
  assert.throws(
    () =>
      readDelta({
        type: "delta",
        requestId: "r1",
        text: 42,
      }),
    /invalid delta event/,
  );
  assert.throws(() => readDelta(null), /invalid delta event/);
});

test("textOf 保持文本顺序，但不吞掉或修改 tool call", () => {
  const message = assistantMessage([
    text("先读取"),
    {
      type: "toolCall",
      id: "call-1",
      name: "read",
      arguments: { path: "README.md" },
    },
    text("再解释"),
  ]);
  const before = structuredClone(message.content);

  assert.equal(textOf(message), "先读取\n再解释");
  assert.deepEqual(message.content, before);
  assert.equal(message.content[1]?.type, "toolCall");
});
