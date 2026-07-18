---
id: "05"
slug: provider-adapter
part: foundations
partTitle: 第一部 · 建立可执行语言
chapter: "05"
title: 把真实流式协议挡在边界外
summary: 分四步把 canonical 消息翻译成请求，再把 OpenAI-compatible SSE 还原成统一模型事件。
minutes: 240
difficulty: 核心
artifact: packages/pi-course/src/provider-adapter.ts
prerequisites: 03,04
terms: provider adapter, transport, normalized chunk, incremental JSON, finish reason
upstream: packages/ai/src/api/openai-completions.ts
---

## 你将得到什么

第 04 章的 `ScriptedModel` 已经能稳定生成 `ModelEvent`。真实模型服务却不认识这套
课程协议。它接收自己的 message 和 tool schema，再通过 SSE 返回文本碎片、工具参数
碎片、结束原因和 token 用量。

如果 Agent loop 直接读取这些外部字段，每接入一个 provider，都要修改循环、消息和
错误处理。本章会把外部协议收进一个边界。完成后，`ScriptedModel` 和真实服务都以
同一个 `Model.stream()` 接口交给上层使用。

本章引入的主要复杂性是：**外部数据会分块到达，而且在验证前都不可信。**

你会修改两个文件：

- 在 `types.ts` 中补上工具定义，让模型请求可以携带工具；
- 在 `provider-adapter.ts` 中实现出站转换、入站状态机和 SSE transport。

本章内容较多，建议分两次完成。第一次做到实践 5.2，先打通纯转换和离线 chunk；
第二次再处理 SSE、HTTP 与密钥。每个阶段都有独立测试，不需要一次写完全部实现。

重新练习时，运行：

```bash
npm run practice -w @pi/course -- 05 <新目录>
```

练习工具会保留第 04 章的源码，注入第 05 章测试，并额外放入一个学习脚手架。
脚手架只声明本章公共类型和函数入口。每个尚未实现的入口都会抛出带 Lab 编号的
错误，因此你可以先让项目通过编译，再逐段替换这些错误。它不是 target 的实现。

本章不变量是：

> Provider 专属字段只存在于 adapter 与 transport 内部。Agent 的消息、循环和工具
> 只依赖课程定义的 canonical 类型。

## 先建立全景

先把本章拆成三层：

```text
AgentContext
    │
    ├─ adapter 出站映射
    │    toProviderMessages() / toProviderTools()
    ▼
ProviderRequest
    │
    ├─ transport 发出 HTTP 请求
    │                         raw SSE / unknown JSON
    │                                  │
    │                     transport 分帧并验证
    │                                  ▼
    │                           ProviderChunk
    │                                  │
    └──── ModelEvent ← adapter 入站状态机 ─┘
```

三层分别回答不同的问题：

| 层 | 输入 | 输出 | 负责什么 |
|---|---|---|---|
| 出站转换 | `AgentContext` | wire messages 与 wire tools | 字段和角色映射 |
| adapter 状态机 | `ProviderChunk` | `ModelEvent` 与最终消息 | 累积 partial、顺序和终态 |
| transport | URL、密钥、raw SSE | `ProviderChunk` | HTTP、SSE 分帧、外部数据验证 |

这里的 `ProviderChunk` 是课程内部使用的归一化 chunk。它已经去掉 URL、header 和
OpenAI-compatible JSON 的嵌套结构，但仍保留流式语义：

```ts
export type ProviderChunk =
  | { type: "text"; delta: string }
  | {
      type: "tool";
      index: number;
      id?: string;
      name?: string;
      argumentsDelta?: string;
    }
  | {
      type: "finish";
      reason: "stop" | "length" | "tool_calls";
      usage?: Partial<Usage>;
    };
```

adapter 只处理这三种 chunk。它不关心数据来自真实网络还是离线数组，所以前半章
可以完全离线完成：

```ts
export interface ProviderTransport {
  stream(
    request: ProviderRequest,
    options: { signal?: AbortSignal },
  ): AsyncIterable<ProviderChunk>;
}
```

真实 transport 和 `fixedTransport()` 都实现这个接口。前者读取 SSE，后者按顺序
产出测试数组。它们可以替换使用，因为 adapter 只看 `ProviderChunk`。

:::predict title="运行前先判断"
一个工具参数分两次到达。第一块是 `{"path":`，第二块是 `"README.md"}`。
收到第一块时，能否立即调用 `JSON.parse`，解析失败后把这次工具调用标为无效？
---answer
不能。第一块是合法流的中间状态。adapter 要先按工具 index 累积原始字符串。
只有收到 finish chunk 后，才知道参数是否完整。即使 JSON 完整，第 06 章仍要再按
工具 schema 验证，才能执行。
:::

