---
id: "09"
slug: stateful-agent
part: state
partTitle: 第三部 · 让 Harness 可靠
chapter: "09"
title: 从纯循环到可中断的 Stateful Agent
summary: 用一个薄的有状态 facade 管理 transcript、生命周期、取消与两种用户消息时序。
minutes: 120
difficulty: 核心
artifact: workshop/src/agent.ts
prerequisites: 07,08
terms: stateful agent, lifecycle, abort, steering, follow-up, reentrancy
upstream: packages/agent/src/agent.ts
---

## 你将得到什么

进入本章时，`runAgentLoop` 能完成一次可证明的运行，但调用者必须自己传 context、收集消息和管理 signal。关闭一次函数调用后，没有对象记住 transcript；运行途中也没有统一入口接受取消或新指令。

本章只增加一种复杂性：**跨运行的生命周期所有权**。完成后，`workshop/src/agent.ts` 的 `Agent` 会保存消息，提供 `prompt()`、`abort()`、`steer()`、`followUp()`、`subscribe()`，并拒绝同一实例上的重入。

不变量是：**有状态 Agent 只能编排既有 loop，不能复制另一套 model/tool 状态机；任何时刻至多有一个 active run 改写同一 transcript。**

恢复本章起点时，撤销 `workshop/src/agent.ts` 与本章测试；`agent-loop.ts` 和 coding tools 不动。恢复后直接运行 `npm run workshop:test -- agent-loop`，应仍能独立完成所有状态迁移。

## 先建立全景

Loop 与 Agent 的分工可以用“函数栈”和“对象堆”理解：

```text
Agent（跨运行）
  ├─ transcript
  ├─ active AbortController | undefined
  ├─ steering queue / follow-up queue
  ├─ subscribers
  └─ prompt()
       └─ runAgentLoop()（单次运行）
            ├─ model turns
            ├─ tool batches
            └─ returned messages/events
```

Loop 决定“下一步是什么”；Agent 决定“这次运行属于谁、结果保存到哪里、用户现在能发什么命令”。Provider 不拥有 transcript，CLI 也不拥有真相。这样同一个 loop 可以被测试、非交互脚本和交互式 UI 复用。

为什么这里适合对象，而上一章适合纯函数？因为 controller、订阅者和等待者都有跨越多个 await 的身份，它们需要一个明确寿命；模型决策本身却应尽量由输入 context 决定。把所有东西塞进对象，会让一次 loop 的因果链藏在可变字段里；把所有东西塞进函数，又会迫使每个 UI 重造队列与重入锁。边界正好落在“一次运行”和“多次运行”之间。

:::predict title="第二次 prompt 应该怎样处理"
第一个 prompt 正在执行 bash，此时调用者又执行 `agent.prompt("顺便改 README")`。是并行启动第二个 loop、自动当 steering，还是显式拒绝？
---answer
第一版应显式拒绝，并指导调用者选择 `steer` 或 `followUp`。静默并发会让两个 loop 同时基于旧 transcript 追加消息；静默改语义又使 API 不可预测。用户意图必须通过不同方法表达。
:::

## 事件是事实，状态是派生快照

Agent 接收 loop events，先更新自己的只读状态，再通知订阅者。事件回答“发生过什么”，状态回答“现在是什么”：

```ts
type AgentState = {
  status: "idle" | "running";
  messages: AgentMessage[];
  activeRunId?: number;
  lastReason?: AgentRunResult["reason"];
  streamingText: string;
  pendingToolCallIds: string[];
  diagnostics: string[];
};
```

课程的 `model_event.text_delta` 累积 `streamingText`，但只有 `assistant_message` 携带的完整事实才进入 transcript。`tool_start/tool_end` 维护 pending id 数组；运行终态清空临时状态，却不能清空已经完成的历史。模型 `error/aborted` 仍是 canonical AssistantMessage，便于 UI 和恢复逻辑看到同一事实。

订阅者是消费者，不应反向成为 Agent 真相。它们可以渲染、记录或持久化；取消信号仍由 active run 的 controller 所有。运行完成后 controller 作废，下一次 prompt 必须创建新 controller。

状态更新最好写成小型 reducer，并复制 messages 与 pending 数组后发布快照。这样订阅者拿到的是某一时刻的事实，而不是稍后被内核继续修改的同一引用。一个实用检查是重放同一事件数组：若两次得到不同 state，说明 reducer 偷读了时钟、全局变量或 provider，对恢复和测试都不利。

每次运行还应有单调递增的 run id。它不是 session identity，只用于区分同一 Agent 的两次生命周期；异步 UI 若晚收到上一轮事件，可以据此拒绝把它显示为当前状态。终态 cleanup 必须核对并清除对应 active run，不能让旧 promise 的 finally 意外清掉已经开始的新 controller。这类“晚到事件”测试比只跑一次成功 prompt 更能证明所有权正确。

同理，公开的 state 必须是防御性副本：外部修改返回数组或集合，绝对不能绕过事件路径篡改 Agent 内核状态。

:::lab title="实践 9.1 · 用一个 facade 管理一次运行"
**目标：** 实现 Agent 生命周期，不改写 `runAgentLoop`。

**文件：** `workshop/src/agent.ts`、`workshop/test/coding-agent.test.ts`

**动作：**
1. 构造只读 state、subscriber set 和可选 active run。
2. `prompt` 先拒绝重入，再创建 controller、追加 user message并调用 loop。
3. 逐事件更新 streaming/pending 状态，完整消息按一次且仅一次进入 history。
4. 在成功、provider error 和 abort 的 finally 中统一回到 idle。

