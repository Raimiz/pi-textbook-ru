---
id: "14"
slug: eval-capstone
part: product
partTitle: 第四部 · 从核心到产品
chapter: "14"
title: 给完整的 Pi 建一套独立评测
summary: 用新鲜 fixture、独立判定器、严格协议和脱敏报告，判断一次 Agent 运行究竟是任务失败、协议失败，还是评测设施坏了。
minutes: 180
difficulty: 综合
artifact: packages/pi-course/test-support/eval.ts
prerequisites: 07,09,10,13
terms: eval runner, fresh fixture, oracle, active path, protocol failure, safe evidence, held-out
upstream: packages/agent/test/agent-loop.test.ts,packages/coding-agent/test/agent-session-compaction.test.ts
---

# 给完整的 Pi 建一套独立评测

## 你将得到什么

第 13 章结束时，Pi 已经能恢复历史、运行 Agent、调用工具、追加 session，并从三种
mode 输出结果。你当然可以启动它，给一个任务，看它把文件改对，然后说：“能用了。”

这个判断太早了。

一次演示只回答了一件事：在这一组输入、这一份环境和这一次运行里，最后的画面看起来
对。它没有回答下面这些问题：

- 下一次运行会不会偷用上一次留下的文件或 Runtime；
- session 的活动分支和 `Runtime.prompt()` 返回的 transcript 是否为同一份事实；
- 文件碰巧改对时，工具调用与结果有没有完整配对；
- fixture、文件读取或 judge 自己出错时，会不会冤枉 Agent；
- 失败报告会不会把 prompt、文件正文、路径、callId 或异常堆栈带出去；
- 换一组路径、id 和故障参数后，同一套规则还能不能工作。

所以最后一章不再往 Pi 核心里塞能力。我们站到系统外面，建立一个独立的评测边界。
它会运行完整 Runtime，却不参与 Runtime 的产品决策。

你最终会得到两个函数：

```ts
runEvalCase(evalCase): Promise<EvalReport>
runEvalSuite(cases): Promise<EvalReport[]>
```

它们守住一条总原则：

> 评测必须先确认自己拿到的事实可信，再让独立 judge 判断任务结果。任何报告只携带
> 固定分类与计数，不携带原始证据。

这里的“独立”很具体。Runner 持有执行顺序、协议检查、失败分层和资源回收；case
提供新鲜环境；judge 只读 observation，只判断任务条件。三个角色不能互相代班。

## 为什么最后才做评测

系统评测需要一个稳定、可观察的系统边界。第 07 章只有 loop，第 09 章只有跨轮 Agent，
第 10 章才有 session，第 13 章才把这些部件接成 Runtime。若在更早的章节写整机评测，
测试会被迫自己拼装半成品，最后测到的只是测试里的那套接线。

现在对象图已经稳定：

```text
Model + Tools + Session + Resources
                │
                ▼
          Chapter 13 Runtime
                │
                ▼
       Chapter 14 Eval Runner
          ├─ 执行一次任务
          ├─ 收集活动路径
          ├─ 校验协议
          ├─ 读取声明文件
          ├─ 调用独立 judge
          └─ 生成脱敏报告
```

这也解释了本章的施工位置。你只改：

```text
packages/pi-course/test-support/eval.ts
packages/pi-course/tsconfig.json
```

`tsconfig.json` 只把 `test-support/**/*.ts` 加入编译。不要修改
`packages/pi-course/src/` 下的产品核心，也不要在 `Agent`、`Runtime` 或工具里增加
`if (eval)` 一类测试入口。评测发现产品缺陷时，先记录证据；本章公开施工仍停在评测
边界。

## 开始动手

在教学历史仓库里创建隔离练习目录。不要修改原始 Pi，也不要把实现写进教材目录：

```bash
cd <你的教学历史仓库>
npm run checkpoint -w @pi/course -- 14
npm run practice -w @pi/course -- 14 <新目录>
cd <新目录>
npm install
```

`practice 14` 会做三件事：

1. 导出第 13 章 target，也就是本章 parent；
2. 放入第 14 章的 9 项公开测试；
3. 用 `starters/14-eval.ts` 和 `starters/14-tsconfig.json` 提供可编译脚手架。

它不会复制 held-out 测试，也不会附带 target 实现。

先确认脚手架能编译：

```bash
npm run build -w @pi/course
```

再只运行第一段：

```bash
node --test --test-name-pattern="Lab 14.1" \
  packages/pi-course/dist/test/14-*.test.js
```

正确起点是 `0/3`。三项失败都应来自：

```text
Lab 14.1 runEvalCase 尚未实现
```

若 build 先失败，或错误指向缺少产品模块，先检查当前目录、starter overlay 和
`tsconfig.json`。不要靠改测试、关闭 strict 或改产品核心越过错误起点。

:::rebuild title="Checkpoint 14 · 分三段建立独立评测，再用 held-out 验证泛化"
**模式：** 重建。从第 13 章 target 开始，只增加独立评测层。

**起终点：** `parent` `1caf1082b3f92504346bbeda969e4cfbb0f8f636` 是起点；
`target` `d2bfac24e212fec05299679e8af18abc6c1bbc67` 是终点。

