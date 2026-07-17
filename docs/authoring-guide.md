# Pi 教材作者契约

本契约保证 15 章由不同作者撰写时仍然形成同一本书，而不是一组风格各异的博客。

## 章节文件

| ID | 文件 | 标题 | 部分 |
|---|---|---|---|
| 00 | `00-prologue.md` | 先观察一次完整的 Agent 运行 | 序章 |
| 01 | `01-typescript-survival.md` | TypeScript、测试与 ESM 生存集 | 第一部 |
| 02 | `02-event-stream.md` | EventStream、AsyncIterable 与取消 | 第一部 |
| 03 | `03-message-ir.md` | 为 Agent 建立统一消息语言 | 第一部 |
| 04 | `04-scripted-model.md` | ScriptedModel：把模型变成可执行规格 | 第一部 |
| 05 | `05-provider-adapter.md` | 把真实流式协议挡在边界外 | 第一部 |
| 06 | `06-tool-contract.md` | Tool 是类型化的环境动作 | 第二部 |
| 07 | `07-agent-loop.md` | Agent Loop 是可证明的状态机 | 第二部 |
| 08 | `08-coding-tools.md` | Read、Write、Edit 与 Bash | 第二部 |
| 09 | `09-stateful-agent.md` | 从纯循环到可中断的 Stateful Agent | 第三部 |
| 10 | `10-session-tree.md` | 会话是追加式事件树 | 第三部 |
| 11 | `11-context-compaction.md` | History 是事实，Context 是投影 | 第三部 |
| 12 | `12-resources-extensions.md` | Resources、Skills 与 Extensions | 第四部 |
| 13 | `13-composition-root.md` | 一个核心，多种产品入口 | 第四部 |
| 14 | `14-eval-capstone.md` | 用故障矩阵证明你造出了 Pi | 第四部 |

## Frontmatter

每章必须以以下字段开头：

```yaml
---
id: "07"
slug: agent-loop
part: core
partTitle: 第二部 · 闭合 Agent 核心
chapter: "07"
title: Agent Loop 是可证明的状态机
summary: 一句话说明本章建立的能力。
minutes: 100
difficulty: 核心
artifact: src/agent-loop.ts
prerequisites: 04,06
terms: agent loop, transcript, tool result, stop reason
upstream: packages/agent/src/agent-loop.ts
---
```

`id`、`chapter`、文件前缀必须一致。`prerequisites` 使用逗号分隔；序章写空值。
`part` 只能取：

- `orientation`：00；
- `foundations`：01–05；
- `core`：06–08；
- `state`：09–11；
- `product`：12–14。

## 固定正文顺序

正文必须依次包含下列二级标题：

1. `## 你将得到什么`
2. `## 先建立全景`
3. 至少两个解释与实现小节
4. `## 故意把它弄坏`
5. `## 本章验收`
6. `## 可选迁移练习`
7. `## 小结`

每章要明确：

- 进入本章时系统会什么；
- 本章只增加哪一种主要复杂性；
- 完成后修改哪些文件、能观察到什么；
- 一条不能被破坏的不变量；
- 课程实现与当前上游 Pi 的相同和不同；
- 如何恢复到本章起点。

## 教材指令

指令不可嵌套，以单独一行的 `:::` 结束：

```md
:::predict title="运行前先判断"
先写下你的判断。
---answer
展开后看到解释。
:::
```

```md
:::lab title="实践 7.2 · 闭合一次工具往返"
**目标：** ...

**文件：** `workshop/src/agent-loop.ts`

**动作：**
1. ...

**运行：** `npm run workshop:test -- agent-loop`

**预期：** ...
:::
```

其他合法类型：

- `:::mechanism`：关键机制；
- `:::failure`：预期失败与首次偏差；
- `:::checkpoint`：验收、恢复和下一状态；
- `:::pi`：固定上游 commit 的源码对照；
- `:::transfer`：完成 commit 引导重建后，再减少脚手架的可选 sibling task；
- `:::note`：必要但非主线的说明。

每章至少包含一个 `predict`、两个 `lab`、一个 `failure`、一个 `checkpoint`、
一个 `pi` 和一个 `transfer`。

## 写作标准

- 先说当前缺口，再引入抽象；不要从定义列表开始。
- 解释应落到数据流、所有权、顺序、资源或失败语义。
- 每个代码块只证明一个主张；紧随可观察输出和解释。
- 代码必须和 `workshop/` 的公共接口一致，不发明无法运行的伪 API。
- 输出写成稳定模式，不依赖随机 ID、绝对路径、耗时或真实模型措辞。
- 不把第一次 “测试通过” 写成最终掌握，也不让无提示迁移堵住第一次学习；
  先完成 commit 引导重建，再在后续逐渐减少提示并迁移到新情境。
- 不照抄 D2L 或上游 Pi 的正文、注释和实现；只做原创解释和必要短片段。
- 不把课程主动强化伪装成上游行为。

## 始终成立的事实

- `StopReason` 包含 `error` 与 `aborted`；二者通过流的 `error` 终态携最终
  `AssistantMessage`，`EventStream.result()` resolve 该消息而不是向外 reject。
- tool arguments 可以增量到达，只在 call 完成后验证。
- `finish_reason = length` 可能截断 tool arguments，禁止执行。
- tool call 顺序、完成顺序和 transcript 写入顺序可能不同。
- tool 抛错仍要产生与 call 配对的结构化 `toolResult`。
- session 是 append-only tree log；context 是从 history 派生的视图。
- compaction 追加摘要并重建 context，不删除历史。
- Skill 是被读取的资源；Extension 是可执行代码和信任边界。
- 当前上游使用 `typebox`；课程可用更小的验证器讲清机制。
- 当前上游 coding tools 没有内建 cwd jail；课程若做 containment，必须标为主动强化。
