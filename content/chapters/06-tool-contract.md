---
id: "06"
slug: tool-contract
part: core
partTitle: 第二部 · 闭合 Agent 核心
chapter: "06"
title: Tool 是类型化的环境动作
summary: 依次实现 validator、Registry 和 executor，把模型提出的动作变成完整、配对的环境结果。
minutes: 150
difficulty: 核心
artifact: packages/pi-course/src/tool.ts
prerequisites: 03,05
terms: tool contract, runtime validation, registry, tool result, call id
upstream: packages/agent/src/types.ts, packages/agent/src/agent-loop.ts
---

## 你将得到什么

到第 05 章为止，模型已经可以生成完整的 `ToolCall`。但这个调用仍是一项不可信的
提议：工具名可能不存在，参数可能缺字段或类型错误，工具本身也可能抛出异常。
TypeScript 无法约束模型在运行时发来的 JSON。

本章处理一个新问题：**怎样把不可信调用变成一条可信、完整的环境观察。**

你将实现三个连续边界：

1. validator 把 `unknown` 参数收窄成工具需要的类型；
2. `ToolRegistry` 决定本次运行允许哪些工具；
3. `executeToolCall()` 负责查找、验证、执行和结果归一化。

完成后，成功、未知工具、参数错误和工具异常都会返回 `ToolResultMessage`。每条结果
都保留原调用的 id 和 name。上层不需要用一个分支处理成功，再用三个异常通道处理
失败。

本章只修改：

```text
packages/pi-course/src/tool.ts
```

重新练习时，运行：

```bash
npm run practice -w @pi/course -- 06 <新目录>
```

练习目录会保留第 05 章源码，注入第 06 章测试，并放入一份只用于学习的代码骨架。
骨架已经声明 `Schema`、`Tool`、`ToolRegistry` 和 executor 的公共签名，主要的
未实现入口都带有 Lab 编号。验证、注册、执行和错误归一化仍要由你完成。

如果想从头再来，请创建另一个练习目录。隔离目录没有 Git 历史，不要修改注入测试，
也不要在里面运行恢复 commit 的命令。

本章不变量是：

> 执行器每收到一个完整的 tool call，都必须返回一个 `ToolResultMessage`。结果沿用
> 原调用的 `toolCallId` 和 `toolName`；失败只改变内容、details 与 `isError`。

## 先建立全景

模型只负责提出调用。程序拥有信任边界：

```text
ToolCall
  id / name / arguments: unknown
             │
             ▼
      ToolRegistry.get(name)
             │
      ┌──────┴──────┐
    未找到          找到 Tool
      │               │
      │        schema.parse(arguments)
      │               │
      │        ┌──────┴──────┐
      │      验证失败       typed input
      │        │              │
      │        │        tool.execute()
      │        │              │
      └────────┴──────┬───────┘
                     ▼
             ToolResultMessage
```

三个组件各自回答一个问题：

| 组件 | 问题 | 不能负责什么 |
|---|---|---|
| validator | 这个 `unknown` 是否符合参数形状？ | 工具是否存在、动作是否成功 |
| Registry | 当前运行是否授权了这个工具名？ | 参数验证、执行副作用 |
| executor | 怎样按固定顺序调用前两者并形成结果？ | 工具内部的业务规则 |

`Tool` 把模型可见的描述和程序可执行的函数放在同一个契约中：

```ts
export interface Tool<P, D = unknown> {
  name: string;
  description: string;
  schema: Schema<P>;
  execute(
    parameters: P,
    context: ToolContext,
  ): Promise<ToolOutput<D>>;
}
```

`schema` 同时提供两种能力。`parse()` 在运行时把 `unknown` 收窄成 `P`；
`jsonSchema` 告诉 provider 允许生成哪些字段。两者必须描述同一组参数。否则，模型
以为可以生成的参数会被执行器拒绝，或者执行器接受了模型并不知道该怎样生成的参数。

:::predict title="运行前先判断"
`echo` 的 TypeScript 参数类型是 `{ value: string }`。模型却传来
`{ "value": 1 }`。如果代码写成 `call.arguments as { value: string }`，工具收到的
值会自动变成字符串吗？工具抛出 `new Error("exploded")` 时，调用结果还要保留原
call id 吗？
---answer
类型断言只改变编译器的看法，运行时的 `1` 仍是 number。参数必须先经过
`schema.parse()`。工具异常也要形成错误 `ToolResultMessage`，并保留原 id；否则
下一轮只看到一个没有结果的悬空调用。
:::