**target subject：** `course(14): evaluate complete agents with safe evidence`

**教学文件：** `packages/pi-course/test-support/eval.ts` 与
`packages/pi-course/tsconfig.json`。学习脚手架固定全部公共类型和两个导出函数的签名；
它没有协议状态机、失败分层、观察值冻结、证据计数或 cleanup 规则。

**动手前只需知道：** 一个 case 提供 `prepare()` 和 `judge()`；runner 负责夹在两者
之间的执行、取证、协议检查与清理。每次运行都重新调用 `prepare()`。

**第一步：** 先不看 target diff，保持产品核心不动，在 `runEvalCase()` 内搭出
`prepare → prompt → flush → entries → files → judge → dispose → cleanup` 的单次
执行骨架。

**第一次红灯：** fresh starter 的 build 为绿；只运行 Lab 14.1 时精确得到 `0/3`，
三项都报告 `Lab 14.1 runEvalCase 尚未实现`。

**聚焦测试：** `packages/pi-course/test/14-eval-capstone.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 14`

**练习目录：** `npm run practice -w @pi/course -- 14`，也可以在后面追加一个全新的
输出目录。

**聚焦运行：** `npm run build -w @pi/course`，然后
`node --test packages/pi-course/dist/test/14-*.test.js`。

**施工顺序：** fresh fixture、受限 observation 与基础设施分层 `3/3` → 独立
oracle、活动路径协议与固定失败码 `3/3` → 安全证据、生命周期主次与顺序 suite
`3/3`。

**通过证据：** 公开 9 项全绿；故障实验能先打红再恢复；官方 target 的 held-out
3 项与全量 120 项测试通过。第一次练习禁止查看 held-out fixture 或复制完整答案。
:::

## 先建立全景

### Case 负责造一个新世界

`EvalCase` 描述一项任务。它没有现成 Runtime，而是提供 `prepare()`：

```ts
export interface EvalCase {
  id: string;
  prompt: string;
  files: readonly string[];
  prepare(): Awaitable<PreparedEval>;
  judge(observation: EvalObservation): Awaitable<TaskVerdict>;
}
```

`prepare()` 每次都要返回新建的运行环境：

```ts
export interface PreparedEval {
  runtime: Runtime;
  readFile(file: string): Awaitable<string>;
  cleanup?(): Awaitable<void>;
}
```

一个 case 被运行两次，`prepare()` 就调用两次。临时目录、Runtime、session、脚本模型
和计数器都应在这一步重新建立。Runner 不能缓存 `PreparedEval`，suite 也不能因为两项
输入引用同一个 `EvalCase` 对象就复用环境。

为什么这么严格？假设第一次运行生成了 `answer.txt`。第二次若复用目录，即使 Agent
什么都没做，judge 仍可能读到第一次的答案。这样的“稳定通过”恰好证明评测失真。

### Runner 负责事实是否可信

Runner 拿到准备好的 Runtime 后，顺序执行：

```text
runtime.prompt(prompt)
  → runtime.flush()
  → runtime.session.entries()
  → 选择 active leaf 的祖先路径
  → 校验消息与工具协议
  → 对照 Runtime 返回的 messages
  → 读取 case 声明的文件
  → 深复制并冻结 observation
  → judge(observation)
  → runtime.dispose()
  → prepared.cleanup()
```

这条顺序属于 runner。Case 不能自己跳过 `flush()`，judge 不能去 session 里另选分支，
产品 Runtime 也不负责把评测错误改写成任务失败。

### Judge 只回答任务有没有做对

Judge 接收一个只读观察值：

```ts
export interface EvalObservation {
  readonly result: AgentRunResult;
  readonly entries: readonly SessionEntry[];
  readonly files: Readonly<Record<string, string>>;
}
```

它看不到整个 session，只能看到 active path；它也不能随意读工作区，只能看到
`EvalCase.files` 声明的文件。它返回：

```ts
type TaskVerdict =
  | { passed: true; checks: readonly boolean[] }
  | { passed: false; checks: readonly boolean[] };
```

`passed` 必须等于 `checks.every(Boolean)`。例如：

```ts
return {
  passed: false,
  checks: [true, false],
};
```

这个 verdict 有效，表示两项任务条件里通过一项、失败一项。下面这个 verdict 自相矛盾：

```ts
return {
  passed: true,
  checks: [true, false],
};
```

Runner 要把它归为 `judge/invalid_verdict`。Agent 没有责任替一个写错的判定器背锅。

:::predict title="文件正确，协议还要检查吗"
Agent 最终写出了正确的 `answer.txt`，但 session 里出现一个没有对应 tool call 的
`toolResult`。这次评测应该通过吗？
---answer
不能通过。文件只证明最终状态碰巧满足任务条件。孤立的 `toolResult` 说明执行轨迹已经
失去因果来源，恢复、审计和下一轮模型上下文都不再可信。Runner 应在调用 judge 前返回
`protocol_failed`。
:::

## 先定义失败语言

评测系统最容易写成一个大 `try/catch`：哪里出错都返回 `failed`。这样做省代码，却让
报告失去诊断价值。

本章把结果分为四种状态：

