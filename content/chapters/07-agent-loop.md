---
id: "07"
slug: agent-loop
part: core
partTitle: 第二部 · 闭合 Agent 核心
chapter: "07"
title: Agent Loop 是可证明的状态机
summary: 把模型响应与工具结果闭合为可终止、可重放、顺序明确的最小 Agent Loop。
minutes: 120
difficulty: 核心
artifact: packages/pi-course/src/agent-loop.ts
prerequisites: 04,06
terms: agent loop, state machine, stop reason, transcript order, terminal state
upstream: packages/agent/src/agent-loop.ts
---

## 你将得到什么

进入本章时，`ScriptedModel` 能稳定返回消息，`executeToolCall` 也能把单个动作变成配对结果；但二者仍是两座孤岛。模型请求工具后，没有控制器把 observation 放回 context，也不会再次询问模型。

本章只增加一种主要复杂性：**循环控制**。完成后，`workshop/src/agent-loop.ts` 会把一次用户输入推进到确定终态；你能观察每次 model request、tool event、canonical transcript 和最终 stop reason。

本章不变量是：**下一次模型调用前，已有 assistant 中的每个 tool call 必须在 transcript 中拥有且仅拥有一个配对 result。** `length`、异常和并发都不能破坏它。

恢复起点时，只撤销 `workshop/src/agent-loop.ts` 及本章测试；保留第 06 章的工具执行器。先保存 `git diff -- workshop/src/agent-loop.ts workshop/test`，恢复后运行 `npm run workshop:test -- tool-contract`，应仍通过。

:::rebuild title="Checkpoint 07 · 先闭合一个无工具回合"
**模式：** 重建。从 06 的 target 开始，只增加循环控制，不重写 model 或 tool。

**起终点：** parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。

**教学文件：** `packages/pi-course/src/agent-loop.ts`

**第一步：** 先不看 target diff，先让 `runAgentLoop` 完成“请求模型 → 追加 assistant → stop”的无工具路径；测试变绿后，再加入 toolUse 分支和下一轮。

**聚焦测试：** `packages/pi-course/test/07-agent-loop.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 07`

**练习目录：** `npm run practice -w @pi/course -- 07`

**聚焦运行：** `npm run build -w @pi/course`，然后 `node --test packages/pi-course/dist/test/07-*.test.js`

**通过证据：** 无工具、工具往返、并发完成、异常、length 和 abort 路径通过；transcript 写入顺序不受工具完成顺序影响。

第一次尝试禁止查看完整答案；卡住时让陪练指出当前状态和唯一合法的下一状态，不要先给 `while` 实现。
:::

## 先建立全景

不要从 `while (true)` 开始。循环先是一张状态图，`while` 只是承载它的语法：

```text
PREPARE_CONTEXT
      │
      ▼
WAIT_MODEL ── error/aborted ───────────────▶ END
      │ assistant
      ├─ 无 toolCall ──────────────────────▶ END
      │
      ▼
CHECK_COMPLETENESS
      ├─ stopReason=length ─▶ 配对错误结果（不执行）──▶ END(length)
      └─ 完整调用 ──────────▶ EXECUTE_TOOLS
                                  │
                                  ▼
                     APPEND_RESULTS_IN_CALL_ORDER
                                  │
                                  └────────▶ WAIT_MODEL
```

这里至少有三种“顺序”，不能混为一谈：

- call 顺序：assistant content 中动作出现的顺序；
- 完成顺序：并发动作真实结束的先后；
- transcript 顺序：下一次 provider request 中结果排列的稳定顺序。

事件应忠实报告完成顺序；transcript 则按 call 顺序追加，使同一 scripted 输入得到可重放的 canonical history。

这张图还能给出一个小型归纳证明。基例是第一次请求前，输入 context 已由上一章的消息规则验证。归纳步中，模型先追加一个完整 assistant；若它没有动作，运行终止，历史仍完整；若它含动作，loop 为整批 calls 产生等量 results，并在下一次请求前按源顺序追加，所以新的 context 仍满足配对不变量。`length` 不是证明之外的特例：它也产生等量错误 results，只把“实际执行”替换成“拒绝执行”。工具内部成功、抛错或取消同样不会改变结果数量。这样我们验证的是每次迁移，而不是穷举模型可能生成的所有自然语言。

