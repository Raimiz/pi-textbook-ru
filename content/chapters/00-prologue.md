---
id: "00"
slug: prologue
part: orientation
partTitle: 序章 · 先看见完整系统
chapter: "00"
title: 先观察一次完整的 Agent 运行
summary: 先读懂一条从用户目标到工具结果再到最终回答的完整轨迹，为全书建立地图。
minutes: 35
difficulty: 入门
artifact: workshop/src/demo/prologue.ts
prerequisites:
terms: agent, model, tool call, tool result, transcript
upstream: packages/coding-agent/src/main.ts
---

## 你将得到什么

进入本章时，你还没有 Agent，也不需要先理解所有 TypeScript。我们先观察最终成品的一次离线运行：用户要求读取项目说明，模型请求工具，环境返回结果，模型再给出回答。你将得到一张能贯穿全书的地图，并学会用事件轨迹判断系统是否真的闭环。

本章只增加一种复杂性：**把“Agent 会思考”改写成可观察的数据流**。我们暂时不实现模型和工具。完成后你会接触 `workshop/src/demo/prologue.ts`，能解释一条固定轨迹中的每个所有者，并指出一条不能破坏的不变量：

> 每一个被接受的 tool call，最终都必须有一个相同 `toolCallId` 的 tool result。

若想恢复本章起点，不需要回滚代码；重新运行固定脚本即可。它不访问网络，也不修改工作区。

## 先建立全景

假设用户说：“读取 `README.md`，用一句话告诉我这个项目做什么。”离线演示产生下面的稳定轨迹：

```text
01 user_message       "读取 README.md，并概括项目"
02 model_start
03 assistant_message  stopReason=toolUse
   toolCall           id=call_1 name=read arguments={"path":"README.md"}
04 tool_start         id=call_1
05 tool_result        id=call_1 isError=false content="# tiny-pi ..."
06 model_start
07 assistant_message  stopReason=stop
   text               "这是一个用于学习 Agent 内核的 TypeScript 项目。"
```

这里没有神秘的“自主性”。Agent 只是反复回答三个问题：当前事实是什么、模型下一步请求什么、这个请求应当由谁执行。模型拥有生成内容的责任，却不拥有文件系统；工具拥有环境副作用，却不能决定下一轮提示；循环拥有顺序和终止责任，却不应理解 `read` 的业务细节。

阅读轨迹时要区分“系统已经观察到的事实”和“我们根据最终答案做出的猜测”。第 03 行只能证明模型请求读取；第 04 行只能证明执行开始；直到第 05 行出现，读取结果才成为可供下一轮使用的环境事实。若只看第 07 行，我们甚至无法排除模型凭训练记忆猜中答案。后续测试因此不会只断言最后一句字符串，还会检查中间消息、配对键和 stop reason。这种检查方式会贯穿全书：先找首次偏差，再讨论最终表现。

:::predict title="运行前先判断"
如果删掉第 05 行，但仍把第 03 行的 tool call 和第 07 行的最终文本保存下来，下一轮模型能否可靠知道文件读取成功？
---answer
不能。tool call 只是动作请求，不是环境事实。缺少配对的 tool result 后，模型既不知道动作是否执行，也不知道得到什么；“最终文本看起来合理”不能修补这段断裂的因果链。
:::

## 用消息而不是界面描述事实

终端会把事件渲染成几行文字，但界面不是事实源。后续章节会建立统一消息语言；现在先看它的最小形状：

```ts
type AgentMessage =
  | { role: "user"; content: TextContent[]; timestamp: number }
  | {
      role: "assistant";
      content: (TextContent | ToolCall)[];
      provider: string;
      model: string;
      usage: Usage;
      stopReason: "stop" | "length" | "toolUse" | "error" | "aborted";
      errorMessage?: string;
      timestamp: number;
    }
  | {
      role: "toolResult";
      toolCallId: string;
      toolName: string;
      content: TextContent[];
      details?: unknown;
      isError: boolean;
      timestamp: number;
    };
```

同一份 `AgentMessage[]` 可以被终端打印、写入 JSONL、变成下一次模型请求，或在网页中折叠显示。若反过来把彩色终端字符串当历史，颜色、换行和日志前缀就会混入语义，恢复会话时也无法可靠找到 tool call。

:::mechanism title="三个所有者"
模型产生 `assistant` 消息；工具产生环境观察；Agent loop 负责把两者按协议追加进 transcript。把责任分开后，任何错误都能先定位到“生成、执行、编排”中的一层。
:::

