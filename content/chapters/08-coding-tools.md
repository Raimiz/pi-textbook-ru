---
id: "08"
slug: coding-tools
part: core
partTitle: 第二部 · 闭合 Agent 核心
chapter: "08"
title: Read、Write、Edit 与 Bash
summary: 让 Agent 获得可截断、可取消、可诊断的文件和进程能力，同时说清真正的安全边界。
minutes: 135
difficulty: 核心
artifact: packages/pi-course/src/coding-tools.ts
prerequisites: 06,07
terms: execution environment, exact edit, mutation queue, output truncation, containment
upstream: packages/coding-agent/src/core/tools/read.ts, packages/coding-agent/src/core/tools/write.ts, packages/coding-agent/src/core/tools/edit.ts, packages/coding-agent/src/core/tools/bash.ts
---

## 你将得到什么

进入本章时，Agent Loop 已能可靠执行抽象工具，但 `add` 不会改变真实世界。现在要把相同 contract 接到文件系统和子进程；风险也随之改变：一次错误调用可能覆盖文件、启动无限进程，或把超长输出塞满 context。

本章只增加一种复杂性：**受资源约束的环境副作用**。完成后，`workshop/src/coding-tools.ts` 会导出 `createCodingTools({cwd, containment})`，提供 read、write、edit、bash；所有实验都在临时 workspace 中，能观察截断范围、编辑数量与字节变化、退出状态、timeout 与 abort。

不变量是：**失败动作不得留下“看似成功”的半完成状态**。尤其 edit 必须先验证全部替换，再一次写回；同一文件的 mutation 必须串行。

恢复本章起点时，删除临时 fixture，撤销 `workshop/src/coding-tools.ts` 与本章测试即可；不要回退 tool contract 或 loop。先用 `git diff -- workshop/` 保存本章 patch，绝不拿 `pi/`、`practice/` 或教材仓库自身做破坏性练习。

:::rebuild title="Checkpoint 08 · 先让 read 成为有界观察"
**模式：** 重建。从 07 的 target 开始，把工具契约接到临时文件系统和子进程。

**起终点：** parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。

**教学文件：** `packages/pi-course/src/coding-tools.ts`

**第一步：** 先不看 target diff，只实现 `createCodingTools` 中的 read：规范化 cwd 内路径、返回行号与截断信息；read 通过后再做原子 write、批量 edit 和受限 bash。

**聚焦测试：** `packages/pi-course/test/08-coding-tools.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 08`

**练习目录：** `npm run practice -w @pi/course -- 08`

**聚焦运行：** `npm run build -w @pi/course`，然后 `node --test packages/pi-course/dist/test/08-*.test.js`

**通过证据：** 续读、edit 回滚、symlink 逃逸、timeout、abort 与输出上限测试通过；失败不留下半完成 mutation。

第一次尝试禁止查看完整答案；所有破坏实验只在测试创建的临时目录，禁止拿真实项目当 fixture。
:::

## 先建立全景

四个工具不是四段随手的 Node API 包装，而是两类资源协议：

```text
文件协议
  read  → 有界观察：范围、行号、是否截断
  write → 显式创建/整体覆盖：父目录、字节数、同文件串行
  edit  → 先验证后提交：唯一匹配、内存批处理、一次写回、change details

进程协议
  bash  → cwd、stdout/stderr、exit、timeout、abort、输出上限、进程回收
```

`cwd` 提供相对路径基准，却不天然等于安全边界。课程版额外开启 workspace containment，目的是保护学习者本机；它只是路径层主动强化，不是容器或 VM，也不能安全运行任意恶意代码。

:::predict title="路径看起来没有 .. 就安全吗"
有人拒绝字符串中含 `..` 的路径，却允许绝对路径和 workspace 内指向外部的符号链接。这能保证文件不越界吗？Prompt 中写“不要访问外部”能补上吗？
---answer
不能。路径必须规范化后检查归属，已存在路径还要考虑 realpath；新文件要检查可解析的父目录。Prompt 只是行为建议，不是能力边界。即便课程 containment 做对了路径检查，bash 仍可能访问网络或继承环境变量，所以它仍不是强沙箱。
:::

