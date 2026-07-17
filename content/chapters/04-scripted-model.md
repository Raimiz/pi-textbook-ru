---
id: "04"
slug: scripted-model
part: foundations
partTitle: 第一部 · 建立可执行语言
chapter: "04"
title: ScriptedModel：把模型行为写成可执行规格
summary: 用按轮消费的确定性脚本生成模型事件，稳定验证请求快照、事件顺序、终态和失败。
minutes: 100
difficulty: 核心
artifact: packages/pi-course/src/scripted-model.ts
prerequisites: 02,03
terms: test double, executable specification, deterministic trace, recorded request
upstream: packages/ai/src/providers/faux.ts
---

## 你将得到什么

前两章已经定义了消息和事件流，但还没有组件负责生产模型事件。如果现在直接连接
真实 LLM，网络、鉴权、费用、限流和随机输出会同时进入测试。测试失败时，你很难
判断究竟是 Agent 协议写错了，还是远端服务临时发生了变化。

本章处理一个新问题：如何构造一个遵守真实模型边界、行为又完全确定的事件生产者。
你将实现 `ScriptedModel`。它按轮读取预先写好的脚本，记录每次传入的 context，
并把成功、错误和预先取消都转换成统一的模型事件。

本章不变量是：

> `ScriptedModel` 和真实 adapter 都满足同一个 `Model.stream()` 契约。上层代码
> 只消费模型事件，不需要判断当前接入的是脚本模型还是真实服务。

重新练习时，运行 `npm run practice -w @pi/course -- 04 <新目录>`。练习目录会
保留第 03 章实现，只移除本章的 `scripted-model.ts`，并注入第 04 章聚焦测试。

## 先建立全景

`ScriptedModel` 是一种 test double，也就是专门替代外部依赖的测试实现。它和一个
随便返回 `"hello"` 的 mock 不同：脚本描述的是某一轮模型最终应产生什么消息，
`ScriptedModel` 仍要按照真实协议生成中间事件和终态。

```text
AgentContext
    │
    ▼
ScriptedModel.stream(context, { signal })
    ├─ 立即返回 AssistantMessageEventStream
    ├─ 保存 context 在调用时的快照
    └─ 在 microtask 中读取一个 ScriptedTurn
          TextContent → text_delta
          ToolCall    → toolcall_delta → toolcall_end
          正常消息    → done
          错误或取消  → error
```

microtask 是“当前同步代码结束后立刻执行”的小任务。`stream()` 先把流返回给调用者，
再由 microtask 发送事件。这样消费者可以先拿到流并开始等待；认证、模型运行或网络
阶段发生的失败，也能统一通过流内的 `error` 终态报告。

:::predict title="运行前先判断"
如果 `requests` 直接保存传入的 `context` 引用，调用者随后向
`context.messages` 追加一条消息，`requests[0]` 记录的是调用发生时的输入，
还是修改后的输入？
---answer
它会跟着原对象一起变化，因此记录的是修改后的输入。调用时应保存
`structuredClone(context)`。只有快照固定下来，测试才能准确回答“这一轮模型
当时看到了什么”。
:::

## 先固定 Model 的唯一入口

第 03 章已经在 `types.ts` 中定义了 `Model` 和 `ModelStream`。本章不修改这些接口，
只实现它们：

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
```

脚本中的一个回合有两种写法。正常回合直接提供最终 `AssistantMessage`；错误回合
提供停止原因、错误说明和可选的部分文本：

```ts
export type ScriptedTurn =
  | AssistantMessage
  | {
      stopReason: "error" | "aborted";
      errorMessage: string;
      partialText?: string;
    };
