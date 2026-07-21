---
id: "12"
slug: resources-extensions
part: product
partTitle: 第四部 · 从核心到产品
chapter: "12"
title: 知识按需进入上下文，代码先过信任门
summary: 把项目说明、Skill 和模板接入同一个上下文入口，再用信任检查、原子注册与故障隔离控制可执行扩展。
minutes: 150
difficulty: 核心
artifact: packages/pi-course/src/resources.ts
prerequisites: 06,11
terms: resource catalog, skill activation, prompt template, extension host, trust gate, hook
upstream: packages/coding-agent/src/core/resource-loader.ts
---

## 你将得到什么

第 11 章已经能从活动历史中构造一份有预算的模型上下文。可模型此时只知道聊天记录，
还不知道当前项目的规则、可用 Skill 和任务模板。你当然可以把这些内容全部塞进 system
prompt，但这样做很快会碰到两个问题：

- 没用到的 Skill 正文也会占窗口；
- 一个看起来像“扩展”的文件，可能在进入上下文之前就已经执行了宿主代码。

这两个问题不能交给同一个万能 loader 解决。文本进入模型，改变的是模型能看到的
数据；Extension 被 import，获得的是 Node 进程里的执行机会。二者的权限后果完全不同。

本章只建立这两条边界：

```text
数据路径
  resource roots
    → catalog
    → 显式 activateSkill
    → formatResourceContext
    → Chapter 11 buildContext({ systemPrompt })

执行路径
  extension source
    → isTrusted
    → importModule
    → staging factory
    → commit tools/hooks
    → wrapExecutor(coreExecutor)
```

完成后，你会得到：

- `discoverResources()`：按调用者给出的 root 顺序解决冲突，输出稳定目录；
- `activateSkill()`：显式取得 Skill 正文和指定附加文件，同时挡住三种路径逃逸；
- `renderTemplate()`：用唯一的 `{{name}}` 协议生成 canonical user message；
- `formatResourceContext()`：只生成一个 system prompt 字符串，交给第 11 章统一预算；
- `loadExtension()`：在 import 之前完成信任判断，并把 factory 注册变成一次原子提交；
- `createExtensionHost()`：把前置策略、核心工具和后置观察串成有明确失败语义的执行器。

本章的总原则很短：

> 数据权限和执行权限分开授予。需要多少数据，就显式放进多少上下文；准备执行代码，
> 先完成信任判断。

## 为什么第 12 章放在这里

Resource 不能早于 canonical message。模板最终要生成 `UserMessage`，Skill 最终要影响
模型输入；没有第 03 章的消息协议，它们只能返回散乱字符串。

它也不能早于第 11 章。项目说明和 Skill 正文会占用上下文窗口。如果每种资源自行把
文字塞进 messages，预算算法就看不到完整输入，也无法稳定复现一次裁剪。第 11 章已经
固定唯一入口：`buildContext()` 同时接收活动路径和 `systemPrompt`。本章只负责生成
那个字符串。

Extension 又依赖第 06 章的 `ToolRegistry` 与 `ToolExecutor`。它可以注册新工具，也
可以在工具调用前后挂 hook，但不应直接改 Agent loop。第 13 章会负责把这些已经独立
验证的部件装成 Runtime。

```text
第 03 章：模板最终落成什么消息
第 06 章：工具如何注册和执行
第 11 章：资源文字从哪个入口占用预算
        ↓
第 12 章：发现数据、激活知识、受控加载代码
        ↓
第 13 章：组装成一个可恢复的 Runtime
```

这个顺序能把故障定位在第一次偏差上。Skill 正文缺失，先查资源路径；工具没有运行，
再查 extension policy；历史恢复或预算出错，仍回到第 10、11 章。

## 开始动手

在教学历史仓库中生成隔离练习。不要在教材目录或原始 `pi` 仓库里改：

```bash
cd <你的工作区>/pi-course
npm run checkpoint -w @pi/course -- 12
npm run practice -w @pi/course -- 12 <新目录>
cd <新目录>
npm install
```

生成器会保留第 11 章的实现，加入本章 12 项公开测试，并把无答案脚手架覆盖到：

```text
packages/pi-course/src/resources.ts
```

本章只修改这个文件。先确认脚手架能编译：

```bash
npm run build -w @pi/course
```

接着只运行 Lab 12.1：

```bash
node --test --test-name-pattern="Lab 12.1" \
  packages/pi-course/dist/test/12-*.test.js
```

正确的起点是 `0/2`，两项失败都应指向：

```text
Lab 12.1 resource catalog 尚未实现
```