| `status` | 含义 |
|---|---|
| `passed` | 协议可信，judge 的所有检查通过 |
| `task_failed` | 协议可信，judge 明确拒绝任务结果 |
| `protocol_failed` | active path、消息或工具因果关系不成立 |
| `infra_failed` | prepare、执行、收集、judge 本身或生命周期设施出错 |

故障用 runner 自己定义的固定枚举表示：

```ts
export interface EvalFailure {
  phase: EvalFailurePhase;
  code: EvalFailureCode;
}
```

外部异常的 `message`、`cause` 和 `stack` 都停在评测边界里。报告可以说：

```json
{"phase":"collect","code":"collect_failed"}
```

它不能带出：

```text
ENOENT: /private/tmp/project-secret/answer.txt
```

完整的 phase 归属如下：

| 发生位置 | `phase` | 常见 `code` | 状态 |
|---|---|---|---|
| case 形状、`prepare()` | `prepare` | `invalid_case`、`prepare_failed` | `infra_failed` |
| `prompt()`、`flush()` | `execute` | `execute_failed` | `infra_failed` |
| session、文件、冻结观察值 | `collect` | `collect_failed` | `infra_failed` |
| active path 与消息因果 | `protocol` | 固定协议码 | `protocol_failed` |
| judge 抛错或返回矛盾结果 | `judge` | `judge_failed`、`invalid_verdict` | `infra_failed` |
| judge 合法拒绝 | `task` | `task_rejected` | `task_failed` |
| `dispose()`、`cleanup()` | 对应生命周期 phase | 对应固定码 | 见主次规则 |

这张表是后面代码的骨架。先定所有权，再写 `catch`；不要读取错误字符串猜 phase。

## 实践 14.1：隔离执行，只交出受限事实

这一段对应三项公开测试：

1. 同一个 case 每次重新 `prepare()`，执行后按 `dispose → cleanup` 收口；
2. judge 只看到 active path 和声明文件，整个 observation 深复制并冻结；
3. 执行故障与收集故障落到不同的 infra phase。

### 第一个动作：搭出始终能清理的外壳

先在 `runEvalCase()` 里准备这些局部状态：

```ts
let report = /* 一个初始安全报告 */;
let prepared: PreparedEval | undefined;
let runtime: Runtime | undefined;

try {
  // prepare、execute、collect、protocol、judge
  return report;
} finally {
  // dispose，再 cleanup
}
```

这里需要一个可变的 `report` 引用。主流程可能很早返回，例如 `prompt()` 抛错；`finally`
仍要把随后发生的 dispose 或 cleanup 故障追加到同一个报告对象。

清理顺序固定：

```ts
if (runtime) {
  try {
    await runtime.dispose();
  } catch {
    appendCleanupFailure(
      report,
      { phase: "dispose", code: "dispose_failed" },
    );
  }
}

if (prepared?.cleanup) {
  try {
    await prepared.cleanup();
  } catch {
    appendCleanupFailure(
      report,
      { phase: "cleanup", code: "cleanup_failed" },
    );
  }
}
```

先 dispose Runtime，让它完成已经接受的工作并关闭入口；再删除 fixture 的外部资源。
若 `prepare()` 在返回 `PreparedEval` 之前就失败，它必须自行回滚创建到一半的资源。
Runner 此时没有拿到 cleanup 句柄。

### 第二个动作：明确执行和收集的分界线

执行阶段只有两步：

```ts
result = await runtime.prompt(evalCase.prompt);
await runtime.flush();
```

其中任一步抛错，都返回：

```ts
{
  status: "infra_failed",
  primaryFailure: {
    phase: "execute",
    code: "execute_failed",
  },
}
```

`flush()` 不能省。第 13 章保证 prompt 返回前消息已经落盘，但评测边界仍显式等待
Runtime 接受的工作完成。这样 runner 依赖公开生命周期契约，不依赖某个实现里的偶然
时序。

接着进入收集阶段：

```ts
const allEntries = await runtime.session.entries();
const leafId = runtime.getActiveLeafId();
```

读取 session 抛错属于 `collect_failed`。`leafId === null` 则说明 Runtime 执行结束后
没有可审计的活动路径，这是 `protocol/missing_active_leaf`。

### 第三个动作：只取活动祖先链

第 10 章已经提供 `pathTo(entries, leafId)`。这里直接复用：

```ts
let activeEntries: SessionEntry[];

try {
  activeEntries = pathTo(allEntries, leafId);
} catch {
  return protocolFailure("invalid_active_path");
}
```

不要在 eval 里重新写 parent traversal。Session 树可以含 sibling，物理数组里也可以有
metadata。Judge 的事实范围只由当前 active leaf 决定：

```text
root metadata
  └─ user
      ├─ sibling assistant     ← 不交给 judge
      └─ selected assistant
          └─ toolResult
              └─ final assistant
```

### 第四个动作：只读取声明文件

文件收集用一个无原型对象：

```ts
const files: Record<string, string> = Object.create(null);

for (const file of evalCase.files) {
  const content: unknown = await prepared.readFile(file);
  if (typeof content !== "string") {
    throw new Error("readFile must return string");
  }
  files[file] = content;
}
```

Runner 不遍历目录，也不让 judge 临时要求更多文件。`files` 是能力白名单。这样 case
作者需要提前说清判定依赖哪些产物，报告里的 `requested/read` 计数也有确定含义。

