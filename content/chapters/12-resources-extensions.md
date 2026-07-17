---
id: "12"
slug: resources-extensions
part: product
partTitle: 第四部 · 从核心到产品
chapter: "12"
title: Resources、Skills 与 Extensions
summary: 用渐进式披露加载知识资源，并把可执行扩展放在明确的信任边界之后。
minutes: 110
difficulty: 进阶
artifact: packages/pi-course/src/resources.ts
prerequisites: 06,11
terms: resource, prompt template, skill, extension, progressive disclosure, trust boundary
upstream: packages/coding-agent/src/core/resource-loader.ts
---

# Resources、Skills 与 Extensions

## 你将得到什么

进入本章时，Pi 的 model、tool、session 与 context 已经闭合，但增加一种新工作流仍要改核心源码。缺口不是“再做一个万能插件”，而是先判断新能力究竟是文本、知识、环境动作，还是宿主代码。

本章只增加一种复杂性：**可发现但有权限分层的扩展面**。你将修改 `workshop/src/resources.ts`，实现 template/skill 的确定性发现和按需读取，再用受限 `ExtensionContext` 注册 tool 与 hook。最终能观察每项能力的类型、来源、启用状态、冲突和信任决定。

不能破坏的不变量是：

> Skill 是被读取并进入 context 的资源；Extension 是会执行的宿主代码。文件名相似不能抹平两者的权限差异。

在第 11 章 checkpoint 上保存当前改动。恢复本章起点时，只恢复 `workshop/src/resources.ts` 和资源测试；Agent loop、context 与 session 不应因卸载资源而改变。

:::rebuild title="Checkpoint 12 · 先发现元数据，不执行代码"
**模式：** 重建。从 11 的 target 开始，先把资源发现和执行权限分开。

**起终点：** parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。

**教学文件：** `packages/pi-course/src/resources.ts`

**第一步：** 先不看 target diff，只实现 `discoverResources` 的确定性 metadata 列表与冲突诊断；确认没有读取 skill 正文、没有 import extension 后，再做 activation 与 trust gate。

**聚焦测试：** `packages/pi-course/test/12-resources-extensions.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 12`

**练习目录：** `npm run practice -w @pi/course -- 12`

**聚焦运行：** `npm run build -w @pi/course`，然后 `node --test packages/pi-course/dist/test/12-*.test.js`

**通过证据：** precedence、按需激活、路径逃逸、信任拒绝、hook timeout 与配对错误结果测试通过；skill 与 extension 权限没有混淆。

第一次尝试禁止查看完整答案；每加一层权限先写出它可以读取或执行什么，不能用一个万能 loader 合并。
:::

## 先建立全景

“扩展 Pi”至少有四种不同需求：

| 原语 | 输入变成什么 | 何时生效 | 获得的权限 |
|---|---|---|---|
| Prompt template | 一条 canonical user message | 用户显式渲染时 | 纯文本变换 |
| Skill | 说明与必要资源进入 context | 发现后按需读取 | 提示影响；动作仍经 tool |
| Tool | 结构化环境动作 | 模型发出合法 call 时 | 由该 tool 的实现决定 |
| Extension | tool、hook 等注册项 | 模块加载/激活时 | Node 进程的宿主权限 |

同一个“代码审查”需求可能同时用三种原语：template 收集审查目标，skill 说明审查步骤，tool 读取 diff。只有确实需要监听生命周期或注册新动作时，才引入 extension。

选择时可以问两个问题。第一，模型只是缺少知识，还是环境真的需要新增动作？前者优先 skill，后者才是 tool。第二，这个能力是否必须观察运行生命周期？若否，就没有理由让它成为可执行 extension。原语越强，测试面、冲突面和信任成本越大；“以后可能用到”不是提前授予权限的理由。

:::predict title="Markdown 就一定安全吗"
项目里的 `SKILL.md` 写着“运行 scripts/review.sh”，资源加载器读取它时是否已经执行脚本？它和加载一个 `.ts` extension 风险相同吗？
---answer
读取 skill 不会自动执行脚本；正文只是进入模型上下文。不过它会影响模型，模型随后可能通过 bash tool 执行指令，所以它仍是需要展示来源的非可信提示。Extension 在 import 和 factory 阶段就能运行宿主代码，风险更高，必须在 import 之前完成信任判断。
:::

## Resource 是带来源的数据

不要让 loader 返回匿名字符串。后续的冲突诊断、信任提示和 context 归因都依赖来源元数据：

