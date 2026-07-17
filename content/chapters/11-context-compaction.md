---
id: "11"
slug: context-compaction
part: state
partTitle: 第三部 · 让 Harness 可靠
chapter: "11"
title: History 是事实，Context 是投影
summary: 从追加式会话树派生有预算的模型视图，并用追加摘要而非删除历史完成压缩。
minutes: 120
difficulty: 核心
artifact: packages/pi-course/src/context.ts
prerequisites: 03,10
terms: history, context projection, token budget, safe cut point, compaction
upstream: packages/coding-agent/src/core/compaction/compaction.ts
---

# History 是事实，Context 是投影

## 你将得到什么

进入本章时，你的 Pi 已经把消息写成带 `id`、`parentId` 的追加式会话树，能够恢复和分支；缺口是：模型窗口有限，而会话事实会持续增长。若直接把“省 token”实现成删除旧 entry，你会同时破坏审计、分支和恢复。

本章只增加一种复杂性：**从不变的 history 派生可替换的 context**。你将新增 `workshop/src/context.ts`，并在 `workshop/src/session.ts` 的 tagged union 中加入 `CompactionEntry`，得到 `buildContext(activePath, options)` 与 `compact(entries, input)`。这里的 `activePath` 由第 10 章的 `pathTo` 选出，context builder 不拥有“当前 leaf”。完成后可以观察到 history 条目只增不减，而模型收到的 messages 会因预算和最新 compaction entry 改变。

不能破坏的不变量是：

> History 记录发生过什么；context 只回答本次模型需要看到什么。Compaction 改变投影，不改写过去。

先运行 `git status --short`，把第 10 章验收状态提交为自己的 checkpoint。要回到本章起点，用该提交恢复 `workshop/src/context.ts`、`workshop/src/session.ts` 与对应测试；不要用本章结束状态覆盖第 10 章的会话实现。

:::rebuild title="Checkpoint 11 · 先保持一个 interaction 不被切开"
**模式：** 重建。从 10 的 target 开始，history 保持不变，只派生 context。

**起终点：** parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。

**教学文件：** `packages/pi-course/src/context.ts`

**第一步：** 先不看 target diff，先实现 `groupInteractions`，用 `toolCallId` 把 assistant call 与可能逆序完成的 results 组成不可分割组；分组通过后再加入预算和 compaction。

**聚焦测试：** `packages/pi-course/test/11-context-compaction.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 11`

**练习目录：** `npm run practice -w @pi/course -- 11`

**聚焦运行：** `npm run build -w @pi/course`，然后 `node --test packages/pi-course/dist/test/11-*.test.js`

**通过证据：** safe cut、单组超限、结果逆序、摘要追加与 context 重建测试通过；history 条目数只增不减。

第一次尝试禁止查看完整答案；若预算算法卡住，先让陪练只检查分组是否正确，暂时不要讨论 token 估算。
:::

## 先建立全景

一次请求实际经过两个不同的数据面：

```text
SessionEntry 全集（事实）
        │ 选择当前 leaf 的祖先路径
        ▼
active path
        │ 应用最新 compaction + 保留后缀
        │ 加入本轮 system prompt
        ▼
ContextProjection（临时视图） ──→ model.stream(...)
```

Session store 拥有事实；context builder 只有读取权。System prompt、当前工具定义、项目规则和已激活 skill 也不等于历史消息：它们可能随 cwd、配置或运行模式变化，因此必须在每轮投影时组合。

这一区分还决定了调试方法。若用户说“模型忘了我们已经改过哪个文件”，先沿当前 leaf 查询原始 entry：事实不存在，是写入或分支选择问题；事实存在但没有进入 view，是投影问题；事实进入 view 后模型仍答错，才是模型行为问题。没有这三步，团队很容易靠不断加长 system prompt 掩盖 session 漏写，或为了减少 token 误删唯一可审计证据。

同一份 history 也可以产生多个合法 context。例如小窗口模型需要更早压缩，大窗口模型可以保留更多原文；只读 mode 可以暴露不同工具描述；切换到子目录后项目指令也会改变。只要投影记录来源并且可重建，这些差异不是历史不一致。反过来，任何会影响“过去发生了什么”的信息都不能只放在瞬时 view 中：关键工具结果必须先成为 entry，再参与下一轮 context。

:::predict title="删掉旧消息真的等价吗"
假设当前分支有 20 个 entry。你删除前 12 个，再保留一条摘要。模型也许仍能回答，那么恢复旧分支和审计工具执行还能正确吗？
---answer
不能。摘要是有损派生物，无法证明原工具输入、结果和顺序；旧分支还可能引用被删 entry。正确做法是保留 20 个事实，再追加第 21 个 compaction entry，仅让 context builder 隐藏被摘要的前缀。
:::

## 先做纯投影，再谈压缩

第一版 `buildContext` 不生成摘要，只做两件事：把调用者已经选好的 active path 转成 canonical message，再报告预算。分支选择仍由 Session 层的 `pathTo(entries, leafId)` 负责；否则 builder 会偷偷拥有第二份“当前 leaf”。纯函数边界让测试可以证明输入没有被修改。

