---
id: "07"
slug: agent-loop
part: core
partTitle: 第二部 · 闭合 Agent 核心
chapter: "07"
title: 把 Agent Loop 写成可验证的状态迁移
summary: 让模型调用、工具执行和结果回填形成一条有明确终点的反馈回路。
minutes: 210
difficulty: 核心
artifact: packages/pi-course/src/agent-loop.ts
prerequisites: 04,06
terms: agent loop, state transition, stop reason, transcript order, terminal state
upstream: packages/agent/src/agent-loop.ts
---

## 你将得到什么

第 04 章的 `ScriptedModel` 能稳定产生模型消息，第 06 章的 executor 能把一次
tool call 变成配对的 `ToolResultMessage`。现在还缺一个控制器，把这两个能力接起来：

```text
模型提出动作
    → 执行工具
    → 把结果加入消息列表
    → 再次调用模型
```

这个控制器就是 Agent Loop。本章只修改：

```text
packages/pi-course/src/agent-loop.ts
```

练习时运行：

```bash
npm run practice -w @pi/course -- 07 <新目录>
```

练习目录会保留第 06 章的源码，注入第 07 章测试，并放入一份只用于学习的代码骨架。
骨架已经声明 `LoopEvent`、`AgentRunResult`、`AgentLoopOptions` 和
`runAgentLoop()` 的公共表面。五段状态迁移中的分支算法仍留给你完成。

需要重来时，请创建另一个练习目录。隔离目录没有 Git 历史，不要修改注入测试，也
不要运行恢复 commit 的命令。

本章要守住三个不变量：

1. 每轮模型流最终产生的 `AssistantMessage` 只加入消息列表一次；
2. 下一次模型请求发出前，每个 tool call 都恰好有一条同 id 的 tool result；
3. 一次运行只发出一个 `turn_end`。

`transcript` 在本章指本次运行内部维护的消息列表。模型请求、最终返回值和后续重放
都以这份列表为准。

## 先建立全景

### 把循环写成决策表

不要先写 `while`。先列出模型消息可能带来的状态迁移：

| `stopReason` 与 calls | 工具是否执行 | 下一步 |
|---|---:|---|
| `stop`，没有 call | 否 | 以 `stop` 结束 |
| `toolUse`，至少一个 call | 是 | 回填全部结果，再请求模型 |
| `toolUse`，没有 call | 否 | 以 `error` 结束 |
| `length`，有或没有 call | 否 | 给已有 call 配对错误结果，以 `length` 结束 |
| `error`，有或没有 call | 否 | 给已有 call 配对错误结果，以 `error` 结束 |
| `aborted`，有或没有 call | 否 | 给已有 call 配对错误结果，以 `aborted` 结束 |
| `stop`，却带有 call | 否 | 给 call 配对错误结果，以 `error` 结束 |

`stop` 中出现 tool call 属于协议矛盾，调用不得执行。`toolUse` 却没有任何 call 也
无法继续，loop 要以 `error` 结束。明确这两行之后，代码就不需要猜模型“可能想
表达什么”。

循环里还有三种顺序：

| 顺序 | 由谁决定 | 谁使用 |
|---|---|---|
| 调用声明顺序 | assistant content | 下一次模型请求与重放 |
| 工具完成顺序 | 实际完成先后 | 进度 UI 与诊断事件 |
| 结果写入顺序 | loop 按调用声明顺序恢复 | transcript |

两个工具可以并发执行。`fast` 可以先发出 `tool_end`，但结果仍要按 assistant 中
`slow, fast` 的顺序写入消息列表。call id 标识结果回答哪次调用；数组位置规定消息
发送顺序；实际完成先后只决定事件何时出现。

:::predict title="预测一个最小工具往返"
第一轮模型返回 `toolUse`，其中包含 `echo(call-1)`；第二轮返回文本 `done` 和
`stop`。输入消息列表里已经有一条 user message。请先写出模型调用次数、工具执行
次数和最终 role 顺序。
---answer
模型调用 2 次，工具执行 1 次。最终顺序是
`user → assistant(toolCall) → toolResult(call-1) → assistant(text)`。
只检查最后的 `done` 会漏掉最重要的 call/result 配对。
:::

