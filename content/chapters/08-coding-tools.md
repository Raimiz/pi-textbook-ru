---
id: "08"
slug: coding-tools
part: core
partTitle: 第二部 · 闭合 Agent 核心
chapter: "08"
title: Read、Write、Edit 与 Bash
summary: 把文件和进程能力接入 Agent Loop，并用明确的路径、提交和资源边界约束副作用。
minutes: 220
difficulty: 核心
artifact: packages/pi-course/src/coding-tools.ts
prerequisites: 06,07
terms: bounded observation, path containment, mutation queue, exact edit, process lifecycle
upstream: packages/coding-agent/src/core/tools/read.ts, packages/coding-agent/src/core/tools/write.ts, packages/coding-agent/src/core/tools/edit.ts, packages/coding-agent/src/core/tools/bash.ts
---

## 你将得到什么

第 07 章的 Agent Loop 已经能可靠执行抽象工具，但 `echo` 只会返回一段文字。真正的
编程 Agent 还要读取文件、修改文件并运行命令。接入这些能力后，错误不再只存在于
消息列表里：一次调用可能覆盖文件、只写入半份内容，或启动一个不会自行结束的进程。

本章只增加一种复杂性：**对学习环境产生副作用**。你会实现
`createCodingTools()`，让它注册四个工具：

| 工具 | 输入 | 成功后必须说明 |
|---|---|---|
| `read` | `path`、可选 `offset/limit` | 实际显示的行、文件总行数、是否截断 |
| `write` | `path/content` | 写入路径和字节数 |
| `edit` | `path` 与一组 `oldText/newText` | 替换数量、修改前后的字节数 |
| `bash` | `command` | 退出状态、超时、取消和截断状态 |

四个工具共用第 06 章的参数验证与错误结果，也由第 07 章的循环负责 call/result
配对。本章不重新实现这两层，只处理文件和进程自己的边界。

涉及文件或进程的测试都会创建临时目录；`MutationQueue` 的纯内存测试不接触磁盘。
不要把教材仓库、工作项目或个人目录当作练习数据。

## 开始前：只认一条练习路线

在教学历史仓库运行：

```bash
npm run practice -w @pi/course -- 08 <新目录>
cd <新目录>
npm install
```

生成器会保留第 07 章的实现，注入第 08 章测试，并放入一份学习脚手架。脚手架声明
公共类型、`createCodingTools()` 和六段 Lab 的施工位置，但不包含路径解析、文件
提交、编辑或进程管理算法。

需要重来时，创建另一个练习目录。隔离目录没有 Git 历史，不要运行恢复 commit 的
命令，也不要查看 target diff。

本章要守住三个不变量：

1. `read` 只报告完整显示的行，续读位置必须紧接最后一条完整观察；
2. `write/edit` 在检查完成前不提交文件变化，同一路径的修改按登记顺序执行；
3. `bash` 无论成功、非零退出、超时还是取消，都只形成一个有界的终态结果。

:::rebuild title="Checkpoint 08 · 分六步接入文件与进程"
**模式：** 重建。从 07 的 target 开始，只增加 coding tools。

**起终点：** parent 是本章开始时的起点快照；target 是 12 项聚焦测试通过的终点快照。

**教学文件：** `packages/pi-course/src/coding-tools.ts`

**学习脚手架：** 练习目录中的同名文件保留公共类型、工具注册入口和 Lab 8.1–8.6
的明确施工位；路径判断、截断、文件提交、编辑和子进程算法仍留给你实现。

**动手前只需知道：** `createCodingTools({ cwd, containment: "workspace" })`
返回一个 `ToolRegistry`。`cwd` 是所有相对路径的基准；文件工具先解析路径，再观察
或提交；`bash` 从这个目录启动，但它不受文件路径检查的完整约束。

**第一步：** 先不看 target diff，只实现 `read`。每次只加入完整的编号行，并让
`endLine` 与续读 `offset` 指向实际显示的范围。

**第一次红灯：** 脚手架可以通过 TypeScript 编译；首次只运行 Lab 8.1 时，应看到
`Tool read failed: Lab 8.1 Read 尚未实现`，而不是缺模块或一串级联类型错误。

