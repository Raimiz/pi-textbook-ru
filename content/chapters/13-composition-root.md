---
id: "13"
slug: composition-root
part: product
partTitle: 第四部 · 从核心到产品
chapter: "13"
title: 把已有能力接成一个可落盘的 Runtime
summary: 显式选择活动分支，恢复 Agent，在每次模型请求前统一构造上下文，并让 prompt 只有在新消息落盘后才完成。
minutes: 150
difficulty: 核心
artifact: packages/pi-course/src/composition.ts
prerequisites: 09,10,11,12
terms: composition root, runtime, active leaf, context projection, durability, poison state
upstream: packages/coding-agent/src/core/agent-session-runtime.ts
---

## 你将得到什么

前四章已经分别解决了状态、历史、上下文和资源加载。现在这些部件都能独立工作，但还
缺一个明确的负责人，把一次请求从头送到尾：

```text
选择历史分支
  → 恢复 Agent
  → 构造本轮 context
  → 运行 model / tool loop
  → 追加本轮新消息
  → 把结果交给产品入口
```

如果 interactive、print 和 JSON 各自完成这套接线，系统里很快会出现三种恢复方式、
三种工具执行器和三种落盘时机。它们表面上都叫 Pi，重启后看到的历史却可能不同。

本章只解决这个根问题：**建立一个拥有完整对象图和持久化生命周期的 Runtime。**
完成后，你会得到：

- `createRuntime()`：从显式选择的 session leaf 恢复唯一的 Agent；
- `createContextProjectingModel()`：在每次模型请求前调用第 11 章唯一的
  `buildContext()`；
- `Runtime.prompt()`：串行运行请求，只追加本轮新增消息，并等它们落盘后再返回；
- `flush()` 与 `dispose()`：说清哪些工作已经被接受，什么时候可以安全退出；
- `runMode()`：让三种入口只借用 `Runtime.prompt()`，不再拥有 Agent。

本章的总原则是：

> 一次请求只有一个运行时负责人。它恢复哪条历史，就沿哪条历史构造上下文；它向调用者
> 报告完成时，本轮新增事实必须已经写进 session。

## 为什么第 13 章放在这里

Composition root 必须最后出现。太早写它，只能先发明一批还不存在的接口，后面每加
一个能力就重改一次“总入口”。

现在依赖已经稳定：

```text
第 09 章 Agent          保存跨轮状态，提供控制面
第 10 章 Session        保存追加式事实，按 leaf 选择路径
第 11 章 buildContext   从活动路径派生有限模型输入
第 12 章 Resources      生成 system prompt，提供 extension executor
                │
                ▼
第 13 章 Runtime        只负责接线、持久化顺序和生命周期
                │
                ▼
第 14 章 Eval           从外部验证整个系统
```

这个顺序也让错误有清楚的归属。分支选错，回到 session；裁剪拆坏工具往返，回到
context；extension 没有挡住工具，回到 resource host；这些部件都正确、组合后仍然
丢历史，才是 Runtime 的问题。

## 开始动手

在教学历史仓库中生成隔离练习。不要修改原始 Pi，也不要在教材目录里写实现：

```bash
cd <你的教学历史仓库>
npm run checkpoint -w @pi/course -- 13
npm run practice -w @pi/course -- 13 <新目录>
cd <新目录>
npm install
```

本章修改两个文件：

```text
packages/pi-course/src/agent.ts
packages/pi-course/src/composition.ts
```

`agent.ts` 只增加 `initialMessages` 接缝。不要把 session、context 或 mode 搬进 Agent。
主要施工都在 `composition.ts`。

先确认脚手架可以编译：

```bash
npm run build -w @pi/course
```

然后只运行第一段：

```bash
node --test --test-name-pattern="Lab 13.1" \
  packages/pi-course/dist/test/13-*.test.js
```

正确起点是 `0/2`，两项都应准确失败在：

```text
Lab 13.1 createRuntime 尚未实现
```

如果 build 先红了，或者错误来自 Lab 13.2、13.3，先检查 practice 目录和 starter。
不要在错误起点上补类型或改测试。

:::rebuild title="Checkpoint 13 · 分四步组装一个可恢复、可落盘的 Runtime"
**模式：** 重建。从第 12 章 target 开始，只增加组合边界和 Agent 的历史注入接缝。

**起终点：** `parent` `03541892bcd533444af599d1813401f79807de3c` 是起点；`target` `1caf1082b3f92504346bbeda969e4cfbb0f8f636` 是终点。

**教学文件：** `packages/pi-course/src/agent.ts`、
`packages/pi-course/src/composition.ts`

