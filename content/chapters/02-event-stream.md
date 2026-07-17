---
id: "02"
slug: event-stream
part: foundations
partTitle: 第一部 · 建立可执行语言
chapter: "02"
title: EventStream：让过程和结果走同一条流
summary: 实现一个既能逐项读取事件、又能等待最终结果的异步流，并把终态写成唯一结束信号。
minutes: 95
difficulty: 进阶
artifact: packages/pi-course/src/event-stream.ts
prerequisites: 01
terms: AsyncIterable, EventStream, queue, waiter, terminal event
upstream: packages/ai/src/utils/event-stream.ts
---

## 你将得到什么

上一章只解决了“事件长什么样”。当时所有事件都已经放在一个数组里。真实模型不是这样：文本会一段一段到达，界面要马上显示每段内容，Agent loop 还要等整条消息结束。

这一章只处理事件到达的先后顺序。你会创建
`packages/pi-course/src/event-stream.ts`，让同一个 `EventStream` 同时支持
`for await...of` 和 `result()`。这里不定义消息内容，不连接网络，也不实现取消。

本章不变量是：

> 每条流都要有一个明确的终态。迭代器和 `result()` 必须由同一个终态结束，
> 不能一个已经完成，另一个还在等。

需要重新开始时，保留当前练习目录，再运行
`npm run practice -w @pi/course -- 02 <新目录>`。练习目录没有 Git 历史，
不要在里面执行 `git restore`，也不要修改注入的聚焦测试。

:::rebuild title="Checkpoint 02 · 先闭合一次 push 与 next"
**模式：** 重建。从 01 的 target 开始，只引入时间与等待关系。

**起终点：** parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。

**教学文件：** `packages/pi-course/src/event-stream.ts`

**动手前只需知道：** `queue` 保存“事件先到”的情况；`waiter` 是正在等待下一项的
迭代器；终态表示以后不会再有新事件。`push()` 每次只能二选一：把事件交给一个
waiter，或者放进 queue。`result()` 等的是终态提取出的最终值。

**第一次红灯：** parent 里还没有 `event-stream.ts`。首次 build 会报
`Cannot find module '../src/event-stream.js'`。测试中的 `.js` 路径没有写错；
你要创建同名的 `.ts` 源文件。

**第一步：**
1. 先不看 target diff，运行一次 build，记下第一条错误。
2. 阅读两项聚焦测试，画出“先 `push` 后 `next`”和“先 `next` 后 `push`”
   两条时间线。
3. 先声明完整公共接口，再只实现 queue 路径；下一次实验再补 waiter 路径。
4. 最后让终态同时结束迭代和 `result()`。

**聚焦测试：** `packages/pi-course/test/02-event-stream.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 02`

**练习目录：** `npm run practice -w @pi/course -- 02`

**聚焦运行：** `npm run build -w @pi/course`，然后 `node --test packages/pi-course/dist/test/02-*.test.js`

**通过证据：** 2 项聚焦测试通过；queue 与 waiter 两条路径都能结束，你能说明
为什么终态本身仍要交给迭代器，以及 `result()` 为什么不能另走一套完成逻辑。

第一次尝试禁止查看完整答案；若卡住，先让陪练只指出 queue、waiter、terminal 三类状态。
:::

## 先建立全景

`AsyncIterable<T>` 解决的是“下一项什么时候到”，却没有单独保存最终结果。
如果调用者只拼接 delta，就会丢掉 stop reason、usage 和错误信息。我们需要让
同一个对象同时提供逐项事件和最终结果：

```text
生产者 push(e1) ─────┐
         push(e2) ───┼──→ for await (过程证据)
         push(done) ─┘
              │
              └─────────→ result() (最终事实)
```

事件流不是一组回调。消费者每次只请求下一项。queue 里有事件，就马上取出；
没有，就登记一个 waiter。终态也要像普通事件一样交给迭代器，同时解析出最终结果。

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

:::mechanism title="只保留一个结束位置"
如果两段代码分别控制迭代结束和最终结果，状态很容易分叉：迭代器已经结束，
`result()` 却还在等；或者 `result()` 已经返回，队列里仍在增加 delta。
终态必须是唯一结束位置。同一次 `push()` 既处理终态，也交付这条事件。
:::

这一版只支持一个事件消费者。多个地方调用 `result()` 没问题，因为它们等待同一个
Promise；两个 `for await` 却会争抢同一条 queue，不会各自收到完整事件。
先把这个限制说清楚。以后若界面和 Agent loop 都要读取过程事件，应由上层明确转发，
不能偷偷复制几份 queue。

`AsyncIterable` 也不会自动解决背压。它让消费者决定何时请求下一项，却挡不住一个
不断调用 `push()` 的生产者。provider 比界面快时，queue 仍会增长。模型响应通常
不长，本章先把结束语义写对；无界日志还需要容量上限、暂停或丢弃策略。

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

**文件：** `packages/pi-course/src/event-stream.ts`

