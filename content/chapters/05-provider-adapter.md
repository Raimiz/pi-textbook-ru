---
id: "05"
slug: provider-adapter
part: foundations
partTitle: 第一部 · 建立可执行语言
chapter: "05"
title: 把真实流式协议挡在边界外
summary: 用纯转换、离线 chunk fixture 和薄 transport 把 OpenAI-compatible 流归一为统一模型协议。
minutes: 120
difficulty: 核心
artifact: packages/pi-course/src/provider-adapter.ts
prerequisites: 03,04
terms: provider adapter, transport, fixture, incremental JSON, finish reason
upstream: packages/ai/src/api/openai-completions.ts
---

## 你将得到什么

ScriptedModel 已证明上层契约，但真实服务不会发送 `ModelEvent`。它发送自己的 role、SSE chunk、finish reason、usage 和增量 tool arguments。若 Agent loop 直接识别这些字段，一个 provider 的兼容补丁就会污染整个系统。

本章只增加一种主要复杂性：**不可信外部协议的双向翻译**。你会实现 `workshop/src/provider-adapter.ts`，将 `AgentContext` 转为请求 payload，再把固定的 OpenAI-compatible chunk fixture 还原成与 ScriptedModel 相同的事件流。网络 transport 保持很薄，核心测试完全离线。

本章不变量是：

> Provider 原始类型只能存在于 adapter 边界；adapter 之外只出现 canonical message、ModelEvent 与 EventStream。

恢复本章起点时，撤销 adapter 和 fixture 测试中的故障改动，删除本地 `.env` 中不再使用的临时值即可；不要删除 `.env.example`，也不要改 ScriptedModel 来适配真实服务。

:::rebuild title="Checkpoint 05 · 先完成无网络的双向翻译"
**模式：** 重建。从 04 的 target 开始，把外部 wire protocol 挡在 adapter 内。

**起终点：** parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。

**教学文件：** `packages/pi-course/src/provider-adapter.ts`

**第一步：** 先不看 target diff，先实现 `toProviderMessages` 的纯投影并用 fixture 验证；出站形状稳定后，再处理 SSE 分帧和增量 tool arguments。

**聚焦测试：** `packages/pi-course/test/05-provider-adapter.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 05`

**练习目录：** `npm run practice -w @pi/course -- 05`

**聚焦运行：** `npm run build -w @pi/course`，然后 `node --test packages/pi-course/dist/test/05-*.test.js`

**通过证据：** 离线 fixture、分裂 chunk、finish reason、usage、取消与 transport 错误测试通过；API key 不进入错误文本。

第一次尝试禁止查看完整答案，也不要配置真实 API；若卡住，让陪练先判断问题在出站翻译、SSE framing 还是 canonical event。
:::

## 先建立全景

Adapter 有两个方向，但只有一个职责——翻译：

```text
AgentContext
  ── toProviderMessages() ──→ ProviderWireMessage[]
                                 │
                                 ▼ transport / SSE
EventStream<ModelEvent, AssistantMessage>
  ←── adapter 状态机 ─────── ProviderChunk
```

`toProviderMessages()` 是纯转换，可由固定 fixture 测试。Transport 负责 URL、header、abort signal，并把原始 SSE 解析成课程的 `ProviderChunk`；adapter 再把 chunk 归一为 `ModelEvent`。这样网络失败、wire message 转换和流状态失败不会混成一团。

纯转换不表示每个 chunk 都能独立处理。出站消息映射可以是纯函数；入站流必须持有当前 partial message、每个 tool call 的参数 buffer 以及最新 usage。关键是把这些状态限制在一次 `stream()` 调用中，不能放进模块级变量。两个并发请求若共享 buffer，会出现最难诊断的跨会话参数串线。

边界还要区分三类无效输入：未知但可忽略的附加字段、违反最小形状的 chunk、以及 transport 本身失败。第一类可保留诊断后继续；第二类应转换成明确 error 终态；第三类携带已生成的 partial。不能用一个空 `catch {}` 把三者都变成正常 `stop`，因为那会制造一条看似可信、实际缺字的 assistant message。

模型 id、base URL 与能力描述同样属于配置边界，而不是消息本身。课程把 provider/model id 传给 adapter，把 base URL 与密钥留给 transport；两者都不能写入 `AgentContext`，否则 context 被测试快照或 session 保存时会泄密。认证 header 只在 transport 构造请求的最后一刻出现，错误信息也必须脱敏后才能进入 canonical message。

