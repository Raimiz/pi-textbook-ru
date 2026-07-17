---
id: "14"
slug: eval-capstone
part: product
partTitle: 第四部 · 从核心到产品
chapter: "14"
title: 用故障矩阵证明你造出了 Pi
summary: 用确定性黑盒评测、跨层故障归因和无 starter 终局任务证明系统在失败时仍守住不变量。
minutes: 180
difficulty: 综合
artifact: workshop/src/eval.ts
prerequisites: 04,07,08,10,11,12,13
terms: deterministic eval, fault injection, first divergence, protocol violation, capstone
upstream: packages/agent/test/agent-loop.test.ts,packages/coding-agent/test/agent-session-compaction.test.ts
---

# 用故障矩阵证明你造出了 Pi

## 你将得到什么

进入本章时，你的 Pi 能完成一次 coding task，也能恢复、压缩、扩展并从多种入口运行。最后的缺口是证据：一次成功演示无法说明截断参数、工具异常、取消、损坏会话或恶意扩展出现时，系统仍知道发生了什么。

本章不再增加 Agent 核心抽象，只增加一种复杂性：**可重复的系统级评测与故障归因**。你将修改 `workshop/src/eval.ts`，用 ScriptedModel、临时 workspace 和结构化 assertions 批量运行任务；随后从空白文件完成无 starter capstone。

不能破坏的不变量是：

> 每个失败必须归属到首次偏离契约的那一层；评测不能用一个 `agent_failed` 抹平 provider、protocol、tool、session、context 与 product 的差异。

先保存第 13 章 checkpoint。恢复本章起点时，恢复 `workshop/src/eval.ts` 与 eval fixtures 即可；被评系统不应为了让评测通过而获得测试专用分支。

## 先建立全景

一个完整 eval case 有五段生命周期：

```text
fresh temp workspace
  → arrange fixture files + ScriptedModel
  → createRuntime(与产品相同的 composition root)
  → run prompt and collect transcript/events/files
  → assert task outcome + protocol + resources + failure owner
```

评测至少分三类结果：

- **任务结果**：目标文件是否正确、测试是否通过；
- **协议结果**：call/result 是否配对、终态是否合法、history 是否追加；
- **基础设施结果**：fixture、runner 或环境是否坏了。

若 setup 自己失败，却被计为 Agent 不会修代码，指标没有意义。反过来，文件碰巧正确也不能掩盖孤立 toolResult 或被执行的截断参数。

可重复不等于“把所有变量写死”。它要求把影响结果的变量显式记录：教材 commit、Node 与 lockfile、fixture 版本、ScriptedModel 脚本、初始文件和策略配置。报告不应记录临时绝对路径和真实时间；需要比较时使用 case-relative path、固定 id 和逻辑序号。这样一次回归才能回答“哪项输入变化导致哪项行为变化”。

:::predict title="五个已知 fixture 全绿就是掌握吗"
同一组 ScriptedModel 响应和断言连续运行十次都通过，能否证明你已经理解 Agent 架构？
---answer
只能证明当前实现对已知轨迹可重复。掌握还需要在延迟后、不看答案，面对新 workspace 和未见故障仍能定位首次偏差并守住相同不变量。最终 capstone 因而不会提供实现 starter。
:::

## Eval case 是可执行规格

Runner 不应依赖真实 API。脚本模型给出确定事件，临时目录隔离文件副作用，时钟和 id 也由 fixture 固定：

```ts
export interface EvalCase {
  id: string;
  prompt: string;
  files: Record<string, string>;
  script: ScriptStep[][];
  assert(result: EvalResult): void;
}

export interface EvalResult {
  status: "passed" | "task_failed" | "protocol_failed" | "infra_failed";
  transcript: AgentMessage[];
  events: AgentEvent[];
  files: Record<string, string>;
  metrics: { turns: number; toolCalls: number };
  failure?: { layer: string; firstDivergence: string };
}
```

`runEvalCase` 每次创建新 temp root，调用第 13 章同一个 `createRuntime`，最后在 `finally` 释放子进程和目录。一个 case 失败不能阻止后续 case；runner 汇总结果后再决定总体 exit code。

第一组任务应覆盖：纯文本回答、读取、精确编辑、执行测试、工具失败后恢复。断言写行为，而不是依赖随机 id、绝对路径、耗时或模型措辞。

