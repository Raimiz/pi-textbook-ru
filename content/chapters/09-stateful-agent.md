---
id: "09"
slug: stateful-agent
part: state
partTitle: 第三部 · 让 Harness 可靠
chapter: "09"
title: 从单次循环到有状态 Agent
summary: 让一个对象持有跨运行状态，并把重入、订阅、取消、steering 与 follow-up 的时序写成可执行契约。
minutes: 210
difficulty: 核心
artifact: packages/pi-course/src/agent.ts
prerequisites: 07,08
terms: stateful agent, lifecycle, abort, steering, follow-up, reentrancy
upstream: packages/agent/src/agent.ts
---

## 你将得到什么

第 07 章的 `runAgentLoop()` 能完成一次运行。调用结束后，它不会替你保存下一次
运行需要的消息历史，也不知道界面何时发来了取消、新指令或后续任务。

本章只增加一种复杂性：**由一个 Agent 对象持有跨运行状态**。完成后，它会提供：

- `prompt()`：开始一次运行，并把结果留给下一次 `prompt()`；
- `subscribe()`：让界面或日志观察生命周期事件；
- `abort()`：向当前运行发出取消信号；
- `steer()`：让当前任务在下一次模型决策前考虑一条新指令；
- `followUp()`：在当前回答自然结束后继续一段工作。

这些方法不会重新实现模型和工具循环。`runAgentLoop()` 仍然决定一次运行如何
前进；`Agent` 负责保存跨运行状态、限制并发运行，并在规定的时机把排队消息交给
循环。

## 为什么第 09 章放在这里

有状态 Agent 不能早于 Agent Loop。否则对象里会混进模型流、工具执行和消息配对，
你无法判断错误发生在单次运行还是跨运行管理中。

它也不能放到会话持久化之后。第 10 章要保存已经完成的消息历史。如果当前运行由谁
拥有、怎样取消、队列何时取出都没有定下来，写持久化层时就不得不自行决定哪些临时
状态应该写入文件。这会把运行时状态和长期历史混在一起。

因此顺序是：

```text
第 07–08 章：一次运行怎样正确结束
        ↓
第 09 章：多次运行由谁管理
        ↓
第 10 章：完成后的历史怎样跨进程保存
```

## 先建立全景

`Agent` 与 `runAgentLoop()` 的边界如下：

```text
Agent（跨运行）
  ├─ state.messages
  ├─ 订阅回调集合
  ├─ 当前运行
  │    ├─ id
  │    ├─ AbortController
  │    ├─ steering[]
  │    └─ followUps[]
  └─ prompt()
       └─ runAgentLoop()（一次运行）
            ├─ 模型回合
            ├─ 工具批次
            └─ AgentRunResult
```

`Agent` 不驱动模型协议，也不自己执行工具。它把已有的 `model`、`tools`、
`signal` 和队列回调交给 `runAgentLoop()`，再把少量已经归一化的循环事件转换成
界面可以读取的状态。

:::predict title="运行中再次调用 prompt 应该发生什么"
第一个 `prompt()` 还在等待 `Bash` 工具返回。此时调用者又执行
`agent.prompt("顺便更新 README")`。应该并行启动、自动改为调用 `steer()`，
还是拒绝？
---answer
应该明确拒绝，并让调用者选择 `steer()` 或 `followUp()`。两个循环并行改写同一
份消息历史会破坏消息顺序；如果系统悄悄把第二个 `prompt()` 改成 `steer()` 或
`followUp()`，调用者也无法判断这个 API 到底做了什么。
:::

## 开始动手：先进入正确的仓库

练习命令必须在教学历史仓库 `pi-course-history` 中运行，不是在工作区根目录，也
不是教材站点目录。先进入这个仓库，并确认当前路径的最后一段是
`pi-course-history`：

```bash
cd <你的工作区>/pi-course-history
pwd
npm run practice -w @pi/course -- 09 <新目录>
cd <新目录>
npm install
```

生成器会保留第 08 章的实现，加入第 09 章测试，并用两份练习脚手架替换对应源文件：

- `agent.ts` 已经写好公共类型和方法签名，等待你实现 reducer、运行清理、订阅和
  两条消息队列；
- `agent-loop.ts` 保留前两章完成的循环，只把本章新增的错误处理、数据复制、
  取消检查和队列取出留给你实现。

