---
id: "10"
slug: session-tree
part: state
partTitle: 第三部 · 让 Harness 可靠
chapter: "10"
title: 把完成的历史追加成一棵树
summary: 把完整消息写成带 parentId 的 JSONL 记录；从指定叶子恢复分支，并让断尾与写入失败停在可诊断状态。
minutes: 150
difficulty: 核心
artifact: packages/pi-course/src/session.ts
prerequisites: 03,09
terms: append-only log, JSONL, parent pointer, active path, branch, recovery
upstream: packages/coding-agent/src/core/session-manager.ts, packages/coding-agent/docs/session-format.md
---

## 你将得到什么

第 09 章结束后，`Agent` 能把多次运行的消息留在内存里。进程一关，这些消息仍会
消失；如果把历史只当成一个可以随时截短的数组，用户回到旧消息重试时，另一条尝试
还可能被永久删掉。

本章只增加一种复杂性：**给已经完成的消息一个不会改变的身份，并把它追加到磁盘。**
完成后，你会得到：

- `pathTo()`：从指定叶子沿 `parentId` 找回一条分支；
- `parseSessionEntry()`：把磁盘里的 `unknown` 收窄成可信的记录；
- `InMemorySessionStore`：先在没有文件系统干扰的环境中固定副本与顺序；
- `recoverJsonl()`：只接受以换行提交的完整记录，并报告未提交的尾部；
- `JsonlSessionStore`：在单个 writer 内按调用顺序追加；一次写入可能半途失败后，
  不再继续碰文件；
- `messagesOnPath()`：从选中的分支取回完整消息，不丢工具调用和工具结果。

本章的核心约定是：

> 已经提交的记录不原地修改，也不删除。要从旧位置继续，就在旧记录下面追加一个新
> 孩子。

## 为什么第 10 章放在这里

持久化不能早于消息协议和 Agent 生命周期。

如果还没有第 03 章的完整消息结构，你只能保存纯文本，工具调用、工具结果和错误
状态都会丢失。如果还没有第 09 章的运行边界，你也不知道该保存完成消息，还是正在
变化的流式文本、取消控制器和临时队列。

持久化又必须早于第 11 章的上下文压缩。压缩要从一条真实历史中派生较短的模型输入；
如果原始历史会被覆盖，压缩就变成不可逆的数据改写，无法重新计算，也无法审计。

因此顺序是：

```text
第 03、07、09 章：什么是一条完成消息，一次运行在哪里结束
          ↓
第 10 章：把完成消息保存为不可改写的历史
          ↓
第 11 章：从历史派生有限大小的模型输入
```

这也是本章暂时不加入 compaction entry 的原因。先把“保存事实”做稳，再学习“怎样
派生更短的上下文”。两个问题放在同一章，会让你无法判断错误发生在磁盘历史，还是
上下文选择。

## 先建立全景

运行中的事件、模型消息和磁盘记录属于三层：

```text
运行事件
  text_delta、tool_start、进度、界面刷新
          │ 运行结束后只留下完整结果
          ▼
完整消息
  user / assistant / toolResult
          │ 加上 id、parentId、timestamp
          ▼
会话记录
  message / metadata
```

第一层可以很频繁，也可能只完成一半，不适合直接当长期历史。第二层保留模型再次
推理所需的完整结构。第三层再给每条事实加上身份和父节点，让同一段历史可以长出
多条分支。

:::predict title="从旧消息继续，要不要删掉后面的记录"
已有一条分支 `a → b → c`。用户回到 `a`，给出新指令并得到 `d`。磁盘文件应该删除
`b`、`c`，还是只追加 `d`？文件里的行顺序与用户当前看到的消息顺序分别是什么？
---answer
只追加 `d`，并令 `d.parentId = "a"`。文件仍按 `a、b、c、d` 排列；逻辑上，
`a` 同时拥有孩子 `b` 和 `d`。用户选择 `d` 时看到 `a → d`，选择 `c` 时仍能看到
`a → b → c`。物理最后一行只是最后写入的记录，不等于当前分支。
:::

## 开始动手：先进入正确的仓库

练习命令在教学历史仓库 `pi-course-history` 中运行，不是在教材站点目录，也不是原始
`pi` 仓库：

```bash
cd <你的工作区>/pi-course-history
pwd
npm run practice -w @pi/course -- 10 <新目录>
cd <新目录>
npm install
```