```

`ScriptedTurn` 记录脚本预先规定的最终结果，不直接保存 `ModelEvent[]`。
`ScriptedModel` 仍要先发送 `start`，再按 content block 的顺序生成事件，最后根据
stop reason 发送 `done` 或 `error`。因此，测试验证的是事件生成边界，而非简单
回放一组预置事件。

:::rebuild title="Checkpoint 04 · 让脚本回合满足真实模型边界"
**模式：** 重建。从 03 的 target 开始，只加入确定性事件生产者。

**起终点：** parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。

**怎么使用这张卡：** 先把它当作路线图。读完上面的全景和接口，再从实践 4.1
开始写代码。

**教学文件：** `packages/pi-course/src/scripted-model.ts`

**动手前只需知道：** 一个 turn 表示一轮模型的最终结果；请求快照记录
`stream()` 被调用时的输入；microtask 让方法先返回流，再发送事件。

**第一次红灯：** 首次 build 只报告 TS2307：找不到
`../src/scripted-model.js`。这说明本章只缺一个源文件。

**第一步：**
1. 运行 build，确认上面的 TS2307。
2. 定义 `ScriptedTurn`、请求记录和按轮读取所需的 cursor。
3. 完成实践 4.1，只运行名称含“脚本消息”的第一项测试。
4. 完成实践 4.2，再运行本章全部测试。

**聚焦测试：** `packages/pi-course/test/04-scripted-model.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 04`

**练习目录：** `npm run practice -w @pi/course -- 04`

**聚焦运行：** `npm run build -w @pi/course`，然后 `node --test packages/pi-course/dist/test/04-*.test.js`

**通过证据：** 3 项聚焦测试覆盖事件顺序与载荷、累计 partial、两个 turn 的消费
顺序、请求快照、显式错误回合、脚本耗尽和预取消。调用者使用
`ScriptedModel` 或真实 `Model` 时，无需编写两套消费逻辑。

第一次尝试禁止查看完整答案。若事件顺序不清楚，陪练只指出当前 content block
应该产生的下一个事件。
:::

## 播放一个成功回合

先看第一项测试中的脚本。它包含一个 text block 和一个 tool call，所以完整事件
顺序应为：

```text
start
text_delta
toolcall_delta
toolcall_end
done
```

`start` 携带空 content 的 partial message。处理每个 block 时，先把当前增量应用到
partial，再发送事件。这样 `text_delta` 的 partial 已经包含当前文本；
`toolcall_delta` 的 partial 既保留前面的文本，也包含正在生成的 tool call；
`toolcall_end` 再把完整参数写入同一位置。播放结束后，终态直接提交脚本中的最终
消息，不从事件文本重新拼装一次。

可以先写出类的外框：

```ts
export class ScriptedModel implements Model {
  readonly requests: AgentContext[] = [];
  private cursor = 0;

  constructor(private readonly turns: ScriptedTurn[]) {}

