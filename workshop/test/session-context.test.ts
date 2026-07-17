import assert from "node:assert/strict";
import test from "node:test";
import {
  buildContext,
  compact,
  safeTail,
} from "../src/context.js";
import {
  InMemorySessionStore,
  pathTo,
  recoverJsonl,
  type SessionEntry,
} from "../src/session.js";
import {
  assistantMessage,
  text,
  userMessage,
  type AgentMessage,
} from "../src/types.js";

function entry(
  id: string,
  parentId: string | null,
  message: AgentMessage,
): SessionEntry {
  return {
    id,
    parentId,
    timestamp: Number(id.replace(/\D/g, "")) || 1,
    type: "message",
    message,
  };
}

test("parent pointer 形成分支，重复 id、缺 parent、环都可诊断", () => {
  const entries = [
    entry("e1", null, userMessage("root")),
    entry("e2", "e1", assistantMessage([text("left")])),
    entry("e3", "e1", assistantMessage([text("right")])),
  ];
  assert.deepEqual(pathTo(entries, "e2").map((item) => item.id), [
    "e1",
    "e2",
  ]);
  assert.throws(() => pathTo([...entries, entries[0]], "e2"), /重复/);
  assert.throws(
    () => pathTo([entry("x", "missing", userMessage("x"))], "x"),
    /parent 缺失/,
  );
  assert.throws(
    () =>
      pathTo(
        [
          entry("a", "b", userMessage("a")),
          entry("b", "a", userMessage("b")),
        ],
        "a",
      ),
    /形成环/,
  );
});
test("JSONL 只容忍最后一行截断，不掩盖中段损坏", () => {
  const valid = JSON.stringify(entry("e1", null, userMessage("root")));
  const recovered = recoverJsonl(`${valid}\n{"id":`);
  assert.equal(recovered.entries.length, 1);
  assert.equal(recovered.warnings.length, 1);
  assert.throws(() => recoverJsonl(`${valid}\nBAD\n${valid}\n`), /中段/);
});

test("safe cut point 不拆散 assistant toolCall 与 toolResult", () => {
  const messages: AgentMessage[] = [
    userMessage("old"),
    assistantMessage(
      [
        {
          type: "toolCall",
          id: "call-1",
          name: "read",
          arguments: { path: "a" },
        },
      ],
      "toolUse",
    ),
    {
      role: "toolResult",
      toolCallId: "call-1",
      toolName: "read",
      content: [text("A")],
      isError: false,
      timestamp: 2,
    },
  ];
  const selected = safeTail(messages, 1, () => 1);
  assert.deepEqual(selected.map((message) => message.role), [
    "assistant",
    "toolResult",
  ]);
});

test("compaction 追加 summary，历史仍完整，context 只做投影", async () => {
  const store = new InMemorySessionStore();
  const entries = [
    entry("e1", null, userMessage("goal")),
    entry("e2", "e1", assistantMessage([text("decision")])),
  ];
  for (const item of entries) await store.append(item);
  const compacted = await compact({
    store,
    leafId: "e2",
    id: "c1",
    summarizer: {
      async summarize() {
        return {
          goal: "build pi",
          decisions: ["append-only"],
          files: ["src/session.ts"],
          nextSteps: ["resume"],
          invariants: ["history is truth"],
        };
      },
    },
  });

  const after = await store.entries();
  assert.equal(after.length, 3);
  assert.equal(after[0].id, "e1");
  const projection = buildContext(after, compacted.id, {
    tokenBudget: 100,
    systemPrompt: "system",
  });
  assert.match(projection.context.systemPrompt ?? "", /Earlier session summary/);
});