确认 `pwd` 的最后一段是你刚创建的练习目录。生成器会保留第 09 章实现，加入第 10 章
测试，并用无答案脚手架创建：

```text
packages/pi-course/src/session.ts
```

本章只修改这一个源文件。不要切换到 `target`，也不要从后续章节复制 compaction
类型。

:::rebuild title="Checkpoint 10 · 分六步保存一条可恢复的分支"
**模式：** 重建。从 09 的 `target` 开始，先实现纯路径，再接内存和 JSONL。

**起终点：** `parent` 是本章开始时的起点快照；`target` 是 14 项聚焦测试通过的
终点快照。

**教学文件：** `packages/pi-course/src/session.ts`

**学习脚手架：** 文件已经声明本章的公共类型、两个 Store、运行时解析函数、路径函数
和消息恢复函数。所有方法都能通过 TypeScript 编译；每个 Lab 只有自己的施工位，
没有最终实现。

**动手前只需知道：** `id` 唯一标识一条记录；`parentId` 指向它的上一条记录，根节点
的 `parentId` 是 `null`。JSONL 一行保存一条 JSON；本课程把行末换行当成提交标记。

**第一步：** 只实现 `pathTo(entries, leafId)`。先建立 `id → entry` 索引，再从 leaf
向父节点回溯，最后反转结果。

**第一次红灯：** 脚手架可以通过 TypeScript 编译；首次只运行 Lab 10.1 时，应看到
`Lab 10.1 pathTo 尚未实现`，而不是模块缺失或隐式 `any`。

**聚焦测试：** `packages/pi-course/test/10-session-tree.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 10`

**练习目录：** `npm run practice -w @pi/course -- 10`

**聚焦运行：** `npm run build -w @pi/course`，然后运行
`node --test packages/pi-course/dist/test/10-*.test.js`。

**通过证据：** 14 项测试按 `2/2 → 2/2 → 2/2 → 3/3 → 3/3 → 2/2` 检查路径、
外部数据收窄、内存副本、JSONL 恢复、writer 失败状态和完整消息投影。

第一次尝试先不看 target diff。卡住时，让陪练只检查当前 Lab 的输入、输出和第一处
偏差；不要让它一次写完 Store。
:::

## 第一步：用 `parentId` 找回一条分支

本章只有两种记录：

```ts
type EntryBase = {
  id: string;
  parentId: string | null;
  timestamp: number;
};

type SessionEntry =
  | (EntryBase & {
      type: "message";
      message: AgentMessage;
    })
  | (EntryBase & {
      type: "metadata";
      key: string;
      value: JsonValue;
    });
```

`id` 回答“这是哪条记录”，`parentId` 回答“它接在哪条记录后面”。数组下标不能代替
`id`：追加新分支、导出或迁移文件时，下标都会变化。

`pathTo(entries, leafId)` 的职责要写窄：

1. 所有 `id` 必须唯一。即使两个不同对象使用同一个 `id`，也要拒绝；
2. `leafId` 必须存在；
3. 只沿选中 leaf 的祖先链检查缺失 parent 和环；
4. 返回从根到 leaf 的新数组，而且其中的记录也不能与输入共享可变引用。

本章允许多个 root，也不检查未选中分支的缺失 parent。那属于“检查整座树”的另一项
能力。`pathTo()` 只回答一个问题：**这条指定路径能否安全恢复？**

回溯过程可以写成：

```text
先扫描 entries
  → 建立 byId
  → 遇到重复 id 立即失败

从 leaf 开始
  → 把 current.id 放进 seen
  → 把 current 放进 reversePath
  → parentId 为 null 时到达根
  → 否则查找 parent
  → 查不到：报告 child id 与 parent id
  → seen 已包含该 id：报告形成环的 id

最后 reversePath.reverse()
```

错误消息要包含相关 `id`。只有“missing parent”而没有孩子与父节点，调试真实文件时
仍然不知道该找哪一行。

:::lab title="实践 10.1 · 从两条分支恢复指定路径"
**目标：** 用一个纯函数固定身份、父子关系和诊断边界。

**文件：** `packages/pi-course/src/session.ts`