:::rebuild title="Checkpoint 07 · 分五步闭合反馈回路"
**模式：** 重建。从 06 的 target 开始，只实现循环控制；model 和工具执行器保持
不变。

**起终点：** parent 是本章开始时的起点快照；target 是 9 项聚焦测试通过的终点
快照。

**教学文件：** `packages/pi-course/src/agent-loop.ts`

**学习脚手架：** 练习目录中的 `agent-loop.ts` 已经固定公共类型和函数入口。五类
分支算法都留给你实现，骨架不包含跳过结果、并发归一化或取消处理的答案。

**动手前只需知道：** 每一轮都按
`request model → append assistant → inspect stopReason → execute or end`
前进。只有 `toolUse + calls` 会执行工具。

**第一次红灯：** build 会通过。只运行“纯文本 stop”测试时，会得到
`Lab 7.1 收集模型终态 尚未实现`。先完成一次没有工具的模型请求，不要同时处理
并发和取消。

**第一步：**
1. build，确认公共表面已经完整；
2. 完成纯文本 `stop`，取得 `1/1`；
3. 闭合单工具往返，取得另一个 `1/1`；
4. 处理不会执行工具的终态，取得 `2/2`；
5. 处理并发与单项 rejection，取得 `2/2`；
6. 加入取消检查和 `maxSteps`，取得 `3/3`，最后运行全部 `9/9`。

**聚焦测试：** `packages/pi-course/test/07-agent-loop.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 07`

**练习目录：** `npm run practice -w @pi/course -- 07`

**聚焦运行：** `npm run build -w @pi/course`，然后
`node --test packages/pi-course/dist/test/07-*.test.js`

**通过证据：** 9 项测试覆盖输入所有权与请求内容、单工具回填、非执行终态、并发
顺序、注入 executor 的 rejection、预取消、工具后的取消和回合上限。

第一次尝试禁止查看完整答案。若卡住，陪练按“当前 `stopReason` → 这一分支是否执行
工具 → 追加哪条消息 → 继续还是结束”的顺序给提示。
:::

## 第一步：完成一次纯文本 stop

一次模型请求包含三部分：

```ts
{
  systemPrompt: options.context.systemPrompt,
  messages,
  tools: options.tools.definitions(),
}
```

`messages` 不能直接指向调用者的数组。运行开始时先克隆
`options.context.messages`，之后只修改这份局部副本。`systemPrompt` 和
tool definitions 也要传给模型；即使当前脚本不调用工具，模型也应看到本次运行
允许的完整动作空间。

模型返回的是 `EventStream`。loop 先转发流中的 `model_event`，再通过
`stream.result()` 取得唯一的最终 `AssistantMessage`：

```text
model.stream()
    → for await (model events)
    → stream.result()
    → messages.push(assistant)
    → emit assistant_message
```

最终消息为 `stop` 且没有 call 时，发出 `turn_end(stop)` 并返回。不要把流式中间
片段写入消息列表；它们只是过程事件，最终 assistant 才是可以重放的事实。

:::lab title="实践 7.1 · 完成纯文本 stop"
**目标：** 完成一轮无工具模型请求，并保持调用者对输入 context 的所有权。

**文件：** `packages/pi-course/src/agent-loop.ts`

**动作：**
1. 克隆输入 messages，设置默认 `maxSteps` 和 executor。
2. 调用 model 时传入 `systemPrompt`、局部 messages 和 Registry definitions。
3. 转发 model events，再取得最终 assistant。
4. 把最终 assistant 加入局部消息列表并发出 `assistant_message`。
5. 对 `stop + no calls` 发出唯一的 `turn_end`，返回 `reason`、messages 和 steps。
6. 删除 Lab 7.1 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="纯文本 stop" \
  packages/pi-course/dist/test/07-*.test.js