文件读取抛错、返回非字符串，或者 observation 无法复制，都归到
`collect/collect_failed`。

### 第五个动作：先复制，再递归冻结

只写 `Object.freeze(observation)` 不够。它只能冻结最外层对象，judge 仍能修改：

```ts
observation.entries[0].message.content
observation.result.messages[0]
observation.files["answer.txt"]
```

先 `structuredClone()` 切断与 Runtime、session 和 fixture 的共享引用，再递归冻结：

```ts
function deepFreeze<T>(
  value: T,
  seen = new Set<object>(),
): T {
  if (
    value === null ||
    (typeof value !== "object" &&
      typeof value !== "function")
  ) {
    return value;
  }

  const object = value as object;
  if (seen.has(object)) return value;
  seen.add(object);

  for (const key of Reflect.ownKeys(object)) {
    const descriptor =
      Object.getOwnPropertyDescriptor(object, key);
    if (descriptor && "value" in descriptor) {
      deepFreeze(descriptor.value, seen);
    }
  }

  return Object.freeze(value);
}
```

`seen` 防止循环引用让递归停不下来。当前 canonical 数据应当可结构化复制；复制失败也
是收集设施问题，不能继续调用 judge。

### 运行第一段

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 14.1" \
  packages/pi-course/dist/test/14-*.test.js
```

目标：

```text
tests 3
pass 3
fail 0
```

:::lab title="实践 14.1 · fresh fixture、受限 observation 与 infra phase"
**目标：** 让每次 case 都从新环境开始，并让 judge 只能读取已经确认可信的最小事实。

**只改：** `packages/pi-course/test-support/eval.ts`

**建议顺序：**

1. 写空 evidence、固定 failure 和 report 的小 helper；
2. 在 `try/finally` 里接通 `prepare → prompt → flush`；
3. 读取 session，调用第 10 章的 `pathTo()`；
4. 按 `EvalCase.files` 逐个读取字符串；
5. 深复制并递归冻结 observation；
6. 在 `finally` 中按 `dispose → cleanup` 收口。

**运行：**

```bash
node --test --test-name-pattern="Lab 14.1" \
  packages/pi-course/dist/test/14-*.test.js
```

**通过证据：** `3/3`。同一个 case 运行两次会 prepare 两次；sibling 和未声明文件
不会进入 judge；execute 与 collect 错误拥有不同固定分类。
:::

## 实践 14.2：先验协议，再让 oracle 判任务

Lab 14.1 已经建立执行通道。现在要回答两个更难的问题：

1. 收集到的 active path 能不能代表一次合法 Agent 交互；
2. Runtime 返回的 `result.messages` 是否和已持久化路径一致。

文件正确也不能替这两项作证。

### 独立 oracle 的最小规则

Judge 的 `checks` 是原子任务条件，`passed` 是它们的合取：

```ts
function validVerdict(
  value: unknown,
): value is TaskVerdict {
  if (
    value === null ||
    typeof value !== "object" ||
    !("passed" in value) ||
    typeof value.passed !== "boolean" ||
    !("checks" in value) ||
    !Array.isArray(value.checks) ||
    !value.checks.every(
      (check) => typeof check === "boolean",
    )
  ) {
    return false;
  }

  return value.passed === value.checks.every(Boolean);
}
```

Judge 抛异常时，runner 返回 `judge/judge_failed`。Judge 返回形状错误或逻辑矛盾时，
runner 返回 `judge/invalid_verdict`。只有合法的 `{passed:false}` 才产生
`task/task_rejected`。

这个边界让两类红灯分开：

```text
Agent 产物没满足条件       → task_failed
判定代码自己坏了           → infra_failed
```

### 协议检查要维护状态，不能只数 call 与 result

只比较 `toolCall` 总数和 `toolResult` 总数会漏掉很多错误：

- 两个 call 使用同一个 id；
- result 的 `toolName` 与原 call 不同；
- result 引用了不存在的 call；
- 同一个 call 收到两个 result；
- call 没有 result；
- assistant 发出 call 后，下一条 assistant 已经继续说话，result 更晚才补交。

最后一种尤其容易漏。总数最终可能相等，因果顺序已经断了。

按 active path 从前往后扫描，维护：

```ts
const calls = new Map<
  string,
  { name: string; matched: boolean }
>();

let sawUser = false;
let interactionOpen = false;
let interactionHasAssistant = false;
```

遇到 `user`：

```text
若上一轮 user 后没有 assistant
  → incomplete_user_interaction

若之前仍有未配对 call
  → unpaired_tool_call

打开新的 interaction
```

遇到 `assistant`：

```text
若还没有打开 user interaction
  → assistant_without_user

若之前仍有未配对 call
  → unpaired_tool_call

登记本条 assistant 中的每个 toolCall
若 callId 已存在
  → duplicate_tool_call
```

“检查未配对 call”必须发生在登记下一条 assistant 之前。这样：

```text
user
  → assistant(toolCall A)
  → assistant("我先继续")
  → toolResult A
```

会在第二条 assistant 处立即失败。Runner 不接受跨 assistant 补交 result。

遇到 `toolResult`：

```text
找不到对应 call
  → orphan_tool_result