本章只修改：

```text
packages/pi-course/src/agent.ts
packages/pi-course/src/agent-loop.ts
```

每个 Lab 都会明确指出要改哪个文件。不要修改 `coding-tools.ts`，也不要切换到
包含最终实现的 `target` 快照。

本章要守住三个不变量：

1. 同一个 `Agent` 同时至多有一个正在运行的任务；旧运行只能清理自己创建的资源；
2. `getState()`、订阅事件和 `prompt()` 返回值不能与内部状态共享可变引用；
3. steering 只能在完整的工具批次或文本回答之后取出，follow-up 只在自然
   `stop` 之后取出。

:::rebuild title="Checkpoint 09 · 分五步建立跨运行所有权"
**模式：** 重建。从 08 的 `target` 开始，用一个 `Agent` 对象管理多次循环。

**起终点：** `parent` 是本章开始时的起点快照；`target` 是 11 项聚焦测试通过的
终点快照。

**教学文件：** `packages/pi-course/src/agent.ts`、
`packages/pi-course/src/agent-loop.ts`

**学习脚手架：** `agent.ts` 已声明 `AgentOptions`、`AgentState`、`AgentEvent`、
`reduceAgentState()` 和 `Agent` 的公共方法。`agent-loop.ts` 保留第 08 章已经
学过的循环，只标出第 09 章需要实现的位置。两份文件都能编译，但没有本章答案。

**动手前只需知道：** reducer 接收旧状态和一个事件，返回新状态；
`ActiveRun` 至少保存自己的 `id`、`AbortController`、steering 队列和
follow-up 队列。`Agent` 负责创建和清理 `ActiveRun`；一次运行内部的模型与工具
状态机仍由 `runAgentLoop()` 负责。

**第一步：** 只实现 reducer。先处理 `run_start`；处理 `loop` 和 `run_end`
时，忽略 `runId` 不等于当前运行的迟到事件。

**第一次红灯：** 脚手架可以通过 TypeScript 编译；首次只运行 Lab 9.1 时，应看到
`Lab 9.1 reducer 尚未实现`，而不是缺少模块或一串隐式 `any`。

**聚焦测试：** `packages/pi-course/test/09-stateful-agent.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 09`

**练习目录：** `npm run practice -w @pi/course -- 09`

**聚焦运行：** `npm run build -w @pi/course`，然后运行
`node --test packages/pi-course/dist/test/09-*.test.js`。

**通过证据：** 11 项测试按 `2/2 → 2/2 → 2/2 → 2/2 → 3/3` 检查 reducer、
单次运行的生命周期、订阅与数据副本、取消传播，以及 steering/follow-up 的取出
时机。

第一次尝试时，禁止查看完整答案。卡住时，让陪练只画当前 Lab 的状态时间线，不要
一次给出整个 `Agent` 类。
:::

## 第一步：先写纯 reducer

`AgentState` 是某一时刻的快照：

```ts
interface AgentState {
  status: "idle" | "running";
  messages: AgentMessage[];
  activeRunId?: number;
  lastReason?: AgentRunResult["reason"];
  streamingText: string;
  pendingToolCallIds: string[];
  diagnostics: string[];
}
```

事件说明“刚发生了什么”，reducer 负责根据事件计算新状态：

```text
run_start(7)
  → status=running
  → activeRunId=7
  → 追加本轮用户消息

loop(7, text_delta/tool_start/tool_end/assistant_message)
  → 更新 streamingText 或 pendingToolCallIds

run_end(7)
  → status=idle
  → 保存完成后的 messages 与 reason
  → 清空临时显示状态
```

如果当前 `activeRunId` 是 8，却收到运行 7 的 `text_delta` 或 `run_end`，就原样
返回当前状态。旧事件不能覆盖新运行的流式文本，也不能让新运行提前变回 `idle`。

reducer 不修改传入的状态或数组。`run_start` 要深复制原有的
`state.messages` 和 `event.message`，再组成新的 `messages` 数组；`run_end`
同样要深复制 `result.messages`。只改变标量字段的分支可以继续引用未改动的数组，
迟到事件则直接返回原状态。这样，调用者稍后修改事件或结果时，不会反过来改写
`Agent` 的内部状态。