```

**预期：** `1/1`。测试会证明 loop 不修改调用者的 context；模型请求保留
`systemPrompt`、messages 与 tool definitions；运行只发出唯一一个 `turn_end`。
:::

## 第二步：把一个工具结果送回模型

先从最终 assistant 中取出 `ToolCall`：

```ts
const calls = assistant.content.filter(
  (block): block is ToolCall => block.type === "toolCall",
);
```

只有 `stopReason === "toolUse"` 且 `calls.length > 0` 时才进入执行阶段。单个调用
按下面的顺序处理：

```text
emit tool_start
    → executor(call, { signal, reportProgress })
    → emit tool_end
    → messages.push(result)
    → 下一轮 model request
```

`reportProgress` 要转成带 call id 的 `tool_progress`，这样 UI 才知道进度属于哪个
动作。signal 也要原样交给 executor。第 06 章已经保证内置 executor 的正常返回值
会保留 call id、name 和错误状态；本章负责把这条结果放回正确的位置。

第二次模型请求应该看到完整的三段因果链：

```text
user
assistant(toolCall id=call-1)
toolResult(toolCallId=call-1)
```

:::lab title="实践 7.2 · 闭合单工具往返"
**目标：** 让测试中的 `probe` 调用执行、回填，并触发第二次模型请求。

**文件：** `packages/pi-course/src/agent-loop.ts`

**动作：**
1. 提取 assistant 中的 calls。
2. 当 `toolUse` 中只有一个 call 时，先发出 `tool_start`。
3. 调用 executor，并传入 signal 与绑定 call id 的 progress callback。
4. 发出 `tool_end`，再把 result 追加到 messages。
5. 继续循环，直到下一轮纯文本 `stop`。
6. 删除 Lab 7.2 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="单工具往返" \
  packages/pi-course/dist/test/07-*.test.js
```

**预期：** `1/1`。测试会比较第二次请求的消息角色和工具定义，并检查
call/result id、signal、progress、三类工具事件的相对顺序，以及最终 `stop`。
:::

## 第三步：给不会执行的调用也配对

模型消息已经成为 transcript 中的事实，所以不能简单丢弃其中的 call。即使安全规则
禁止执行，也要给每个 call 写入一条错误结果。可以用一个 `skippedCall()` 统一创建：

```json
{
  "role": "toolResult",
  "toolCallId": "cut",
  "toolName": "echo",
  "content": [{
    "type": "text",
    "text": "Tool call was not executed because the model response was truncated."
  }],
  "details": {"skipped": true, "reason": "length"},
  "isError": true
}
```

`length` 最需要这条防线。被截断的 arguments 可能碰巧仍是合法 JSON，也可能通过
schema；一旦执行 write、edit 或 bash，就会改变文件或启动进程。因此，`length`
中的所有调用都不得执行。

`error` 和 `aborted` 中的 call 同样不得执行。`stop + calls` 是协议矛盾：为调用
生成 `unexpected-stop` 错误结果，再以 `error` 结束。`toolUse + no calls` 没有
需要配对的调用，直接以 `error` 结束。

每条终态分支都要发一次 `turn_end`。不要在终态分支里发一次，又在函数末尾补发
第二次。

:::lab title="实践 7.3 · 处理所有非执行终态"
**目标：** 在不产生副作用的前提下，保持 call/result 配对并返回准确终态。

**文件：** `packages/pi-course/src/agent-loop.ts`

**动作：**
1. 实现 `skippedCall()`，保留 call id 和 name，写明跳过原因。
2. 对 `length`、`error`、`aborted` 中的每个 call 追加错误结果。
3. 对 `stop + calls` 追加 `unexpected-stop` 结果，并返回 `error`。
4. 对 `toolUse + no calls` 返回 `error`。
5. 确认这些分支都不调用 executor，且各自只发一个 `turn_end`。
6. 删除 Lab 7.3 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="非执行终态" \
  packages/pi-course/dist/test/07-*.test.js
