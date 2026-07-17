---
id: "02"
slug: event-stream
part: foundations
partTitle: 第一部 · 建立可执行语言
chapter: "02"
title: EventStream、AsyncIterable 与取消
summary: 把过程事件、最终结果和协作式取消统一进一个不会悬挂的异步流契约。
minutes: 95
difficulty: 进阶
artifact: workshop/src/event-stream.ts
prerequisites: 01
terms: AsyncIterable, EventStream, backpressure, terminal event, AbortSignal
upstream: packages/ai/src/utils/event-stream.ts
---

## 你将得到什么

上一章的事件已经有可靠形状，却仍像一张一次性数组。真实模型会在未知时间逐块返回文本；界面需要立刻显示 delta，Agent loop 又需要等待最终消息。进入本章时，你只能遍历静态事件；完成后将得到 `workshop/src/event-stream.ts`：它既可被 `for await...of` 逐项消费，也可通过 `result()` 等待最终值。

本章只增加一种复杂性：**时间**。不定义消息语义，也不连接网络。你会观察生产者快于消费者、消费者先等待、终态到达以及取消四条路径。

本章不变量是：

> 每条流必须以一个可识别的终态结束；迭代器和 `result()` 必须从同一个终态得到一致结论，不能有一方永远等待。

要恢复起点，撤销 `workshop/src/event-stream.ts` 和对应测试中本章故障实验的改动，再运行聚焦测试。不要用 `setTimeout` 延长测试来掩盖悬挂。

## 先建立全景

`AsyncIterable<T>` 只回答“下一项怎样异步到达”，没有方便的最终结果通道。普通消费者如果只拼 delta，会错过 stop reason、usage 和错误信息。我们需要把两个视角放在同一个对象中：

```text
生产者 push(e1) ─────┐
         push(e2) ───┼──→ for await (过程证据)
         push(done) ─┘
              │
              └─────────→ result() (最终事实)
```

事件流不是回调列表。消费者每次请求下一项；若队列已有事件就立即取出，否则登记一个 waiter。终态事件既要交给迭代器，也要解析为最终结果。

:::predict title="运行前先判断"
消费者收到第一个 delta 后 `break`，生产者是否会自动停止？另一个调用了 `result()` 的任务会自动完成吗？
---answer
都不会因为 `break` 自动取消。退出迭代只表示这个消费者不再拉取；生产者必须收到并观察 `AbortSignal` 才会停止。若生产者继续推送最终事件，`result()` 仍会完成；若生产者既不停也不发终态，它就会悬挂。
:::

## 一条流需要队列、等待者与终态

下面是核心数据结构。构造器接收两个纯函数：怎样识别终态，以及怎样从终态提取结果。这样通用容器不需要理解模型消息：

```ts
export class EventStream<T, R = T> implements AsyncIterable<T> {
  private queue: T[] = [];
  private waiting: Array<(item: IteratorResult<T>) => void> = [];
  private done = false;
  private readonly finalResult: Promise<R>;
  private resolveFinalResult!: (result: R) => void;

  constructor(
    private readonly isComplete: (event: T) => boolean,
    private readonly extractResult: (event: T) => R,
  ) {
    this.finalResult = new Promise<R>((resolve) => {
      this.resolveFinalResult = resolve;
    });
  }

  result(): Promise<R> {
    return this.finalResult;
  }
}
```

`queue` 保存“事件先到”的情况，`waiting` 保存“消费者先等”的情况。`done` 防止终态后继续写入。`finalResult` 在构造时创建一次，所以先调用还是后调用 `result()` 都指向同一事实。

:::mechanism title="为什么不是两个互不相关的 Promise"
如果迭代结束和最终结果由不同代码路径控制，就会出现 iterator 已结束但 result 仍 pending，或 result 已完成却继续收到 delta。终态事件必须是唯一提交点；容器在同一次 `push` 中完成两边。
:::

这一版容器明确只支持一个事件消费者。多个地方都调用 `result()` 没问题，因为它们等待同一个 Promise；但两个 `for await` 会争抢同一队列，而不是各自看到完整广播。这个限制应当写进契约，而不是碰巧隐藏在实现里。界面与 Agent loop 如果都需要过程事件，后续应由上层建立明确的转发机制；贸然把 `queue` 复制成多份，会同时引入订阅取消、慢消费者占用内存和终态回收问题。

所谓背压也要准确理解：AsyncIterable 让消费者决定何时请求下一项，却不能自动阻止一个主动 `push()` 的远端生产者。若 provider 比 UI 快，队列仍会增长。课程先用模型响应这种有限流量建立正确语义；面对无界日志或字节流时，还需要容量上限、暂停策略或丢弃策略。不要把语法上的 `for await` 误当作完整资源治理。

