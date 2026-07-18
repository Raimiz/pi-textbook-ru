# Pi 教材学习模拟记录

测试日期：2026-07-17 至 2026-07-18
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
| 06 | 是 | 4.8/5 | L0 | PASS · 局部 1/1/2、全量 4/4 |
| 07 | 是 | 4.8/5 | L0 | PASS · 局部 1/1/2/2/3、全量 9/9 |
| 08 | 是 | 4.8/5 | L0 | PASS · 局部 2/1/2/2/4/1、全量 12/12 |
| 09–14 | 待测 | — | — | 待测 |

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

## Chapter 06 · 基线

学生从第 05 章 target 创建 fresh practice 后，首次 build 同时出现缺少 `tool.ts`
的 TS2307 和级联 TS7031。他读完正文仍无法选择唯一动作，因为 rebuild 使用
`packages/pi-course + echo + node:test`，两组 Lab 却使用
`workshop + add + workshop:test`。隔离目录没有 Git 历史，正文的恢复命令也无法
执行。学生在写代码前停止，最高需求为 L1：只请教材明确哪条路线有效。

陪练确认 target 实现本身具备 validator、Registry、结果归一化和 context 传播，
但原来的两项测试没有形成相应证据。下面五个破坏都能保持 `2/2`：

```text
删除重名保护
验证失败后仍执行副作用
丢失 signal / progress / callId
丢失 details / isError
把失败结果的 toolName 写错
```

正文还把 signal 传播写成取消保证，把当前 Promise/result 层的失败说成下一章才有的
transcript 偏差，并使用了不存在的类型名。

### 第一轮修复

- 全章统一为 `packages/pi-course`、`echo` 和同一组 build/test 命令；
- 新增只固定公共类型和函数签名的 Chapter 06 starter；
- 把重建拆成 validator、Registry、executor 三段；
- target 测试从 2 项增加到 4 项，检查 schema、额外字段清洗、重名、验证先于
  副作用、完整错误外壳、signal、progress、details 与 `isError`；
- 明确 signal 只会被传给工具，执行器无法强制忽略 signal 的工具停止；
- 明确错误结果不含 stack，但不会自动识别异常文本中的路径或密钥；
- 用自然中文重写整章，删除互相冲突的例子和抽象名词堆叠。

学生在第二个 fresh sandbox 中得到：

```text
scaffold build  green
validator first red  Lab 6.1 objectSchema 尚未实现
Lab 6.1  1/1
Lab 6.2  1/1
Lab 6.3  2/2
full     4/4
```

他使用了与 target 不同的实现方式，仍能准确解释 validator 的行为与元数据、
Registry 所有权、额外字段处理、验证顺序、signal 边界和错误安全边界，最高提示 L0。

### 第二轮测试补洞

陪练重做原五个变异后全部得到红灯，但又发现一个新假绿：构造器忽略初始工具时，
全量仍为 `4/4`。协调者先复现旧测试假绿，再把 Registry 测试改为
`new ToolRegistry([echo])`。同一变异立即变为 `0/1`，课程恢复 `54/54`。

学生与陪练重新从 fresh practice 完成全章。六个关键变异全部被杀死，中文改写也
无需回读。陪练随后指出正文声称 `list()` 保持顺序，但单个工具无法提供非平凡证据。

### 第三轮精修与封存

Registry 测试加入第二个初始工具 `upper`。反转 `list()` 的临时变异会明确显示
`upper/echo` 次序颠倒，并得到 `0/1`；正确实现仍为 `1/1`。正文同时把剩余几处
中英混排和含混表述改成直接中文。

学生第四次完整重建仍为 L0，确认第二个工具只增加顺序证据，没有隐藏业务要求。
陪练最终重做七个变异：

```text
忽略 constructor tools     red
反转 list 顺序             red
删除 duplicate guard       red
validation 后执行          red
丢失 context               red
丢失 details / isError     red
错误 failed toolName       red
```

幸存变异为 `0/7`。最终 target 为 `f27c7a55`，本章 `4/4`，课程全量 `59/59`。
Chapter 06 封存。

