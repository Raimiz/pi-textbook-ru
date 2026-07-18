---
id: "11"
slug: context-compaction
part: state
partTitle: 第三部 · 让 Harness 可靠
chapter: "11"
title: 历史不动，上下文按预算重建
summary: 把工具往返组成不可拆分的交互，在预算内选择完整后缀，并用追加的结构化摘要恢复更早事实。
minutes: 145
difficulty: 核心
artifact: packages/pi-course/src/context.ts
prerequisites: 03,10
terms: history, context projection, token budget, interaction boundary, compaction
upstream: packages/coding-agent/src/core/compaction/compaction.ts
---

## 你将得到什么

第 10 章已经把完整消息保存成一棵追加式历史树。它可以一直增长，但模型窗口不会一起
增长。如果为了省 token 直接删除旧记录，分支、恢复和审计都会失去事实依据。

本章只增加一种复杂性：**从不改写的历史中，派生本次模型真正要看的有限上下文。**
完成后，你会得到：

- `CompactionSessionEntry`：把一份结构化摘要追加到 session；
- `groupInteractions()`：按用户回合和工具 `callId` 组成不可拆分的交互；
- `buildContext()`：先扣除 system、输出预留和安全余量，再选择最近的完整交互；
- `createCompactionEntry()`：只创建一条新的摘要记录，不修改历史，也不偷偷写 Store；
- 可重复的恢复规则：只使用活动路径上最新摘要，再接上它要求保留的消息后缀。

本章只有一个总原则：

> 历史回答“发生过什么”；上下文回答“这次模型需要看到什么”。压缩改变后者，不改写
> 前者。

## 为什么第 11 章放在这里

上下文压缩必须晚于 session。没有第 10 章的稳定身份和活动路径，所谓“删掉旧消息”
既无法说明删的是哪条分支，也无法在重启后得到同一结果。

它又必须早于资源和扩展。第 12 章会把项目说明、Skill 和扩展提供的提示加入 system
prompt；这些内容同样占模型窗口。先把预算入口固定下来，后续资源才能作为明确输入接
进来，而不是在各处自行裁剪消息。

```text
第 10 章：选中一条真实、可恢复的历史路径
        ↓
第 11 章：从这条路径派生有限上下文
        ↓
第 12 章：把本轮资源提示加入同一个预算入口
```

## 开始动手

仍然在教学历史仓库中生成隔离练习：

```bash
cd <你的工作区>/pi-course-history
npm run practice -w @pi/course -- 11 <新目录>
cd <新目录>
npm install
```

本章只修改：

```text
packages/pi-course/src/session.ts
packages/pi-course/src/context.ts
```

`session.ts` 保留第 10 章的完整实现，只把 compaction 的类型和运行时解析留给你。
`context.ts` 已固定分组、预算、创建摘要和恢复所需的公共签名。不要复制旧版
`safeTail()`、`compact()` overload 或自动 summarizer；它们不属于本章契约。

:::rebuild title="Checkpoint 11 · 分五步从历史派生有限上下文"
**模式：** 重建。从 10 的 `target` 开始，历史仍然追加，模型视图开始受到预算约束。

**起终点：** `parent` 是本章开始时的起点快照；`target` 是 14 项聚焦测试通过的
终点快照。

**教学文件：** `packages/pi-course/src/session.ts`、
`packages/pi-course/src/context.ts`

**学习脚手架：** 两个文件都能编译。`session.ts` 只缺 compaction 运行时分支；
`context.ts` 的每项公共函数都在对应 Lab 抛出明确异常。

**动手前只需知道：** 一个 interaction 从 user 消息开始，到下一个 user 消息之前
结束。该段中的每个 tool call 都必须有同 `callId` 的唯一 toolResult。预算只能在
interaction 之间裁剪。

**第一步：** 先让 `parseSessionEntry()` 识别严格的 compaction entry，并确认两种
Store 都能写入和重新打开它。暂时不要写预算算法。