如果 build 已经失败，或错误来自别的 Lab，先停下来检查练习目录和 starter，不要在
错误脚手架上补类型。一个能编译、只在当前施工位变红的起点，才有资格继续。

:::rebuild title="Checkpoint 12 · 分五步建立资源与扩展边界"
**模式：** 重建。从第 11 章 target 开始，只增加 `resources.ts`。

**起终点：** `parent` `5fb517c2012d8e6227c0e17ee65e530e18ac13e6` 是起点；`target` `03541892bcd533444af599d1813401f79807de3c` 是终点。

**教学文件：** `packages/pi-course/src/resources.ts`

**学习脚手架：** `starters/12-resources.ts` 已固定所有公共类型和六个导出函数。每个
函数只在所属 Lab 抛出明确异常，没有隐藏的参考算法。

**动手前只需知道：** Resource 是可发现、可读取的数据；Extension 是导入后会运行的
代码。前者要守住路径和正文暴露范围，后者要先判断信任，再暂存注册结果。

**第一步：** 实现资源目录发现。按调用者给出的 root 顺序处理冲突，只读取本章允许的
资源文件，并先让 Lab 12.1 通过。

**第一次红灯：** starter 可以通过 build；首次只运行 Lab 12.1 时，两项都应显示
`Lab 12.1 resource catalog 尚未实现`。

**聚焦测试：** `packages/pi-course/test/12-resources-extensions.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 12`

**练习目录：** `npm run practice -w @pi/course -- 12`

**聚焦运行：** `npm run build -w @pi/course`，然后运行
`node --test packages/pi-course/dist/test/12-*.test.js`。

**施工顺序：** 资源目录 `2/2` → Skill 激活 `3/3` → 模板与上下文 `2/2` →
信任和原子注册 `2/2` → hook 故障隔离 `3/3`。

**陪练方式：** 先让陪练问你的预测，再只讨论当前 Lab。提示顺序固定为：定位函数、
复述签名、给控制流、最后才对照 target 中这一小段。不要让陪练把整个
`resources.ts` 抄进练习目录。

**通过证据：** fresh starter build 为绿；首红准确；五段分别通过；故障实验能稳定
复现并恢复；最后 12 项公开测试全绿。

第一次尝试先不看 target diff。陪练只检查当前 Lab 的签名、控制流和第一处偏差。
:::

## 先建立全景

同一个“代码审查”需求，可以拆成四种原语：

| 原语 | 进入系统的形状 | 何时生效 | 它能直接做什么 |
|---|---|---|---|
| Instructions | system prompt 文字 | catalog 被格式化时 | 影响模型判断 |
| Prompt template | `UserMessage` | 用户显式渲染时 | 生成一条用户输入 |
| Skill | metadata；激活后再加正文与文件 | 调用 `activateSkill()` 时 | 给模型补充做事方法 |
| Extension | tool 与 hook | 信任、import、factory 成功后 | 在宿主进程中参与执行 |

前三项沿数据路径前进。它们可能影响模型，但不会因为被 catalog 发现就自动执行脚本。
Extension 沿执行路径前进。Node 模块的顶层代码在 import 时就可能运行，所以“先
import，再看看是否可信”已经太晚。

Tool 位于二者之间：它的 schema 和描述可以进入模型可见的动作空间；真正的环境动作
只有在模型发出合法 call、执行器接受后才发生。Extension 可以注册 Tool，却不能因此
绕开第 06 章的参数验证和结构化结果协议。

调试时先问一句：眼前缺的是数据，还是执行机会？这个判断会决定你应该查 catalog、
context，还是 trust gate、registry 和 hook。

:::predict title="发现一个 Skill 时，正文该不该马上进入 context"
目录里有 80 个 Skill，本轮只用到 `review`。Catalog 应该保留哪些信息？另外 79 个
Skill 的正文应不应该出现在 `formatResourceContext()` 的结果里？
---answer
Catalog 保留所有 Skill 的 `name`、`description`、canonical `source` 和 `root`，
让模型和调用者知道有哪些能力。只有显式激活的 Skill 才携带正文和指定附加文件；
其余 Skill 的正文不出现在 catalog，也不进入 system prompt。
:::

:::pi title="课程边界 · 这里验证的是可执行契约"
本章 target 把 Resource 与 Extension 压缩成六个公开函数，目的是让权限顺序可以被
12 项黑盒测试完整观察。它不是对原始 Pi 生产加载器的逐行复刻。尤其不要把 Skill
root containment 说成操作系统沙箱，也不要把 hook timeout 说成可以杀死任意扩展
任务。后面判断课程是否完成，只看这里公开的输入、输出和故障语义。
:::