  stream(
    context: AgentContext,
    options: { signal?: AbortSignal } = {},
  ): AssistantMessageEventStream {
    const stream = new AssistantMessageEventStream();
    this.requests.push(structuredClone(context));
    const turn = this.turns[this.cursor++];

    queueMicrotask(() => {
      // 先处理不会播放的分支，再投影一个有效 turn。
    });
    return stream;
  }
}
```

第一阶段仍要让整个测试文件通过 TypeScript 编译。你可以先声明完整
`ScriptedTurn` 联合。在 microtask 内先判断三种暂不播放的情况：signal 已取消、
turn 不存在，或者 turn 没有 `role` 字段。前两项是失败入口，第三项代表显式错误
turn。遇到它们时，先临时抛出 `"not implemented in lab 4.1"`。通过这些判断后，
TypeScript 也能确认剩下的 turn 就是 `AssistantMessage`。局部测试只提供正常
turn，不会执行临时分支。

:::lab title="实践 4.1 · 投影成功消息并保存请求快照"
**目标：** 让一条混合消息产生确定事件，同时固定调用时的 context。

**文件：** `packages/pi-course/src/scripted-model.ts`

**动作：**
1. 声明完整 `ScriptedTurn`，并建立 `requests`、`cursor` 和构造器。
2. `stream()` 先克隆 context，再取出当前 turn，然后立即返回新事件流。
3. 在 microtask 中先判断预取消、脚本耗尽和没有 `role` 的错误 turn；这三个分支
   暂时抛出明确异常。
4. 把判断后剩下的正常消息转换成 `start`、block 事件和 `done`。
5. text block 产生一个 `text_delta`；它的 `contentIndex` 指向当前 block，
   `delta` 是本段文字，`partial` 已经包含这段文字。
6. tool call 先产生 `toolcall_delta`，再产生 `toolcall_end`。两个事件都保留
   前面已经播放的 block；end 事件还要携带完整 tool call。
7. 让模型连续播放两个正常 turn，确认 cursor 每次只前进一格。
8. 只运行第一项测试。

**运行：** `npm run build -w @pi/course`，然后
`node --test --test-name-pattern="脚本消息" packages/pi-course/dist/test/04-*.test.js`

**预期：** 局部测试 `1/1`。事件名称、delta、content index、tool call 和累计
partial 都与脚本一致；两个 turn 按声明顺序播放。调用后再修改原 context，
`model.requests[0].messages` 仍只有调用时的那一条消息。
:::

## 按轮消费，并把失败放回流里

同一个模型实例会被 Agent 多次调用。cursor 每次只前进一个 turn：

```ts
const model = new ScriptedModel([
  assistantMessage([
    text("我先读取文件。"),
    {
      type: "toolCall",
      id: "c1",
      name: "read",
      arguments: { path: "README.md" },
    },
  ], "toolUse"),
  assistantMessage([text("项目用于学习 Agent。")], "stop"),
]);
```

第一次调用产生工具请求，第二次调用给出最终回答。第 07 章会把这两个回合接入
Agent loop。本章只负责模型边界，不负责把上一轮消息写进下一轮 context。

脚本还必须能稳定表达失败：

```ts
{
  stopReason: "error",
  partialText: "正在",
  errorMessage: "rate limited",
}
```

这条 turn 应产生：

```text
start
text_delta "正在"
error reason=error
result.stopReason = "error"
result.errorMessage = "rate limited"
```

`result()` 仍然 resolve 一条 canonical assistant message。上层因此可以同时读取
部分文本和错误说明。它不会把错误伪装成普通 `stop`，也不会迫使调用者额外处理
一个同步 throw 分支。

脚本耗尽时，`ScriptedModel` 自己构造 `stopReason: "error"` 的消息；播放开始前，
如果 signal 已处于 `aborted` 状态，就构造 `stopReason: "aborted"` 的消息。
这两个分支都只发送 `error` 终态，不发送 `start`，也不播放原 turn。所有分支都在
microtask 内完成，所以 `stream()` 始终先返回事件流。

:::lab title="实践 4.2 · 补齐错误、耗尽和预取消"
**目标：** 让三类失败也遵守同一个流协议。

**文件：** `packages/pi-course/src/scripted-model.ts`

**动作：**
1. 写一个 helper，把正常 turn 克隆为最终消息，把错误 turn 转成带 partial text
   和 `errorMessage` 的最终消息。
2. 删除 Lab 4.1 的临时异常。
3. signal 已处于 `aborted` 状态时，发送对应的 `error` 事件并结束本次播放。
4. turn 不存在时，发送错误说明为
   `"ScriptedModel 没有更多响应"` 的 `error` 事件。
5. 显式错误 turn 仍先发送 `start` 和已有文本，最后发送 `error`。
6. 运行完整聚焦测试。

**运行：** `npm run build -w @pi/course`，然后
`node --test packages/pi-course/dist/test/04-*.test.js`

**预期：** 3 项测试全部通过。每项流测试都设有一秒超时；遗漏终态会明确失败，
不会让练习一直等待。
:::

:::mechanism title="确定性模型负责控制变量"
以后测试 Agent loop 时，可以用脚本精确规定“先请求 read，再给出回答”。模型行为
固定后，测试中只剩 loop 或 tool 发生变化，失败位置就容易判断。真实服务用于验证
兼容性；需要稳定证明控制流时，仍应使用确定输入和确定事件。
:::

:::note title="这三项测试没有证明什么"
本章没有测试播放中途取消、多个并发 `stream()` 调用、事件之间的实际时间间隔、
调度时机或背压。`requests` 也只是测试探针，不是生产日志；长期进程不能让它无限增长，
更不能用它记录密钥。真实 transport 的中途取消会在下一章测试。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的 `packages/ai/src/providers/faux.ts` 提供了更丰富的确定性
provider，可以生成内容、usage、错误和取消事件。课程版只保留按轮脚本和请求快照。
两者的共同点是遵守真实 provider 使用的流协议，让上层保持同一种消费方式。
:::

## 故意把它弄坏

一种常见错误是在脚本耗尽时，从 `stream()` 同步抛出异常：

```ts
stream(): ModelStream {
  throw new Error("script exhausted");
}
```

这样调用者还没拿到流，就被迫处理另一条失败通道。

:::failure title="预期失败 · 让脚本耗尽同步抛错"
临时把“turn 不存在”的判断移到 `queueMicrotask()` 外，并直接 throw。运行完整
聚焦测试，第三项测试应立即失败，因为 `stream()` 没有返回事件流。把判断移回
microtask，恢复为流内 `error` 终态，再确认 3/3 通过。
:::

## 本章验收

:::checkpoint title="Checkpoint 04 · 模型行为成为可执行规格"
运行 `npm run build -w @pi/course`，再运行
`node --test packages/pi-course/dist/test/04-*.test.js`，结果应为 3/3。确认本章
只新增 `scripted-model.ts`。你要能解释 turn 如何变成事件、为什么 context 必须
保存快照，以及为什么脚本耗尽和预取消都通过流内终态报告。下一章会保留这套模型
协议，只把 turn 的来源替换成 OpenAI-compatible transport。
:::

## 可选迁移练习

:::transfer title="迁移 · 连续播放两个成功回合"
在独立测试中构造两个 turn：第一轮产生 `toolUse`，第二轮产生普通 `stop`。依次调用
两次 `stream()`，检查每轮事件和结果都来自对应 turn，并确认 `requests` 保存两次
调用时的 context 快照。不要读取私有 cursor，也不要为测试增加 `isFake` 分支。
:::

## 小结

`ScriptedModel` 是模型协议的一种确定性实现。它把脚本 turn 转成真实事件，保存
请求发生时的 context，并让成功、错误、脚本耗尽和预取消走同一条流。Agent 上层
由此获得了稳定的测试基座。下一章接入真实 provider 时，只需证明 adapter 产生
相同的边界行为，无需另建一套模型接口。