## 先让文件动作可证明

测试必须创建可清理的临时目录，再把该目录作为唯一 cwd：

```ts
const tools = createCodingTools({
  cwd: workspace.path,
  containment: "workspace", // 课程主动强化；不是当前上游 Pi 的默认行为
});
```

Read 同时受行数和字节数限制。结果必须告诉模型“看到的只是窗口”，否则模型会把局部当全部：

```text
1│ export const a = 1;
2│ export const b = 2;

[Showing lines 1-2 of 8. Continue with offset=3.]
details: { startLine: 1, endLine: 2, lines: 8, truncated: true }
```

Write 的语义要简单而显式：自动创建父目录，文件存在时整体覆盖，不提供含糊的“智能保存”。返回路径、写入字节数即可，不要把全部内容再复制进 model context。

Edit 使用 exact old text → new text。零次匹配表示观察过期，多次匹配表示定位不足；都必须失败且保持磁盘文件逐字节不变。课程批量接口按数组顺序在内存副本上应用，每个后续 edit 看见此前的内存变化；只有整批都成功，才写回一次：

```ts
let next = original;
for (const edit of edits) {
  const at = next.indexOf(edit.oldText);
  if (at < 0 || next.indexOf(edit.oldText, at + edit.oldText.length) >= 0) {
    throw new Error("oldText 必须唯一匹配");
  }
  next = next.slice(0, at) + edit.newText
    + next.slice(at + edit.oldText.length);
}
await atomicWrite(file, next);
```

同一文件上的 write/edit 共享 mutation queue；不同文件仍可并发。取消也不能提前释放锁，让仍在飞行的旧 write 稍后覆盖新操作。

“一次写回”不等于数据库事务。课程可以先写临时文件再 rename，减少读者看到半截内容的窗口，但断电持久性、权限继承、跨文件原子性仍取决于操作系统。这里真正能证明的是：参数校验失败时零写入；进入提交阶段后，同一路径没有另一个课程 mutation 与它交错。把保证说到恰当强度，比笼统声称“原子编辑”更可靠。

验收应围绕这些可观测保证，而不是抽象口号。

:::lab title="实践 8.1 · 构造可恢复的文件工具"
**目标：** 实现 read、write、edit，并证明所有失败都不会误伤 workspace。

**文件：** `workshop/src/coding-tools.ts`、`workshop/test/coding-agent.test.ts`

**动作：**
1. 每个测试创建并 finally 清理 temp workspace。
2. Read 覆盖窗口、行/字节截断、缺失文件与目录输入。
3. Write 覆盖新建、整体覆盖、父目录创建和同文件并发。
4. Edit 覆盖 0/1/2 次匹配、顺序内存批处理与任一处失败时零磁盘写入。
5. containment 模式拒绝绝对外部路径、`../` 和符号链接逃逸。

**运行：** `npm run workshop:test -- coding-tools`

**预期：** 所有错误都经第 06 章执行器成为 `isError` result；失败 edit 前后的文件 hash 相同。
:::

## Bash 是生命周期，不是一个字符串

Bash 的完成条件不是“spawn 返回了”。它必须同时治理：两个输出流、非零退出、启动失败、timeout、用户 abort、子进程回收和内存上限。稳定结果描述语义，不依赖真实耗时：

```json
{
  "content":[{"type":"text","text":"tests: 3 passed"}],
  "details":{"command":"npm test","exitCode":0,
             "timedOut":false,"truncated":false},
  "isError":false
}
```

非零退出是一次已结束的进程结果，但对 Agent 动作而言通常标为错误 observation；timeout 和 abort 要终止进程树并等待回收。stdout/stderr 都要持续消费，避免其中一个管道填满造成死锁。超长输出只保留有诊断价值的窗口，同时明确原始规模与截断事实。