## 第一步：目录的冲突规则由调用者决定

`discoverResources(roots)` 接受一串 root。数组顺序本身就是 precedence：

```ts
await discoverResources([projectRoot, userRoot]);
```

这里表示项目 root 优先。若两个 root 都声明 `skill:review`，第一个 root 的候选获胜。
把参数反过来，胜出者也应反过来。绝对路径的字母顺序、目录创建时间和 `readdir()`
返回顺序都没有决定权。

资源的逻辑身份是：

```text
kind + name
```

因此 `skill:review` 和 `template:review` 可以同时存在；两个 `skill:review` 才冲突。
同一 root 内若出现两个相同身份，调用者没有给出更细的优先级，直接报错比暗中挑一个
更可靠。不同 root 冲突则按输入顺序取第一次出现的候选。

最终 catalog 还要稳定输出。先按 kind 排 `instructions → skill → template`，同 kind
再按逻辑 `name` 排序。这个排序只为了让相同输入得到相同结果，不参与胜出者选择：

```text
逐 root 发现候选
  → 用 kind+name 选 first winner
  → 收集 winners
  → 按 kind、name 稳定排序
  → 派生 instructions / skills / templates 三个视图
  → 返回深副本
```

Skill 的发现有一道容易说错的边界。实现会读取 `SKILL.md` 的 frontmatter 区域以取得
`name` 和 `description`，然后丢弃正文；公开契约保证正文不保留在 catalog，也不进入
context。这里不要声称“discovery 连正文的一个字节都不会碰”，因为底层是定长前缀
读取。真正可验证的权限事实是：inactive Skill 正文不会成为运行时资源数据。

Template 与 instructions 不走这条延迟路径。模板正文要供显式渲染，`AGENTS.md` 要供
system prompt 使用，所以它们的 body 可以出现在 catalog。

:::lab title="实践 12.1 · 实现 discoverResources"

**只实现：**

- `discoverResources()`；
- 它直接需要的 frontmatter、目录读取、逻辑身份和稳定排序 helper。

不要碰 `activateSkill()`，也不要提前写 Extension。

**先预测：**

1. `[project, user]` 与 `[user, project]` 的 `skill:review` winner 是否相同？
2. 物理目录叫 `z-physical-directory`，frontmatter 的 name 是 `alpha`，最终按哪个
   名字排序？
3. 对 catalog 做 `JSON.stringify()`，inactive Skill 正文应不应该出现？

**不变量：**

```text
winner = roots 输入顺序中第一个 kind+name 候选
stable order = kind order + logical name
inactive skill body ∉ catalog
```

**最小控制流：**

```text
discoverResources(roots)
  winners = Map()
  for (root, rootOrder) in roots:
    canonicalRoot = realpath(root)
    candidates = discoverRoot(canonicalRoot)
    拒绝当前 root 内重复 kind+name
    for candidate in candidates:
      if winners 没有 key:
        winners.set(key, candidate)

  resources = sort(winners.values, kind 再 name)
  return structuredClone({
    resources,
    instructions: kind === "instructions",
    skills: kind === "skill",
    templates: kind === "template"
  })
```

`AGENTS.md` 缺失、`skills/` 缺失和 `templates/` 缺失都表示“这个 root 没有该类
资源”，不应报错。其他 I/O 错误继续抛出，别把权限错误也吞成空目录。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 12.1" \
  packages/pi-course/dist/test/12-*.test.js
```

**通过后记录：**

```text
project first: instructions:AGENTS, skill:review, template:prompt
user first:    相同逻辑身份，body/description 来自 user
inactive marker in JSON catalog: false
Lab 12.1: 2/2
```

**常见误区：**

- 先把所有候选按 `source` 排序，再取第一个。这会让机器路径替调用者决定权限；
- 用 name 当唯一 key，导致同名 template 把 skill 覆盖；
- 为了“稳定”把 roots 自己排序，直接破坏 precedence；
- 把完整 `SKILL.md` 解析结果放进 catalog，再指望下游记得删正文；
- 捕获所有文件错误并返回空数组，让损坏文件看起来像不存在。
:::

## 第二步：路径边界要检查两次

激活 Skill 后，调用者可以请求附加文件：

```ts
await activateSkill(catalog, "review", {
  resources: ["references/checklist.md"],
});
```

这个字符串同时面对两类逃逸。

第一类是词法逃逸。`../../outside.md` 或绝对路径在解析字符串时就已经跑出 Skill
root。第二类是文件系统逃逸：`references/escape.md` 看起来还在 root 内，实际可能是
指向外部文件的 symlink。

所以 containment 必须检查两次：

```text
request
  → 拒绝空串和绝对路径
  → path.resolve(skillRoot, request)
  → 检查 lexical candidate 位于 root 内
  → realpath(candidate)
  → 再检查 canonical source 位于 root 内
