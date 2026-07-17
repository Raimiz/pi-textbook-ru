---
id: "03"
slug: message-ir
part: foundations
partTitle: 第一部 · 建立可执行语言
chapter: "03"
title: 给 Agent 一套自己的消息格式
summary: 用稳定的消息和内容块保存语义，不让界面格式或某家模型接口渗进核心。
minutes: 100
difficulty: 核心
artifact: packages/pi-course/src/types.ts
prerequisites: 02
terms: canonical IR, content block, AgentContext, StopReason, projection
upstream: packages/ai/src/types.ts
---

## 你将得到什么

上一章的 `EventStream<T,R>` 已经知道事件怎么到达，却不知道 `T` 和 `R`
具体是什么。如果把某家 SDK 的 chunk 直接传进 Agent，换模型服务、保存会话和
调用工具时，每一层都会依赖那家 SDK。

本章给 Agent 定义一套自己的消息格式。这里把它叫作 canonical message：
它是系统认可、可以保存和重放的统一消息。你会新增
`packages/pi-course/src/types.ts`，并修改
`packages/pi-course/src/event-stream.ts`，让上一章的通用流变成
`EventStream<ModelEvent, AssistantMessage>`。

本章不变量是：

> Provider payload、界面文字和 canonical message 分属三层。只有 canonical
> message 能成为 Agent 长期保存的事实。

需要重新开始时，用 `npm run practice -w @pi/course -- 03 <新目录>` 创建新练习。
不要修改注入测试，也不要为了适配后续 provider 样例而扭曲本章的消息结构。

:::rebuild title="Checkpoint 03 · 先定义不会随 provider 改变的事实"
**模式：** 重建。从 02 的 target 开始，先定义统一消息，再让 EventStream 使用它。

**起终点：** parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。

**教学文件：**
- `packages/pi-course/src/types.ts`
- `packages/pi-course/src/event-stream.ts`

**动手前只需知道：**

- content block 是消息里有顺序的一小块内容；
- canonical message 是 Agent 自己保存的统一消息；
- 投影是从完整消息中取出某个只读视图，例如只取文本；
- `StopReason` 说明模型为什么结束，并决定下一步控制流。

**第一次红灯：** 首次 build 会同时报告两处真实缺口：
`event-stream.js` 没有导出 `AssistantMessageEventStream`，并且找不到
`../src/types.js`。因此本章必须修改两个源文件。

**第一步：**
1. 先运行 build，确认上面两条错误。
2. 在 `types.ts` 定义消息类型和 `text`、`assistantMessage`、`textOf`。
3. 在 `event-stream.ts` 先声明可编译的临时 `AssistantMessageEventStream`，
   只运行“文本投影”测试。
4. 再把临时类改成真正识别 `done | error` 的消息流，运行完整测试。

**聚焦测试：** `packages/pi-course/test/03-message-ir.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 03`

**练习目录：** `npm run practice -w @pi/course -- 03`

**聚焦运行：** `npm run build -w @pi/course`，然后 `node --test packages/pi-course/dist/test/03-*.test.js`

**通过证据：** 2 项聚焦测试通过：文本投影不修改原 content；`error` 事件会
自行结束流，而且 `result()` 返回传入事件的那条 `AssistantMessage`，其中的
错误说明没有丢失。你还能解释 provider payload、统一消息和界面投影为什么不能混用。

第一次尝试禁止查看完整答案；让陪练先定位最小 helper，不要一次展开整个消息联合。
:::

## 先建立全景

同一个用户意图，在不同边界有不同表示：

```text
终端输入："读取 README"
        ↓  UI 构造
UserMessage { role: "user", content: [{ type: "text", text: "读取 README" }] }
        ↓  provider adapter 翻译
某家 API 的 { role: "user", content: "读取 README" }
```

中间那层才是 Agent 自己保存的消息。UI 从中取出适合显示的内容，adapter 把它
翻译成某家 API 的格式。若 session 直接保存 API payload，换 provider 就要迁移
历史数据；若只保存终端文字，tool call 的 id 和参数会直接丢失。

:::predict title="运行前先判断"
把 assistant 的所有 content block 用 `JSON.stringify` 或字符串拼接成一段文本，是否仍能无损恢复“先解释一句，再请求 read 工具”？
---answer
不能可靠恢复。文本和 tool call 的顺序、类型、call id、工具名及结构化参数都需要独立字段。把它们压成字符串后，显示格式会变成协议，稍改换行就可能破坏恢复。
:::

## Content block 保存有顺序的语义

课程先实现文本和工具调用两种 block。它们共享 `type` 判别字段，却只携带各自合法的数据：

```ts
export interface TextContent {
  type: "text";
  text: string;
}

export interface ToolCall {
  type: "toolCall";
  id: string;
  name: string;
  arguments: unknown;
  rawArguments?: string;
}

export type AssistantContent = TextContent | ToolCall;
```