终止性则需要另一个度量：每一 step 要么结束，要么消耗一次模型预算并进入下一状态。模型可以永远要求工具，因此实现必须有 abort 与有限 `maxSteps`；达到边界时要保留已有完整 transcript，并报告“控制器停止”，不能伪造一个 assistant 的 `stop`。安全性回答“不会出现坏历史”，终止性回答“不会无界悬挂”，二者缺一不可。

:::predict title="预测一次最小工具往返"
脚本第一轮返回 `toolUse`，请求 `add(call-1)`；第二轮返回文本 `5` 和 `stop`。先写下模型调用次数、工具执行次数，以及最终新增消息的 role 顺序。
---answer
模型调用 2 次，工具执行 1 次。新增顺序是 `assistant(toolCall)` → `toolResult(call-1)` → `assistant(text)`；最初的 user message已经在输入 context 中。只断言最终文本会漏掉最重要的中间协议。
:::

## 先闭合单个动作，再推广到一批

循环只依赖前章公共边界，不进入具体工具内部：

```ts
const result = await runAgentLoop({
  model,
  tools: registry,
  context,
  signal: controller.signal,
  maxSteps: 8,
  onEvent: (event) => observed.push(event),
});
```

每次拿到 final `AssistantMessage`，先将它追加到当前运行的 transcript，再检查 `stopReason` 和 content。`error`、`aborted` 是流中正常可观察的终态消息；`EventStream.result()` 仍 resolve，而不是把 provider 失败随机变成循环外 rejection。`stop` 且没有调用时结束；存在完整调用时执行、追加结果后继续。

先追加 assistant 再处理动作并非实现习惯，而是因果记录：工具结果回答的是哪一次模型提议，必须先有提议事实。相反，streaming partial 只能作为事件展示，不能反复追加进 canonical transcript；最终消息到达时应替换临时视图，而不是留下许多半成品。

`maxSteps` 是课程加入的失控保护和评测钩子，不是宣称上游 Pi 只有这一种预算策略。步数耗尽要报告独立终态，不能伪装为模型正常回答。

:::lab title="实践 7.1 · 闭合一个 add 往返"
**目标：** 用两轮 `ScriptedModel` 完成 tool call → observation → 最终回答。

**文件：** `workshop/src/agent-loop.ts`、`workshop/test/agent-loop.test.ts`

**动作：**
1. 第一轮脚本生成 `call-1`，第二轮生成文本终止。
2. 每次模型调用都传入新的消息数组，不能原地污染调用者提供的 context。
3. 用第 06 章的 `executeToolCall` 产生 result。
4. 精确断言第二次 recorded request 的三段消息及 call id。

**运行：** `npm run workshop:test -- agent-loop`

**预期：** recorded requests 为 2，执行计数为 1；第二次请求中 call/result 相邻且 id 相同。
:::

## 截断是“不允许执行”，并发是“两种顺序”

流式 parser 可能把半截 arguments 尽力修复成一个能通过 schema 的对象。如果 assistant 最终 `stopReason` 是 `length`，就说明生成被 token 限制切断；其中所有 tool arguments 都不再可信。正确处理不是“能解析就执行”，而是**一个都不执行**，同时为每个 call 生成配对的错误 result。课程 loop 随后以 `reason: "length"` 结束；上层若选择继续，完整 transcript 已保留“请重发动作”的 observation。

```json
{"role":"assistant","provider":"scripted","model":"scripted-v1",
 "usage":{"input":0,"output":0,"totalTokens":0},"stopReason":"length",
 "content":[{"type":"toolCall","id":"c1","name":"write",
 "arguments":{"path":"a.ts","content":"export con"}}],"timestamp":0}
{"role":"toolResult","toolCallId":"c1","toolName":"write",
 "content":[{"type":"text","text":"Tool call was not executed because the model response was truncated."}],
 "details":{"skipped":true,"reason":"length"},"isError":true,"timestamp":1}
```

这条规则尤其保护 write、edit 和 bash：半截字符串依然可能是合法 JSON，却会制造真实副作用。

一批完整 calls 可以并发，但完成事件不能直接 push 进 transcript。先保留源索引，全部 settle 后按索引组装 results：