```

判断“位于 root 内”不能只写 `candidate.startsWith(root)`。`/work/skill-old` 也以
`/work/skill` 开头。用 `path.relative(root, candidate)`，只接受空相对路径或不以
`..` 开始、且不是绝对路径的结果。

`activateSkill()` 还要守住目录与激活之间的身份变化。它重新读取完整 `SKILL.md` 后，
frontmatter 的 name 必须仍等于 catalog 中的 name。成功结果返回 canonical
`source`、canonical `root`、正文和每个附加文件的 `request/source/content`，而且
不修改输入 catalog。

:::lab title="实践 12.2 · 实现 activateSkill"

**只实现：**

- `activateSkill()`；
- `resolveInsideSkill()` 和 containment helper。

保留 Lab 12.1 已通过的实现，不改测试 fixture。

**先预测：**

1. 同一个附加文件请求两次，结果应读出两份还是按 request 去重？
2. `path.resolve()` 后仍在 root 内的 symlink，为什么还要 `realpath()`？
3. 修改返回的 `activated.body`，原 catalog 是否允许一起变化？

**不变量：**

```text
activation 明确指定 Skill 名称
lexical candidate ⊆ canonical skill root
realpath(candidate) ⊆ canonical skill root
activated result 与 catalog 不共享可变引用
```

**最小控制流：**

```text
activateSkill(catalog, name, options)
  skill = catalog.skills.find(name)
  找不到则失败

  source = realpath(skill.source)
  检查 source 在 skill.root 内
  parsed = 读取并解析完整 SKILL.md
  检查 parsed.name 仍等于 skill.name

  resources = []
  seenRequests = Set()
  for request in options.resources:
    重复 request 跳过
    resourceSource = resolveInsideSkill(skill.root, request)
    resources.push({ request, source: resourceSource, content: readFile(...) })

  return structuredClone({ ...skill, source, body, resources })
```

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 12.2" \
  packages/pi-course/dist/test/12-*.test.js
```

**通过后记录：**

```text
canonical SKILL.md source: <实际路径>
safe reference: accepted
../../outside.md: rejected
absolute path: rejected
symlink outside root: rejected
Lab 12.2: 3/3
```

**常见误区：**

- 只检查 `..` 字符串；symlink 完全不需要 `..`；
- 只做 `realpath()`，没有先拒绝绝对路径和词法逃逸；
- 用字符串前缀判断 containment；
- 激活时相信旧 metadata，不检查 Skill name 是否变化；
- 直接在 catalog 的 Skill 对象上补 `body`，使 inactive/active 边界永久消失。
:::

这道边界只限制 Resource loader 能读取哪些 Skill 文件。它不构成操作系统沙箱，也不能
限制一个已获准运行的 Tool 或 Extension 自己访问文件。

## 第三步：资源只从一个入口进入模型上下文

模板协议刻意只保留一条规则：

```text
{{name}}
```

`name` 由字母或下划线开头，后面可以有字母、数字和下划线。相同模板变量出现多次时，
每处都替换；缺少参数立即报错；多余参数被忽略。渲染结果会包装成一条 canonical
`UserMessage`：

```ts
{
  role: "user",
  content: [text(rendered)],
  timestamp: Date.now()
}
```

模板不读取文件、不调用 Agent，也不自己写 session。它只完成“参数 → 用户消息”。

`formatResourceContext()` 走另一条路。它生成唯一的 system prompt 字符串，内容包括：

- instructions 正文；
- 所有可用 Skill 的 name 与 description；
- 已激活 Skill 的正文；
- 已显式读取的 Skill 附加文件。

Inactive Skill 的 metadata 会出现，正文不会出现。函数还要拒绝重复激活，以及不属于
当前 catalog 的 ActivatedSkill。最后把字符串交给第 11 章：

```ts
const systemPrompt = formatResourceContext(catalog, activatedSkills);
const projection = buildContext(activePath, {
  maxTokens,
  systemPrompt,
  reservedOutput,
  safetyMargin,
  estimateTokens,
});
```

这里没有第二套预算器，也没有“resources messages”旁路。第 11 章负责把 system prompt
计入本次总预算。

