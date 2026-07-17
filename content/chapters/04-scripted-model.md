---
id: "04"
slug: scripted-model
part: foundations
partTitle: 第一部 · 建立可执行语言
chapter: "04"
title: ScriptedModel：把模型变成可执行规格
summary: 用按轮消费的确定性脚本生成模型事件，稳定证明请求、流、终态与失败契约。
minutes: 100
difficulty: 核心
artifact: workshop/src/scripted-model.ts
prerequisites: 02,03
terms: test double, executable specification, deterministic trace, recorded request
upstream: packages/ai/src/providers/faux.ts
---

## 你将得到什么

我们已有消息语言和事件流，却没有事件生产者。直接连接真实 LLM 会同时引入网络、鉴权、费用、限流和随机措辞；测试失败时，你无法判断是协议错了，还是远端恰好换了回答。

本章只增加一种主要复杂性：**一个遵守真实模型边界的确定性生产者**。你会实现 `Model` 接口与 `ScriptedModel`，按轮消费预先声明的脚本，记录每次收到的 context，并覆盖成功、运行错误和取消。

本章不变量是：

> ScriptedModel 与真实 adapter 必须满足同一个 `Model.stream()` 契约；调用者不应根据“是不是 fake”改变消费代码。

完成后修改 `workshop/src/types.ts`、`workshop/src/scripted-model.ts` 及测试。恢复起点时重新使用测试中的原始 turns，撤销故意插入的失败回合；不需要删除缓存或配置 API key。

## 先建立全景

一个随便返回 `"hello"` 的 mock 只能帮助测试 UI。我们需要的是可执行规格：脚本描述过程，模型把过程翻译成 canonical events，`result()` 给出最终 `AssistantMessage`。

```text
AgentContext
    │
    ▼
ScriptedModel.stream(context, { signal })
    ├─ 立即返回 EventStream
    ├─ 保存 context 快照
    └─ 在 microtask 中消费一个 ScriptedTurn
          TextContent → text_delta
          ToolCall → toolcall_delta + toolcall_end
          成功 AssistantMessage → done
          error / aborted AssistantMessage → error
```

“立即返回流”很重要：消费者可以先订阅，再等待事件。模型内部的认证、运行和网络类失败不能随机从 `stream()` 调用点抛出，而要成为流的最终 `error` 事件。

:::predict title="运行前先判断"
如果 ScriptedModel 只记录传入的 `context` 引用，Agent 随后向 `context.messages` 追加消息，`requests[0]` 会代表调用发生时的输入，还是修改后的输入？
---answer
它会随原数组一起变化，失去历史证据。ScriptedModel 应在调用时保存快照；测试才能证明第二轮请求究竟看到了哪些消息，而不是读取事后被修改的对象。
:::

## 先固定 Model 的唯一入口

上层只依赖一个小接口。`Model` 不暴露供应商 SDK 类型，也不返回完整数组：

```ts
export interface Model {
  stream(
    context: AgentContext,
    options?: { signal?: AbortSignal },
  ): ModelStream;
}

export interface ModelStream extends AsyncIterable<ModelEvent> {
  result(): Promise<AssistantMessage>;
}

export type ScriptedTurn =
  | AssistantMessage
  | {
      stopReason: "error" | "aborted";
      errorMessage: string;
      partialText?: string;
    };
```

一个 `ScriptedTurn` 描述本回合最终要形成的 canonical message，而不是硬编码 `ModelEvent[]`。ScriptedModel 仍需像真实 adapter 一样先发 start，再把 content block 投影成 delta/end，最后依据 stop reason 产生 done 或 error。测试因此验证的是边界行为，不是把预期事件原样返还。

Turn 是最终事实，不是界面输出；同一回合仍可被终端、JSON 事件消费者或未来的 Agent loop 以不同方式观察。这一点很关键。

:::mechanism title="Fake 的价值是控制变量"
当 Agent loop 测试需要“先请求 read，再回答完成”时，脚本精确固定两轮模型行为。系统中唯一变化的是 loop 或 tool；失败就能定位到被测试层。真实模型则用于证明兼容性，不能替代确定性规格。
:::

:::lab title="实践 4.1 · 播放一个文本回合"
**目标：** 让同一份脚本同时产生过程事件和最终消息。

**文件：** `workshop/src/types.ts`、`workshop/src/scripted-model.ts`

**动作：**
1. 定义 `ModelStream`、`Model` 与 `ScriptedTurn`。
2. 用含两个 text block、`stopReason: "stop"` 的 AssistantMessage 构造模型。
3. 收集 `for await` 事件，同时等待 `stream.result()`。
4. 断言最终 content 与 scripted turn 一致。

**运行：** `npm run workshop:test -- scripted-model`

**预期：** 事件模式为 `start → text_delta → text_delta → done`，最终文本稳定为脚本内容。
:::

## 按轮消费并保存请求快照

Agent 会多次调用同一个 Model。ScriptedModel 因此接收 `ScriptedTurn[]`，用 cursor 每次只消费一个回合。回合内部的 content block 顺序就是事件投影顺序。

```ts
const model = new ScriptedModel([
  assistantMessage([
    text("我先读取文件。"),
    { type: "toolCall", id: "c1", name: "read",
      arguments: { path: "README.md" } },
  ], "toolUse"),
  assistantMessage([
    text("项目用于学习 Agent。"),
  ], "stop"),
]);
```