**动作：**
1. 建立全库唯一的 `byId` 索引。
2. 未找到 `leafId` 时，让错误包含这个 leaf id。
3. 从 leaf 向 root 回溯；缺 parent 时同时报告当前记录和 `parentId`。
4. 用 `seen` 检测两节点与三节点以上的环。
5. 只验证选中的祖先链，不因为无关分支损坏而拒绝一条健康路径。
6. 返回根到 leaf 的深副本。
7. 删除 Lab 10.1 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 10.1" \
  packages/pi-course/dist/test/10-*.test.js
```

**预期：** `2/2`。第一项覆盖 root、深链和 sibling 分支；第二项覆盖不同对象的重复
`id`、未知 leaf、缺失 parent、三节点环、未选中坏分支与返回副本。
:::

## 第二步：磁盘读出的对象仍然是 `unknown`

TypeScript 的 `SessionEntry` 只约束已经通过类型检查的代码。下面这句不会让磁盘
内容自动变安全：

```ts
const entry = JSON.parse(line) as SessionEntry;
```

`JSON.parse()` 的结果来自进程外。它可能缺字段、使用错误的 `type`，也可能把
`message` 写成完全不同的对象。`as SessionEntry` 只让编译器闭嘴，没有检查任何
运行时事实。

先写一个很小的边界。这里要检查“普通 JSON 对象”，不能只检查“不是数组的对象”；
`Map`、`Date` 和类实例也满足 `typeof value === "object"`，却不是课程允许的 JSON
对象：

```ts
function jsonObjectAt(
  value: unknown,
  path: string,
): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${path} 必须是 object`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error(`${path} 必须是普通 JSON object`);
  }
  return value as Record<string, unknown>;
}
```

然后逐层收窄。不要先把整个对象强转，再从里面取字段。至少要检查：

| 层 | 必须满足的条件 |
|---|---|
| entry base | 非空 `id`；`parentId` 为非空字符串或 `null`；`timestamp` 是有限数 |
| message entry | `type === "message"`，并且 `message` 是完整的三种消息之一 |
| metadata entry | `type === "metadata"`；`key` 非空；`value` 是 JSON-safe 值 |
| user | `content` 只含文本块；`timestamp` 是有限数 |
| assistant | 文本或工具调用块；provider、model、usage、stopReason、timestamp 完整 |
| toolResult | call id、tool name、文本块、`isError`、timestamp 完整 |

“JSON-safe”表示 `null`、布尔、字符串、有限数、上述值组成的数组或普通对象。函数、
`undefined`、`BigInt`、`Map`、非有限数和循环引用都不应进入持久层。这个检查也要
覆盖工具调用的 `arguments` 与工具结果的 `details`，否则 `JSON.stringify()` 可能
静默丢字段，或把 `Infinity` 写成 `null`。

递归检查需要同时携带字段路径和当前祖先集合。最小控制流如下：

```text
jsonValueAt(value, path, ancestors)
  ├─ null / boolean / string：直接返回
  ├─ number：只接受有限数
  ├─ array 或普通 object：
  │    ├─ 已在 ancestors：报告 path 形成循环
  │    ├─ 加入 ancestors
  │    ├─ 递归检查每个孩子
  │    │    array 使用 path[index]
  │    │    object 使用 path.key
  │    └─ 在 finally 中移出 ancestors
  └─ 其他类型：报告 path 不能写入 JSON
```

`ancestors` 只记录当前递归路径，不是全局“见过的对象”。同一个普通对象可以在两个
并列字段中出现；只有沿当前路径再次遇到自己才是环。

不要一次写完整棵解析器。按下面的顺序施工：

1. 先完成普通对象、非空字符串、有限数和 `jsonValueAt()`；
2. 再完成 entry base 与 metadata，让最小合法记录通过；
3. 依次加入文本块、user、assistant、toolResult，最后由 `type` 和 `role` 分派；
4. 最后检查未知字段，并确认返回值是新对象。

解析成功后返回新对象。这样 `parseSessionEntry()` 同时完成运行时验证和所有权交接：
调用者后续修改原始输入，不会改变返回结果。

:::lab title="实践 10.2 · 把 unknown 收窄成会话记录"
**目标：** 只让字段完整、可写入 JSON 的记录进入 Store。

**文件：** `packages/pi-course/src/session.ts`

**动作：**
1. 实现普通对象、非空字符串、有限数和 `JsonValue` 的递归检查。
2. 分别解析文本块、工具调用、user、assistant 与 toolResult。
3. 根据严格的字符串判别字段解析 `message` 和 `metadata`；数组形式的
   `["message"]` 不能通过。