:::lab title="实践 12.3 · 实现模板与资源上下文"

**只实现：**

- `renderTemplate()`；
- `formatResourceContext()`；
- 两者直接需要的字符串格式 helper。

**先预测：**

1. `Review {{target}} and {{target}}` 只给一个 `target` 时，两处是否都替换？
2. 参数里多一个 `ignored`，应报错还是忽略？
3. `inactive` 的 description 与 body，哪一个进入 system prompt？
4. `formatResourceContext()` 应该直接调用 `buildContext()` 吗？

**不变量：**

```text
template output = one canonical user message
resource output = one system prompt string
inactive body ∉ system prompt
buildContext 是唯一预算入口
```

**最小控制流：**

```text
renderTemplate(template, args)
  rendered = template.body.replace(PLACEHOLDER, key => {
    args 没有 own property key 时失败
    return args[key]
  })
  return user message

formatResourceContext(catalog, activatedSkills)
  lines 加入 instructions
  lines 加入全部 skill metadata
  验证 activatedSkills 不重复且属于 catalog
  按 name 稳定排列 activated skills
  lines 加入 active body 与显式资源文件
  return lines.join("\n\n")
```

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 12.3" \
  packages/pi-course/dist/test/12-*.test.js
```

**通过后记录：**

```text
rendered role: user
missing owner: rejected
active marker in systemPrompt: true
inactive description in systemPrompt: true
inactive body in systemPrompt: false
projection.systemPrompt === resource systemPrompt: true
Lab 12.3: 2/2
```

**常见误区：**

- 支持第二种模板变量语法，结果同一模板出现两套缺参规则；
- 返回字符串后让调用者自行伪造 user message；
- 把 Skill metadata 也藏到激活之后，模型根本不知道有哪些能力；
- 把所有 Skill 正文一起拼进去；
- 在 `formatResourceContext()` 里再次裁剪 token，和第 11 章产生两套事实。
:::

## 第四步：Extension 的原子性从 staging 开始

受限的 `ExtensionContext` 只有两个入口：

```ts
interface ExtensionContext {
  registerTool(tool): void;
  on("beforeToolCall" | "afterToolResult", listener): void;
}
```

公开的 `ExtensionHost` 也只有 `wrapExecutor()`。`stage()` 是 loader 与 host
实现之间的内部通道，不能为了方便直接加进公共接口。课程 target 用一个私有实现类把
这条通道接起来：

```ts
interface StagedRegistration {
  context: ExtensionContext;
  commit(): void;
}

class ExtensionHostImpl implements ExtensionHost {
  stage(extensionId: string): StagedRegistration {
    // 这里只创建局部 tool/hook 数组，暂不修改真实 Registry。
  }

  wrapExecutor(core: ToolExecutor): ToolExecutor {
    // Lab 12.4 先做无 hook 时的透传；Lab 12.5 再补完整策略。
  }
}

function hostImplementation(host: ExtensionHost): ExtensionHostImpl {
  if (!(host instanceof ExtensionHostImpl)) {
    throw new Error("host 不是 createExtensionHost 的结果");
  }
  return host;
}
```

于是 `createExtensionHost()` 对外仍返回窄接口，`loadExtension()` 则可以在模块内部调用
`hostImplementation(options.host).stage(source.id)`。你也可以用私有 `WeakMap` 保存
这条联系。这里真正要守住的是权限：Extension 作者不能调用 `stage()`。

这个窄接口降低了耦合，却不能把 Node 模块变成安全沙箱。模块一旦 import，顶层代码就
已经拥有宿主进程可以提供的权限。`loadExtension()` 必须按这个顺序运行：

```text
校验 source id/path
  → isTrusted(frozen source)
  → false: 返回 skipped_untrusted，到此结束
  → true: importModule(frozen source)
  → 校验 default factory
  → host.stage(extensionId)
  → await factory(stagingContext)
  → staged.commit()
  → 返回 active
