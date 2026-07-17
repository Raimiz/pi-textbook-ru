---
id: "06"
slug: tool-contract
part: core
partTitle: 第二部 · 闭合 Agent 核心
chapter: "06"
title: Tool 是类型化的环境动作
summary: 建立模型提议动作、程序验证并执行、结果重新进入对话的可信边界。
minutes: 110
difficulty: 核心
artifact: workshop/src/tool.ts
prerequisites: 03,04
terms: tool contract, runtime validation, registry, tool result, call id
upstream: packages/agent/src/types.ts, packages/agent/src/agent-loop.ts
---

## 你将得到什么

进入本章时，你的系统已经能用统一消息表示 `toolCall`，也能用 `ScriptedModel` 稳定地产生它；缺口是：模型的动作还只是一项不可信提议，没有任何东西证明名称存在、参数正确或执行失败后对话仍然完整。

本章只增加一种复杂性：**把不可信的动作提议穿过运行时边界，变成一次有类型、可取消、可观察的环境动作**。完成后你会修改 `workshop/src/tool.ts` 及对应测试，并能离线执行 `add` 工具，观察成功、未知工具、参数错误和异常四种结构化结果。

不能破坏的不变量是：**每个已经完成的 tool call，都必须得到一个带相同 `toolCallId` 的 tool result；失败改变的是 `isError`，不能让配对消失。**

若要恢复到本章起点，只需撤销 `workshop/src/tool.ts` 与本章测试中的改动；03～05 章产生的消息、事件流和模型文件不需要回退。开始前先保存一次 `git diff -- workshop/`，恢复后用相同命令确认只剩前章内容。

## 先建立全景

Tool 不是“给模型调用的普通函数”。普通函数的调用者受 TypeScript 约束；模型却可能给出不存在的名称、漏字段、错误类型，甚至一段尚未流完的 JSON。可信路径必须分成五步：

```text
assistant.toolCall
  └─ id/name/arguments（不可信）
       ├─ registry：名称是否存在？
       ├─ schema：完整参数能否通过运行时验证？
       ├─ execute：把 AbortSignal 传到副作用边界
       ├─ normalize：异常也变成 ToolOutput
       └─ ToolResultMessage（重新成为模型的 observation）
```

定义、调用和结果属于三个不同所有者：应用定义允许哪些工具；模型只能提出调用；执行器拥有验证、执行与错误归一化。`details` 给日志或 UI，`content` 才进入下一轮模型上下文。删掉 renderer 不应改变 Agent 的决策。

:::predict title="运行前先判断"
假设 `add.execute` 的 TypeScript 参数是 `{a:number,b:number}`。模型传入 `{"a":"2","b":3}` 时，直接写 `call.arguments as AddInput` 能否保证安全？如果工具内部抛错，应该没有 result、还是生成一个错误 result？
---answer
不能。类型断言只改变编译器看法，运行时字符串仍是字符串。异常必须在执行器边界被捕获，并生成与原 call id 配对的 `isError: true` 结果；否则 transcript 形成悬空调用，下一次 provider 请求也可能被拒绝。
:::

## 把描述层与执行层绑成一个契约

课程公共接口把“模型看见什么”和“程序能做什么”放在同一对象上，但不混淆二者：

```ts
export interface Tool<P, D = unknown> {
  name: string;
  description: string;
  schema: Schema<P>;
  execute(input: P, context: ToolContext): Promise<ToolOutput<D>>;
}

export interface ToolOutput<D = unknown> {
  content: TextContent[];
  details?: D;
  isError?: boolean;
}

export interface ToolContext {
  callId: string;
  signal?: AbortSignal;
  reportProgress?(content: TextContent[]): void;
}
```

`schema` 既用于向模型描述动作空间，也在运行时把 `unknown` 收窄为 `P`。因此执行顺序必须是“找到定义 → 验证完整参数 → 调用 execute”，绝不能让 `execute` 自己猜输入。当前上游 Pi 使用 `typebox` 表达 schema；课程版使用更小的验证器展示同一机制，这是教学简化，不是声称上游也如此。

还要注意“完整”二字。provider 可以逐段发来 tool arguments，增量只适合 UI 预览；只有 `toolcall_end` 之后形成的 canonical `ToolCallContent` 才能验证和执行。半段 JSON 恰好可解析，也不代表语义完整。

Schema 也不是全部契约。`description` 决定模型何时选择动作，schema 决定允许怎样表达动作，execute 决定真实副作用；三者若语义不一致，验证通过仍可能做错事。例如描述写“相对 workspace 的路径”，实现却接受任意绝对路径，类型完全正确，能力边界仍然失守。因此定义工具时要用同一组例子同时检查模型面与执行面：哪些调用应被鼓励、哪些应在验证期拒绝、哪些只能在执行期报告领域失败。

这也是为什么 Registry 应由当前运行显式携带，而不是藏在进程全局：动作空间是上下文的一部分，可以随产品模式收窄，并能被测试完整快照。

:::mechanism title="Registry 是当前动作空间"
Registry 不是便利的全局 Map，而是本次 context 明确授权的动作目录。注册时拒绝重名，查询未知名称时返回可诊断错误；`registry.list()` 供 adapter 提取 name、description、schema，序列化时不能把 `execute` 函数送给模型。这样“模型所见工具”与“执行器可解析工具”才不会漂移。
:::