**第一次红灯：** 初始 build 应通过；首次只运行 Lab 11.1 时，三项都应准确显示
`Lab 11.1 compaction entry 尚未实现`。

**聚焦测试：** `packages/pi-course/test/11-context-compaction.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 11`

**练习目录：** `npm run practice -w @pi/course -- 11`

**聚焦运行：** `npm run build -w @pi/course`，然后运行
`node --test packages/pi-course/dist/test/11-*.test.js`。

**通过证据：** 14 项测试按 `3/3 → 3/3 → 3/3 → 2/2 → 3/3` 检查摘要记录、完整
交互、预算投影、纯创建和重复恢复。

第一次尝试先不看 target diff。卡住时，让陪练只画当前 Lab 的数据流。不要在写分组时讨论摘要，也不要在写摘要时
引入真实模型。
:::

## 先建立全景

先分清历史和上下文。

一次请求的数据流是：

```text
SessionEntry 全集
  → pathTo(entries, leafId)
  → active path                       历史层在这里结束
  → 最新 compaction + 保留后缀
  → 完整 interaction 分组
  → system / output / margin 预算
  → BuildContextResult                本轮模型输入
```

Session Store 拥有写入权。`buildContext()` 只有读取权；它不选择 leaf，也不把结果写回
session。相同历史可以针对不同模型窗口生成不同上下文，只要过程确定且来源可追踪，
这并不表示历史互相矛盾。

调试时也按这条边界排查：

1. 事实不在 active path：检查写入或分支选择；
2. 事实在 active path、没有进入结果：检查 compaction 或预算；
3. 事实已经进入结果、模型仍答错：再检查模型行为。

:::predict title="预算只够三条消息时，能不能直接取尾部"
最后五条消息是 user、assistant(call c1)、toolResult(c1)、assistant(done)，再加上一条
更早的 assistant。若预算只够三条，直接 `slice(-3)` 会得到什么？它还能作为合法模型
上下文吗？
---answer
它会从 toolResult 开始，模型看不到声明 c1 的 assistant，也不知道这条结果回答了哪次
调用。预算选择必须先把 user 开始的完整 interaction 组成一组，再整组保留或整组
丢弃；如果最新一组单独就超限，也要完整返回并报告 `single_group_overflow`。
:::

## 第一步：让摘要成为可持久化事实

课程只保留一套结构化摘要：

```ts
interface CompactionSummary {
  goal: string;
  constraints: string[];
  completed: string[];
  decisions: string[];
  changedFiles: string[];
  unresolved: string[];
  next: string[];
}

interface CompactionSessionEntry {
  id: string;
  parentId: string;
  timestamp: number;
  type: "compaction";
  summary: CompactionSummary;
  firstKeptEntryId: string;
  tokensBefore: number;
}
```

每个字段都有单一含义。`firstKeptEntryId` 指向摘要之后仍要原样保留的第一个
interaction；`tokensBefore` 记录创建摘要时的估算规模，用于诊断，不参与树结构。

compaction 必须有 parent，因为它总结的是一条已经存在的活动路径。`tokensBefore`
必须是非负有限数。七个摘要字段全部必填；不要接受旧版 `files`、`nextSteps`、
`invariants`，也不要保留两套 schema 再相互转换。

`parseSessionEntry()` 继续承担外部数据边界。实现顺序如下：

1. 增加严格的 `summaryAt()`，拒绝缺字段、多余字段和非字符串数组；
2. 在 entry 判别分支中加入 `type === "compaction"`；
3. 复用第 10 章的非空字符串、有限数和普通 JSON 对象检查；
4. 返回新对象，不与输入 summary 数组共享引用。

两种 Store 不需要新增特殊逻辑。它们都通过 `parseSessionEntry()` 取得快照，所以 union
和解析器正确后，内存与 JSONL 自然能够保存新记录。

