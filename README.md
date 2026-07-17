# 造一个 Pi · 可执行 Agent 工程教材

一套原创中文 HTML 教材：沿 15 个 checkpoint，从离线轨迹开始，逐步实现
TypeScript 消息协议、流式模型、provider adapter、工具、Agent Loop、会话树、
context compaction、资源扩展、产品入口与确定性 eval。

学习体验借鉴 Dive into Deep Learning 的短反馈回路，但组织单位不是 notebook，
而是“教材章节 + 真实 commit + 聚焦测试 + 故障实验”。

## 目录边界

本项目只写入新建的 `pi-textbook/`。原有 `curriculum/`、`practice/` 和 `pi/`
工作目录内容均未修改。

Pi 仓库中的教学历史使用独立 worktree：

- 分支：`course/build-your-own-pi`
- worktree：`../pi-course-history`
- 包：`packages/pi-course`
- 起点：上游固定提交 `8479bd84`
- 历史：`course(00)` ～ `course(14)`，每章一个可运行 commit

## 本地阅读

```bash
npm install
npm run dev
```

默认页面：

- `/`：课程总览
- `/learn/prologue`：从序章开始
- `/map`：能力与不变量地图
- `/about`：章节组织与陪学方法
- `/glossary`：术语表

## 验证教材与代码

```bash
npm run content:build
npm run typecheck
npm run workshop:verify
npm run build
npm run history:verify
```

`history:verify` 会检查页面记录的 15 个 commit、parent、subject 和聚焦测试都
真实存在于相邻的 Pi 仓库。网站构建不依赖该本地仓库，所以部署环境只需执行
普通 `npm run build`。

## 和陪学 Agent 一起学习

在教学 worktree 中：

```bash
cd ../pi-course-history
npm install
npm run checkpoint -w @pi/course -- 05
```

把输出、本章网页与
`packages/pi-course/LEARN_WITH_AGENT.md` 一起交给旁边的 Agent。Agent 应先
比较目标 commit 与 parent，再一次只给一个动作；提示按
“定位文件 → 指出签名 → 伪代码 → 局部代码”逐级增加。

迁移练习是完成一次引导重建后的可选挑战，不是第一次学习的放行条件。

## 内容与实现

- `content/chapters/`：15 章教材源文件
- `scripts/build-content.mjs`：frontmatter、固定章节结构、directive、
  上游路径与内部链接验证器
- `lib/generated-course.ts`：生成的页面数据与搜索索引
- `workshop/`：网站正文所对应的最终参考实现
- `docs/research/`：D2L 组织研究与第一性原理分析
- `docs/plans/`：实现计划

正文与示例代码独立编写；上游源码对照固定在明确 commit，并区分相同行为、
教学简化和课程主动强化。