```text
calls:       c1(slow) ───────────────┐  c2(fast) ─────┐
end events:                         c2               c1
transcript: assistant[c1,c2] → result[c1] → result[c2]
```

工具抛错也只是 c1/c2 中一个 `isError: true` 的 observation；其余工具仍被回收，不能留下悬挂 promise。

Call id 在这里承担因果身份，数组位置只承担展示顺序。若工具事件为了实时性先报告 c2，UI 仍可用 id 把进度归到正确卡片；若未来某个 provider 要求不同的 result 排列，也应在 adapter 边界转换，而不是改写内部事实。把身份、完成时间和序列位置拆开，才能同时获得并发性能、确定重放与正确诊断。

因此，任何排序都必须有名称、有消费者，也有对应测试。

:::lab title="实践 7.2 · 区分完成顺序与 transcript 顺序"
**目标：** 并发执行 slow 与 fast 两个 fake tool，同时保持稳定历史。

**文件：** `workshop/src/agent-loop.ts`、`workshop/test/agent-loop.test.ts`

**动作：**
1. 为 calls 编号并一起启动，使用 `Promise.all` 保留输入索引。
2. 在每个 promise settle 时发课程 `tool_end`。
3. 全批完成后按 assistant call 顺序追加 `ToolResultMessage`。
4. 再让 slow 抛错，断言 fast 仍完成且两个 id 都有配对结果。

**运行：** `npm run workshop:test -- agent-loop`

**预期：** end event 顺序为 fast、slow；recorded request 中结果顺序仍为 slow、fast；失败场景没有 unhandled rejection。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的 `packages/agent/src/agent-loop.ts` 明确对 `length` 消息中的所有 calls 生成“未执行”的错误结果；默认可并行执行工具，`tool_execution_end` 依完成时刻发出，随后按 assistant 源顺序发出 result message。上游可把这些 skipped results 带入后续 turn，课程版则以 length 终止并把是否重试交给上层。课程用较小的 `tool_end` 事件表达同一观察点，并去掉 hooks、动态模型切换和复杂队列，但刻意保留安全与配对不变量。
:::

## 故意把它弄坏

:::failure title="删掉 length 防线"
把 `stopReason === "length"` 分支改成普通执行，然后让 scripted response 给出可解析但截断的 write call。

第一处偏差不是“模型回答不好”，而是 fake tool 的执行计数从 0 变为 1；真实系统此刻已经产生不可逆副作用。恢复防线后同时断言：执行计数为 0、每个 call 都有错误 result；显式继续运行时，模型能看到要求重发的 observation。
:::

## 本章验收

:::checkpoint title="Checkpoint 07 · 可证明的循环"
运行 `npm run workshop:test -- agent-loop`。验收矩阵至少覆盖：纯文本 stop、单工具、多工具反序完成、工具异常、length、provider error、abort 和 maxSteps。

对任一 scripted 序列，你应在运行前写出模型调用数、执行数、事件完成顺序、transcript 顺序与唯一终态。恢复时撤销本章文件，再确认 `npm run workshop:test -- tool-contract` 仍绿。
:::

## 可选迁移练习

:::transfer title="无脚手架迁移 · 第一个调用失败"
配置同一 assistant turn 的三个 calls，让第一个 schema 失败、第二个延迟成功、第三个执行抛错。不要参考本章测试，先写预期 event 与 transcript 两张序列表，再实现测试。要求三个 calls 都有且只有一个 result，且下一次 model request 仍按 1、2、3 排列。
:::

额外挑战：让模型连续请求同一 call id。决定是在消息验证层拒绝重复，还是在 loop 中形成错误 observation；无论选择哪层，都用测试固定责任边界，不要悄悄执行两次。

## 小结

Agent Loop 的核心不是无限循环，而是少数显式迁移：模型终态、工具批次、观察回填与再次决策。`length` 保护副作用边界；异常通过 result 闭合；并发完成顺序服务实时观察，稳定 transcript 顺序服务 provider 与重放。这些约束共同构成可验证的安全核心。下一章只替换动作内容：抽象 add 将变成真实 read、write、edit 和 bash，而循环本身无需重写。