不要把 `ContextProjection` 缓存成新的事实源。它可以按 history leaf、模型能力、资源版本组成 cache key 来加速，但缓存失效后必须能从原始输入重新得到等价结果。尤其不能在 projection 上直接追加下一轮消息，再稍后“同步回”session；这会制造两个拥有写权的 transcript。

```ts
const activePath = pathTo(entries, "e8");
const before = structuredClone(activePath);
const view = buildContext(activePath, {
  systemPrompt: "You are a coding agent.",
  tokenBudget: 600,
});

assert.deepEqual(activePath, before);
console.log(view.messages.map((m) => m.role));
console.log(view.usage);
```

稳定输出模式应类似：

```text
[ "user", "assistant", "toolResult", "assistant" ]
{ system: 6, messages: 91, total: 97, budget: 600, overflow: false }
```

这里的 token 数是保守估计，不是假装与某家 tokenizer 完全一致。真正需要保证的是：分项可见、同一输入结果确定、给输出预留空间。课程版只统计 system 与 messages；生产系统还应把 tool schema 等固定开销纳入报告。

:::mechanism title="预算是一项准入检查"
设模型窗口为 `W`，预留输出为 `R`，安全余量为 `M`，那么输入预算最多为 `W - R - M`。不要先把窗口塞满再等 provider 报错；应在请求前计算并把首次超限归因到 context 层。
:::

:::lab title="实践 11.1 · 建立只读 ContextProjection"
**目标：** 让同一组 entry 产生确定、可解释且不修改输入的模型视图。

**文件：** `workshop/src/context.ts`、`workshop/test/context-resources.test.ts`

**动作：**
1. 定义 `ContextProjection`，至少包含 `systemPrompt`、`messages`、分项 `usage`。
2. 在调用处用第 10 章的 `pathTo` 选择 leaf；builder 只转换 `message` 和可进入 context 的 summary entry。
3. 注入字符近似 estimator；为输出和安全余量预留预算。
4. 测试分支选择、空 history、确定输出与输入深冻结。

**运行：** `npm run workshop:test -- context`

**预期：** 同一 fixture 连续构建两次结果深相等；SessionEntry 的数量、父子关系和内容均不变。
:::

## 安全裁剪单位是语义组

超限后不能简单取最后 N 条。一个 assistant message 可能声明两个 tool call：完成事件可以先报 c2 再报 c1，但第 07 章会按 call 源顺序把 c1、c2 的结果写入 canonical history。无论哪种顺序，若视图以孤立的 `toolResult` 开头，provider 都无法看到它回答哪次调用。课程版先把路径分成 interaction group，再只在组与组之间选择 cut point。

```text
g1: user(u1) → assistant(a1:text)
g2: user(u2) → assistant(a2:call c1,c2)
  end events: c2 → c1
  history:    toolResult(c1) → toolResult(c2)
             → assistant(a3:text)
safe cut:  ^g1 或 ^g2
unsafe cut:                         ^toolResult(c1)
```

注意三个顺序仍然不同：tool call 的声明顺序、工具完成顺序、canonical transcript 的写入顺序。分组逻辑必须依靠 `toolCallId` 配对，不能假设数组相邻就表示因果关系。

:::lab title="实践 11.2 · 找到不会拆散工具往返的 cut point"
**目标：** 在保留最近内容时，绝不留下孤立 call 或 result。

**文件：** `workshop/src/context.ts`、`workshop/test/context-resources.test.ts`

**动作：**
1. 实现 `groupInteractions(messages)`，输出完整语义组及来源 entry id。
2. 从新到旧累加估算 token，在完整组边界选择 `firstKeptEntryId`。
3. 若单个组本身超预算，返回显式 `single_group_overflow`，不要悄悄从中间切。
4. 加入多工具、失败 toolResult、连续 user message 三组 fixture。

**运行：** `npm run workshop:test -- context`

**预期：** 任意选出的后缀都能通过 call/result 配对校验；单个超大组得到可诊断失败。
:::

## Compaction 是追加状态转移

摘要不是一段“看起来通顺”的散文，而是可继续工作的状态：目标、约束、已完成工作、关键决策、改动文件、未解决问题和下一步。先用 deterministic summarizer 测协议，不让真实模型随机性污染核心测试。

```ts
type CompactionSummary = {
  goal: string;
  constraints: string[];
  completed: string[];
  decisions: string[];
  changedFiles: string[];
  unresolved: string[];
  next: string[];
};

type CompactionEntry = SessionEntryBase & {
  type: "compaction";
  summary: CompactionSummary;
  firstKeptEntryId: string;
  tokensBefore: number;
};
```

`CompactionEntry` 是历史中的新事实，所以它必须进入第 10 章的 `SessionEntry` union 并可由两种 store 追加；context builder 只负责把它渲染成 synthetic summary message。不要把 summary 直接塞进一份内存 messages 数组而不落盘，否则 resume 后无法重建同一视图。

