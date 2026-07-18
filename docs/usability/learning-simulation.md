# Pi 教材学习模拟记录

测试日期：2026-07-17  
学生：干净 subagent，基本编程经验，无 Agent 工程与课程前置知识  
陪练：干净 subagent，只读 target，受 L0–L4 提示阶梯约束  
协调者：主 agent

## 总览

| 章 | 首次能否开始 | 首次置信度 | 最高提示 | 结果 |
|---|---:|---:|---:|---|
| 00 | 否：无法确定工作对象与是否重写 | 3.5/5 | 修复后 L0 | PASS · 2/2 |
| 01 | 是，但需自行消解两棵路径 | 4.5/5 | L0 | PASS · 2/2 |
| 02 | 是 | 4.5/5 | L0 | PASS · 局部 1/1、全量 2/2 |
| 03 | 是 | 4.5/5 | L0 | PASS · 局部 1/1、全量 2/2 |
| 04 | 是 | 4.5/5 | L0 | PASS · 局部 1/1、全量 3/3 |
| 05 | 是 | 4.8/5 | L0 | PASS · 局部 1/3/5/2、全量 11/11 |
| 06–14 | 待测 | — | — | 待测 |

## Chapter 00 · 基线

学生能独立复述完整反馈回路和 call/result 配对不变量，也能预测删除结果会破坏
因果链。这说明概念主线有效。但学生把 `workshop/src/demo/prologue.ts` 当成实际
教学文件，并明确表示“仅凭教材不能可靠开始写”。他还无法区分事件 `owner`、
外层调用发起者和副作用执行者。

隔离 target 快照第一次运行因实验夹具错误找不到 `tsc`。协调者只修正依赖链接，
重复完全相同命令后 2/2 测试通过；该问题归类为测试夹具，不归咎教材。

学生静态对照后发现实践 0.2 与真实测试漂移：正文要求复制“乱序数组”，目标测试
实际删除 `tool_result` 并重新编号。陪练独立确认三项教材问题：

1. 00 是观察章，但 commit 协议暗示从不存在课程包的 parent 重建 201 行；
2. `workshop/` 与 `packages/pi-course/` 没有说明各自用途；
3. owner 语义和故障实验 oracle 都不够精确。

### 修复

- 新增每章 `rebuild` 入口，00 明确为观察，01–14 明确为重建；
- 显式区分教学历史与最终参考实现；
- 定义 owner 是事件事实的归属，不等于调用发起者；
- 说明固定 fixture 不执行真实读取；
- 让实践 0.2 与“删除结果并重新编号”的真实测试一致；
- 把上述契约写入自动回归测试。

### 同章复测

第一次修订后，学生已能复述模式与路径，但陪练发现 `checkpoint` 仍只定位历史，
没有生成真正可动手的起点。第二次修订新增 `practice`：00 导出 target 观察，
01～14 从 parent 导出源码并只注入目标聚焦测试。学生在全新目录中独立完成
install、build 与 2/2，陪练也判定五项原问题全部解决。

陪练随后发现 00 的 `LEARNING.md` 同时写“没有 target 实现”和“已经处于
target”。按同章回归规则，先增加失败断言，再改成“没有额外 Git 历史或另一份
答案”，两方第三轮复测均通过。最后，学生与陪练都报告无 Git 目录中的 Husky
警告会形成无关噪声；练习生成器删除隔离根包的 Git-only `prepare` 钩子，第四轮
完整流程再次通过：

```text
checkpoint  exit 0
practice    exit 0
npm install exit 0 · no Husky/.git warning
build       exit 0
focused     2 passed · 0 failed
```

学生最终置信度 5/5，最高提示 L0；未读取 target diff 或 `workshop/`。第 00 章
四项回归均已写入自动契约并封存。

## Chapter 01 · 基线

学生从 00 的 parent 生成隔离目录，首次 build 得到真实的
`TS2307 Cannot find module '../src/survival/events.js'`，随后只创建
`packages/pi-course/src/survival/events.ts`，一次实现即让聚焦测试 2/2
通过。他能用自己的话解释 tagged union、`unknown` 与 `never`，全程未请求提示，
说明正文主体的概念解释和目标测试足以支持一个会主动整合全章信息的学习者。