## Chapter 07 · 基线

学生第一次进入本章时，概念讲解可以读懂，却无法确定要在哪个实现上动手。frontmatter
与 rebuild 指向 `packages/pi-course`，正文实验和恢复步骤却转向 `workshop`。
fresh parent 还缺少 `agent-loop.ts`，首次 build 同时出现 TS2307 和四条级联
TS7006。学生必须从空文件一次猜出公共事件、返回值、options 和整段控制流。

陪练发现 target 还有两类更深的问题。第一，旧 Chapter 07 commit 除 Agent Loop
外，还隐藏了 273 行序章重构和 Chapter 00 测试变化。第二，原 4 项测试会放过修改
调用者 context、漏传工具定义、忽略取消、让非法 stop 执行 call、吞掉
`turn_end` 等错误；注入 executor reject 时，一个失败还会使同批其他结果丢失。

正文也把未测试的行为写成已证明能力，并连续堆叠 observation、canonical history
等抽象名词。学生能理解单句，却要反复判断动作属于模型、工具还是 loop。

### 第一轮修复与实操

课程先删除隐藏的序章增量，把 steering 与 follow-up 留在真正引入它们的 Chapter
09。学习脚手架只保留公共类型、主循环骨架和五个 Lab 施工位。正文统一到隔离的
`packages/pi-course`，并按状态迁移拆成五段：

```text
7.1 纯文本 stop           1/1
7.2 单工具往返            1/1
7.3 非执行终态            2/2
7.4 并发与单项失败        2/2
7.5 取消与回合上限        3/3
```

学生从 fresh practice 开始，首次只看到
`Lab 7.1 收集模型终态 尚未实现`，随后独立完成 9/9，最高提示 L0。陪练的 11 个
行为反例全部变红，但复核又发现两处证据不足：测试没有直接锁定
`tool_start → tool_progress → tool_end` 的相对顺序；失败实验创建两个 length
calls，正文却写成执行数从 0 变成 1。

### 第二轮修复与实操

测试加入三类工具事件的精确顺序断言。正文把 length 实验改成真实的 `0 → 2`，
并明确取消测试只证明两个外部行为：预取消时不请求模型；工具后取消时保留配对结果，
且不再请求模型。它不证明内部检查位置，也不能强制忽略 signal 的依赖停止。

学生再次从空实现得到完整 9/9，仍为 L0。陪练加入事件乱序反例后，12 项反例全部
变红。不过独立文字审查又找到一个缺口：多轮测试只证明第一轮 assistant 进入第二次
请求，没有直接证明最后一轮 assistant 恰好写入一次；正文还把“比较消息角色和工具
定义”扩大成“完整比较第二次请求”。

### 第三轮补强

Lab 7.2 增加两组直接证据：

```text
最终 roles:
user → assistant → toolResult → assistant

assistant_message stopReasons:
toolUse → stop
```

现在，漏写或重复最后一轮 assistant 都会在最靠近问题的断言处失败。正文也缩窄为
实际检查的字段，并把“真实时间”等生硬说法改成“实际完成顺序”。

学生第三次完整重建仍为 L0 和 9/9。陪练分别删除 transcript 中最后的 assistant、
重复写入它、重复发送 `assistant_message`，三项都得到精确红灯；恢复后源码哈希与
target 一致。

### 第四轮术语对齐与封存

陪练最后指出 Lab 7.2 的目标写 `echo`，真实测试工具名是 `probe`。正文改成
“测试中的 `probe` 调用”，并把 `toolUse + one call` 改成
“当 `toolUse` 中只有一个 call 时”。这次只改了文字，学生与陪练仍按同章规则从
fresh 目录重复完整流程。

学生再次得到：

```text
scaffold build  green
first red      Lab 7.1 收集模型终态 尚未实现
Lab 7.1–7.5   1/1 → 1/1 → 2/2 → 2/2 → 3/3
full           9/9
```

