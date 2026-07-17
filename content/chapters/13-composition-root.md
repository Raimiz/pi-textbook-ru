---
id: "13"
slug: composition-root
part: product
partTitle: 第四部 · 从核心到产品
chapter: "13"
title: 一个核心，多种产品入口
summary: 在唯一组装边界连接模型、工具、会话与资源，让交互、文本和 JSON 模式共享同一套 Agent 语义。
minutes: 120
difficulty: 进阶
artifact: workshop/src/composition.ts
prerequisites: 09,10,11,12
terms: composition root, runtime, mode adapter, wire event, stdout, stderr
upstream: packages/coding-agent/src/core/agent-session-runtime.ts,packages/coding-agent/src/main.ts
---

# 一个核心，多种产品入口

## 你将得到什么

进入本章时，你已经有模型、工具、Agent、会话、context 和资源系统，但它们很可能由测试或某个 CLI 文件临时拼在一起。若 print、interactive、JSON 各自再拼一遍，三个“Pi”会逐渐拥有不同的终止、持久化和错误语义。

本章只增加一种复杂性：**产品入口与核心运行时的组合边界**。你将修改 `workshop/src/composition.ts`，让一个 composition root 组装 model、tools、session、context、resources 和 Agent；mode 只负责输入与呈现。完成后，同一 ScriptedModel 场景通过三种入口会产生相同的 canonical transcript，只是外部输出协议不同。

不能破坏的不变量是：

> Mode 可以改变输入输出形式，不能改变 Agent 如何思考、调用工具、终止和落盘。

先保存第 12 章 checkpoint。要恢复本章起点，只恢复 `workshop/src/composition.ts` 及 mode 黑盒测试；核心的 `agent-loop.ts`、`session.ts` 和 `context.ts` 不应该出现模式专用分支。

## 先建立全景

Composition root 不是新的“万能管理器”，而是依赖首次相遇的唯一地点：

```text
config ─┬─ model
        ├─ tool registry
        ├─ session store
        ├─ context builder
        └─ resources
               │
               ▼
          createRuntime()
               │ 共享 Agent/Session 行为
       ┌───────┼────────┐
       ▼       ▼        ▼
 interactive  print    json
  人类 I/O   Unix I/O  wire events
```

核心只发 typed events、接收 user message；它不知道 TTY、`process.stdout`、颜色、JSONL 或命令行参数。Mode adapter 则不知道 provider SDK、JSONL session 文件结构和 coding tool 构造函数。

对象生命周期也应在这里说清：composition root 创建 runtime，mode 在运行期间借用它，最外层负责 dispose。切换 session 或 cwd 时，先让旧 runtime 完成 shutdown，再为新边界重新发现资源和构造会话相关服务；不能让 UI 保存一个已经失效的 Agent 引用继续写旧 session。所有权明确后，取消、清理子进程和 extension 卸载才有唯一负责人。

判断边界是否正确有个直接办法：把 CLI 换成测试、网页或定时任务时，核心对象图是否仍能原样复用；把 provider 换成 ScriptedModel 时，mode 是否完全不知情。若答案是否定的，变化轴还没有被挡在正确位置。

:::predict title="在 loop 里判断 mode 会怎样"
把 `if (mode === "json") emitRawObject()` 写进 agent loop，短期能少一个 adapter。之后添加 RPC 或网页入口时，哪一层最先失控？
---answer
核心控制流会同时承担业务状态机和传输协议，测试必须为每个 mode 重跑所有终止分支，JSON 序列化错误也会伪装成 Agent 错误。正确做法是 loop 只发内部事件，由边界 adapter 映射为各自输出。
:::

## Composition root 只组装，不承载业务

先定义课程运行时的显式依赖。测试注入 ScriptedModel 和 memory session；真实 CLI 注入 provider adapter 和 JSONL store。两条路径调用同一个构造函数。

```ts
export interface RuntimeDeps {
  model: Model;
  tools: Tool[];
  session: SessionStore;
  resources: ResourceCatalog;
  systemPrompt: string;
  tokenBudget: number;
}

export function createRuntime(deps: RuntimeDeps): Runtime {
  const agent = new Agent({
    model: deps.model,
    tools: new ToolRegistry(deps.tools),
    session: deps.session,
    buildContext: (activePath) =>
      buildContext(activePath, {
        systemPrompt: deps.systemPrompt,
        tokenBudget: deps.tokenBudget,
      }),
  });
  return { agent, session: deps.session, resources: deps.resources };
}
```

这段函数应当无环境探测、无隐藏 singleton、无 `process.exit`。读取配置、打开文件和选择 mode 可以发生在它外面；一旦 `RuntimeDeps` 构造完，核心对象图就是可检查的。