**动作：**
1. 先声明完整公共接口：构造器、`push()`、`end(result)`、`result()` 和异步迭代器。
   这样 TypeScript 能编译整份只读测试；`end(result)` 与“空 queue 且未结束”的分支
   暂时抛出 `new Error("not implemented in lab 2.1")`。
2. 实现构造器、`result()` 和 `push()`。普通事件优先交给 waiter；没有 waiter
   才放进 queue。
3. 收到终态时，先完成最终 Promise，再照常交付这条终态事件。
4. 实现异步迭代器的 queue 与 done 分支。保持注入测试不动，只运行第一项测试。

**运行：** `npm run build -w @pi/course`，然后
`node --test --test-name-pattern="先到的事件" packages/pi-course/dist/test/02-*.test.js`

**预期：** 第一项测试读到 `delta → done`，`result()` 返回 `"AB"`。
:::

:::lab title="实践 2.2 · 接住先等待的迭代器"
**目标：** 在 queue 为空时保存 waiter，并让 `end()` 唤醒它。

**文件：** `packages/pi-course/src/event-stream.ts`

**动作：**
1. 在 queue 为空且流未结束时，创建 Promise，把它的 `resolve` 放进 waiting。
2. 下一次 `push()` 取出最早的 waiter，并把事件直接交给它。
3. 实现 `end(result)`：完成最终 Promise、标记结束，并把仍在等待的迭代器全部唤醒为 `done: true`。
4. 删除 Lab 2.1 的两个临时异常，运行完整聚焦测试；不要增加 `setTimeout`。

**运行：** `npm run build -w @pi/course`，然后 `node --test packages/pi-course/dist/test/02-*.test.js`

**预期：** 先调用 `next()` 得到 pending Promise；随后一次 `push()` 就能唤醒它。
`end("A")` 让下一次 `next()` 返回 `done: true`，同时让 `result()` 返回 `"A"`。
:::

:::note title="本章不实现取消"
取消需要 `AbortSignal`、生产者协作和 `error` 终态，不能只在 EventStream 上加一个
布尔值。本章 target 没有这些代码，也没有取消测试。第 04 章先处理“开始前已取消”，
第 05 章再处理传输中的取消，第 09 章由 Agent 统一管理一次运行的取消。
这里先把 queue、waiter 和终态写对。
:::

:::note title="这两项测试到底证明了什么"
2 项聚焦测试覆盖 queue 路径、waiter 路径和可观察终态。第一项检查终态
`push()` 会完成 `result()`；第二项检查显式 `end("A")` 会同时结束迭代并让
`result()` 返回 `"A"`。它们不证明取消、错误终态、多个消费者或无限队列已经实现。
后文提到这些问题时，只是在划清边界，不是把它们算进本章绿灯。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的 `packages/ai/src/utils/event-stream.ts` 也让
`EventStream<T,R>` 实现 `AsyncIterable<T>`，并提供 `result(): Promise<R>`。
上游的 `AssistantMessageEventStream` 还把 `done` 和 `error` 都当作终态。
课程这一章只实现更小的单消费者版本；错误与取消会在后续 checkpoint 接入。
:::

## 故意把它弄坏

一个常见错误是完成了 `result()`，却把终态本身吞掉：

```ts
// 错误示例
if (this.isComplete(event)) {
  this.done = true;
  this.resolveFinalResult(this.extractResult(event));
  return; // 终态没有进入 queue，也没有交给 waiter
}
```

:::failure title="预期失败 · 吞掉终态事件"
在终态分支末尾临时加入上面的 `return`，再运行聚焦测试。测试应立即失败：
`result()` 仍返回 `"AB"`，迭代序列却只有 `delta`，缺少 `done`。删除 `return`，
让终态继续走普通交付路径。这个实验不会制造永远等待的测试。
:::

## 本章验收

:::checkpoint title="Checkpoint 02 · 时间成为显式协议"
运行 `npm run build -w @pi/course`，再运行
`node --test packages/pi-course/dist/test/02-*.test.js`，结果应为 2/2。
你要能画出 queue 与 waiter 两条时间线，并解释为什么终态既要出现在迭代序列里，
又要完成 `result()`。确认只修改 `packages/pi-course/src/event-stream.ts`。
下一章会把通用的 `T` 和 `R` 换成 Agent 自己的消息类型。
:::

## 可选迁移练习

:::transfer title="迁移 · 构造可取消的字节流"
不给 starter：定义 `ByteEvent = chunk | done | error`，用 `EventStream<ByteEvent, Uint8Array>` 传送三段字节。要求启动前取消和中途取消都产生终态，最终字节顺序保持不变。测试不能只断言长度，还要断言事件顺序和 `result()`。
:::

## 小结

EventStream 把“事件何时到达”写进了接口。`AsyncIterable` 负责逐项读取，
`result()` 负责最终结果，唯一终态让两边一起结束。本章还没有取消、错误终态和
多消费者；这些能力会在拥有足够消息语义之后逐步接入。下一章先定义 Pi 内部长期
使用的统一消息格式。
