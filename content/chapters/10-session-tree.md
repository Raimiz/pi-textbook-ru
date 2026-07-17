---
id: "10"
slug: session-tree
part: state
partTitle: 第三部 · 让 Harness 可靠
chapter: "10"
title: 会话是追加式事件树
summary: 用 JSONL 中的 parent pointer 保存不可改写的历史，并从任意叶子重建一条活动路径。
minutes: 125
difficulty: 核心
artifact: workshop/src/session.ts
prerequisites: 03,09
terms: append-only log, JSONL, parent pointer, active path, branch, resume
upstream: packages/coding-agent/src/core/session-manager.ts, packages/coding-agent/docs/session-format.md
---

## 你将得到什么

进入本章时，Agent 在进程内保存 transcript；进程一关，历史就消失。更糟的是，如果把历史理解成一个可修改数组，“回到旧消息重试”往往意味着删除后缀，过去的另一种尝试被永久抹掉。

本章只增加一种复杂性：**持久化的历史身份与分支关系**。完成后，`workshop/src/session.ts` 的 `InMemorySessionStore` 与 `JsonlSessionStore` 会追加并读取 entry；纯函数 `pathTo` 能从调用者选定的任意叶子重建 active path。Store 不偷偷保存“当前分支”，选择权属于上层。

不变量是：**已有 SessionEntry 永不原地修改或删除；分支通过在旧 entry 下追加新孩子表达。**

恢复本章起点时，只撤销 `workshop/src/session.ts` 与本章测试，并删除测试生成的临时 `.jsonl`。不要清空 Agent transcript 来“修复”store。恢复后 `npm run workshop:test -- stateful-agent` 应仍通过。

## 先建立全景

三个看似相同的词，保存的是不同层次：

```text
runtime event stream   message_update、tool progress、渲染刷新
        │ 只取完成事实
        ▼
canonical transcript  user / assistant / toolResult（模型协议）
        │ 加上身份和 parent
        ▼
session log           message、模型变化、未来的 compaction 等持久事实
```

把每个 token delta 落盘会使恢复依赖临时渲染过程；只存最终文本又会丢 tool call/result 和错误语义。课程在 canonical 完整消息形成后，由本次 `run_end` 统一追加完整消息，不持久化 iterator、AbortController、pending set 或 UI 展开状态。

:::predict title="回到旧节点是否要截断文件"
已有线性对话 `a → b → c`。用户选择从 `a` 继续，产生新回答 `d`。JSONL 应删除 b/c、复制 a 到新文件，还是只追加 d？最终活动路径与物理行顺序分别是什么？
---answer
只追加 d，并令 `d.parentId = a.id`。物理顺序仍是 a、b、c、d；逻辑树是 a 同时拥有 b 和 d，活动路径为 a→d。文件追加顺序不是当前 transcript 顺序。
:::

## 用 parent pointer 把线性文件变成树

最小 entry 是 tagged union；header 可以保存格式版本，但不参与树：

```ts
type EntryBase = {
  id: string;
  parentId: string | null;
  timestamp: number;
};

type SessionEntry =
  | (EntryBase & { type: "message"; message: AgentMessage })
  | (EntryBase & {
      type: "compaction";
      summary: CompactionSummary;
      compactedEntryIds: string[];
    })
  | (EntryBase & {
      type: "metadata"; key: string; value: unknown
    });
```

`id` 是事实身份，`parentId` 是逻辑边。调用者提供的 leaf 决定正在看的分支；要开新枝，只需构造一个 `parentId` 指向旧节点的新 entry 并 append。最小课程 Store 故意不维护 checkout 状态，避免“读写仓库”与“产品当前选中项”耦合。不要把数组下标当 identity：追加、迁移或导出都会改变下标。

为什么不用“每次保存完整 transcript”的快照？快照虽然读取简单，却重复共享前缀，也无法判断两份相似数组究竟来自同一历史还是巧合。Parent pointer 让共享关系成为显式事实：每个 entry 只增加一个节点，分支成本与新增内容成正比，审计时还能定位选择发生在哪个父节点。代价是读取路径必须遍历并验证引用，这正是 `pathTo` 集中的职责。

从 leaf 建 active path 的算法很小，却必须验证图结构：