还要抵抗“方便”的 service locator。若任意模块都能 `getGlobalRuntime()`，依赖虽然从构造函数上消失，却变成运行时顺序：先初始化谁、测试忘记清理什么、并行 case 共享了哪个 session。显式传入 `Runtime` 看起来多写几个参数，却让调用关系、替换边界和并发隔离都能由类型与测试检查。

:::mechanism title="Dependency injection 的价值是替换副作用"
重点不是“所有东西都要接口化”，而是把不稳定边界换掉：真实网络换 ScriptedModel，磁盘会话换 memory store，真实时钟换固定时钟。Agent 语义本身不要因测试而另写一份 fake loop。
:::

:::lab title="实践 13.1 · 抽出唯一 createRuntime"
**目标：** 让测试与三种 mode 共用一个 Agent 构造过程。

**文件：** `workshop/src/composition.ts`、`workshop/test/composition-eval.test.ts`

**动作：**
1. 定义 `RuntimeDeps` 与 `Runtime`，显式列出 model、tools、session、resources、context 配置。
2. 把所有 `new Agent` 移到 `createRuntime`；mode 文件只能接收 `Runtime`。
3. 给 model 和 session 加 identity spy，证明三种 mode 的测试没有隐藏构造第二份核心。
4. 用相同 scripted scenario 分别执行 mode，比较最终 canonical transcript。

**运行：** `npm run workshop:test -- composition`

**预期：** 三个 transcript 深相等；差异只存在于渲染输出；核心文件 diff 不含 mode 名称。
:::

## Mode 是协议适配器

Print mode 是 Unix 接口：输入来自参数或 stdin，最终文本写 stdout，诊断写 stderr，退出码表达结果。Interactive mode 可以维护编辑器、命令和流式渲染状态，但会话事实仍归 SessionStore。JSON mode 面向机器，应该把内部事件映射为稳定 wire protocol，而不是把任意内部对象直接 stringify。

Interactive adapter 的复杂状态尤其容易越界。输入历史、光标位置、折叠区域属于 UI；steering/follow-up 队列属于 Stateful Agent；已经提交的 user message 属于 session。用户按下取消键时，adapter 只发出 abort 意图，Agent 决定何时进入 aborted 终态，工具负责清理其进程。把三种状态放进一个“大界面对象”，恢复 session 时就无法判断哪些应该重放。

```ts
type WirePayload =
  | { type: "text_delta"; text: string }
  | { type: "tool_end"; callId: string; isError: boolean }
  | { type: "result"; status: "ok" | "error" | "aborted" };

type WireEvent = WirePayload & { v: 1; seq: number };

function createWireSequencer() {
  let seq = 0;
  return (payload: WirePayload): WireEvent =>
    ({ ...payload, v: 1, seq: ++seq });
}
```

Mode 根据第 09 章已经定义的 `message_update`、`tool_execution_end` 与 `agent_end` 选择公开 payload，再交给 sequencer；wire 层不反向修改 Agent event。Model event、Agent event、SessionEntry 与 WireEvent 是四套协议，因为它们分别服务 provider 增量、核心状态、持久化事实和外部兼容性。强行复用一个 union 会让任何内部重构都成为产品破坏性变更。

稳定黑盒输出应满足：

```text
stdout line 1: {"v":1,"seq":1,"type":"text_delta","text":"done"}
stdout line 2: {"v":1,"seq":2,"type":"result","status":"ok"}
stderr:         [diagnostic] using scripted model
exit code:      0
```

每行 stdout 必须能独立 `JSON.parse`；日志、颜色和 stack trace 不得混入。课程增加 `v`、`seq` 和显式终态，是为了让自动化接口可演进。

Wire trace 还要能被迟到的消费者重放。`seq` 在每次 run 从一开始，result 是唯一终态；消费者发现序号缺口时应报告不完整，而不是自行猜测 delta。重放得到的是对外时间线，不是把 wire event 再写成 SessionEntry：若要恢复会话，仍以 session store 为事实源。这样网络重试、UI 重绘和历史恢复不会互相夺取所有权。

:::lab title="实践 13.2 · 用黑盒测试锁住三条输出通道"
**目标：** 实现 text 与 JSON 输出 adapter，并保证 stdout、stderr、exit code 各司其职。

**文件：** `workshop/src/composition.ts`、`workshop/test/composition-eval.test.ts`

**动作：**
1. 定义 `runPrint(runtime, io)` 与 `runJson(runtime, io)`，由注入的 writer 收集输出。
2. Text 成功时 stdout 只有最终文本；error/aborted 时 stderr 有诊断且退出码非零。
3. JSON 为每个对外事件分配严格递增 seq，并总以 result 终态结束。
4. 用子进程或等价 black-box fixture 验证每行可解析、stderr 不污染 stdout。