:::rebuild title="Checkpoint 05 · 分四步隔离真实 provider"
**模式：** 重建。从 04 的 target 开始，依次完成类型、出站转换、归一化状态机和
SSE transport。

**起终点：** parent 是本章开始时的起点快照；target 是 11 项聚焦测试通过的终点
快照。

**怎么使用这张卡：** 先把它当作路线图。读完当前实践前面的数据形状和控制流，
再执行这一段。不要从这张卡直接跳到完整实现。

**教学文件：** `packages/pi-course/src/types.ts`、
`packages/pi-course/src/provider-adapter.ts`

**动手前只需知道：** `ToolDefinition` 描述模型可以请求的工具；
`ProviderChunk` 是 transport 验证后的流式片段；adapter 在一次 `stream()` 内保存
文本和工具参数的累计状态；finish chunk 决定最终停止原因。

**第一次红灯：** 首次 build 会报告 `types.ts` 没有导出 `ToolDefinition`，并且
`AgentContext` 没有 `tools` 属性。先补这两个类型；不要先写 SSE parser。

**第一步：**
1. 运行 build，确认红灯只指向 `ToolDefinition` 和 `AgentContext.tools`。
2. 按实践 5.1 完成类型与出站转换，只运行“出站转换”测试。
3. 按实践 5.2 完成归一化状态机，只运行“normalized transport”测试。
4. 按实践 5.3 解析 SSE，只运行名称含“SSE”的测试。
5. 按实践 5.4 收紧请求和密钥边界，再运行本章全部测试。

**聚焦测试：** `packages/pi-course/test/05-provider-adapter.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 05`

**练习目录：** `npm run practice -w @pi/course -- 05`

**聚焦运行：** `npm run build -w @pi/course`，然后 `node --test packages/pi-course/dist/test/05-*.test.js`

**通过证据：** 11 项聚焦测试覆盖本章支持的主要出站映射、normalized chunk 的顺序与
partial、SSE 分帧与外部数据验证、结束原因、usage、取消和密钥脱敏。

第一次尝试禁止查看完整答案。卡住时，让陪练先判断问题落在三层中的哪一层，再按
“数据形状 → 当前状态 → 下一个事件”的顺序给提示。
:::

## 第一步：先把 canonical 消息翻成请求

### 为 context 补上工具定义

模型需要知道有哪些工具可以调用。先在 `types.ts` 中加入最小描述：

```ts
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AgentContext {
  systemPrompt?: string;
  messages: AgentMessage[];
  tools?: ToolDefinition[];
}
```

`parameters` 保存 JSON Schema。此处只负责把 schema 交给模型；第 06 章才会用它
验证模型给出的参数。

### 逐种角色写映射

`toProviderMessages()` 是纯函数。输入有四种语义，输出规则如下：

| canonical 输入 | wire 输出 |
|---|---|
| `systemPrompt` | `{ role: "system", content }` |
| user message | `{ role: "user", content }` |
| assistant text / tool call | `content` 与 `tool_calls` |
| tool result | `role: "tool"`，并保留同一个 `tool_call_id` |

先写一个小 helper，把 content 中所有 text block 取出并用换行连接。然后遍历
`context.messages`，按 `role` 处理每一种消息。

assistant 的工具参数有一条容易漏掉的规则：

```ts
arguments:
  call.rawArguments ?? JSON.stringify(call.arguments ?? {})
```

如果 provider 原先给过 `rawArguments`，就原样发回。重新序列化可能改变尚未验证的
字符串，也可能隐藏截断信息。没有原文时，才序列化 canonical `arguments`。

`toProviderTools()` 的工作更直接：把每个 `ToolDefinition` 包进
`{ type: "function", function: ... }`。没有工具时返回 `undefined`，这样请求体不会
出现一个没有意义的空数组。

:::lab title="实践 5.1 · 完成类型与出站转换"
**目标：** 让 canonical context 稳定变成完整 wire payload，且不修改输入。

**文件：** `packages/pi-course/src/types.ts`、
`packages/pi-course/src/provider-adapter.ts`

**动作：**
1. 在 `types.ts` 中加入 `ToolDefinition`，再给 `AgentContext` 加可选的 `tools`。
2. 在 `provider-adapter.ts` 中写 `textValue()`，只读取 text block。
3. 实现 `toProviderMessages()` 的 system、user、assistant 和 tool result 分支。
4. assistant tool call 优先使用 `rawArguments`，并保留 id 与 name。
5. 实现 `toProviderTools()`；没有工具时返回 `undefined`。
6. 不修改传入的 context。测试会在调用后比较完整输入快照。
7. 先 build，再只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="出站转换" \
  packages/pi-course/dist/test/05-*.test.js