**学习脚手架：** `starters/13-composition.ts` 固定 Runtime、context adapter 和 mode 的
公共表面。`RuntimeImpl` 的 `prompt/flush/dispose` 明确停在 Lab 13.3，不要求你在第一段
提前实现持久化。

**动手前只需知道：** Runtime 只创建一个 Agent，并持有它使用的 session、resources
和 extension host。非空 session 必须显式选择 leaf；一次 prompt 返回前，本轮新增消息
必须完成追加。

**第一步：** 给 Agent 加入 `initialMessages` 深复制接缝，再实现 session 选择和
Runtime 外壳。此时不调用 prompt，也不实现持久化队列。

**第一次红灯：** fresh starter build 为绿；首次只运行 Lab 13.1 时，两项都应显示
`Lab 13.1 createRuntime 尚未实现`。

**聚焦测试：** `packages/pi-course/test/13-composition-modes.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 13`

**练习目录：** `npm run practice -w @pi/course -- 13`

**聚焦运行：** `npm run build -w @pi/course`，然后运行
`node --test packages/pi-course/dist/test/13-*.test.js`。

**施工顺序：** Runtime 外壳与恢复 `2/2` → context adapter `3/3` →
持久化与生命周期 `3/3` → mode 呈现 `2/2`。

**通过证据：** 四段依次全绿；故障实验先暴露错误，再在恢复 poison 逻辑后回绿；
最后 10 项聚焦测试全部通过。

第一次尝试先不看 target diff。陪练先检查当前不变量，再按函数边界给提示。
:::

## 先建立全景

### Runtime 拥有什么

Composition root 不是新的业务层。它不重新实现 Agent loop、session store 或
`buildContext()`。它只决定现有对象怎样相遇，以及谁负责它们的生命周期。

```text
RuntimeConfig                         RuntimeDeps
  activeLeafId                         model
  systemPrompt                         tools
  maxSteps                             session
  context budget                       resources
                                       extensionHost
                                       createId / now
          │                                │
          └────────── createRuntime ───────┘
                              │
                              ▼
                         一个 Runtime
                  ┌───────────┼────────────┐
                  ▼           ▼            ▼
              control       prompt       session/resources
          观察、取消、排队   唯一写入口     可检查的依赖身份
```

所有权要分清：

| 对象 | 拥有的事实 | 不该做的事 |
|---|---|---|
| `SessionStore` | 已提交的历史 entry | 猜测用户想继续哪个分支 |
| `buildContext()` | 本次模型可见的有限投影 | 写 session、调用模型 |
| `Agent` | 当前 canonical transcript 与运行状态 | 决定消息如何持久化 |
| `ExtensionHost` | 工具调用前后的策略 | 创建第二个 Agent loop |
| `Runtime` | 分支选择、对象接线、追加顺序、生命周期 | 重写上述部件的内部规则 |
| `runMode()` | 一次输入和一次输出编码 | 绕过 Runtime 直接调用 Agent |

这里有一个有意的限制：`Runtime.control` 暴露 `getState()`、`subscribe()`、
`steer()`、`followUp()` 和 `abort()`，但不暴露 `prompt()`。所有新请求必须经过
`Runtime.prompt()`，否则调用者可以拿到模型结果，却绕过 session 持久化。

### 一次 prompt 穿过哪些层

Runtime 恢复后，一次请求走这条路径：

```text
Runtime.prompt("修复测试")
  → 在 Runtime 队列中等待前一项完成
  → Agent.prompt()
      → projecting model adapter
          → active path + 本轮未持久化 suffix
          → buildContext()
          → inner model
      → extensionHost.wrapExecutor(coreExecutor)
          → executeToolCall()
  → 取得 Agent 新增的 message suffix
  → 逐条 session.append()
  → 更新 active path / persisted count / active leaf
  → resolve 调用者
```

注意模型请求发生在持久化之前。同一次 Agent run 可能调用模型多次，第二次模型请求必须
看见刚产生、但尚未写入 session 的工具调用和工具结果。这就是第 2 段要构造“临时
suffix”的原因。

:::pi title="课程边界 · 本章验证的是可观察的 Runtime 契约"
课程把组合边界压缩成 `createRuntime()`、一个 model adapter 和一个很薄的
`runMode()`，目的是让恢复、投影、落盘和生命周期可以由 10 项黑盒测试直接观察。它
不是原始 Pi 生产入口的逐行复刻，也不声称已经实现完整 CLI、RPC、配置加载或跨进程
锁。判断本章是否完成，只看这里列出的输入、输出和失败语义。
:::