**运行：** `npm run workshop:test -- composition`

**预期：** 同一 Agent 错误在 text mode 形成非零退出码，在 JSON mode 形成 error result；两者的 session history 相同。
:::

## 配置先归一化，再进入对象图

Composition root 不应到处读取 `process.env`。先把默认值、用户配置、项目配置、环境变量和 CLI 参数按公开 precedence 合成一份 `ResolvedConfig`，保留每个值的来源，再交给依赖工厂。Secret 只保留“已设置/来源”，诊断时永不回显值。

```text
tokenBudget = 32000  source=project:.practice.json
model       = fake   source=cli
apiKey      = [set]  source=env:MY_PI_API_KEY
sessionDir  = .runs  source=default
```

可以增加只读 doctor 检查 Node、cwd、配置、认证、session 可写性和 shell，但不要自动修复。这里的 precedence、doctor、版本化 wire events 都是课程产品化增强，不应包装成当前上游的逐项等价实现。

配置错误也要在启动阶段终止，而不是等到第一次模型调用。例如未知 mode 属于参数错误，不可写 sessionDir 属于存储诊断，缺少真实 provider key 属于认证诊断；使用 ScriptedModel 时则不该强制要求 key。Doctor 与启动共享同一套解析器，但只读取和报告，不偷偷创建目录或改配置，否则“检查”本身会改变待检查状态。

:::pi title="Pi 8479bd84743e 的真实产品主路径"
当前 `main.ts` 解析 CLI 后，通过 `createAgentSessionServices`、`createAgentSessionFromServices` 和 `createAgentSessionRuntime` 组装 `AgentSession`；interactive、print/text、print/json 与 RPC 都消费这套 session/runtime。底层仍是 `Agent + coding-agent/AgentSession + coding-agent/SessionManager`。`packages/agent/src/harness/AgentHarness` 提供另一套更通用的 session、resources、compaction 与 hook 组合能力，但 coding-agent 产品入口尚未整体切换过去。上游 JSON mode 直接输出 session header 与 `AgentSessionEvent`；课程的版本化 wire envelope 是主动增强。
:::

## 故意把它弄坏

:::failure title="失败注入 · JSON adapter 自己创建 Agent"
在 `runJson` 内偷偷 `new Agent(...)`，而不是使用传入 runtime。让原 runtime 先恢复一条已有 session，再运行 JSON。

```text
expected transcript: [old user, old assistant, new user, new assistant]
observed transcript: [new user, new assistant]
first divergence: mode constructs a second Agent/session
violated invariant: mode 只能适配 I/O，不能拥有核心状态
```

不要把旧消息复制进新 Agent 作为补丁；删除 mode 的构造权，回到唯一 `createRuntime`。再检查 identity spy 与 session store 的 append 记录。
:::

## 本章验收

```bash
npm run workshop:test -- composition
npm run workshop:test -- agent
npm run workshop:test -- session
```

另外做一次结构检查：在 `agent-loop.ts`、`agent.ts` 中搜索 `interactive|print|json|stdout`，结果应为空。然后用同一 fixture 比较三种 mode 的 transcript hash。

:::checkpoint title="Checkpoint 13 · 产品入口共享一个核心"
**完成状态：** `createRuntime` 是唯一核心组装点；mode 只把输入送入 runtime，并把事件映射为人类或机器协议。

**观察证据：** 三种 mode 的 canonical transcript 相同；JSON stdout 每行可解析且 seq 递增；诊断只到 stderr。

**恢复：** 从本章开始前的提交恢复 `workshop/src/composition.ts` 和 composition 测试。核心能力仍完整，只失去统一的多入口组装。
:::

## 可选迁移练习

:::transfer title="新增消费者，而核心 diff 为零"
不提供 mode 模板。自行增加一个收集事件并返回内存对象的 library adapter，供另一个 Node 程序调用。验收要求：`agent-loop.ts`、`agent.ts`、`session.ts` diff 为零；取消时返回 aborted 终态；同一 scripted scenario 的 transcript 与 print mode 相同。
:::

延迟检索题：一周后不看源码解释“为什么 SessionEntry 不能直接作为 JSON wire event”。至少从持久化兼容、敏感信息、增量粒度和内部重构四个方面作答。

## 小结

- Composition root 是依赖唯一相遇点，不是新的业务层或 service locator。
- 三种 mode 共享 Agent、会话、context 与错误语义，只改变输入输出协议。
- 内部事件、持久化 entry 和外部 wire event 必须分层。
- stdout、stderr、exit code 是独立产品契约，需要黑盒测试。
- 当前 Pi 产品主路径仍基于 `AgentSessionRuntime/AgentSession/SessionManager`；通用 `AgentHarness` 是并存方向，而非已完成迁移。