:::lab title="实践 8.2 · 给 Bash 加上终点"
**目标：** 让成功、非零退出、无限等待和无限输出都在有限资源内结算。

**文件：** `workshop/src/coding-tools.ts`、`workshop/test/coding-agent.test.ts`

**动作：**
1. 用 `spawn` 同时消费 stdout/stderr，不把模型参数拼进测试 shell 源码。
2. 将同一个 ToolContext signal 传到进程执行层。
3. 实现 timeout 与幂等 settle，竞争发生时只产生一个终态。
4. 限制保留输出并在 details 中记录 truncated。

**运行：** `npm run workshop:test -- coding-tools`

**预期：** 成功为 exit 0；非零、timeout、abort 均为结构化错误 result；无限输出测试不线性增长内存，结束后没有残留测试子进程。
:::

:::mechanism title="Containment 的准确边界"
课程 containment 是主动强化：把文件工具限制在指定 workspace，并让 bash 固定从该 cwd 启动。它不隔离网络、系统调用、用户权限或继承的密钥。要运行不可信代码，仍需容器、VM 或专用沙箱；不要在文档里把路径 jail 称为“安全沙箱”。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的上游工具更成熟：read 同时按行和字节截断；write 自动建目录；edit 让多处替换针对原始内容定位并拒绝重叠，课程则按内存副本顺序应用；同文件 mutation 串行、不同文件可并行；bash 管理超时、取消、输出截断和完整输出临时文件。关键差异是：当前上游 `resolveToCwd` 接受绝对路径，`..` 也可解析到 cwd 外，内建 coding tools 没有 workspace jail 或权限确认，能力边界等价于课程的 `containment: "unrestricted"`。课程 `"workspace"` 模式必须被准确标为教学环境的主动强化。
:::

## 故意把它弄坏

:::failure title="把多匹配偷偷改成第一处"
临时把 edit 的“匹配必须唯一”改成 `replace` 第一处，然后在含两个相同片段的文件运行。

首次偏差是工具报告成功且文件 hash 改变，而模型并没有提供足够定位信息；这比显式失败危险。恢复唯一匹配后，断言 result 指出匹配数为 2、`isError` 为 true、文件 bytes 与调用前完全一致。
:::

## 本章验收

:::checkpoint title="Checkpoint 08 · Agent 获得受控副作用"
运行 `npm run workshop:test -- coding-tools`，现场证明四件事：越界路径被课程 containment 拒绝；read 明示截断；edit 多匹配零写入；bash timeout/abort 后无残留进程。

随后用 ScriptedModel 完成 `read → edit → bash → final`，检查 call/result 全配对。测试为绿还不够；你应能说清 containment 防什么、不防什么。恢复时只撤销本章文件，并确认 `npm run workshop:test -- agent-loop` 仍通过。
:::

## 可选迁移练习

:::transfer title="无脚手架迁移 · 并发修改竞态"
创建两个对同一文件的延迟 write，以及一个写另一文件的 edit。先画出允许的完成时间线，再写测试：同文件操作必须按注册顺序结算，另一文件可以并发；abort 旧 write 后，新 write 不能被随后醒来的旧操作覆盖。不要复用本章现成断言。
:::

额外练习：实现一个只读 `list` tool。它同样要遵守 containment 和输出上限，但不应复制 write/edit 的 mutation queue；解释为什么“共享环境”不意味着所有动作都串行。

## 小结

Coding tools 的难点不是调用 fs 和 shell，而是把副作用变成受约束的协议：Read 明示不完整观察，Write 明示覆盖，Edit 先验证后提交，Bash 拥有可回收的生命周期。课程 containment 保护练习目录，却不冒充强沙箱。至此最小 Agent 已能真实修改环境；下一章会在纯 loop 外增加跨运行状态、取消和用户时序控制。