产生 `toolUse` 终态前，`toolcall_end` 会把完整 JSON 写入 `arguments`。
第 05 章会处理 provider 分段发送的字符串。若输出因 `length` 被截断，系统保留
未完成的 `rawArguments`，但绝不能执行。第 06 章才会按工具 schema 验证参数。
JSON 能解析，只说明格式完整，不说明参数可以执行。

:::lab title="实践 3.1 · 定义消息并实现文本投影"
**目标：** 保留完整语义，同时给 UI 一个安全投影。

**文件：**
- `packages/pi-course/src/types.ts`
- `packages/pi-course/src/event-stream.ts`

**动作：**
1. 定义 `TextContent`、`ToolCall`、三种 message、`StopReason` 与最小 helper。
2. 实现 `textOf(message)`，只按原顺序提取 text block。
3. 为了让整份只读测试先编译，在 `event-stream.ts` 临时声明
   `AssistantMessageEventStream`。它继承
   `EventStream<ModelEvent, AssistantMessage>`，构造器先传入两个不会在本实验
   执行的临时函数，并在提取函数里抛出 `"not implemented in lab 3.1"`。
4. 保持注入测试不动，只运行名称含“文本投影”的第一项测试。

**运行：** `npm run build -w @pi/course`，然后
`node --test --test-name-pattern="文本投影" packages/pi-course/dist/test/03-*.test.js`

**预期：** 文本投影保持两个文本块的顺序；tool call 仍完整存在于原消息中。
:::

## 三种消息承担不同所有权

消息联合不使用大量可选字段，而是让角色决定合法内容：

```ts
export type StopReason =
  | "stop"
  | "length"
  | "toolUse"
  | "error"
  | "aborted";

export interface UserMessage {
  role: "user";
  content: TextContent[];
  timestamp: number;
}

export interface AssistantMessage {
  role: "assistant";
  content: AssistantContent[];
  provider: string;
  model: string;
  usage: { input: number; output: number; totalTokens: number };
  stopReason: StopReason;
  errorMessage?: string;
  timestamp: number;
}

export interface ToolResultMessage {
  role: "toolResult";
  toolCallId: string;
  toolName: string;
  content: TextContent[];
  details?: unknown;
  isError: boolean;
  timestamp: number;
}

export type AgentMessage =
  | UserMessage
  | AssistantMessage
  | ToolResultMessage;
```

`toolResult` 是独立角色。它记录环境对某个 call 的返回，不属于用户，也不是模型
自己说的话。`error` 和 `aborted` 仍保存在最终 `AssistantMessage` 里。这样一次
失败调用也能保留已经生成的文本、usage 和错误说明。

:::mechanism title="StopReason 决定下一步，不是装饰字段"
`stop` 表示可结束本轮；`toolUse` 表示需要执行完整且已验证的调用；`length` 表示输出可能截断，后续绝不能贸然执行其中的工具参数；`error` 与 `aborted` 终止当前运行。把它们压成一个布尔值会丢失控制语义。
:::

Usage 也属于协议，而不只是日志。`input` 描述本次 context 的消耗，`output` 描述生成量，`totalTokens` 给上层预算与诊断一个统一基线。课程先不计算价格和缓存命中，但仍要求三者是数字字段，因为第 11 章会根据预算重建 context。若 adapter 没拿到可信 usage，应使用明确的缺省策略并保留诊断，不能从文本长度假装得到精确 token 数。

可以把最终消息看成一次模型调用的提交记录：

```text
stop       完成回答，可以结束
toolUse    产生完整调用，交给工具层
length     输出被截断，保留事实但禁止执行调用
error      调用失败，保留 partial 与错误说明
aborted    用户取消，保留 partial 与取消事实
```

`stop`、`toolUse` 和 `length` 通过 `done` 事件结束；`error` 和 `aborted`
通过 `error` 事件结束。两类终态最终都能由 `result()` 取得。事件名表示流走了
哪条路径，message 的 stop reason 表示模型为什么结束。两者必须匹配。当前聚焦
测试只观察 `error + error`；其他组合会在后续模型与 adapter 测试中逐步补齐。

`textOf()` 是有损投影，不能用于重新构造 message。它适合搜索摘要与终端显示；保存和重放必须使用原始 block 数组。函数名和返回类型应让这种损失显而易见，避免调用者把便利函数误当序列化协议。

## Context 是本次请求的输入视图

`AgentContext` 不是整个 session。它只包含本次模型决策需要的 system prompt 与消息序列：

```ts
export interface AgentContext {
  systemPrompt?: string;
  messages: AgentMessage[];
}

const nextContext: AgentContext = {
  systemPrompt: previous.systemPrompt,
  messages: [...previous.messages, newUserMessage],
};
```

用新数组构造下一状态，能让测试比较请求前后的事实。第 10 章会把 session 建成追加式事件树，第 11 章再从历史投影 context；本章不做裁剪，也不把 context 持久化成唯一真相。