除了固定样例，再加入不改变语义的变形检查：交换两个独立工具的完成延迟，canonical transcript 仍按 call 顺序；改变 temp root，报告仍使用相对路径；把无关日志写入 stderr，JSON stdout 仍逐行可解析。此类关系比单个 golden 字符串更能发现所有权或顺序被意外耦合。

:::mechanism title="先锁协议，再看任务分数"
建议断言顺序为：事件终态 → 消息结构 → call/result 配对 → history 单调追加 → 文件结果。这样当最终文件不对时，你先知道基础协议是否可信，不会把多层错误压成一条红灯。
:::

:::lab title="实践 14.1 · 建立确定性黑盒 Eval Harness"
**目标：** 批量运行五类离线任务，并输出结构化、可重复报告。

**文件：** `workshop/src/eval.ts`、`workshop/test/composition-eval.test.ts`

**动作：**
1. 定义 `EvalCase/EvalResult`，每个 case 使用独立 temp workspace。
2. 通过 ScriptedModel 和 composition root 运行，不复制 Agent loop。
3. 分别断言终态、transcript、tool 配对、文件和 turns/toolCalls。
4. 隔离 case 异常并继续运行，最终按分类汇总。

**运行：** `npm run workshop:test -- eval`

**预期：** 相同 commit 重跑报告深相等；一个故意失败 case 不影响其余 case；报告不含临时绝对路径。
:::

## 故障矩阵必须覆盖层间传播

Happy path 只证明各层在合作。故障注入则检查边界能否阻止错误伪装成成功：

| 注入点 | 预期归属 | 必须观察到 | 绝不能发生 |
|---|---|---|---|
| tool arguments 增量后 `stopReason=length` | model/protocol | assistant 以 length 结束 | 执行半截参数 |
| provider 发出 error 终态 | model | 最终 AssistantMessage 为 error | `result()` 随机 reject |
| tool execute 抛异常 | tool | 同 callId 的 error toolResult | 孤立 tool call |
| bash 收到 abort | tool/agent | aborted 终态并清理进程 | 悬挂子进程 |
| JSONL 尾行损坏 | session | 明确恢复策略与诊断 | 改写既有有效 entry |
| summary schema 非法 | context | 压缩失败、history 不变 | 无限压缩重试 |
| 未信任 extension | resources | import 次数为零 | 顶层代码执行 |
| JSON stdout 混入日志 | product | wire parser 精确报错 | 静默丢行 |

模型 error 与 aborted 都是流内终态；课程 EventStream 的 `result()` resolve 最终 AssistantMessage，而不是把它们变成外层随机 reject。`finish_reason=length` 则意味着 tool arguments 可能不完整，即使当前 JSON 恰好能 parse，也禁止执行。

```json
{"case":"truncated-tool-call","status":"passed","owner":"model/protocol","toolCallsExecuted":0}
{"case":"tool-throws","status":"passed","owner":"tool","pairedResult":true}
{"case":"bad-summary","status":"passed","owner":"context","historyDelta":0,"retryCount":1}
```

这些字段是证据，不是漂亮仪表盘。每条失败记录都要包含 observed、expected、first divergence、violated invariant 和 next smallest signal。

总成功率也不能替代逐类分布。十个纯文本题全过、一个工具协议题失败，显示为 91% 会掩盖系统性风险。报告应先按能力和失败层分组，再展示 turns、tool calls 或估算成本；这些效率指标只有在任务与协议都正确之后才有解释价值。

:::lab title="实践 14.2 · 把八类故障变成矩阵"
**目标：** 证明故障被正确归属、持久化和隔离。

**文件：** `workshop/src/eval.ts`、`workshop/test/composition-eval.test.ts`

**动作：**
1. 为表中八项分别提供可控注入器，不使用真实网络和随机 timeout。
2. 捕获首次偏差层，而非只捕获最后抛出的异常。
3. 检查失败后的 session、活跃进程、extension import spy 和 stdout。
4. 生成结构化 matrix；若发现缺陷，只在拥有该不变量的层修复。

**运行：** `npm run workshop:test -- eval`

**预期：** 八项都有唯一 owner；无悬挂进程、无孤立 result、无 history 删除、无未信任代码执行。
:::