该 call 已经 matched
  → duplicate_tool_result

toolName 不同
  → tool_name_mismatch

否则把 matched 设为 true
```

扫描结束后还要检查：

```text
至少出现一个 user
当前 interaction 至少出现一个 assistant
不存在未配对 call
```

协议检查只读取 message entry。Metadata 可以出现在活动路径里，它不扮演消息角色。

:::mechanism title="为什么 callId 相等仍要核对 toolName"
`toolCallId` 说明 result 回答哪次调用，`toolName` 说明环境实际执行了哪种能力。若 call
声明 `write_file`，result 却写成 `bash`，只看 id 会把两种不同的环境事实合并。恢复后
模型会接到一条自相矛盾的历史。两者都相等，配对才成立。
:::

### 两条证据链必须汇合

协议合法以后，从 active path 投影消息：

```ts
const activeMessages = activeEntries.flatMap(
  (entry) =>
    entry.type === "message"
      ? [entry.message]
      : [],
);
```

再和本次 Runtime 返回的 transcript 深比较：

```ts
import { isDeepStrictEqual } from "node:util";

if (!isDeepStrictEqual(activeMessages, result.messages)) {
  return protocolFailure("result_session_mismatch");
}
```

这里核对的是两条独立证据：

```text
Runtime.prompt() 返回值        session active path
          │                             │
          └────── 深比较 messages ──────┘
```

只看返回值，可能接受“模型说成功、落盘内容却不同”；只看 session，又可能忽略 Runtime
向调用者交出了另一份 transcript。两者一致后，judge 才能放心使用 observation。

### 固定分类，不转述异常

这一段还会注入 `prepare()` 和 `judge()` 的异常。写法保持朴素：

```ts
try {
  prepared = await evalCase.prepare();
} catch {
  return infraFailure("prepare", "prepare_failed");
}
```

不要写 `catch (error)` 后把 `String(error)` 塞进报告。测试会使用带有敏感标记的异常；
序列化报告中不能出现标记、正文或堆栈。

### 运行第二段

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 14.2" \
  packages/pi-course/dist/test/14-*.test.js
```

目标：

```text
tests 3
pass 3
fail 0
```

再确认前两段同时通过：

```bash
node --test --test-name-pattern="Lab 14.[12]" \
  packages/pi-course/dist/test/14-*.test.js
```

应为 `6/6`。

:::lab title="实践 14.2 · 独立 oracle、活动路径协议与失败分层"
**目标：** 先证明轨迹可信，再判断任务结果；评测代码自己的错误不能伪装成任务失败。

**只改：** `packages/pi-course/test-support/eval.ts`

**建议顺序：**

1. 实现 `validVerdict()`，把合法拒绝和 judge 故障分开；
2. 写 `ProtocolViolation`，内部只携带固定 `EvalFailureCode`；
3. 按 user、assistant、toolResult 三种角色扫描 active path；
4. 在每条新 assistant 和新 user 前检查尚未配对的 call；
5. 用深比较核对 active-path messages 与 `result.messages`；
6. 检查所有 catch 分支只生成固定 phase/code。

**运行：**

```bash
node --test --test-name-pattern="Lab 14.2" \
  packages/pi-course/dist/test/14-*.test.js
```

**通过证据：** `3/3`，累计 `6/6`。矛盾 verdict 属于 judge infra；重复、悬空、跨
assistant 补交与 transcript 分裂都属于 protocol；异常正文不进入报告。
:::

## 实践 14.3：报告只带安全证据，生命周期保留根因

到这里，runner 已经知道一次运行在哪个 phase 首先失败。最后一段处理两个经常在真实
系统里混在一起的问题：

- 报告怎样证明“看过什么”，同时不泄露“具体是什么”；
- 清理也失败时，怎样保住最初的根因。

### SafeEvidence 只保留计数

公开报告的证据结构已经由 starter 固定：

```ts
export interface SafeEvidence {
  messages: {
    user: number;
    assistant: number;
    toolResult: number;
  };
  tools: {
    calls: number;
    results: number;
    errors: number;
  };
  files: {
    requested: number;
    read: number;
  };
  checks: {
    passed: number;
    failed: number;
  };
}
```

计数从 active path、声明文件和 verdict 推导：

```text
messages.user / assistant / toolResult
  ← active path 上三种 canonical role 的数量

tools.calls
  ← assistant content 中 toolCall block 的数量

tools.results / errors
  ← toolResult message 总数及 isError=true 的数量

files.requested / read
  ← case.files 的数量与成功读取的数量

checks.passed / failed
  ← judge 返回的 boolean 数组
```

报告不包含以下字段：

```text
transcript
prompt
file content
file path
temporary root
callId
tool arguments
Error message / cause / stack
```

`EvalReport.id` 会公开，所以 case 作者也要把它当作标签，不要把 secret 或绝对路径编码
进 id。

成功报告与失败报告使用同一套固定字段：

```ts
export interface EvalReport {
  id: string;
  status: EvalStatus;
  evidence: SafeEvidence;
  primaryFailure?: EvalFailure;
  secondaryFailures: EvalFailure[];
}
```

