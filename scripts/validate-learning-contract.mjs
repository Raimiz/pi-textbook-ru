import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chapterRoot = path.join(root, "content", "chapters");
const regressionsFile = path.join(
  root,
  "docs",
  "usability",
  "regressions.json",
);

function rebuildBlock(source) {
  return source.match(
    /:::rebuild\b[^\n]*\n(?<body>[\s\S]*?)\n:::/,
  )?.groups?.body;
}

export async function validateLearningContract() {
  const issues = [];
  const files = (await readdir(chapterRoot))
    .filter((file) => /^\d{2}-.*\.md$/.test(file))
    .sort();

  if (files.length !== 15) {
    issues.push({
      code: "LC_CHAPTER_COUNT",
      message: `expected 15 chapters, found ${files.length}`,
    });
  }

  for (const file of files) {
    const id = file.slice(0, 2);
    const source = await readFile(path.join(chapterRoot, file), "utf8");
    const body = rebuildBlock(source);
    const artifactPattern = id === "14"
      ? /^artifact:\s*packages\/pi-course\/test-support\/eval\.ts$/m
      : /^artifact:\s*packages\/pi-course\/src\/\S+$/m;
    if (!artifactPattern.test(source)) {
      issues.push({
        code: "LC_ARTIFACT_PATH",
        chapter: id,
        message: id === "14"
          ? "14 artifact must point to packages/pi-course/test-support/eval.ts"
          : `${id} artifact must point to packages/pi-course/src`,
      });
    }
    if (!body) {
      issues.push({
        code: "LC_REBUILD_MISSING",
        chapter: id,
        message: `${id} has no rebuild directive`,
      });
      continue;
    }

    const expectedMode = id === "00" ? "观察" : "重建";
    const fields = [
      ["LC_MODE", new RegExp(`\\*\\*模式：\\*\\*\\s*${expectedMode}`)],
      [
        "LC_START_TARGET",
        /\*\*起终点：\*\*\s*`?parent`?[^\n]*起点[\s\S]*?`?target`?[\s\S]*?终点/,
      ],
      [
        "LC_TEACHING_FILE",
        /\*\*教学文件：\*\*\s*(?:-\s*)?`packages\/pi-course\/[^`]+`/,
      ],
      ["LC_FIRST_ACTION", /\*\*第一步：\*\*\s*\S+/],
      [
        "LC_FOCUSED_TEST",
        new RegExp(
          `\\*\\*聚焦测试：\\*\\*\\s*\`packages/pi-course/test/${id}-[^\\s\`]+\\.test\\.ts\``,
        ),
      ],
      [
        "LC_LOCATE_COMMAND",
        new RegExp(
          `\\*\\*定位命令：\\*\\*\\s*\`npm run checkpoint -w @pi/course -- ${id}\``,
        ),
      ],
      [
        "LC_PRACTICE_COMMAND",
        new RegExp(
          `\\*\\*练习目录：\\*\\*\\s*\`npm run practice -w @pi/course -- ${id}\``,
        ),
      ],
      [
        "LC_FOCUSED_RUN",
        new RegExp(
          `\\*\\*聚焦运行：\\*\\*\\s*\`npm run build -w @pi/course\`[\\s\\S]*\`node --test packages/pi-course/dist/test/${id}-\\*\\.test\\.js\``,
        ),
      ],
      ["LC_PASS_EVIDENCE", /\*\*通过证据：\*\*\s*\S+/],
      [
        "LC_ANSWER_GUARD",
        /先不看 (?:target )?diff|禁止.*完整答案/,
      ],
    ];

    for (const [code, pattern] of fields) {
      if (!pattern.test(body)) {
        issues.push({
          code,
          chapter: id,
          message: `${id} rebuild directive violates ${code}`,
        });
      }
    }
  }

  const regressionDocument = JSON.parse(
    await readFile(regressionsFile, "utf8"),
  );
  if (regressionDocument.schemaVersion !== 1) {
    issues.push({
      code: "LC_REGRESSION_SCHEMA",
      message: "regressions.json must use schemaVersion 1",
    });
  }

  const ids = new Set();
  for (const regression of regressionDocument.regressions ?? []) {
    if (ids.has(regression.id)) {
      issues.push({
        code: "LC_REGRESSION_DUPLICATE",
        message: `duplicate regression ${regression.id}`,
      });
    }
    ids.add(regression.id);

    if (!/^\d{2}$/.test(regression.chapter ?? "")) {
      issues.push({
        code: "LC_REGRESSION_CHAPTER",
        message: `${regression.id} has invalid chapter`,
      });
    }
    if (regression.status === "resolved" && regression.retest?.result !== "pass") {
      issues.push({
        code: "LC_RESOLUTION_WITHOUT_RETEST",
        chapter: regression.chapter,
        message: `${regression.id} is resolved without a passing retest`,
      });
    }
    if (regression.status !== "resolved") {
      issues.push({
        code: "LC_REGRESSION_OPEN",
        chapter: regression.chapter,
        message: `${regression.id} still requires a passing retest`,
      });
    }
  }

  return issues;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const issues = await validateLearningContract();
  if (issues.length > 0) {
    for (const issue of issues) {
      process.stderr.write(
        `[${issue.code}]${issue.chapter ? ` chapter ${issue.chapter}` : ""} ${issue.message}\n`,
      );
    }
    process.exitCode = 1;
  } else {
    process.stdout.write("学习契约通过：15 章均有可执行重建入口。\n");
  }
}