第一次 `stream()` 的结果必须包含 tool call 且 stop reason 为 `toolUse`；第二次则是普通文本终止。`requests` 保存 `structuredClone(context)`，于是测试能检查第二轮 context 是否包含第一轮 assistant message 和配对 tool result。第 07 章会用这段脚本闭合 Agent loop。

ScriptedModel 的入口骨架应保持同步返回：

```ts
stream(
  context: AgentContext,
  options: { signal?: AbortSignal } = {},
) {
  const stream = new AssistantMessageEventStream();
  this.requests.push(structuredClone(context));
  const turn = this.turns[this.cursor++];
  queueMicrotask(() => {
    if (options.signal?.aborted) {
      const aborted = assistantMessage([], "aborted", {
        errorMessage: "Request was aborted",
      });
      stream.push({ type: "error", reason: "aborted", error: aborted });
      stream.end(aborted);
      return;
    }
    // 完成态源码随后投影 content blocks，并 push done 或 error
  });
  return stream;
}
```

若回合耗尽，microtask 应产生 `stopReason: "error"` 的最终 message 和 `error` 事件，而不是让 `stream()` throw。这样“测试配置错误”也会验证公共失败契约。

播放过程还需要维护一个 partial message。每个 content block 先形成对应事件，再把已走过的 content slice 放入 partial；终态只提交原 scripted turn，不能重新从事件文本猜一次结果。这样事件观察者和 `result()` 对每个 block 的归属一致。为避免测试代码意外修改结果，模型在消费 turn 时使用 `structuredClone`。

课程 ScriptedModel 刻意没有 delay step。它验证协议和回合顺序，不用操作系统时间证明业务顺序；取消测试覆盖“播放前 signal 已 abort”。真实 transport 的中途取消留给下一章。如果未来加入延迟，也必须使用可控调度器，不能靠 5ms 阈值猜测机器负载。

请求快照也不等于生产日志。它只服务测试断言，不能保存密钥或无限累积到长期进程；真实产品的可观测性会由独立事件层负责。保持这个限制，ScriptedModel 才不会悄悄长成第二套 session。

:::lab title="实践 4.2 · 证明第二轮输入"
**目标：** 把 ScriptedModel 变成 Agent 状态机的观测探针。

**文件：** `workshop/test/model-stream.test.ts`

**动作：**
1. 使用上面的两轮脚本。
2. 调用第一轮后，构造含 assistant 与 toolResult 的新 context。
3. 调用第二轮，再修改原 context 数组。
4. 断言 `model.requests[1]` 仍是调用时快照。

**运行：** `npm run workshop:test -- scripted-model`

**预期：** 两轮结果分别为 `toolUse` 与 `stop`；请求快照不受事后修改影响。
:::

## 错误和取消也是脚本能力

成功路径不足以定义模型边界。错误回合可直接声明 `partialText`；启动前已经 abort 的 signal 则产生 aborted 终态，不播放原回合。前者的稳定 trace 是：

```text
start
text_delta "正在"
error reason=error
result.stopReason = "error"
result.content = [{ type: "text", text: "正在" }]
```

`result()` 在这里 resolve，而不是 reject；调用者得到一条 canonical assistant message，可同时读取部分文本和 `errorMessage`。这与“把错误吞掉并伪造成 stop”完全不同。

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的 `packages/ai/src/providers/faux.ts` 提供更丰富的确定性 provider，可生成内容、usage、错误与取消事件。课程版只保留按轮脚本和请求快照，命名也不追求同构；两者共同点是遵守与真实 provider 相同的流协议，而不是返回测试专用捷径。
:::

## 故意把它弄坏

最常见的假模型会在失败时直接抛出：

```ts
stream(): ModelStream {
  throw new Error("script exhausted"); // 错误：调用者甚至拿不到流
}
```

这迫使上层同时处理同步 throw、rejected promise 和流内 error，破坏统一边界。

:::failure title="预期失败 · 让 script exhausted 向外抛"
临时把脚本耗尽路径改为同步 throw。契约测试的首次偏差应是 `stream()` 没有返回 `EventStream`。恢复为立即返回流，并在微任务中推送 error 终态；再断言 `await result()` 得到 `stopReason: "error"`。
:::

## 本章验收

:::checkpoint title="Checkpoint 04 · 模型成为可执行规格"
运行 `npm run workshop:test -- scripted-model`，文本 blocks、工具调用、两轮快照、错误 turn、脚本耗尽和启动前取消测试应全部通过。你应能解释为什么 fake 必须遵守生产接口、为什么保存快照，以及为何错误通过流终态表达。下一章只替换 turn 来源：把真实 OpenAI-compatible chunk 翻译成相同事件。
:::

## 可选迁移练习

:::transfer title="迁移 · 部分输出后限流失败"
独立加入 `{ stopReason: "error", errorMessage: "rate limited", partialText: "正在" }` 回合。断言 `start → text_delta → error`、partial content、`errorMessage` 和 result stop reason。不要给 ScriptedModel 增加 `isFake` 分支，也不要让测试读取 cursor。
:::

## 小结

ScriptedModel 不是低配模型，而是协议的确定性实现。它让请求快照、content block 投影、tool call、终态、错误与启动前取消都可被精确复现。现在 Agent 上层已有稳定测试基座；下一章接入真实 provider 时，只需证明翻译边界等价，而不重新发明模型接口。