:::rebuild title="Checkpoint 06 · 依次建立三道工具边界"
**模式：** 重建。从 05 的 target 开始，只实现工具契约。

**起终点：** parent 是本章开始时的起点快照；target 是 4 项聚焦测试通过的终点
快照。

**怎么使用这张卡：** 先读完当前实践前的机制，再只替换对应 Lab 的显式异常。
每段结束都先取得局部绿灯。

**教学文件：** `packages/pi-course/src/tool.ts`

**学习脚手架：** 练习目录中的 `tool.ts` 只固定公共类型和函数签名，不含任何核心
实现。它让泛型接口先通过编译，学习者仍要亲自完成三道边界。

**动手前只需知道：** validator 是带 JSON Schema 元数据的函数；Registry 是本次
运行自己的工具表；executor 的固定顺序是 `lookup → parse → execute → normalize`。

**第一次红灯：** build 会通过。只运行第一段测试时，会得到
`Lab 6.1 objectSchema 尚未实现`，测试名称含“validator”。先完成 validator，
不要同时写 Registry 和 executor。

**第一步：**
1. 运行 build，确认公共表面已经完整。
2. 运行“validator”测试，确认第一条运行时红灯来自 Lab 6.1。
3. 完成实践 6.1，取得 `1/1`。
4. 完成实践 6.2，取得另一个 `1/1`。
5. 完成实践 6.3，先取得 `2/2`，再运行本章全部 `4/4`。

**聚焦测试：** `packages/pi-course/test/06-tool-contract.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 06`

**练习目录：** `npm run practice -w @pi/course -- 06`

**聚焦运行：** `npm run build -w @pi/course`，然后 `node --test packages/pi-course/dist/test/06-*.test.js`

**通过证据：** 4 项聚焦测试分别观察 validator、Registry 和执行器；最后两项还
检查 signal、progress、details、`isError` 与完整错误配对。

第一次尝试禁止查看完整答案。若卡住，陪练按“当前组件 → 公共签名 → 伪代码 →
单个分支”的顺序增加提示。
:::

## 第一步：让 validator 同时携带行为和描述

脚手架已经给出这个类型：

```ts
export type Validator<T> = ((value: unknown) => T) & {
  jsonSchema?: Record<string, unknown>;
  optional?: boolean;
};
```

`Validator<T>` 要完成两件事：作为函数验证输入，同时用对象属性保存元数据。
`Object.assign()` 可以把函数和元数据合成同一个值：

```ts
export const stringValue: Validator<string> = Object.assign(
  (value: unknown) => {
    if (typeof value !== "string") throw new Error("必须是 string");
    return value;
  },
  { jsonSchema: { type: "string" } },
);
```

`optionalString` 收到 `undefined` 时直接返回 `undefined`，其他值复用
`stringValue()`。它的元数据还要带 `optional: true`。`optionalPositiveInteger`
使用相同结构，只接受大于等于 1 的整数。

`objectSchema(shape)` 也要完成两件事。

先从 shape 生成 provider 看见的 JSON Schema：

```text
properties           每个 validator 的 jsonSchema
required             没有 optional 标记的 key
additionalProperties false
```

再实现 `parse(value)`：

1. 拒绝 `null`、数组和其他非对象值；
2. 只遍历 shape 中声明的 key；
3. 把输入对应字段交给各自 validator；
4. 返回一个新对象。

因为只遍历 shape，输入中的额外字段不会进入结果。这里的“清洗”指构造新对象，
不表示修改传入对象。

代码骨架已经写好下面这段映射类型（mapped type）：

```ts
{
  [TKey in keyof TShape]: ReturnType<TShape[TKey]>;
}
```

它把每个 validator 的返回类型映射到同名字段。你只需实现运行时逻辑，不必重新设计
这段泛型。

:::lab title="实践 6.1 · 收窄 unknown，并生成 JSON Schema"
**目标：** 让同一组 validator 同时约束运行时输入和 provider definition。

**文件：** `packages/pi-course/src/tool.ts`