真实服务常被称为 “OpenAI-compatible”，这个词只承诺大致形状，不保证所有可选字段、结束原因或工具行为一致。课程因此不建立一张越来越长的 URL 判断表；每个兼容差异都应由一个最小 fixture 证明，并落在 adapter 配置或转换函数中。没有 fixture 的猜测性兼容代码会增加分支，却不能增加信心。

换句话说，兼容性是一组被测试支持的具体主张，不是供应商名称带来的信任。

:::predict title="运行前先判断"
工具参数分两块到达：第一块是 `{\"path\":`，第二块是 `\"README.md\"}`。收到第一块时能否调用 `JSON.parse`，失败后把它标成无效工具参数？
---answer
不能。第一块只是合法流中的中间状态。Adapter 应按 tool call 的 index 或 id 累积原始字符串，直到调用结束再解析；第 06 章才依据工具 schema 验证对象是否可执行。
:::

## 出站转换只读取 canonical IR

请求转换不应修改 context，也不应把 UI 文本当输入。课程显式定义最小 wire message；OpenAI-compatible 的专属字段只在这个类型和转换函数中出现：

```ts
const context: AgentContext = {
  systemPrompt: "只依据工具结果回答",
  messages: [userMessage("读取 README")],
};

expect(toProviderMessages(context)).toEqual([
  { role: "system", content: "只依据工具结果回答" },
  { role: "user", content: "读取 README" },
]);
```

这个 worked example 固定了 system 与 user 两条规则；完成态函数再用穷尽角色分支处理 assistant 和 toolResult。只有 adapter 知道 `tool_call_id` 和 `tool_calls`。Assistant tool call 优先使用已保存的 `rawArguments`，否则序列化 canonical `arguments`；tool result 必须带回相同 id。`systemPrompt` 在这里变成 system wire message，不应散落在 CLI。

:::lab title="实践 5.1 · 用 fixture 证明出站转换"
**目标：** 保证消息语义被翻译，而不是丢弃。

**文件：** `workshop/src/provider-adapter.ts`、`workshop/test/model-stream.test.ts`

**动作：**
1. 为 system、user、assistant toolCall 和 toolResult 准备 canonical context。
2. 调用 `toProviderMessages()`，断言角色顺序与 call id 配对。
3. 冻结输入对象，证明转换没有原地修改消息。
4. 搜索项目，确认 provider payload 类型未越过 adapter。

**运行：** `npm run workshop:test -- provider-adapter`

**预期：** fixture 转换稳定通过；tool result 的 id 与原 tool call 完全相同。
:::

## 入站转换必须维护跨 chunk 状态

Transport 已把原始 SSE 归一为三类 `ProviderChunk`。文本 delta 可以直接追加，但 tool call 的 id、名称和参数仍可能分散在多块中，甚至多个调用交错。Adapter 因此需要按 `index` 保存缓冲区：

```ts
const chunks: ProviderChunk[] = [
  { type: "tool", index: 0, id: "c1", name: "read",
    argumentsDelta: "{\"path\":" },
  { type: "tool", index: 0,
    argumentsDelta: "\"README.md\"}" },
  { type: "finish", reason: "tool_calls",
    usage: { input: 12, output: 8, totalTokens: 20 } },
];
```

收到第三块后，buffer 才是完整 JSON。此时 adapter 解析为 `ToolCall`，发出 `toolcall_end`，再把 `tool_calls` 归一为 `stopReason: "toolUse"`。解析成功只证明 JSON 完整，不证明 `path` 满足 read 工具 schema。

稳定的 canonical trace 应是：

```text
start
toolcall_delta index=0 delta="{\"path\":"
toolcall_delta index=0 delta="\"README.md\"}"
toolcall_end   id=c1 name=read arguments.path=README.md
done           reason=toolUse usage.totalTokens=20
```

:::mechanism title="完成顺序不等于到达顺序"
并行 tool calls 的参数 chunk 可能交错。用一个全局字符串拼接会把两个 JSON 混在一起；必须按 index/id 分桶，并在各自结束后形成 content block。第 07～08 章还会区分调用顺序、执行完成顺序和 transcript 写入顺序。
:::

