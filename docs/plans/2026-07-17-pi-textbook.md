# Pi 工程教材实施计划

**目标：** 在独立的 `pi-textbook/` 中交付一套中文 HTML 自学教材。学习者从一个
最小 TypeScript 工程出发，经过“序章 + 四部 14 章”，逐步得到一个可运行、可测试、
可恢复、可压缩、可扩展的 Pi。

**设计原则：**

1. 教材按认知依赖组织，不按上游仓库目录组织。
2. 一章只增加一种主要复杂性，并留下一个可验证的系统增量。
3. 正文、真实代码、测试和生成输出进入同一条构建验证链。
4. 每章采用“预测 → 最小机制 → 实现 → 观察 → 故障注入 → 验收 → 迁移”。
5. 明确区分课程简化、课程主动强化和当前上游 Pi 行为。
6. 不修改相邻的 `curriculum/`、`practice/` 或 `pi/`。

**技术架构：**

- Vinext / React 多路由静态教材站。
- `content/chapters/*.md` 是叙述事实源。
- 构建前把 Markdown 与教材指令编译为静态 TypeScript 数据，线上不读取文件系统。
- `workshop/` 保存可执行的 TypeScript 参考实现、测试和可恢复 checkpoint。
- 客户端仅使用 localStorage 保存本机阅读进度、预测答案和书签；不把阅读进度冒充代码验收。

## Task 1：建立课程契约和内容验证链

**产物：**

- 15 个稳定章节 ID、四部课程结构和依赖关系。
- Markdown 作者规范：章节目标、初态、离开状态、预测、代码、输出、故障、验收和迁移。
- 内容编译脚本，生成章节 HTML、页内目录和搜索索引。
- 内容检查：缺失章节、重复标题、无验收、无故障实验、断裂内部链接时失败。

**验证：**

- `npm run content:build`
- `npx tsc --noEmit`

## Task 2：撰写完整教材正文

**章节：**

- 序章：观察一次完整 Agent trace。
- 第一部：TypeScript 生存集、EventStream、消息 IR、ScriptedModel、真实 adapter。
- 第二部：Tool contract、Agent loop、Coding tools。
- 第三部：Stateful Agent、JSONL 会话树、Context 与 Compaction。
- 第四部：Skills / Extensions、Composition Root、Deterministic Eval 与 Capstone。

**内容标准：**

- 每章至少一条完整 worked example、一处运行前预测和一次失败注入。
- 每章给出精确文件、命令、预期模式、验收条件和恢复方法。
- 重要章节同时呈现实现、测试、输出和 Pi 对照。
- 练习按“复现、修改、破坏与诊断、无 starter 迁移”渐隐。

## Task 3：实现教材阅读器

**页面：**

- 首页：直接进入学习、能力地图、当前进度和继续阅读。
- 章节页：全书目录、正文、页内目录、前后导航、完成状态。
- 路线图：主链路和章节依赖。
- 方法页：为什么这样学、课程与上游的差异。
- 术语表：消息、事件、会话、上下文和扩展边界。

**交互：**

- 全文搜索与 `/` 快捷键。
- 预测题、分级提示、折叠参考答案和代码复制。
- 本机阅读进度、书签和“继续学习”。
- 移动端目录与桌面三栏阅读。

## Task 4：实现可执行 Workshop

**范围：**

- Canonical messages、EventStream、ScriptedModel、provider adapter 边界。
- Tool registry、schema validation、Agent loop、四种 coding tools。
- Stateful Agent、abort / steering / follow-up。
- JSONL append-only session tree、resume / branch / recovery。
- Context projection、token budget 和 compaction。
- Skills / Extensions 信任边界、composition root 和确定性 eval。

**验证：**

- `npm run workshop:verify`
- 测试覆盖正常 trace、截断 tool arguments、tool exception 配对、并发结果顺序、
  abort、损坏 JSONL、branch、safe cut point 和 compaction。

## Task 5：完成视觉、无障碍和发布门禁

**视觉方向：** “工程批注版教材”。采用高可读中文正文、编辑式标题、低圆角、
细线拓扑、墨黑正文、纸白背景、青绿机制色和朱红故障色；不做卡片堆砌或通用
紫色渐变。

**验证：**

- `npm run test`
- 首页、全部章节和 404 服务端渲染成功。
- 键盘焦点、标题层级、landmark、移动端布局和代码横向滚动可用。
- 删除 starter skeleton、临时 metadata 和未使用依赖。

## Task 6：保存并发布

- 构建成功后提交新目录内的精确源状态。
- 保存站点版本并优先私有发布。
- 返回可访问的 HTML 教材地址，同时保留本地完整源码。