:::lab title="实践 11.1 · 持久化一条严格的 compaction 记录"
**目标：** 让摘要使用唯一 schema，并能跨 JSONL 重开。

**文件：** `packages/pi-course/src/session.ts`

**动作：**
1. 加入 `CompactionSummary`、`CompactionSessionEntry` 和 union 分支。
2. 逐字段收窄七项摘要内容。
3. 要求非空 `parentId`、非空 `firstKeptEntryId` 和非负有限 `tokensBefore`。
4. 拒绝缺字段、多余字段、旧字段和错误数组成员。
5. 验证解析结果与输入不共享 summary 数组。
6. 删除 Lab 11.1 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 11.1" \
  packages/pi-course/dist/test/11-*.test.js
```

**预期：** `3/3`。第三项会把记录依次写入内存和 JSONL Store，再重新打开文件；不是
只检查 TypeScript 类型。
:::

## 第二步：预算不能拆开一次完整交互

按“最后 N 条消息”裁剪会留下孤立工具结果：

```text
user(u)
assistant(call c1, call c2)
toolResult(c2)             完成顺序可以反过来
toolResult(c1)
assistant(done)
```

这五条属于同一个 interaction。判断依据不是数组相邻，而是：

- user 开始新组；
- assistant 中的每个 tool call id 在本组唯一；
- toolResult 用 `toolCallId` 找到本组内的 call；
- 到下一个 user 或路径结束时，每个 call 都有且只有一个 result。

因此要拒绝四类损坏：第一个 user 之前出现消息、孤立 result、重复 call/result、缺失
result。错误必须带上相关 entry 或 `callId`，否则预算层只会在更晚的位置报出难懂
错误。

`groupInteractions()` 返回记录副本，而不是直接引用输入。后面的预算选择和测试故障
注入都不能改写 session 历史。

:::lab title="实践 11.2 · 用 callId 组成完整 interaction"
**目标：** 得到预算可以安全保留或丢弃的最小单位。

**文件：** `packages/pi-course/src/context.ts`

**动作：**
1. user 消息开始一个新组；结束上一组前先验证工具配对。
2. 收集 assistant 中的 tool call id。
3. 用 `toolCallId` 配对结果，允许结果记录反序出现。
4. 拒绝 user 前消息、orphan、duplicate 和 missing tool fact。
5. 返回深副本。
6. 删除 Lab 11.2 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 11.2" \
  packages/pi-course/dist/test/11-*.test.js
```

**预期：** `3/3`。一项覆盖普通分组，一项证明反序 result 仍按 id 配对，另一项集中
检查损坏输入。
:::

## 第三步：先扣固定成本，再选择最近的完整组

本章不假装实现某家模型的精确 tokenizer。调用者注入同一个
`estimateTokens(value)`，测试用确定性数字固定选择结果。预算公式是：

```text
messages 可用额度
  = maxTokens
  - system prompt
  - reservedOutput
  - safetyMargin
```

`reservedOutput` 给本轮回答留空间，`safetyMargin` 吸收估算误差。三者都必须是非负
有限数，估算器返回负数或非有限数也要拒绝。

选择算法从最新 interaction 向前累加：

```text
先完整保留最新组
  → 它单独超限：仍完整返回，reason=single_group_overflow
  → 没超限：继续尝试加入前一组
  → 下一组放不下：停在组边界，reason=trimmed
  → 全部放下：reason=within_budget
```

单组超限时不能从中间切开工具往返。显式返回 overflow，让上层决定是否生成摘要、压缩
超大工具结果或换模型。

结果必须同时返回 `systemPrompt` 和 `messages`。system prompt 既然计入预算，就不能
只用于统计后丢掉；第 12、13 章会把这份完整投影直接交给模型。

:::lab title="实践 11.3 · 在完整组边界选择预算后缀"
**目标：** 让每项固定成本可见，并且任何结果都保持工具协议完整。