但学生也必须自行忽略两个互相冲突的支架：生成的 `AGENT_GUIDE.md` 来自 parent，
因此没有 Checkpoint 01；正文的 rebuild 入口指向教学目录，后续开场、lab 和验收
却又要求修改 `workshop/`。陪练独立把后者判为阻断级教材缺口，并补充三项问题：

1. 顶部先要求使用 tagged union、`unknown`、`never`，操作性解释却在后文；
2. 顶部暗示首个编译证据是 `never`，真实首次偏差其实是缺少模块；
3. 页面声称 4 项测试，真实聚焦 oracle 只有 2 项，且不能证明 Promise 或实现中
   保留了 `never`。

### 修复

- `practice` 从 target 注入当前章的陪练指南，但继续从 parent 取实现；
- 01 的所有动作、实验、恢复和验收统一到隔离的 `packages/pi-course/`；
- rebuild 入口先给三个术语与 `.ts → .js` 的最小 schema，并预告 TS2307；
- lab 改为只破坏/恢复教学源文件，不修改注入测试；
- 明示 2 项 oracle 的证明边界，把 `never` 证据归到预期编译失败，不让绿灯
  替未观察性质背书；
- 将“重建章不得把学习者送进 `workshop/`”升级为 01～14 的跨章自动契约。

### 同章复测

学生从同一 parent 的全新目录重复原任务，首次 build 精确得到正文预告的 TS2307；
他只创建一个 `events.ts`，未改测试或 lockfile，最终 2/2，仍无需提示。生成的
`AGENT_GUIDE` 已包含 Checkpoint 01，正文中也不再出现 `workshop` 动作。

陪练独立导出 fresh sandbox，并确认指南与 01 target 的版本一致、所有 action
surface 统一、两个 lab 只破坏/恢复教学源文件。学生能准确说出：2 项行为测试
证明格式化与一个边界反例，`never` 由预期编译失败提供证据，Promise 不在本章
oracle 内。四项回归全部 resolved，第 01 章 PASS。

## Chapter 02 · 基线

在学生进入本章前，静态审计已经发现 target 只实现 queue、waiter、终态、
`result()` 和 `end()`，原正文却把取消写成本章能力。正文先收窄到真实 commit，
把取消明确后移，并统一练习目录和命令。学生随后从 01 的 parent 出发，只创建
`event-stream.ts`，没有看 target，也没有请求提示，最终 2/2。

学生能画出两条时间线：事件先到时进入 queue；消费者先调用 `next()` 时登记
waiter，下一次 `push()` 直接唤醒它。他还主动指出测试没有检查
`end("A") → result() === "A"`，错误实现仍可能获得绿灯。

陪练进一步按正文逐步执行，发现 Lab 2.1 不能独立完成：正文把 `end()` 留到
Lab 2.2，但 TypeScript 会先编译整份只读测试，缺少 `end()` 时第一项测试也跑不起来。
首次 TS2307 后还有两条由类型推断丢失造成的 TS7006，也会分散新手注意力。

### 修复

- 第一动作拆成四个编号步骤，避免一句话塞入红灯、读测试、画图和三个实现阶段；
- Lab 2.1 先声明完整公共接口，未学分支显式抛错，再用 test name pattern 只跑
  queue 场景；Lab 2.2 删除临时异常并运行完整测试；
- 02 target 测试给构造回调显式标注 `Event`，让首次红灯只剩缺少模块；
- 02 target 测试新增 `end("A")` 后的 `result() === "A"` 断言；
- 故障实验改成“吞掉终态事件”，会立即得到序列 diff，不再制造悬挂测试；
- 明确两项测试证明什么，以及取消、错误终态、多消费者和背压仍未被证明。

### 同章复测

学生与陪练都从同一 parent 创建了新目录。首次 build 只剩一条预告的 TS2307。
他们先声明完整接口，在两个未学分支保留显式异常；build 成功，name-pattern
局部测试 1/1。删除异常并补齐 waiter 与 `end()` 后，全量 2/2，新增的
`end("A") → result() === "A"` 断言也通过。

陪练还实际执行了安全故障实验：吞掉终态后约 76ms 内得到明确序列 diff，没有
悬挂；恢复后再次 2/2。学生最高提示 L0，陪练预计普通读者最多需要 L2 指出异步
迭代器签名。四项 Chapter 02 回归全部 resolved。

