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

test("重建章节的所有可执行动作只指向隔离教学目录", async () => {
  const all = await chapters();
  const failures = all
    .filter(({ id }) => id !== "00")
    .filter(({ source }) => /workshop\//.test(source))
    .map(({ id }) => `${id}: still sends the learner to workshop/`);

  assert.deepEqual(failures, []);
});

test("每个重建入口在第一步前给出最小概念并预告真实首红", async () => {
  const all = await chapters();
  const failures = [];

  for (const chapter of all.filter(({ id }) => id !== "00")) {
    const body = rebuildBlock(chapter.source);
    if (!body) continue;
    if (!/\*\*动手前只需知道：\*\*\s*\S+/.test(body)) {
      failures.push(`${chapter.id}: missing minimum schema before action`);
    }
    if (!/\*\*第一次红灯：\*\*\s*\S+/.test(body)) {
      failures.push(`${chapter.id}: missing first-red preview`);
    }
  }

  assert.deepEqual(failures, []);
});

test("第一章的重建入口预告真实首个红灯并先给最小概念", async () => {
  const chapter = (await chapters()).find(({ id }) => id === "01");
  assert.ok(chapter);
  const body = rebuildBlock(chapter.source);
  assert.ok(body);

  assert.match(body, /第一次红灯.*(?:Cannot find module|找不到.*events)/s);
  assert.match(body, /动手前.*tagged union.*`type`/s);
  assert.match(body, /动手前.*`unknown`.*验证/s);
  assert.match(body, /动手前.*`never`.*遗漏/s);
  assert.doesNotMatch(chapter.source, /tests 4\s*\npass 4/);
  assert.match(
    chapter.source,
    /2 项聚焦测试.*只证明.*格式化.*边界反例.*`never`.*编译失败/s,
  );
});

test("第二章只把 target 真正实现的事件流能力列为验收证据", async () => {
  const chapter = (await chapters()).find(({ id }) => id === "02");
  assert.ok(chapter);
  const body = rebuildBlock(chapter.source);
  assert.ok(body);

  assert.match(body, /第一次红灯.*(?:Cannot find module|找不到.*event-stream)/s);
  assert.match(body, /动手前.*queue.*waiter.*终态/s);
  assert.doesNotMatch(chapter.source, /运行 .*取消路径.*应通过/s);
  assert.match(
    chapter.source,
    /2 项聚焦测试.*queue.*waiter.*终态.*`result\(\)`/s,
  );
  assert.match(chapter.source, /本章不实现.*取消/s);
  assert.match(
    chapter.source,
    /先声明完整公共接口.*`end\(result\)`.*--test-name-pattern="先到的事件"/s,
  );
});

test("第三章披露两个真实源文件，并让两段实验都可独立运行", async () => {
  const chapter = (await chapters()).find(({ id }) => id === "03");
  assert.ok(chapter);
  const body = rebuildBlock(chapter.source);
  assert.ok(body);

  assert.match(
    body,
    /\*\*教学文件：\*\*[\s\S]*`packages\/pi-course\/src\/types\.ts`[\s\S]*`packages\/pi-course\/src\/event-stream\.ts`/,
  );
  assert.match(
    body,
    /第一次红灯.*AssistantMessageEventStream.*types\.js/s,
  );
  assert.match(
    chapter.source,
    /实践 3\.1.*临时.*AssistantMessageEventStream.*--test-name-pattern="文本投影"/s,
  );
  assert.match(
    chapter.source,
    /2 项聚焦测试.*文本投影.*不修改.*error.*`result\(\)`/s,
  );
  assert.doesNotMatch(chapter.source, /预期失败[^]*丢掉 toolCallId/);
});

test("第四章只重建 ScriptedModel，并用三个场景验证可执行规格", async () => {
  const chapter = (await chapters()).find(({ id }) => id === "04");
  assert.ok(chapter);
  const body = rebuildBlock(chapter.source);
  assert.ok(body);

  assert.match(
    body,
    /\*\*教学文件：\*\*\s*`packages\/pi-course\/src\/scripted-model\.ts`/,
  );
  assert.match(body, /第一次红灯.*(?:TS2307|找不到.*scripted-model)/s);
  assert.match(
    chapter.source,
    /实践 4\.1.*--test-name-pattern="脚本消息"/s,
  );
  assert.match(
    chapter.source,
    /3 项聚焦测试.*事件顺序.*请求快照.*错误回合.*脚本耗尽.*预取消/s,
  );
  assert.match(
    chapter.source,
    /本章没有测试.*中途取消.*多个并发.*实际时间间隔.*调度时机.*背压/s,
  );
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