```

信任检查挡住未授权代码。Staging 解决的是另一类问题：factory 运行到一半可能抛错。
如果 `registerTool()` 立刻改真实 Registry，下面这段会留下一半状态：

```ts
context.registerTool(firstTool);
throw new Error("factory exploded");
```

Staging context 先把 tool 和 hook 放在私有数组里。Factory 成功返回后，`commit()` 先
检查 extension id 和全部工具名；确认没有冲突，再一起写入真实 host。Factory 抛错、
工具重名或 extension id 重复时，Registry 和 hook 列表都保持原样。

这里的“原子”针对本章公开的注册冲突与 factory 失败：观察者看见全部注册项，或一个
也看不见。它没有提供跨进程事务，也没有卸载与回滚协议。

:::lab title="实践 12.4 · 实现信任门与 staging registration"

**只实现：**

- `createExtensionHost()` 中创建 host 和 staging registration 的部分；
- `loadExtension()`；
- default factory 的运行时检查。

Lab 12.4 的第二项测试会调用一次 `host.wrapExecutor(core)`，确认失败的 factory 没有
留下 hook。因此这一阶段还要提供最小透传实现：没有已提交 hook 时，它只调用一次
`core` 并返回结果。完整的 deny、timeout、diagnostic 和副本隔离留到 Lab 12.5。先把
“能否进入 host”做完，不要提前实现策略状态机。

**先预测：**

1. `isTrusted()` 返回 false 时，`importModule()` 的调用次数应该是多少？
2. Factory 注册 tool 和 hook 后抛错，哪一项可以留下？
3. Factory 成功，但 tool 与 Registry 现有名称冲突，先前暂存的 hook 能否生效？

**不变量：**

```text
untrusted ⇒ import count = 0
factory failure ⇒ committed tools/hooks = 0
registration conflict ⇒ committed tools/hooks = 0
active ⇒ factory 全部注册项一次可见
```

**最小控制流：**

```text
loadExtension(source, options)
  验证 id/path 非空
  if !(await isTrusted(frozenClone(source))):
    return skipped_untrusted
  imported = await importModule(frozenClone(source))
  验证 imported.default 是函数
  implementation = hostImplementation(options.host)
  staged = implementation.stage(source.id)
  await imported.default(staged.context)
  staged.commit()
  return active

stage(extensionId)
  创建局部 tools、beforeHooks、afterHooks
  context.registerTool/on 只写局部数组
  commit:
    先检查 extension id 和所有 tool 名称
    再写 registry、hook 列表和 extensionIds
```

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 12.4" \
  packages/pi-course/dist/test/12-*.test.js
```

**通过后记录：**

```text
untrusted order: trust
trusted order: trust → import
factory throws: registry unchanged
duplicate tool: registry unchanged, staged hook calls = 0
Lab 12.4: 2/2
```

**常见误区：**

- import 后才询问信任；
- Factory 每调用一次 `registerTool()` 就写真实 Registry；
- 只暂存 tool，不暂存 hook；
- 一边检查工具名一边提交，后一个重名时前一个已经留下；
- Factory 抛错后仍在 `finally` 里 commit。
:::

## 第五步：策略失败时，前置关闭；观察失败时，事实保留

Extension host 最终包住核心执行器：

```text
ToolCall
  → beforeToolCall hooks
  → coreExecutor
  → afterToolResult hooks
  → ToolResultMessage
```

前置 hook 是策略门。它的输出可能是 `allow`、`deny` 或 `void`。`deny` 要阻止 core，
并生成一条与原 call 的 `id/name` 配对的错误结果。若策略抛错或超时，host 不知道这次
动作是否安全，也按 fail-closed 处理：

```text
before deny / throw / timeout
  → core 不运行
  → 返回 paired isError toolResult
  → throw / timeout 另写 diagnostic
```

`deny` 是策略做出的正常决定，不需要 diagnostic；reason 已在结果 details 中。Throw
和 timeout 是扩展故障，既要生成错误结果，也要报告
`extensionId/hook/kind/message`。

后置 hook 只观察已经发生的事实。Core 成功或返回错误结果后，每个已注册
`afterToolResult` 恰好运行一次。某个观察者抛错或超时，只产生 diagnostic，不能把
core result 改成另一条结果，也不能让 core 重跑。

```text
after throw / timeout
  → diagnostic
  → 继续后面的 after hooks
  → 返回 core result 的深副本
```

Hook 收到的是冻结深副本，调用者拿到的结果也不与 core 原对象共享可变内容。这样，
Extension 不能通过修改 `call.arguments` 或 `result.details` 暗中改写工具事实。

Timeout 只终止 host 的等待。JavaScript 无法靠 `Promise.race()` 强制杀死一个已经开始
执行、又忽略取消的异步任务。这个限制必须写进诊断和运维判断里。

:::lab title="实践 12.5 · 实现 wrapExecutor"

**只实现：**

- hook timeout helper；
- paired blocked result；
- host 的 `before()`、`after()` 与 `wrapExecutor()`。

不要改 Agent loop，也不要让 hook 直接追加 session message。

**先预测：**