消息保留 `timestamp`，但不加入随机 message id。时间由 canonical message 构造器在边界生成，fixture 可显式给定或在断言中归一化；provider 不应另造一套时间字段。到了会话层，稳定 entry id 将由拥有追加责任的组件生成。先明确所有权，再添加元数据，才能避免恢复时出现两个时钟或无法配对的 id。

上一章的流现在可以有准确终态：

```ts
export type ModelEvent =
  | { type: "start"; partial: AssistantMessage }
  | { type: "text_delta"; contentIndex: number; delta: string; partial: AssistantMessage }
  | { type: "toolcall_delta"; contentIndex: number; delta: string; partial: AssistantMessage }
  | { type: "toolcall_end"; contentIndex: number; toolCall: ToolCall; partial: AssistantMessage }
  | { type: "done"; reason: "stop" | "length" | "toolUse"; message: AssistantMessage }
  | { type: "error"; reason: "error" | "aborted"; error: AssistantMessage };
```

`done` 与 `error` 都是流终态，`EventStream.result()` 对两者都 resolve 最终 assistant message。调用者不必猜测 provider 是在首字节前还是中途失败。

:::lab title="实践 3.2 · 让终态与结果一致"
**目标：** 把第 02 章的通用流绑定到消息 IR。

**文件：** `packages/pi-course/src/event-stream.ts`

**动作：**
1. 删除 Lab 3.1 的临时构造逻辑。
2. 让 `AssistantMessageEventStream` 识别 `done | error`。
3. `done` 提取 `event.message`，`error` 提取 `event.error`；其他事件不能生成结果。
4. 运行完整聚焦测试。测试不会额外调用 `end()`；`error` 事件必须自己结束流。
5. 观察 `result()` 是否返回传入事件的那条失败消息，并保留 `errorMessage`。

**运行：** `npm run build -w @pi/course`，然后
`node --test packages/pi-course/dist/test/03-*.test.js`

**预期：** `error` 事件会结束异步迭代，`result()` 返回同一个消息对象。消息保留
`stopReason: "error"` 和 `errorMessage`。测试设有一秒超时；若你的流没有把
`error` 识别为终态，它会明确失败，而不是一直等待。本章没有单独测试 `aborted`。
:::

:::note title="这两项测试到底证明了什么"
2 项聚焦测试证明两件事：`textOf()` 是有损文本投影，但不修改原始 content；
`error` 是协议终态，`result()` 会返回传入事件的消息，并保留错误说明。三种角色、五种
`StopReason` 和 `AgentContext` 仍是后续章节所需的公共协议；本章通过类型检查
和口头解释验收它们，不能说两项行为测试已经覆盖所有组合。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的 `packages/ai/src/types.ts` 同样以 `Message = UserMessage | AssistantMessage | ToolResultMessage`、content blocks、五种 `StopReason` 和 `Context` 建立边界。课程也保留 provider、model、timestamp 与最小 usage；上游还包含 image、thinking、签名、API、缓存与成本。省略部分属于教学简化，不是说额外字段无价值。
:::

## 故意把它弄坏

如果为了“方便打印”把 tool result 改成 assistant 文本：

```ts
// 错误：环境事实失去了 call 的配对键
const fakeResult = assistantMessage(
  [{ type: "text", text: "README 内容是……" }],
  "stop",
);
```

后续 provider 无法知道这段内容回答哪个调用，并行工具更会立刻产生歧义。

:::failure title="预期失败 · 把工具调用混进文本投影"
临时让 `textOf()` 遇到 tool call 时也返回 `block.name`，再运行聚焦测试。第一项测试
应立即得到 `"先读取\nread\n再回答"`，而不是 `"先读取\n再回答"`。恢复只提取
`text` block 的实现，并确认原 content 始终没有被改写。`toolCallId` 的配对约束
会在第 06、07 章由工具与循环测试真正观察。
:::

## 本章验收

:::checkpoint title="Checkpoint 03 · 核心拥有自己的语言"
运行 `npm run build -w @pi/course`，再运行
`node --test packages/pi-course/dist/test/03-*.test.js`，结果应为 2/2。确认只修改
`types.ts` 与 `event-stream.ts`。你要能区分统一消息、provider payload 和界面投影，
并说明五种 stop reason 各自要求什么控制动作。下一章会让 `ScriptedModel`
按这套协议产生确定事件。
:::

## 可选迁移练习

:::transfer title="迁移 · 增加只读的 image block"
独立设计 `ImageContent`，要求包含 MIME type 与数据引用；判断它能出现在哪些 message 中，并修改穷尽投影测试。不要把图片伪装成文本 URL。完成后写一句说明：为什么课程主线暂不把它加入公共接口。
:::

## 小结

Agent 现在有了自己的消息格式。Content block 保留内容类型和顺序；user、
assistant、toolResult 三种角色各自记录不同来源的事实；stop reason 决定下一步
控制动作；context 只是一次模型请求要看到的消息。数据和时间都有了稳定接口，
下一章才能写一个行为完全可预测的模型。