**动作：**
1. 实现 `stringValue`、`optionalString` 和 `optionalPositiveInteger`。
2. 在 `objectSchema()` 中生成 `properties`、`required` 和
   `additionalProperties: false`。
3. `parse()` 只复制 shape 中声明的字段，并调用对应 validator。
4. 保留脚手架中的公共签名，删除 Lab 6.1 的显式异常。
5. 先 build，再只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="validator" \
  packages/pi-course/dist/test/06-*.test.js
```

**预期：** `1/1`。测试会检查完整 JSON Schema、合法输入、可选字段、额外字段清洗，
以及非对象输入、非字符串字段和非正整数字段。
:::

## 第二步：让每次运行显式持有动作空间

`ToolRegistry` 使用自己的 `Map<string, Tool>` 保存工具。不要把它放到模块级全局变量；
不同产品入口可以授权不同工具，测试也需要创建互不影响的 Registry。

四个方法的职责很窄：

```text
register(tool)  重名时抛错，否则保存
get(name)       返回工具或 undefined
list()          按注册顺序返回工具数组
definitions()   只导出 name、description、schema
```

`definitions()` 的结果会交给第 05 章的 provider adapter。`execute` 是本地函数，
不能序列化到网络请求中。工具没有 `jsonSchema` 时，可以使用
`{ type: "object" }` 作为最小描述；本章的 `objectSchema()` 会提供更精确的定义。

:::lab title="实践 6.2 · 建立本次运行的 ToolRegistry"
**目标：** 让模型看到的工具定义与执行器能找到的工具来自同一张表。

**文件：** `packages/pi-course/src/tool.ts`

**动作：**
1. 给每个 Registry 实例创建私有 `Map`。
2. 构造器收到初始工具时，逐个调用 `register()`。
3. `register()` 在写入前检查重名；不要默默覆盖旧工具。
4. 完成 `get()` 与 `list()`。
5. `definitions()` 只返回 provider 需要的三个字段。
6. 删除 Lab 6.2 的显式异常，运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Registry" \
  packages/pi-course/dist/test/06-*.test.js
```

**预期：** `1/1`。测试会确认构造器接收初始工具，比较完整的工具定义，检查
`list()` 是否保留对象和顺序，并证明再次注册同名工具会被拒绝。
:::

## 第三步：让每种预期结果都带着原调用返回

`executeToolCall()` 的顺序不能交换：

```text
1. registry.get(call.name)
2. tool.schema.parse(call.arguments)
3. tool.execute(typedInput, { ...context, callId: call.id })
4. 把 ToolOutput 变成 ToolResultMessage
```

名称不存在时，不调用 schema。验证失败时，不调用 `execute`。成功时，原样保留
工具返回的 `content`、`details` 和 `isError`；工具没有提供 `isError` 时使用
`false`。

可以先写一个 `failedResult(call, error)`，让三类可预见的失败使用同一种消息结构：

```json
{
  "role": "toolResult",
  "toolCallId": "i",
  "toolName": "echo",
  "content": [
    {"type": "text", "text": "Tool echo failed: 必须是 string"}
  ],
  "details": {"error": "必须是 string"},
  "isError": true
}
```

执行器只把 `error.message` 放入结果，不包含 stack。它无法自动识别任意字符串中的
绝对路径或密钥。因此，工具实现仍要避免把秘密写进异常消息，产品层以后还要加入
专门的脱敏策略。

`ToolContext` 还包含 `signal` 和进度回调 `reportProgress`：

```ts
{
  ...context,
  callId: call.id,
}
```

执行器负责原样传递它们。signal 能否及时停止动作，取决于工具是否主动检查并响应。
本章的测试只证明取消信号会到达工具；执行器无法强制一个忽略 signal 的工具停下。

`details` 供日志或 UI 使用；`content` 会进入下一轮模型上下文。即使 UI 不读取
`details`，模型看到的 `content` 也不应改变。

:::lab title="实践 6.3 · 实现闭合的单次执行器"
**目标：** 让成功和三类失败都通过 Promise 正常返回完整、配对的
`ToolResultMessage`。

**文件：** `packages/pi-course/src/tool.ts`

**动作：**
1. 写 `failedResult()`，统一 role、id、name、错误文本、details、`isError` 和时间。
2. 实现 `lookup → parse → execute → normalize`。
3. 未知名称直接返回失败结果；用同一个 try/catch 捕获 schema 与 execute 的异常，
   再统一转换成失败结果。