`push()` 的关键不是数组操作，而是顺序：先识别终态并解析结果，再把该事件交给等待者或队列。终态本身仍然可观察。

```ts
push(event: T): void {
  if (this.done) return;

  if (this.isComplete(event)) {
    this.done = true;
    this.resolveFinalResult(this.extractResult(event));
  }

  const waiter = this.waiting.shift();
  if (waiter) waiter({ value: event, done: false });
  else this.queue.push(event);
}
```

异步迭代器循环遵守同样的优先级：先清空队列，再看是否结束，最后才等待新事件。这可避免终态已入队却被 `done` 提前截掉。

:::lab title="实践 2.1 · 同时证明过程和结果"
**目标：** 让一个终态完成两种消费方式。

**文件：** `workshop/src/event-stream.ts`、`workshop/test/model-stream.test.ts`

**动作：**
1. 补齐 `push()` 和异步迭代器。
2. 先推送两个 delta 和一个 done，再开始迭代，覆盖队列路径。
3. 另写测试先启动迭代再推送，覆盖 waiter 路径。
4. 同时断言事件序列与 `await stream.result()`。

**运行：** `npm run workshop:test -- event-stream`

**预期：** 两种时序都得到 `delta, delta, done`；最终结果相同，测试没有计时依赖。
:::

## 取消必须沿调用链协作

JavaScript 不能安全强杀任意 Promise。`AbortController` 只广播意图，等待函数、provider 和工具必须主动响应。一个可取消等待应同时处理“进入前已取消”和“等待中取消”：

```ts
export function abortableDelay(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(new DOMException("aborted", "AbortError"));
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("aborted", "AbortError"));
    }, { once: true });
  });
}
```

底层等待可以抛 `AbortError`，但流的公共边界不能让它变成一个无人处理的 rejected promise。生产者捕获后应推送协议规定的 `error` 终态；下一章会让该事件携带 `stopReason: "aborted"` 的最终 canonical assistant message。

:::lab title="实践 2.2 · 让取消也完成 result"
**目标：** 验证取消不是“停止打印”，而是一个完整终态。

**文件：** `workshop/test/model-stream.test.ts`

**动作：**
1. 创建带延迟的生产者，先推一个 delta。
2. 消费该 delta 后调用 `controller.abort()`。
3. 由生产者捕获取消并推送 `error` 终态。
4. 同时断言迭代器结束、`result()` 完成且没有后续 delta。

**运行：** `npm run workshop:test -- event-stream`

**预期：** 事件模式为 `delta → error(aborted)`；测试在有限时间内自然结束。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的 `packages/ai/src/utils/event-stream.ts` 同样让 `EventStream<T,R>` 实现 `AsyncIterable<T>` 并提供 `result(): Promise<R>`；`AssistantMessageEventStream` 把 `done` 和 `error` 都识别为终态。课程暂时使用更小事件集并限制单消费者。上游模型错误与取消也进入流内终态，而不是随机从调用点向外抛出。
:::

## 故意把它弄坏

最隐蔽的错误是只通知迭代器结束，却忘记完成最终 Promise：

```ts
// 错误示例
end(): void {
  this.done = true;
  while (this.waiting.length > 0) {
    this.waiting.shift()?.({ value: undefined, done: true });
  }
  // result() 永远 pending
}
```

:::failure title="预期失败 · 制造一个悬挂 result"
临时绕过终态事件，直接把 `done` 设为 `true`。用 `Promise.race` 加一个很短但宽松的测试超时，首次偏差应明确为“result 未完成”。不要通过增加超时修复；恢复唯一终态提交点，使 result 与 iterator 同步结束。
:::

## 本章验收

:::checkpoint title="Checkpoint 02 · 时间成为显式协议"
运行 `npm run workshop:test -- event-stream`，队列路径、waiter 路径、正常终态和取消路径都应通过。你能解释为什么终态必须被迭代到、为什么 `break` 不等于 abort，以及为何 result 不能从 delta 临时拼出。恢复时只撤销故障实验。下一章将把通用 `T` 和 `R` 换成 Agent 的消息语言。
:::

## 可选迁移练习

:::transfer title="迁移 · 构造可取消的字节流"
不给 starter：定义 `ByteEvent = chunk | done | error`，用 `EventStream<ByteEvent, Uint8Array>` 传送三段字节。要求启动前取消和中途取消都产生终态，最终字节顺序保持不变。测试不能只断言长度，还要断言事件顺序和 `result()`。
:::

## 小结

事件流把时间从隐藏的回调行为变成了显式协议。AsyncIterable 提供过程证据，`result()` 提供最终事实，唯一终态把两者锁在一起；AbortSignal 则把取消意图沿调用链传递。下一章不再使用无意义的示例字符串，而会定义 Pi 内部长期依赖的 canonical message IR。
