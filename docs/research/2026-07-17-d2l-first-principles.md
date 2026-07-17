# 从第一性原理重构 Pi 教材

> 研究对象：D2L 英文官网、`d2l-ai/d2l-en`、`d2lbook` 官方文档，以及与 worked example、检索练习、脚手架、反馈相关的研究。
> D2L 源码快照：`23d7a5aecceee57d1292c56e90cce307f183bb0a`。
> 目标不是复制 D2L 的页面，而是解释它为什么容易跟学，并把有效机制迁移到“从零实现 Pi”。

## 1. 先定义教材真正要优化的目标

一个工程教材的成功，不是读者把页面滚到了底，也不是代码在当前提示下变绿。目标状态至少包含：

```text
schema          能画出系统边界、所有权和数据流
procedure       能把设计落实成代码、测试和诊断
retrieval       离开页面后仍能调取关键协议与不变量
discrimination  能从相似故障中判断责任层
calibration     知道自己掌握了什么、哪里仍不确定
independence    面对新 provider、tool 或故障时能独立迁移
```

因此，教材要优化的是：

```text
长期可迁移的工程能力
= 正确的内部模型
+ 可重复的实现过程
+ 对失败边界的辨别
+ 脱离脚手架后的重建
```

这也给出三个约束：

1. 人的工作记忆有限，不能同时搜索目标、接口、代码形状、运行方法和正确输出。
2. 软件机制只有通过运行、测试和故障才能形成可信的因果模型。
3. Pi 是跨层系统；只记住文件名或复制最终实现，不等于理解协议如何穿过各层。

## 2. D2L 不是“理论加 Notebook”，而是一套课程语法

D2L 官方前言明确反对先穷举理论、很久以后才第一次实践。它选择：

- 概念在当前任务需要时才引入；
- 一个 working example 对应一个 notebook；
- 解释、公式、代码与输出交错；
- 基础机制先从零实现，再切换到高层 API；
- 后续章节复用已经建立的抽象；
- 每节固定以总结、练习、讨论和前后导航收尾。

来源：

