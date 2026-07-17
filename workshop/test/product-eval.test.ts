import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createRuntime, runPrintMode } from "../src/composition.js";
import { runEvalSuite } from "../src/eval.js";
import {
  createExtensionHost,
  loadResources,
} from "../src/resources.js";
import { ScriptedModel } from "../src/scripted-model.js";
import { ToolRegistry } from "../src/tool.js";
import { assistantMessage } from "../src/types.js";

test("resource loader 读取 skill 数据，extension host 才执行注册", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "pi-resources-"));
  await mkdir(path.join(root, "templates"), { recursive: true });
  await mkdir(path.join(root, "skills", "review"), { recursive: true });
  await writeFile(
    path.join(root, "templates", "concise.md"),
    "---\nname: concise\ndescription: short\n---\nBe concise.",
  );
  await writeFile(
    path.join(root, "skills", "review", "SKILL.md"),
    "---\nname: review\ndescription: inspect\n---\nRead the diff.",
  );
  const catalog = await loadResources(root);
  assert.equal(catalog.templates[0].content, "Be concise.");
  assert.equal(catalog.skills[0].name, "review");

  const registry = new ToolRegistry();
  const host = createExtensionHost(registry);
  host.context.registerTool({
    name: "extra",
    description: "extension tool",
    schema: { parse: () => ({}) },
    async execute() {
      return { content: [{ type: "text", text: "ok" }] };
    },
  });
  assert.equal(registry.get("extra")?.name, "extra");
});
test("print mode、session persistence 与 eval 共用同一个 Agent 核心", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "pi-runtime-"));
  const runtime = await createRuntime({
    cwd: root,
    model: new ScriptedModel([
      assistantMessage([{ type: "text", text: "ready" }]),
    ]),
  });
  assert.equal(await runPrintMode(runtime, "hello"), "ready");
  assert.ok((await runtime.session.entries()).length >= 2);

  const results = await runEvalSuite([
    {
      name: "deterministic stop",
      prompt: "go",
      model: new ScriptedModel([
        assistantMessage([{ type: "text", text: "done" }]),
      ]),
      assert(result) {
        assert.equal(result.reason, "stop");
      },
    },
  ]);
  assert.equal(results[0].passed, true);
});