:::predict title="为什么不能直接从 session.entries() 取最后一行恢复"
Session 里有 `root → left` 和 `root → right` 两个分支，物理文件最后一行恰好是
`left`。用户这次想继续 `right`。Runtime 能不能把最后一行当作 active leaf？
---answer
不能。文件顺序只表示 append 发生的先后，不表示用户当前选择。非空 session 必须由
调用者显式提供 `activeLeafId`，再用 `pathTo()` 恢复那条祖先链。猜最后一行会把一次
存储偶然性变成产品决策。
:::

## 第一步：恢复明确选择的历史

这一段只做 Runtime 外壳和恢复，不调用 `prompt()`。Starter 里的
`RuntimeImpl.prompt/flush/dispose` 继续报告 Lab 13.3 尚未实现，这是正确状态。

先给 Agent 增加唯一接缝：

```ts
export interface AgentOptions {
  model: Model;
  tools: ToolRegistry;
  toolExecutor?: ToolExecutor;
  initialMessages?: readonly AgentMessage[];
  systemPrompt?: string;
  maxSteps?: number;
}
```

构造函数必须深复制历史：

```ts
constructor(private readonly options: AgentOptions) {
  this.state = {
    status: "idle",
    messages: [...structuredClone(options.initialMessages ?? [])],
    streamingText: "",
    pendingToolCallIds: [],
    diagnostics: [],
  };
}
```

`[...(options.initialMessages ?? [])]` 只复制数组，不复制消息里的 content blocks。
测试会在 Runtime 创建后修改 Store 返回的嵌套文本；Agent 的状态不能跟着变化。

### 先写恢复规则

`RuntimeConfig.activeLeafId` 是必填的 nullable 字段：

```ts
export interface RuntimeConfig {
  activeLeafId: string | null;
  systemPrompt?: string;
  maxSteps?: number;
  context: ContextBudget;
}
```

它不是“有值就选分支，没值就随便选一个”。规则只有三条：

```text
entries 为空 + activeLeafId === null     → 新会话，恢复 []
entries 为空 + activeLeafId 是字符串     → 拒绝，leaf 不存在
entries 非空 + activeLeafId === null     → 拒绝，调用者没有选择分支
entries 非空 + activeLeafId 是字符串     → pathTo(entries, activeLeafId)
```

把规则收进一个纯 helper。最小控制流是：

```text
validateSessionSelection(entries, activeLeafId)
  if entries.length === 0:
    要求 activeLeafId === null
    return []

  要求 activeLeafId !== null
  return pathTo(entries, activeLeafId)
```

不要自己再写一遍 parent 遍历。第 10 章的 `pathTo()` 已经拥有重复 id、缺失 parent 和
祖先链诊断。

### 再接 Runtime 外壳

本章固定的构造签名是：

```ts
export async function createRuntime(
  config: RuntimeConfig,
  deps: RuntimeDeps,
): Promise<Runtime>
```

Lab 13.1 的施工顺序：

```text
entries = await deps.session.entries()
initialPath = validateSessionSelection(entries, config.activeLeafId)
initialMessages = initialPath 中所有 message entry 的深副本
agent = new Agent({ model: deps.model, tools: deps.tools, initialMessages, ... })
runtime = new RuntimeImpl(agent/control, initialPath, deps)
return runtime
```

这一阶段可以先把 `deps.model` 和核心 tool executor 直接交给 Agent。第 2 段完成 model
adapter，第 3 段再把 adapter、resource prompt 和 extension executor 接回唯一
`createRuntime()`。不要为了提前贴近 target，把后两段一起写完。

Runtime 对外身份必须保持原对象：

```text
runtime.session    === deps.session
runtime.resources  === deps.resources
runtime.extensions === deps.extensionHost
```

这不是为了少复制。调用者需要确认 Runtime 正在使用哪一个 Store、catalog 和 extension
host；偷偷构造第二份依赖会让测试和产品观察不同的对象图。

:::lab title="实践 13.1 · 组装 Runtime 外壳并恢复活动路径"

**只实现：**

- `AgentOptions.initialMessages` 和 Agent 构造时的深复制；
- session 选择 helper；
- `createRuntime()` 的恢复与 Runtime 外壳；
- Runtime control 对 Agent 的观察、steering、follow-up 和 abort 转发。

暂时不要实现 `Runtime.prompt()`，也不要调用 `buildContext()`。

**先预测：**

1. 一个非空 session 没传 leaf，应该继续最后一行还是启动失败？
2. 活动路径上有 metadata，Agent 初始 transcript 是否包含它？
3. Runtime 创建后，修改 Store 返回的嵌套 message，Agent state 会不会变化？

**不变量：**

```text
非空 session ⇒ 显式 activeLeafId
initial Agent messages = selected path 中 message entry 的深副本
Runtime.control 不暴露 prompt
每个依赖只出现一个实例
```