这种报告适合汇总和比较。需要调试原始 observation 时，应在受控的本地测试里查看，
不要临时给公共报告增加一个 `raw` 字段。

### 一次运行只有一个 primary failure

假设文件读取先失败，随后 `dispose()` 和 `cleanup()` 也失败。发生顺序是：

```text
collect_failed
  → dispose_failed
  → cleanup_failed
```

报告应保留：

```json
{
  "status": "infra_failed",
  "primaryFailure": {
    "phase": "collect",
    "code": "collect_failed"
  },
  "secondaryFailures": [
    {
      "phase": "dispose",
      "code": "dispose_failed"
    },
    {
      "phase": "cleanup",
      "code": "cleanup_failed"
    }
  ]
}
```

生命周期错误不能覆盖已经发生的任务、协议或基础设施事实。若主流程原本成功，
`dispose_failed` 才成为 primary，后来的 `cleanup_failed` 进入 secondary：

```ts
function appendCleanupFailure(
  report: EvalReport,
  cleanupFailure: EvalFailure,
): void {
  if (report.primaryFailure) {
    report.secondaryFailures.push(cleanupFailure);
    return;
  }

  report.status = "infra_failed";
  report.primaryFailure = cleanupFailure;
}
```

注意 `task_failed` 也有 primary。一次任务已经被合法 judge 拒绝，dispose 故障只能
追加，不能把状态改成 `infra_failed`。否则报告会丢掉最早的业务事实。

### Suite 故意串行

`runEvalSuite()` 很短：

```ts
export async function runEvalSuite(
  cases: readonly EvalCase[],
): Promise<EvalReport[]> {
  const reports: EvalReport[] = [];

  for (const evalCase of cases) {
    reports.push(await runEvalCase(evalCase));
  }

  return reports;
}
```

这里不用 `Promise.all()`。输入顺序就是报告顺序；上一项完成 dispose 和 cleanup 后，
下一项才 prepare。若数组里两次放入同一个 case，它仍会走两次完整生命周期。

本章评测的是正确性与隔离，不承担吞吐基准。以后真的需要并行评测，应先给 fixture
资源命名、并发上限、报告排序和取消规则分别建立契约，再增加并发。

### 运行第三段

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 14.3" \
  packages/pi-course/dist/test/14-*.test.js
```

目标：

```text
tests 3
pass 3
fail 0
```

最后运行全部公开测试：

```bash
node --test packages/pi-course/dist/test/14-*.test.js
```

目标是 `9/9`。

:::lab title="实践 14.3 · SafeEvidence、主次故障与顺序 suite"
**目标：** 让报告足以定位 failure class，同时不携带原始消息、文件或异常；让后续清理
故障保留正确的因果顺序。

**只改：** `packages/pi-course/test-support/eval.ts`

**建议顺序：**

1. 从 active path 和 verdict 计算 `SafeEvidence`；
2. 检查 `EvalReport` 只由固定字段构成；
3. 实现 `appendCleanupFailure()`；
4. 验证 task failure 不会被 dispose/cleanup 覆盖；
5. 用普通 `for...of` 顺序实现 `runEvalSuite()`。

**运行：**

```bash
node --test --test-name-pattern="Lab 14.3" \
  packages/pi-course/dist/test/14-*.test.js
```

**通过证据：** 本段 `3/3`，公开测试累计 `9/9`。报告只有计数和固定枚举；清理故障
按发生顺序追加；重复 case 会重新 prepare。
:::

## 故意把它弄坏

现在做一次有诊断价值的故障实验。临时注释掉 active path 与 Runtime result 的深比较：

```ts
// if (!isDeepStrictEqual(activeMessages, result.messages)) {
//   ...
// }
```

只运行这项公开测试：

```bash
node --test \
  --test-name-pattern="active path 拒绝不一致 transcript" \
  packages/pi-course/dist/test/14-*.test.js
```

它应该变红。测试里有一条路径满足工具协议、session 也能正常读取，但
`Runtime.prompt()` 返回的最后一条 assistant 文本被换成了另一份内容。少了深比较后，
runner 会把两份互相冲突的事实交给 judge，甚至可能报告 `passed`。

记录第一次偏差：

```text
observed:
  session active path 与 Runtime result 不同，
  runner 仍继续读文件和调用 judge

first divergence:
  protocol 阶段漏掉 result_session_mismatch

owner:
  eval runner

smallest repair:
  恢复 activeMessages 与 result.messages 的深比较
```

恢复代码，再运行：

```bash
node --test \
  --test-name-pattern="active path 拒绝不一致 transcript" \
  packages/pi-course/dist/test/14-*.test.js
```

这项测试应重新通过，随后确认公开 `9/9`。不要顺手增加日志字段或修改 fixture。这个
实验只证明一件事：任务 oracle 之前必须让两条 transcript 证据汇合。

:::failure title="失败注入 · Runtime 返回值与持久化路径分裂"
**破坏：** 暂时移除 `result_session_mismatch` 检查。

**预测：** 合法工具配对仍会通过，但伪造的 Runtime 返回值不再被 protocol 层拦下。

**最小运行：**

```bash
node --test \
  --test-name-pattern="active path 拒绝不一致 transcript" \
  packages/pi-course/dist/test/14-*.test.js