```ts
function pathTo(entries: SessionEntry[], leafId: string): SessionEntry[] {
  const byId = new Map<string, SessionEntry>();
  for (const entry of entries) {
    if (byId.has(entry.id)) throw new Error(`duplicate id: ${entry.id}`);
    byId.set(entry.id, entry);
  }
  const reverse: SessionEntry[] = [];
  const visited = new Set<string>();
  let current = byId.get(leafId);
  if (!current) throw new Error(`unknown leaf: ${leafId}`);
  while (current) {
    if (visited.has(current.id)) throw new Error("parent cycle");
    visited.add(current.id);
    reverse.push(current);
    if (current.parentId === null) break;
    current = byId.get(current.parentId);
    if (!current) throw new Error("missing parent");
  }
  return reverse.reverse();
}
```

重复 id、缺失 parent 和 cycle 都是损坏，不能“尽量跳过”。读取不同 leaf 应得到相同共享前缀和不同后缀。

验证不能只检查 JSON 形状。重复 id 会让 parent 指向产生歧义；缺失 parent 会形成孤岛；cycle 会让回溯永不结束。先建立唯一索引，再对选中路径维护 seen set，能把故障定位到首次偏差。是否要求“所有 entries 都从一个 root 可达”属于更严格的全库校验，可独立于按 leaf 读取，但两种策略都必须写清，不能随数据碰巧排列而变化。

最小 Store 不保存当前 leaf 还有一个好处：同一历史可以同时服务两个只读视图，而不互相切换状态。产品若要在重启后记住用户最后选择，可把 leaf id 存在独立设置，或追加明确的 metadata entry；无论哪种方式，都不能假装“物理最后一行永远是当前路径”。选择是产品状态，父子边才是历史事实。

:::lab title="实践 10.1 · 在内存中长出两条分支"
**目标：** 实现 append、entries、pathTo 与 tree 查询，不先碰文件系统。

**文件：** `workshop/src/session.ts`、`workshop/test/session-context.test.ts`

**动作：**
1. 用 `store.append(...)` 依次追加 a、b、c，检查 parent 链。
2. 直接追加 `parentId: "a"` 的 d；证明 b/c 对象与数量都未变化。
3. 分别调用 `pathTo(await store.entries(), "c")` 与 `"d"`，断言共享 a。
4. 注入重复 id、缺 parent 与 cycle，要求错误指出首个坏节点。

**运行：** `npm run workshop:test -- session-tree`

**预期：** entries 的物理顺序为 a,b,c,d；两条逻辑路径分别为 a,b,c 与 a,d；损坏不会被静默过滤。
:::

## JSONL 提供追加证据，不替你解决一切

JSONL 一行一个完整对象，适合检查、流式读取与 append。课程文件只保存 `SessionEntry`；当前上游另有带版本的 header，那是产品格式而不是本章最小接口：

```json
{"type":"message","id":"a","parentId":null,"timestamp":0,"message":{"role":"user","content":[{"type":"text","text":"修复测试"}],"timestamp":0}}
{"type":"message","id":"b","parentId":"a","timestamp":1,"message":{"role":"assistant","content":[{"type":"toolCall","id":"c1","name":"read","arguments":{"path":"a.ts"}}],"provider":"scripted","model":"scripted-v1","usage":{"input":0,"output":0,"totalTokens":0},"stopReason":"toolUse","timestamp":1}}
{"type":"message","id":"r","parentId":"b","timestamp":2,"message":{"role":"toolResult","toolCallId":"c1","toolName":"read","content":[{"type":"text","text":"..."}],"isError":false,"timestamp":2}}
```

`recoverJsonl(text)` 要报告行号并区分：尾部半行可能来自崩溃，返回已完成 entries 和 warning；中间坏行意味着后续 parent 关系不可信，必须失败。课程声明**单进程单 writer**，不假装 append 自动解决多进程锁、磁盘 flush 或跨平台原子性。

尾部恢复之所以可接受，是因为最后一个换行之前的每行已经自包含；中间跳过则会让后续条目的 parent 可能指向被吞掉的事实。Warning 也必须交给调用者，而不是静默降级：用户需要知道最后一次动作可能没有持久化，才能决定重试、审计或停止。