陪练重做原 12 项反例与 2 项最终 assistant 定向反例，幸存数为 `0/14`。正文的
wall-clock、忽略 signal、错误信息与取消边界均准确，学生没有回读句。最终 target
为 `f33bd46e`，Chapter 07 封存。

## Chapter 08 · 基线

旧正文把 `packages/pi-course`、`workshop` 和无 Git 历史的 practice 目录混在同一
条练习路线里。旧 target 只有两项测试，Read 还会先计算计划结束行，再硬切格式化
文本的字节；输出可能停在半行，续读位置却已经跳到下一段。Write、修改队列、Bash
运行期取消和真实 Agent Loop 都缺少可执行证据。

### 第一轮修复与实操

课程增加只保留公共类型、工具参数表面和六个施工位的学习脚手架。正文统一到隔离的
`packages/pi-course`，按资源所有权拆成：

```text
8.1 有界 Read                 2/2
8.2 workspace 路径规则       1/1
8.3 Write 与修改队列         2/2
8.4 批量精确 Edit            2/2
8.5 Bash 生命周期            4/4
8.6 真实编码循环              1/1
```

学生从 fresh practice 开始，baseline build 通过，首次只看到
`Tool read failed: Lab 8.1 Read 尚未实现`。他独立完成 12/12，并通过故意删除
Edit 多匹配检查得到 1/2；恢复后重新 12/12。唯一需要回读的句子是“对新目标检查
最近的已存在祖先”。

陪练的第一轮行为审查做了 29 个本地逻辑变异，其中 7 个仍能全绿：Read 可追加多余
提示；Write/Edit 可以直接改写目标；提交失败不清理临时文件；两种工具可以使用不同
队列实例；Bash guardrail、进程组终止或全部终止信号都可以被删除。正文也把源码意图
写成了测试已经证明的结论。

### 第二轮补强

测试改用确定性环境事实，不用大文件和调度时间猜测行为：

- 精确比较 Read 的完整输出；
- 用硬链接见证区分“原地改写”和“临时文件后替换”；
- 让 rename 必然失败，再检查旧目录与临时文件；
- 同时记录 `MutationQueue.run()` 的 receiver 和绝对路径键；
- 为绝对路径与 `../` guardrail 使用目录外标记文件；
- 让直接进程的 `SIGTERM` handler 写标记；
- 在 POSIX 启动忽略 `SIGTERM` 的同组后代，确认延迟 `SIGKILL` 后不能继续写文件。

实现同时改为等待延迟强杀步骤，再结算 Bash 结果。学生第二次仍以 L0 完成
`2/1/2/2/4/1` 和 12/12；原 7 个幸存变异全部变红。改写后的 realpath 说明也不再
需要回读。

### 第三轮证据边界与封存

第二轮文字审查还发现四个作用域需要写准：测试只规定同一个 Registry 内的
Write/Edit 共用队列；guardrail 的标记只覆盖绝对路径和 `../`；双流测试只证明共同
输出预算；timer、listener 与等待清理要由源码中的 `await/finally` 确认。正文明确
区分这些测试证据、源码证据和未证明范围。

学生第三次从空脚手架完整重建，仍然得到：

```text
scaffold build  green
first red      Lab 8.1 Read 尚未实现 · 0/2
Lab 8.1–8.6   2/2 → 1/1 → 2/2 → 2/2 → 4/4 → 1/1
full           12/12
fault          1/2 → restore 2/2 → full 12/12
```

最高提示 L0，无回读、歧义或阻塞。陪练重新执行 7 个错误实现，幸存数仍为 `0/7`；
严格文字审查也通过。最终 target 为 `6b3b1b77`，截至本章累计测试 `47/47`；当前
包含 00～14 的课程 HEAD 为 `69/69`。Chapter 08 封存。

## Chapter 09 · 基线

旧版本已经有 `Agent` 的轮廓，却没有一条学生可以完整走通的施工路线。正文混用了
`packages/pi-course` 和 `workshop`，fresh parent 又没有 `agent.ts`。首次构建只会
得到缺模块和隐式 `any`，学生还要到最后一个失败才发现 target 同时改了
`agent-loop.ts`。