4. 拒绝缺少 payload、未知类型、非有限时间戳和非 JSON-safe 的
   `arguments/details/value`。
5. 让错误带上字段路径，例如 `entry.message.content[0]`。
6. 返回深副本，删除 Lab 10.2 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 10.2" \
  packages/pi-course/dist/test/10-*.test.js
```

**预期：** `2/2`。一项覆盖三种完整消息和 metadata；另一项用错误判别字段、缺失
payload、`NaN`、`Infinity`、函数、`undefined` 与循环引用逐层撞击边界。
:::

## 第三步：先在内存中固定数据所有权

Store 收到一条记录时，不能把调用者的对象引用直接塞进内部数组：

```ts
const pending = store.append(entry);
entry.message.content[0].text = "调用后又被改了";
await pending;
```

落入 Store 的必须是调用 `append()` 那一刻的内容。读取也一样：

```ts
const first = await store.entries();
first[0].id = "外部修改";
const second = await store.entries();
// second 仍应保存原 id
```

这形成两条所有权边界：

```text
调用者对象 ──调用时深复制──▶ Store 内部
Store 内部 ──每次读取深复制──▶ 调用者
```

`InMemorySessionStore` 不需要模拟磁盘故障。它负责把三件事做清楚：

1. append 在调用时验证并取得快照；
2. 多次 append 保持调用顺序；
3. 每次读取返回独立副本。

追加式并不等于“什么都能 push”。同一个 Store 中的 `id` 仍要唯一；非 root 记录的
parent 必须已经存在。先写孩子、后写父亲会让中间状态无法恢复，本章直接拒绝。

这里有两个不同的检查时机：

- 调用 `append()` 时，立即检查记录结构并取得深副本；JSONL Store 还会立即序列化；
- 轮到该 FIFO 任务执行时，再根据 Store 当时已经提交的 `id` 检查重复和 parent。

因此可以连续调用 `append(parent)`、`append(child)` 而不逐个 `await`。child 排在
parent 后面，轮到它时能看到已经成功提交的 parent。不要在调用 child 的瞬间读取旧
Store 状态并误报 parent 缺失。

:::lab title="实践 10.3 · 固定内存 Store 的输入与输出副本"
**目标：** 让调用者无法在 append 前后偷偷改写 Store 中的历史。

**文件：** `packages/pi-course/src/session.ts`

**动作：**
1. 在 `append()` 被调用时立即运行解析并取得深副本，不要等到异步任务轮到它时才读
   原对象。
2. 按调用顺序追加记录。
3. 拒绝重复 `id` 与尚不存在的 parent；允许新的 root。
4. `entries()` 每次返回新的深副本。
5. 测试要深入到消息块、工具参数和 metadata 数组，不只比较顶层数组。
6. 删除 Lab 10.3 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 10.3" \
  packages/pi-course/dist/test/10-*.test.js
```

**预期：** `2/2`。一项检查分支追加、重复和缺 parent；另一项在 append 调用后和两次
读取之间修改嵌套对象，Store 中的值都不变化。
:::

## 第四步：把换行当成提交标记

JSONL 一行保存一个 JSON 对象。本课程再增加一条明确规则：

> 只有以换行结束的记录才算提交。

这条规则让恢复不必猜测“末尾看起来完整的 JSON”是否真的写完。结果表如下：

| 文件尾部 | 结果 |
|---|---|
| 完整 JSON + `\n` | 解析并校验 |
| `BAD\n` | 失败，报告稳定行号 |
| 完整 JSON 但 schema 错误 + `\n` | 失败，报告稳定行号 |
| 最后没有 `\n`，内容是半截 JSON | 忽略这段尾部，返回 `unterminated_tail` warning |
| 最后没有 `\n`，内容恰好是完整 JSON | 仍视为未提交尾部，返回同一 warning |
| 中间任意一行损坏 | 失败，不能跳过 |

空行不产生 entry，也不报错，但仍占一个物理行号。例如 `"\nBAD\n"` 中的坏记录必须
报告第 2 行。这样人工排版不会产生伪记录，错误行号仍能直接对应编辑器中的文件位置。

最后一项很重要。跳过中间坏行后，后面的 `parentId` 可能指向已经被吞掉的记录。继续
返回“尽量恢复”的数组，会把损坏伪装成一棵健康的树。

warning 是结构化数据：