- [D2L Preface: Learning by Doing](https://d2l.ai/chapter_preface/index.html)
- [D2L 官方仓库](https://github.com/d2l-ai/d2l-en)
- [D2L Style Guide](https://github.com/d2l-ai/d2l-en/blob/master/STYLE_GUIDE.md)

### 2.1 代表小节的实际结构

对当前官方仓库五类小节的源码观察：

| 类型 | 代表小节 | 课程语法 | 它解决的学习问题 |
|---|---|---|---|
| 生存型前置知识 | [Data Manipulation](https://d2l.ai/chapter_preliminaries/ndarray.html) | 极短解释 → 小代码 → 立即输出，连续覆盖构造、索引、运算、广播、内存和转换 | 不要求先掌握完整数学体系，只提供后续会反复用到的最小操作词汇 |
| 从零实现 | [Linear Regression from Scratch](https://d2l.ai/chapter_linear-regression/linear-regression-scratch.html) | 目标全景 → 参数 → 模型 → 损失 → 优化 → 训练 → 结果核对 → 总结/练习 | 把抽象算法拆成可追踪的因果链，形成“每个组件为何存在”的模型 |
| 简洁实现 | [Concise Linear Regression](https://d2l.ai/chapter_linear-regression/linear-regression-concise.html) | 严格复用上一节的结构，把自实现组件逐项换成框架组件 | 让学习者看见抽象省掉了什么，而不是把框架 API 当魔法 |
| 工程深化 | [Custom Layers](https://d2l.ai/chapter_builders-guide/custom-layer.html) | 最小无参数层 → 输入输出验证 → 组合进更大网络 → 带参数层 → 再验证 | 从局部行为开始，在成功证据上逐步增加复杂度 |
| 真实整合 | [Kaggle House Prices](https://d2l.ai/chapter_multilayer-perceptrons/kaggle-house-price.html) | 真实目标 → 数据 → 预处理 → 指标 → 交叉验证 → 模型选择 → 外部提交 → 扩展练习 | 把此前分散技能汇入一个有外部判据的完整任务 |

这不是对页面风格的主观印象。以仓库快照中的 PyTorch 路径为例，Data
Manipulation 用 24 个短代码块配 23 个紧邻输出；Linear Regression from
Scratch 用 10 个代码块走完从数据到参数误差核对的闭环；Minibatch SGD
通过 4 组受控比较和 6 幅结果图解释超参数与收敛；Sentiment RNN 最后还用
真实句子给出两次可见预测。密度的关键不是“代码越多越好”，而是大多数新
概念在下一屏内就变成可观察事实。

源码层还有两个容易被忽略的机制：

1. `#@save` 把教材中已经讲过的函数和类收集进 `d2l` 库，后文直接复用。这使代码和知识一起累积。
2. 章节先使用某些工具，稍后在 Builders' Guide 中“掀开幕布”解释内部。这是有意识的“先给解决问题的弹药，再补齐深层机制”。

### 2.2 为什么这种顺序主观体验好

它持续缩短四个距离：

```text
问题 → 新概念
新概念 → 代码
代码 → 可见结果
当前结果 → 下一步目标
```

学习者很少需要问：

- 我现在为什么学这个？
- 这段定义何时有用？
- 我运行对了吗？
- 下一步和刚才有什么关系？

这不是单纯的“即时奖励”。更重要的是，每次运行都把抽象符号和系统行为绑定起来，逐步形成可复用 schema。

### 2.3 D2L 的书级节奏

D2L 的宏观结构不是按 API 目录排列，而是按能力成熟度排列：

```text
最小前置知识
  → 第一个完整模型
  → 从零理解核心机制
  → 用高层抽象提高效率
  → 学习构建更复杂系统
  → 真实应用和性能问题
```

每个新章节同时做两件事：

1. 复用此前稳定结构，降低陌生度；
2. 只增加少量新变量，形成可控的复杂度增长。

这也是为什么 from-scratch / concise 配对有效：两节的外部任务和组件顺序基本不变，变化集中在实现层，读者可以做“受控对照”。

## 3. 学习科学给出的因果解释

下表区分了证据支持的机制和本项目的工程化推断。

| 原则 | 证据支持的机制 | 对 Pi 教材的约束 |
|---|---|---|
| Worked example | 新手直接求解复杂问题时会把工作记忆耗在搜索上；完整范例帮助先形成 schema。[Sweller & Cooper 1985](https://doi.org/10.1207/s1532690xci0201_3) | 新机制先给一条完整可追踪运行，不从空白文件要求学生猜完整 loop |
| 自我解释 | 学得好的学习者会把范例步骤与领域原则连接，而非只扫描表面操作。[Chi et al. 1989](https://doi.org/10.1207/s15516709cog1302_1) | 让学生解释事件顺序、所有权和被保护的不变量，不做术语背诵 |
| Completion 与渐隐 | 完整范例逐步删去步骤，并配合自我解释提示，有助于从观察过渡到独立完成。[Atkinson, Renkl & Merrill 2003](https://doi.org/10.1037/0022-0663.95.4.774) | 使用“完整 trace → 改参数 → 补局部 → 实现 sibling case → 独立集成”的五级支架 |
| 检索练习 | 延迟测试中，主动检索通常优于重复阅读，且重复阅读容易抬高主观信心。[Roediger & Karpicke 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x) | 下一章必须无提示调用上一章的不变量；完成度不能只看当堂绿灯 |
| 生成效应 | 主动生成比单纯阅读更利于记忆，但复杂材料对新手仍需要 worked example。[Slamecka & Graf 1978](https://doi.org/10.1037/0278-7393.4.6.592) | 让学生生成局部预测、测试和 reducer 分支，不让新手从空白重写整个 agent |
| 形成性反馈 | 反馈应在尝试之后、针对任务、具体且可行动。[Shute 2008](https://doi.org/10.3102/0034654307313795) | 红/绿测试之外，要指出首次偏差、责任层和被违反的不变量 |
| 失败后的学习 | 即使预测失败，先尝试再看到答案也可能增强后续学习。[Kornell, Hays & Bjork 2009](https://doi.org/10.1037/a0015729) | 在展示事件 trace 前先让学生预测；错误不是惩罚，而是建立对比信号 |
| 可执行材料 | 将说明、代码和结果绑定能缩短反馈路径；但 Notebook 隐藏状态和环境漂移会破坏可复现性 | 每个实验声明初始 checkpoint、命令、预期输出、失败输出和 reset；页面输出由测试生成 |

由此得到一条完整因果链：

```text
减少无关搜索
  → 注意力集中到一条因果链
  → worked example 建立初始 schema
  → 预测/补全迫使主动生成
  → 运行与测试暴露认知差异
  → 针对不变量讲评
  → 渐隐把责任交还学习者
  → 延迟检索巩固长期保持
  → 相似故障交错训练责任层辨别
  → 新情境迁移证明真正掌握
```

## 4. D2L 的边界：不能只复制它做得好的部分

D2L 优秀，但它并不自动保证主动学习：

- 学习者可以一路复制、运行并获得“我看懂了”的错觉；
- 章末练习通常没有内置的分级提示和机器验收；
- 网站没有把延迟检索编排进后续章节；
- 多框架标签对有选择需求的读者有价值，但也制造大量视觉和认知重复；
- Notebook 可能存在隐藏状态；“能运行一次”不等于从干净环境可复现；
- 页面的完成状态不等于能力证明。

因此 Pi 教材要保留 D2L 的短反馈回路，同时补上：

1. 运行前预测；
2. 支架渐隐；
3. 旧知识延迟检索；
4. 相似故障的混合诊断；
5. 干净环境复现；
6. 无 starter 的最终迁移任务。

## 5. Pi 教材的三个嵌套学习循环

### 5.1 单元循环：一次只建立一条因果关系

```text
当前能力缺口
  → 预测会发生什么
  → 解释唯一的新机制
  → 完整范例或局部补全
  → 运行并观察
  → 注入一个边界失败
  → 根据不变量讲评
  → 用 sibling case 渐隐迁移
```

单元不按固定字数或机械动作切分，而按“一个新的工程决策”切分。目标时长只是体验启发式，不是认知定律。

### 5.2 章循环：每章交付一个纵向能力

D2L 的 “one working example, one notebook” 应翻译为：

> 一章一个能运行、能测试、能故障注入的纵向增量。

每章必须声明：

- 进入时系统会什么；
- 当前缺口是什么；
- 结束时新能力是什么；
- 修改哪些文件；
- 哪些测试证明正确；
- 哪条失败路径证明边界；
- 与 Pi 当前源码的相同和不同；
- 结束 checkpoint 与 reset 方法。

### 5.3 全书循环：反复穿过同一条 Agent 主链路

不是“学完 provider 再也不见 provider”，而是不断让同一条请求链变得更真实：

```text
用户目标
  → context
  → model request / stream
  → assistant message
  → validated tool call
  → environment action
  → tool result
  → next model turn
  → session / UI / eval
```

每增加一层，旧协议都要在新约束下被再次检索和验证。

## 6. 对现有粗纲的关键修正

现有 `curriculum/` 路线基本正确，但它明确依赖 Codex 实时授课，并不是自学教材。新教材不应原样复制 00–10 的文件边界。

必须修正或显式标注的事实：

- 模型调用后的错误和取消应进入流内终态，而不是让读者自行选择完全不同的公共契约；
- 当前 Pi 使用 `typebox`，不是旧的 `@sinclair/typebox` 叙述；
- 教学版 workspace containment 是主动强化；真实 Pi 没有内建 cwd jail 或权限确认；
- `maxTurns`、doctor 和 deterministic eval 是有价值的课程增强，不是上游核心的等价复刻；
- 当前产品主路径仍是 `Agent + AgentSession + SessionManager`，通用 `AgentHarness` 是并存的演进方向；
- compaction 是 context 投影，不能描述成修改或删除会话历史。

## 7. 推荐的新课程骨架

### 序章：先看到要造出的东西

用完全离线的 ScriptedModel 演示一次“读文件 → 修改 → 运行测试 → 结束”的事件轨迹。学习者先观察最终系统的输入、状态和输出，但不提前拿到全部实现。

目的：建立全书地图和早期回报，避免数小时配置后仍不知道 Pi 是什么。

### 第一部：建立可执行语言

1. TypeScript、测试与 ESM 生存集
2. AsyncIterable、EventStream 与 AbortSignal
3. Canonical message、content block、stop reason 与 usage
4. ScriptedModel：把模型响应变成可执行规格
5. 一个真实 OpenAI-compatible 流式 adapter

### 第二部：闭合 Agent 核心

6. Tool contract、schema、registry 与结构化失败
7. Agent loop：文本终止、工具往返和终止矩阵
8. Coding tools：read、write、exact edit、bash 与资源治理

### 第三部：让 Harness 可靠

9. Stateful Agent：事件 reducer、busy、abort、steering、follow-up
10. JSONL 会话树：append-only、resume、branch 与损坏恢复
11. Context：项目指令、token budget、安全 cut point 与 compaction

### 第四部：从核心到产品

12. Templates、skills、extensions 与信任边界
13. Interactive、print、JSON event、配置与 composition root
14. Deterministic eval、故障矩阵与最终架构答辩

这不是增加课程数量，而是把当前被挤在同一章的不同认知对象拆开。例如 EventStream 必须先稳定，模型 IR 才有清晰承载；fake provider 必须先可确定复现，真实 adapter 才能成为受控迁移。

## 8. HTML 教材必须支持的学习动作

### 必须有

- 全书依赖图与当前能力状态；
- 章节和页内目录；
- 相关解释、代码、事件 trace 和输出共置；
- `实现 / 测试 / 输出 / Pi 对照` 四种视图；
- 运行前预测区域；
- 分级提示和默认折叠的参考答案；
- 正常路径与故障路径并列；
- 每节 checkpoint、验收命令和 reset；
- localStorage 只记录阅读与自报验收，不伪装成真实代码验证；
- 固定上游 commit 的源码链接与“课程增强”标记；
- 搜索、前后导航、移动端可读性和键盘操作。

### 构建期必须保证

- Markdown/MDX 是叙述事实源，checkpoint 中的真实 `.ts` 文件是代码事实源；
- 正文从真实文件抽取或链接代码，禁止维护第二份不可测试的手抄实现；
- 代码片段、命令、内部链接、源码路径和标题层级可校验；
- 标记为 executable 的输出由测试重新生成，而非手写截图；
- 干净环境可复现；
- 只重跑变化内容，降低维护成本。

### 8.1 D2L 的隐藏优势是“内容即受验证程序”

D2L 的发布链不是把 Markdown 换成 HTML，而是：

```text
Markdown notebook
  → 按框架拆分
  → 执行代码
  → 得到带真实输出的 evaluated notebook
  → 合并代码 tabs
  → 生成 HTML / 搜索 / 索引 / Notebook / PDF
```

几个系统机制共同建立了信任：

- 规范源不保存运行输出，构建时重新执行，避免作者手抄结果；
- `#@save` 让书中解释过的实现成为后文真正导入的库代码；
- 四个框架分别通过执行型 CI，而不是维护未经验证的“翻译版本”；
- 增量缓存使 100 多个 notebook 的强验证在日常维护中仍然可承受；
- 全书树、页内目录、前后导航、搜索、概念索引和 API 索引分别回答
  “我在哪”“还剩多少”“下一步是什么”和“以后怎样找回来”；
- 稳定版、开发预览和固定源码入口让读者知道自己正在复现哪个版本。

官方机制可见：

- [Editing D2L](https://book.d2l.ai/user/edit.html)
- [Build and cache](https://book.d2l.ai/user/build.html)
- [Build pipeline](https://book.d2l.ai/develop/pipeline.html)
- [Code tabs](https://book.d2l.ai/user/code_tabs.html)

这解释了 D2L 为什么比“博客正文 + 另一个 examples 目录”更容易信任：读者
看到的代码、构建运行的代码和后文复用的代码处在同一条发布链上。

### 8.2 Pi 应复制验证关系，而不是复制 Notebook

Pi 是多文件、事件驱动、涉及网络、文件系统、子进程、流式响应和 TTY 的
Node 程序。Notebook 的隐式共享状态会掩盖它真正需要学习的模块边界、进程
生命周期和重启行为。因此对应关系应当是：

| D2L | Pi 教材中的等价机制 |
|---|---|
| 一节一个可执行 notebook | 一章一个可复现的系统增量 |
| notebook 中的真实输出 | 测试生成的 CLI / event golden trace |
| `#@save` 累积教材库 | checkpoint 中正常演进的 TypeScript 模块 |
| framework tabs | 唯一 TypeScript 主路径；只在真实协议差异处做对照 |
| Colab 一键运行 | 锁定 Node 与 lockfile 的本地环境，未来可加 devcontainer |
| notebook mtime cache | 基于内容哈希、import graph、配置和 lockfile 的失效 |
| 训练任务的执行型 CI | `tsc`、单测、章节验收、渲染、链接和输出门禁 |

默认构建不能调用真实 LLM。费用、限流、网络和模型漂移会破坏可复现性；
主路径使用 deterministic fake provider、固定事件流和脱敏协议 fixture，
真实 provider 只做显式、低频的兼容性 E2E。

每个章节产物都应记录：

```text
教材 commit
+ 对应 Pi 上游 commit
+ Node 版本
+ lockfile 指纹
+ 起始 checkpoint
+ 本章 patch
+ 完成 checkpoint
+ 验证命令与生成输出
```

这样“跟着做完”才表示读者确实从一个可恢复状态迁移到了另一个受验证状态。

### 暂不需要

- 浏览器内完整 Node 沙箱；
- 登录、云端账号或排行榜；
- 模仿 D2L 的多框架标签；
- 论坛、多人协作和服务端进度；
- 完整上游 Pi 的 OAuth、多 provider、TUI、RPC 和扩展市场。

## 9. 判断教材是否成功的标准

页面是否漂亮不是终局。第一版至少要能回答：

1. 学习者能否在 20 分钟内说清最终 Pi 的主链路并看到一次完整 trace？
2. 每个新抽象是否由一个当前失败或能力缺口引出？
3. 每个实验是否有初态、动作、可观察结果和 reset？
4. 测试是否覆盖中间 transcript、事件序列和终态，而非只看最后字符串？
5. 支架是否从完整范例渐隐到无 starter 的迁移？
6. 后续章节是否主动检索前面建立的不变量？
7. 页面输出是否来自真实构建或测试？
8. 学习者能否解释“我们的简化 / Pi 当前实现 / 为什么不同”？
9. 最终 capstone 是否在新故障和新任务下仍保持跨层不变量？

最重要的判定规则是：

> 当堂 green test 只证明当前支架下的表现；延迟、无提示、新情境下仍守住不变量，才证明掌握。

## 10. 结论

Pi 教材不应是“把现有 Markdown 放进好看的 HTML”，也不应是“给出完整答案让学习者照抄”。它应是一组经过编排的可执行系统主张：

```text
明确初态
+ 一条因果解释
+ 学习者预测
+ 可运行操作
+ 机器可观察反馈
+ 针对不变量的讲评
+ 渐隐变式
+ 延迟迁移验证
```

这才是把 D2L 的优秀体验迁移成真正能一步步造出 Pi 的工程教材。