**聚焦测试：** `packages/pi-course/test/08-coding-tools.test.ts`

**定位命令：** `npm run checkpoint -w @pi/course -- 08`

**练习目录：** `npm run practice -w @pi/course -- 08`

**聚焦运行：** `npm run build -w @pi/course`，然后运行
`node --test packages/pi-course/dist/test/08-*.test.js`。

**通过证据：** 12 项测试依次证明有界读取、路径限制、文件提交、精确编辑、进程
终态，以及一次真实的 `read → edit → bash → final` 循环。

第一次尝试禁止查看完整答案；只操作测试创建的临时目录。
:::

## 先建立全景

### 四个工具共享一条处理路径

工具名称不同，处理步骤却可以统一：

```text
ToolCall
  │
  ├─ 第 06 章：验证参数，绑定 callId 与 signal
  │
  ├─ 本章：解析路径或准备进程
  │
  ├─ 本章：执行有界观察或提交副作用
  │
  └─ 第 06/07 章：形成 ToolResult，再写入 transcript
```

`read` 只观察环境；`write` 和 `edit` 修改环境；`bash` 启动另一个执行主体。因此，
它们需要的限制也不同：

| 资源 | 开始前检查 | 执行中的限制 | 结束证据 |
|---|---|---|---|
| 文件读取 | 路径属于练习目录 | 行数、字节数 | 完整显示范围与续读位置 |
| 文件写入 | 路径与父目录合法 | 同路径串行、临时文件后 rename | 路径与写入字节数 |
| 精确编辑 | 所有匹配都有效且唯一 | 内存中依次替换、最后只提交一次 | 替换数与前后字节数 |
| 命令执行 | 预取消时不启动 | 输出上限、timeout、abort | exit、timeout、abort、truncated |

:::predict title="测试全绿就能把任意命令交给 Agent 吗"
假设所有文件路径测试和 Bash 生命周期测试都通过。现在把用户输入原样放进
`command`，并允许 Agent 访问当前用户的环境变量。这是否已经构成安全沙箱？
---answer
没有。路径检查只约束课程的文件工具；从固定 `cwd` 启动 Bash 也不会隔离网络、
系统调用、用户权限或环境变量。测试只证明本章列出的行为。运行不可信代码仍需要
容器、虚拟机或专用沙箱，并应另加权限确认。
:::

## 第一步：让 Read 只报告完整观察

`read` 同时受行数和字节数限制。行数限制防止一次返回整份大文件；字节限制防止少数
超长行占满模型上下文。两种限制都必须落到同一个可恢复结果上：

```text
   3│ gamma
   4│ delta

[已显示第 3-4 行，共 9 行；继续读取：offset=5]
```

`startLine` 和 `endLine` 描述真正显示的完整行。若字节上限只容纳第 3 行，
`endLine` 必须是 3，续读位置必须是 4。不能先算出“准备读取到第 4 行”，再把输出
从中间截断，却仍告诉模型从第 5 行继续；那会永久跳过第 4 行的一部分。

一个稳妥的算法是逐行构造带行号的文本：

1. 从 `offset` 指定的行开始；
2. 先格式化下一条完整行；
3. 只有加入它后仍不超过字节上限，才把它计入结果；
4. `endLine` 取最后一条已加入的行；
5. 文件还有内容时，续读位置为 `endLine + 1`。

如果第一条编号行连同必要的续读提示都放不进上限，就返回明确错误。课程不返回半行，
因为当前接口只有按行续读的 `offset`，没有从一行中间继续的字节游标。

:::lab title="实践 8.1 · 实现有界 Read"
**目标：** 让行窗口、字节上限、details 和续读位置描述同一段真实输出。

**文件：** `packages/pi-course/src/coding-tools.ts`