```ts
export type Resource =
  | {
      kind: "template";
      name: string;
      source: string;
      body: string;
    }
  | {
      kind: "skill";
      name: string;
      description: string;
      source: string;
      root: string;
      body?: string;
    };

export interface ResourceCatalog {
  resources: Resource[];
  diagnostics: Array<{ level: "warning" | "error"; message: string }>;
}
```

发现 skill 时先读取很短的 name、description 和 source；只有显式激活才读取完整正文。这叫渐进式披露：把“有哪些能力”常驻 context，把“如何执行某能力”延迟到真正需要时。

```text
startup context:
  code-review — 检查 diff、测试与风险（project/.pi/skills/code-review）

after activateSkill("code-review"):
  + SKILL.md 正文
  + 被明确引用的 references/checklist.md
```

Template 更简单：它是参数到字符串的纯变换。缺变量、重名、转义规则必须明确，渲染结果只能成为 user message，不能偷偷调用 Agent 或读任意文件。

:::mechanism title="来源是资源协议的一部分"
至少记录 `kind/name/source/scope`。同名冲突不要静默“最后一个赢”；先产生诊断，再按一条公开、可测试的 precedence 决定。这样 `/resources` 才能回答“加载了什么、从哪里来、为什么胜出”。
:::

:::lab title="实践 12.1 · 实现确定性资源目录"
**目标：** 发现 template 与 skill，但只在激活 skill 后读取完整正文。

**文件：** `workshop/src/resources.ts`、`workshop/test/context-resources.test.ts`、测试临时目录

**动作：**
1. 实现 `discoverResources(roots)`，按规范化 source path 排序。
2. 解析 template 名称和 skill 的 name/description；缺 description 的 skill 返回诊断。
3. 同名时保留第一个确定候选并报告所有冲突来源。
4. 实现 `activateSkill(catalog, name)`，返回正文、来源和诊断，不直接修改 Agent。

**运行：** `npm run workshop:test -- resources`

**预期：** 未激活时 catalog 不含 skill 正文；改变文件系统枚举顺序不会改变结果；重复名称有稳定 warning。
:::

## Skill 的资源根不能变成任意文件入口

Skill 可以引用同目录的脚本、资料和资产，但 `../../.env` 不应因“相对路径”而被当作合法资源。课程版把可读取路径限制在 skill 的 canonical root：

```ts
function resolveSkillResource(root: string, request: string): string {
  const candidate = realpathSync(resolve(root, request));
  const canonicalRoot = realpathSync(root);
  if (candidate !== canonicalRoot &&
      !candidate.startsWith(canonicalRoot + sep)) {
    throw new Error("skill_resource_outside_root");
  }
  return candidate;
}
```

检查必须基于 canonical path，避免 `..` 和符号链接逃逸。这是**课程主动强化**：当前上游 Pi 的 coding tools 本身没有 cwd jail；不能据此宣称 Pi 已提供完整文件沙箱。即使资源路径被限制，skill 仍可能劝模型调用更强的 bash tool，所以来源和用户信任仍不可省略。

路径安全也不等于内容安全。Skill 的职责本来就是影响模型行为，因此不能靠“过滤危险句子”把 prompt injection 变成已解决问题。更可靠的控制在动作边界：展示来源、只激活与任务相关的 skill、保持 tool 参数验证，并让高风险动作经过独立策略。资源诊断应保留哪份说明进入了哪一轮 context，事故发生后才能区分模型自行判断、skill 指令与 extension hook。

:::lab title="实践 12.2 · 让 skill 激活可追踪、不可逃逸"
**目标：** 读取合法配套资源，同时拒绝目录外路径。

**文件：** `workshop/src/resources.ts`、`workshop/test/context-resources.test.ts`

**动作：**
1. 对 root 与目标执行 realpath 后再比较边界。
2. 测试普通相对路径、`..`、绝对路径和指向目录外的 symlink。
3. 让激活结果列出本轮实际读取的 source，而不是只返回拼接文本。
4. 把读取失败转换为资源诊断，不伪装成 model error。

**运行：** `npm run workshop:test -- resources`

**预期：** 合法 reference 可读；三种逃逸均在 resource 层失败；没有 tool call 或 session message 被凭空制造。
:::

## Extension 先过信任门，再执行工厂

受限 context 的首要价值是降低耦合：extension 只能注册公开能力，不能拿到可随意修改的 Agent 私有对象。但它不是安全沙箱——一个已 import 的 Node 模块仍可自行导入 `node:fs`。真正的安全边界是：**未信任前不 import**。