```

**预期：** `2/2`。一项覆盖 `length/error/aborted`，另一项覆盖矛盾的 `stop` 和空的
`toolUse`。测试会比较执行次数、配对结果、终止 reason 和 `turn_end` 数量。
:::

## 第四步：同时执行，按调用顺序写回

一批 calls 可以同时启动。`Promise.all()` 的返回数组会保留输入 Promise 的顺序，
即使它们完成的先后不同：

```text
调用声明顺序：slow → fast
完成事件顺序：fast → slow
消息写入顺序：result(slow) → result(fast)
```

每个工具 Promise 完成时立即发出 `tool_end`；等整批结束后，再按 `Promise.all()`
的结果顺序追加消息。测试使用可控 Promise gate，先手动放行 fast，再放行 slow。
这样顺序来自明确动作，不依赖 `25ms` 和 `1ms` 的定时碰运气。

注入的 executor 还可能 reject。若直接把这些 Promise 交给 `Promise.all()`，一个
rejection 会让 loop 提前退出，其他工具虽然还在运行，却没有机会写入结果。每个调用
都要单独捕获 rejection，把它转换成同 id/name 的错误 `ToolResultMessage`。等所有
调用都有结果后，再进入下一轮。

这里不把 stack 写进结果。错误消息仍可能包含调用方自己写入的敏感文本，通用脱敏
不属于本章。

:::lab title="实践 7.4 · 隔离并发完成与单项失败"
**目标：** 让完成事件反映实际完成顺序，让 transcript 保持调用声明顺序。

**文件：** `packages/pi-course/src/agent-loop.ts`

**动作：**
1. 同时启动所有 calls，不要逐个 await。
2. 每个调用完成时立即发出 `tool_end`。
3. 每个调用单独捕获 rejection，并转换成配对错误结果。
4. 等整批调用结束，再按 calls 顺序追加结果。
5. 删除 Lab 7.4 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="并发工具" \
  packages/pi-course/dist/test/07-*.test.js
```

**预期：** `2/2`。一项使用 gate 证明完成事件可以是 fast、slow，而消息顺序仍是
slow、fast；另一项证明一个 injected executor rejection 不会吞掉同批其他结果。
:::

## 第五步：让控制器有明确边界

loop 在两个位置检查外部 signal：

1. 发起模型请求前；
2. 一批工具完成、结果已经写入 messages 后。

运行开始前 signal 已 aborted 时，不调用模型，返回 `steps: 0`。若工具执行期间
发生 abort，已经提交的执行最终返回后，loop 会先保留它们的配对结果，再以
`aborted` 结束，不再请求模型。

`maxSteps` 限制模型回合数。每次循环最多消费一次模型请求。最后一个允许的
`toolUse` 回合仍要写完工具结果，然后以 `maxSteps` 结束；不要伪造一条模型从未
生成的 `stop` 消息。

这两个边界都不能提供墙钟超时。provider 或工具若忽略 signal，loop 仍可能一直
等待。强制终止进程、清理外部资源和超时策略属于更外层的运行时责任。

:::lab title="实践 7.5 · 处理取消与回合上限"
**目标：** 阻止新的工作启动，并让已有协议事实保持完整。

**文件：** `packages/pi-course/src/agent-loop.ts`

**动作：**
1. 模型请求前检查 signal；预取消时返回 `aborted` 和 `steps: 0`。
2. 工具批次结束后再次检查 signal；若已取消，不再发起下一轮模型请求。
3. 循环用 `maxSteps` 控制模型请求次数。
4. 达到上限时保留最后一批工具结果，以 `maxSteps` 结束。
5. 所有路径都只发一个 `turn_end`。
6. 删除 Lab 7.5 的显式异常，先运行本段测试，再运行本章全部测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="取消与上限" \
  packages/pi-course/dist/test/07-*.test.js