**动作：**
1. 实现 `read` 的参数 schema 与工具注册。
2. 读取 UTF-8 文件，检查 `offset` 没有越过文件末尾。
3. 逐行加入编号文本，只保留能完整放入字节上限的行。
4. 返回总字节数、总行数、实际起止行和 `truncated`。
5. 若还有未显示内容，附上准确的下一次 `offset`。
6. 删除 Lab 8.1 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 8.1" \
  packages/pi-course/dist/test/08-*.test.js
```

**预期：** `2/2`。第一项检查普通行窗口；第二项把字节上限压小，证明输出不会截断
UTF-8 行，也不会跳过下一次应读的内容。
:::

## 第二步：让路径判断覆盖符号链接

`path.resolve(cwd, input)` 可以处理 `../` 和绝对路径，却只看字符串。假设
`workspace/link` 是一个指向外部目录的符号链接，那么
`workspace/link/secret.txt` 在字符串上仍位于 workspace 内。

课程的 `"workspace"` 模式分两层检查：

1. 先把输入解析为绝对路径，拒绝词法上位于 `cwd` 外的结果；
2. 再取得真实路径。如果目标已经存在，就对目标调用 `realpath`。如果目标尚不存在，
   就从它的父目录逐层向上，找到第一个已存在的目录，再对该目录调用 `realpath`。
   这样可以避免通过指向外部的符号链接创建文件。

`read`、`write` 和 `edit` 必须共用这一段解析逻辑。三个工具各写一份近似判断，
很容易出现“读被挡住，写却能越界”的缝隙。

这仍是一层学习环境保护，不是无法绕过的安全边界。检查与实际打开文件之间存在
时间窗口；另一个进程可以改动符号链接。强隔离要交给操作系统级沙箱。

:::lab title="实践 8.2 · 共用一条文件路径边界"
**目标：** 让三个文件工具对外部路径和符号链接给出一致结果。

**文件：** `packages/pi-course/src/coding-tools.ts`

**动作：**
1. 写一个共用的路径解析函数。
2. 在 `"workspace"` 模式拒绝解析后位于根目录外的路径。
3. 对已存在目标检查 `realpath`；对新目标检查最近的已存在祖先。
4. 让 `read`、`write`、`edit` 都调用这个函数。
5. 删除 Lab 8.2 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 8.2" \
  packages/pi-course/dist/test/08-*.test.js
```

**预期：** `1/1`。测试只在临时目录创建外部文件和符号链接，并证明三个工具对这些
越界输入给出一致结果。是否共用同一解析函数，还要从你的源码中确认。
:::

## 第三步：把 Write 变成一次明确提交

`write` 的语义应当简单：父目录不存在就创建；目标存在就整体覆盖。它不猜测用户想
追加、合并还是保留哪一段。

直接向目标文件写入时，其他读者可能看见半截内容。课程先在同一目录写临时文件，
再用 `rename` 替换目标：

```text
content
  → mkdir(parent)
  → write(path.pi-tmp-...)
  → rename(temp, path)
  → { path, bytes }
```

同一组工具里的 `write` 和 `edit` 还要共享修改队列。对同一路径，先登记的操作完成
后，下一项才进入自己的读取或提交阶段。不同路径不需要共用一把全局锁。

这里的“同一路径”是同一个解析后的绝对路径键。测试不靠大文件或计时制造竞态。
一项测试记录默认 `MutationQueue.run()` 的实例和路径键，证明同一次
`createCodingTools()` 注册的 write/edit 共用队列；另一项直接用 Promise gate
控制执行顺序，分别观察同路径等待、不同路径继续执行，以及失败后释放下一项。
本章不规定两个独立 Registry 是否还要共用队列。

测试还会为旧文件创建一个硬链接作为见证。若实现直接改写目标，见证文件也会跟着
变化；若实现用 `rename` 替换目标路径，见证文件仍保留旧内容。另一个输入会故意让
`rename` 失败，再检查旧目录没有变化，课程临时文件也已经清理。这样可以观察提交
与清理行为，而不用猜测文件操作需要多长时间。

这项设计缩小了半成品可见窗口，但它不等于数据库事务。课程没有证明断电持久性、
权限继承、跨文件原子性，也无法阻止课程之外的进程同时写同一文件。