:::lab title="实践 0.1 · 给轨迹标注所有者"
**目标：** 把“智能行为”拆成可检查的责任。

**文件：** `workshop/src/demo/prologue.ts`

**动作：**
1. 先不看实现，为七行轨迹分别标记 `user / model / loop / tool`。
2. 运行演示，比较你的标注与事件的 `owner` 字段。
3. 找出唯一造成环境副作用的步骤。

**运行：** `npm run workshop:test -- prologue`

**预期：** 测试打印固定的七步轨迹；唯一的环境动作是 `read`，模型本身没有读文件。
:::

## 从终点倒推我们要造的部件

完整运行可以压缩成一条重复路径：

```text
用户目标
  → AgentContext
  → Model.stream()
  → EventStream<ModelEvent, AssistantMessage>
  → tool call
  → 工具执行与 tool result
  → 更新 AgentContext
  → 下一次 Model.stream()
  → stop
```

第一部会造 `AgentContext`、消息 IR、`EventStream`、`ScriptedModel` 和真实 provider 边界；第二部才闭合工具与循环；第三部让运行可取消、可保存、可恢复；第四部再处理扩展、产品入口和系统评测。这个顺序不是仓库导览，而是每次只让一个未知量进入系统。

注意这条主链会重复出现，而不是一章讲完就被丢弃。第一次它只是固定 trace；加入 EventStream 后能观察时间；加入消息 IR 后能保存语义；加入工具后才真正接触环境；加入 session 后可以恢复与分支。每一次重走同一条路，旧部件都要在新约束下再次证明自己。你最终记住的应当是稳定因果关系，而不是某个版本的文件树。

:::lab title="实践 0.2 · 用因果关系重排事件"
**目标：** 证明你理解顺序，而不是记住行号。

**文件：** `workshop/src/demo/prologue.ts`

**动作：**
1. 复制测试中的乱序事件数组。
2. 只根据 `toolCallId` 和“消息先于其结果”的约束恢复顺序。
3. 把 `tool_result` 移到 `tool_call` 之前，观察断言的首次偏差。

**运行：** `npm run workshop:test -- prologue`

**预期：** 正常顺序通过；错误顺序首先失败在配对前置条件，而不是最终文本断言。
:::

:::pi title="与当前上游 Pi 对照"
固定参考提交为 `8479bd8`。真实入口还要加载配置、模型和扩展，但进入核心后仍沿着“消息 → 模型流 → 工具结果 → 下一轮”推进。序章刻意省略网络、并发和会话树，只保留不会随界面变化的主链路；这属于课程简化，不代表上游只有七个事件。
:::

## 故意把它弄坏

把工具错误伪装成成功文本，是最危险的“看起来还能跑”。例如读取不存在的文件时，下面这条消息保留了配对关系，也保留了失败事实：

```json
{
  "role": "toolResult",
  "toolCallId": "call_1",
  "toolName": "read",
  "content": [{ "type": "text", "text": "ENOENT: README.md" }],
  "isError": true
}
```

:::failure title="预期失败 · 删除配对结果"
删除轨迹中的 `tool_result` 后运行测试。首次偏差应是 `call_1` 没有结果，而不是“回答文字不同”。若测试只检查最后一句话，它会错误放行一条断裂轨迹；先修验收证据，再恢复事件。
:::

## 本章验收

:::checkpoint title="Checkpoint 00 · 能画出闭环"
你应能不看正文画出 `user → model → tool call → tool result → model → stop`，并回答每一步的所有者。运行 `npm run workshop:test -- prologue` 应通过。恢复方法是重新使用仓库中的固定脚本，不设置 API key，也不编辑相邻目录。下一章将只补齐读懂这些类型所需的 TypeScript 生存集。
:::

## 可选迁移练习

:::transfer title="迁移 · 换成失败的 Bash"
不修改主轨迹代码，另写一条五到七步的纸面轨迹：模型请求 `bash`，命令退出码为 2，模型据此解释失败。标出 call/result 配对和 `isError`。不要写“模型执行命令”；若能保持所有权与失败事实，你已把不变量迁移到另一个工具。
:::

## 小结

Agent 的最小本质不是聊天界面，而是由类型化事实连接起来的反馈回路。消息保存语义，模型提出下一步，工具接触环境，循环维护顺序。序章只让你看见终点；从下一章开始，我们会逐件造出它，并让每个部件都能被测试、破坏和恢复。