**最小施工路线：**

1. 在 `agent.ts` 增加 `initialMessages?: readonly AgentMessage[]`。
2. 把 Agent 的 state 初始化移进 constructor，使用 `structuredClone()`。
3. 在 `composition.ts` 实现 `validateSessionSelection()`。
4. 把 selected path 中的 message 投影成 `AgentMessage[]`。
5. 构造一个 Agent 和一个 Runtime 外壳。
6. 保留 starter 中 Lab 13.3 的三个显式异常。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 13.1" \
  packages/pi-course/dist/test/13-*.test.js
```

**通过后记录：**

```text
空 session + null leaf: accepted
非空 session + null leaf: rejected
selected branch: root → right
Agent initial messages: root question, right answer
Runtime.control.prompt: absent
Lab 13.1: 2/2
```

**常见误区：**

- 用 `entries.at(-1)` 选择 leaf；
- 把所有分支消息交给 Agent，再期待 context 层替你删掉 sibling；
- 只复制 entries 数组，仍共享 message content；
- 把 `Agent` 本身作为 `control` 返回，意外暴露 `prompt()`；
- 第一段就实现持久化队列，首红不再能定位当前施工位。
:::

## 第二步：每次模型请求前投影 context

Agent 保存完整 canonical transcript。模型不一定能看到全部历史：第 11 章已经规定，模型
输入必须由 `buildContext()` 按 interaction 和预算派生。

我们不改 Agent loop。给 inner model 包一层 adapter：

```ts
export function createContextProjectingModel(
  inner: Model,
  config: Pick<RuntimeConfig, "systemPrompt" | "context">,
  getSnapshot: () => ContextProjectionSnapshot,
): Model
```

`getSnapshot()` 返回两个量：

```ts
export interface ContextProjectionSnapshot {
  activePath: readonly SessionEntry[];
  persistedMessageCount: number;
}
```

- `activePath` 是已经提交的活动路径；
- `persistedMessageCount` 是这条路径中已提交的 message 数量；
- Agent 传给 model 的 `context.messages` 是“恢复历史 + 当前 run 已产生消息”。

所以待投影的临时后缀是：

```ts
context.messages.slice(snapshot.persistedMessageCount)
```

### 临时 entry 只为调用 buildContext

`buildContext()` 接受 `SessionEntry[]`，suffix 此时还只是 `AgentMessage[]`。把每条临时
消息包装成 `MessageSessionEntry`，接到活动路径末尾：

```text
parent = activePath 最后一条 entry id，空路径则为 null
for (message, index) in suffix:
  生成不会与 activePath 冲突的临时 id
  entry.parentId = parent
  parent = entry.id
```

临时 id 只在这一份模型请求里使用，不写 Store，也不调用 `createId()`。它们的作用是
让第 11 章的分组和 compaction 逻辑看到一条合法路径。

先验证：

```text
persistedMessageCount 是整数
0 <= persistedMessageCount <= context.messages.length
```

否则 `slice()` 会把损坏快照伪装成正常输入。

然后只调用一次：

```ts
const projected = buildContext(entries, {
  maxTokens: config.context.total,
  reservedOutput: config.context.reservedOutput,
  safetyMargin: config.context.safetyMargin,
  systemPrompt: config.systemPrompt,
  estimateTokens: config.context.estimateTokens,
});
```

inner model 得到 `projected.systemPrompt` 和 `projected.messages`。原请求中的 tools 要深
复制后保留，`AbortSignal` 必须原样传下去：

```text
projected messages ──深复制──▶ inner
context tools       ──深复制──▶ inner
options.signal      ──同一对象─▶ inner
```

signal 表示同一条取消链，复制没有意义；messages 和 tools 是可变数据，不能与 inner
共享引用。

:::predict title="为什么 snapshot 要在每次 stream() 时重新读取"
Runtime 创建时保存了一份 `initialPath`。第一次 prompt 已经成功落盘，第二次 prompt 又
开始了。若 adapter 永远使用创建时那份路径，会发生什么？
---answer
第二次请求仍以旧 leaf 和旧的 persisted count 为基准，新提交消息会被当成临时 suffix，
甚至重复接到旧路径上。`getSnapshot()` 必须在每次 `stream()` 时读取 Runtime 当前的
active path 和计数。
:::

:::lab title="实践 13.2 · 实现模型请求前的 context adapter"

**只实现：**

- 临时 entry 构造 helper；
- `createContextProjectingModel()`。

先直接测试 adapter，不急着接 Runtime 的持久化。

**先预测：**

1. 已恢复 2 条消息，本轮新增 1 条 user，临时 suffix 应该有几条？
2. 预算只容纳最新 interaction 时，adapter 能否自己 `slice(-N)`？
3. tools 需要参与第 11 章消息预算吗？它们是否仍要交给 inner model？

**不变量：**

```text
model input = buildContext(active path + unpersisted suffix)
buildContext 是唯一消息裁剪入口
tools 保留且隔离，signal 原样传递
临时 entry 不写 session
```

**最小控制流：**

```text
stream(context, options)
  snapshot = getSnapshot()
  validate persistedMessageCount
  path = structuredClone(snapshot.activePath)
  suffix = context.messages.slice(persistedMessageCount)
  entries = path + chainTemporaryEntries(suffix)
  projected = buildContext(entries, budget + systemPrompt)
  return inner.stream(
    clone({ systemPrompt: projected.systemPrompt,
            messages: projected.messages,
            tools: context.tools }),
    { signal: options.signal }
  )