```

**预期：** `1/1`。测试会比较完整 messages 和 tools，不只检查 role 名称；输入对象
在转换后保持不变。
:::

## 第二步：把 normalized chunk 还原成模型事件

实践 5.1 只处理完整对象。入站流不同：文本和工具参数可以交错到达。adapter 必须在
一次 `stream()` 调用中保存四类状态：

| 状态 | 用途 |
|---|---|
| `content` | 当前已经出现的 canonical content block |
| `textContentIndex` | 文本第一次出现时占用的槽位 |
| `toolBuffers` | 按 provider tool index 累积 id、name 和参数原文 |
| `finish` | 保存结束原因与 usage |

这些变量必须写在 `stream()` 内。若放在模块级，两个请求会共用 buffer，工具参数
就可能串到另一个会话里。

### 槽位由首次出现顺序决定

provider 的工具 index 只用来把后续 delta 找回同一个工具。它不等于 canonical
content index。看下面的到达顺序：

```text
provider tool index=4  第一次出现
text                   第一次出现
provider tool index=2  第一次出现
```

canonical content 的槽位应当是：

```text
content[0] = tool index 4
content[1] = text
content[2] = tool index 2
```

第一次看到某个工具时，记录 `contentIndex: content.length`，并立刻放入一个未完成
的 tool call block。后续 chunk 只更新这个槽位。不要用 provider index 直接计算
`contentIndex`。

每个 delta 事件都要携带**应用当前 delta 后**的累计 partial。用
`structuredClone(content)` 保存当时快照，避免后续更新反过来改掉已经发出的事件。

可以先按下面的控制流搭骨架：

```text
push start
for await (chunk of transport.stream(...)):
  text   → 找到或创建文本槽位 → 追加文本 → push text_delta
  tool   → 找到或创建工具 buffer → 追加原文 → push toolcall_delta
  finish → 保存结束原因和 usage

没有 finish → throw
映射 stop reason
按 contentIndex 完成每个 tool call → push toolcall_end
push done
end(finalMessage)
```

工具参数在 delta 阶段仍是字符串。只有 `finish.reason === "tool_calls"` 时才调用
`JSON.parse`。若 reason 是 `length`，保留原始字符串，并把最终 stop reason 设为
`length`。后续循环看到这个原因后会拒绝执行工具。

try/catch 要包住整个异步消费过程。transport 抛错时，adapter 用已有 `content`
构造 error message；取消则使用 `aborted`。两条路径都要发送 `error` 事件，并用
同一条消息完成 `result()`。

:::lab title="实践 5.2 · 完成 normalized transport 状态机"
**目标：** 用离线 chunk 证明顺序、累计 partial、工具完成和失败语义。

**文件：** `packages/pi-course/src/provider-adapter.ts`

**动作：**
1. 实现 `fixedTransport()`，让它按数组顺序 `yield` 每个 chunk。
2. 在 `createOpenAICompatibleModel()` 的每次 `stream()` 内创建 `content`、
   `textContentIndex`、`toolBuffers` 和 `finish`。
3. 先发送 `start`。文本和工具第一次出现时各自占用一个 content 槽位。
4. 每次 delta 都先更新槽位，再克隆整个 content，最后发送对应事件。
5. 收到 finish 后映射 `stop`、`length` 和 `toolUse`。
6. 按 `contentIndex` 完成工具。`toolUse` 才解析 JSON；`length` 保留字符串。
7. 正常路径发送 `done` 并结束流；异常和取消发送 `error` 并结束流。
8. 先 build，再运行本段三项测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="normalized transport" \
  packages/pi-course/dist/test/05-*.test.js
```

**预期：** `3/3`。测试会故意让 provider tool index 以 4、2 的顺序出现，从而证明
content index 取决于首次出现顺序。它还会检查每个 partial 的完整快照、transport
异常，以及 `length` 下未完成的参数字符串。
:::

完成实践 5.2 后可以休息。此时 adapter 的核心语义已经通过离线测试。下一步只把
raw SSE 安全地转换成相同的 `ProviderChunk`。

## 第三步：把 raw SSE 变成受信任的 ProviderChunk

transport 收到的 JSON 类型应当是 `unknown`。从外部来的对象只有经过最小形状验证，
才能进入 `ProviderChunk` 联合。处理过程分两段：

```text
字节流 ── SSE 分帧 ──→ data 字符串
data 字符串 ── JSON.parse + 形状验证 ──→ ProviderChunk
```