node --test packages/pi-course/dist/test/07-*.test.js
```

**预期：** 局部 `3/3`，完整 `9/9`。三项测试分别检查预取消、工具后的取消和
`maxSteps`，同时比较模型调用数、工具结果、steps、终止 reason 和唯一 `turn_end`。
:::

:::mechanism title="为什么这条循环可以逐步验证"
第一次模型请求前，局部 messages 是输入 context 的副本。每一轮先加入一个最终
assistant。若分支结束，已有 call 会先得到配对结果；若分支继续，整批结果也会在
下一次模型请求前按 call 顺序加入。因此，每次重新进入 model request 状态时，
消息列表都满足同一个配对不变量。

`maxSteps` 为循环提供有限的模型回合预算。它只约束控制器还能发起几次请求，不能
替 provider 或工具提供墙钟终止保证。
:::

:::note title="这 9 项测试没有证明什么"
本章没有证明墙钟超时，也没有证明忽略 signal 的 provider 或工具会停止。测试没有
覆盖抛错的 `onEvent` subscriber、重复 call id、动态工具注册、重试或进程级清理。
它只证明课程内列出的状态迁移、配对规则、两种顺序，以及预取消和工具后取消的外部
行为。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的 `packages/agent/src/agent-loop.ts` 也会拒绝执行 `length`
消息中的 calls，并为它们生成配对错误结果。工具可以并发执行，完成事件按实际完成顺序
发出，result message 再按 assistant 中的声明顺序交给模型。上游还处理 hooks、
steering、follow-up、动态模型切换和更复杂的队列；本章先固定最小控制器的状态边界。
:::

## 故意把它弄坏

临时把 `length` 分支改成普通 `toolUse` 执行路径。测试里的 fake 工具只增加计数，
不会写真实文件：

```text
正确：length + calls → executionCount 0 → skipped results
错误：length + calls → executionCount 2 → 两个副作用都已经开始
```

:::failure title="预期失败 · 让截断调用进入执行器"
只改分支选择，不改测试。运行“非执行终态”测试，应立即看到执行次数从 0 变成 2。
恢复 `length` 跳过分支后，重跑同一命令得到 `2/2`。这个实验观察副作用是否启动，
不依赖最终文本。
:::

## 本章验收

:::checkpoint title="Checkpoint 07 · 反馈回路闭合"
运行：

```bash
npm run build -w @pi/course
node --test packages/pi-course/dist/test/07-*.test.js
```

应得到 `9/9`。然后为下面六个输入各写一行结果：

| 输入 | 模型是否再调用 | 工具是否执行 | 最终 reason |
|---|---:|---:|---|
| 纯文本 `stop` | 否 | 否 | stop |
| `toolUse + echo` | 是 | 是 | 取决于下一轮 |
| `length + call` | 否 | 否 | length |
| `stop + call` | 否 | 否 | error |
| 预取消 | 否 | 否 | aborted |
| 最后一轮仍请求工具 | 否 | 是，并保留结果 | maxSteps |

最后解释：为什么工具完成事件可以乱序，结果消息却要按 call 顺序写入？为什么
`maxSteps` 不能保证一个忽略 signal 的工具及时停止？为什么终态中的 call 即使不
执行也必须得到配对结果？

若要重做，请创建新的 practice 目录。下一章会把 `echo` 换成 read、write、edit 和
bash，Agent Loop 的公共接口保持不变。
:::

## 可选迁移练习

:::transfer title="迁移 · 同批混合三种结果"
让同一个 assistant turn 产生三个 calls：第一个 schema 失败，第二个等待 gate 后
成功，第三个 executor reject。先写出预期的 `tool_end` 顺序和
`ToolResultMessage` 写入顺序，再写测试。要求三个 call 都恰好有一个同 id 的结果，
下一次模型请求仍按 1、2、3 排列。
:::

额外挑战：让模型在同一条 assistant 中重复使用 call id。先决定由消息验证层拒绝，
还是由 loop 生成错误结果；无论选择哪一层，都要写测试固定责任边界，不要执行两次。

## 小结

Agent Loop 每轮只做三件事：取得最终 `AssistantMessage`，根据 `stopReason` 决定
执行工具还是结束，再把结果按 call 顺序加入消息列表。`length` 会阻止任何工具
执行；executor rejection 会变成配对结果；工具完成事件可以乱序，消息写入顺序必须
稳定。

第 08 章会实现 read、write、edit 和 bash。动作内容会改变，这条反馈回路不需要
重写。