```ts
const after = compact(entries, {
  id: "cmp-1",
  parentId: "e8",
  timestamp: "2026-01-01T00:00:00.000Z",
  firstKeptEntryId: "e6",
  summary: {
    goal: "修复解析器",
    constraints: ["不改公开消息协议"],
    completed: ["复现失败 fixture"],
    decisions: ["保留 tagged union"],
    changedFiles: ["src/parser.ts"],
    unresolved: ["检查空输入"],
    next: ["运行边界测试"],
  },
  tokensBefore: 1700,
});

console.log(entries.length, after.length);
const compactedPath = pathTo(after, "cmp-1");
console.log(buildContext(compactedPath, options).sourceEntryIds);
```

预期关系是：

```text
history: 8 → 9 entries
context: [cmp-1, e6, e7, e8]
old entries e1…e5: 仍可查询，但不发送给模型
```

重复压缩时，新摘要要接续上一摘要和上次保留的内容；每轮最多自动压缩一次，摘要非法或仍然超限时明确失败，不能递归重试到失控。

:::lab title="实践 11.3 · 追加摘要并重建有限视图"
**目标：** 让压缩成为可恢复的 history 状态转移，而不是数组裁剪。

**文件：** `workshop/src/context.ts`、`workshop/src/session.ts`、`workshop/test/context-resources.test.ts`

**动作：**
1. 把 `CompactionEntry` 加入 `SessionEntry` union，并保证 memory/JSONL store 原样追加。
2. 实现 `compact`：校验安全边界与 summary schema，返回旧 entries 加一条新 entry。
3. 让 `buildContext` 使用 active path 上最新 summary 加保留后缀；旧 entry 仍能按 id 查询。
4. 测试 resume、重复 compaction、非法 summary 和每轮最多一次自动尝试。

**运行：** `npm run workshop:test -- context`

**预期：** history 增加一条而 context 缩短；重启后投影一致；非法摘要不改变 history。
:::

:::pi title="Pi 8479bd84743e 的两条实现线"
当前产品主路径由 coding-agent 的 `SessionManager` 沿活动分支构造 context，追加 `CompactionEntry{summary, firstKeptEntryId, tokensBefore}`；旧 entry 仍留在 JSONL 中。`packages/agent/src/harness/` 也有通用 session/compaction 实现和 `AgentHarness`，它是并存的演进方向，不能写成 coding-agent 已迁移完成。课程保留同一不变量，但用结构化 deterministic summary 和单组超限错误缩小机制；这属于教学实现，不是逐行复刻。
:::

## 故意把它弄坏

:::failure title="失败注入 · 从 toolResult 中间截断"
把安全分组暂时替换成 `messages.slice(-3)`，让 fixture 的第一条保留消息成为 `toolResult(c2)`。

```text
expected: context begins at user(u2), calls c1/c2 are both visible
observed: context begins at toolResult(c2)
first divergence: context.selectCutPoint
violated invariant: 每个 toolResult 必须能在当前视图中找到同 id 的 toolCall
```

不要在 provider adapter 外层加 catch 来“修复”它。最小下一信号是打印 `sourceEntryIds` 和未配对的 `toolCallId`；修复位置是 cut point，而不是模型、session 或工具。
:::

## 本章验收

```bash
npm run workshop:test -- context
npm run workshop:test -- session
```

验收不仅是绿灯。你还应能展示：压缩前后的 history JSON 完全保留旧 entry；context 从摘要加保留后缀重建；故障输出能指出第一个协议偏差。

:::checkpoint title="Checkpoint 11 · 有限窗口下仍不改写过去"
**完成状态：** `workshop/src/context.ts` 能构建分项预算、选择安全边界、追加 compaction 并重建视图；`session.ts` 能持久化该 entry。

**观察证据：** history 数量增加一，context 数量减少；旧分支和旧工具结果仍可由 id 查询。

**恢复：** 用本章开始前记录的提交恢复 `workshop/src/context.ts`、`workshop/src/session.ts` 与 `workshop/test/context-resources.test.ts`，再运行 `npm run workshop:test -- session`，应回到“会话可恢复但尚无预算投影”的状态。
:::

## 可选迁移练习

:::transfer title="无现成答案 · 为单个超大 interaction 设计策略"
不修改 history，设计并实现一种 `single_group_overflow` 处理：可以压缩超大工具输出，也可以生成 turn-prefix summary，但必须保留 call/result 配对和来源 id。只给自己写行为测试，不复制 Pi 的 split-turn 实现。比较压缩前后关键事实召回，并记录至少一个摘要丢失的信息。
:::

隔一章后，请不看本页重新回答：为什么 summary entry 属于 history，而由它生成的 synthetic message 只属于 context？能从所有权解释清楚，才算掌握，而不只是测试通过。

## 小结

- History 是追加式事实树；context 是按 leaf、运行资源与预算重建的临时视图。
- 预算要在 provider 请求前分项测量，并为输出留空间。
- Cut point 必须尊重完整 interaction，尤其是 tool call/result 配对。
- Compaction 追加可追溯摘要并重建 context，绝不删除旧历史。
- 当前 Pi 的生产 `AgentSession + SessionManager` 与通用 `AgentHarness` 实现并存；课程对齐行为边界，不假装架构已经统一。