```

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 13.2" \
  packages/pi-course/dist/test/13-*.test.js
```

**通过后记录：**

```text
persisted messages: 2
temporary suffix: 1
inner messages: old question, old answer, temporary user
budget result: latest interaction only
same signal: true
shared tools reference: false
Lab 13.2: 3/3
```

**常见误区：**

- 直接把 Agent 的全部 messages 交给 `buildContext()`，忽略 compaction entry；
- 把已持久化消息再次包装成临时 entry，造成重复；
- 在 adapter 里另写 token 裁剪；
- 丢掉 tools，模型在下一次请求中突然失去动作空间；
- 创建新的 `AbortController`，切断 Runtime 的取消链；
- 捕获创建时的 path，不在每次请求读取新 snapshot。
:::

## 第三步：让 prompt 的完成等于事实已经落盘

前两段已经恢复 Agent，并让每次模型请求使用正确上下文。现在才进入 Runtime 最重要的
职责：把一次 run 产生的新消息可靠地追加到 session。

### 先完成对象图

配置 system prompt 和资源上下文按固定顺序拼接：

```text
configured system prompt

# Pi resources
...
```

没有配置文字就只用资源；catalog 为空就不要制造空标题；两者都没有时传
`undefined`。资源正文仍由第 12 章的 `formatResourceContext()` 生成，Runtime 不解析
Skill。

工具执行器也只接一次：

```ts
const coreExecutor: ToolExecutor = (call, context) =>
  executeToolCall(call, deps.tools, context);

const toolExecutor = deps.extensionHost
  ? deps.extensionHost.wrapExecutor(coreExecutor)
  : coreExecutor;
```

最终 `createRuntime()` 只创建一个 Agent：

```text
inner model
  → createContextProjectingModel()
  → Agent

ToolRegistry
  → executeToolCall()
  → extensionHost.wrapExecutor()
  → Agent
```

不要创建一份“有扩展的 tools”和一份“给 Agent 展示的 tools”。Agent 的 tool schema
和 executor 必须来自同一个 Registry。

### 只保存本轮新增的 suffix

恢复历史已经在 Agent state 里，不能每次 prompt 后整段重写。真正的新消息边界是：

```ts
const beforeCount = this.agent.getState().messages.length;
const result = await this.agent.prompt(value);
const suffix = result.messages.slice(beforeCount);
await this.persist(suffix);
```

`beforeCount` 必须在当前排队操作真正开始时读取，不能在调用 `Runtime.prompt()` 时读取。
两个 prompt 几乎同时进入队列时，第二个调用发生时第一个还没更新 Agent；若二者都记录
同一个旧长度，第二个会把第一轮消息再追加一次。

每条 suffix 转成一条 message entry：

```text
id        = deps.createId()
parentId  = 当前 activeLeafId
timestamp = deps.now()
message   = structuredClone(message)
await session.append(entry)

append 成功后才更新：
  activePath
  persistedMessageCount
  activeLeafId
```

先 append，后更新内存。Store 拒绝一条 entry 时，Runtime 不能假装它已经成为活动
leaf。

### 用一条队列串行 prompt

第 09 章的 Agent 拒绝并行 prompt，Runtime 应把并发调用排队，而不是把 “Agent is
busy” 暴露成随机时序错误。最小队列是一条 promise tail：

```text
operation = operationTail.then(runAgentAndPersist)
operationTail = operation.then(
  success → undefined,
  failure → undefined
)
return operation
```

tail 自己吞掉完成状态，只为保证后续操作能排在它之后；当前 `operation` 的失败仍原样
返回给调用者。不要写成 `operationTail = operation`，否则前一项失败会让后一项跳过
自己的健康检查。

### append 失败后必须 poison

一次 prompt 可能要追加 user、assistant(tool call)、toolResult、assistant 四条消息。
若前两条成功、第三条失败，Runtime 已经处在部分提交状态。它无法知道磁盘是否只写了
一部分，也不能安全地从内存继续。