:::lab title="实践 9.1 · 派生生命周期状态"
**目标：** 让同一组事件总能得到同一份状态，并忽略旧运行迟到的事件。

**文件：** `packages/pi-course/src/agent.ts`

**动作：**
1. 实现 `run_start`，记录 `runId`、用户消息和 `running` 状态；状态中的消息必须
   来自原有消息与当前用户消息的深副本。
2. 处理 `text_delta`、`tool_start`、`tool_end`、`tool_skipped` 与
   `assistant_message`。
3. 实现 `run_end`，保存消息副本与终止原因。
4. 在处理 `loop` 和 `run_end` 前核对当前 `status` 与 `runId`。
5. 不修改传入的状态、事件或其中的数组。
6. 删除 Lab 9.1 的显式异常，只运行本段测试。

如果 TypeScript 没有继续收窄嵌套的 `event.event`，先在确认
`event.type === "loop"` 后写 `const loop = event.event`，再根据 `loop.type`
分支。不要用 `as any` 绕过收窄。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 9.1" \
  packages/pi-course/dist/test/09-*.test.js
```

**预期：** `2/2`。第一项覆盖主要状态迁移，并确认输入没有被修改；第二项证明旧
运行的 `loop` 事件和 `run_end` 都不会污染当前运行。
:::

## 第二步：让每次 `prompt()` 拥有自己的 `ActiveRun`

并发保护不能只靠一个可能被任意回调改写的布尔值。每次 `prompt()` 都要创建一份
独立的运行记录：

```ts
type ActiveRun = {
  id: number;
  controller: AbortController;
  steering: UserMessage[];
  followUps: UserMessage[];
  acceptingInput: boolean;
};
```

后续的 `abort()`、`steer()` 和 `followUp()` 都只访问这份记录。下一次
`prompt()` 必须创建新的记录和新的控制器。循环发出 `turn_end` 时，先把
`acceptingInput` 改成 `false`。此后即使 `run_end` 还没有发布，`steer()` 和
`followUp()` 也必须拒绝新消息，不能先接受再悄悄丢掉。

`prompt()` 开始时，先从 `this.state.messages` 中已经完成的历史和当前用户消息
构造并深复制本轮起始消息的局部副本。设置本轮 `ActiveRun` 后发布 `run_start`，
随后把同一份局部副本交给 `runAgentLoop()`。不要在发布 `run_start` 后回读
`this.state.messages`：重入调用产生的 `run_start` 事件可能仍在 FIFO 队列中，
reducer 尚未把本轮用户消息写入状态。

最容易写错的是结束顺序。下面的顺序会让旧运行清掉新运行：

```text
错误顺序
运行 1 发布 run_end
  → 订阅回调同步启动运行 2
  → 运行 1 的 finally 才开始清理
  → 运行 2 的控制器和队列被旧运行清掉
```

正确顺序是：

```text
运行 1 得到结果
  → 清理运行 1 自己的 ActiveRun
  → 发布 run_end，状态变回 idle
  → 订阅回调现在可以启动运行 2
