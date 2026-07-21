import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const courseRepository = process.env.PI_COURSE_ROOT
  ? path.resolve(process.env.PI_COURSE_ROOT)
  : path.resolve(root, "..", "pi-course");
const generated = await import(
  new URL(`../lib/generated-course.ts?verify=${Date.now()}`, import.meta.url)
);

function git(...args) {
  return execFileSync("git", ["-C", courseRepository, ...args], {
    encoding: "utf8",
  }).trim();
}

for (const chapter of generated.chapters) {
  const subject = git("show", "-s", "--format=%s", chapter.commit);
  const parent = git("show", "-s", "--format=%P", chapter.commit)
    .split(" ")[0];
  if (parent !== chapter.parentCommit) {
    throw new Error(
      `Checkpoint ${chapter.id} parent 漂移：${parent} != ${chapter.parentCommit}`,
    );
  }
  if (subject !== `course(${chapter.id}): ${chapter.commitSubject}`) {
    throw new Error(
      `Checkpoint ${chapter.id} subject 漂移：${subject}`,
    );
  }
  git("cat-file", "-e", `${chapter.commit}:${chapter.checkpointTest}`);
}

process.stdout.write(
  `已验证 ${generated.chapters.length} 个真实 checkpoint commit、parent 与聚焦测试。\n`,
);