:::lab title="实践 5.2 · 翻译增量工具调用"
**目标：** 从碎片恢复一个完整但尚未执行的 tool call。

**文件：** `workshop/test/model-stream.test.ts`

**动作：**
1. 使用上面的三块离线 fixture。
2. 逐块交给 adapter，收集 ModelEvent。
3. 同时断言 delta 顺序、`toolcall_end` 的参数对象和最终 usage。
4. 再加入第二个 index，使两组参数交错到达。

**运行：** `npm run workshop:test -- provider-adapter`

**预期：** 每个 index 独立形成 tool call；最终 message 保持 provider 声明的调用顺序。
:::

## 结束原因和错误必须归一化

Transport 暴露的 finish union 只允许三种已知值，adapter 的映射因此是穷尽的：

```ts
const stopReason =
  finish.reason === "tool_calls"
    ? "toolUse"
    : finish.reason === "length"
      ? "length"
      : "stop";
```

原始网络值仍是 `unknown`；生产 transport 若见到未知 finish reason，必须让流进入 error，不能强行断言成上述 union。`length` 尤其危险：tool arguments 可能刚好在 `}` 前被截断。课程 adapter 在 `ToolCall.arguments` 与 `rawArguments` 中保留原文，但不把它当可执行对象；后续 Agent loop 先检查 `length` 并拒绝所有调用。Transport 异常或 abort 转换为 `error` 终态，携带 `stopReason: "error" | "aborted"` 的最终 partial message；`result()` 仍然 resolve。

```text
text_delta "正在读取"
error reason=error errorMessage="connection closed"
result.content[0].text="正在读取"
```

:::note title="真实调用是兼容性检查，不是主测试"
可选 CLI 只能从环境变量读取 API key，`.env` 必须被 Git 忽略，日志不得打印 header。默认 `npm run workshop:test` 不访问网络；真实措辞、耗时和费用都不能写进验收。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的 `packages/ai/src/api/openai-completions.ts` 同样累积 text/tool-call delta、映射 finish reason、解析 usage，并把捕获的异常转换成流内 error 终态。上游还处理 reasoning、不同兼容端点、成本、图片和签名。课程 adapter 仅覆盖闭合主链路的子集；它是教学简化，不是假装所有 OpenAI-compatible 服务完全一致。
:::

## 故意把它弄坏

最短的错误实现是在每个 chunk 上解析 arguments：

```ts
// 错误：delta 不是完整 JSON 文档
const args = JSON.parse(chunk.argumentsDelta ?? "");
```

第一块会抛 `Unexpected end of JSON input`，一个正常流被误判为 provider 错误。

:::failure title="预期失败 · 提前解析 tool arguments"
临时把缓冲逻辑改成逐块 `JSON.parse`。首次偏差应出现在第一块参数，而不是工具 schema 验证。恢复按 index 累积，并增加 `reason: "length"` fixture：它必须产生 length 终态，保留 raw string；第 07 章的 loop 将据此拒绝执行，而不是猜测 JSON 是否碰巧完整。
:::

## 本章验收

:::checkpoint title="Checkpoint 05 · 真实协议止于边界"
运行 `npm run workshop:test -- provider-adapter`，wire messages、文本流、交错 tool arguments、usage、缺失 finish、网络失败和 abort fixture 都应通过。你能指出 transport、adapter 和 Agent 核心三层边界，并证明切换 ScriptedModel 与 adapter 时消费代码不变。下一章将为已完成的 tool call 加 schema 与执行契约。
:::

## 可选迁移练习

:::transfer title="迁移 · 设计另一种 provider fixture"
给定一个使用 `event: token`、`event: action`、`event: end` 的虚构协议，独立写一个 transport，把三条原始 fixture 转成课程 `ProviderChunk`，再产生与本章相同的 canonical trace。禁止修改 `AgentMessage`、`EventStream` 或 Model 消费者；若必须修改，说明边界仍有 provider 泄漏。
:::

## 小结

Provider adapter 的价值不是“封装一次 HTTP”，而是把变化关在边界：出站把 canonical context 翻成请求，入站维护跨 chunk 状态并还原事件，transport 只处理网络。到这里，ScriptedModel 与真实服务已经共享同一模型协议；第一部建立的语言足够支撑下一步工具执行与 Agent loop。