```

关键不在于把 `finally` 移到哪一行，而在于每次 `prompt()` 都用局部变量保存本次
创建的 `ActiveRun`。清理时先比较 `this.activeRun` 与这个局部对象；只有两者仍是
同一个对象，旧运行才能清除它。这样即使以后加入新的异步回调，旧运行也碰不到新
运行创建的记录。

这里还有两个容易漏掉的边界。

第一，回调重入产生的新事件不能插队。假设订阅回调 A 收到 `run_end(1)` 后立即
启动运行 2，订阅回调 B 应该先收到 `run_end(1)`，再收到 `run_start(2)`。所以
`emit()` 要把回调中产生的新事件放进 FIFO 队列，等当前事件通知完所有订阅回调后
再分发。否则，两个订阅回调会看到不同的生命周期顺序。

第二，模型可能在第二轮请求时直接抛错。此时工具也许已经修改了文件。只有
`runAgentLoop()` 持有包含工具调用和工具结果的本轮消息历史。因此，它必须把异常
转换成一条 `stopReason` 为 `error` 的 `assistant` 消息，并把它追加到当前
`messages` 后再结束运行。如果只在 `Agent.prompt()` 外层捕获异常，外层拿不到
本轮新增的工具调用和结果，这些已经发生的事实会从记录中消失。

Lab 9.2 会先实现最小可用的 `subscribe()`、`getState()` 和事件 FIFO，让测试能
观察 `run_start` 与 `run_end`。下一段再加入订阅回调的失败隔离和深拷贝。

:::lab title="实践 9.2 · 管理一次完整运行"
**目标：** 拒绝并行 `prompt()`，并在运行清理、回调重入或模型抛错时保持正确的
状态与事件顺序。

**文件：** `packages/pi-course/src/agent.ts`、
`packages/pi-course/src/agent-loop.ts`

**动作：**
1. 保存配置、状态、订阅回调集合、`nextRunId` 和可选的 `ActiveRun`。
2. 实现最小可用的 `subscribe()`、`getState()`，并用 FIFO 分发事件：先运行
   reducer，再通知订阅回调。
3. `prompt()` 先检查是否已有运行，再创建局部 `ActiveRun`、当前用户消息和本轮
   起始消息的深副本。
4. 发布 `run_start`，并把这份本轮起始消息、`model`、`tools`、`signal` 和
   `onEvent` 交给 `runAgentLoop()`。
5. 脚手架已经把 `runAgentLoop` 作为值导入。不要把这项导入改成只有
   `import type`：类型导入会在编译后消失，真正调用函数时会得到
   `TS2304: Cannot find name 'runAgentLoop'`。
6. `runAgentLoop()` 在每次调用模型时捕获异常，复用 `assistantMessage()` 将其
   转换成一条 `stopReason` 为 `error` 的 `assistant` 消息，并追加到当前
   `messages`。
7. `Agent.prompt()` 外层保留兜底异常处理；能由循环处理的模型请求失败必须由
   `runAgentLoop()` 返回，才能保留已经完成的消息。
8. 先清理当前 `ActiveRun`，再发布唯一的 `run_end`。
9. 删除 Lab 9.2 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 9.2" \
  packages/pi-course/dist/test/09-*.test.js
```

**预期：** `2/2`。第一项检查并发保护与累积消息历史；当工具已经执行、下一次模型
请求抛错时，消息历史仍要保留对应的工具调用和工具结果，随后还可以重试。第二项在
运行 1 的 `run_end` 订阅回调中启动运行 2，再尝试第三个并行 `prompt()`；第三次
必须得到 `Agent is busy`。另一个订阅回调还会确认事件顺序是
`start1 → end1 → start2 → end2`。
:::

## 第三步：切断三条可变引用

有三类数据会离开 `Agent`：

| 出口 | 调用者会怎样使用 | 必须隔离什么 |
|---|---|---|
| `getState()` | 界面保存或修改快照 | 内部状态 |
| 订阅事件 | 界面、日志或插件读取事件 | 其他订阅回调与 `prompt()` 结果 |
| `prompt()` 结果 | 调用者保存、转换或追加消息 | 内部消息历史 |

只复制最外层数组不够。`messages[0].content[0].text` 仍可能指向同一个对象。课程用
`structuredClone()` 建立深副本，让调用者修改副本时不会碰到内部对象。

不过，`ToolResultMessage.details` 的类型是 `unknown`。自定义工具可能把函数等
无法被 `structuredClone()` 复制的对象放进去。如果这类结果直接进入消息历史，
之后复制状态时会抛出 `DataCloneError`。公开状态可能因此停在 `running`，而实际
运行已经结束。

为避免这种状态分裂，循环要在发布 `tool_end` 前确认整个工具结果能否被结构化
复制。无法复制时，循环生成一条标准、可复制的错误结果，保留“这个工具调用失败”
这一事实，但不让不安全的 `details` 进入 `Agent` 状态。

发布事件时，`emit()` 先调用 reducer 更新状态，再通知订阅回调。因此，订阅回调
可以在 `run_start` 中读取到 `running` 状态。每个订阅回调都收到自己的事件副本。
某个回调抛错时，`Agent` 把错误写入 `diagnostics`，然后继续通知其余回调并继续
当前运行。`unsubscribe()` 只移除对应的回调，不能顺手清空其他订阅。

:::lab title="实践 9.3 · 隔离订阅者与公开副本"
**目标：** 让所有公开数据都可安全地结构化复制，并与 `Agent` 的内部状态隔离。

**文件：** `packages/pi-course/src/agent.ts`、
`packages/pi-course/src/agent-loop.ts`