```

**修复：** 恢复深比较，只重跑同一项；通过后再跑公开 9 项。
:::

## 实践 14.4：held-out 检查能否迁移规则

如果测试把训练时见过的 id、路径和 callId 写死，公开 `9/9` 依然可能只是一份精心背下
来的答案。最后三项测试因此保留在 official target 和 full gate 中，不会进入
`practice 14`。

Held-out 只改变实例，不改变公开契约。它会从这些方向取新样本：

- 换一条包含 metadata 和 sibling 的 session 路径；
- 换 case id、prompt、文件名和 callId；
- 换 tool name 错配与重复 result 的具体参数；
- 让文件收集先失败，再叠加 dispose、cleanup 故障；
- 重复运行同一个 case，检查每次是否重新 prepare。

你不需要为这些变化增加分支。前面三段若是按不变量实现，下面的规则自然继续成立：

```text
活动 leaf 决定 observation 的 session 范围
每个 tool call 在路径上唯一且恰好配对一次
result 的 callId 与 toolName 都要匹配
第一次失败是 primary
生命周期故障按顺序追加
报告只含固定枚举与计数
每次 runEvalCase 都重新 prepare
```

练习目录只验收公开 `9/9`。不要从目标 commit 读取、复制或转述
`capstone-held-out.test.ts`。完成公开实现后，把下面信息交给陪学 Agent：

```text
我已经在 Chapter 14 隔离目录通过 9 项公开测试。
请不要向我展示 held-out fixture。
请在官方 course(14) target 上运行 full gate，
只告诉我 3 项 held-out 和全量测试是否通过。
若失败，只按公开的 EvalCase、协议、失败分层和生命周期契约给一个最小提示。
```

官方 target 的完整验收命令是：

```bash
npm test -w @pi/course
```

目标：

```text
Lab 14.1  3/3 public
Lab 14.2  3/3 public
Lab 14.3  3/3 public
Lab 14.4  3/3 held-out
Chapter 14 12/12
full course 120/120
```

:::lab title="实践 14.4 · held-out 泛化验收"
**目标：** 验证实现依赖公开协议，不依赖已经见过的 fixture 常量。

**学生动作：** 在隔离目录完成公开 `9/9`，停止读取目标实现；把 full gate 交给陪学
Agent。

**Agent 边界：** 可以运行 official target 的 held-out 与全量测试，只返回通过数量和
失败所属契约；不能展示测试源码、具体 fixture、id、路径或故障值。

**通过证据：** held-out `3/3`，第 14 章 `12/12`，课程总计 `120/120`。
:::

## 测试结果该怎样判断

绿灯数量只是入口。每段结束后，用下面四个问题审查实现：

| 问题 | 可信答案 |
|---|---|
| 同一个 case 连跑两次，第二次能否看到第一次的状态？ | 不能；两次都重新 prepare |
| 文件已正确，协议错误能否被 judge 掩盖？ | 不能；协议先于文件判定 |
| judge 抛错，能否记成 Agent 的 task failure？ | 不能；它属于 judge infra |
| cleanup 失败，能否覆盖更早的 collect failure？ | 不能；它只能成为 secondary |

还要看第一次偏差。比如 `Lab 14.3` 的安全报告失败，先检查 report 的构造边界，别去改
Runtime 消息；`Lab 14.2` 的跨 assistant 配对失败，先检查状态机在哪次进入 assistant
前漏查 unmatched call，别给 Map 增加事后修补。

这就是本章的顶层判断：

```text
环境是否新鲜
  ↓
执行与收集是否成功
  ↓
活动路径是否可信
  ↓
Runtime 返回值是否与落盘事实一致
  ↓
独立 judge 是否给出合法 verdict
  ↓
报告是否脱敏
  ↓
生命周期是否完整收口
```

从上往下找第一处偏差。后面的现象再多，也先修拥有那条不变量的层。

## 与原始 Pi 的关系

原始 Pi 在 agent loop、coding agent session、compaction 和产品入口附近已有各自的
专项测试。本章把教学版 Runtime 放进一个统一的 `EvalCase` 协议，加入 frozen
observation、固定 failure taxonomy、safe evidence 和 held-out gate。这是课程为了讲清
整机证据而增加的测试支持层。

课程没有声称：

- 这套 `test-support/eval.ts` 是原始 Pi 的生产模块；
- 当前 runner 能执行不受信任的远程 benchmark；
- `Object.freeze()` 提供进程级安全隔离；
- 串行 suite 是性能评测器；
- 计数报告足以代替受控环境里的详细调试记录；
- 三个 held-out case 可以证明所有未知任务都正确。

本章证明的范围更窄，也更扎实：在给定 Runtime 契约下，runner 能隔离运行、验证活动
路径与工具因果、区分 task/protocol/infra、保留生命周期根因，并输出不含原始证据的
报告。

:::pi title="课程边界 · Eval 留在 test-support"
本章唯一新增的核心实现文件是 `packages/pi-course/test-support/eval.ts`。
`packages/pi-course/src/composition.ts` 是被评对象，保持第 13 章状态。若你发现自己
正在往 `Agent` 或 `Runtime` 增加评测专用条件，先停下来检查所有权：fixture 属于 case，
协议与分类属于 runner，任务条件属于 judge。
:::

## 和陪学 Agent 一起走最后一章

这一章代码不长，判断分支很多。一次粘贴完整 `runEvalCase()` 会让测试变绿，却看不见
每个 phase 为什么存在。请让 Agent 按四段提示：

```text
我们正在重建 Chapter 14。

