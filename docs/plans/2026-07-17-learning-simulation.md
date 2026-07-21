# Pi 教材学习模拟 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 用一名零基础学生和一名受约束陪练完整模拟 15 章学习过程，把观察到的教材缺陷修复并从相同起点复测至通过。

**Architecture:** 主 agent 是唯一协调者；学生只接触章节、parent 快照和聚焦测试，陪练可查看目标 diff 但只能给单步阶梯提示。每个失败先记录为结构化 regression，再修改章节和自动内容契约；同章从同一 parent 创建新快照复测，最后执行全量门禁并发布新版本。

**Tech Stack:** Git/Git archive、Node.js、TypeScript、Node test runner、Markdown 内容生成器、vinext/Sites。

---

### Task 1: 建立实验协议和失败的自动表达

**Files:**
- Create: `docs/usability/README.md`
- Create: `docs/usability/regressions.json`
- Create: `scripts/validate-learning-contract.mjs`
- Modify: `package.json`
- Test: `tests/learning-contract.test.mjs`

**Step 1: 写失败测试**

测试读取 15 章与 regression 清单，要求每章具备可直接执行的第一步、目标文件、聚焦测试命令、预期失败、恢复命令、checkpoint parent/target，以及至少一个解释“为什么”的机制段。

**Step 2: 运行并确认失败**

Run: `node --test tests/learning-contract.test.mjs`

Expected: FAIL，并指出当前章节缺少的可学习性证据，而不是语法错误。

**Step 3: 写最小验证器与实验 schema**

验证器输出章节 ID、缺失契约和稳定的错误码；`regressions.json` 初始为空数组，后续每次观察追加缺陷、证据、修复文件与复测状态。

**Step 4: 运行自动测试**

Run: `npm run learning:verify`

Expected: PASS 或只剩需要由真实模拟判断的行为性问题。

**Step 5: 提交**

Commit: `test: add the textbook learning contract`

### Task 2: 启动两个干净角色并校准第 00 章

**Files:**
- Modify: `docs/usability/learning-simulation.md`
- Modify: `docs/usability/regressions.json`

**Step 1: 创建学生与陪练**

两者均使用无主线程上下文的 subagent。学生不得读取 `pi-course` 的目标 commit；陪练不得给完整代码或跨越提示等级。

**Step 2: 创建第 00 章 parent 快照**

从 `8479bd84743e8889f728acb21a62794102db0529` 导出到新的临时目录，仅加入本章聚焦测试和运行说明。

**Step 3: 运行章级红灯**

学生先复述、预测、指出第一动作，再动手并运行测试。主 agent 原样路由错误给陪练；陪练一次只返回一个动作。

**Step 4: 判责并修复**

如果达到失败条件，先把证据写入 regression，再补教材、作者契约或陪练协议。禁止把答案直接塞进正文来换取通过。

**Step 5: 从同一 parent 复测**

建立新的第 00 章目录，重复相同任务。Expected: 原失败不再复现、聚焦测试通过、学生能解释本章不变量。

**Step 6: 提交**

Commit: `docs: close chapter 00 learning regressions`

### Task 3: 顺序模拟第 01–05 章

**Files:**
- Modify: `content/chapters/01-typescript-survival.md` through `05-provider-adapter.md`
- Modify: `docs/usability/learning-simulation.md`
- Modify: `docs/usability/regressions.json`
- Modify when warranted: `scripts/validate-learning-contract.mjs`

对每章重复 Task 2 的快照、首次行为、提示阶梯、失败记录、修复和同 parent 复测。每次修改后立即运行：

Run: `npm run learning:verify && npm run content:build`

Expected: PASS；被修复章的行为性复测也 PASS。

Commit: `docs: close foundation learning regressions`

### Task 4: 顺序模拟第 06–08 章

**Files:**
- Modify: `content/chapters/06-tool-contract.md` through `08-coding-tools.md`
- Modify: `docs/usability/learning-simulation.md`
- Modify: `docs/usability/regressions.json`

重点观察 schema 验证、工具失败配对、并发顺序和文件系统边界是否能从现象推导，而非靠术语记忆。重复同 parent 复测。

Commit: `docs: close core-loop learning regressions`

### Task 5: 顺序模拟第 09–11 章

**Files:**
- Modify: `content/chapters/09-stateful-agent.md` through `11-context-compaction.md`
- Modify: `docs/usability/learning-simulation.md`
- Modify: `docs/usability/regressions.json`

重点观察学生能否区分运行状态、append-only history 与派生 context，并能从首次失败定位错误层。重复同 parent 复测。

Commit: `docs: close state learning regressions`

### Task 6: 顺序模拟第 12–14 章

**Files:**
- Modify: `content/chapters/12-resources-extensions.md` through `14-eval-capstone.md`
- Modify: `docs/usability/learning-simulation.md`
- Modify: `docs/usability/regressions.json`

重点观察资源发现、信任边界、composition root 与故障矩阵是否形成一条可执行收束路径。重复同 parent 复测。

Commit: `docs: close product learning regressions`

### Task 7: 完成审计、合并与发布

**Files:**
- Modify: `docs/authoring-guide.md`
- Modify: `README.md`

**Step 1: 检查所有 regression**

Run: `npm run learning:verify`

Expected: 15 章都有一次初测记录；每个 defect 都有失败证据、修复、同 parent 复测和 `resolved` 状态。

**Step 2: 运行全量门禁**

Run: `npm run content:build`

Run: `npm run typecheck`

Run: `npm run lint`

Run: `npm run history:verify`

Run: `npm test`

Expected: 全部通过。

**Step 3: 检查三个工作树**

教材迭代 worktree、原 `pi/main`、教学分支均无未提交修改；教学分支仍恰好包含 15 个 checkpoint。

**Step 4: 合并并发布**

将 `iterate/learner-usability` fast-forward 到教材 `main`，推送精确源码，保存并部署新的私有生产版本。

**Step 5: 最终验收**

确认生产部署成功，报告学习模拟中发现了什么、怎样修复、复测证据与教材地址。