**动作：**
1. `getState()` 返回深副本。
2. `emit()` 先更新状态，再遍历当前订阅回调的快照。
3. 每个订阅回调接收独立的事件副本。
4. 捕获单个订阅回调的异常并追加诊断，不阻断其他回调。
5. 实现有效的 `unsubscribe()`。
6. `prompt()` 返回的结果不能与内部状态或 `run_end` 事件共享对象。
7. 循环在发布工具结果前确认它能否被结构化复制；失败时生成标准的错误结果。
8. 只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 9.3" \
  packages/pi-course/dist/test/09-*.test.js
```

**预期：** `2/2`。第一项把会抛错的订阅回调放在正常回调前面，并分别退订两者，
检查失败隔离和精确退订。第二项分别修改状态快照、两个订阅回调收到的事件和
`prompt()` 返回值，再确认内部消息历史没有变化。它还会让工具返回不可复制的
`details`，确认 `Agent` 得到标准、可复制的错误结果并回到 `idle`。
:::

## 第四步：取消只属于当前运行

`Agent.abort()` 不直接创建终态。它只对当前 `ActiveRun` 的控制器调用
`abort()`。同一个 `signal` 会传给循环、模型和工具执行器；这些组件仍要在合适的
位置主动检查它。

```text
Agent.abort()
  → activeRun.controller.abort()
      ├─ 模型收到同一个 signal
      ├─ 工具执行器收到同一个 signal
      └─ 循环在完整消息边界以 aborted 结束
```

测试用两种时机区分取消行为。第一种是在 `run_start` 订阅回调中立即调用
`abort()`：此时控制器已经创建，但循环尚未请求模型，所以模型请求次数应为零。
第二种是在工具运行期间调用 `abort()`：已经形成的工具调用仍要得到配对结果并写入
消息历史，然后循环才能以 `aborted` 结束。

多次调用 `abort()` 只是重复表达同一个意图。下一次 `prompt()` 使用新的控制器，
不能继承旧 `signal` 的取消状态。模型也可能忽略 `signal`，最后仍返回普通文本。
循环必须在收到完整消息后再次检查 `signal`，并优先以 `aborted` 结束。

:::lab title="实践 9.4 · 传播并结算取消"
**目标：** 让模型请求前的取消和工具运行中的取消都只影响当前运行。

**文件：** `packages/pi-course/src/agent.ts`、
`packages/pi-course/src/agent-loop.ts`

**动作：**
1. 让 `abort()` 只操作当前 `ActiveRun` 的控制器。
2. 在 `prompt()` 中把同一个 `signal` 交给 `runAgentLoop()`。
3. 模型请求前取消时，不请求模型，并且只发布一个 `run_end`。
4. 工具运行中取消时，保留已经产生的工具调用与工具结果。
5. 模型忽略 `signal` 并返回文本时，循环仍要在 `stop` 分支优先以 `aborted`
   结束。
6. 清理后允许下一次 `prompt()` 创建新的 `signal`。
7. 删除 Lab 9.4 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 9.4" \
  packages/pi-course/dist/test/09-*.test.js
```

**预期：** `2/2`。第一项检查模型请求前取消、重复调用 `abort()` 和下一次运行；
第二项直接比较模型与工具收到的 `signal`，检查取消后的配对结果，确认新运行使用
新的 `signal`，并覆盖“模型忽略取消后仍返回文本”的情况。
:::

## 第五步：在完整消息边界取出两个队列

steering 和 follow-up 都会形成用户消息，但它们对执行时机的承诺不同：

| 方法 | 意图 | 取出位置 |
|---|---|---|
| `steer()` | 当前任务继续，但下一次决策要考虑新指令 | 当前完整的 assistant 回合之后 |
| `followUp()` | 当前回答自然结束后再继续 | 纯文本 `stop` 之后，且没有待取出的 steering 时 |

“完整的 assistant 回合”有两种形态。

工具回合必须先收齐整批结果，再按工具调用的声明顺序写入消息历史：

```text
assistant(call slow, call fast)
  → tool_end(fast)        实际完成顺序可以更早
  → tool_end(slow)
  → 消息历史写入 result(slow), result(fast)
  → user steer 1, user steer 2
  → 发起下一次模型请求
```

纯文本回答也要检查 steering：