**文件：** `packages/pi-course/src/context.ts`

**动作：**
1. 检查 max、输出预留、安全余量和估算值。
2. 计算 system 成本和 messages 可用额度。
3. 调用 `groupInteractions()`，从最新组向前累加。
4. 单个最新组超限时完整保留并返回 `single_group_overflow`。
5. 返回 `systemPrompt`、消息深副本、保留的 entry id、原因和分项 token。
6. 不修改 active path 或估算器收到的消息对象。
7. 删除 Lab 11.3 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 11.3" \
  packages/pi-course/dist/test/11-*.test.js
```

**预期：** `3/3`。三项分别检查固定成本、单组超限和多组边界。
:::

## 第四步：创建摘要记录，不替调用者写入

`createCompactionEntry(activePath, input)` 只做一件事：返回一条经过验证、可以交给
Store 的新记录。

```text
activePath 最后一条 id
  → 新 compaction.parentId

input.firstKeptEntryId
  → 必须是 activePath 中某个 interaction 的第一条 user message
```

函数不能接受组内的 assistant 或 toolResult 作为切点。它也不调用 Store：
`SessionStore.append()` 是唯一写入者，上层可以先展示摘要、请求确认或记录审计，再决定
是否追加。

创建过程可以复用已经写好的边界：

1. 用 `groupInteractions()` 找出所有合法组首；
2. 用 active path 最后一项推导 parent，不让调用者另传一份可能冲突的 parent；
3. 构造候选 compaction；
4. 交给 `parseSessionEntry()` 完成严格校验与深复制。

:::lab title="实践 11.4 · 纯函数创建 compaction entry"
**目标：** 让摘要记录只有一个 parent 来源，并且切点一定安全。

**文件：** `packages/pi-course/src/context.ts`

**动作：**
1. 拒绝空路径和重复 id。
2. 从路径末尾推导 `parentId`。
3. 只接受 interaction 首条 message 作为 `firstKeptEntryId`。
4. 用 parser 校验 summary、timestamp 和 tokens。
5. 证明输入路径、input 与返回值不共享可变引用。
6. 删除 Lab 11.4 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 11.4" \
  packages/pi-course/dist/test/11-*.test.js
```

**预期：** `2/2`。一项检查 parent 与所有权，另一项集中撞击不安全切点。
:::

## 第五步：恢复时只认活动路径上的最新摘要

追加 compaction 后，旧消息仍在历史中：

```text
u1 → a1 → u2 → a2 → cmp1 → u3 → a3
                 ↑
          firstKeptEntryId=u2
```

构建上下文时：

1. 从 active path 末尾向前找到最新 compaction；
2. 把它的结构化 summary 转成格式固定的 synthetic user message；
3. 从 `firstKeptEntryId` 开始收集原消息，跳过 metadata 和 compaction 记录；
4. 再按 interaction 分组和预算选择；
5. 返回摘要消息加选中的完整后缀。

如果路径还有更早的 compaction，只使用最新一条。最新摘要已经承担了接续更早事实的
责任；同时塞入多份摘要会重复甚至冲突。

重复调用 `buildContext()` 必须得到深相等结果。修改第一次返回的摘要或工具参数，
不能影响第二次构建。再次压缩也只会创建新的 compaction entry，旧摘要和原消息仍留在
session。

:::lab title="实践 11.5 · 用最新摘要恢复并再次压缩"
**目标：** 让重启、重复构建和第二次压缩得到同一套确定规则。

**文件：** `packages/pi-course/src/context.ts`

**动作：**
1. 查找活动路径上最新的 compaction。
2. 验证 `firstKeptEntryId` 位于该 compaction 之前，且是 interaction 起点。
3. 用固定字段顺序生成 synthetic user message。
4. 从 first kept 收集消息，随后复用 Lab 11.2、11.3。
5. 忽略更早摘要与 metadata。
6. 证明重复构建和返回副本隔离。
7. 用恢复后的路径再创建一条 compaction，确认预算仍只截完整组。
8. 删除 Lab 11.5 的显式异常，运行本段与全章测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 11.5" \
  packages/pi-course/dist/test/11-*.test.js