1. `before` 抛错后，core 还能不能运行？
2. `before` 超时返回的错误结果，`toolCallId` 应该取什么？
3. 第一个 `after` 抛错，第二个 `after` 还要不要运行？
4. `after` 失败后，返回值应变成 extension error，还是保留 core 的结果？

**不变量：**

```text
before unsafe ⇒ zero core calls + paired error result
core runs ⇒ exactly one core result
each after ⇒ at most once per core result
after failure ⇒ diagnostic only
hooks cannot mutate source call/result
```

**最小控制流：**

```text
wrapped(sourceCall, context)
  call = structuredClone(sourceCall)
  blocked = await before(call)
  if blocked:
    return structuredClone(blocked)

  coreResult = structuredClone(
    await coreExecutor(structuredClone(call), context)
  )
  await after(coreResult)
  return structuredClone(coreResult)

before(call)
  按注册顺序遍历
  用 timeout 包住 listener(frozenClone(call))
  deny: 返回 paired blockedResult
  throw/timeout: diagnostic + paired blockedResult
  全部 allow/void: 返回 undefined

after(result)
  按注册顺序遍历
  每个 listener 只调用一次
  throw/timeout: diagnostic，继续下一项
```

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 12.5" \
  packages/pi-course/dist/test/12-*.test.js
```

**通过后记录：**

```text
deny: coreCalls=0, same callId, isError=true
before throw: coreCalls=0, diagnostic kind=error
before timeout: coreCalls=0, diagnostic kind=timeout
after success/error/timeout: coreCalls=1, successful after=1
returned result deep-equals core fact
Lab 12.5: 3/3
```

**常见误区：**

- 把 `before` throw 当成 allow，策略挂了却继续执行高风险动作；
- 返回普通 `Error`，丢掉第 07 章要求的 tool call/result 配对；
- `after` 失败后重新执行 core；
- 第一个 `after` 失败就停止后续观察者；
- 把 coreResult 原对象直接交给 hook 和调用者；
- 以为 timeout 已经杀死扩展内部的 Promise。
:::

## 故意把它弄坏

五段通过后，做一个很小的故障实验。它只检查执行权限的第一道门，不增加新功能。

:::failure title="失败注入 · 让未信任模块偷偷 import"

在 `loadExtension()` 的 untrusted 分支里，临时加一行：

```ts
if (!trusted) {
  await options.importModule(source); // 故意制造错误
  return { id: source.id, status: "skipped_untrusted" };
}
```

先预测：返回状态看起来仍是 `skipped_untrusted`，哪条外部事实已经变了？

运行：

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 12.4" \
  packages/pi-course/dist/test/12-*.test.js
```

第一项应失败。测试记录的顺序会从：

```text
["trust"]
```

变成包含 `import`。返回值没有暴露这个漏洞，import spy 暴露了。第一次偏差发生在
Extension 模块执行之前的顺序约束。

删掉刚加的那一行，再运行 Lab 12.4 和本章全量：

```bash
node --test --test-name-pattern="Lab 12.4" \
  packages/pi-course/dist/test/12-*.test.js
node --test packages/pi-course/dist/test/12-*.test.js
```

只有恢复到 `2/2` 和 `12/12`，这个实验才算结束。不要保留“仅用于演示”的错误分支。
:::

## 读测试时，先找观察量

本章是黑盒测试。测试只通过公开函数和临时文件观察行为，不要求你的私有 helper 与
target 同名。卡住时按这张表找第一次偏差：

| 失败现象 | 先看哪个观察量 | 先回到哪条不变量 |
|---|---|---|
| 同名资源选错 | roots 数组与 winner body | precedence 来自输入顺序 |
| 顺序不稳定 | `kind:name` 列表 | 最终只按逻辑身份排序 |
| inactive 正文泄漏 | `JSON.stringify(catalog)` 或 system prompt | 未激活正文不进入运行时数据 |
| `..` 被拒绝、symlink 却通过 | canonical source | lexical 与 realpath 都要 containment |
| 模板测试失败 | message role 与 `textOf(message)` | 模板只生成 `UserMessage` |
| untrusted 仍有副作用 | import spy | trust 先于 import |
| factory 失败仍有 tool/hook | Registry 和 hook 调用数 | 成功后一次 commit |
| before 故障仍执行 core | `coreCalls` | 策略失败时 fail-closed |
| after 故障改变结果 | core result 与 returned result | 观察失败不能改写事实 |

如果陪练 Agent 直接给出一大段实现，让它停下来，只回答两件事：当前测试观察了哪个
公开事实，现有输出第一次偏离在哪里。拿到这两个答案，你再写下一小段控制流。

