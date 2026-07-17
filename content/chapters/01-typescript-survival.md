---
id: "01"
slug: typescript-survival
part: foundations
partTitle: 第一部 · 建立可执行语言
chapter: "01"
title: TypeScript、测试与 ESM 生存集
summary: 只学习构造 Agent 所需的 TypeScript 子集，并建立类型检查与行为测试两条证据链。
minutes: 75
difficulty: 入门
artifact: workshop/src/survival/events.ts
prerequisites: 00
terms: tagged union, narrowing, never, ESM, node:test
upstream: packages/agent/src/types.ts
---

## 你将得到什么

序章让你看见了一条完整轨迹，但还不能判断代码中的 `assistant_message` 是否覆盖了所有情况。本章进入时，系统只会播放固定数据；本章完成后，你能读写后续课程反复使用的 tagged union、`unknown` 收窄、Promise、ESM 导入和 Node 内置测试。

我们只增加一种主要复杂性：**让编译器和测试成为两种不同的证据**。不会讲前端、DOM、装饰器或复杂泛型。你将修改 `workshop/src/survival/events.ts` 及其测试，观察缺少事件分支时的编译错误，以及实现错误时的测试失败。

本章不变量是：

> 来自系统边界的数据先是 `unknown`；只有经过验证和穷尽分支后，才能进入 Agent 的强类型核心。

恢复起点时，先用 `git diff -- workshop/src/survival` 看清实验改动，再手动撤销故意加入的分支；不要重建项目或修改 `package-lock.json`。

## 先建立全景

Node、TypeScript、运行器和测试框架各自回答不同问题：

```text
TypeScript 源码
  ├─ tsc --noEmit  → “这些值的静态形状能否成立？”
  ├─ tsc           → 编译为 Node 可执行的 ESM JavaScript
  └─ node --test   → “给定输入时，行为和顺序是否符合契约？”
```

类型检查通过，不代表事件顺序正确；测试通过，也不代表所有联合类型都被覆盖。因此每个 checkpoint 都会同时运行 typecheck 和聚焦测试。ESM 的职责更窄：它规定文件怎样通过 `import` 与 `export` 连接，让项目结构成为可追踪的依赖图。

:::predict title="运行前先判断"
给联合类型新增 `cancelled` 事件，但忘记修改格式化函数。只运行一个没有构造 `cancelled` 的单元测试，它会失败吗？`tsc` 又会怎样？
---answer
测试很可能仍通过，因为它没有走到新分支。若函数末尾使用 `never` 做穷尽检查，`tsc` 会指出 `cancelled` 不能赋给 `never`。两条证据发现的是不同缺口。
:::

## 用 tagged union 表达互斥状态

Agent 事件不是一张塞满可选字段的表。`started` 没有结果，`delta` 必须有片段，`finished` 必须有终态。把互斥状态写成联合类型后，`event.type` 同时是数据和编译器的证明线索：

```ts
export type DemoEvent =
  | { type: "started"; requestId: string }
  | { type: "delta"; requestId: string; text: string }
  | { type: "finished"; requestId: string; reason: "stop" | "length" };

export function formatEvent(event: DemoEvent): string {
  switch (event.type) {
    case "started":
      return `start ${event.requestId}`;
    case "delta":
      return `delta ${event.text}`;
    case "finished":
      return `finish ${event.reason}`;
    default: {
      const unreachable: never = event;
      return unreachable;
    }
  }
}
```

若改成 `{ type: string; text?: string; reason?: string }`，无效组合也会合法，例如 `started` 同时携带 `reason`。联合类型把“哪些状态可能存在”写进协议，而不是留给注释。

:::lab title="实践 1.1 · 制造一次穷尽检查失败"
**目标：** 让编译器先于运行时发现遗漏。

**文件：** `workshop/src/survival/events.ts`

**动作：**
1. 为 `DemoEvent` 增加 `{ type: "aborted"; requestId: string }`。
2. 暂时不修改 `formatEvent`，运行 typecheck 并记录首次错误。
3. 补上 `aborted` 分支，再运行测试。

**运行：** `npm run workshop:test -- survival`

**预期：** 补分支前，`never` 行产生静态错误；补齐后聚焦测试通过。
:::

## 把边界的 unknown 收窄

`JSON.parse()`、环境变量和网络响应不受 TypeScript 控制。把它们直接断言成内部类型，只是让编译器闭嘴。正确方向是：边界接受 `unknown`，验证最小必要字段，再返回强类型值。

```ts
export function readDelta(value: unknown): DemoEvent {
  if (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "delta" &&
    "requestId" in value &&
    typeof value.requestId === "string" &&
    "text" in value &&
    typeof value.text === "string"
  ) {
    return { type: "delta", requestId: value.requestId, text: value.text };
  }
  throw new Error("invalid delta event");
}
```

这里故意不引入 schema 库：第 06 章才系统处理工具参数。现在要掌握的是信任方向——外部数据不能凭一个 `as DemoEvent` 穿透边界。

:::mechanism title="类型不是运行时防火墙"
联合类型约束我们自己写的代码；验证器约束进程外的数据。`as` 只改变静态视图，不检查任何字节。后续 provider adapter 必须先翻译和验证，再把事件交给核心。
:::