node --test packages/pi-course/dist/test/11-*.test.js
```

**预期：** 本段 `3/3`，全章 `14/14`。
:::

## 故意把它弄坏

临时把 Lab 11.3 的组选择替换成按消息数量取尾部，例如
`messages.slice(-3)`。

:::failure title="让上下文从孤立 toolResult 开始"
只运行 Lab 11.3。多工具 fixture 会让结果从某个 toolResult 或 assistant 终态开始，
它对应的 user 和 tool call 已经被切掉。测试应在 context 层直接失败，而不是等
provider 报错。

恢复“先分组，再在组边界选择”后，Lab 11.3 回到 `3/3`，全章回到 `14/14`。
:::

## 本章没有证明什么

14 项测试没有规定：

- 某家 provider tokenizer 的精确计数；
- tool schema、图片、缓存或网络层的额外 token 成本；
- 真实模型怎样生成高质量摘要；
- 摘要是否完整保留了所有业务事实；
- 单个超大 interaction 应该压缩工具输出、换模型还是停止；
- 何时自动触发 compaction；
- Store 是否应该自动写入 `createCompactionEntry()` 的结果；
- 多个并发压缩任务如何协调。

课程使用结构化摘要和确定性格式，是为了测试恢复规则，不是宣称摘要质量已经解决。

:::pi title="与上游 Pi 的固定提交对照"
固定提交 `8479bd8` 的 coding-agent 也把 compaction 追加到 session，并保存
`firstKeptEntryId` 与 `tokensBefore`；重建时使用活动路径上最新的摘要和保留后缀。

该固定提交的产品摘要主体是字符串，课程则使用七字段结构化对象。这是为了让学习者能
分别验证目标、约束、文件和下一步，不是对上游格式的逐行复刻。上游还包含自动触发、
模型摘要和更复杂的超限策略，本章没有声称实现这些能力。
:::

## 本章验收

:::checkpoint title="Checkpoint 11 · 有限窗口下仍不改写历史"
在隔离目录运行 build 与 14 项测试，并向陪练展示：

1. JSONL 重开后 compaction 的七个字段、first kept 和 tokens 均保持；
2. 两个工具结果反序出现时，仍由 call id 组成一个完整 interaction；
3. system、输出预留和安全余量先扣除，裁剪只发生在组边界；
4. 单组超限时完整返回并给出明确 reason；
5. 追加摘要前后，旧 session entries 完全不变；
6. 恢复只使用最新摘要，重复构建结果深相等。

最后指出 `systemPrompt` 与 `messages` 如何一起进入下一章的唯一上下文入口。做到这些，
本章通过。
:::

## 可选迁移练习

:::transfer title="陪练迁移 · 为单个超大 interaction 制定策略"
不要先写实现。让旁边的 Agent 只帮你列出行为测试：完整保留 call/result、原 session
不变、来源 id 可追踪、摘要失败可诊断。然后任选一种策略：缩短超大工具结果，或生成
该 interaction 的专用摘要。

比较策略前后的事实损失，并明确至少一项无法从摘要恢复的信息。不要把这个可选策略
塞回本章的 `buildContext()` 主路径。
:::

## 小结

Session 保存不可改写的事实，context 是每次请求前重新计算的临时视图。先用
`callId` 把消息组成完整 interaction，再扣除 system、输出预留和安全余量，从最近的
完整组向前选择。

Compaction 是一条新历史记录，不是删除动作。它保存结构化摘要、first kept 和创建时
规模；恢复只使用活动路径上的最新摘要，再接保留后缀。下一章会把项目资源和受信扩展
生成的提示接入同一个 `systemPrompt`，而不会创建第二套 context builder。
