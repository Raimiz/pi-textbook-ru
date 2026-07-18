import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const courseRoot = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "pi-course-history",
);

function createPractice(chapter, output) {
  return spawnSync(
    "npm",
    [
      "run",
      "practice",
      "-w",
      "@pi/course",
      "--",
      chapter,
      output,
    ],
    {
      cwd: courseRoot,
      encoding: "utf8",
    },
  );
}

test("practice helper creates an answer-free chapter sandbox", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "pi-practice-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const chapter00 = path.join(root, "chapter-00");
  const observed = createPractice("00", chapter00);
  assert.equal(observed.status, 0, observed.stderr);
  assert.equal(
    existsSync(
      path.join(
        chapter00,
        "packages/pi-course/src/demo/prologue.ts",
      ),
    ),
    true,
  );
  assert.equal(
    existsSync(
      path.join(
        chapter00,
        "packages/pi-course/test/01-typescript-survival.test.ts",
      ),
    ),
    false,
  );
  const chapter00Guide = await readFile(
    path.join(chapter00, "LEARNING.md"),
    "utf8",
  );
  assert.match(chapter00Guide, /模式：观察/);
  assert.match(
    chapter00Guide,
    /没有额外 Git 历史或另一份答案可供偷看/,
  );
  assert.doesNotMatch(chapter00Guide, /没有 target 实现可供偷看/);
  const chapter00RootPackage = JSON.parse(
    await readFile(path.join(chapter00, "package.json"), "utf8"),
  );
  assert.equal(
    chapter00RootPackage.scripts?.prepare,
    undefined,
    "isolated sandboxes must not run a Git-only Husky prepare hook",
  );

  const chapter01 = path.join(root, "chapter-01");
  const reconstructed = createPractice("01", chapter01);
  assert.equal(reconstructed.status, 0, reconstructed.stderr);
  assert.equal(
    existsSync(
      path.join(
        chapter01,
        "packages/pi-course/src/survival/events.ts",
      ),
    ),
    false,
  );
  assert.equal(
    existsSync(
      path.join(
        chapter01,
        "packages/pi-course/test/01-typescript-survival.test.ts",
      ),
    ),
    true,
  );
  const chapter01Guide = await readFile(
    path.join(chapter01, "LEARNING.md"),
    "utf8",
  );
  assert.match(chapter01Guide, /模式：重建/);
  assert.match(chapter01Guide, /当前源码来自 parent/);
  assert.match(
    await readFile(
      path.join(chapter01, "packages/pi-course/AGENT_GUIDE.md"),
      "utf8",
    ),
    /Checkpoint 01/,
    "a parent sandbox must still receive the current chapter coaching guide",
  );

  const duplicate = createPractice("01", chapter01);
  assert.notEqual(duplicate.status, 0);
  assert.match(duplicate.stderr, /已存在/);

  const chapter02 = path.join(root, "chapter-02");
  const eventStream = createPractice("02", chapter02);
  assert.equal(eventStream.status, 0, eventStream.stderr);
  const chapter02Test = await readFile(
    path.join(
      chapter02,
      "packages/pi-course/test/02-event-stream.test.ts",
    ),
    "utf8",
  );
  assert.match(
    chapter02Test,
    /events\.end\("A"\);[\s\S]*await events\.result\(\)[\s\S]*"A"/,
    "end(result) must be observed through result(), not only iterator.done",
  );
  assert.equal(
    [...chapter02Test.matchAll(/\(event: Event\) =>/g)].length,
    2,
    "callback types must keep the expected first red focused on the missing module",
  );

  const chapter03 = path.join(root, "chapter-03");
  const messageIr = createPractice("03", chapter03);
  assert.equal(messageIr.status, 0, messageIr.stderr);
  const chapter03Test = await readFile(
    path.join(
      chapter03,
      "packages/pi-course/test/03-message-ir.test.ts",
    ),
    "utf8",
  );
  assert.match(
    chapter03Test,
    /const result = await stream\.result\(\);[\s\S]*assert\.strictEqual\(\s*result,\s*error\s*\)/,
    "the error terminal test must prove that result() resolves the final message",
  );
  assert.doesNotMatch(
    chapter03Test,
    /stream\.end\(error\)/,
    "the test must not complete the stream on behalf of a broken terminal detector",
  );
  assert.match(
    chapter03Test,
    /\{\s*timeout:\s*1_000\s*\}/,
    "the terminal regression must fail promptly instead of hanging",
  );

  const chapter04 = path.join(root, "chapter-04");
  const scriptedModel = createPractice("04", chapter04);
  assert.equal(scriptedModel.status, 0, scriptedModel.stderr);
  const chapter04Test = await readFile(
    path.join(
      chapter04,
      "packages/pi-course/test/04-scripted-model.test.ts",
    ),
    "utf8",
  );
  assert.match(
    chapter04Test,
    /context\.messages\.push[\s\S]*model\.requests\[0\][\s\S]*messages/,
    "the recorded request must be tested as a call-time snapshot",
  );
  assert.match(
    chapter04Test,
    /partialText:\s*"正在"[\s\S]*errorMessage:\s*"rate limited"/,
    "an explicit error turn must preserve partial output and its diagnostic",
  );
  assert.ok(
    [...chapter04Test.matchAll(/\{\s*timeout:\s*1_000\s*\}/g)].length >= 3,
    "all three streaming regressions must fail promptly",
  );
  assert.match(
    chapter04Test,
    /textDelta\.contentIndex,\s*0[\s\S]*textDelta\.delta,\s*"先看"[\s\S]*textDelta\.partial\.content/,
    "the success oracle must inspect event payloads, not only event type names",
  );
  assert.match(
    chapter04Test,
    /toolDelta\.contentIndex,\s*1[\s\S]*toolDelta\.delta[\s\S]*toolDelta\.partial\.content[\s\S]*toolEnd\.toolCall/,
    "tool deltas and completion must preserve their index, cumulative partial, and canonical call",
  );
  assert.match(
    chapter04Test,
    /secondStream[\s\S]*textOf\([\s\S]*"第二轮"/,
    "the scripted cursor must be observed across two successive turns",
  );

  const chapter05 = path.join(root, "chapter-05");
  const providerAdapter = createPractice("05", chapter05);
  assert.equal(providerAdapter.status, 0, providerAdapter.stderr);
  const chapter05Test = await readFile(
    path.join(
      chapter05,
      "packages/pi-course/test/05-provider-adapter.test.ts",
    ),
    "utf8",
  );
  const chapter05Starter = await readFile(
    path.join(
      chapter05,
      "packages/pi-course/src/provider-adapter.ts",
    ),
    "utf8",
  );
  const chapter05Guide = await readFile(
    path.join(chapter05, "LEARNING.md"),
    "utf8",
  );
  assert.match(chapter05Guide, /学习脚手架/);
  assert.match(chapter05Guide, /不属于 parent，也不是完整 target/);
  assert.match(chapter05Starter, /Lab 5\.1 toProviderMessages/);
  assert.match(chapter05Starter, /Lab 5\.2 createOpenAICompatibleModel/);
  assert.match(chapter05Starter, /Lab 5\.3 createOpenAICompatibleTransport/);
  assert.doesNotMatch(
    chapter05Starter,
    /readSSEData|toolBuffers|fetchImplementation/,
    "the scaffold must expose the public surface without leaking core implementation",
  );
  assert.ok(
    [...chapter05Test.matchAll(/\{\s*timeout:\s*1_000\s*\}/g)].length >= 10,
    "every asynchronous provider regression must fail promptly",
  );
  assert.match(
    chapter05Test,
    /assert\.deepEqual\(\s*messages,\s*\[/,
    "the outbound oracle must compare complete wire messages",
  );
  assert.match(
    chapter05Test,
    /call\?\.type === "toolCall" \? call\.arguments[\s\S]*rawArguments/,
    "length must keep incomplete arguments untrusted",
  );
  assert.match(
    chapter05Test,
    /doesNotMatch\([\s\S]*JSON\.stringify\(body\)[\s\S]*offline-test-key/,
    "the fetch body must be checked for API-key leakage",
  );
  assert.match(
    chapter05Test,
    /normalized transport[\s\S]*contentIndex/s,
    "normalized chunks need an adapter-only content-index oracle",
  );
  assert.match(chapter05Test, /toolcall_end/);
});
