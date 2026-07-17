---
id: "03"
slug: message-ir
part: foundations
partTitle: 第一部 · 建立可执行语言
chapter: "03"
title: 为 Agent 建立统一消息语言
summary: 用 provider-neutral 的消息与内容块保存语义，让界面、会话和模型共享同一事实源。
minutes: 100
difficulty: 核心
artifact: workshop/src/types.ts
prerequisites: 02
terms: canonical IR, content block, AgentContext, StopReason, projection
upstream: packages/ai/src/types.ts
---

## 你将得到什么

上一章的 `EventStream<T,R>` 已能正确处理时间，却不知道 `T` 和 `R` 表示什么。若我们直接把某家 SDK 的 chunk 传入 Agent，之后更换 provider、保存会话或调用工具时，传输细节会扩散到每一层。

本章只增加一种主要复杂性：**稳定语义**。你会在 `workshop/src/types.ts` 定义 canonical message IR、content block、`AgentContext`、usage、stop reason 和模型事件；完成后，上一章的通用流可被具体化为 `EventStream<ModelEvent, AssistantMessage>`。

本章不变量是：

> Provider payload、终端字符串和 canonical message 是三个层次；只有 canonical message 可以成为 Agent 的长期事实。

恢复本章起点时，撤销 `workshop/src/types.ts` 与 `workshop/test/foundations-labs.test.ts` 的实验改动；不要通过修改 adapter fixture 来迎合错误消息形状。

## 先建立全景

同一个用户意图，在不同边界有不同表示：

```text
终端输入："读取 README"
        ↓  UI 构造
UserMessage { role: "user", content: [{ type: "text", text: "读取 README" }] }
        ↓  provider adapter 翻译
某家 API 的 { role: "user", content: "读取 README" }
```

中间那层是 Agent 自己的语言。向上，UI 只负责投影；向下，adapter 只负责翻译。若 API payload 被直接存入 session，换 provider 就等于迁移数据库；若终端字符串被当作历史，tool call 的 id 与参数会丢失。

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

正常的 `toolUse` 终态会在 `toolcall_end` 前把完整 JSON 解析进 `arguments`；第 05 章会看到 provider 如何以字符串碎片发送它。若 `length` 截断，课程会把未完成原文保存在 `arguments/rawArguments`，但绝不能执行。第 06 章再依据工具 schema 验证完整对象；解析完成不等于参数有效。

:::lab title="实践 3.1 · 定义消息并实现文本投影"
**目标：** 保留完整语义，同时给 UI 一个安全投影。

**文件：** `workshop/src/types.ts`、`workshop/test/foundations-labs.test.ts`

**动作：**
1. 定义 `TextContent`、`ToolCall` 与三种 message。
2. 实现 `textOf(message)`，只按原顺序提取 text block。
3. 测试含“文本 → toolCall → 文本”的 assistant message。
4. 证明投影没有修改原 content 数组。

**运行：** `npm run workshop:test -- types`

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

`toolResult` 是独立角色，因为它代表环境对特定 call 的观察，不是用户补充，也不是模型自述。`error` 和 `aborted` 仍是最终 `AssistantMessage` 的 stop reason：这样部分文本、usage 与错误说明可以组成一次完整但失败的模型事实。

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

前两类和 `length` 通过 `done` 事件结束，后两类通过 `error` 事件结束；它们最终都能由 `result()` 取得。事件名说明运行路径，message 的 stop reason 说明最终语义，两者必须相互匹配。测试要拒绝 `done + error` 或 `error + stop` 这种内部矛盾。

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

**文件：** `workshop/src/types.ts`、`workshop/test/model-stream.test.ts`

**动作：**
1. 定义 `ModelEvent`。
2. 创建识别 `done | error` 的 `EventStream<ModelEvent, AssistantMessage>`。
3. 分别推送成功和 aborted 终态。
4. 断言事件携带的 message 与 `result()` 是同一个最终事实。

**运行：** `npm run workshop:test -- types`

**预期：** 两条路径都 resolve；aborted 路径不产生未处理的 rejection，且 `errorMessage` 被保留。
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

:::failure title="预期失败 · 丢掉 toolCallId"
临时从 `ToolResultMessage` 删除 `toolCallId`，运行配对测试。首次偏差应发生在“结果找不到来源调用”，而非最终渲染。恢复字段，并保留 `isError`，因为失败也必须与原 call 配对。
:::

## 本章验收

:::checkpoint title="Checkpoint 03 · 核心拥有自己的语言"
运行 `npm run workshop:test -- types` 应通过。你能把任意消息区分为 canonical IR、provider payload 和 UI 投影，能解释五种 stop reason 对控制流的影响，并能说明 context 为什么不是 session。下一章会让 `ScriptedModel` 按这套协议产生确定的事件与结果。
:::

## 可选迁移练习

:::transfer title="迁移 · 增加只读的 image block"
独立设计 `ImageContent`，要求包含 MIME type 与数据引用；判断它能出现在哪些 message 中，并修改穷尽投影测试。不要把图片伪装成文本 URL。完成后写一句说明：为什么课程主线暂不把它加入公共接口。
:::

## 小结

Canonical message IR 把 Agent 的长期语义从界面和 provider 中解耦。Content block 保存类型与顺序，三种角色表达不同所有权，stop reason 驱动控制决策，context 只是一次请求的输入视图。现在数据和时间都有了稳定契约，下一步才能用确定性模型把它们变成可执行规格。