```ts
type SessionWarning = {
  code: "unterminated_tail";
  line: number;
};
```

调用者可以据此提示用户、进入只读模式或发起修复。不要只打印一句日志后继续写。

`recoverJsonl(text)` 是纯函数。它只解析字符串，不删除尾部，也不改文件。可以先找出
文本是否以 `\n` 结束，再只遍历已经提交的行。每一行先 `JSON.parse()`，再交给
`parseSessionEntry()`；两种错误都要带上行号重新抛出。

:::lab title="实践 10.4 · 区分已提交坏行与未提交尾部"
**目标：** 用一个纯函数固定 JSONL 的提交和恢复语义。

**文件：** `packages/pi-course/src/session.ts`

**动作：**
1. 空文件返回空记录和空 warning。
2. 逐行解析所有以换行结束的非空记录，并保留顺序。
3. 换行结束的 JSON 语法错误和 schema 错误都必须失败，并报告行号。
4. 末尾没有换行时，无论内容能否独立解析，都忽略该尾部并返回
   `{ code: "unterminated_tail", line }`。
5. 跳过空行，但计算错误位置时仍保留它占用的物理行号。
6. 删除 Lab 10.4 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 10.4" \
  packages/pi-course/dist/test/10-*.test.js
```

**预期：** `3/3`。三项分别覆盖正常记录、两种未提交尾部，以及换行结束的坏 JSON、
坏 schema 和中段损坏。
:::

## 第五步：一次可能半写的失败会让 writer 失效

`appendFile()` 返回失败，不代表磁盘一个字节都没写。它可能已经留下：

```text
{"id":"a",...}\n
{"id":"b","parent
```

如果同一个 writer 随后继续追加 `c`，文件会变成：

```text
{"id":"b","parent{"id":"c",...}\n
```

原本可识别的未提交尾部被拼成了一条以换行结束的坏记录。下次恢复只能把它当作已提交
损坏，连此前可读的前缀也无法正常打开。

因此 writer 需要一个很小的状态机：

```text
ready
  ├─ 调用时校验或序列化失败
  │     → 只拒绝当前 append，仍是 ready
  ├─ 底层 append 成功
  │     → 回到 ready
  └─ 底层 append 失败，可能已经半写
        → tainted
             ├─ 后续 append 不再调用底层写入
             └─ read/entries 返回最初的写入错误
```

三种状态的公开行为如下：

| 状态 | 来源 | `read()` | `entries()` | `append()` |
|---|---|---|---|---|
| `ready` | 打开完整文件 | 返回完整记录，warnings 为空 | 返回完整记录 | 进入 FIFO |
| `needs-repair` | 打开时发现无换行尾部 | 返回完整前缀和 warning | 只返回完整前缀 | 拒绝，不调用 I/O |
| `tainted` | 本实例一次底层 append 失败 | 抛出最初的 I/O 错误 | 抛出同一错误 | 抛出同一错误，不调用 I/O |

`needs-repair` 描述打开文件时已经观察到的断尾；`tainted` 描述当前实例可能刚刚造成的
半写。前者仍允许只读恢复，后者连重新读取都不能假装可靠，必须创建新实例重新检查
文件。

序列化失败和 I/O 失败必须分开。前者尚未碰文件，下一条合法记录仍可以写；后者无法
知道写了多少，当前 writer 必须停下。

为了让测试控制因果顺序，`JsonlSessionStore` 接收一个很窄的文件 I/O 接口。测试可以
让第一次 append 写入半行后抛错，并记录第二次 append 是否还调用了底层方法。不要用
大文件、`sleep` 或“通常谁更快”证明 FIFO。

每次 `append()` 的顺序是：

```text
调用时
  → parseSessionEntry(entry)
  → JSON.stringify(snapshot) + "\n"
  → 把固定字符串加入单实例 FIFO

轮到本次写入时
  → 若 writer 已 tainted，直接返回原错误
  → 调用 io.appendFile()
  → 失败则保存原错误并进入 tainted
```

Promise FIFO 只需要一种形状。下面是排队骨架，不是完整 Store 答案：

```ts
const operation = this.tail.then(async () => {
  // 先检查 writer 状态和当前已提交 id
  // 再执行本次 io.appendFile(file, line)
});

// 内部队列继续结算后续任务；调用者仍拿到原 operation 的成功或失败。
this.tail = operation.catch(() => undefined);
return operation;
```

固定的 `line` 必须在创建 `operation` 之前算好。任务真正执行时再检查依赖 Store
当前内容的重复 id 与 parent；底层 I/O 失败则保存第一次错误，后续任务开始时先读
这个状态。

打开已有文件时，如果 `recoverJsonl()` 报告未提交尾部，Store 可以读取此前的完整
记录，但必须拒绝继续追加，并提示先修复文件。本章不自动截断用户历史。

:::lab title="实践 10.5 · 让 JSONL writer 在失败后停下来"
**目标：** 证明追加顺序、调用时快照和失败状态，不靠调度时机猜测。

**文件：** `packages/pi-course/src/session.ts`

**动作：**
1. `open()` 创建文件并读取现有内容；有未提交尾部时进入只读的
   `needs-repair` 状态。
2. `append()` 在调用时完成校验、深复制和序列化，再把固定行加入 FIFO。
3. 同时发起多次 append，仍按调用顺序写入；每次成功后，旧 bytes 必须是新文件的
   完整前缀。
4. 底层 append 失败时保存第一次错误，使 writer 进入 `tainted`。
5. `tainted` 后的 append、read 和 entries 都返回第一次错误；后续 append 不能再次
   调用底层 I/O。
6. 重新 `open()` 同一文件时，按断尾规则只读恢复完整前缀。
7. 调用时校验或序列化失败不能污染 writer；下一条合法记录仍可成功。
8. 删除 Lab 10.5 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 10.5" \
  packages/pi-course/dist/test/10-*.test.js
```

**预期：** `3/3`。一项检查真实文件的追加前缀与跨实例恢复；一项用 Promise gate
固定 FIFO 和调用时快照；一项注入半写失败，检查 `tainted`、I/O 调用次数、原错误
身份和重新打开后的只读恢复。
:::

## 第六步：只把选中分支的完整消息交回 Agent

磁盘的物理行顺序不是模型上下文。假设文件中依次写入：

```text
a user
b assistant(toolCall c1)  parent=a
r toolResult(c1)          parent=b
d assistant(text)         parent=a
m metadata                parent=d
```

选择 `r` 时，消息是 `a、b、r`；选择 `m` 时，路径是 `a、d、m`，但交给模型的消息
只有 `a、d`。两条分支不能混在一起，metadata 也不是模型消息。

`messagesOnPath(entries, leafId)` 可以复用 `pathTo()`，再筛出
`type === "message"`。关键是保留整个 `AgentMessage`：

- assistant 中的 `toolCall.id/name/arguments` 不能只剩一段文本；
- toolResult 的 `toolCallId`、`isError` 和 `details` 不能丢；
- 返回消息不能与输入 entry 共享嵌套对象。

不要先调用 `textOf()`。它本来就是有损的界面投影，只保留文本块，无法重建工具往返。

:::lab title="实践 10.6 · 从 active leaf 无损恢复消息"
**目标：** 只恢复选中路径，同时保留完整工具协议。

**文件：** `packages/pi-course/src/session.ts`

**动作：**
1. 调用 `pathTo()` 得到指定 leaf 的根到叶路径。
2. 跳过 metadata，只收集 message entry。
3. 保留 assistant 工具调用与对应 toolResult 的全部字段。
4. 用 sibling leaves 证明两条互斥分支不会混合。
5. 修改返回消息中的工具参数和 result details，输入 entries 必须保持不变。
6. 删除 Lab 10.6 的显式异常，先运行本段，再运行全章测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 10.6" \
  packages/pi-course/dist/test/10-*.test.js
node --test packages/pi-course/dist/test/10-*.test.js
```

**预期：** 本段 `2/2`，全章 `14/14`。第一项覆盖 sibling 与 metadata；第二项覆盖
完整 tool call/result 和返回副本。
:::

## 故意把它弄坏

先找到 `JsonlSessionStore` 在底层 append 失败后记录 `tainted` 的分支。临时改成
“当前 Promise 失败，但队列仍可继续写”，或删除后续任务开始前的 `tainted` 检查。

:::failure title="让半写后的 writer 继续追加"
只运行 Lab 10.5。测试中的假 I/O 会先写入半条记录，再抛出固定错误；随后已经排队的
第二次 append 本应返回同一个错误，而且不能再次调用 I/O。

错误实现会让底层 append 调用次数增加，并把第二条记录接到半行后面。恢复检查也会
从 `unterminated_tail` 退化成换行结束的坏行。恢复 `tainted` 检查后，Lab 10.5 应回到
`3/3`，全章回到 `14/14`。
:::

## 本章没有证明什么

14 项测试只规定本章明确拥有的边界。它们没有证明：

- 多个 `JsonlSessionStore` 实例或多个进程能安全写同一个文件；
- `appendFile()` 完成后，字节已经通过 `fsync` 刷到物理介质；
- 任意文件系统都能原子追加一整行；
- 未提交尾部会被自动备份、截断或修复；
- 多个 root 或未选中分支已经通过整库完整性检查；
- BOM、CRLF、旧格式 header 或版本迁移已经处理；
- session 已经自动接到 `Agent.run_end`；本章只提供持久层和消息恢复函数；
- compaction、摘要、token budget 或上下文裁剪已经实现；
- 恶意超大文件、深度耗尽和磁盘配额已经受到资源限制。

“同一文件只有一个 writer”是调用者必须满足的前置条件，不是这个类实现了文件锁。
`tainted` 也不是自动修复；它只是阻止当前实例在不知道文件状态时继续扩大损坏。

:::pi title="与上游 Pi 的固定提交对照"
固定提交 `8479bd8` 的
`packages/coding-agent/src/core/session-manager.ts` 同样用 `id`、`parentId` 和 leaf
表达历史树，并在 branch 后从旧节点继续追加。产品格式还包含 header、版本、
compaction、模型变化、label 和扩展数据。

课程没有照搬上游的容错细节。该固定提交读取文件时会跳过部分无法解析的行，路径构造
也不负责诊断重复 id、缺 parent 或环。本章故意采用更严格的教学规则：换行结束的坏行
立即失败，指定路径必须可验证，公开返回值使用深副本。这里讲的是课程新增并用测试
固定的边界，不能把它写成上游已经提供的保证。
:::

## 本章验收

:::checkpoint title="Checkpoint 10 · 历史能分支，writer 失败后会停"
在隔离练习目录运行 build 和 14 项测试。然后向陪练展示四组证据：

1. 同一前缀长出两个 leaf；分别恢复时只看到自己的分支，旧记录没有被删除；
2. assistant tool call 与 toolResult 跨 JSONL 写入、重新打开和消息恢复后仍完整配对；
3. 一条换行结束的坏记录会报告行号，无换行尾部只返回此前的完整记录与结构化 warning；
4. 底层写入半途失败后，当前 writer 不再调用 I/O；新实例重新打开时只能只读恢复
   完整前缀。

还要逐一指出三次所有权交接：`append()` 调用时的输入快照、Store 内部记录、
`entries()`/`messagesOnPath()` 返回的输出副本。最后说明哪些结论来自测试，哪些限制
仍在“本章没有证明什么”中。做到这些，本章通过。
:::

## 可选迁移练习

:::transfer title="陪练迁移 · 导出一条分支的统计"
先让旁边的 Agent 帮你列四个验收例子，不要让它直接给实现。你自己写一个纯函数：
输入 entries 与 leaf id，返回分支深度、消息数、工具调用数和错误 toolResult 数。

例子至少包括：纯文本分支；一次成功工具往返；错误 toolResult；两个 sibling leaves。
函数必须复用 `pathTo()` 的边界，不能把物理最后一行当当前分支。修改返回对象前后，
输入 entries 的 JSON 表示应完全一致。
:::

更进一步的练习是设计显式的 `repairUnterminatedTail()`。先写授权和失败测试：保存
原文件备份、只截断最后一个未提交尾部、已有完整行逐字节不变、替换失败不覆盖原文件。
在这些条件写清之前，不要给 `open()` 增加自动修复。

## 小结

会话文件不是 transcript 数组的磁盘副本。每条完成事实拥有唯一 `id`，`parentId`
把它接到上一条记录；从旧节点继续时只追加新孩子，所以过去的另一条尝试仍然存在。

外部 JSON 必须逐层收窄，Store 在调用时取得输入快照，并在读取时交出新副本。行末
换行是提交边界：换行结束的坏行立即失败，无换行尾部只读恢复。一次底层写入失败可能
已经留下半行，因此当前 writer 进入 `tainted`，不能继续追加。

下一章会从 `messagesOnPath()` 得到的真实分支派生有限大小的模型输入。原始 session
仍保持追加式，不会为了节省上下文而改写过去。