旧 target 只有 3 项测试。它们没有锁住旧运行误清理新运行、回调重入的事件顺序、
公开对象共享引用、坏订阅者隔离、模型异常后的工具事实，以及 steering 在纯文本
`stop` 后的取出时机。正文同时使用了大量抽象英文词，却没有把“哪个运行在何时拥有
和清理哪个对象”说清楚。

### 第一轮：拆出五个可写阶段

课程增加两份无答案脚手架，把本章拆成：

```text
9.1 reducer 与迟到事件                 2/2
9.2 prompt 所有权、重入与模型异常       2/2
9.3 订阅者与公开副本                   2/2
9.4 当前运行的取消                     2/2
9.5 steering 与 follow-up              3/3
```

实现为每次 `prompt()` 创建独立的 `ActiveRun`，在 `run_end` 前按身份清理；事件由
FIFO 分发，回调中新产生的事件不能插到当前事件前面。循环在模型请求处归一化异常，
保留已经完成的工具调用和结果；公开状态、订阅事件和返回结果分别深复制。

第一轮学生发现两类教学问题。故障练习最初要求把原清理整体移到 `run_end` 后，结果
只会让新运行因 busy guard 无法启动，不能观察“旧运行清掉新运行”。正文随后改成：
保留原身份清理，再在 `run_end` 后故意追加一次无条件清理。另一处是施工路线只公开
`agent.ts`，却把一部分答案藏在 `agent-loop.ts`；生成器因此改成同时覆盖两份脚手架。

### 第二至第五轮：收紧时序与证据边界

陪练逐项注入错误实现，测试先后补上：

- reducer 不原地修改输入，且忽略旧 run 的 `loop` 与 `run_end`；
- `run_end` 回调启动 run 2 后，旧 cleanup 不能清掉 run 2；
- 同一事件的所有同步订阅者先观察完，再分发回调产生的新事件；
- 坏订阅者不阻断后续回调，`unsubscribe()` 只移除自己的回调；
- 状态快照、逐订阅者事件和 `prompt()` 结果没有共享嵌套引用；
- 不可结构化复制的工具结果转换成标准错误结果；
- 模型下一次请求抛错时，已经执行的工具事实仍留在 transcript；
- 取消检查先于队列消费，纯文本 `stop` 也会取 steering；
- `turn_end` 后拒绝输入，失败与取消队列不会进入下一次运行。

正文同步缩窄主张。它明确区分测试直接证明的三条公开副本边界，与只能从源码核对的
loop 输入和 assistant 消息副本；也把 `maxSteps` 下 steering/follow-up 的行为列为
未规定范围。中文审校逐句改写主语、动作和因果，最终严格审校得到
`P0=0、P1=0、P2=0`。

第五轮学生从空脚手架完成 `11/11`，故障实验准确得到第三次 `prompt()` 从应拒绝变成
实际放行。陪练的 15 项 mutation 全部被杀死，没有幸存或超时。

### 第六轮：补上两个行为断言

陪练指出两项行为已经由源码和额外探针确认，但提交内测试没有直接锁住：

1. `run_start` 对非空旧历史也要做嵌套深复制；
2. `run_end(1)` 回调重入 run 2 时，run 2 的模型上下文必须包含第二条用户消息。

测试在原有两项中加入断言，不增加测试数量。新 target `d055d832` 仍为 `11/11`，
截至本章累计 `58/58`。学生和陪练在 fresh 目录重复全章；15 项 mutation 仍全部
变红。

### 第七轮：消除最后两处隐含前提

学生最后发现两处不影响 target 正确性、却会让初学者停下来的细节：

- 脚手架只从 `agent-loop.ts` 导入类型，真正调用 `runAgentLoop()` 时会出现
  `TS2304`；
- Lab 9.5 测试匹配错误消息中的“只在当前 run”和“尚未结束”，正文却只说“明确
  错误”。

脚手架改为预先提供 `runAgentLoop` 的值导入。正文也公开稳定语义：
`steer()`/`followUp()` 只在当前 run 尚未结束时接受输入。更新后，学生再次从空目录
完整重建：