因此第一次 append 失败时保存原始原因：

```text
poisoned = true
poisonCause = error
throw error
```

后续 `prompt()` 和 `flush()` 都抛出同一个 `poisonCause`，不再调用 model 或 Store。
这不是自动修复。使用者要关闭 Runtime，检查 session，再显式选择可恢复的 leaf 创建
新实例。

### flush 和 dispose 的边界

`flush()` 等待当前队列，再检查 poison。它不创建新任务。

`dispose()` 做两件事：

1. 立即关闭新 prompt 入口；
2. 等待 dispose 之前已经被 Runtime 接受的任务全部落盘。

所以检查 `disposed` 要发生在 `prompt()` 调用时。一个 prompt 已经进入队列，即使尚未
轮到 Agent，也属于已接受工作；dispose 不能把它悄悄丢掉。重复 dispose 返回同一个
Promise。

:::lab title="实践 13.3 · 接通资源、扩展、持久化队列和生命周期"

**实现：**

- 固定顺序的 system prompt 合并；
- projecting model 与 extension-wrapped executor 的最终接线；
- `RuntimeImpl.persist()`；
- `RuntimeImpl.prompt()`、`flush()` 和 `dispose()`；
- 当前 active path、persisted message count 与 leaf 的更新。

**先预测：**

1. `Agent.prompt()` 已返回、第二条 entry 还在等待磁盘时，`Runtime.prompt()` 能否先
   resolve？
2. 两个 Runtime prompt 同时调用，第二个的 `beforeCount` 应该何时读取？
3. append 第三条失败后，再调用 prompt，模型请求数应不应该增加？
4. dispose 前已经排队、但还没有进入 Agent 的 prompt，要不要完成？

**不变量：**

```text
prompt resolve ⇒ 本轮 suffix 已全部 append
persisted entry 形成一条以 activeLeafId 为尾的 parent chain
append failure ⇒ Runtime poison with same cause
disposed ⇒ 拒绝新 prompt，但等待已接受任务
resources / extensions / core tools 只接进同一个 Agent
```

**最小控制流：**

```text
Runtime.prompt(value)
  在调用时拒绝 disposed / poisoned
  operation = tail.then:
    再检查 poison
    beforeCount = agent.getState().messages.length
    result = await agent.prompt(value)
    suffix = result.messages.slice(beforeCount)
    await persist(suffix)
    return structuredClone(result)
  更新 tail，但不吞当前 operation 的失败
  return operation

persist(suffix)
  parentId = activeLeafId
  for message in suffix:
    构造 entry snapshot
    try await session.append(entry)
    catch error:
      保存 poisonCause
      throw 同一个 error
    append 成功后更新 path / count / leaf
```

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 13.3" \
  packages/pi-course/dist/test/13-*.test.js
```

**通过后记录：**

```text
extension denied core execution: true
configured prompt before resources: true
inactive skill body visible: false
two queued prompts model order: 1 → 2
session roles: user → assistant → toolResult → assistant → user → assistant
prompt resolved before first append gate: false
poison reused original Error object: true
dispose kept preaccepted prompt: true
Lab 13.3: 3/3
```

**常见误区：**

- Agent 一结束就 resolve，另起后台任务写 session；
- 用最终 transcript 全量追加，复制恢复历史；
- 在 prompt 调用时读取 `beforeCount`，并发排队后产生重复 suffix；
- append 失败后继续使用同一个 Runtime；
- Store 还没确认成功就推进 active leaf；
- dispose 清空队列，丢掉已经接受的工作；
- extension host 只保存在 `runtime.extensions`，却没有真正包住 executor；
- 把 inactive Skill 正文也拼进 system prompt。
:::

## 故意把它弄坏

这次故障实验把 poison 状态拿掉，只改一个根规则，不叠补丁。

:::failure title="失败注入 · Runtime 忘记第一次 append 失败"
在 `RuntimeImpl.persist()` 的 `catch` 中，暂时删掉保存 poison 状态的两行，只保留
`throw error`：

```ts
catch (error) {
  // 暂时删掉：
  // this.poisoned = true;
  // this.poisonCause = error;
  throw error;
}
```

运行：

```bash
node --test --test-name-pattern="Lab 13.3 · 只追加恢复历史之后的新 suffix" \
  packages/pi-course/dist/test/13-*.test.js