:::lab title="实践 8.3 · 提交完整 Write"
**目标：** 明确新建、整体覆盖和同路径修改的先后关系。

**文件：** `packages/pi-course/src/coding-tools.ts`

**动作：**
1. 实现同路径修改队列，失败也必须释放下一项。
2. 在目标同目录写临时文件，成功后 rename，最后清理残留临时文件。
3. 自动创建父目录，并返回最终路径与 UTF-8 字节数。
4. 让 `write` 进入修改队列。
5. 删除 Lab 8.3 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 8.3" \
  packages/pi-course/dist/test/08-*.test.js
```

**预期：** `2/2`。第一项检查新建、覆盖、父目录、details、硬链接见证、默认队列
实例，以及提交失败后的临时文件清理；第二项用 Promise gate 证明同路径串行、
不同路径可继续执行，失败也会释放下一项。
:::

## 第四步：Edit 先验证整批，再写一次

`edit` 接受精确的 `oldText → newText`。零次匹配表示当前观察已经过期；多次匹配
表示定位信息不足。两种情况都应失败，不能擅自挑第一处。

批量编辑按数组顺序作用于一份内存副本。后一项能看见前一项的结果：

```ts
let next = current;
for (const edit of edits) {
  // oldText 必须在 next 中恰好出现一次
  next = applyExactReplacement(next, edit);
}
// 全部成功后才提交一次
await atomicWrite(file, next);
```

这条顺序规则允许第二项修改第一项刚生成的文本。任何一项失败时，函数在进入
`atomicWrite()` 前结束，磁盘文件应与调用前逐字节相同。`oldText` 不能为空，
否则空字符串会在每个位置“匹配”，唯一性也失去意义；`newText` 可以为空，因为
删除是一种合法编辑。

:::lab title="实践 8.4 · 实现批量精确 Edit"
**目标：** 让一批相关编辑要么全部验证后提交，要么保持文件不变。

**文件：** `packages/pi-course/src/coding-tools.ts`

**动作：**
1. 解析单项和数组形式的编辑参数，拒绝空数组。
2. 在内存副本中按顺序应用编辑。
3. 每一步都拒绝空 `oldText`、零次匹配和多次匹配。
4. 全部通过后只调用一次文件提交，并复用 Write 的同路径队列。
5. 返回替换数量以及修改前后的字节数。
6. 删除 Lab 8.4 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 8.4" \
  packages/pi-course/dist/test/08-*.test.js
```

**预期：** `2/2`。第一项检查顺序批处理、空 `newText` 删除、details，以及
Write/Edit 共用默认队列；第二项检查空批次、空 `oldText`、零匹配、多匹配与
中途失败，并在每个失败后确认文件内容没有变化。
:::

## 第五步：把 Bash 当成一段生命周期

`spawn()` 返回子进程对象，只表示进程已经开始。工具还要同时管理 stdout、stderr、
非零退出、启动失败、timeout、外部 abort 和输出上限。

```text
预取消 ───────────────→ 不 spawn → aborted result

spawn
  ├─ stdout/stderr ───→ 持续消费，只保留上限内的字节
  ├─ exit 0 ──────────→ success result
  ├─ exit 非 0 ───────→ error result
  ├─ timeout ─────────→ 请求终止进程组 → timedOut result
  └─ abort ───────────→ 请求终止进程组 → aborted result
```

stdout 和 stderr 都要持续读取，否则其中一个管道写满后，子进程可能一直等待。
对已经启动的命令，捕获的 stdout、stderr 与截断说明共用
`maxBashOutputBytes`。发生截断时，先给说明留出字节，再用剩余空间保存子进程输出。
工具执行器在外层生成的错误说明，以及预取消时的固定提示，不属于这项输出预算。
测试会让两路同时产生输出并检查共同预算；它没有把管道写满。达到上限后仍继续排空
两条管道，要从你的数据监听代码中确认。