Resume 不是把所有物理行塞回模型。它先验证格式与树，再按 active leaf 得到 path，最后从 path 中投影 canonical messages。下一章才会加入 compaction，因此本章的投影只是筛出 `type: "message"`，且必须保留 assistant tool call 与其配对 results。

:::lab title="实践 10.2 · 证明 append 没有改写过去"
**目标：** 实现 JSONL store，并从分支文件恢复同一逻辑树。

**文件：** `workshop/src/session.ts`、`workshop/test/session-context.test.ts`

**动作：**
1. 用 `await JsonlSessionStore.open(path)` 打开临时文件，再逐行 append 完成 entry。
2. 每次 append 前保存原始 bytes，之后断言新文件仍以旧 bytes 为前缀。
3. 重启一个新 store，读取 entries，并由调用者分别选择两个 leaf 恢复路径。
4. 直接测试 `recoverJsonl` 的尾部半行与中间坏 JSON，固定 warnings 和错误语义。

**运行：** `npm run workshop:test -- session-tree`

**预期：** 正常文件可跨实例恢复；branch 不覆盖旧后缀；尾部截断返回 warning；中间损坏指出稳定行号，绝不 `catch { return [] }`。
:::

:::mechanism title="持久化时点必须是完成事实"
Assistant 流中途崩溃时，不应把某个 `message_update` 当完整回答。课程只在 canonical 完整消息形成并结束本次运行后追加；若产品需要恢复 partial，必须设计独立 entry type 和恢复语义，不能冒充已完成 message。Tool result 同理：异常也先由执行器结构化，再作为完成事实落盘。
:::

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的当前产品主路径 `packages/coding-agent/src/core/session-manager.ts` 使用带版本 header 的 JSONL；entry 以 id/parentId 形成树，产品层的 branch 会移动 leaf，下一次 append 形成新孩子。它还保存 thinking/model、compaction、branch summary、extension custom entry、label 等事实。课程 Store 则无隐式 leaf，只实现 message 与最小 metadata；两者共享 append-only tree 和 active-path 语义。不要把并存的通用 AgentHarness 当成产品已经完全迁移后的唯一实现。
:::

## 故意把它弄坏

:::failure title="把物理最后一行当 active path"
构造 a→b→c，再用 `parentId: "a"` 追加 d。临时把 resume 实现改成“读取全部 message 行”，或用文件最后 N 行作为历史。

首次偏差是恢复出的 context 同时包含互斥分支 b/c 与 d，而不是 provider 报错。恢复 parent traversal 后，分别从 c、d 重建路径；证明选择 d 不删除 c，选择 c 也看不到 d。
:::

## 本章验收

:::checkpoint title="Checkpoint 10 · 历史可分支且不可改写"
运行 `npm run workshop:test -- session-tree`，演示：追加两轮 → 记录文件 hash/bytes → 指向旧 parent 追加新回答 → 重启 → 调用者仍可选择两条 leaf。原文件前缀必须逐字节保持。

你还要从一条 toolUse trajectory 指出 call/result 在 session 中如何配对，并解释 event、transcript、session 各自丢弃了什么。恢复时撤销本章文件，`npm run workshop:test -- stateful-agent` 仍通过。
:::

## 可选迁移练习

:::transfer title="无脚手架迁移 · 导出一条 trajectory"
只给定 entries 与 leaf id，导出该 leaf 的 canonical messages、tool 调用次数、错误 result 数和分支深度。导出函数必须是纯派生：调用前后 entries 深度相等、JSON 序列化完全一致。用两个 sibling leaves 证明共享 prefix 不会被重复修改。
:::

额外练习：设计 v0→v1 的微型迁移，为旧的线性记录补 id/parentId。迁移默认只返回新对象，不覆盖原文件；解释为何“可读旧格式”和“自动改写用户历史”是两个授权级别。

## 小结

Session 不是 transcript 数组的磁盘副本，而是不可改写事实组成的树。JSONL 提供物理追加，id/parentId 提供逻辑分支，active leaf 决定当前路径；事件只在完成后沉淀为 canonical message。下一章会在不删除这棵历史树的前提下，从 active path 派生有限大小的 context。