## ESM 与测试让文件形成可执行契约

课程统一使用显式相对导入，测试从公共导出读取行为。一个最小测试同时固定输出与顺序：

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { formatEvent, type DemoEvent } from "../src/survival/events.js";

test("formatEvent preserves event order", () => {
  const events: DemoEvent[] = [
    { type: "started", requestId: "r1" },
    { type: "delta", requestId: "r1", text: "Pi" },
    { type: "finished", requestId: "r1", reason: "stop" },
  ];
  assert.deepEqual(events.map(formatEvent), [
    "start r1",
    "delta r1 Pi",
    "finish r1 stop",
  ]);
});
```

运行结果应是稳定模式，而不是依赖机器耗时：

```text
✔ tagged union 的完成态覆盖全部事件分支
tests 4
pass 4
```

:::lab title="实践 1.2 · 经历一次 red → green"
**目标：** 区分形状正确与行为正确。

**文件：** `workshop/test/foundations-labs.test.ts`

**动作：**
1. 先写测试，要求 `delta` 输出包含 `requestId`。
2. 在尚未修改实现时运行，确认失败来自输出差异。
3. 修改最小实现使测试转绿，再运行 typecheck。

**运行：** `npm run workshop:test -- survival`

**预期：** 第一次得到明确 diff；第二次测试和静态检查同时通过。
:::

## Promise 让“何时完成”进入类型

后续 `Model.stream()` 会同步返回一个可迭代对象，而最终消息通过 Promise 在未来完成。`async/await` 不是把异步代码变成同步代码，而是让依赖关系清楚地写出来。最容易误用的是 `forEach(async ...)`：外层不会等待内部回调，错误也可能脱离当前控制流。

```ts
// 明确顺序：后一项依赖前一项完成
for (const event of events) {
  await persist(event);
}

// 明确并发：同时启动，但等待全部结果
const results = await Promise.all(events.map((event) => persist(event)));
```

两段代码都可能返回按输入排列的结果，但副作用完成顺序不同。Agent 中的 provider delta 通常必须顺序处理；多个独立工具未来可以并发执行，却仍要按协议决定 transcript 的写入顺序。不要靠“这次日志碰巧有序”推断调度保证。

ESM 也在保护这种边界。公共文件只导出上层真正需要的类型和函数；在 NodeNext 配置下，TypeScript 源文件使用运行时会存在的 `.js` 相对路径。循环依赖往往说明所有权混乱：例如 `types.ts` 不应反向 import provider adapter，否则 canonical IR 已经知道了外部实现。遇到导入错误时先画依赖方向，不要急着改回 `require()` 或移除严格配置。

本课程不会用 `any` 或关闭 strict 换取短暂绿灯。若暂时不知道一个值的形状，就让它保持 `unknown`，把不确定性留在边界附近；这比让错误穿过五层调用后再爆炸更便宜。

:::pi title="与当前上游 Pi 对照"
当前 Pi 在 `packages/agent/src/types.ts` 和 `packages/ai/src/types.ts` 大量使用 tagged union、`Extract` 与 `import type` 表达事件协议。课程先用四个小事件练习同一机制，不复制上游复杂字段。上游还需要兼容许多 provider；本章验证器只是教学用最小边界，不代表生产验证已经完成。
:::

## 故意把它弄坏

下面的写法能让错误数据“看起来有类型”，却没有任何运行时证据：

```ts
const event = JSON.parse(raw) as DemoEvent;
console.log(formatEvent(event));
```

若 `raw` 是 `{"type":"delta","text":42}`，编译器不会替你检查数字。错误可能在更远处变成难以定位的字符串拼接或状态污染。

:::failure title="预期失败 · 用断言绕过边界"
把 `readDelta()` 临时替换为 `JSON.parse(raw) as DemoEvent`，输入数字 `text`。首次偏差应出现在边界测试“拒绝无效数据”处。若直到 `formatEvent` 才失败，说明验证责任放错了层。恢复显式收窄函数并重跑。
:::

## 本章验收

:::checkpoint title="Checkpoint 01 · 两条证据链"
`npm run workshop:test -- survival` 应通过；你能解释 `tsc --noEmit`、编译后的 ESM 和 `node --test` 分别证明什么，并能在不运行代码时指出遗漏的联合分支。检查 `git diff -- workshop/src/survival workshop/test/foundations-labs.test.ts`，确认只保留完成态。下一章会把这些事件放进真正的异步序列。
:::

## 可选迁移练习

:::transfer title="迁移 · 定义下载事件"
不复制 `DemoEvent`，独立定义 `queued | progress | completed | failed` 下载事件，并写一个穷尽的 `summarize()`。要求 `progress` 才能携带百分比，`failed` 才能携带错误。先写测试再实现；这次不给字段骨架。
:::

## 小结

我们没有“学完 TypeScript”，而是获得了构造 Agent 所需的生存集：用联合类型表示互斥状态，用 `never` 暴露遗漏，用 `unknown` 守住边界，用 ESM 连接模块，再让类型检查和行为测试提供不同证据。下一章只增加时间维度：事件如何逐个到达、怎样完成、又怎样取消。