:::pi title="与 Pi 8479bd84743e 的关系"
当前上游在 `packages/agent/test/` 和 `packages/coding-agent/test/` 对 loop、Agent、AgentSession、compaction、extensions、print/RPC 等有大量专项测试；生产路径仍是 `Agent + AgentSession + SessionManager`，通用 `AgentHarness` 测试是并存方向。本章统一的 `workshop/src/eval.ts`、ScriptedModel 任务集、failure owner 和 capstone 评分是**课程增强**，不是声称上游存在同名 benchmark 或已经迁移到 AgentHarness。
:::

## 故意把它弄坏

:::failure title="失败注入 · catch-all 抹掉根因"
在 runner 最外层把所有异常转换成 `{status:"task_failed"}`，再运行“fixture 路径不存在”和“tool 抛错”两个 case。

```text
expected: infra_failed/setup 与 protocol-safe tool failure
observed: task_failed 与 task_failed
first divergence: eval error classification
violated invariant: 失败必须归属到首次偏离契约的层
next signal: 记录 phase、event tail、cause chain，不先记录最终文件
```

修复分类器和 phase 边界，而不是根据错误字符串猜类别。随后确认正常 tool 异常仍通过配对的 error toolResult 表达，而不是泄漏为 runner 基础设施错误。
:::

## 本章验收

```bash
npm run workshop:test -- eval
npm run workshop:test
npm run typecheck
```

完整验收还包括：同一 suite 连跑两次结果一致；所有 temp workspace 隔离；失败 case 不阻塞后续；JSON 报告不含 secret、绝对路径和随机时间；被评核心没有 `if (process.env.EVAL)` 一类后门。

:::checkpoint title="Checkpoint 14 · 每条核心不变量都有反证实验"
**完成状态：** Eval Harness 能运行离线任务、分类故障、生成稳定矩阵，并在失败后清理资源。

**观察证据：** 八项故障各有 owner 与首次偏差；截断参数执行数为零；tool error 有配对 result；compaction 失败时 historyDelta 为零。

**恢复：** 从第 13 章 checkpoint 恢复 `workshop/src/eval.ts`、eval tests 和 fixtures。恢复后产品仍能运行，但失去系统级回归证据。
:::

## 可选迁移练习

:::transfer title="最终 Capstone · 无 starter 的跨层事故实验室"
现在关闭本章正文，在空白的 `workshop/capstone/` 下自行创建 `incident.ts`、`incident.test.ts` 和 `report.md`；教材不提供 starter、函数签名或半成品。

**任务：** 用你已经完成的公共模块构造一次离线 coding run：用户要求修复临时项目中的错误函数；ScriptedModel 必须经历 read → edit → bash test → final text；运行中追加 session，触发一次 compaction，并从 JSON mode 输出可重放事件。

**未知故障变体：** 由测试顺序随机之外的显式参数选择，至少包含截断 tool call、tool 抛错、bash abort、损坏 JSONL 尾行、非法 summary、未信任 extension、stdout 污染。不得为每个故障复制一套 runtime。

**交付证据：**
1. clean case 的最终文件、测试、canonical transcript、history 与 wire trace；
2. 每项事故的 observed/expected、first divergence、violated invariant、最小修复层；
3. 证明 compaction 前事实仍可查询，extension 拒绝时 import 为零；
4. 一条你最初误判、随后用事件或 entry 证据纠正的根因。

**硬性验收：** 所有 case 完全离线；没有孤立 toolResult、执行半截参数、悬挂进程、删除 history、泄漏 secret 或污染 JSONL；`agent-loop.ts` 不出现 mode/eval 分支。最后请另一人只看报告任选一个事故，你应能沿 event → message → entry → wire trace 解释因果链。
:::

Capstone 通过仍不是终点。七天后换一个新 fixture，不看本书重建其中两项故障；能迁移不变量和诊断方法，才是“造出了自己的 Pi”。

## 小结

- 确定性 eval 同时检查任务结果、协议完整性和基础设施，而不是只算成功率。
- ScriptedModel、临时 workspace 与同一个 composition root 让系统测试可重复。
- 故障矩阵的核心产物是首次偏差和不变量归属。
- 模型 error/aborted 是流内终态；length 截断的 tool arguments 永不执行。
- 课程 Eval Harness 与无 starter capstone 是教学增强；最终证明来自跨层失败证据，而不是一次 happy-path 演示。
