import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const historyRoot = path.resolve(root, "..", "pi-course");
const manifestFile = path.join(root, "content", "checkpoints.json");

test("checkpoint manifest is synchronized with the live course history", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/sync-checkpoint-history.mjs", "--check"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("checkpoint manifest describes all focused tests on one linear chain", async () => {
  const checkpoints = JSON.parse(await readFile(manifestFile, "utf8"));
  assert.equal(checkpoints.length, 15);
  assert.deepEqual(
    checkpoints.map(({ id }) => id),
    Array.from({ length: 15 }, (_, index) => String(index).padStart(2, "0")),
  );

  for (const [index, checkpoint] of checkpoints.entries()) {
    assert.match(checkpoint.commit, /^[0-9a-f]{40}$/);
    assert.match(checkpoint.parentCommit, /^[0-9a-f]{40}$/);
    assert.equal(
      index === 0
        ? checkpoint.parentCommit !== checkpoint.commit
        : checkpoint.parentCommit === checkpoints[index - 1].commit,
      true,
      `checkpoint ${checkpoint.id} must point to its actual predecessor`,
    );
    assert.match(
      checkpoint.focusedTest,
      new RegExp(
        `^packages/pi-course/test/${checkpoint.id}-.+\\.test\\.ts$`,
      ),
    );
    assert.ok(checkpoint.testTitles.length > 0);
    if (checkpoint.id === "14") {
      assert.deepEqual(checkpoint.sourceDelta, [
        "packages/pi-course/test-support/eval.ts",
        "packages/pi-course/tsconfig.json",
      ]);
    } else {
      assert.ok(
        checkpoint.sourceDelta.length > 0 &&
          checkpoint.sourceDelta.every((file) =>
            file.startsWith("packages/pi-course/src/")
          ),
      );
    }

    const testExists = spawnSync(
      "git",
      [
        "-C",
        historyRoot,
        "cat-file",
        "-e",
        `${checkpoint.commit}:${checkpoint.focusedTest}`,
      ],
      { encoding: "utf8" },
    );
    assert.equal(
      testExists.status,
      0,
      `checkpoint ${checkpoint.id} focused test must exist at its commit`,
    );
  }
});