```ts
export async function loadExtension(
  source: ExtensionSource,
  deps: {
    isTrusted(source: ExtensionSource): boolean;
    importModule(path: string): Promise<{ default: ExtensionFactory }>;
    context: ExtensionContext;
  },
): Promise<ExtensionDiagnostic> {
  if (!deps.isTrusted(source)) {
    return { source: source.path, status: "skipped_untrusted" };
  }
  const module = await deps.importModule(source.path);
  await module.default(Object.freeze(deps.context));
  return { source: source.path, status: "active" };
}
```

测试时注入 `importModule` spy，证明拒绝状态下调用次数为零。Hook 也要有窄语义：例如 `beforeToolCall` 只能 allow/deny。若 deny 或 hook 抛错，核心 executor 仍负责生成与 call id 配对的结构化 `toolResult`；extension 不能直接伪造 transcript。

多个 hook 还需要确定顺序、超时和失败策略。课程版按注册顺序串行执行 `beforeToolCall`：第一个 deny 立即停止后续策略，审计信息记录做出决定的 extension id；观察型 `afterToolResult` 即使失败也不能把已经发生的工具结果改写为成功。若未来允许 hook 变换输入，必须为“谁看到前一变换、谁拥有最终值”建立新协议，不能靠数组顺序的偶然行为。

:::pi title="Pi 8479bd84743e 的资源与执行边界"
当前 coding-agent 的 `DefaultResourceLoader` 统一发现 skills、prompts、themes、context files 与 extensions；项目级动态资源在 project trust 之后加载。Skill 只把名称/描述放进 system prompt，完整 `SKILL.md` 由 read 或 `/skill:name` 按需取得。Extension 则经 jiti 导入 TypeScript，拥有完整系统权限，并可注册 tool、command 与大量生命周期 hook。通用 `AgentHarness` 另有 skills/promptTemplates 与 hook 面；生产 CLI 仍走 `Agent + AgentSession + SessionManager` 及 coding-agent 的 extension runner，两条方向处于并存状态。上游工具 schema 使用当前 `typebox` 包。
:::

## 故意把它弄坏

:::failure title="失败注入 · 先 import，再询问信任"
交换 `loadExtension` 中两步的顺序，让测试模块在顶层把 `executed = true`，然后令 `isTrusted` 返回 false。

```text
expected: { status: "skipped_untrusted", imported: false }
observed: { status: "skipped_untrusted", imported: true }
first divergence: extension import
violated invariant: 未信任代码不得执行
```

错误不在 `ExtensionContext` 是否足够窄；顶层副作用发生在 factory 收到 context 之前。把信任判断移回 import 前，并保留一条测试锁住这个顺序。
:::

## 本章验收

```bash
npm run workshop:test -- resources
npm run workshop:test -- tool
npm run workshop:test -- agent-loop
```

增加并禁用一个 extension 后，tool 与 loop 的既有测试应完全不变。你还要展示一次 `/resources` 等价诊断：类型、名称、来源、状态、冲突与 trust decision 都可解释。

:::checkpoint title="Checkpoint 12 · 知识可发现，代码有信任门"
**完成状态：** template/skill 作为带来源数据加载；extension 仅在信任后 import，并通过公开 context 注册能力。

**观察证据：** 未激活 skill 不占完整 context；未信任 extension 的 import spy 为零；卸载全部资源后核心回归仍通过。

**恢复：** 从本章开始前的提交恢复 `workshop/src/resources.ts` 和资源测试。恢复后 Pi 核心仍能运行，只是不再发现 template、skill 和 extension。
:::

## 可选迁移练习

:::transfer title="原语选择 · 把一个模糊需求拆对"
需求是“每次准备提交时按团队清单审查 diff，并阻止提交密钥”。不提供 starter：自行决定哪些部分属于 template、skill、tool、extension，写出每项进入 context 的时机和权限。实现最小版本，并证明删除 extension 后审查知识仍可读、删除 skill 后密钥阻止策略仍按你的设计可解释。
:::

过两章再做一次无提示检索：面对“查询内部 API 并自动修复代码”，先画出知识与动作边界，再选原语。能拒绝“全部做成 tool/extension”的便利诱惑，才说明你掌握了分层。

## 小结

- Template 是纯文本变换，skill 是按需读取的知识资源，tool 是结构化动作，extension 是宿主代码。
- 渐进式披露降低常驻 context 成本，但提示资源仍需来源与信任信息。
- 课程限制 skill 资源根是主动强化，不代表上游 coding tools 自带 cwd jail。
- 受限 `ExtensionContext` 降低耦合，不构成 Node 沙箱；信任判断必须发生在 import 之前。
- 当前 Pi 的 coding-agent 生产扩展系统与通用 `AgentHarness` 方向并存，教材对齐权限和生命周期边界。