请先读取 checkpoint 14、当前隔离目录的 LEARNING.md、
AGENT_GUIDE.md 的 Chapter 14 和本章教材。

先问我下一次测试会怎样失败。一次只给一个动作：
1. 指出当前负责的 phase；
2. 指出要修改的 helper 或分支；
3. 让我先写伪代码；
4. 我仍卡住时，再给局部 TypeScript。

不要粘贴完整 runEvalCase，不要修改产品 src，
不要读取或展示 held-out fixture。
每段通过后，问我这一段排除了哪一种假绿。
```

建议每段都留下三句话：

```text
我刚建立的不变量：
这个测试最小地证明了：
它还没有证明：
```

例如 Lab 14.1 通过后可以写：

```text
我刚建立的不变量：
  每次运行都重新 prepare，judge 只看 active path 和声明文件。

这个测试最小地证明了：
  fixture 隔离、观察值只读、execute/collect 分层。

它还没有证明：
  工具协议正确、verdict 合法、报告脱敏。
```

这样进入下一段时，你知道自己在增加哪条证据，不会把后面的失败反过来补进已经稳定的
阶段。

## 本章验收

先在隔离练习中运行：

```bash
npm run build -w @pi/course
node --test packages/pi-course/dist/test/14-*.test.js
```

应得到公开 `9/9`。

故障实验恢复后，再确认：

```bash
node --test \
  --test-name-pattern="active path 拒绝不一致 transcript" \
  packages/pi-course/dist/test/14-*.test.js
```

应通过。

最后由陪学 Agent 在 official target 运行：

```bash
npm test -w @pi/course
```

验收清单：

- 同一个 case 每次重新 prepare；
- runner 顺序执行 prompt、flush、entries、声明文件、dispose、cleanup；
- judge 只看到 active path 与声明文件；
- observation 已深复制并递归冻结；
- execute、collect、protocol、judge、task、dispose、cleanup 各有固定归属；
- tool call/result 同时核对 id、name、唯一性与顺序；
- active-path messages 与 Runtime result 深度一致；
- verdict 的 `passed` 与 checks 一致；
- SafeEvidence 只有计数；
- 第一次失败留在 primary，生命周期错误进入 secondary；
- suite 顺序运行，重复 case 重新 prepare；
- 公开 `9/9`，held-out `3/3`，Chapter 14 `12/12`，full `120/120`；
- 产品 `src/` 没有评测专用分支。

:::checkpoint title="Checkpoint 14 · 完整系统有了独立证据"
**完成状态：** Eval runner 能在新鲜环境中运行完整 Runtime，验证 active path 与工具
协议，让独立 judge 判断任务，并生成安全报告。

**观察证据：** 公开 9 项与 held-out 3 项全部通过；故意移除
`result_session_mismatch` 检查会准确打红，恢复后回绿；课程全量为 `120/120`。

**责任边界：** 产品核心保持第 13 章状态。Case 造环境，runner 验事实和管生命周期，
judge 判任务，报告只携带固定分类与计数。

**恢复：** 回到 parent 后，Pi 仍能运行，但失去统一的整机评测、协议交叉验证、安全
报告和 held-out 泛化证据。
:::

## 可选迁移练习

:::transfer title="陪练迁移 · 给 EvalCase 增加一个全新任务"
公开 9 项通过以后，自己写一个新的测试文件，构造与教材 fixture 不同的
`EvalCase`。任务可以检查一个 JSON 产物，但要守住现有公共接口。

限制：

1. `prepare()` 每次新建 Runtime 和临时目录；
2. `files` 只声明 judge 真正需要的产物；
3. judge 至少返回两项独立 checks；
4. 同一个 case 在 suite 中放两次；
5. 第二次运行不能读到第一次的文件；
6. 报告序列化后不能出现文件正文、临时路径或 callId；
7. 不改 `runEvalCase()`，除非新测试发现的是公开契约缺陷。

先让陪学 Agent 只审查 case、runner、judge 三者的所有权。若测试失败，沿本章的 phase
顺序找第一次偏差。
:::

这个迁移练习是额外挑战。第一次学习的放行条件仍是按提示重建公开三段，并能解释
held-out 为什么要更换实例。

## 小结

- 成功演示只是一条样本，完整评测还要排除环境残留、协议破损和评测设施故障。
- 每次 `runEvalCase()` 都重新 `prepare()`；runner 拥有执行、取证、协议、分类与清理
  顺序。
- Judge 只看 frozen observation，只判断任务；runner 先验证 active path 和 Runtime
  transcript 是同一份事实。
- `task_failed`、`protocol_failed` 与 `infra_failed` 分开；一次运行只保留一个
  primary failure。
- SafeEvidence 只给计数，不给原始消息、文件、路径、callId 或异常。
- 公开 9 项教你建立规则，held-out 3 项更换实例，检查实现有没有把 fixture 当答案。