## Chapter 03 · 基线

学生从第 02 章 target 的 parent 开始，首次 build 得到正文预告的两条错误：
缺少 `AssistantMessageEventStream` 导出，以及找不到 `types.js`。他先声明完整消息
类型和一个临时流，局部“文本投影”测试 1/1；随后实现 `done | error` 终态映射，
全量测试 2/2。整个过程只修改 `types.ts` 和 `event-stream.ts`，没有请求提示。

他能区分三层表示：provider payload 是外部接口格式，canonical IR 是 Agent 保存和
重放的事实，UI 投影只是用于显示或搜索的有损视图。故障实验让 `textOf()` 混入
工具名后，测试立即显示多出 `read`，恢复后重新 2/2。

学生同时指出，原测试只比较 `stopReason`，不能证明 `result()` 返回的就是事件里的
最终消息。陪练继续做变异测试，发现更严重的问题：第二项测试在 `push(error)` 之后
又调用 `end(error)`，所以完全不识别 `error` 终态的临时实现也能获得 2/2。

### 修复

- 正文列出真实的两个 source delta，并给 Lab 3.1 提供可编译的临时流；
- 首次红灯、局部测试命令、全量命令和两项 oracle 的证明边界全部对齐；
- 故障实验改为当前测试能捕获的文本投影错误；
- target 测试删除 `end(error)`，要求 `error` 事件自行结束流；
- 增加一秒超时、对象身份断言和 `errorMessage` 断言；
- 拆开顶部四个术语定义，并改正学生指出的时序表达和生硬句子。

### 同章复测

学生与陪练都从同一 parent 新建目录。Lab 3.1 仍能编译并通过局部 1/1；此时若运行
完整测试，第二项会在约 0.13 秒内明确失败，不再出现假绿。换成真实终态映射后，
全量 2/2；测试确认异步迭代自行结束，`result()` 返回原消息对象，错误说明也没有
丢失。故障实验仍会立即红灯，恢复后再次 2/2。

学生最高提示 L0，最终置信度 4.5/5；陪练估计普通学习者在终态 predicate 与
extractor 的映射上最多需要 L3 伪代码提示，不需要完整答案。四项 Chapter 03
回归全部 resolved。

## Chapter 04 · 基线

学生从第 03 章 target 开始，首次 build 只看到一条 TS2307：缺少
`scripted-model.ts`。正文先让他声明完整联合类型，再在 microtask 内排除预取消、
脚本耗尽和显式错误 turn。排除后，TypeScript 会把剩余值收窄为正常
`AssistantMessage`。这座支架足以让他独立完成 Lab 4.1，局部测试 1/1；补齐失败
分支后，全量 3/3。

学生能解释 `stream()` 为什么先返回流、context 为什么要在调用时克隆，以及正常
消息、显式错误、脚本耗尽和预取消分别产生什么事件。同步抛出脚本耗尽错误时，
第三项测试立即失败；恢复为 microtask 内的流终态后重新 3/3。

但学生继续检查测试依据，发现第一项测试只比较事件名称。即使写错 delta、
`contentIndex`、tool call 内容和累计 partial，它仍会绿；测试也只调用一次
`stream()`，所以恒取第一个 turn 的错误 cursor 同样能通过。陪练做变异测试后确认
这两类都是可复现的假绿。

### 修复

- 正文改为“先建立全景和最小接口，再把 rebuild 卡当路线图”，避免读者尚未理解
  turn 就被要求开写；
- Lab 4.1 明确三个临时分支、联合类型收窄、每个 block 的事件载荷和累计 partial；
- target 实现先应用当前 delta，再随事件携带更新后的 partial；
- `toolcall_delta` 保留前文，并在当前位置放入未完成调用；
- `toolcall_end` 在同一位置换成完整调用，早期事件持有自己的快照；
- 第一项测试检查事件载荷、partial 和连续两个 turn；其余测试继续覆盖快照和失败；
- 学生与陪练指出的“规范结果”“精确时序”“signal 已经 abort”等生硬表达均已改写。

### 同章复测

学生和陪练重新从同一 parent 建立 fresh sandbox。Lab 4.1 局部 1/1，Lab 4.2
全量 3/3，最高提示仍为 L0。学生能逐步说明：

