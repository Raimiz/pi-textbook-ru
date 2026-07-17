import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const chapterRoot = path.join(root, "content", "chapters");

async function chapters() {
  const files = (await readdir(chapterRoot))
    .filter((file) => /^\d{2}-.*\.md$/.test(file))
    .sort();
  return Promise.all(
    files.map(async (file) => ({
      file,
      id: file.slice(0, 2),
      source: await readFile(path.join(chapterRoot, file), "utf8"),
    })),
  );
}

function rebuildBlock(source) {
  const match = source.match(
    /:::rebuild\b[^\n]*\n(?<body>[\s\S]*?)\n:::/,
  );
  return match?.groups?.body ?? null;
}

test("每章把讲解桥接到真实 commit 的第一个可执行动作", async () => {
  const all = await chapters();
  assert.equal(all.length, 15);

  const failures = [];
  for (const chapter of all) {
    const body = rebuildBlock(chapter.source);
    if (!body) {
      failures.push(`${chapter.id}: missing rebuild directive`);
      continue;
    }

    const expectedMode = chapter.id === "00" ? "观察" : "重建";
    const required = [
      [`模式`, new RegExp(`\\*\\*模式：\\*\\*\\s*${expectedMode}`)],
      ["起终点", /\*\*起终点：\*\*\s*parent .*起点.*target .*终点/],
      ["教学文件", /\*\*教学文件：\*\*\s*`packages\/pi-course\/[^`]+`/],
      ["第一步", /\*\*第一步：\*\*\s*\S+/],
      [
        "聚焦测试",
        new RegExp(
          `\\*\\*聚焦测试：\\*\\*\\s*\`packages/pi-course/test/${chapter.id}-[^\\s\`]+\\.test\\.ts\``,
        ),
      ],
      [
        "定位命令",
        new RegExp(
          `\\*\\*定位命令：\\*\\*\\s*\`npm run checkpoint -w @pi/course -- ${chapter.id}\``,
        ),
      ],
      [
        "练习目录",
        new RegExp(
          `\\*\\*练习目录：\\*\\*\\s*\`npm run practice -w @pi/course -- ${chapter.id}\``,
        ),
      ],
      [
        "聚焦运行",
        new RegExp(
          `\\*\\*聚焦运行：\\*\\*\\s*\`npm run build -w @pi/course\`.*\`node --test packages/pi-course/dist/test/${chapter.id}-\\*\\.test\\.js\``,
        ),
      ],
      ["通过证据", /\*\*通过证据：\*\*\s*\S+/],
    ];

    for (const [label, pattern] of required) {
      if (!pattern.test(body)) failures.push(`${chapter.id}: missing ${label}`);
    }
  }

  assert.deepEqual(failures, []);
});

test("第一次学习明确禁止直接查看目标实现", async () => {
  const all = await chapters();
  const failures = all
    .filter(({ source }) => {
      const body = rebuildBlock(source);
      return !body || !/先不看 (?:target )?diff|禁止.*完整答案/.test(body);
    })
    .map(({ id }) => `${id}: answer-before-attempt guard missing`);

  assert.deepEqual(failures, []);
});

test("页面主 artifact 指向学生实际修改的教学历史", async () => {
  const all = await chapters();
  const failures = all
    .filter(({ source }) =>
      !/^artifact:\s*packages\/pi-course\/src\/\S+$/m.test(source)
    )
    .map(({ id }) => `${id}: artifact does not point to pi-course`);

  assert.deepEqual(failures, []);
});

test("序章的实验、所有权和离线语义与 checkpoint 00 一致", async () => {
  const prologue = (await chapters()).find(({ id }) => id === "00");
  assert.ok(prologue);

  assert.doesNotMatch(prologue.source, /复制测试中的乱序事件数组/);
  assert.match(prologue.source, /删除 `tool_result`.*重新编号/s);
  assert.match(
    prologue.source,
    /`owner` 表示.*事件记录.*不等于.*发起者/s,
  );
  assert.match(
    prologue.source,
    /固定 (?:fixture|结果).*不执行真实的文件读取/s,
  );
  assert.match(
    prologue.source,
    /`packages\/pi-course\/`.*引导重建.*`workshop\/`.*最终参考实现/s,
  );
  assert.match(
    prologue.source,
    /`model_start`.*`tool_start`.*运行轨迹事件.*不是.*`AgentMessage`/s,
  );
  assert.doesNotMatch(prologue.source, /被接受的 tool call/);
});