```

你应该看到第一次 append 仍然失败，但下一次 prompt 又调用了模型或 Store。第一次偏差
不是“错误信息不一样”，而是 Runtime 在部分提交后继续接受了新事实：

```text
expected model requests after second prompt: 1
observed:                              2
violated invariant: append failure ⇒ Runtime poison with same cause
```

恢复这两行，再重跑同一条命令。正确结果是后续 prompt 和 `flush()` 都得到第一次的
`diskError`，model request 仍为 `1`，Store 也不再追加。

不要用“把失败 entry 再写一次”修这个测试。磁盘 I/O 失败时，Runtime 不知道底层到底
提交了多少字节；自动重试可能把一个不确定事实写成两个。
:::

## 第四步：Mode 只负责一次呈现

有了 Runtime，入口层已经很薄：

```ts
export async function runMode(
  runtime: Runtime,
  mode: "interactive" | "print" | "json",
  prompt: string,
  io: ModeIO,
): Promise<AgentRunResult>
```

本章的 mode 不是完整 CLI。它们只验证一条边界：

```text
validate mode
  → await runtime.prompt(prompt)       只调用一次
  → interactive / print：写最终 assistant 文本
  → json：写 { reason, steps, messages } + 换行
  → 返回结果深副本
```

未知 mode 要在调用 Runtime 前失败。输出 sink 抛错则原样上抛，但不能撤销已经完成的
session 写入：模型和落盘属于 Runtime 事实，屏幕是否写成功属于呈现故障。

这里不增加版本号、sequence、stderr、exit code、配置解析或 doctor。那些都可以成为
真实产品的入口契约，却不是本章要证明的对象图问题。现在加进去，只会把持久化故障和
协议呈现混在同一批测试里。

:::lab title="实践 13.4 · 让三种 mode 只借用 Runtime.prompt"

**只实现：**

- `finalAssistantText()`；
- `runMode()`。

不要创建 Agent、Store、ResourceCatalog 或 ExtensionHost。

**先预测：**

1. interactive 和 print 是否需要不同的 Agent？
2. 未知 mode 传入时，Runtime 的 prompt 计数应该是多少？
3. Runtime 已经完成落盘，随后 `io.write()` 失败，session 是否回滚？

**不变量：**

```text
每次 runMode 只调用一次 Runtime.prompt
mode 只改变输出编码，不改变 AgentRunResult
未知 mode 不运行 prompt
IO failure 不伪装成 Runtime failure，也不回滚事实
```

**最小控制流：**

```text
runMode(runtime, mode, prompt, io)
  validate mode
  result = await runtime.prompt(prompt)
  if mode === "json":
    output = JSON.stringify({ reason, steps, messages }) + "\n"
  else:
    output = 最后一条 assistant 的 textOf()
  await io.write(output)
  return structuredClone(result)
```

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 13.4" \
  packages/pi-course/dist/test/13-*.test.js
```

**通过后记录：**

```text
interactive prompt calls: 1
print prompt calls: 1
json prompt calls: 1
unknown mode prompt calls: 0
json trailing newline: true
IO error preserved: true
Lab 13.4: 2/2
```

**常见误区：**

- mode 内 `new Agent()`；
- JSON mode 绕过 Runtime 直接调用 model；
- 为 interactive 写第二套 session 持久化；
- 先调用 prompt，再验证 mode；
- catch 输出错误后返回一个伪造的 Agent error；
- 在这一段顺手加入 wire version、seq、config doctor 和进程退出码。
:::

## 本章验收

先做黑盒验收，跑本章全部 10 项：

```bash
npm run build -w @pi/course
node --test packages/pi-course/dist/test/13-*.test.js
```

预期分段：

```text
Lab 13.1  2/2
Lab 13.2  3/3
Lab 13.3  3/3
Lab 13.4  2/2
total      10/10
```

再跑当前练习目录里的全部课程测试：

```bash
node --test packages/pi-course/dist/test/*.test.js
```

最后做三项结构检查：

```bash
rg -n "interactive|print|json|runMode" \
  packages/pi-course/src/agent.ts \
  packages/pi-course/src/agent-loop.ts

rg -n "buildContext|wrapExecutor|session\\.append" \
  packages/pi-course/src/composition.ts

git diff -- \
  packages/pi-course/src/agent.ts \
  packages/pi-course/src/composition.ts
```

第一条应没有结果。第二条应把 context、extension 和 persistence 的接线都定位在
composition root。第三条用来确认 `agent.ts` 只有 `initialMessages` 接缝，没有混进
session 或 mode 分支。

本章 10 项公开测试锁住：

```text
13.1  空 session 的唯一 Runtime 外壳
13.1  显式 leaf、活动路径与历史深复制
13.2  未持久化 suffix 接到活动路径
13.2  固定成本与完整 interaction 裁剪
13.2  tools / signal 传递与输入隔离
13.3  resources、extension、串行 resolve 与 parent chain
13.3  只追加新 suffix，失败后 poison
13.3  flush / dispose 的已接受工作边界
13.4  interactive / print 只写最终文本
13.4  JSON 呈现、未知 mode 与 IO 故障
```

