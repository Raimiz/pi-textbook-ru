import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { Agent } from "../src/agent.js";
import { createCodingTools } from "../src/coding-tools.js";
import { ScriptedModel } from "../src/scripted-model.js";
import { executeToolCall } from "../src/tool.js";
import {
  assistantMessage,
  type ToolCall,
} from "../src/types.js";

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

test("coding tools 支持续读、批量 edit 和 symlink escape 诊断", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "pi-workshop-"));
  const outside = await mkdtemp(path.join(os.tmpdir(), "pi-outside-"));
  await writeFile(path.join(root, "notes.txt"), "one\ntwo\nthree\nfour", "utf8");
  await writeFile(path.join(outside, "secret.txt"), "secret", "utf8");
  await symlink(outside, path.join(root, "escape"));

  const tools = createCodingTools({
    cwd: root,
    containment: "workspace",
    maxReadLines: 2,
  });
  const read = await executeToolCall(
    call("read-1", "read", { path: "notes.txt", offset: 3, limit: 2 }),
    tools,
  );
  assert.equal(read.isError, false);
  assert.match(read.content[0].text, /3│ three/);
  assert.match(read.content[0].text, /4│ four/);

  const edit = await executeToolCall(
    call("edit-1", "edit", {
      path: "notes.txt",
      edits: [
        { oldText: "one", newText: "ONE" },
        { oldText: "three", newText: "THREE" },
      ],
    }),
    tools,
  );
  assert.equal(edit.isError, false);
  assert.equal(
    await readFile(path.join(root, "notes.txt"), "utf8"),
    "ONE\ntwo\nTHREE\nfour",
  );

  const escaped = await executeToolCall(
    call("read-2", "read", { path: "escape/secret.txt" }),
    tools,
  );
  assert.equal(escaped.isError, true);
  assert.match(escaped.content[0].text, /符号链接/);
});

test("subscriber 抛错不会破坏 Agent cleanup", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "pi-agent-"));
  await mkdir(root, { recursive: true });
  const agent = new Agent({
    model: new ScriptedModel([
      assistantMessage([{ type: "text", text: "ok" }]),
    ]),
    tools: createCodingTools({
      cwd: root,
      containment: "workspace",
    }),
  });
  agent.subscribe(() => {
    throw new Error("broken renderer");
  });
  const result = await agent.prompt("hello");

  assert.equal(result.reason, "stop");
  assert.equal(agent.getState().status, "idle");
  assert.match(agent.getState().diagnostics[0], /broken renderer/);
});