```text
scaffold build  green
first red      Lab 9.1 reducer 尚未实现 · 0/2
Lab 9.1–9.5   2/2 → 2/2 → 2/2 → 2/2 → 3/3
full           11/11
fault          1/2 → restore 2/2 → full 11/11
```

五段全部为 L0，一次实现即通过，无提示、无回读。陪练用实际编译探针确认值导入会
保留到生成的 JavaScript，再次执行 15 项 mutation，结果仍为 `0/15` 幸存。内容构建、
学习契约、practice sandbox 和中文门禁全部通过。Chapter 09 封存。

## Chapter 10 · 根因重写与黑盒验收

旧 target 一次塞入路径、运行时解析、内存 Store、JSONL 和 compaction，却只有 2 项
测试。fresh practice 没有 `session.ts` 脚手架，第一盏灯是缺模块；末行任何错误都会
被误当成断尾，`append()` 又在任务轮到时才读取调用者对象。底层写入可能半途失败后，
同一 writer 仍会继续追加。

本章没有沿旧实现加条件，而是重新规定三件事：

```text
append() 调用时取得输入快照
行末换行是一条记录的提交边界
底层 append 失败后当前 writer 失效
```

compaction 全部移到 Chapter 11。Chapter 10 只保留 message、metadata、路径、两种
Store、JSONL 恢复和消息投影，并拆成 6 个 Lab、14 项公开接口测试。正文补上普通
JSON 对象与循环检测的最小控制流、空行物理行号、调用时与队列时两类校验，以及
`ready / needs-repair / tainted` 状态表和 Promise FIFO 骨架。

学生从 fresh starter 完成：

```text
first red       Lab 10.1 pathTo 尚未实现 · 0/2
Lab 10.1–10.6  2/2 → 2/2 → 2/2 → 3/3 → 3/3 → 2/2
full            14/14
```

六段都是 L0，一次实现通过，无正文回读。删除后续 FIFO 任务的 `tainted` 检查后，
Lab 10.5 变为 `2/3`，底层 append 调用次数为 3 而不是 1；恢复检查后回到 `3/3` 与
`14/14`。

陪练只通过公开接口重做五个反例：不同对象重复 id、换行提交的坏 schema、调用后修改
entry、半写后的第二次 I/O、sibling 与工具结构投影。全部通过；Chapter 00～10 累计
`72/72`。最终 target 为 `55516263`。两项额外测试建议进入全局审查清单，不重开本章。
Chapter 10 封存。

## Chapter 11 · 单一投影模型

旧实现同时保留两套 summary、两套 context 入口和多组兼容字段，compaction 又提前
混入 Chapter 10。fresh 练习首先缺少 `context.ts`，775 行实现只有 2 项测试。

重写后，Chapter 11 第一次向 session schema 加入唯一的七字段 compaction，并只导出
`groupInteractions()`、`buildContext()`、`createCompactionEntry()`。预算先扣 system、
输出预留和安全余量，再按完整 interaction 选择最近后缀；恢复只使用活动路径上的最新
摘要。主审还补齐了一个公共 API 缺口：`systemPrompt` 既然参与计费，也必须随投影
返回，供后续 Runtime 直接交给模型。

学生从双 starter 一次完成：

```text
first red       Lab 11.1 compaction entry 尚未实现 · 0/3
Lab 11.1–11.5  3/3 → 3/3 → 3/3 → 2/2 → 3/3
full            14/14
```

五段均为 L0，无正文回读。把整组选择替换为 `slice(-3)` 后，Lab 11.3 变为 `0/3`，
分别暴露上下文从 assistant 开始、多工具组丢 user/call、新交互丢首条 user。恢复组
边界后回到 `3/3` 与 `14/14`。

陪练通过公开输入检查旧 schema、反序 toolResult、单组超限、不安全 first kept、最新
compaction 与 systemPrompt 返回。全部通过，Chapter 00～11 累计 `86/86`。最终 target
为 `5fb517c2`。Chapter 11 封存。