## 本章验收

先跑本章 12 项：

```bash
npm run build -w @pi/course
node --test packages/pi-course/dist/test/12-*.test.js
```

再跑到当前章节为止的所有课程测试：

```bash
node --test packages/pi-course/dist/test/{00,01,02,03,04,05,06,07,08,09,10,11,12}-*.test.js
```

最终记录至少包含：

```text
fresh build: pass
first red: Lab 12.1 0/2, exact scaffold error
Lab 12.1: 2/2
Lab 12.2: 3/3
Lab 12.3: 2/2
Lab 12.4: 2/2
Lab 12.5: 3/3
fault injected: Lab 12.4 fails at trust/import order
fault restored: Lab 12.4 2/2
chapter total: 12/12
through Chapter 12: all pass
```

测试结果需要判断，不能只抄一行 `pass`：

- Build 绿，说明 starter 和公共类型可编译，不证明权限语义正确；
- 每个 Lab 的计数正确，说明当前公开行为闭合；
- 故障实验能被原测试杀死，说明 trust gate 测试确实保护根不变量；
- through-12 全绿，说明 Resource/Extension 没有破坏既有消息、工具、历史和预算协议。

:::checkpoint title="Checkpoint 12 · 数据有准入，代码有信任门"
**完成状态：** Resource roots 按输入顺序解决 `kind+name` 冲突；inactive Skill 只暴露
metadata；显式激活受 lexical 与 canonical containment 约束；模板生成 canonical
user message；资源文字只从 `buildContext.systemPrompt` 进入预算。

**执行边界：** Untrusted Extension 不触发 import；factory 注册先 staging、成功后
commit；`before` 拒绝或故障时 core 不运行；`after` 故障只留下 diagnostic。

**公开证据：** `2/2 → 3/3 → 2/2 → 2/2 → 3/3`，共 12 项。

**恢复：** 重新生成 Chapter 12 练习即可回到第 11 章 parent 加无答案 starter 的状态。
只恢复 `packages/pi-course/src/resources.ts`；不要回退 session、context、tool 或 loop。
:::

## 可选迁移练习

这次迁移不要求你从空白文件设计新系统。仍在 Chapter 12 练习目录里，用现成公开 API
增加一个最小场景：项目 root 和用户 root 都提供 `template:review`，项目 root 优先；
只激活项目里的 `skill:review`；再加载一个会拒绝读取 `.env` 的 extension。

:::transfer title="迁移练习 · 用同一条任务穿过数据路径和执行路径"
先复制本章测试中的 `writeSkill()`、`writeTemplate()` 和临时目录写法，创建一份新的
测试文件 `packages/pi-course/test/12-transfer.test.ts`。不要新写 loader。

按下面四步施工：

1. 调用 `discoverResources([project, user])`，断言模板正文来自 project；
2. 调用 `activateSkill(catalog, "review")`，断言 system prompt 有 active body，
   没有 user root 中落败 Skill 的 body；
3. 用 `loadExtension()` 注册一个 `beforeToolCall`，只在
   `call.name === "read"` 且 path 为 `.env` 时返回 deny；
4. 用 `host.wrapExecutor(core)` 分别执行 `read README.md` 和 `read .env`，记录
   `coreCalls`、两个结果的 `toolCallId` 与 `isError`。

先预测完整 trace：

```text
catalog winner
  → activate project skill
  → trust
  → import
  → factory commit
  → README call: before allow → core → after
  → .env call: before deny → paired error result
```

验收只有三条：项目模板胜出；`coreCalls === 1`；`.env` 的错误结果仍与原 call id
配对。若失败，按 trace 找第一处偏差，不给 `resources.ts` 再加新分支。这个练习只把
五个 Lab 组合起来，不扩大本章 API。
:::

## 小结

- Resource catalog 管数据准入，Extension loader 管代码执行准入。
- Roots 的输入顺序决定 winner；稳定输出只按 `kind+name`，不拿 source path 偷换权限。
- Inactive Skill 的 metadata 可见，正文和附加文件要显式激活。
- 路径安全要同时检查词法结果和 `realpath()` 结果。
- Template 只生成 `UserMessage`；资源上下文只生成 system prompt，并交给第 11 章预算。
- Extension 必须先 trust、再 import；factory 注册要先 staging、后 commit。
- `before` 是策略门，失败时关闭；`after` 是观察者，失败时保留 core 已发生的事实。
- Hook timeout 只停止等待，不会强制终止扩展内部仍在运行的异步任务。