`"workspace"` 模式还会拒绝命令字符串中显式出现的绝对路径、`~/` 和 `../`。测试用
目录外标记文件确认绝对路径和 `../` 命令没有启动；`~/` 分支由源码审查确认。这只是
防止练习时常见误操作的字符串检查；shell 仍能使用环境变量、程序参数和系统调用
访问工作目录之外的资源。

timeout 与 abort 可能同时到达，进程也可能恰好自行退出。清理动作要幂等：多次请求
终止不会生成多个结果，timer 与 abort listener 最终都要移除。在 POSIX 系统上，
课程先向同一进程组发送 `SIGTERM`，短暂等待后再发送 `SIGKILL`，并等这段清理结束
才返回。测试还会启动一个忽略 `SIGTERM` 的后代进程，确认它不能在工具返回后继续
写标记文件。测试直接观察终止处理器与后代标记；是否等待 `close` 和强杀步骤、
是否移除 timer 与 listener，还要从源码中的 `await` 和 `finally` 确认。测试命令
全部固定，不会拼接外部输入，也不会访问网络。

:::lab title="实践 8.5 · 结算 Bash 的每个终点"
**目标：** 让成功、失败、超时、取消和超长输出都在有限资源内结束。

**文件：** `packages/pi-course/src/coding-tools.ts`

**动作：**
1. 预先检查 signal；已经取消时不要启动进程。
2. 从指定 `cwd` 启动命令，并同时消费 stdout 与 stderr。
3. 只保留上限内的输出，明确标记 `truncated`。
4. 非零退出返回结构化错误，并保留 exit code。
5. timeout 或运行中 abort 时请求终止进程；在 POSIX 系统上处理同一进程组。
6. 等待直接进程关闭和延迟强制终止步骤，再清理 timer 与 listener。
7. 删除 Lab 8.5 的显式异常，只运行本段测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 8.5" \
  packages/pi-course/dist/test/08-*.test.js
```

**预期：** `4/4`。测试分别覆盖成功/非零退出、cwd 与路径字符串 guardrail，
预取消不产生标记文件，stdout/stderr 共用输出上限，以及 timeout/运行中取消。
最后一项还会在 POSIX 系统检查：忽略 `SIGTERM` 的同组后代不能在工具返回后继续
运行。
:::

:::mechanism title="workspace containment 的准确边界"
`"workspace"` 模式会限制课程文件工具，并让 Bash 从指定 `cwd` 启动。它不会隔离
Bash 的网络、系统调用、环境变量或当前用户权限，也没有命令审批。源码中的简单
guardrail 只能减少常见误操作，不能安全执行任意不可信命令。
:::

## 第六步：让真实工具走完 Agent Loop

前五步分别验证工具。最后还要证明它们能进入第 07 章的消息协议。使用
`ScriptedModel` 安排四轮确定行为：

```text
assistant(read)  → toolResult(read)
assistant(edit)  → toolResult(edit)
assistant(bash)  → toolResult(bash)
assistant(final) → stop
```

测试使用临时文件和固定本地命令，不调用模型 API。它要同时观察两类事实：

- 环境事实：文件确实被 edit 改写，bash 确实在指定目录检查到新内容；
- 协议事实：每个 call 都有同 id/name 的 result，最后一轮才以 `stop` 结束。

:::lab title="实践 8.6 · 闭合一次真实编码循环"
**目标：** 让 read、edit 和 bash 通过同一个 Agent Loop 完成一次可观察任务。

**文件：** `packages/pi-course/src/coding-tools.ts`

**动作：**
1. 确认 `createCodingTools()` 返回的 Registry 同时包含四个工具定义。
2. 用现有 `runAgentLoop()` 执行 ScriptedModel 的四轮脚本。
3. 检查三条 call/result 配对和最后的 `stop`。
4. 检查临时文件的最终内容。
5. 删除 Lab 8.6 的显式异常，先运行本段测试，再运行本章全部测试。

**运行：**

```bash
npm run build -w @pi/course
node --test --test-name-pattern="Lab 8.6" \
  packages/pi-course/dist/test/08-*.test.js