```text
assistant(stop)
  → 若有 steering：追加 steering，继续当前运行
  → 否则若有 follow-up：追加 follow-up，继续当前运行
  → 两者都没有：自然 stop
```

旧实现只在工具批次后取 steering。因此，如果模型输出期间收到 steering，随后模型
用纯文本 `stop` 结束，这条尚未取出的 steering 消息会被丢弃。第五步需要同时修正
`agent-loop.ts` 的工具分支和纯文本分支。

以 `aborted` 或 `error` 结束时不能消费剩余队列。`Agent` 在清理本次运行时会丢弃
这些未消费的消息，防止它们进入下一次 `prompt()`。steering 和 follow-up 各自
保持 FIFO。

这里不要把规则扩大到 `maxSteps`。当前测试没有规定 steering 或 follow-up 恰好
在最后一个允许回合到达时，是应写入最终消息历史还是丢弃；当前实现也可能先取出
队列，再返回 `maxSteps`。在产品策略明确、相应测试补齐之前，调用者不能依赖这一
边界行为。

:::lab title="实践 9.5 · 固定 steering 与 follow-up 的取出时机"
**目标：** 让两种排队消息只在协议允许的位置进入消息历史。

**文件：** `packages/pi-course/src/agent.ts`、
`packages/pi-course/src/agent-loop.ts`

**动作：**
1. 在 `ActiveRun` 中保存两条 FIFO 队列；当前没有运行，或已经收到
   `turn_end` 时，`Agent.steer()` 和 `Agent.followUp()` 都必须拒绝输入。错误消息至少
   包含 `只在当前 run 尚未结束`，让调用者能够区分“现在不能排队”与其他程序错误。
2. 把 `takeSteeringMessages()` 与 `takeFollowUpMessages()` 传给循环。
3. 工具批次先完成全部配对；若已取消则结束，否则再取 steering。
4. 纯文本 `stop` 先检查取消，再取 steering；没有 steering 时才取 follow-up。
5. 收到 `turn_end` 后拒绝新的 steering 和 follow-up。
6. 以 `error` 或 `aborted` 结束后清空未消费队列，不把它们带到下一次运行。
7. 删除 Lab 9.5 的显式异常，先运行本段，再运行全章测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 9.5" \
  packages/pi-course/dist/test/09-*.test.js