**运行：** `npm run workshop:test -- stateful-agent`

**预期：** 运行中第二次 prompt 得到明确错误；任一终态后都可再次 prompt；Agent 内没有复制 tool 执行代码。
:::

## Abort、steering 与 follow-up 是三种不同时间语义

Abort 是立即发出的停止意图。`Agent` 创建一个 controller，其 signal 沿同一棵树传给 loop、model stream、tool context 和 bash。各层协作停止；`abort()` 可重复调用，但一个运行只产生一个终态。

Steering 与 follow-up 都不打断正在发送的 request：

```text
turn N: assistant [call c1, call c2]
        tools start ── c2 end ── c1 end
        transcript append result c1, result c2
        ├─ drain steering ─▶ user steer ─▶ turn N+1
        └─ 若原本结束：drain follow-up ─▶ 新一段工作
```

Steering 表示“当前工作还在推进，请在下一个模型决策前考虑它”，安全注入点是**当前工具批次已经全部形成配对结果之后**。Follow-up 表示“当前工作自然结束后，再发起后续请求”。两者用 FIFO 队列保存，不可把 user message 插在 assistant call 与其 tool result 之间。

两种队列也解决了不同的用户承诺。Steering 不保证撤销已发生的动作：如果 write 已完成，后来的“不要改文件”只能影响下一决策；UI 应如实显示这个边界。Follow-up 则保证当前任务先走到自己的自然停止点，但不意味着开启另一个 Agent 实例，它仍继承同一 transcript。把这些承诺写进 API 名称，比用一个含糊的 `send()` 再猜时机可靠得多。

```ts
const unsubscribe = agent.subscribe((event) => events.push(event));
agent.steer("先不要改配置文件");
agent.followUp("完成后总结测试覆盖");
agent.abort(); // 只影响当前 active run
unsubscribe();
```

:::mechanism title="控制面顺序与 transcript 顺序"
工具完成事件可按真实时间出现；steering 的消费时机却由协议边界决定。实时 UI 可以先看到 fast tool 完成，但模型下一次 request 必须先看到按 call 顺序排列的整批 results，再看到 steering。用户交互不能以破坏消息语法为代价追求“即时”。
:::

:::lab title="实践 9.2 · 固定三种控制路径"
**目标：** 用 ScriptedModel 精确验证 abort、steering 和 follow-up。

**文件：** `workshop/src/agent.ts`、`workshop/test/coding-agent.test.ts`

**动作：**
1. 在慢 model stream 与慢 bash 中分别调用 abort，断言不启动下一 turn。
2. 在双工具批次运行中 enqueue steering，检查它出现在两个 results 之后、下一 request 之前。
3. 在纯文本 stop 前 enqueue follow-up，检查当前 run 本可结束时才消费。
4. 断言两个队列各自 FIFO，终态后无悬挂 promise。

**运行：** `npm run workshop:test -- stateful-agent`

**预期：** abort 幂等且 Agent 回到 idle；steering 延续当前工作；follow-up 在原工作结束点之后开始；任何路径都没有悬空 tool call。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的 `packages/agent/src/agent.ts` 同样是低层 loop 的有状态 wrapper：保存 messages/tools，拥有 active AbortController，拒绝 prompt 重入，并以不同队列实现 steering 与 follow-up。上游还支持队列 drain 模式、动态 model/config、异步 listeners 和更多 lifecycle state；课程保留其所有权与时序语义，不复制产品级选项。
:::

## 故意把它弄坏

:::failure title="把 steering 插进 call/result 中间"
临时在收到第一个 `tool_end` 事件时立即把 steering push 到 messages。构造 assistant 同时请求 slow 与 fast 两个工具。

首次偏差应出现在第二次 recorded model request：role 顺序变成 `assistant → toolResult? → user → toolResult?`，破坏完整工具批次。恢复队列 drain 点后，顺序必须是 `assistant → result(slow) → result(fast) → user(steer)`，不受真实完成先后影响。
:::

## 本章验收

:::checkpoint title="Checkpoint 09 · 生命周期只有一个所有者"
运行 `npm run workshop:test -- stateful-agent`，检查成功、error、abort、重入、steering、follow-up 六条路径。现场打印一条“反序完成 + steering”的事件时间线和下一 request，分别解释为什么两种顺序不同。

验收标准是你能指出 controller、transcript、queues 各由谁拥有，并证明 Agent 没有另写一个 loop。恢复时撤销本章文件，前章 `npm run workshop:test -- coding-tools` 仍通过。
:::

## 可选迁移练习

:::transfer title="无脚手架迁移 · waitForIdle"
在不暴露内部 controller 的前提下实现 `waitForIdle()`：idle 时立即 resolve，running 时等待当前 prompt 的 `run_end` 与 finally cleanup 都完成。分别从成功和 abort 路径等待，证明多个等待者都只结算一次，且下一次 prompt 不会复用旧 signal。
:::

额外练习：让 subscriber 抛错，验证课程的隔离策略会把诊断追加到 `state.diagnostics`，active run 仍完成且 Agent 可再次使用；一个 renderer 不能永久锁死内核。

## 小结

Stateful Agent 不增加新的推理算法，只集中管理跨运行所有权：一个 transcript、一个 active signal 树、两种消息队列和一组事件消费者。边界清楚以后，交互功能才不会反向污染核心。重入被拒绝，abort 贯穿全链路，steering 与 follow-up 在不同安全边界消费。下一章会把这些已完成的事实追加到 session；运行状态仍是暂时的，历史则开始跨进程存在。