:::checkpoint title="Checkpoint 13 · 一个 Runtime 拥有恢复、投影和落盘"
**完成状态：** 非空 session 必须显式选择 leaf；Agent 从该路径恢复。每次模型请求都由
adapter 把未持久化 suffix 接到当前活动路径，再调用唯一 `buildContext()`。Runtime
串行接受 prompt，等新增消息全部 append 后才返回；append 失败后 fail-closed。

**观察证据：** Lab 13.1–13.4 按 `2/2 → 3/3 → 3/3 → 2/2` 全绿；resources 出现在
配置 prompt 之后；inactive Skill 正文不可见；extension 真正包住核心 executor；
dispose 等待已经接受的 prompt。

**恢复：** 从 target
`1caf1082b3f92504346bbeda969e4cfbb0f8f636` 对照本章。若只撤销本章，Agent、session、
context、resources 和 extension 仍能独立工作，但系统失去统一的恢复、投影和落盘
负责人。
:::

## 和陪练 Agent 一起复盘

不要让陪练直接展示整个 target diff。让它按下面的顺序和你核对，每次只看一个函数：

1. 让你先说 `activeLeafId` 为 `null` 时，空 session 和非空 session 各会怎样；
2. 对照 `AgentOptions` 与 constructor，只检查历史是否深复制；
3. 对照 `createContextProjectingModel()`，画出 persisted prefix 与 temporary suffix；
4. 对照 `RuntimeImpl.prompt()`，找出 `beforeCount` 的读取位置和 resolve 时机；
5. 对照 `persist()`，解释为什么 append 成功后才推进 leaf；
6. 对照 `dispose()`，列出调用前已接受和调用后新到达的两类 prompt；
7. 最后才看 `runMode()`，确认它没有任何核心构造权。

如果某项测试失败，先记录四行：

```text
输入是什么：
预期第一件事：
实际第一件事：
最先违反的不变量：
```

这比从报错行开始随手补条件可靠。比如第二个并发 prompt 重复写历史，根因通常不在
`session.append()`，而在 `beforeCount` 读取得太早。

一周后再回来，只做一道复现题：

> 第一次 prompt 的模型已经返回，session 正在写第二条消息。此时又调用 prompt，然后
> 调用 dispose。请按时间顺序说明两个 prompt、flush、dispose 分别何时完成；再说明第二
> 条 append 失败后，哪些调用必须得到同一个错误。

能把这条时间线讲清楚，就已经抓住了本章，而不是只记住了一个 Promise 写法。

## 可选迁移练习

这次不让你面对空文件。目标是增加一个 library adapter：它不写 stdout，只返回调用者
需要的摘要。核心代码保持不动。

:::transfer title="有脚手架的迁移 · 增加一个内存消费者"
先复制这个脚手架到单独的练习文件：

```ts
interface LibraryResult {
  reason: AgentRunResult["reason"];
  text: string;
}

export async function runLibrary(
  runtime: Runtime,
  prompt: string,
): Promise<LibraryResult> {
  // 只允许调用一次 runtime.prompt()
  // 从结果中找最后一条 assistant
  // 返回 reason 与 textOf(assistant)
}
```

按三步完成：

1. 先用 fake Runtime 记录 prompt 次数，只写断言 `calls === 1`；
2. 再让 fake 返回两条 assistant，断言只取最后一条；
3. 最后让 `runtime.prompt()` 抛出原始 Error，断言 adapter 不改写它。

陪练每次只给你当前一步的一个断言，不给完整函数。验收时检查
`agent.ts`、`agent-loop.ts`、`session.ts` 和 `composition.ts` 都没有 diff。这个练习
只是在已有 Runtime 外面增加一个消费者，不是在核心里增加第四种 mode。
:::

## 小结

- Composition root 只负责接线和生命周期，不重写已有部件。
- 非空 session 必须显式选择 active leaf，物理最后一行不代表用户意图。
- Agent 只增加 `initialMessages` 深复制接缝，session 恢复仍归 Runtime。
- Model adapter 在每次请求前把未持久化 suffix 接到当前路径，并调用唯一
  `buildContext()`。
- Runtime 只追加本轮新消息；prompt 等落盘后返回，并发调用按队列串行。
- append 失败后 Runtime 保留同一 poison cause，不再继续模型或存储操作。
- dispose 拒绝新 prompt，但等待调用前已经接受的任务。
- interactive、print 和 JSON 只借用 `Runtime.prompt()`，只改变输出形式。