:::lab title="实践 6.1 · 让 add 穿过运行时边界"
**目标：** 实现 `Tool`、`ToolRegistry` 和一个严格接收两个 number 的 `add`。

**文件：** `workshop/src/tool.ts`、`workshop/test/agent-loop.test.ts`

**动作：**
1. 定义 `ToolOutput`、`ToolContext` 与泛型 `Tool`。
2. Registry 构造时拒绝重复名称；从 `registry.list()` 映射出模型所需 definition。
3. 用 schema 拒绝缺少 `b` 与 `a` 类型错误；确认额外字段不会进入解析后的 typed 参数。
4. 在测试里设置 `executed = true`，证明验证失败时 `execute` 从未运行。

**运行：** `npm run workshop:test -- tool-contract`

**预期：** 合法输入得到文本 `5`；两类非法输入都得到稳定的验证路径，且 `executed` 保持 `false`；额外字段按课程 validator 的清洗策略被移除。
:::

## 无论怎样失败，都闭合一次调用

`executeToolCall` 是唯一允许把不可信 call 交给工具的门。成功与失败都构造同一种 canonical 消息形状：

```json
{
  "role": "toolResult",
  "toolCallId": "call_add_1",
  "toolName": "add",
  "content": [{"type":"text","text":"5"}],
  "details": {"operands": 2},
  "isError": false,
  "timestamp": 0
}
```

未知名称、schema 错误、取消和 `execute` 抛出的异常都应得到同样的外壳，只改变 `content/details/isError`。不要把原始 stack、绝对路径或密钥塞给模型；诊断细节可以留在内部事件中。

还要区分“工具运行失败”和“执行器自身损坏”。前者属于模型可以观察并修正的领域结果，例如文件不存在；后者是 Registry 被破坏或程序不变量失效，应由测试和运行监控暴露。课程把可预期的查找、验证与 execute 异常归一化，但不会用空 catch 吞掉结果构造器自身的缺陷。这个边界让恢复能力不会变成掩盖程序错误。

:::lab title="实践 6.2 · 实现永不丢配对的单次执行器"
**目标：** 让 `executeToolCall` 对所有可预期结局返回 `ToolResultMessage`。

**文件：** `workshop/src/tool.ts`、`workshop/test/agent-loop.test.ts`

**动作：**
1. 用 call 的 `name` 查 Registry，并只验证完成后的 `arguments`。
2. 将同一个 `AbortSignal` 放入 `ToolContext`。
3. 捕获查找、验证与 execute 异常，统一生成简短错误 observation。
4. 对每条路径断言 `toolCallId`、`toolName` 与 `isError`，而不只断言文本。

**运行：** `npm run workshop:test -- tool-contract`

**预期：** 成功、未知工具、非法参数、工具抛错均 resolve 为配对结果；测试进程没有未处理 rejection。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 中，`packages/agent/src/types.ts` 的 `AgentTool` 同样分离模型内容与结构化 details，并把 signal、进度回调交给 execute；`agent-loop.ts` 在执行前验证参数，并把工具异常转成错误结果。上游接口还包含 UI label、增量更新、执行模式和 hooks。课程此处刻意只保留最小闭环；共同点是运行时验证与 call/result 配对，而不是具体泛型写法。
:::

## 故意把它弄坏

:::failure title="删除异常归一化，观察首次偏差"
临时删掉 `executeToolCall` 外层的异常捕获，让一个工具抛出 `new Error("disk full")`。

不要只看最终测试红不红。第一处偏差应是：事件/返回值中已有 assistant tool call，却没有同 id 的 tool result；随后才是 promise rejection。恢复捕获后，断言错误文本稳定、`isError` 为 true，并且 Registry 仍可执行下一次调用。
:::

## 本章验收

:::checkpoint title="Checkpoint 06 · 动作边界闭合"
运行 `npm run workshop:test -- tool-contract`，并用四行表记录：输入、execute 是否运行、result id、isError。成功、未知名称、非法参数、抛异常必须各占一行。

验收不是“测试为绿”，而是你能从一个 `unknown` arguments 指出它在哪一步获得运行时信任，并解释为什么任何失败都不能破坏配对。恢复检查：撤销本章两处文件后，`git diff -- workshop/` 应回到第 05 章状态。
:::

## 可选迁移练习

:::transfer title="无脚手架迁移 · 实现 divide"
只给你 `Tool` 公共接口，不复制 add：实现 `divide({dividend, divisor})`。schema 通过但 divisor 为 0 时，让工具返回或抛出领域错误，再由执行器形成配对 observation。写一个测试证明“运行时参数合法”与“领域动作成功”是两道不同的门。
:::

进一步尝试：让两个工具声明同名，预测 Registry 应在哪个时刻拒绝；再为 `details` 增加结构化操作数，证明删掉 details 后模型 `content` 仍足以继续。

## 小结

Tool contract 把模型策略与环境副作用隔开：名称决定路由，schema 建立运行时信任，execute 承担动作，result 把环境观察送回模型。最重要的不是成功调用，而是失败仍有结构、取消仍可传播、每个 call 都有配对结果。下一章会把这个可靠的单次动作放进 Agent Loop；届时 loop 只负责状态迁移，不再重新解释工具错误。
