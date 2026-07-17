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

  const duplicate = createPractice("01", chapter01);
  assert.notEqual(duplicate.status, 0);
  assert.match(duplicate.stderr, /已存在/);
});