node --test packages/pi-course/dist/test/09-*.test.js
```

**预期：** 本段测试 `3/3`，全章测试 `11/11`。三项测试分别检查工具批次后按
FIFO 顺序取出的 steering 消息、纯文本 `stop` 期间到达的 steering，以及自然
`stop` 后的 follow-up。组合场景还会检查两条规则：取消检查一定先于队列消费；
以 `error` 或 `aborted` 结束后，剩余消息不会进入下一次运行。最后，
`turn_end` 发布后不再接受新消息。
:::

## 故意把它弄坏

先保留你已有的清理：它带有身份检查，并且位于 `run_end` 之前。然后在发布
`run_end` 之后，故意再加一次不带身份检查的清理：

```text
if (this.activeRun === run) this.activeRun = undefined
emit(run_end)
this.activeRun = undefined   // 故意加错：可能清掉订阅回调刚创建的新运行
```

注意：不要把原来的清理整体移到 `run_end` 后面。那样订阅回调会因为旧运行仍被
视为当前运行而无法启动运行 2，Lab 9.2 只会超时，无法复现这里要观察的所有权
错误。

只运行 Lab 9.2。第二项测试会在运行 1 的 `run_end` 订阅回调中启动运行 2，然后
尝试第三个并行 `prompt()`。新增的无条件清理会让运行 1 清除运行 2 的
`ActiveRun` 记录，于是第三次 `prompt()` 被错误放行。

:::failure title="预期失败 · 让旧运行清理新运行"
不要改测试，也不要增加 `sleep`。观察第三次 `prompt()` 是否得到
`Agent is busy`，再核对订阅回调收到的 `run_start`/`run_end` 顺序。删除新增的
无条件清理，恢复为“只清理当前 `prompt()` 创建且身份匹配的 `ActiveRun`，并在
`run_end` 前完成清理”后，Lab 9.2 应重新得到 `2/2`，全章回到 `11/11`。
:::

## 本章没有证明什么

11 项测试没有覆盖以下性质：

- 异步订阅回调的执行顺序、背压、优先级或并行调度；
- `run_start` 事件乱序；课程只用 `runId` 防护当前运行的 `loop` 与 `run_end`
  事件；
- 模型流事件或工具进度事件中不可复制的临时数据；
- steering/follow-up 在 `maxSteps` 最后一步到达时的产品策略；
- 进程崩溃后的运行恢复、跨进程取消或跨设备同步；
- 消息历史的磁盘持久化、分支、压缩或并发写入；
- 多个 `Agent` 实例共同修改同一个会话；
- 真实界面的输入防抖、权限确认和用户撤销体验；
- 模型或工具忽略 `signal` 且永不返回时，系统能否强制停止它。

测试通过只说明：在订阅回调同步执行且只有一个 `Agent` 的环境中，本章列出的
生命周期与队列时序符合约定；进入消息历史的工具结果可以被安全复制。它不能保证
第三方模型或工具一定响应取消，更不能把它们变成可以强制终止的独立进程。

:::pi title="与上游 Pi 的固定提交对照"
上游固定提交 `8479bd8` 中，`packages/agent/src/agent.ts` 也在底层循环外保存消息、
工具和当前运行的 `AbortController`，并区分 steering 与 follow-up。上游还支持
更多队列取出模式、运行中切换模型与配置、异步订阅回调，以及更多产品状态。

课程没有照搬这些选项，而是先实现本章所需的最小功能集合：同一时刻只有一个运行、
每次运行使用独立控制器、公开状态不与内部共享引用，并且两种排队消息只在规定位置
进入消息历史。11 项离线测试只检查上述范围内的行为。
:::

## 本章验收

:::checkpoint title="Checkpoint 09 · 每次运行只清理自己"
在隔离练习目录运行 `build` 脚本和 11 项测试。你还要画出两条时间线：

1. 运行 1 发布 `run_end` 时，订阅回调立即启动运行 2，随后第三次 `prompt()` 被
   拒绝；
2. 两个工具反序完成，同时有两条 steering 排队。

第一条要按时间标出：旧 `ActiveRun` 何时清理、`run_end` 何时发布、订阅回调何时
创建新 `ActiveRun`，以及回调产生的新事件何时进入 FIFO 队列。第二条要同时标出
`tool_end` 的实际完成顺序，以及消息历史中工具调用和结果的写入顺序。还要标出
两条 steering 何时排队、何时按 FIFO 写入消息历史，以及下一次模型请求何时发起。
最后，逐一说明测试如何验证 `getState()` 返回值、订阅事件和 `prompt()` 返回值
这三条公开数据边界，再在源码中指出各边界对应的 `structuredClone()`。对循环输入
上下文和模型返回的 `assistant` 消息，现有测试没有单独做别名变异断言，只能通过
源码核对其深复制。做到这些，本章通过。
:::

## 可选迁移练习

:::transfer title="陪练迁移 · waitForIdle"
这次不要从空白页硬写。先让旁边的 Agent 只帮你完成三件事：列出
`waitForIdle(): Promise<void>` 的四个验收例子；指出它应该监听哪个公开事件；检查
你的测试有没有偷看私有控制器。你自己先写测试，再实现最小代码。

四个例子至少包括：`idle` 时立即完成；正常运行结束后完成；`abort()` 结束后完成；
多个等待者都完成。最后再启动一次 `prompt()`，证明新运行没有复用旧 `signal`。
陪练可以逐条提示，但在你写出当前红灯前不要给完整实现。
:::

## 小结

有状态 `Agent` 没有增加新的推理算法。它只集中管理跨运行状态：一份消息历史、
一个 `ActiveRun`、一组订阅回调和两条用户消息队列。

reducer 会忽略旧运行迟到的 `loop` 和 `run_end` 事件。每次运行先清理自己创建的
资源，再发布 `run_end`；回调中产生的新事件进入 FIFO，不能插到当前事件前面。
公开数据通过深副本与内部状态隔离，无法复制的工具结果先转换成标准错误结果。
`abort()` 只取消当前控制器。steering 在完整工具批次或纯文本 `stop` 后取出；
follow-up 只在自然 `stop` 且没有待取出的 steering 时取出。

下一章会保存已经完成的消息历史。当前运行的控制器、流式文本和队列仍是临时状态，
不应写进会话历史。