4. 把外部 context 展开后再写入 `callId`，保证调用 id 不能被覆盖。
5. 成功结果保留工具给出的 `details` 与显式 `isError`。
6. 删除 Lab 6.3 的显式异常，先运行“执行器”测试，再运行本章全部测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="执行器" \
  packages/pi-course/dist/test/06-*.test.js
node --test packages/pi-course/dist/test/06-*.test.js
```

**预期：** 局部 `2/2`，完整 `4/4`。测试会证明非法参数没有进入副作用；完整错误
外壳保留 id 和 name；signal、progress、details 与显式 `isError` 没有丢失。
:::

:::mechanism title="配对结果让失败仍可进入反馈回路"
模型下一轮需要知道动作发生了什么。成功文本、未知工具、参数错误和领域失败都属于
环境反馈。它们使用同一种消息形状后，第 07 章的 Agent loop 只需追加结果，不必
从异常中猜测失败属于哪个 call。
:::

:::note title="这 4 项测试没有证明什么"
本章没有证明预取消会阻止工具启动，也没有证明中途取消、多个工具并发、progress
事件顺序或 Registry 的长期生命周期。测试只检查 signal 被传入工具。它们还没有
证明所有错误文本都不含绝对路径或密钥，也没有验证专门的错误脱敏策略。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 中，`packages/agent/src/types.ts` 的 `AgentTool` 同样把 schema、
execute、signal、进度回调、模型 content 和结构化 details 放进工具边界。
`packages/agent/src/agent-loop.ts` 会在执行前验证参数，并把工具异常转换成错误结果。
上游使用 `typebox`，还支持 UI label、增量更新、hooks 和更多执行模式。课程用小型
validator 展示相同的信任顺序。
:::

## 故意把它弄坏

临时把 schema 验证移到 `execute()` 之后：

```text
错误顺序：lookup → execute(raw arguments) → parse
```

当 `echo` 收到 `{ value: 1 }` 时，副作用计数会从 1 变成 2。测试会先在
`executionCount` 上失败，之后才会比较错误结果。

:::failure title="预期失败 · 让非法参数先进入副作用"
只修改执行顺序，不改测试。运行名称含“执行器”的两项测试，应在一秒内得到
`executionCount` 的明确差异。恢复 `parse → execute` 后，重跑同一命令得到 `2/2`。
这个实验只观察单次执行器，不借用下一章的 transcript。
:::

## 本章验收

:::checkpoint title="Checkpoint 06 · 工具边界闭合"
运行：

```bash
npm run build -w @pi/course
node --test packages/pi-course/dist/test/06-*.test.js
```

应得到 `4/4`。然后用一张表解释四种调用：

| 输入 | execute 是否运行 | result id/name | isError |
|---|---:|---|---:|
| 合法 `echo` | 是 | 与 call 相同 | false |
| 未知名称 | 否 | 与 call 相同 | true |
| 参数类型错误 | 否 | 与 call 相同 | true |
| 工具抛错 | 已进入工具 | 与 call 相同 | true |

最后回答：参数在哪一步或哪条语句中从 `unknown` 获得运行时信任？为什么 signal
传播不等于取消保证？为什么错误结果仍要保留 call id 和 name？

若需要重做，创建一个新的 practice 目录。下一章会把这个单次执行器放进 Agent loop，
闭合 `model → tool → result → model`。
:::

## 可选迁移练习

:::transfer title="迁移 · 实现一个 uppercase 工具"
完成本章三段重建后，再创建 `uppercase({ value: string })`。复用 `stringValue` 和
`objectSchema()`，不要复制 `echo` 的完整对象。写两个测试：合法输入返回大写文本；
number 输入在执行前失败，并保留原 call id。只迁移工具定义，不修改 Registry 或
executor。
:::

## 小结

validator 负责验证参数，Registry 保存本次运行允许使用的工具，executor 按固定顺序
把调用变成结果。即使工具名不存在、参数不合法或动作抛错，调用仍会得到完整、配对
的 `ToolResultMessage`。

第 07 章不再处理这些局部错误。它只负责把模型消息、工具调用和工具结果按正确顺序
写回同一条反馈回路。