node --test packages/pi-course/dist/test/08-*.test.js
```

**预期：** 局部 `1/1`，完整 `12/12`。最终消息按
`user → assistant → result → assistant → result → assistant → result → assistant`
排列，三条 result 分别回答原来的 read、edit 和 bash call。
:::

## 故意把它弄坏

编辑测试会创建一份包含两个相同片段的临时文件。暂时把“多次匹配时报错”改成只替换
第一处，再运行 Lab 8.4：

```text
正确：匹配 2 次 → isError=true → 文件不变
错误：匹配 2 次 → isError=false → 第一处被悄悄修改
```

:::failure title="预期失败 · 让 Edit 擅自选择第一处"
只改匹配分支，不改测试。首个偏差应落在“多匹配必须失败”或“文件保持原样”的断言，
而不是后续 Bash。观察后手动恢复这处改动，再运行 Lab 8.4 得到 `2/2`。若无法确认
恢复完整，删除练习目录并重新生成；不要拿真实项目验证。
:::

## 本章没有证明什么

12 项测试没有把课程变成安全沙箱，也没有覆盖以下性质：

- 文件路径检查与实际打开之间的符号链接竞态；
- 断电持久性、权限与时间戳继承、跨文件事务；
- 课程外进程同时修改同一文件；
- 两个独立 Registry 同时修改同一路径时是否共用队列；
- 通过不同硬链接或内部符号链接别名访问同一物理文件时的统一排队；
- 并发读者是否在所有文件系统上都看不到提交中的临时状态；
- 文件操作的运行中取消；
- stdout 与 stderr 混合后的稳定先后顺序；
- spawn 启动失败，以及 timeout 与 abort 同时到达时的优先级；
- timer、abort listener 与延迟强杀任务是否在每条异常路径都完成清理；
- 脱离原进程组的后代，以及 Windows 上完整的子进程树回收；
- 任意 shell 输入的转义、命令审批、网络或密钥隔离；
- 超大文件的流式读取和所有 UTF-8 异常输入。

测试通过只说明：在本章固定环境和输入下，列出的路径、提交、编辑、进程与消息行为
符合约定。

:::pi title="与当前上游 Pi 对照"
固定提交 `8479bd8` 的上游工具处理了更多生产细节：read 支持文本与图片，并按行数和
字节数截断；write 自动创建父目录；edit 处理多处替换和重叠；同文件修改会串行；
bash 还会把被截断的完整输出保存到临时文件。

边界也要如实区分。该提交的内建 coding tools 会把相对路径解析到 cwd，也接受绝对
路径和解析到 cwd 外的 `..`；它没有课程 `"workspace"` 模式这样的路径限制。课程的
限制是为了保护练习环境而增加的主动强化，不代表上游默认行为。
:::

## 本章验收

:::checkpoint title="Checkpoint 08 · Agent 获得有界的环境能力"
在隔离练习目录运行 build 和本章 12 项测试。你还要现场解释四件事：为什么 Read 的
续读位置不能从预选范围计算；为什么 Edit 要先验证整批；为什么同路径修改要串行；
为什么固定 cwd 的 Bash 仍不是沙箱。

若四项解释和 `read → edit → bash → final` 的配对证据都成立，本章通过。需要重做
时创建新的 practice 目录，不回退第 06、07 章，也不在真实项目中重复破坏实验。
:::

## 可选迁移练习

:::transfer title="无脚手架迁移 · 只读目录列表"
新增一个只读 `list` 工具：路径必须经过同一 workspace 检查，结果必须排序，并同时
受条目数和字节数限制。先写出 details 与续读语义，再实现测试。它不修改文件，所以
不应进入 write/edit 的修改队列。请用资源所有权解释这个决定，不要只说“这样更快”。
:::

## 小结

文件和进程工具的难点不在 Node API 的调用方式，而在结果是否可恢复、修改是否能
确定提交、进程是否一定结算。Read 只报告完整观察；Write 明确整体覆盖；Edit 先验证
整批；Bash 管理输出和终点。课程 containment 能减少练习时的误操作，但不能代替
操作系统隔离。下一章会在这个循环外增加可持续的 Agent 状态和用户时序控制。