1. `start.partial.content` 为空；
2. `text_delta` 的 partial 已包含当前文本；
3. `toolcall_delta` 保留前文，并携带未完成调用；
4. `toolcall_end` 在同一位置完成调用；
5. 第二次 `stream()` 消费第二个 turn。

陪练分别破坏 text/tool payload、清空累计 partial，并把 cursor 改成恒取
`turns[0]`；新测试都会红。正确实现恢复后 3/3，课程全量 52/52。三项 Chapter 04
回归全部 resolved。

## Chapter 05 · 基线

静态审计先发现本章是第一处明显的代码量陡坡。target 同时修改 `types.ts` 并新增
约 750 行 `provider-adapter.ts`，原正文却只列出 adapter，还把两段实验指向
`workshop/`。fresh parent 加 target 测试时，缺模块又引发八条失去上下文类型后的
TS7006，学生无法判断真正缺口。原 11 项测试也存在假绿：错误的 tool result id、
请求 body 中的 API key、缺失的 `start`、伪造完成的 length 参数都不会失败。

审计还实际复现了一个实现错误。工具 chunk 先于文本到达时，旧 adapter 的 delta
先使用 `contentIndex=0`，结束时却把同一个调用放到另一个槽位。原测试没有观察这次
漂移。

### 第一轮修复与实操

课程先加入只保留公共类型和函数签名的 learning-only scaffold。它不包含转换、
状态机、SSE 或安全实现。target 测试补上显式回调类型，并把行为拆成四组：

```text
5.1 出站转换              1/1
5.2 normalized transport  3/3
5.3 SSE                    5/5
5.4 fetch transport        2/2
```

学生从 fresh sandbox 开始，首次 build 只看到两条预告错误：
`ToolDefinition` 尚未导出，`AgentContext` 尚无 `tools`。他随后依次通过四组测试，
最终 11/11，最高提示 L0。SSE 虽是首次接触，但正文按“字节 → SSE data →
`unknown` → `ProviderChunk`”给出控制流，已经足以支撑实现。

陪练确认所有中间态都能编译，却把正文判为 FAIL：三层图容易让人误以为
`toProviderMessages()` 直接发 HTTP；“暂存 finishReason 和 usage”没有说明为何
finish 后还要继续读；API key “只出现于 header”忽略了 transport 配置对它的持有；
Lab 5.3 与 5.4 都在要求请求和脱敏；测试主张也超过了实际覆盖范围。

### 第二轮修复与实操

正文改为逐个标出三个函数边界，并明确时间顺序：收到 `finish_reason` 先只保存，
继续读取可能稍后到达的 usage，直到 `[DONE]` 或 EOF 才发出唯一 finish。API key
改为由 transport 配置持有，对外请求时只允许进入 `Authorization` header。
Lab 5.3 只闭合最小 fetch、SSE 与外部验证；Lab 5.4 再固定 endpoint、header、
body 和通用脱敏。未证明列表补上多行 data、CRLF、多字节边界、HTTP 错误、预取消、
并发、重试和未穷尽的泄密来源。

学生在第二个 fresh sandbox 再次得到 1/3/5/2 和完整 11/11，仍为 L0。他能准确
复述五处边界。唯一回读句是“课程只处理一个 streamed choice”：这既可能表示
取第一个，也可能表示拒绝多个。

### 第三轮复测与封存

正文最终写明：普通 payload 只接受一个 choice；超过一个立即拒绝，不挑选或合并；
尾随 usage payload 才允许空 `choices`。学生第三次从空实现重建，仍得到：

```text
initial build  2 条预告的类型错误
Lab 5.1        1/1
Lab 5.2        3/3
Lab 5.3        5/5
Lab 5.4        2/2
full           11/11
```

他还用额外离线输入确认 ordinary `choices=0/2` 进入 error，`choices=1` 正常，
尾随 usage 的空 choices 会与先前 finish 合并。学生和陪练都判定无需回读、最高提示
L0，Chapter 05 可以封存。

测试依据也经过实际变异验证：错误 tool id、把密钥写入 body、删除 `start`、
把 length 参数伪造成对象、混淆 provider index 与 content index 都会红；恢复
target 后本章 11/11、课程全量 52/52。