### SSE 分帧只负责找出完整 data

一个网络 chunk 可能在任意字节处断开，甚至正好切在一行中间。不要把一次
`reader.read()` 当成一条 SSE 事件。维护一个字符串 `buffer`：

1. 用带 `{ stream: true }` 的 `TextDecoder` 解码新字节；
2. 追加到 `buffer`；
3. 每找到一个换行，就取出一行；
4. 收集以 `data:` 开头的行；
5. 遇到空行时，把多条 data 行合并成一条完整 payload；
6. 流结束后，再处理 buffer 和尚未提交的 data。

读取前后都检查 abort signal。`finally` 中取消 reader 并释放 lock，确保正常结束、
解析失败和取消都不会遗留连接。

### JSON 验证只接受课程用到的最小形状

先写 `isRecord(value)`，排除 `null` 和数组。然后逐层验证：

- 顶层 `choices` 必须是数组；
- 普通 payload 只接受一个 streamed choice；`choices` 超过一个时立即拒绝，不挑选
  或合并其中任何一个。尾随 usage payload 可以使用空 `choices`；
- `choice.delta` 必须是对象；
- `delta.content` 若存在，必须是字符串；
- `delta.tool_calls` 若存在，必须是数组；
- 每个 tool call 的 `index` 必须是非负安全整数；
- `finish_reason` 只接受 `stop`、`length`、`tool_calls` 或空值；
- usage token 数必须是非负安全整数。

额外字段可以忽略。关键字段的类型错误要抛出带路径的
`Invalid provider chunk`。不要用类型断言跳过检查。

raw SSE 中出现 `finish_reason` 时，transport 先记录这个原因，不立即向 adapter
发出 finish。usage 可能在后面的 payload 中到达，所以 transport 要继续读取。
遇到 `[DONE]` 或流结束后，再把结束原因和 usage 合成唯一的 finish chunk。若从未
收到 finish reason，adapter 会把这次流转换成 error 终态。

:::lab title="实践 5.3 · 解析 SSE，并守住 unknown 边界"
**目标：** 把任意分块的 OpenAI-compatible SSE 转成经过验证的 `ProviderChunk`。

**文件：** `packages/pi-course/src/provider-adapter.ts`

**动作：**
1. 实现 `isRecord()`、可选字符串、token 数、usage、finish reason 和 tool chunk 的
   最小验证函数。错误信息要指出字段路径。
2. 实现 SSE 行缓冲。网络 chunk 与 SSE event 不要建立一一对应关系。
3. 在 `createOpenAICompatibleTransport()` 中使用可注入的 fetch 取得 Response，
   并逐条读取 data。本段只要求建立最小请求并传递 signal；精确 URL、header、body
   和通用错误脱敏留到实践 5.4。
4. `[DONE]` 只结束读取；真正的停止原因来自已经验证的 `finish_reason`。
5. 合并尾随 usage，再产出一个 finish chunk。
6. 把 abort signal 同时传给 fetch 和 reader 检查。
7. 捕获 transport 异常时保留 `AbortError` 语义。其他错误先交给 adapter 形成
   error 终态；实践 5.4 再补上跨边界前的通用脱敏。
8. 先 build，再运行名称含“SSE”的五项测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="SSE" \
  packages/pi-course/dist/test/05-*.test.js
```

**预期：** `5/5`。测试覆盖交错工具参数、尾随 usage、缺少 finish、流中取消、无效
chunk 和未知 finish reason。所有异步测试都有一秒超时，遗漏终态会立即暴露。
:::

## 第四步：收紧 HTTP 与密钥边界

最后检查 transport 发出的请求。base URL 要先去掉尾部斜杠，再追加
`/chat/completions`。请求必须明确包含：

```ts
{
  method: "POST",
  headers: {
    Accept: "text/event-stream",
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    ...request,
    stream: true,
    stream_options: { include_usage: true },
  }),
  signal,
}
```

API key 由 transport 配置持有。发请求时，它只能写入 `Authorization` header，
不得进入 `AgentContext`、请求 body、canonical message、日志或向外返回的错误
文本。底层 fetch 有时会把 URL 或认证信息放进异常消息，所以 transport 要在异常
越过边界前，把密钥替换成 `[redacted]`。

真实 API 不属于本章验收。测试会注入离线 fetch，并检查 URL、header、body、signal
和错误内容。这样测试不消耗费用，也不依赖远端服务状态。

:::lab title="实践 5.4 · 固定请求形状并保护密钥"
**目标：** 证明 transport 发出的完整请求可控，并让测试覆盖的底层错误在越过边界
前完成 API key 脱敏。

**文件：** `packages/pi-course/src/provider-adapter.ts`

**动作：**
1. 用 `new URL()` 验证最终 endpoint 是绝对 URL。
2. 按上面的结构发送 POST，并把同一个 signal 交给 fetch。
3. 确认 body 只含 model、messages、可选 tools、stream 和 usage 选项。
4. 写 `sanitizedTransportError()`；取消保持 `AbortError`，其他错误替换密钥。
5. 运行“fetch transport”测试，再运行本章全部测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="fetch transport" \
  packages/pi-course/dist/test/05-*.test.js
node --test packages/pi-course/dist/test/05-*.test.js
```

