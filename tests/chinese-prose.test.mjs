import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const chapterRoot = path.resolve(
  import.meta.dirname,
  "..",
  "content",
  "chapters",
);

async function chapters() {
  const files = (await readdir(chapterRoot))
    .filter((file) => /^\d{2}-.*\.md$/.test(file))
    .sort();
  return Promise.all(
    files.map(async (file) => ({
      file,
      source: await readFile(path.join(chapterRoot, file), "utf8"),
    })),
  );
}

test("正文不使用明显的套话和营销黑话", async () => {
  const forbidden = [
    /在当今[^。]*时代/,
    /随着[^。]*发展/,
    /众所周知/,
    /值得注意的是/,
    /需要指出的是/,
    /不可否认/,
    /让我们来看看/,
    /接下来我们将/,
    /本文将从/,
    /(?:深度)?赋能/,
    /助力/,
    /底层逻辑/,
    /抓手/,
    /颗粒度/,
    /总而言之/,
    /综上所述/,
    /让我们一起期待/,
  ];
  const failures = [];

  for (const chapter of await chapters()) {
    for (const pattern of forbidden) {
      if (pattern.test(chapter.source)) {
        failures.push(`${chapter.file}: ${pattern}`);
      }
    }
  }

  assert.deepEqual(failures, []);
});

test("同一章不过度依赖“不是 A，而是 B”反转句", async () => {
  const failures = [];
  for (const chapter of await chapters()) {
    const count = [
      ...chapter.source.matchAll(/不是[^。\n]{0,100}(?:而是|只是)/g),
    ].length;
    if (count > 2) failures.push(`${chapter.file}: ${count}`);
  }

  assert.deepEqual(failures, []);
});