**预期：** 局部测试 `2/2`，完整聚焦测试 `11/11`。测试会精确比较请求 body，
并让底层错误主动带上测试密钥，确认最终消息只留下 `[redacted]`。
:::

:::mechanism title="三层边界让失败位置可判断"
出站映射失败，就检查纯函数；事件顺序错误，就检查 adapter 的单次调用状态；SSE
形状或取消失败，就检查 transport。三层共享 `ProviderChunk` 接口，却不共享内部
状态。测试因此可以把一次复杂的真实调用拆成三个确定问题。
:::

:::note title="这 11 项测试没有证明什么"
本章没有证明所有 OpenAI-compatible 服务都兼容，也没有连接真实 provider。课程会
拒绝同时出现多个 streamed choice，只接受当前列出的字段。测试还没有覆盖 SSE 多行
data、CRLF、多字节字符边界、所有无效 chunk、HTTP 非 2xx、空 body、预取消、多个
并发请求或重试，也没有穷尽所有可能携带密钥的错误来源。工具执行和 transcript
更新属于其他边界，同样不能根据本章全绿推断出来。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的 `packages/ai/src/api/openai-completions.ts` 也会累积文本与
工具参数、映射结束原因、解析 usage，并把捕获的异常转换成流内终态。上游还处理
reasoning、图片、签名、成本和更多兼容差异。课程保留闭合主链路所需的子集，并用
`ProviderChunk` 把网络解析与 canonical 事件生成分开。
:::

## 故意把它弄坏

把工具的 `contentIndex` 临时改成 provider 给出的 `chunk.index`：

```ts
// 错误：provider index 只负责关联 delta，不表示 canonical content 位置
contentIndex: chunk.index
```

测试中的工具 index 会按 4、2 到达，中间还穿插文本。错误实现会发出不存在的
content 槽位，第一次偏差出现在第一个 `toolcall_delta.contentIndex`。

:::failure title="预期失败 · 混淆 provider index 与 content index"
运行“normalized transport”测试，先记录第一个实际值和期望值。恢复规则：
工具第一次出现时保存 `content.length`，后续 delta 和 `toolcall_end` 始终复用这个
槽位。恢复后重跑同一项测试，确认所有累计 partial 也回到正确顺序。
:::

## 本章验收

:::checkpoint title="Checkpoint 05 · 真实协议止于 adapter"
运行：

```bash
npm run build -w @pi/course
node --test packages/pi-course/dist/test/05-*.test.js
```

应得到 `11/11`。你还应能回答：

1. 为什么 provider tool index 不能直接当作 content index？
2. 为什么 delta 阶段不能解析工具 JSON？
3. raw SSE 在哪一步从 `unknown` 变成 `ProviderChunk`？
4. API key 允许进入哪些外部可观察位置，哪些位置必须禁止？
5. transport、adapter 和 Agent loop 各自负责哪类失败？

若答案不确定，回到对应的局部测试，不要靠背完整实现。下一章会接住已经完成的
tool call，为它加入 schema 验证和执行契约。
:::

## 可选迁移练习

:::transfer title="迁移 · 为另一种事件名写 transport"
完成本章重建后，再处理一个虚构协议：它使用 `event: token`、`event: action` 和
`event: end`。只写新的 transport，把三类原始事件转换成现有 `ProviderChunk`。
复用本章 adapter 测试，禁止修改 `AgentMessage`、`ModelEvent` 和消费代码。若这些
类型也必须改变，先说明新协议表达了哪一种课程类型无法承载的语义。
:::

## 小结

本章建立了三道边界。出站转换把 canonical context 变成请求；transport 把 raw SSE
验证为 `ProviderChunk`；adapter 再把分块输入还原成累计 partial、工具调用和统一
终态。网络字段与密钥都留在最外层，Agent loop 继续只理解课程协议。

到这里，离线脚本和真实 provider 已经共享同一个模型接口。下一步可以在不改模型
边界的前提下，为工具调用加入参数验证和执行结果。
