/* 此文件由 scripts/build-content.mjs 生成，请勿手改。 */
import type { Chapter, CoursePart } from "./course-types";

export const courseParts: CoursePart[] = [
  {
    "id": "orientation",
    "number": "00",
    "title": "序章 · 先看见完整系统",
    "shortTitle": "序章",
    "thesis": "先观察一条完整轨迹，再亲手重建每个因果环节。",
    "accent": "ink"
  },
  {
    "id": "foundations",
    "number": "I",
    "title": "第一部 · 建立可执行语言",
    "shortTitle": "模型与协议",
    "thesis": "把时间、消息和外部模型翻译成稳定的内部协议。",
    "accent": "cyan"
  },
  {
    "id": "core",
    "number": "II",
    "title": "第二部 · 闭合 Agent 核心",
    "shortTitle": "工具与循环",
    "thesis": "让模型的意图经过验证，成为可观察的环境动作。",
    "accent": "green"
  },
  {
    "id": "state",
    "number": "III",
    "title": "第三部 · 让 Harness 可靠",
    "shortTitle": "状态与历史",
    "thesis": "区分运行状态、持久历史和每次决策所见的上下文。",
    "accent": "amber"
  },
  {
    "id": "product",
    "number": "IV",
    "title": "第四部 · 从核心到产品",
    "shortTitle": "扩展与验证",
    "thesis": "在不污染核心的前提下组合产品，并用故障证明架构。",
    "accent": "red"
  }
];

export const chapters: Chapter[] = [
  {
    "id": "00",
    "slug": "prologue",
    "part": "orientation",
    "partTitle": "序章 · 先看见完整系统",
    "chapter": "00",
    "title": "先观察一次完整的 Agent 运行",
    "summary": "先读懂一条从用户目标到工具结果再到最终回答的完整轨迹，为全书建立地图。",
    "minutes": 35,
    "difficulty": "入门",
    "artifact": "packages/pi-course/src/demo/prologue.ts",
    "prerequisites": [],
    "terms": [
      "agent",
      "model",
      "tool call",
      "tool result",
      "transcript"
    ],
    "upstream": [
      "packages/coding-agent/src/main.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "f9798b7ce690abeca3539e3410e5f402bc65862d",
    "parentCommit": "8479bd84743e8889f728acb21a62794102db0529",
    "commitSubject": "observe a complete offline agent trace",
    "checkpointTest": "packages/pi-course/test/00-prologue.test.ts",
    "html": "<h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>进入本章时，你还没有 Agent，也不需要先理解所有 TypeScript。我们先观察最终成品的一次离线运行：用户要求读取项目说明，模型请求工具，环境返回结果，模型再给出回答。你将得到一张能贯穿全书的地图，并学会用事件轨迹判断系统是否真的闭环。</p>\n<p>本章只增加一种复杂性：<strong>把“Agent 会思考”改写成可观察的数据流</strong>。我们暂时不实现模型和工具。完成后你会观察 <code>packages/pi-course/src/demo/prologue.ts</code> 中的教学 checkpoint；页面随附的 <code>workshop/src/demo/prologue.ts</code> 是全书最终参考实现，不是第一次练习要从空白复刻的答案。你将能解释一条固定轨迹中的每个所有者，并指出一条不能破坏的不变量：</p>\n<blockquote>\n<p>每一个已经作为 assistant content 进入 transcript 的 tool call，最终都必须有一个相同 <code>toolCallId</code> 的 tool result。</p>\n</blockquote>\n<p>若想恢复本章起点，不需要回滚代码；重新运行固定脚本即可。它不访问网络，也不修改工作区。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 00 · 先观察，不从空白重写\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 00 · 先观察，不从空白重写</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 观察。本章 target 同时建立课程包和固定演示；你不负责在学 TypeScript 前重写这 201 行。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/demo/prologue.ts</code></p>\n<p><strong>第一步：</strong> 先不看 target diff 和实现，写下七步轨迹的 owner 预测；随后让陪练打开 target 快照，只比较预测、运行测试并做受控破坏。</p>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/00-prologue.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 00</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 00</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/00-*.test.js</code></p>\n<p><strong>通过证据：</strong> 聚焦测试 2/2 通过；你能区分事件的 owner、发起者和环境动作执行者，并说明为什么本章没有要求你重建实现。</p>\n<p>第一次学习禁止让 Agent 粘贴完整答案；00 章只在预测之后查看 target，01 章才从 parent 开始重建。</p>\n<p>这里的 <code>packages/pi-course/</code> 是你和陪练使用的引导重建历史；<code>workshop/</code> 是教材自身经过全量测试的最终参考实现。第一次学习不要在两棵目录之间来回复制代码。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>假设用户说：“读取 <code>README.md</code>，用一句话告诉我这个项目做什么。”离线演示产生下面的稳定轨迹：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">01 user_message       &quot;读取 README.md，并概括项目&quot;\n02 model_start\n03 assistant_message  stopReason=toolUse\n   toolCall           id=call_1 name=read arguments={&quot;path&quot;:&quot;README.md&quot;}\n04 tool_start         id=call_1\n05 tool_result        id=call_1 isError=false content=&quot;# tiny-pi ...&quot;\n06 model_start\n07 assistant_message  stopReason=stop\n   text               &quot;这是一个用于学习 Agent 内核的 TypeScript 项目。&quot;</code></pre></figure><p><code>model_start</code> 与 <code>tool_start</code> 是为了观察运行过程而记录的运行轨迹事件，不是稍后会持久化的 <code>AgentMessage</code>。Canonical <code>AgentMessage</code> 只保存 user、完成的 assistant 和 tool result 这些对下一轮仍有意义的事实。现在不需要理解 <code>AgentContext</code>、<code>EventStream</code>、provider 或 <code>Usage</code> 的实现；它们只是地图上的站名，会在后续章节各自出现一次。</p>\n<p>这里没有神秘的“自主性”。Agent 只是反复回答三个问题：当前事实是什么、模型下一步请求什么、这个请求应当由谁执行。模型拥有生成内容的责任，却不拥有文件系统；工具拥有环境副作用，却不能决定下一轮提示；循环拥有顺序和终止责任，却不应理解 <code>read</code> 的业务细节。序章播放的是固定 fixture：<code>tool_result</code> 的内容已经写在轨迹里，不执行真实的文件读取，也不会改动你的工作区。</p>\n<p>阅读轨迹时要区分“系统已经观察到的事实”和“我们根据最终答案做出的猜测”。第 03 行只能证明模型请求读取；第 04 行只能证明执行开始；直到第 05 行出现，读取结果才成为可供下一轮使用的环境事实。若只看第 07 行，我们甚至无法排除模型凭训练记忆猜中答案。后续测试因此不会只断言最后一句字符串，还会检查中间消息、配对键和 stop reason。这种检查方式会贯穿全书：先找首次偏差，再讨论最终表现。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"运行前先判断\"><header><span class=\"block-kicker\">先预测</span><h4>运行前先判断</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>如果删掉第 05 行，但仍把第 03 行的 tool call 和第 07 行的最终文本保存下来，下一轮模型能否可靠知道文件读取成功？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>不能。tool call 只是动作请求，不是环境事实。缺少配对的 tool result 后，模型既不知道动作是否执行，也不知道得到什么；“最终文本看起来合理”不能修补这段断裂的因果链。</p>\n</div></details></section><h2 id=\"用消息而不是界面描述事实\"><a class=\"heading-anchor\" href=\"#用消息而不是界面描述事实\" aria-label=\"链接到 用消息而不是界面描述事实\">#</a>用消息而不是界面描述事实</h2><p>终端会把事件渲染成几行文字，但界面不是事实源。后续章节会建立统一消息语言；现在先看它的最小形状：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">type AgentMessage =\n  | { role: &quot;user&quot;; content: TextContent[]; timestamp: number }\n  | {\n      role: &quot;assistant&quot;;\n      content: (TextContent | ToolCall)[];\n      provider: string;\n      model: string;\n      usage: Usage;\n      stopReason: &quot;stop&quot; | &quot;length&quot; | &quot;toolUse&quot; | &quot;error&quot; | &quot;aborted&quot;;\n      errorMessage?: string;\n      timestamp: number;\n    }\n  | {\n      role: &quot;toolResult&quot;;\n      toolCallId: string;\n      toolName: string;\n      content: TextContent[];\n      details?: unknown;\n      isError: boolean;\n      timestamp: number;\n    };</code></pre></figure><p>同一份 <code>AgentMessage[]</code> 可以被终端打印、写入 JSONL、变成下一次模型请求，或在网页中折叠显示。若反过来把彩色终端字符串当历史，颜色、换行和日志前缀就会混入语义，恢复会话时也无法可靠找到 tool call。</p>\n<section class=\"learning-block learning-block--mechanism\" aria-label=\"三个所有者\"><header><span class=\"block-kicker\">关键机制</span><h4>三个所有者</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>这里的 <code>owner</code> 表示“谁产生这条事件记录所代表的事实”，不等于“谁发起外层函数调用”。例如 loop 发起一次模型调用，但 <code>model_start</code> 仍属于模型生命周期；模型提出 read，但 <code>tool_start</code> 是 loop 的调度记录；真正的观察结果才属于 tool。Agent loop 还负责把这些事实按协议追加进 transcript。把责任分开后，任何错误都能先定位到“生成、执行、编排”中的一层。</p>\n</div></section><section class=\"learning-block learning-block--lab\" aria-label=\"实践 0.1 · 给轨迹标注所有者\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 0.1 · 给轨迹标注所有者</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 把“智能行为”拆成可检查的责任。</p>\n<p><strong>文件：</strong> <code>packages/pi-course/src/demo/prologue.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>先不看实现，为七行轨迹分别标记 <code>user / model / loop / tool</code>。</li>\n<li>运行演示，比较你的标注与事件的 <code>owner</code> 字段。</li>\n<li>指出真实运行中哪一步会造成环境副作用，再确认固定 fixture 为什么没有真的执行它。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm test -w @pi/course</code></p>\n<p><strong>预期：</strong> 测试验证固定的七步轨迹；真实系统中 read 工具接触环境，但本章 fixture 只回放结果，模型和演示都没有读文件。</p>\n</div></section><h2 id=\"从终点倒推我们要造的部件\"><a class=\"heading-anchor\" href=\"#从终点倒推我们要造的部件\" aria-label=\"链接到 从终点倒推我们要造的部件\">#</a>从终点倒推我们要造的部件</h2><p>完整运行可以压缩成一条重复路径：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">用户目标\n  → AgentContext\n  → Model.stream()\n  → EventStream&lt;ModelEvent, AssistantMessage&gt;\n  → tool call\n  → 工具执行与 tool result\n  → 更新 AgentContext\n  → 下一次 Model.stream()\n  → stop</code></pre></figure><p>第一部会造 <code>AgentContext</code>、消息 IR、<code>EventStream</code>、<code>ScriptedModel</code> 和真实 provider 边界；第二部才闭合工具与循环；第三部让运行可取消、可保存、可恢复；第四部再处理扩展、产品入口和系统评测。这个顺序不是仓库导览，而是每次只让一个未知量进入系统。</p>\n<p>注意这条主链会重复出现，而不是一章讲完就被丢弃。第一次它只是固定 trace；加入 EventStream 后能观察时间；加入消息 IR 后能保存语义；加入工具后才真正接触环境；加入 session 后可以恢复与分支。每一次重走同一条路，旧部件都要在新约束下再次证明自己。你最终记住的应当是稳定因果关系，而不是某个版本的文件树。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 0.2 · 用缺失结果暴露断裂\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 0.2 · 用缺失结果暴露断裂</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 证明你检查的是 call/result 因果关系，而不是最后一句回答。</p>\n<p><strong>文件：</strong> <code>packages/pi-course/test/00-prologue.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>先读第二个测试：它删除 <code>tool_result</code>，随后按新数组位置重新编号。</li>\n<li>运行前预测验证器会先报“步骤号”还是“缺少配对结果”。</li>\n<li>测试通过后，只在纸上把 result 移到 call 前并重新编号；预测它会变成哪一种配对前置错误，不需要在尚未学习 TypeScript 时另写测试。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm test -w @pi/course</code></p>\n<p><strong>预期：</strong> 仓库测试稳定构造“缺少配对结果”；纸面提前 result 应被判断为“结果先于调用”。两者都先于最终文本断言。</p>\n</div></section><aside class=\"learning-block learning-block--pi\" aria-label=\"与当前上游 Pi 对照\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>与当前上游 Pi 对照</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>固定参考提交为 <code>8479bd8</code>。真实入口还要加载配置、模型和扩展，但进入核心后仍沿着“消息 → 模型流 → 工具结果 → 下一轮”推进。序章刻意省略网络、并发和会话树，只保留不会随界面变化的主链路；这属于课程简化，不代表上游只有七个事件。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><p>把工具错误伪装成成功文本，是最危险的“看起来还能跑”。例如读取不存在的文件时，下面这条消息保留了配对关系，也保留了失败事实：</p>\n<figure class=\"code-frame\"><figcaption><span>json</span><button type=\"button\" data-copy-code aria-label=\"复制 json 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-json\">{\n  &quot;role&quot;: &quot;toolResult&quot;,\n  &quot;toolCallId&quot;: &quot;call_1&quot;,\n  &quot;toolName&quot;: &quot;read&quot;,\n  &quot;content&quot;: [{ &quot;type&quot;: &quot;text&quot;, &quot;text&quot;: &quot;ENOENT: README.md&quot; }],\n  &quot;isError&quot;: true\n}</code></pre></figure><section class=\"learning-block learning-block--failure\" aria-label=\"预期失败 · 删除配对结果\"><header><span class=\"block-kicker\">故障实验</span><h4>预期失败 · 删除配对结果</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>删除 <code>tool_result</code> 后重新编号，再运行测试。首次偏差应是 <code>call_1</code> 没有结果，而不是步骤号或“回答文字不同”。若测试只检查最后一句话，它会错误放行一条断裂轨迹；先修验收证据，再恢复事件。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 00 · 能画出闭环\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 00 · 能画出闭环</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p>你应能不看正文画出 <code>user → model → tool call → tool result → model → stop</code>，并分别回答每一步的 owner、发起者与环境动作执行者。在 <code>practice 00</code> 创建的目录中先 build，再运行 <code>node --test packages/pi-course/dist/test/00-*.test.js</code>，应有 2 个测试通过。恢复方法是重新创建 target 快照，不设置 API key，也不编辑相邻目录。下一章才从 parent 开始动手补齐 TypeScript 生存集。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"迁移 · 换成失败的 Bash\"><header><span class=\"block-kicker\">可选迁移</span><h4>迁移 · 换成失败的 Bash</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>不修改主轨迹代码，另写一条五到七步的纸面轨迹：模型请求 <code>bash</code>，命令退出码为 2，模型据此解释失败。标出 call/result 配对和 <code>isError</code>。不要写“模型执行命令”；若能保持所有权与失败事实，你已把不变量迁移到另一个工具。</p>\n</div></section><h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><p>Agent 的最小本质不是聊天界面，而是由类型化事实连接起来的反馈回路。消息保存语义，模型提出下一步，工具接触环境，循环维护顺序。序章只让你看见终点；从下一章开始，我们会逐件造出它，并让每个部件都能被测试、破坏和恢复。</p>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "用消息而不是界面描述事实",
        "title": "用消息而不是界面描述事实",
        "level": 2
      },
      {
        "id": "从终点倒推我们要造的部件",
        "title": "从终点倒推我们要造的部件",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "先观察一次完整的 Agent 运行 先读懂一条从用户目标到工具结果再到最终回答的完整轨迹，为全书建立地图。 序章 · 先看见完整系统 agent, model, tool call, tool result, transcript 你将得到什么 先建立全景 用消息而不是界面描述事实 从终点倒推我们要造的部件 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/00-prologue.md"
  },
  {
    "id": "01",
    "slug": "typescript-survival",
    "part": "foundations",
    "partTitle": "第一部 · 建立可执行语言",
    "chapter": "01",
    "title": "TypeScript、测试与 ESM 生存集",
    "summary": "只学习构造 Agent 所需的 TypeScript 子集，并建立类型检查与行为测试两条证据链。",
    "minutes": 75,
    "difficulty": "入门",
    "artifact": "packages/pi-course/src/survival/events.ts",
    "prerequisites": [
      "00"
    ],
    "terms": [
      "tagged union",
      "narrowing",
      "never",
      "ESM",
      "node:test"
    ],
    "upstream": [
      "packages/agent/src/types.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "a4d35a1b630b196dd38a95033ed18d6cbdf309bf",
    "parentCommit": "f9798b7ce690abeca3539e3410e5f402bc65862d",
    "commitSubject": "establish TypeScript protocol evidence",
    "checkpointTest": "packages/pi-course/test/01-typescript-survival.test.ts",
    "html": "<h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>序章让你看见了一条完整轨迹，但还不能判断代码中的 <code>assistant_message</code> 是否覆盖了所有情况。本章进入时，系统只会播放固定数据；本章完成后，你能读写后续课程反复使用的 tagged union、<code>unknown</code> 收窄、Promise、ESM 导入和 Node 内置测试。</p>\n<p>我们只增加一种主要复杂性：<strong>让编译器和测试成为两种不同的证据</strong>。不会讲前端、DOM、装饰器或复杂泛型。你将在隔离练习目录中创建 <code>packages/pi-course/src/survival/events.ts</code>；聚焦测试已经注入，不需要改测试。你会先看到缺少模块，再分别观察遗漏事件分支时的编译错误和实现错误时的测试失败。</p>\n<p>本章不变量是：</p>\n<blockquote>\n<p>来自系统边界的数据先是 <code>unknown</code>；只有经过验证和穷尽分支后，才能进入 Agent 的强类型核心。</p>\n</blockquote>\n<p>恢复起点时，不要在无 Git 历史的练习目录里寻找旧提交。保留当前目录作实验记录，再用 <code>npm run practice -w @pi/course -- 01 &lt;新目录&gt;</code> 从同一 parent 生成干净起点；不要修改注入的测试或 <code>package-lock.json</code>。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 01 · 先让编译器暴露缺口\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 01 · 先让编译器暴露缺口</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 00 的 target 开始，只补本章的 TypeScript 生存集。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/survival/events.ts</code></p>\n<p><strong>动手前只需知道：</strong> tagged union 是共享字面量标签（这里是 <code>type</code>）的一组互斥对象；<code>unknown</code> 表示边界值尚未被信任，必须验证后才能读字段；<code>never</code> 放在 <code>switch</code> 的剩余分支，会让编译器暴露遗漏的联合成员。ESM 测试虽然 import <code>events.js</code>，你实际创建的是 <code>events.ts</code>，<code>tsc</code> 会生成对应的 <code>.js</code>。</p>\n<p><strong>第一次红灯：</strong> parent 还没有教学文件，因此首次 build 会报 <code>Cannot find module &#39;../src/survival/events.js&#39;</code>。这证明测试已经连到正确缺口，不是让你去修 import。</p>\n<p><strong>第一步：</strong> 先不看 target diff，运行一次聚焦流程并记录上述红灯；再从测试的 import 与四种 fixture 推导 <code>DemoEvent</code>、<code>formatEvent</code>、<code>readDelta</code> 三个公共符号，先创建文件和 tagged union。</p>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/01-typescript-survival.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 01</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 01</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/01-*.test.js</code></p>\n<p><strong>通过证据：</strong> 聚焦测试通过；你能解释为什么 <code>readDelta</code> 必须先验证 <code>unknown</code>，以及漏掉 <code>aborted</code> 时编译器和运行时测试分别暴露什么。</p>\n<p>第一次尝试禁止查看完整答案；卡住时只让陪练定位文件，再逐级增加到签名或伪代码。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>Node、TypeScript、运行器和测试框架各自回答不同问题：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">TypeScript 源码\n  ├─ tsc --noEmit  → “这些值的静态形状能否成立？”\n  ├─ tsc           → 编译为 Node 可执行的 ESM JavaScript\n  └─ node --test   → “给定输入时，行为和顺序是否符合契约？”</code></pre></figure><p>类型检查通过，不代表事件顺序正确；测试通过，也不代表所有联合类型都被覆盖。因此每个 checkpoint 都会同时运行 typecheck 和聚焦测试。ESM 的职责更窄：它规定文件怎样通过 <code>import</code> 与 <code>export</code> 连接，让项目结构成为可追踪的依赖图。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"运行前先判断\"><header><span class=\"block-kicker\">先预测</span><h4>运行前先判断</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>给联合类型新增 <code>cancelled</code> 事件，但忘记修改格式化函数。只运行一个没有构造 <code>cancelled</code> 的单元测试，它会失败吗？<code>tsc</code> 又会怎样？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>测试很可能仍通过，因为它没有走到新分支。若函数末尾使用 <code>never</code> 做穷尽检查，<code>tsc</code> 会指出 <code>cancelled</code> 不能赋给 <code>never</code>。两条证据发现的是不同缺口。</p>\n</div></details></section><h2 id=\"用-tagged-union-表达互斥状态\"><a class=\"heading-anchor\" href=\"#用-tagged-union-表达互斥状态\" aria-label=\"链接到 用 tagged union 表达互斥状态\">#</a>用 tagged union 表达互斥状态</h2><p>Agent 事件不是一张塞满可选字段的表。<code>started</code> 没有结果，<code>delta</code> 必须有片段，<code>finished</code> 必须有终态。把互斥状态写成联合类型后，<code>event.type</code> 同时是数据和编译器的证明线索：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export type DemoEvent =\n  | { type: &quot;started&quot;; requestId: string }\n  | { type: &quot;delta&quot;; requestId: string; text: string }\n  | { type: &quot;finished&quot;; requestId: string; reason: &quot;stop&quot; | &quot;length&quot; };\n\nexport function formatEvent(event: DemoEvent): string {\n  switch (event.type) {\n    case &quot;started&quot;:\n      return `start ${event.requestId}`;\n    case &quot;delta&quot;:\n      return `delta ${event.requestId} ${event.text}`;\n    case &quot;finished&quot;:\n      return `finish ${event.requestId} ${event.reason}`;\n    default: {\n      const unreachable: never = event;\n      return unreachable;\n    }\n  }\n}</code></pre></figure><p>若改成 <code>{ type: string; text?: string; reason?: string }</code>，无效组合也会合法，例如 <code>started</code> 同时携带 <code>reason</code>。联合类型把“哪些状态可能存在”写进协议，而不是留给注释。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 1.1 · 制造一次穷尽检查失败\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 1.1 · 制造一次穷尽检查失败</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 让编译器先于运行时发现遗漏。</p>\n<p><strong>文件：</strong> <code>packages/pi-course/src/survival/events.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>先完成三个导出，让本章聚焦测试转绿。</li>\n<li>为 <code>DemoEvent</code> 临时增加 <code>{ type: &quot;cancelled&quot;; requestId: string }</code>，暂时不修改 <code>formatEvent</code>。</li>\n<li>运行 build，确认 <code>never</code> 行报告遗漏；补上分支再次 build。</li>\n<li>实验结束后删除临时 <code>cancelled</code> 类型和分支，恢复本章目标协议。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/01-*.test.js</code></p>\n<p><strong>预期：</strong> 补分支前，<code>never</code> 行产生静态错误；补齐后聚焦测试通过。</p>\n</div></section><h2 id=\"把边界的-unknown-收窄\"><a class=\"heading-anchor\" href=\"#把边界的-unknown-收窄\" aria-label=\"链接到 把边界的 unknown 收窄\">#</a>把边界的 unknown 收窄</h2><p><code>JSON.parse()</code>、环境变量和网络响应不受 TypeScript 控制。把它们直接断言成内部类型，只是让编译器闭嘴。正确方向是：边界接受 <code>unknown</code>，验证最小必要字段，再返回强类型值。</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export function readDelta(value: unknown): DemoEvent {\n  if (\n    typeof value === &quot;object&quot; &amp;&amp;\n    value !== null &amp;&amp;\n    &quot;type&quot; in value &amp;&amp;\n    value.type === &quot;delta&quot; &amp;&amp;\n    &quot;requestId&quot; in value &amp;&amp;\n    typeof value.requestId === &quot;string&quot; &amp;&amp;\n    &quot;text&quot; in value &amp;&amp;\n    typeof value.text === &quot;string&quot;\n  ) {\n    return { type: &quot;delta&quot;, requestId: value.requestId, text: value.text };\n  }\n  throw new Error(&quot;invalid delta event&quot;);\n}</code></pre></figure><p>这里故意不引入 schema 库：第 06 章才系统处理工具参数。现在要掌握的是信任方向——外部数据不能凭一个 <code>as DemoEvent</code> 穿透边界。</p>\n<section class=\"learning-block learning-block--mechanism\" aria-label=\"类型不是运行时防火墙\"><header><span class=\"block-kicker\">关键机制</span><h4>类型不是运行时防火墙</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>联合类型约束我们自己写的代码；验证器约束进程外的数据。<code>as</code> 只改变静态视图，不检查任何字节。后续 provider adapter 必须先翻译和验证，再把事件交给核心。</p>\n</div></section><h2 id=\"esm-与测试让文件形成可执行契约\"><a class=\"heading-anchor\" href=\"#esm-与测试让文件形成可执行契约\" aria-label=\"链接到 ESM 与测试让文件形成可执行契约\">#</a>ESM 与测试让文件形成可执行契约</h2><p>课程统一使用显式相对导入，测试从公共导出读取行为。一个最小测试同时固定输出与顺序：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">import assert from &quot;node:assert/strict&quot;;\nimport test from &quot;node:test&quot;;\nimport { formatEvent, type DemoEvent } from &quot;../src/survival/events.js&quot;;\n\ntest(&quot;formatEvent preserves event order&quot;, () =&gt; {\n  const events: DemoEvent[] = [\n    { type: &quot;started&quot;, requestId: &quot;r1&quot; },\n    { type: &quot;delta&quot;, requestId: &quot;r1&quot;, text: &quot;Pi&quot; },\n    { type: &quot;finished&quot;, requestId: &quot;r1&quot;, reason: &quot;stop&quot; },\n  ];\n  assert.deepEqual(events.map(formatEvent), [\n    &quot;start r1&quot;,\n    &quot;delta r1 Pi&quot;,\n    &quot;finish r1 stop&quot;,\n  ]);\n});</code></pre></figure><p>运行结果应是稳定模式，而不是依赖机器耗时：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">✔ tagged union 的完成态覆盖全部事件分支\ntests 2\npass 2</code></pre></figure><aside class=\"learning-block learning-block--note\" aria-label=\"别让绿灯替测试夸大证明力\"><header><span class=\"block-kicker\">旁注</span><h4>别让绿灯替测试夸大证明力</h4><small>不阻断主线</small></header><div class=\"block-body\"><p>这 2 项聚焦测试只证明四种 fixture 的格式化结果、顺序、一个合法 delta 和一个\n数字 <code>text</code> 边界反例。<code>never</code> 是否能暴露遗漏，要由实践 1.1 中那次预期的\n编译失败提供证据；Promise 的顺序语义只是为后续章节建立阅读准备，不在本章\n聚焦 oracle 内。测试没观察到的性质，不能因为绿灯就宣称已被证明。</p>\n</div></aside><section class=\"learning-block learning-block--lab\" aria-label=\"实践 1.2 · 经历一次 red → green\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 1.2 · 经历一次 red → green</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 区分形状正确与行为正确。</p>\n<p><strong>文件：</strong> <code>packages/pi-course/src/survival/events.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>保持注入测试不动，把 <code>delta</code> 的输出临时改成不含 <code>requestId</code>。</li>\n<li>运行聚焦测试，确认 TypeScript 形状仍合法，但行为断言给出字符串 diff。</li>\n<li>恢复 <code>requestId</code>，让测试转绿；再把 <code>readDelta</code> 的字段验证临时换成类型断言，观察非法数字 <code>text</code> 的测试失败。</li>\n<li>恢复显式验证，确认 build 与两项测试都通过。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/01-*.test.js</code></p>\n<p><strong>预期：</strong> 第一次得到明确 diff；第二次测试和静态检查同时通过。</p>\n</div></section><h2 id=\"promise-让何时完成进入类型\"><a class=\"heading-anchor\" href=\"#promise-让何时完成进入类型\" aria-label=\"链接到 Promise 让“何时完成”进入类型\">#</a>Promise 让“何时完成”进入类型</h2><p>后续 <code>Model.stream()</code> 会同步返回一个可迭代对象，而最终消息通过 Promise 在未来完成。<code>async/await</code> 不是把异步代码变成同步代码，而是让依赖关系清楚地写出来。最容易误用的是 <code>forEach(async ...)</code>：外层不会等待内部回调，错误也可能脱离当前控制流。</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">// 明确顺序：后一项依赖前一项完成\nfor (const event of events) {\n  await persist(event);\n}\n\n// 明确并发：同时启动，但等待全部结果\nconst results = await Promise.all(events.map((event) =&gt; persist(event)));</code></pre></figure><p>两段代码都可能返回按输入排列的结果，但副作用完成顺序不同。Agent 中的 provider delta 通常必须顺序处理；多个独立工具未来可以并发执行，却仍要按协议决定 transcript 的写入顺序。不要靠“这次日志碰巧有序”推断调度保证。</p>\n<p>ESM 也在保护这种边界。公共文件只导出上层真正需要的类型和函数；在 NodeNext 配置下，TypeScript 源文件使用运行时会存在的 <code>.js</code> 相对路径。循环依赖往往说明所有权混乱：例如 <code>types.ts</code> 不应反向 import provider adapter，否则 canonical IR 已经知道了外部实现。遇到导入错误时先画依赖方向，不要急着改回 <code>require()</code> 或移除严格配置。</p>\n<p>本课程不会用 <code>any</code> 或关闭 strict 换取短暂绿灯。若暂时不知道一个值的形状，就让它保持 <code>unknown</code>，把不确定性留在边界附近；这比让错误穿过五层调用后再爆炸更便宜。</p>\n<aside class=\"learning-block learning-block--pi\" aria-label=\"与当前上游 Pi 对照\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>与当前上游 Pi 对照</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>当前 Pi 在 <code>packages/agent/src/types.ts</code> 和 <code>packages/ai/src/types.ts</code> 大量使用 tagged union、<code>Extract</code> 与 <code>import type</code> 表达事件协议。课程先用四个小事件练习同一机制，不复制上游复杂字段。上游还需要兼容许多 provider；本章验证器只是教学用最小边界，不代表生产验证已经完成。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><p>下面的写法能让错误数据“看起来有类型”，却没有任何运行时证据：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">const event = JSON.parse(raw) as DemoEvent;\nconsole.log(formatEvent(event));</code></pre></figure><p>若 <code>raw</code> 是 <code>{&quot;type&quot;:&quot;delta&quot;,&quot;text&quot;:42}</code>，编译器不会替你检查数字。错误可能在更远处变成难以定位的字符串拼接或状态污染。</p>\n<section class=\"learning-block learning-block--failure\" aria-label=\"预期失败 · 用断言绕过边界\"><header><span class=\"block-kicker\">故障实验</span><h4>预期失败 · 用断言绕过边界</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>把 <code>readDelta()</code> 临时替换为 <code>JSON.parse(raw) as DemoEvent</code>，输入数字 <code>text</code>。首次偏差应出现在边界测试“拒绝无效数据”处。若直到 <code>formatEvent</code> 才失败，说明验证责任放错了层。恢复显式收窄函数并重跑。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 01 · 两条证据链\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 01 · 两条证据链</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p><code>npm run build -w @pi/course</code> 与 <code>node --test packages/pi-course/dist/test/01-*.test.js</code> 应通过 2/2；你能解释 <code>tsc</code>、编译后的 ESM 和 <code>node --test</code> 分别证明什么，并能在不运行代码时指出遗漏的联合分支。确认只修改了 <code>packages/pi-course/src/survival/events.ts</code>，测试与 lockfile 未变。下一章会把这些事件放进真正的异步序列。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"迁移 · 定义下载事件\"><header><span class=\"block-kicker\">可选迁移</span><h4>迁移 · 定义下载事件</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>不复制 <code>DemoEvent</code>，独立定义 <code>queued | progress | completed | failed</code> 下载事件，并写一个穷尽的 <code>summarize()</code>。要求 <code>progress</code> 才能携带百分比，<code>failed</code> 才能携带错误。先写测试再实现；这次不给字段骨架。</p>\n</div></section><h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><p>我们没有“学完 TypeScript”，而是获得了构造 Agent 所需的生存集：用联合类型表示互斥状态，用 <code>never</code> 暴露遗漏，用 <code>unknown</code> 守住边界，用 ESM 连接模块，再让类型检查和行为测试提供不同证据。下一章只增加时间维度：事件如何逐个到达、怎样完成、又怎样取消。</p>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "用-tagged-union-表达互斥状态",
        "title": "用 tagged union 表达互斥状态",
        "level": 2
      },
      {
        "id": "把边界的-unknown-收窄",
        "title": "把边界的 unknown 收窄",
        "level": 2
      },
      {
        "id": "esm-与测试让文件形成可执行契约",
        "title": "ESM 与测试让文件形成可执行契约",
        "level": 2
      },
      {
        "id": "promise-让何时完成进入类型",
        "title": "Promise 让“何时完成”进入类型",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "TypeScript、测试与 ESM 生存集 只学习构造 Agent 所需的 TypeScript 子集，并建立类型检查与行为测试两条证据链。 第一部 · 建立可执行语言 tagged union, narrowing, never, ESM, node:test 你将得到什么 先建立全景 用 tagged union 表达互斥状态 把边界的 unknown 收窄 ESM 与测试让文件形成可执行契约 Promise 让“何时完成”进入类型 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/01-typescript-survival.md"
  },
  {
    "id": "02",
    "slug": "event-stream",
    "part": "foundations",
    "partTitle": "第一部 · 建立可执行语言",
    "chapter": "02",
    "title": "EventStream：让过程和结果走同一条流",
    "summary": "实现一个既能逐项读取事件、又能等待最终结果的异步流，并把终态写成唯一结束信号。",
    "minutes": 95,
    "difficulty": "进阶",
    "artifact": "packages/pi-course/src/event-stream.ts",
    "prerequisites": [
      "01"
    ],
    "terms": [
      "AsyncIterable",
      "EventStream",
      "queue",
      "waiter",
      "terminal event"
    ],
    "upstream": [
      "packages/ai/src/utils/event-stream.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "febad6212da194f10bb5395429a61c672060f75a",
    "parentCommit": "a4d35a1b630b196dd38a95033ed18d6cbdf309bf",
    "commitSubject": "make model time an explicit EventStream",
    "checkpointTest": "packages/pi-course/test/02-event-stream.test.ts",
    "html": "<h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>上一章只解决了“事件长什么样”。当时所有事件都已经放在一个数组里。真实模型不是这样：文本会一段一段到达，界面要马上显示每段内容，Agent loop 还要等整条消息结束。</p>\n<p>这一章只处理事件到达的先后顺序。你会创建\n<code>packages/pi-course/src/event-stream.ts</code>，让同一个 <code>EventStream</code> 同时支持\n<code>for await...of</code> 和 <code>result()</code>。这里不定义消息内容，不连接网络，也不实现取消。</p>\n<p>本章不变量是：</p>\n<blockquote>\n<p>每条流都要有一个明确的终态。迭代器和 <code>result()</code> 必须由同一个终态结束，\n不能一个已经完成，另一个还在等。</p>\n</blockquote>\n<p>需要重新开始时，保留当前练习目录，再运行\n<code>npm run practice -w @pi/course -- 02 &lt;新目录&gt;</code>。练习目录没有 Git 历史，\n不要在里面执行 <code>git restore</code>，也不要修改注入的聚焦测试。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 02 · 先闭合一次 push 与 next\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 02 · 先闭合一次 push 与 next</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 01 的 target 开始，只引入时间与等待关系。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/event-stream.ts</code></p>\n<p><strong>动手前只需知道：</strong> <code>queue</code> 保存“事件先到”的情况；<code>waiter</code> 是正在等待下一项的\n迭代器；终态表示以后不会再有新事件。<code>push()</code> 每次只能二选一：把事件交给一个\nwaiter，或者放进 queue。<code>result()</code> 等的是终态提取出的最终值。</p>\n<p><strong>第一次红灯：</strong> parent 里还没有 <code>event-stream.ts</code>。首次 build 会报\n<code>Cannot find module &#39;../src/event-stream.js&#39;</code>。测试中的 <code>.js</code> 路径没有写错；\n你要创建同名的 <code>.ts</code> 源文件。</p>\n<p><strong>第一步：</strong></p>\n<ol>\n<li>先不看 target diff，运行一次 build，记下第一条错误。</li>\n<li>阅读两项聚焦测试，画出“先 <code>push</code> 后 <code>next</code>”和“先 <code>next</code> 后 <code>push</code>”\n两条时间线。</li>\n<li>先声明完整公共接口，再只实现 queue 路径；下一次实验再补 waiter 路径。</li>\n<li>最后让终态同时结束迭代和 <code>result()</code>。</li>\n</ol>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/02-event-stream.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 02</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 02</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/02-*.test.js</code></p>\n<p><strong>通过证据：</strong> 2 项聚焦测试通过；queue 与 waiter 两条路径都能结束，你能说明\n为什么终态本身仍要交给迭代器，以及 <code>result()</code> 为什么不能另走一套完成逻辑。</p>\n<p>第一次尝试禁止查看完整答案；若卡住，先让陪练只指出 queue、waiter、terminal 三类状态。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p><code>AsyncIterable&lt;T&gt;</code> 解决的是“下一项什么时候到”，却没有单独保存最终结果。\n如果调用者只拼接 delta，就会丢掉 stop reason、usage 和错误信息。我们需要让\n同一个对象同时提供逐项事件和最终结果：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">生产者 push(e1) ─────┐\n         push(e2) ───┼──→ for await (过程证据)\n         push(done) ─┘\n              │\n              └─────────→ result() (最终事实)</code></pre></figure><p>事件流不是一组回调。消费者每次只请求下一项。queue 里有事件，就马上取出；\n没有，就登记一个 waiter。终态也要像普通事件一样交给迭代器，同时解析出最终结果。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"运行前先判断\"><header><span class=\"block-kicker\">先预测</span><h4>运行前先判断</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>消费者收到第一个 delta 后 <code>break</code>，生产者是否会自动停止？另一个调用了 <code>result()</code> 的任务会自动完成吗？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>都不会因为 <code>break</code> 自动取消。退出迭代只表示这个消费者不再拉取；生产者必须收到并观察 <code>AbortSignal</code> 才会停止。若生产者继续推送最终事件，<code>result()</code> 仍会完成；若生产者既不停也不发终态，它就会悬挂。</p>\n</div></details></section><h2 id=\"一条流需要队列等待者与终态\"><a class=\"heading-anchor\" href=\"#一条流需要队列等待者与终态\" aria-label=\"链接到 一条流需要队列、等待者与终态\">#</a>一条流需要队列、等待者与终态</h2><p>下面是核心数据结构。构造器接收两个纯函数：怎样识别终态，以及怎样从终态提取结果。这样通用容器不需要理解模型消息：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export class EventStream&lt;T, R = T&gt; implements AsyncIterable&lt;T&gt; {\n  private queue: T[] = [];\n  private waiting: Array&lt;(item: IteratorResult&lt;T&gt;) =&gt; void&gt; = [];\n  private done = false;\n  private readonly finalResult: Promise&lt;R&gt;;\n  private resolveFinalResult!: (result: R) =&gt; void;\n\n  constructor(\n    private readonly isComplete: (event: T) =&gt; boolean,\n    private readonly extractResult: (event: T) =&gt; R,\n  ) {\n    this.finalResult = new Promise&lt;R&gt;((resolve) =&gt; {\n      this.resolveFinalResult = resolve;\n    });\n  }\n\n  result(): Promise&lt;R&gt; {\n    return this.finalResult;\n  }\n}</code></pre></figure><p><code>queue</code> 保存“事件先到”的情况，<code>waiting</code> 保存“消费者先等”的情况。<code>done</code> 防止终态后继续写入。<code>finalResult</code> 在构造时创建一次，所以先调用还是后调用 <code>result()</code> 都指向同一事实。</p>\n<section class=\"learning-block learning-block--mechanism\" aria-label=\"只保留一个结束位置\"><header><span class=\"block-kicker\">关键机制</span><h4>只保留一个结束位置</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>如果两段代码分别控制迭代结束和最终结果，状态很容易分叉：迭代器已经结束，\n<code>result()</code> 却还在等；或者 <code>result()</code> 已经返回，队列里仍在增加 delta。\n终态必须是唯一结束位置。同一次 <code>push()</code> 既处理终态，也交付这条事件。</p>\n</div></section><p>这一版只支持一个事件消费者。多个地方调用 <code>result()</code> 没问题，因为它们等待同一个\nPromise；两个 <code>for await</code> 却会争抢同一条 queue，不会各自收到完整事件。\n先把这个限制说清楚。以后若界面和 Agent loop 都要读取过程事件，应由上层明确转发，\n不能偷偷复制几份 queue。</p>\n<p><code>AsyncIterable</code> 也不会自动解决背压。它让消费者决定何时请求下一项，却挡不住一个\n不断调用 <code>push()</code> 的生产者。provider 比界面快时，queue 仍会增长。模型响应通常\n不长，本章先把结束语义写对；无界日志还需要容量上限、暂停或丢弃策略。</p>\n<p><code>push()</code> 的关键不是数组操作，而是顺序：先识别终态并解析结果，再把该事件交给等待者或队列。终态本身仍然可观察。</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">push(event: T): void {\n  if (this.done) return;\n\n  if (this.isComplete(event)) {\n    this.done = true;\n    this.resolveFinalResult(this.extractResult(event));\n  }\n\n  const waiter = this.waiting.shift();\n  if (waiter) waiter({ value: event, done: false });\n  else this.queue.push(event);\n}</code></pre></figure><p>异步迭代器循环遵守同样的优先级：先清空队列，再看是否结束，最后才等待新事件。这可避免终态已入队却被 <code>done</code> 提前截掉。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 2.1 · 同时证明过程和结果\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 2.1 · 同时证明过程和结果</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 让一个终态完成两种消费方式。</p>\n<p><strong>文件：</strong> <code>packages/pi-course/src/event-stream.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>先声明完整公共接口：构造器、<code>push()</code>、<code>end(result)</code>、<code>result()</code> 和异步迭代器。\n这样 TypeScript 能编译整份只读测试；<code>end(result)</code> 与“空 queue 且未结束”的分支\n暂时抛出 <code>new Error(&quot;not implemented in lab 2.1&quot;)</code>。</li>\n<li>实现构造器、<code>result()</code> 和 <code>push()</code>。普通事件优先交给 waiter；没有 waiter\n才放进 queue。</li>\n<li>收到终态时，先完成最终 Promise，再照常交付这条终态事件。</li>\n<li>实现异步迭代器的 queue 与 done 分支。保持注入测试不动，只运行第一项测试。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run build -w @pi/course</code>，然后\n<code>node --test --test-name-pattern=&quot;先到的事件&quot; packages/pi-course/dist/test/02-*.test.js</code></p>\n<p><strong>预期：</strong> 第一项测试读到 <code>delta → done</code>，<code>result()</code> 返回 <code>&quot;AB&quot;</code>。</p>\n</div></section><section class=\"learning-block learning-block--lab\" aria-label=\"实践 2.2 · 接住先等待的迭代器\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 2.2 · 接住先等待的迭代器</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 在 queue 为空时保存 waiter，并让 <code>end()</code> 唤醒它。</p>\n<p><strong>文件：</strong> <code>packages/pi-course/src/event-stream.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>在 queue 为空且流未结束时，创建 Promise，把它的 <code>resolve</code> 放进 waiting。</li>\n<li>下一次 <code>push()</code> 取出最早的 waiter，并把事件直接交给它。</li>\n<li>实现 <code>end(result)</code>：完成最终 Promise、标记结束，并把仍在等待的迭代器全部唤醒为 <code>done: true</code>。</li>\n<li>删除 Lab 2.1 的两个临时异常，运行完整聚焦测试；不要增加 <code>setTimeout</code>。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/02-*.test.js</code></p>\n<p><strong>预期：</strong> 先调用 <code>next()</code> 得到 pending Promise；随后一次 <code>push()</code> 就能唤醒它。\n<code>end(&quot;A&quot;)</code> 让下一次 <code>next()</code> 返回 <code>done: true</code>，同时让 <code>result()</code> 返回 <code>&quot;A&quot;</code>。</p>\n</div></section><aside class=\"learning-block learning-block--note\" aria-label=\"本章不实现取消\"><header><span class=\"block-kicker\">旁注</span><h4>本章不实现取消</h4><small>不阻断主线</small></header><div class=\"block-body\"><p>取消需要 <code>AbortSignal</code>、生产者协作和 <code>error</code> 终态，不能只在 EventStream 上加一个\n布尔值。本章 target 没有这些代码，也没有取消测试。第 04 章先处理“开始前已取消”，\n第 05 章再处理传输中的取消，第 09 章由 Agent 统一管理一次运行的取消。\n这里先把 queue、waiter 和终态写对。</p>\n</div></aside><aside class=\"learning-block learning-block--note\" aria-label=\"这两项测试到底证明了什么\"><header><span class=\"block-kicker\">旁注</span><h4>这两项测试到底证明了什么</h4><small>不阻断主线</small></header><div class=\"block-body\"><p>2 项聚焦测试覆盖 queue 路径、waiter 路径和可观察终态。第一项检查终态\n<code>push()</code> 会完成 <code>result()</code>；第二项检查显式 <code>end(&quot;A&quot;)</code> 会同时结束迭代并让\n<code>result()</code> 返回 <code>&quot;A&quot;</code>。它们不证明取消、错误终态、多个消费者或无限队列已经实现。\n后文提到这些问题时，只是在划清边界，不是把它们算进本章绿灯。</p>\n</div></aside><aside class=\"learning-block learning-block--pi\" aria-label=\"与当前上游 Pi 对照\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>与当前上游 Pi 对照</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>固定提交 <code>8479bd8</code> 的 <code>packages/ai/src/utils/event-stream.ts</code> 也让\n<code>EventStream&lt;T,R&gt;</code> 实现 <code>AsyncIterable&lt;T&gt;</code>，并提供 <code>result(): Promise&lt;R&gt;</code>。\n上游的 <code>AssistantMessageEventStream</code> 还把 <code>done</code> 和 <code>error</code> 都当作终态。\n课程这一章只实现更小的单消费者版本；错误与取消会在后续 checkpoint 接入。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><p>一个常见错误是完成了 <code>result()</code>，却把终态本身吞掉：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">// 错误示例\nif (this.isComplete(event)) {\n  this.done = true;\n  this.resolveFinalResult(this.extractResult(event));\n  return; // 终态没有进入 queue，也没有交给 waiter\n}</code></pre></figure><section class=\"learning-block learning-block--failure\" aria-label=\"预期失败 · 吞掉终态事件\"><header><span class=\"block-kicker\">故障实验</span><h4>预期失败 · 吞掉终态事件</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>在终态分支末尾临时加入上面的 <code>return</code>，再运行聚焦测试。测试应立即失败：\n<code>result()</code> 仍返回 <code>&quot;AB&quot;</code>，迭代序列却只有 <code>delta</code>，缺少 <code>done</code>。删除 <code>return</code>，\n让终态继续走普通交付路径。这个实验不会制造永远等待的测试。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 02 · 时间成为显式协议\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 02 · 时间成为显式协议</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p>运行 <code>npm run build -w @pi/course</code>，再运行\n<code>node --test packages/pi-course/dist/test/02-*.test.js</code>，结果应为 2/2。\n你要能画出 queue 与 waiter 两条时间线，并解释为什么终态既要出现在迭代序列里，\n又要完成 <code>result()</code>。确认只修改 <code>packages/pi-course/src/event-stream.ts</code>。\n下一章会把通用的 <code>T</code> 和 <code>R</code> 换成 Agent 自己的消息类型。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"迁移 · 构造可取消的字节流\"><header><span class=\"block-kicker\">可选迁移</span><h4>迁移 · 构造可取消的字节流</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>不给 starter：定义 <code>ByteEvent = chunk | done | error</code>，用 <code>EventStream&lt;ByteEvent, Uint8Array&gt;</code> 传送三段字节。要求启动前取消和中途取消都产生终态，最终字节顺序保持不变。测试不能只断言长度，还要断言事件顺序和 <code>result()</code>。</p>\n</div></section><h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><p>EventStream 把“事件何时到达”写进了接口。<code>AsyncIterable</code> 负责逐项读取，\n<code>result()</code> 负责最终结果，唯一终态让两边一起结束。本章还没有取消、错误终态和\n多消费者；这些能力会在拥有足够消息语义之后逐步接入。下一章先定义 Pi 内部长期\n使用的统一消息格式。</p>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "一条流需要队列等待者与终态",
        "title": "一条流需要队列、等待者与终态",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "EventStream：让过程和结果走同一条流 实现一个既能逐项读取事件、又能等待最终结果的异步流，并把终态写成唯一结束信号。 第一部 · 建立可执行语言 AsyncIterable, EventStream, queue, waiter, terminal event 你将得到什么 先建立全景 一条流需要队列、等待者与终态 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/02-event-stream.md"
  },
  {
    "id": "03",
    "slug": "message-ir",
    "part": "foundations",
    "partTitle": "第一部 · 建立可执行语言",
    "chapter": "03",
    "title": "给 Agent 一套自己的消息格式",
    "summary": "用稳定的消息和内容块保存语义，不让界面格式或某家模型接口渗进核心。",
    "minutes": 100,
    "difficulty": "核心",
    "artifact": "packages/pi-course/src/types.ts",
    "prerequisites": [
      "02"
    ],
    "terms": [
      "canonical IR",
      "content block",
      "AgentContext",
      "StopReason",
      "projection"
    ],
    "upstream": [
      "packages/ai/src/types.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "f14e72ada045ccd3d6dc5d1b5054dc3604e1c3dc",
    "parentCommit": "febad6212da194f10bb5395429a61c672060f75a",
    "commitSubject": "define the canonical message IR",
    "checkpointTest": "packages/pi-course/test/03-message-ir.test.ts",
    "html": "<h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>上一章的 <code>EventStream&lt;T,R&gt;</code> 已经知道事件怎么到达，却不知道 <code>T</code> 和 <code>R</code>\n具体是什么。如果把某家 SDK 的 chunk 直接传进 Agent，换模型服务、保存会话和\n调用工具时，每一层都会依赖那家 SDK。</p>\n<p>本章给 Agent 定义一套自己的消息格式。这里把它叫作 canonical message：\n它是系统认可、可以保存和重放的统一消息。你会新增\n<code>packages/pi-course/src/types.ts</code>，并修改\n<code>packages/pi-course/src/event-stream.ts</code>，让上一章的通用流变成\n<code>EventStream&lt;ModelEvent, AssistantMessage&gt;</code>。</p>\n<p>本章不变量是：</p>\n<blockquote>\n<p>Provider payload、界面文字和 canonical message 分属三层。只有 canonical\nmessage 能成为 Agent 长期保存的事实。</p>\n</blockquote>\n<p>需要重新开始时，用 <code>npm run practice -w @pi/course -- 03 &lt;新目录&gt;</code> 创建新练习。\n不要修改注入测试，也不要为了适配后续 provider 样例而扭曲本章的消息结构。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 03 · 先定义不会随 provider 改变的事实\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 03 · 先定义不会随 provider 改变的事实</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 02 的 target 开始，先定义统一消息，再让 EventStream 使用它。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong></p>\n<ul>\n<li><code>packages/pi-course/src/types.ts</code></li>\n<li><code>packages/pi-course/src/event-stream.ts</code></li>\n</ul>\n<p><strong>动手前只需知道：</strong></p>\n<ul>\n<li>content block 是消息里有顺序的一小块内容；</li>\n<li>canonical message 是 Agent 自己保存的统一消息；</li>\n<li>投影是从完整消息中取出某个只读视图，例如只取文本；</li>\n<li><code>StopReason</code> 说明模型为什么结束，并决定下一步控制流。</li>\n</ul>\n<p><strong>第一次红灯：</strong> 首次 build 会同时报告两处真实缺口：\n<code>event-stream.js</code> 没有导出 <code>AssistantMessageEventStream</code>，并且找不到\n<code>../src/types.js</code>。因此本章必须修改两个源文件。</p>\n<p><strong>第一步：</strong></p>\n<ol>\n<li>先运行 build，确认上面两条错误。</li>\n<li>在 <code>types.ts</code> 定义消息类型和 <code>text</code>、<code>assistantMessage</code>、<code>textOf</code>。</li>\n<li>在 <code>event-stream.ts</code> 先声明可编译的临时 <code>AssistantMessageEventStream</code>，\n只运行“文本投影”测试。</li>\n<li>再把临时类改成真正识别 <code>done | error</code> 的消息流，运行完整测试。</li>\n</ol>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/03-message-ir.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 03</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 03</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/03-*.test.js</code></p>\n<p><strong>通过证据：</strong> 2 项聚焦测试通过：文本投影不修改原 content；<code>error</code> 事件会\n自行结束流，而且 <code>result()</code> 返回传入事件的那条 <code>AssistantMessage</code>，其中的\n错误说明没有丢失。你还能解释 provider payload、统一消息和界面投影为什么不能混用。</p>\n<p>第一次尝试禁止查看完整答案；让陪练先定位最小 helper，不要一次展开整个消息联合。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>同一个用户意图，在不同边界有不同表示：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">终端输入：&quot;读取 README&quot;\n        ↓  UI 构造\nUserMessage { role: &quot;user&quot;, content: [{ type: &quot;text&quot;, text: &quot;读取 README&quot; }] }\n        ↓  provider adapter 翻译\n某家 API 的 { role: &quot;user&quot;, content: &quot;读取 README&quot; }</code></pre></figure><p>中间那层才是 Agent 自己保存的消息。UI 从中取出适合显示的内容，adapter 把它\n翻译成某家 API 的格式。若 session 直接保存 API payload，换 provider 就要迁移\n历史数据；若只保存终端文字，tool call 的 id 和参数会直接丢失。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"运行前先判断\"><header><span class=\"block-kicker\">先预测</span><h4>运行前先判断</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>把 assistant 的所有 content block 用 <code>JSON.stringify</code> 或字符串拼接成一段文本，是否仍能无损恢复“先解释一句，再请求 read 工具”？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>不能可靠恢复。文本和 tool call 的顺序、类型、call id、工具名及结构化参数都需要独立字段。把它们压成字符串后，显示格式会变成协议，稍改换行就可能破坏恢复。</p>\n</div></details></section><h2 id=\"content-block-保存有顺序的语义\"><a class=\"heading-anchor\" href=\"#content-block-保存有顺序的语义\" aria-label=\"链接到 Content block 保存有顺序的语义\">#</a>Content block 保存有顺序的语义</h2><p>课程先实现文本和工具调用两种 block。它们共享 <code>type</code> 判别字段，却只携带各自合法的数据：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export interface TextContent {\n  type: &quot;text&quot;;\n  text: string;\n}\n\nexport interface ToolCall {\n  type: &quot;toolCall&quot;;\n  id: string;\n  name: string;\n  arguments: unknown;\n  rawArguments?: string;\n}\n\nexport type AssistantContent = TextContent | ToolCall;</code></pre></figure><p>产生 <code>toolUse</code> 终态前，<code>toolcall_end</code> 会把完整 JSON 写入 <code>arguments</code>。\n第 05 章会处理 provider 分段发送的字符串。若输出因 <code>length</code> 被截断，系统保留\n未完成的 <code>rawArguments</code>，但绝不能执行。第 06 章才会按工具 schema 验证参数。\nJSON 能解析，只说明格式完整，不说明参数可以执行。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 3.1 · 定义消息并实现文本投影\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 3.1 · 定义消息并实现文本投影</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 保留完整语义，同时给 UI 一个安全投影。</p>\n<p><strong>文件：</strong></p>\n<ul>\n<li><code>packages/pi-course/src/types.ts</code></li>\n<li><code>packages/pi-course/src/event-stream.ts</code></li>\n</ul>\n<p><strong>动作：</strong></p>\n<ol>\n<li>定义 <code>TextContent</code>、<code>ToolCall</code>、三种 message、<code>StopReason</code> 与最小 helper。</li>\n<li>实现 <code>textOf(message)</code>，只按原顺序提取 text block。</li>\n<li>为了让整份只读测试先编译，在 <code>event-stream.ts</code> 临时声明\n<code>AssistantMessageEventStream</code>。它继承\n<code>EventStream&lt;ModelEvent, AssistantMessage&gt;</code>，构造器先传入两个不会在本实验\n执行的临时函数，并在提取函数里抛出 <code>&quot;not implemented in lab 3.1&quot;</code>。</li>\n<li>保持注入测试不动，只运行名称含“文本投影”的第一项测试。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run build -w @pi/course</code>，然后\n<code>node --test --test-name-pattern=&quot;文本投影&quot; packages/pi-course/dist/test/03-*.test.js</code></p>\n<p><strong>预期：</strong> 文本投影保持两个文本块的顺序；tool call 仍完整存在于原消息中。</p>\n</div></section><h2 id=\"三种消息承担不同所有权\"><a class=\"heading-anchor\" href=\"#三种消息承担不同所有权\" aria-label=\"链接到 三种消息承担不同所有权\">#</a>三种消息承担不同所有权</h2><p>消息联合不使用大量可选字段，而是让角色决定合法内容：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export type StopReason =\n  | &quot;stop&quot;\n  | &quot;length&quot;\n  | &quot;toolUse&quot;\n  | &quot;error&quot;\n  | &quot;aborted&quot;;\n\nexport interface UserMessage {\n  role: &quot;user&quot;;\n  content: TextContent[];\n  timestamp: number;\n}\n\nexport interface AssistantMessage {\n  role: &quot;assistant&quot;;\n  content: AssistantContent[];\n  provider: string;\n  model: string;\n  usage: { input: number; output: number; totalTokens: number };\n  stopReason: StopReason;\n  errorMessage?: string;\n  timestamp: number;\n}\n\nexport interface ToolResultMessage {\n  role: &quot;toolResult&quot;;\n  toolCallId: string;\n  toolName: string;\n  content: TextContent[];\n  details?: unknown;\n  isError: boolean;\n  timestamp: number;\n}\n\nexport type AgentMessage =\n  | UserMessage\n  | AssistantMessage\n  | ToolResultMessage;</code></pre></figure><p><code>toolResult</code> 是独立角色。它记录环境对某个 call 的返回，不属于用户，也不是模型\n自己说的话。<code>error</code> 和 <code>aborted</code> 仍保存在最终 <code>AssistantMessage</code> 里。这样一次\n失败调用也能保留已经生成的文本、usage 和错误说明。</p>\n<section class=\"learning-block learning-block--mechanism\" aria-label=\"StopReason 决定下一步，不是装饰字段\"><header><span class=\"block-kicker\">关键机制</span><h4>StopReason 决定下一步，不是装饰字段</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p><code>stop</code> 表示可结束本轮；<code>toolUse</code> 表示需要执行完整且已验证的调用；<code>length</code> 表示输出可能截断，后续绝不能贸然执行其中的工具参数；<code>error</code> 与 <code>aborted</code> 终止当前运行。把它们压成一个布尔值会丢失控制语义。</p>\n</div></section><p>Usage 也属于协议，而不只是日志。<code>input</code> 描述本次 context 的消耗，<code>output</code> 描述生成量，<code>totalTokens</code> 给上层预算与诊断一个统一基线。课程先不计算价格和缓存命中，但仍要求三者是数字字段，因为第 11 章会根据预算重建 context。若 adapter 没拿到可信 usage，应使用明确的缺省策略并保留诊断，不能从文本长度假装得到精确 token 数。</p>\n<p>可以把最终消息看成一次模型调用的提交记录：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">stop       完成回答，可以结束\ntoolUse    产生完整调用，交给工具层\nlength     输出被截断，保留事实但禁止执行调用\nerror      调用失败，保留 partial 与错误说明\naborted    用户取消，保留 partial 与取消事实</code></pre></figure><p><code>stop</code>、<code>toolUse</code> 和 <code>length</code> 通过 <code>done</code> 事件结束；<code>error</code> 和 <code>aborted</code>\n通过 <code>error</code> 事件结束。两类终态最终都能由 <code>result()</code> 取得。事件名表示流走了\n哪条路径，message 的 stop reason 表示模型为什么结束。两者必须匹配。当前聚焦\n测试只观察 <code>error + error</code>；其他组合会在后续模型与 adapter 测试中逐步补齐。</p>\n<p><code>textOf()</code> 是有损投影，不能用于重新构造 message。它适合搜索摘要与终端显示；保存和重放必须使用原始 block 数组。函数名和返回类型应让这种损失显而易见，避免调用者把便利函数误当序列化协议。</p>\n<h2 id=\"context-是本次请求的输入视图\"><a class=\"heading-anchor\" href=\"#context-是本次请求的输入视图\" aria-label=\"链接到 Context 是本次请求的输入视图\">#</a>Context 是本次请求的输入视图</h2><p><code>AgentContext</code> 不是整个 session。它只包含本次模型决策需要的 system prompt 与消息序列：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export interface AgentContext {\n  systemPrompt?: string;\n  messages: AgentMessage[];\n}\n\nconst nextContext: AgentContext = {\n  systemPrompt: previous.systemPrompt,\n  messages: [...previous.messages, newUserMessage],\n};</code></pre></figure><p>用新数组构造下一状态，能让测试比较请求前后的事实。第 10 章会把 session 建成追加式事件树，第 11 章再从历史投影 context；本章不做裁剪，也不把 context 持久化成唯一真相。</p>\n<p>消息保留 <code>timestamp</code>，但不加入随机 message id。时间由 canonical message 构造器在边界生成，fixture 可显式给定或在断言中归一化；provider 不应另造一套时间字段。到了会话层，稳定 entry id 将由拥有追加责任的组件生成。先明确所有权，再添加元数据，才能避免恢复时出现两个时钟或无法配对的 id。</p>\n<p>上一章的流现在可以有准确终态：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export type ModelEvent =\n  | { type: &quot;start&quot;; partial: AssistantMessage }\n  | { type: &quot;text_delta&quot;; contentIndex: number; delta: string; partial: AssistantMessage }\n  | { type: &quot;toolcall_delta&quot;; contentIndex: number; delta: string; partial: AssistantMessage }\n  | { type: &quot;toolcall_end&quot;; contentIndex: number; toolCall: ToolCall; partial: AssistantMessage }\n  | { type: &quot;done&quot;; reason: &quot;stop&quot; | &quot;length&quot; | &quot;toolUse&quot;; message: AssistantMessage }\n  | { type: &quot;error&quot;; reason: &quot;error&quot; | &quot;aborted&quot;; error: AssistantMessage };</code></pre></figure><p><code>done</code> 与 <code>error</code> 都是流终态，<code>EventStream.result()</code> 对两者都 resolve 最终 assistant message。调用者不必猜测 provider 是在首字节前还是中途失败。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 3.2 · 让终态与结果一致\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 3.2 · 让终态与结果一致</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 把第 02 章的通用流绑定到消息 IR。</p>\n<p><strong>文件：</strong> <code>packages/pi-course/src/event-stream.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>删除 Lab 3.1 的临时构造逻辑。</li>\n<li>让 <code>AssistantMessageEventStream</code> 识别 <code>done | error</code>。</li>\n<li><code>done</code> 提取 <code>event.message</code>，<code>error</code> 提取 <code>event.error</code>；其他事件不能生成结果。</li>\n<li>运行完整聚焦测试。测试不会额外调用 <code>end()</code>；<code>error</code> 事件必须自己结束流。</li>\n<li>观察 <code>result()</code> 是否返回传入事件的那条失败消息，并保留 <code>errorMessage</code>。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run build -w @pi/course</code>，然后\n<code>node --test packages/pi-course/dist/test/03-*.test.js</code></p>\n<p><strong>预期：</strong> <code>error</code> 事件会结束异步迭代，<code>result()</code> 返回同一个消息对象。消息保留\n<code>stopReason: &quot;error&quot;</code> 和 <code>errorMessage</code>。测试设有一秒超时；若你的流没有把\n<code>error</code> 识别为终态，它会明确失败，而不是一直等待。本章没有单独测试 <code>aborted</code>。</p>\n</div></section><aside class=\"learning-block learning-block--note\" aria-label=\"这两项测试到底证明了什么\"><header><span class=\"block-kicker\">旁注</span><h4>这两项测试到底证明了什么</h4><small>不阻断主线</small></header><div class=\"block-body\"><p>2 项聚焦测试证明两件事：<code>textOf()</code> 是有损文本投影，但不修改原始 content；\n<code>error</code> 是协议终态，<code>result()</code> 会返回传入事件的消息，并保留错误说明。三种角色、五种\n<code>StopReason</code> 和 <code>AgentContext</code> 仍是后续章节所需的公共协议；本章通过类型检查\n和口头解释验收它们，不能说两项行为测试已经覆盖所有组合。</p>\n</div></aside><aside class=\"learning-block learning-block--pi\" aria-label=\"与当前上游 Pi 对照\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>与当前上游 Pi 对照</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>固定提交 <code>8479bd8</code> 的 <code>packages/ai/src/types.ts</code> 同样以 <code>Message = UserMessage | AssistantMessage | ToolResultMessage</code>、content blocks、五种 <code>StopReason</code> 和 <code>Context</code> 建立边界。课程也保留 provider、model、timestamp 与最小 usage；上游还包含 image、thinking、签名、API、缓存与成本。省略部分属于教学简化，不是说额外字段无价值。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><p>如果为了“方便打印”把 tool result 改成 assistant 文本：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">// 错误：环境事实失去了 call 的配对键\nconst fakeResult = assistantMessage(\n  [{ type: &quot;text&quot;, text: &quot;README 内容是……&quot; }],\n  &quot;stop&quot;,\n);</code></pre></figure><p>后续 provider 无法知道这段内容回答哪个调用，并行工具更会立刻产生歧义。</p>\n<section class=\"learning-block learning-block--failure\" aria-label=\"预期失败 · 把工具调用混进文本投影\"><header><span class=\"block-kicker\">故障实验</span><h4>预期失败 · 把工具调用混进文本投影</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>临时让 <code>textOf()</code> 遇到 tool call 时也返回 <code>block.name</code>，再运行聚焦测试。第一项测试\n应立即得到 <code>&quot;先读取\\nread\\n再回答&quot;</code>，而不是 <code>&quot;先读取\\n再回答&quot;</code>。恢复只提取\n<code>text</code> block 的实现，并确认原 content 始终没有被改写。<code>toolCallId</code> 的配对约束\n会在第 06、07 章由工具与循环测试真正观察。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 03 · 核心拥有自己的语言\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 03 · 核心拥有自己的语言</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p>运行 <code>npm run build -w @pi/course</code>，再运行\n<code>node --test packages/pi-course/dist/test/03-*.test.js</code>，结果应为 2/2。确认只修改\n<code>types.ts</code> 与 <code>event-stream.ts</code>。你要能区分统一消息、provider payload 和界面投影，\n并说明五种 stop reason 各自要求什么控制动作。下一章会让 <code>ScriptedModel</code>\n按这套协议产生确定事件。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"迁移 · 增加只读的 image block\"><header><span class=\"block-kicker\">可选迁移</span><h4>迁移 · 增加只读的 image block</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>独立设计 <code>ImageContent</code>，要求包含 MIME type 与数据引用；判断它能出现在哪些 message 中，并修改穷尽投影测试。不要把图片伪装成文本 URL。完成后写一句说明：为什么课程主线暂不把它加入公共接口。</p>\n</div></section><h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><p>Agent 现在有了自己的消息格式。Content block 保留内容类型和顺序；user、\nassistant、toolResult 三种角色各自记录不同来源的事实；stop reason 决定下一步\n控制动作；context 只是一次模型请求要看到的消息。数据和时间都有了稳定接口，\n下一章才能写一个行为完全可预测的模型。</p>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "content-block-保存有顺序的语义",
        "title": "Content block 保存有顺序的语义",
        "level": 2
      },
      {
        "id": "三种消息承担不同所有权",
        "title": "三种消息承担不同所有权",
        "level": 2
      },
      {
        "id": "context-是本次请求的输入视图",
        "title": "Context 是本次请求的输入视图",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "给 Agent 一套自己的消息格式 用稳定的消息和内容块保存语义，不让界面格式或某家模型接口渗进核心。 第一部 · 建立可执行语言 canonical IR, content block, AgentContext, StopReason, projection 你将得到什么 先建立全景 Content block 保存有顺序的语义 三种消息承担不同所有权 Context 是本次请求的输入视图 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/03-message-ir.md"
  },
  {
    "id": "04",
    "slug": "scripted-model",
    "part": "foundations",
    "partTitle": "第一部 · 建立可执行语言",
    "chapter": "04",
    "title": "ScriptedModel：把模型行为写成可执行规格",
    "summary": "用按轮消费的确定性脚本生成模型事件，稳定验证请求快照、事件顺序、终态和失败。",
    "minutes": 100,
    "difficulty": "核心",
    "artifact": "packages/pi-course/src/scripted-model.ts",
    "prerequisites": [
      "02",
      "03"
    ],
    "terms": [
      "test double",
      "executable specification",
      "deterministic trace",
      "recorded request"
    ],
    "upstream": [
      "packages/ai/src/providers/faux.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "f471390720ffae304c407b2de07b75bbbf7a1b97",
    "parentCommit": "f14e72ada045ccd3d6dc5d1b5054dc3604e1c3dc",
    "commitSubject": "turn model behavior into executable scripts",
    "checkpointTest": "packages/pi-course/test/04-scripted-model.test.ts",
    "html": "<h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>前两章已经定义了消息和事件流，但还没有组件负责生产模型事件。如果现在直接连接\n真实 LLM，网络、鉴权、费用、限流和随机输出会同时进入测试。测试失败时，你很难\n判断究竟是 Agent 协议写错了，还是远端服务临时发生了变化。</p>\n<p>本章处理一个新问题：如何构造一个遵守真实模型边界、行为又完全确定的事件生产者。\n你将实现 <code>ScriptedModel</code>。它按轮读取预先写好的脚本，记录每次传入的 context，\n并把成功、错误和预先取消都转换成统一的模型事件。</p>\n<p>本章不变量是：</p>\n<blockquote>\n<p><code>ScriptedModel</code> 和真实 adapter 都满足同一个 <code>Model.stream()</code> 契约。上层代码\n只消费模型事件，不需要判断当前接入的是脚本模型还是真实服务。</p>\n</blockquote>\n<p>重新练习时，运行 <code>npm run practice -w @pi/course -- 04 &lt;新目录&gt;</code>。练习目录会\n保留第 03 章实现，只移除本章的 <code>scripted-model.ts</code>，并注入第 04 章聚焦测试。</p>\n<h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p><code>ScriptedModel</code> 是一种 test double，也就是专门替代外部依赖的测试实现。它和一个\n随便返回 <code>&quot;hello&quot;</code> 的 mock 不同：脚本描述的是某一轮模型最终应产生什么消息，\n<code>ScriptedModel</code> 仍要按照真实协议生成中间事件和终态。</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">AgentContext\n    │\n    ▼\nScriptedModel.stream(context, { signal })\n    ├─ 立即返回 AssistantMessageEventStream\n    ├─ 保存 context 在调用时的快照\n    └─ 在 microtask 中读取一个 ScriptedTurn\n          TextContent → text_delta\n          ToolCall    → toolcall_delta → toolcall_end\n          正常消息    → done\n          错误或取消  → error</code></pre></figure><p>microtask 是“当前同步代码结束后立刻执行”的小任务。<code>stream()</code> 先把流返回给调用者，\n再由 microtask 发送事件。这样消费者可以先拿到流并开始等待；认证、模型运行或网络\n阶段发生的失败，也能统一通过流内的 <code>error</code> 终态报告。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"运行前先判断\"><header><span class=\"block-kicker\">先预测</span><h4>运行前先判断</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>如果 <code>requests</code> 直接保存传入的 <code>context</code> 引用，调用者随后向\n<code>context.messages</code> 追加一条消息，<code>requests[0]</code> 记录的是调用发生时的输入，\n还是修改后的输入？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>它会跟着原对象一起变化，因此记录的是修改后的输入。调用时应保存\n<code>structuredClone(context)</code>。只有快照固定下来，测试才能准确回答“这一轮模型\n当时看到了什么”。</p>\n</div></details></section><h2 id=\"先固定-model-的唯一入口\"><a class=\"heading-anchor\" href=\"#先固定-model-的唯一入口\" aria-label=\"链接到 先固定 Model 的唯一入口\">#</a>先固定 Model 的唯一入口</h2><p>第 03 章已经在 <code>types.ts</code> 中定义了 <code>Model</code> 和 <code>ModelStream</code>。本章不修改这些接口，\n只实现它们：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export interface Model {\n  stream(\n    context: AgentContext,\n    options?: { signal?: AbortSignal },\n  ): ModelStream;\n}\n\nexport interface ModelStream extends AsyncIterable&lt;ModelEvent&gt; {\n  result(): Promise&lt;AssistantMessage&gt;;\n}</code></pre></figure><p>脚本中的一个回合有两种写法。正常回合直接提供最终 <code>AssistantMessage</code>；错误回合\n提供停止原因、错误说明和可选的部分文本：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export type ScriptedTurn =\n  | AssistantMessage\n  | {\n      stopReason: &quot;error&quot; | &quot;aborted&quot;;\n      errorMessage: string;\n      partialText?: string;\n    };</code></pre></figure><p><code>ScriptedTurn</code> 记录脚本预先规定的最终结果，不直接保存 <code>ModelEvent[]</code>。\n<code>ScriptedModel</code> 仍要先发送 <code>start</code>，再按 content block 的顺序生成事件，最后根据\nstop reason 发送 <code>done</code> 或 <code>error</code>。因此，测试验证的是事件生成边界，而非简单\n回放一组预置事件。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 04 · 让脚本回合满足真实模型边界\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 04 · 让脚本回合满足真实模型边界</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 03 的 target 开始，只加入确定性事件生产者。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>怎么使用这张卡：</strong> 先把它当作路线图。读完上面的全景和接口，再从实践 4.1\n开始写代码。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/scripted-model.ts</code></p>\n<p><strong>动手前只需知道：</strong> 一个 turn 表示一轮模型的最终结果；请求快照记录\n<code>stream()</code> 被调用时的输入；microtask 让方法先返回流，再发送事件。</p>\n<p><strong>第一次红灯：</strong> 首次 build 只报告 TS2307：找不到\n<code>../src/scripted-model.js</code>。这说明本章只缺一个源文件。</p>\n<p><strong>第一步：</strong></p>\n<ol>\n<li>运行 build，确认上面的 TS2307。</li>\n<li>定义 <code>ScriptedTurn</code>、请求记录和按轮读取所需的 cursor。</li>\n<li>完成实践 4.1，只运行名称含“脚本消息”的第一项测试。</li>\n<li>完成实践 4.2，再运行本章全部测试。</li>\n</ol>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/04-scripted-model.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 04</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 04</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/04-*.test.js</code></p>\n<p><strong>通过证据：</strong> 3 项聚焦测试覆盖事件顺序与载荷、累计 partial、两个 turn 的消费\n顺序、请求快照、显式错误回合、脚本耗尽和预取消。调用者使用\n<code>ScriptedModel</code> 或真实 <code>Model</code> 时，无需编写两套消费逻辑。</p>\n<p>第一次尝试禁止查看完整答案。若事件顺序不清楚，陪练只指出当前 content block\n应该产生的下一个事件。</p>\n</div></section><h2 id=\"播放一个成功回合\"><a class=\"heading-anchor\" href=\"#播放一个成功回合\" aria-label=\"链接到 播放一个成功回合\">#</a>播放一个成功回合</h2><p>先看第一项测试中的脚本。它包含一个 text block 和一个 tool call，所以完整事件\n顺序应为：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">start\ntext_delta\ntoolcall_delta\ntoolcall_end\ndone</code></pre></figure><p><code>start</code> 携带空 content 的 partial message。处理每个 block 时，先把当前增量应用到\npartial，再发送事件。这样 <code>text_delta</code> 的 partial 已经包含当前文本；\n<code>toolcall_delta</code> 的 partial 既保留前面的文本，也包含正在生成的 tool call；\n<code>toolcall_end</code> 再把完整参数写入同一位置。播放结束后，终态直接提交脚本中的最终\n消息，不从事件文本重新拼装一次。</p>\n<p>可以先写出类的外框：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export class ScriptedModel implements Model {\n  readonly requests: AgentContext[] = [];\n  private cursor = 0;\n\n  constructor(private readonly turns: ScriptedTurn[]) {}\n\n  stream(\n    context: AgentContext,\n    options: { signal?: AbortSignal } = {},\n  ): AssistantMessageEventStream {\n    const stream = new AssistantMessageEventStream();\n    this.requests.push(structuredClone(context));\n    const turn = this.turns[this.cursor++];\n\n    queueMicrotask(() =&gt; {\n      // 先处理不会播放的分支，再投影一个有效 turn。\n    });\n    return stream;\n  }\n}</code></pre></figure><p>第一阶段仍要让整个测试文件通过 TypeScript 编译。你可以先声明完整\n<code>ScriptedTurn</code> 联合。在 microtask 内先判断三种暂不播放的情况：signal 已取消、\nturn 不存在，或者 turn 没有 <code>role</code> 字段。前两项是失败入口，第三项代表显式错误\nturn。遇到它们时，先临时抛出 <code>&quot;not implemented in lab 4.1&quot;</code>。通过这些判断后，\nTypeScript 也能确认剩下的 turn 就是 <code>AssistantMessage</code>。局部测试只提供正常\nturn，不会执行临时分支。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 4.1 · 投影成功消息并保存请求快照\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 4.1 · 投影成功消息并保存请求快照</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 让一条混合消息产生确定事件，同时固定调用时的 context。</p>\n<p><strong>文件：</strong> <code>packages/pi-course/src/scripted-model.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>声明完整 <code>ScriptedTurn</code>，并建立 <code>requests</code>、<code>cursor</code> 和构造器。</li>\n<li><code>stream()</code> 先克隆 context，再取出当前 turn，然后立即返回新事件流。</li>\n<li>在 microtask 中先判断预取消、脚本耗尽和没有 <code>role</code> 的错误 turn；这三个分支\n暂时抛出明确异常。</li>\n<li>把判断后剩下的正常消息转换成 <code>start</code>、block 事件和 <code>done</code>。</li>\n<li>text block 产生一个 <code>text_delta</code>；它的 <code>contentIndex</code> 指向当前 block，\n<code>delta</code> 是本段文字，<code>partial</code> 已经包含这段文字。</li>\n<li>tool call 先产生 <code>toolcall_delta</code>，再产生 <code>toolcall_end</code>。两个事件都保留\n前面已经播放的 block；end 事件还要携带完整 tool call。</li>\n<li>让模型连续播放两个正常 turn，确认 cursor 每次只前进一格。</li>\n<li>只运行第一项测试。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run build -w @pi/course</code>，然后\n<code>node --test --test-name-pattern=&quot;脚本消息&quot; packages/pi-course/dist/test/04-*.test.js</code></p>\n<p><strong>预期：</strong> 局部测试 <code>1/1</code>。事件名称、delta、content index、tool call 和累计\npartial 都与脚本一致；两个 turn 按声明顺序播放。调用后再修改原 context，\n<code>model.requests[0].messages</code> 仍只有调用时的那一条消息。</p>\n</div></section><h2 id=\"按轮消费并把失败放回流里\"><a class=\"heading-anchor\" href=\"#按轮消费并把失败放回流里\" aria-label=\"链接到 按轮消费，并把失败放回流里\">#</a>按轮消费，并把失败放回流里</h2><p>同一个模型实例会被 Agent 多次调用。cursor 每次只前进一个 turn：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">const model = new ScriptedModel([\n  assistantMessage([\n    text(&quot;我先读取文件。&quot;),\n    {\n      type: &quot;toolCall&quot;,\n      id: &quot;c1&quot;,\n      name: &quot;read&quot;,\n      arguments: { path: &quot;README.md&quot; },\n    },\n  ], &quot;toolUse&quot;),\n  assistantMessage([text(&quot;项目用于学习 Agent。&quot;)], &quot;stop&quot;),\n]);</code></pre></figure><p>第一次调用产生工具请求，第二次调用给出最终回答。第 07 章会把这两个回合接入\nAgent loop。本章只负责模型边界，不负责把上一轮消息写进下一轮 context。</p>\n<p>脚本还必须能稳定表达失败：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">{\n  stopReason: &quot;error&quot;,\n  partialText: &quot;正在&quot;,\n  errorMessage: &quot;rate limited&quot;,\n}</code></pre></figure><p>这条 turn 应产生：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">start\ntext_delta &quot;正在&quot;\nerror reason=error\nresult.stopReason = &quot;error&quot;\nresult.errorMessage = &quot;rate limited&quot;</code></pre></figure><p><code>result()</code> 仍然 resolve 一条 canonical assistant message。上层因此可以同时读取\n部分文本和错误说明。它不会把错误伪装成普通 <code>stop</code>，也不会迫使调用者额外处理\n一个同步 throw 分支。</p>\n<p>脚本耗尽时，<code>ScriptedModel</code> 自己构造 <code>stopReason: &quot;error&quot;</code> 的消息；播放开始前，\n如果 signal 已处于 <code>aborted</code> 状态，就构造 <code>stopReason: &quot;aborted&quot;</code> 的消息。\n这两个分支都只发送 <code>error</code> 终态，不发送 <code>start</code>，也不播放原 turn。所有分支都在\nmicrotask 内完成，所以 <code>stream()</code> 始终先返回事件流。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 4.2 · 补齐错误、耗尽和预取消\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 4.2 · 补齐错误、耗尽和预取消</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 让三类失败也遵守同一个流协议。</p>\n<p><strong>文件：</strong> <code>packages/pi-course/src/scripted-model.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>写一个 helper，把正常 turn 克隆为最终消息，把错误 turn 转成带 partial text\n和 <code>errorMessage</code> 的最终消息。</li>\n<li>删除 Lab 4.1 的临时异常。</li>\n<li>signal 已处于 <code>aborted</code> 状态时，发送对应的 <code>error</code> 事件并结束本次播放。</li>\n<li>turn 不存在时，发送错误说明为\n<code>&quot;ScriptedModel 没有更多响应&quot;</code> 的 <code>error</code> 事件。</li>\n<li>显式错误 turn 仍先发送 <code>start</code> 和已有文本，最后发送 <code>error</code>。</li>\n<li>运行完整聚焦测试。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run build -w @pi/course</code>，然后\n<code>node --test packages/pi-course/dist/test/04-*.test.js</code></p>\n<p><strong>预期：</strong> 3 项测试全部通过。每项流测试都设有一秒超时；遗漏终态会明确失败，\n不会让练习一直等待。</p>\n</div></section><section class=\"learning-block learning-block--mechanism\" aria-label=\"确定性模型负责控制变量\"><header><span class=\"block-kicker\">关键机制</span><h4>确定性模型负责控制变量</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>以后测试 Agent loop 时，可以用脚本精确规定“先请求 read，再给出回答”。模型行为\n固定后，测试中只剩 loop 或 tool 发生变化，失败位置就容易判断。真实服务用于验证\n兼容性；需要稳定证明控制流时，仍应使用确定输入和确定事件。</p>\n</div></section><aside class=\"learning-block learning-block--note\" aria-label=\"这三项测试没有证明什么\"><header><span class=\"block-kicker\">旁注</span><h4>这三项测试没有证明什么</h4><small>不阻断主线</small></header><div class=\"block-body\"><p>本章没有测试播放中途取消、多个并发 <code>stream()</code> 调用、事件之间的实际时间间隔、\n调度时机或背压。<code>requests</code> 也只是测试探针，不是生产日志；长期进程不能让它无限增长，\n更不能用它记录密钥。真实 transport 的中途取消会在下一章测试。</p>\n</div></aside><aside class=\"learning-block learning-block--pi\" aria-label=\"与当前上游 Pi 对照\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>与当前上游 Pi 对照</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>固定提交 <code>8479bd8</code> 的 <code>packages/ai/src/providers/faux.ts</code> 提供了更丰富的确定性\nprovider，可以生成内容、usage、错误和取消事件。课程版只保留按轮脚本和请求快照。\n两者的共同点是遵守真实 provider 使用的流协议，让上层保持同一种消费方式。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><p>一种常见错误是在脚本耗尽时，从 <code>stream()</code> 同步抛出异常：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">stream(): ModelStream {\n  throw new Error(&quot;script exhausted&quot;);\n}</code></pre></figure><p>这样调用者还没拿到流，就被迫处理另一条失败通道。</p>\n<section class=\"learning-block learning-block--failure\" aria-label=\"预期失败 · 让脚本耗尽同步抛错\"><header><span class=\"block-kicker\">故障实验</span><h4>预期失败 · 让脚本耗尽同步抛错</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>临时把“turn 不存在”的判断移到 <code>queueMicrotask()</code> 外，并直接 throw。运行完整\n聚焦测试，第三项测试应立即失败，因为 <code>stream()</code> 没有返回事件流。把判断移回\nmicrotask，恢复为流内 <code>error</code> 终态，再确认 3/3 通过。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 04 · 模型行为成为可执行规格\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 04 · 模型行为成为可执行规格</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p>运行 <code>npm run build -w @pi/course</code>，再运行\n<code>node --test packages/pi-course/dist/test/04-*.test.js</code>，结果应为 3/3。确认本章\n只新增 <code>scripted-model.ts</code>。你要能解释 turn 如何变成事件、为什么 context 必须\n保存快照，以及为什么脚本耗尽和预取消都通过流内终态报告。下一章会保留这套模型\n协议，只把 turn 的来源替换成 OpenAI-compatible transport。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"迁移 · 连续播放两个成功回合\"><header><span class=\"block-kicker\">可选迁移</span><h4>迁移 · 连续播放两个成功回合</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>在独立测试中构造两个 turn：第一轮产生 <code>toolUse</code>，第二轮产生普通 <code>stop</code>。依次调用\n两次 <code>stream()</code>，检查每轮事件和结果都来自对应 turn，并确认 <code>requests</code> 保存两次\n调用时的 context 快照。不要读取私有 cursor，也不要为测试增加 <code>isFake</code> 分支。</p>\n</div></section><h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><p><code>ScriptedModel</code> 是模型协议的一种确定性实现。它把脚本 turn 转成真实事件，保存\n请求发生时的 context，并让成功、错误、脚本耗尽和预取消走同一条流。Agent 上层\n由此获得了稳定的测试基座。下一章接入真实 provider 时，只需证明 adapter 产生\n相同的边界行为，无需另建一套模型接口。</p>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "先固定-model-的唯一入口",
        "title": "先固定 Model 的唯一入口",
        "level": 2
      },
      {
        "id": "播放一个成功回合",
        "title": "播放一个成功回合",
        "level": 2
      },
      {
        "id": "按轮消费并把失败放回流里",
        "title": "按轮消费，并把失败放回流里",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "ScriptedModel：把模型行为写成可执行规格 用按轮消费的确定性脚本生成模型事件，稳定验证请求快照、事件顺序、终态和失败。 第一部 · 建立可执行语言 test double, executable specification, deterministic trace, recorded request 你将得到什么 先建立全景 先固定 Model 的唯一入口 播放一个成功回合 按轮消费，并把失败放回流里 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/04-scripted-model.md"
  },
  {
    "id": "05",
    "slug": "provider-adapter",
    "part": "foundations",
    "partTitle": "第一部 · 建立可执行语言",
    "chapter": "05",
    "title": "把真实流式协议挡在边界外",
    "summary": "用纯转换、离线 chunk fixture 和薄 transport 把 OpenAI-compatible 流归一为统一模型协议。",
    "minutes": 120,
    "difficulty": "核心",
    "artifact": "packages/pi-course/src/provider-adapter.ts",
    "prerequisites": [
      "03",
      "04"
    ],
    "terms": [
      "provider adapter",
      "transport",
      "fixture",
      "incremental JSON",
      "finish reason"
    ],
    "upstream": [
      "packages/ai/src/api/openai-completions.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "9615f08340a0528633a46c5263cca13275ee64f7",
    "parentCommit": "f471390720ffae304c407b2de07b75bbbf7a1b97",
    "commitSubject": "isolate the real provider streaming boundary",
    "checkpointTest": "packages/pi-course/test/05-provider-adapter.test.ts",
    "html": "<h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>ScriptedModel 已证明上层契约，但真实服务不会发送 <code>ModelEvent</code>。它发送自己的 role、SSE chunk、finish reason、usage 和增量 tool arguments。若 Agent loop 直接识别这些字段，一个 provider 的兼容补丁就会污染整个系统。</p>\n<p>本章只增加一种主要复杂性：<strong>不可信外部协议的双向翻译</strong>。你会实现 <code>workshop/src/provider-adapter.ts</code>，将 <code>AgentContext</code> 转为请求 payload，再把固定的 OpenAI-compatible chunk fixture 还原成与 ScriptedModel 相同的事件流。网络 transport 保持很薄，核心测试完全离线。</p>\n<p>本章不变量是：</p>\n<blockquote>\n<p>Provider 原始类型只能存在于 adapter 边界；adapter 之外只出现 canonical message、ModelEvent 与 EventStream。</p>\n</blockquote>\n<p>恢复本章起点时，撤销 adapter 和 fixture 测试中的故障改动，删除本地 <code>.env</code> 中不再使用的临时值即可；不要删除 <code>.env.example</code>，也不要改 ScriptedModel 来适配真实服务。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 05 · 先完成无网络的双向翻译\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 05 · 先完成无网络的双向翻译</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 04 的 target 开始，把外部 wire protocol 挡在 adapter 内。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/provider-adapter.ts</code></p>\n<p><strong>第一步：</strong> 先不看 target diff，先实现 <code>toProviderMessages</code> 的纯投影并用 fixture 验证；出站形状稳定后，再处理 SSE 分帧和增量 tool arguments。</p>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/05-provider-adapter.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 05</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 05</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/05-*.test.js</code></p>\n<p><strong>通过证据：</strong> 离线 fixture、分裂 chunk、finish reason、usage、取消与 transport 错误测试通过；API key 不进入错误文本。</p>\n<p>第一次尝试禁止查看完整答案，也不要配置真实 API；若卡住，让陪练先判断问题在出站翻译、SSE framing 还是 canonical event。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>Adapter 有两个方向，但只有一个职责——翻译：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">AgentContext\n  ── toProviderMessages() ──→ ProviderWireMessage[]\n                                 │\n                                 ▼ transport / SSE\nEventStream&lt;ModelEvent, AssistantMessage&gt;\n  ←── adapter 状态机 ─────── ProviderChunk</code></pre></figure><p><code>toProviderMessages()</code> 是纯转换，可由固定 fixture 测试。Transport 负责 URL、header、abort signal，并把原始 SSE 解析成课程的 <code>ProviderChunk</code>；adapter 再把 chunk 归一为 <code>ModelEvent</code>。这样网络失败、wire message 转换和流状态失败不会混成一团。</p>\n<p>纯转换不表示每个 chunk 都能独立处理。出站消息映射可以是纯函数；入站流必须持有当前 partial message、每个 tool call 的参数 buffer 以及最新 usage。关键是把这些状态限制在一次 <code>stream()</code> 调用中，不能放进模块级变量。两个并发请求若共享 buffer，会出现最难诊断的跨会话参数串线。</p>\n<p>边界还要区分三类无效输入：未知但可忽略的附加字段、违反最小形状的 chunk、以及 transport 本身失败。第一类可保留诊断后继续；第二类应转换成明确 error 终态；第三类携带已生成的 partial。不能用一个空 <code>catch {}</code> 把三者都变成正常 <code>stop</code>，因为那会制造一条看似可信、实际缺字的 assistant message。</p>\n<p>模型 id、base URL 与能力描述同样属于配置边界，而不是消息本身。课程把 provider/model id 传给 adapter，把 base URL 与密钥留给 transport；两者都不能写入 <code>AgentContext</code>，否则 context 被测试快照或 session 保存时会泄密。认证 header 只在 transport 构造请求的最后一刻出现，错误信息也必须脱敏后才能进入 canonical message。</p>\n<p>真实服务常被称为 “OpenAI-compatible”，这个词只承诺大致形状，不保证所有可选字段、结束原因或工具行为一致。课程因此不建立一张越来越长的 URL 判断表；每个兼容差异都应由一个最小 fixture 证明，并落在 adapter 配置或转换函数中。没有 fixture 的猜测性兼容代码会增加分支，却不能增加信心。</p>\n<p>换句话说，兼容性是一组被测试支持的具体主张，不是供应商名称带来的信任。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"运行前先判断\"><header><span class=\"block-kicker\">先预测</span><h4>运行前先判断</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>工具参数分两块到达：第一块是 <code>{\\&quot;path\\&quot;:</code>，第二块是 <code>\\&quot;README.md\\&quot;}</code>。收到第一块时能否调用 <code>JSON.parse</code>，失败后把它标成无效工具参数？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>不能。第一块只是合法流中的中间状态。Adapter 应按 tool call 的 index 或 id 累积原始字符串，直到调用结束再解析；第 06 章才依据工具 schema 验证对象是否可执行。</p>\n</div></details></section><h2 id=\"出站转换只读取-canonical-ir\"><a class=\"heading-anchor\" href=\"#出站转换只读取-canonical-ir\" aria-label=\"链接到 出站转换只读取 canonical IR\">#</a>出站转换只读取 canonical IR</h2><p>请求转换不应修改 context，也不应把 UI 文本当输入。课程显式定义最小 wire message；OpenAI-compatible 的专属字段只在这个类型和转换函数中出现：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">const context: AgentContext = {\n  systemPrompt: &quot;只依据工具结果回答&quot;,\n  messages: [userMessage(&quot;读取 README&quot;)],\n};\n\nexpect(toProviderMessages(context)).toEqual([\n  { role: &quot;system&quot;, content: &quot;只依据工具结果回答&quot; },\n  { role: &quot;user&quot;, content: &quot;读取 README&quot; },\n]);</code></pre></figure><p>这个 worked example 固定了 system 与 user 两条规则；完成态函数再用穷尽角色分支处理 assistant 和 toolResult。只有 adapter 知道 <code>tool_call_id</code> 和 <code>tool_calls</code>。Assistant tool call 优先使用已保存的 <code>rawArguments</code>，否则序列化 canonical <code>arguments</code>；tool result 必须带回相同 id。<code>systemPrompt</code> 在这里变成 system wire message，不应散落在 CLI。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 5.1 · 用 fixture 证明出站转换\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 5.1 · 用 fixture 证明出站转换</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 保证消息语义被翻译，而不是丢弃。</p>\n<p><strong>文件：</strong> <code>workshop/src/provider-adapter.ts</code>、<code>workshop/test/model-stream.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>为 system、user、assistant toolCall 和 toolResult 准备 canonical context。</li>\n<li>调用 <code>toProviderMessages()</code>，断言角色顺序与 call id 配对。</li>\n<li>冻结输入对象，证明转换没有原地修改消息。</li>\n<li>搜索项目，确认 provider payload 类型未越过 adapter。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- provider-adapter</code></p>\n<p><strong>预期：</strong> fixture 转换稳定通过；tool result 的 id 与原 tool call 完全相同。</p>\n</div></section><h2 id=\"入站转换必须维护跨-chunk-状态\"><a class=\"heading-anchor\" href=\"#入站转换必须维护跨-chunk-状态\" aria-label=\"链接到 入站转换必须维护跨 chunk 状态\">#</a>入站转换必须维护跨 chunk 状态</h2><p>Transport 已把原始 SSE 归一为三类 <code>ProviderChunk</code>。文本 delta 可以直接追加，但 tool call 的 id、名称和参数仍可能分散在多块中，甚至多个调用交错。Adapter 因此需要按 <code>index</code> 保存缓冲区：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">const chunks: ProviderChunk[] = [\n  { type: &quot;tool&quot;, index: 0, id: &quot;c1&quot;, name: &quot;read&quot;,\n    argumentsDelta: &quot;{\\&quot;path\\&quot;:&quot; },\n  { type: &quot;tool&quot;, index: 0,\n    argumentsDelta: &quot;\\&quot;README.md\\&quot;}&quot; },\n  { type: &quot;finish&quot;, reason: &quot;tool_calls&quot;,\n    usage: { input: 12, output: 8, totalTokens: 20 } },\n];</code></pre></figure><p>收到第三块后，buffer 才是完整 JSON。此时 adapter 解析为 <code>ToolCall</code>，发出 <code>toolcall_end</code>，再把 <code>tool_calls</code> 归一为 <code>stopReason: &quot;toolUse&quot;</code>。解析成功只证明 JSON 完整，不证明 <code>path</code> 满足 read 工具 schema。</p>\n<p>稳定的 canonical trace 应是：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">start\ntoolcall_delta index=0 delta=&quot;{\\&quot;path\\&quot;:&quot;\ntoolcall_delta index=0 delta=&quot;\\&quot;README.md\\&quot;}&quot;\ntoolcall_end   id=c1 name=read arguments.path=README.md\ndone           reason=toolUse usage.totalTokens=20</code></pre></figure><section class=\"learning-block learning-block--mechanism\" aria-label=\"完成顺序不等于到达顺序\"><header><span class=\"block-kicker\">关键机制</span><h4>完成顺序不等于到达顺序</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>并行 tool calls 的参数 chunk 可能交错。用一个全局字符串拼接会把两个 JSON 混在一起；必须按 index/id 分桶，并在各自结束后形成 content block。第 07～08 章还会区分调用顺序、执行完成顺序和 transcript 写入顺序。</p>\n</div></section><section class=\"learning-block learning-block--lab\" aria-label=\"实践 5.2 · 翻译增量工具调用\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 5.2 · 翻译增量工具调用</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 从碎片恢复一个完整但尚未执行的 tool call。</p>\n<p><strong>文件：</strong> <code>workshop/test/model-stream.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>使用上面的三块离线 fixture。</li>\n<li>逐块交给 adapter，收集 ModelEvent。</li>\n<li>同时断言 delta 顺序、<code>toolcall_end</code> 的参数对象和最终 usage。</li>\n<li>再加入第二个 index，使两组参数交错到达。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- provider-adapter</code></p>\n<p><strong>预期：</strong> 每个 index 独立形成 tool call；最终 message 保持 provider 声明的调用顺序。</p>\n</div></section><h2 id=\"结束原因和错误必须归一化\"><a class=\"heading-anchor\" href=\"#结束原因和错误必须归一化\" aria-label=\"链接到 结束原因和错误必须归一化\">#</a>结束原因和错误必须归一化</h2><p>Transport 暴露的 finish union 只允许三种已知值，adapter 的映射因此是穷尽的：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">const stopReason =\n  finish.reason === &quot;tool_calls&quot;\n    ? &quot;toolUse&quot;\n    : finish.reason === &quot;length&quot;\n      ? &quot;length&quot;\n      : &quot;stop&quot;;</code></pre></figure><p>原始网络值仍是 <code>unknown</code>；生产 transport 若见到未知 finish reason，必须让流进入 error，不能强行断言成上述 union。<code>length</code> 尤其危险：tool arguments 可能刚好在 <code>}</code> 前被截断。课程 adapter 在 <code>ToolCall.arguments</code> 与 <code>rawArguments</code> 中保留原文，但不把它当可执行对象；后续 Agent loop 先检查 <code>length</code> 并拒绝所有调用。Transport 异常或 abort 转换为 <code>error</code> 终态，携带 <code>stopReason: &quot;error&quot; | &quot;aborted&quot;</code> 的最终 partial message；<code>result()</code> 仍然 resolve。</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">text_delta &quot;正在读取&quot;\nerror reason=error errorMessage=&quot;connection closed&quot;\nresult.content[0].text=&quot;正在读取&quot;</code></pre></figure><aside class=\"learning-block learning-block--note\" aria-label=\"真实调用是兼容性检查，不是主测试\"><header><span class=\"block-kicker\">旁注</span><h4>真实调用是兼容性检查，不是主测试</h4><small>不阻断主线</small></header><div class=\"block-body\"><p>可选 CLI 只能从环境变量读取 API key，<code>.env</code> 必须被 Git 忽略，日志不得打印 header。默认 <code>npm run workshop:test</code> 不访问网络；真实措辞、耗时和费用都不能写进验收。</p>\n</div></aside><aside class=\"learning-block learning-block--pi\" aria-label=\"与当前上游 Pi 对照\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>与当前上游 Pi 对照</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>固定提交 <code>8479bd8</code> 的 <code>packages/ai/src/api/openai-completions.ts</code> 同样累积 text/tool-call delta、映射 finish reason、解析 usage，并把捕获的异常转换成流内 error 终态。上游还处理 reasoning、不同兼容端点、成本、图片和签名。课程 adapter 仅覆盖闭合主链路的子集；它是教学简化，不是假装所有 OpenAI-compatible 服务完全一致。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><p>最短的错误实现是在每个 chunk 上解析 arguments：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">// 错误：delta 不是完整 JSON 文档\nconst args = JSON.parse(chunk.argumentsDelta ?? &quot;&quot;);</code></pre></figure><p>第一块会抛 <code>Unexpected end of JSON input</code>，一个正常流被误判为 provider 错误。</p>\n<section class=\"learning-block learning-block--failure\" aria-label=\"预期失败 · 提前解析 tool arguments\"><header><span class=\"block-kicker\">故障实验</span><h4>预期失败 · 提前解析 tool arguments</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>临时把缓冲逻辑改成逐块 <code>JSON.parse</code>。首次偏差应出现在第一块参数，而不是工具 schema 验证。恢复按 index 累积，并增加 <code>reason: &quot;length&quot;</code> fixture：它必须产生 length 终态，保留 raw string；第 07 章的 loop 将据此拒绝执行，而不是猜测 JSON 是否碰巧完整。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 05 · 真实协议止于边界\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 05 · 真实协议止于边界</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p>运行 <code>npm run workshop:test -- provider-adapter</code>，wire messages、文本流、交错 tool arguments、usage、缺失 finish、网络失败和 abort fixture 都应通过。你能指出 transport、adapter 和 Agent 核心三层边界，并证明切换 ScriptedModel 与 adapter 时消费代码不变。下一章将为已完成的 tool call 加 schema 与执行契约。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"迁移 · 设计另一种 provider fixture\"><header><span class=\"block-kicker\">可选迁移</span><h4>迁移 · 设计另一种 provider fixture</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>给定一个使用 <code>event: token</code>、<code>event: action</code>、<code>event: end</code> 的虚构协议，独立写一个 transport，把三条原始 fixture 转成课程 <code>ProviderChunk</code>，再产生与本章相同的 canonical trace。禁止修改 <code>AgentMessage</code>、<code>EventStream</code> 或 Model 消费者；若必须修改，说明边界仍有 provider 泄漏。</p>\n</div></section><h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><p>Provider adapter 的价值不是“封装一次 HTTP”，而是把变化关在边界：出站把 canonical context 翻成请求，入站维护跨 chunk 状态并还原事件，transport 只处理网络。到这里，ScriptedModel 与真实服务已经共享同一模型协议；第一部建立的语言足够支撑下一步工具执行与 Agent loop。</p>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "出站转换只读取-canonical-ir",
        "title": "出站转换只读取 canonical IR",
        "level": 2
      },
      {
        "id": "入站转换必须维护跨-chunk-状态",
        "title": "入站转换必须维护跨 chunk 状态",
        "level": 2
      },
      {
        "id": "结束原因和错误必须归一化",
        "title": "结束原因和错误必须归一化",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "把真实流式协议挡在边界外 用纯转换、离线 chunk fixture 和薄 transport 把 OpenAI-compatible 流归一为统一模型协议。 第一部 · 建立可执行语言 provider adapter, transport, fixture, incremental JSON, finish reason 你将得到什么 先建立全景 出站转换只读取 canonical IR 入站转换必须维护跨 chunk 状态 结束原因和错误必须归一化 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/05-provider-adapter.md"
  },
  {
    "id": "06",
    "slug": "tool-contract",
    "part": "core",
    "partTitle": "第二部 · 闭合 Agent 核心",
    "chapter": "06",
    "title": "Tool 是类型化的环境动作",
    "summary": "建立模型提议动作、程序验证并执行、结果重新进入对话的可信边界。",
    "minutes": 110,
    "difficulty": "核心",
    "artifact": "packages/pi-course/src/tool.ts",
    "prerequisites": [
      "03",
      "04"
    ],
    "terms": [
      "tool contract",
      "runtime validation",
      "registry",
      "tool result",
      "call id"
    ],
    "upstream": [
      "packages/agent/src/types.ts",
      "packages/agent/src/agent-loop.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "9a8009408e086463f67f50c240834dace7362e33",
    "parentCommit": "9615f08340a0528633a46c5263cca13275ee64f7",
    "commitSubject": "make tool execution a closed contract",
    "checkpointTest": "packages/pi-course/test/06-tool-contract.test.ts",
    "html": "<h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>进入本章时，你的系统已经能用统一消息表示 <code>toolCall</code>，也能用 <code>ScriptedModel</code> 稳定地产生它；缺口是：模型的动作还只是一项不可信提议，没有任何东西证明名称存在、参数正确或执行失败后对话仍然完整。</p>\n<p>本章只增加一种复杂性：<strong>把不可信的动作提议穿过运行时边界，变成一次有类型、可取消、可观察的环境动作</strong>。完成后你会修改 <code>workshop/src/tool.ts</code> 及对应测试，并能离线执行 <code>add</code> 工具，观察成功、未知工具、参数错误和异常四种结构化结果。</p>\n<p>不能破坏的不变量是：<strong>每个已经完成的 tool call，都必须得到一个带相同 <code>toolCallId</code> 的 tool result；失败改变的是 <code>isError</code>，不能让配对消失。</strong></p>\n<p>若要恢复到本章起点，只需撤销 <code>workshop/src/tool.ts</code> 与本章测试中的改动；03～05 章产生的消息、事件流和模型文件不需要回退。开始前先保存一次 <code>git diff -- workshop/</code>，恢复后用相同命令确认只剩前章内容。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 06 · 先把一个不可信 call 关进契约\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 06 · 先把一个不可信 call 关进契约</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 05 的 target 开始，先建立 schema 与 registry，再执行副作用。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/tool.ts</code></p>\n<p><strong>第一步：</strong> 先不看 target diff，从测试的 <code>echo</code> 工具开始，实现 <code>objectSchema</code>、<code>stringValue</code> 和 <code>ToolRegistry</code> 的最小成功路径；随后让所有失败也返回同 id 的 <code>toolResult</code>。</p>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/06-tool-contract.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 06</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 06</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/06-*.test.js</code></p>\n<p><strong>通过证据：</strong> 成功、未知工具、参数错误和执行异常都通过；你能解释失败为何改变 <code>isError</code> 而不能破坏 call/result 配对。</p>\n<p>第一次尝试禁止查看完整答案；一次只闭合一种失败，不要同时实现 registry、schema 和 executor 的所有边界。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>Tool 不是“给模型调用的普通函数”。普通函数的调用者受 TypeScript 约束；模型却可能给出不存在的名称、漏字段、错误类型，甚至一段尚未流完的 JSON。可信路径必须分成五步：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">assistant.toolCall\n  └─ id/name/arguments（不可信）\n       ├─ registry：名称是否存在？\n       ├─ schema：完整参数能否通过运行时验证？\n       ├─ execute：把 AbortSignal 传到副作用边界\n       ├─ normalize：异常也变成 ToolOutput\n       └─ ToolResultMessage（重新成为模型的 observation）</code></pre></figure><p>定义、调用和结果属于三个不同所有者：应用定义允许哪些工具；模型只能提出调用；执行器拥有验证、执行与错误归一化。<code>details</code> 给日志或 UI，<code>content</code> 才进入下一轮模型上下文。删掉 renderer 不应改变 Agent 的决策。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"运行前先判断\"><header><span class=\"block-kicker\">先预测</span><h4>运行前先判断</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>假设 <code>add.execute</code> 的 TypeScript 参数是 <code>{a:number,b:number}</code>。模型传入 <code>{&quot;a&quot;:&quot;2&quot;,&quot;b&quot;:3}</code> 时，直接写 <code>call.arguments as AddInput</code> 能否保证安全？如果工具内部抛错，应该没有 result、还是生成一个错误 result？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>不能。类型断言只改变编译器看法，运行时字符串仍是字符串。异常必须在执行器边界被捕获，并生成与原 call id 配对的 <code>isError: true</code> 结果；否则 transcript 形成悬空调用，下一次 provider 请求也可能被拒绝。</p>\n</div></details></section><h2 id=\"把描述层与执行层绑成一个契约\"><a class=\"heading-anchor\" href=\"#把描述层与执行层绑成一个契约\" aria-label=\"链接到 把描述层与执行层绑成一个契约\">#</a>把描述层与执行层绑成一个契约</h2><p>课程公共接口把“模型看见什么”和“程序能做什么”放在同一对象上，但不混淆二者：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export interface Tool&lt;P, D = unknown&gt; {\n  name: string;\n  description: string;\n  schema: Schema&lt;P&gt;;\n  execute(input: P, context: ToolContext): Promise&lt;ToolOutput&lt;D&gt;&gt;;\n}\n\nexport interface ToolOutput&lt;D = unknown&gt; {\n  content: TextContent[];\n  details?: D;\n  isError?: boolean;\n}\n\nexport interface ToolContext {\n  callId: string;\n  signal?: AbortSignal;\n  reportProgress?(content: TextContent[]): void;\n}</code></pre></figure><p><code>schema</code> 既用于向模型描述动作空间，也在运行时把 <code>unknown</code> 收窄为 <code>P</code>。因此执行顺序必须是“找到定义 → 验证完整参数 → 调用 execute”，绝不能让 <code>execute</code> 自己猜输入。当前上游 Pi 使用 <code>typebox</code> 表达 schema；课程版使用更小的验证器展示同一机制，这是教学简化，不是声称上游也如此。</p>\n<p>还要注意“完整”二字。provider 可以逐段发来 tool arguments，增量只适合 UI 预览；只有 <code>toolcall_end</code> 之后形成的 canonical <code>ToolCallContent</code> 才能验证和执行。半段 JSON 恰好可解析，也不代表语义完整。</p>\n<p>Schema 也不是全部契约。<code>description</code> 决定模型何时选择动作，schema 决定允许怎样表达动作，execute 决定真实副作用；三者若语义不一致，验证通过仍可能做错事。例如描述写“相对 workspace 的路径”，实现却接受任意绝对路径，类型完全正确，能力边界仍然失守。因此定义工具时要用同一组例子同时检查模型面与执行面：哪些调用应被鼓励、哪些应在验证期拒绝、哪些只能在执行期报告领域失败。</p>\n<p>这也是为什么 Registry 应由当前运行显式携带，而不是藏在进程全局：动作空间是上下文的一部分，可以随产品模式收窄，并能被测试完整快照。</p>\n<section class=\"learning-block learning-block--mechanism\" aria-label=\"Registry 是当前动作空间\"><header><span class=\"block-kicker\">关键机制</span><h4>Registry 是当前动作空间</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>Registry 不是便利的全局 Map，而是本次 context 明确授权的动作目录。注册时拒绝重名，查询未知名称时返回可诊断错误；<code>registry.list()</code> 供 adapter 提取 name、description、schema，序列化时不能把 <code>execute</code> 函数送给模型。这样“模型所见工具”与“执行器可解析工具”才不会漂移。</p>\n</div></section><section class=\"learning-block learning-block--lab\" aria-label=\"实践 6.1 · 让 add 穿过运行时边界\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 6.1 · 让 add 穿过运行时边界</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 实现 <code>Tool</code>、<code>ToolRegistry</code> 和一个严格接收两个 number 的 <code>add</code>。</p>\n<p><strong>文件：</strong> <code>workshop/src/tool.ts</code>、<code>workshop/test/agent-loop.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>定义 <code>ToolOutput</code>、<code>ToolContext</code> 与泛型 <code>Tool</code>。</li>\n<li>Registry 构造时拒绝重复名称；从 <code>registry.list()</code> 映射出模型所需 definition。</li>\n<li>用 schema 拒绝缺少 <code>b</code> 与 <code>a</code> 类型错误；确认额外字段不会进入解析后的 typed 参数。</li>\n<li>在测试里设置 <code>executed = true</code>，证明验证失败时 <code>execute</code> 从未运行。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- tool-contract</code></p>\n<p><strong>预期：</strong> 合法输入得到文本 <code>5</code>；两类非法输入都得到稳定的验证路径，且 <code>executed</code> 保持 <code>false</code>；额外字段按课程 validator 的清洗策略被移除。</p>\n</div></section><h2 id=\"无论怎样失败都闭合一次调用\"><a class=\"heading-anchor\" href=\"#无论怎样失败都闭合一次调用\" aria-label=\"链接到 无论怎样失败，都闭合一次调用\">#</a>无论怎样失败，都闭合一次调用</h2><p><code>executeToolCall</code> 是唯一允许把不可信 call 交给工具的门。成功与失败都构造同一种 canonical 消息形状：</p>\n<figure class=\"code-frame\"><figcaption><span>json</span><button type=\"button\" data-copy-code aria-label=\"复制 json 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-json\">{\n  &quot;role&quot;: &quot;toolResult&quot;,\n  &quot;toolCallId&quot;: &quot;call_add_1&quot;,\n  &quot;toolName&quot;: &quot;add&quot;,\n  &quot;content&quot;: [{&quot;type&quot;:&quot;text&quot;,&quot;text&quot;:&quot;5&quot;}],\n  &quot;details&quot;: {&quot;operands&quot;: 2},\n  &quot;isError&quot;: false,\n  &quot;timestamp&quot;: 0\n}</code></pre></figure><p>未知名称、schema 错误、取消和 <code>execute</code> 抛出的异常都应得到同样的外壳，只改变 <code>content/details/isError</code>。不要把原始 stack、绝对路径或密钥塞给模型；诊断细节可以留在内部事件中。</p>\n<p>还要区分“工具运行失败”和“执行器自身损坏”。前者属于模型可以观察并修正的领域结果，例如文件不存在；后者是 Registry 被破坏或程序不变量失效，应由测试和运行监控暴露。课程把可预期的查找、验证与 execute 异常归一化，但不会用空 catch 吞掉结果构造器自身的缺陷。这个边界让恢复能力不会变成掩盖程序错误。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 6.2 · 实现永不丢配对的单次执行器\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 6.2 · 实现永不丢配对的单次执行器</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 让 <code>executeToolCall</code> 对所有可预期结局返回 <code>ToolResultMessage</code>。</p>\n<p><strong>文件：</strong> <code>workshop/src/tool.ts</code>、<code>workshop/test/agent-loop.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>用 call 的 <code>name</code> 查 Registry，并只验证完成后的 <code>arguments</code>。</li>\n<li>将同一个 <code>AbortSignal</code> 放入 <code>ToolContext</code>。</li>\n<li>捕获查找、验证与 execute 异常，统一生成简短错误 observation。</li>\n<li>对每条路径断言 <code>toolCallId</code>、<code>toolName</code> 与 <code>isError</code>，而不只断言文本。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- tool-contract</code></p>\n<p><strong>预期：</strong> 成功、未知工具、非法参数、工具抛错均 resolve 为配对结果；测试进程没有未处理 rejection。</p>\n</div></section><aside class=\"learning-block learning-block--pi\" aria-label=\"与当前上游 Pi 对照\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>与当前上游 Pi 对照</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>固定提交 <code>8479bd8</code> 中，<code>packages/agent/src/types.ts</code> 的 <code>AgentTool</code> 同样分离模型内容与结构化 details，并把 signal、进度回调交给 execute；<code>agent-loop.ts</code> 在执行前验证参数，并把工具异常转成错误结果。上游接口还包含 UI label、增量更新、执行模式和 hooks。课程此处刻意只保留最小闭环；共同点是运行时验证与 call/result 配对，而不是具体泛型写法。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><section class=\"learning-block learning-block--failure\" aria-label=\"删除异常归一化，观察首次偏差\"><header><span class=\"block-kicker\">故障实验</span><h4>删除异常归一化，观察首次偏差</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>临时删掉 <code>executeToolCall</code> 外层的异常捕获，让一个工具抛出 <code>new Error(&quot;disk full&quot;)</code>。</p>\n<p>不要只看最终测试红不红。第一处偏差应是：事件/返回值中已有 assistant tool call，却没有同 id 的 tool result；随后才是 promise rejection。恢复捕获后，断言错误文本稳定、<code>isError</code> 为 true，并且 Registry 仍可执行下一次调用。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 06 · 动作边界闭合\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 06 · 动作边界闭合</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p>运行 <code>npm run workshop:test -- tool-contract</code>，并用四行表记录：输入、execute 是否运行、result id、isError。成功、未知名称、非法参数、抛异常必须各占一行。</p>\n<p>验收不是“测试为绿”，而是你能从一个 <code>unknown</code> arguments 指出它在哪一步获得运行时信任，并解释为什么任何失败都不能破坏配对。恢复检查：撤销本章两处文件后，<code>git diff -- workshop/</code> 应回到第 05 章状态。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"无脚手架迁移 · 实现 divide\"><header><span class=\"block-kicker\">可选迁移</span><h4>无脚手架迁移 · 实现 divide</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>只给你 <code>Tool</code> 公共接口，不复制 add：实现 <code>divide({dividend, divisor})</code>。schema 通过但 divisor 为 0 时，让工具返回或抛出领域错误，再由执行器形成配对 observation。写一个测试证明“运行时参数合法”与“领域动作成功”是两道不同的门。</p>\n</div></section><p>进一步尝试：让两个工具声明同名，预测 Registry 应在哪个时刻拒绝；再为 <code>details</code> 增加结构化操作数，证明删掉 details 后模型 <code>content</code> 仍足以继续。</p>\n<h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><p>Tool contract 把模型策略与环境副作用隔开：名称决定路由，schema 建立运行时信任，execute 承担动作，result 把环境观察送回模型。最重要的不是成功调用，而是失败仍有结构、取消仍可传播、每个 call 都有配对结果。下一章会把这个可靠的单次动作放进 Agent Loop；届时 loop 只负责状态迁移，不再重新解释工具错误。</p>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "把描述层与执行层绑成一个契约",
        "title": "把描述层与执行层绑成一个契约",
        "level": 2
      },
      {
        "id": "无论怎样失败都闭合一次调用",
        "title": "无论怎样失败，都闭合一次调用",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "Tool 是类型化的环境动作 建立模型提议动作、程序验证并执行、结果重新进入对话的可信边界。 第二部 · 闭合 Agent 核心 tool contract, runtime validation, registry, tool result, call id 你将得到什么 先建立全景 把描述层与执行层绑成一个契约 无论怎样失败，都闭合一次调用 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/06-tool-contract.md"
  },
  {
    "id": "07",
    "slug": "agent-loop",
    "part": "core",
    "partTitle": "第二部 · 闭合 Agent 核心",
    "chapter": "07",
    "title": "Agent Loop 是可证明的状态机",
    "summary": "把模型响应与工具结果闭合为可终止、可重放、顺序明确的最小 Agent Loop。",
    "minutes": 120,
    "difficulty": "核心",
    "artifact": "packages/pi-course/src/agent-loop.ts",
    "prerequisites": [
      "04",
      "06"
    ],
    "terms": [
      "agent loop",
      "state machine",
      "stop reason",
      "transcript order",
      "terminal state"
    ],
    "upstream": [
      "packages/agent/src/agent-loop.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "ff876a1fa9537951213d819b62a90430cec73688",
    "parentCommit": "9a8009408e086463f67f50c240834dace7362e33",
    "commitSubject": "close the Agent feedback loop",
    "checkpointTest": "packages/pi-course/test/07-agent-loop.test.ts",
    "html": "<h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>进入本章时，<code>ScriptedModel</code> 能稳定返回消息，<code>executeToolCall</code> 也能把单个动作变成配对结果；但二者仍是两座孤岛。模型请求工具后，没有控制器把 observation 放回 context，也不会再次询问模型。</p>\n<p>本章只增加一种主要复杂性：<strong>循环控制</strong>。完成后，<code>workshop/src/agent-loop.ts</code> 会把一次用户输入推进到确定终态；你能观察每次 model request、tool event、canonical transcript 和最终 stop reason。</p>\n<p>本章不变量是：<strong>下一次模型调用前，已有 assistant 中的每个 tool call 必须在 transcript 中拥有且仅拥有一个配对 result。</strong> <code>length</code>、异常和并发都不能破坏它。</p>\n<p>恢复起点时，只撤销 <code>workshop/src/agent-loop.ts</code> 及本章测试；保留第 06 章的工具执行器。先保存 <code>git diff -- workshop/src/agent-loop.ts workshop/test</code>，恢复后运行 <code>npm run workshop:test -- tool-contract</code>，应仍通过。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 07 · 先闭合一个无工具回合\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 07 · 先闭合一个无工具回合</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 06 的 target 开始，只增加循环控制，不重写 model 或 tool。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/agent-loop.ts</code></p>\n<p><strong>第一步：</strong> 先不看 target diff，先让 <code>runAgentLoop</code> 完成“请求模型 → 追加 assistant → stop”的无工具路径；测试变绿后，再加入 toolUse 分支和下一轮。</p>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/07-agent-loop.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 07</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 07</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/07-*.test.js</code></p>\n<p><strong>通过证据：</strong> 无工具、工具往返、并发完成、异常、length 和 abort 路径通过；transcript 写入顺序不受工具完成顺序影响。</p>\n<p>第一次尝试禁止查看完整答案；卡住时让陪练指出当前状态和唯一合法的下一状态，不要先给 <code>while</code> 实现。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>不要从 <code>while (true)</code> 开始。循环先是一张状态图，<code>while</code> 只是承载它的语法：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">PREPARE_CONTEXT\n      │\n      ▼\nWAIT_MODEL ── error/aborted ───────────────▶ END\n      │ assistant\n      ├─ 无 toolCall ──────────────────────▶ END\n      │\n      ▼\nCHECK_COMPLETENESS\n      ├─ stopReason=length ─▶ 配对错误结果（不执行）──▶ END(length)\n      └─ 完整调用 ──────────▶ EXECUTE_TOOLS\n                                  │\n                                  ▼\n                     APPEND_RESULTS_IN_CALL_ORDER\n                                  │\n                                  └────────▶ WAIT_MODEL</code></pre></figure><p>这里至少有三种“顺序”，不能混为一谈：</p>\n<ul>\n<li>call 顺序：assistant content 中动作出现的顺序；</li>\n<li>完成顺序：并发动作真实结束的先后；</li>\n<li>transcript 顺序：下一次 provider request 中结果排列的稳定顺序。</li>\n</ul>\n<p>事件应忠实报告完成顺序；transcript 则按 call 顺序追加，使同一 scripted 输入得到可重放的 canonical history。</p>\n<p>这张图还能给出一个小型归纳证明。基例是第一次请求前，输入 context 已由上一章的消息规则验证。归纳步中，模型先追加一个完整 assistant；若它没有动作，运行终止，历史仍完整；若它含动作，loop 为整批 calls 产生等量 results，并在下一次请求前按源顺序追加，所以新的 context 仍满足配对不变量。<code>length</code> 不是证明之外的特例：它也产生等量错误 results，只把“实际执行”替换成“拒绝执行”。工具内部成功、抛错或取消同样不会改变结果数量。这样我们验证的是每次迁移，而不是穷举模型可能生成的所有自然语言。</p>\n<p>终止性则需要另一个度量：每一 step 要么结束，要么消耗一次模型预算并进入下一状态。模型可以永远要求工具，因此实现必须有 abort 与有限 <code>maxSteps</code>；达到边界时要保留已有完整 transcript，并报告“控制器停止”，不能伪造一个 assistant 的 <code>stop</code>。安全性回答“不会出现坏历史”，终止性回答“不会无界悬挂”，二者缺一不可。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"预测一次最小工具往返\"><header><span class=\"block-kicker\">先预测</span><h4>预测一次最小工具往返</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>脚本第一轮返回 <code>toolUse</code>，请求 <code>add(call-1)</code>；第二轮返回文本 <code>5</code> 和 <code>stop</code>。先写下模型调用次数、工具执行次数，以及最终新增消息的 role 顺序。</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>模型调用 2 次，工具执行 1 次。新增顺序是 <code>assistant(toolCall)</code> → <code>toolResult(call-1)</code> → <code>assistant(text)</code>；最初的 user message已经在输入 context 中。只断言最终文本会漏掉最重要的中间协议。</p>\n</div></details></section><h2 id=\"先闭合单个动作再推广到一批\"><a class=\"heading-anchor\" href=\"#先闭合单个动作再推广到一批\" aria-label=\"链接到 先闭合单个动作，再推广到一批\">#</a>先闭合单个动作，再推广到一批</h2><p>循环只依赖前章公共边界，不进入具体工具内部：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">const result = await runAgentLoop({\n  model,\n  tools: registry,\n  context,\n  signal: controller.signal,\n  maxSteps: 8,\n  onEvent: (event) =&gt; observed.push(event),\n});</code></pre></figure><p>每次拿到 final <code>AssistantMessage</code>，先将它追加到当前运行的 transcript，再检查 <code>stopReason</code> 和 content。<code>error</code>、<code>aborted</code> 是流中正常可观察的终态消息；<code>EventStream.result()</code> 仍 resolve，而不是把 provider 失败随机变成循环外 rejection。<code>stop</code> 且没有调用时结束；存在完整调用时执行、追加结果后继续。</p>\n<p>先追加 assistant 再处理动作并非实现习惯，而是因果记录：工具结果回答的是哪一次模型提议，必须先有提议事实。相反，streaming partial 只能作为事件展示，不能反复追加进 canonical transcript；最终消息到达时应替换临时视图，而不是留下许多半成品。</p>\n<p><code>maxSteps</code> 是课程加入的失控保护和评测钩子，不是宣称上游 Pi 只有这一种预算策略。步数耗尽要报告独立终态，不能伪装为模型正常回答。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 7.1 · 闭合一个 add 往返\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 7.1 · 闭合一个 add 往返</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 用两轮 <code>ScriptedModel</code> 完成 tool call → observation → 最终回答。</p>\n<p><strong>文件：</strong> <code>workshop/src/agent-loop.ts</code>、<code>workshop/test/agent-loop.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>第一轮脚本生成 <code>call-1</code>，第二轮生成文本终止。</li>\n<li>每次模型调用都传入新的消息数组，不能原地污染调用者提供的 context。</li>\n<li>用第 06 章的 <code>executeToolCall</code> 产生 result。</li>\n<li>精确断言第二次 recorded request 的三段消息及 call id。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- agent-loop</code></p>\n<p><strong>预期：</strong> recorded requests 为 2，执行计数为 1；第二次请求中 call/result 相邻且 id 相同。</p>\n</div></section><h2 id=\"截断是不允许执行并发是两种顺序\"><a class=\"heading-anchor\" href=\"#截断是不允许执行并发是两种顺序\" aria-label=\"链接到 截断是“不允许执行”，并发是“两种顺序”\">#</a>截断是“不允许执行”，并发是“两种顺序”</h2><p>流式 parser 可能把半截 arguments 尽力修复成一个能通过 schema 的对象。如果 assistant 最终 <code>stopReason</code> 是 <code>length</code>，就说明生成被 token 限制切断；其中所有 tool arguments 都不再可信。正确处理不是“能解析就执行”，而是<strong>一个都不执行</strong>，同时为每个 call 生成配对的错误 result。课程 loop 随后以 <code>reason: &quot;length&quot;</code> 结束；上层若选择继续，完整 transcript 已保留“请重发动作”的 observation。</p>\n<figure class=\"code-frame\"><figcaption><span>json</span><button type=\"button\" data-copy-code aria-label=\"复制 json 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-json\">{&quot;role&quot;:&quot;assistant&quot;,&quot;provider&quot;:&quot;scripted&quot;,&quot;model&quot;:&quot;scripted-v1&quot;,\n &quot;usage&quot;:{&quot;input&quot;:0,&quot;output&quot;:0,&quot;totalTokens&quot;:0},&quot;stopReason&quot;:&quot;length&quot;,\n &quot;content&quot;:[{&quot;type&quot;:&quot;toolCall&quot;,&quot;id&quot;:&quot;c1&quot;,&quot;name&quot;:&quot;write&quot;,\n &quot;arguments&quot;:{&quot;path&quot;:&quot;a.ts&quot;,&quot;content&quot;:&quot;export con&quot;}}],&quot;timestamp&quot;:0}\n{&quot;role&quot;:&quot;toolResult&quot;,&quot;toolCallId&quot;:&quot;c1&quot;,&quot;toolName&quot;:&quot;write&quot;,\n &quot;content&quot;:[{&quot;type&quot;:&quot;text&quot;,&quot;text&quot;:&quot;Tool call was not executed because the model response was truncated.&quot;}],\n &quot;details&quot;:{&quot;skipped&quot;:true,&quot;reason&quot;:&quot;length&quot;},&quot;isError&quot;:true,&quot;timestamp&quot;:1}</code></pre></figure><p>这条规则尤其保护 write、edit 和 bash：半截字符串依然可能是合法 JSON，却会制造真实副作用。</p>\n<p>一批完整 calls 可以并发，但完成事件不能直接 push 进 transcript。先保留源索引，全部 settle 后按索引组装 results：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">calls:       c1(slow) ───────────────┐  c2(fast) ─────┐\nend events:                         c2               c1\ntranscript: assistant[c1,c2] → result[c1] → result[c2]</code></pre></figure><p>工具抛错也只是 c1/c2 中一个 <code>isError: true</code> 的 observation；其余工具仍被回收，不能留下悬挂 promise。</p>\n<p>Call id 在这里承担因果身份，数组位置只承担展示顺序。若工具事件为了实时性先报告 c2，UI 仍可用 id 把进度归到正确卡片；若未来某个 provider 要求不同的 result 排列，也应在 adapter 边界转换，而不是改写内部事实。把身份、完成时间和序列位置拆开，才能同时获得并发性能、确定重放与正确诊断。</p>\n<p>因此，任何排序都必须有名称、有消费者，也有对应测试。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 7.2 · 区分完成顺序与 transcript 顺序\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 7.2 · 区分完成顺序与 transcript 顺序</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 并发执行 slow 与 fast 两个 fake tool，同时保持稳定历史。</p>\n<p><strong>文件：</strong> <code>workshop/src/agent-loop.ts</code>、<code>workshop/test/agent-loop.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>为 calls 编号并一起启动，使用 <code>Promise.all</code> 保留输入索引。</li>\n<li>在每个 promise settle 时发课程 <code>tool_end</code>。</li>\n<li>全批完成后按 assistant call 顺序追加 <code>ToolResultMessage</code>。</li>\n<li>再让 slow 抛错，断言 fast 仍完成且两个 id 都有配对结果。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- agent-loop</code></p>\n<p><strong>预期：</strong> end event 顺序为 fast、slow；recorded request 中结果顺序仍为 slow、fast；失败场景没有 unhandled rejection。</p>\n</div></section><aside class=\"learning-block learning-block--pi\" aria-label=\"与当前上游 Pi 对照\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>与当前上游 Pi 对照</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>固定提交 <code>8479bd8</code> 的 <code>packages/agent/src/agent-loop.ts</code> 明确对 <code>length</code> 消息中的所有 calls 生成“未执行”的错误结果；默认可并行执行工具，<code>tool_execution_end</code> 依完成时刻发出，随后按 assistant 源顺序发出 result message。上游可把这些 skipped results 带入后续 turn，课程版则以 length 终止并把是否重试交给上层。课程用较小的 <code>tool_end</code> 事件表达同一观察点，并去掉 hooks、动态模型切换和复杂队列，但刻意保留安全与配对不变量。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><section class=\"learning-block learning-block--failure\" aria-label=\"删掉 length 防线\"><header><span class=\"block-kicker\">故障实验</span><h4>删掉 length 防线</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>把 <code>stopReason === &quot;length&quot;</code> 分支改成普通执行，然后让 scripted response 给出可解析但截断的 write call。</p>\n<p>第一处偏差不是“模型回答不好”，而是 fake tool 的执行计数从 0 变为 1；真实系统此刻已经产生不可逆副作用。恢复防线后同时断言：执行计数为 0、每个 call 都有错误 result；显式继续运行时，模型能看到要求重发的 observation。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 07 · 可证明的循环\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 07 · 可证明的循环</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p>运行 <code>npm run workshop:test -- agent-loop</code>。验收矩阵至少覆盖：纯文本 stop、单工具、多工具反序完成、工具异常、length、provider error、abort 和 maxSteps。</p>\n<p>对任一 scripted 序列，你应在运行前写出模型调用数、执行数、事件完成顺序、transcript 顺序与唯一终态。恢复时撤销本章文件，再确认 <code>npm run workshop:test -- tool-contract</code> 仍绿。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"无脚手架迁移 · 第一个调用失败\"><header><span class=\"block-kicker\">可选迁移</span><h4>无脚手架迁移 · 第一个调用失败</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>配置同一 assistant turn 的三个 calls，让第一个 schema 失败、第二个延迟成功、第三个执行抛错。不要参考本章测试，先写预期 event 与 transcript 两张序列表，再实现测试。要求三个 calls 都有且只有一个 result，且下一次 model request 仍按 1、2、3 排列。</p>\n</div></section><p>额外挑战：让模型连续请求同一 call id。决定是在消息验证层拒绝重复，还是在 loop 中形成错误 observation；无论选择哪层，都用测试固定责任边界，不要悄悄执行两次。</p>\n<h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><p>Agent Loop 的核心不是无限循环，而是少数显式迁移：模型终态、工具批次、观察回填与再次决策。<code>length</code> 保护副作用边界；异常通过 result 闭合；并发完成顺序服务实时观察，稳定 transcript 顺序服务 provider 与重放。这些约束共同构成可验证的安全核心。下一章只替换动作内容：抽象 add 将变成真实 read、write、edit 和 bash，而循环本身无需重写。</p>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "先闭合单个动作再推广到一批",
        "title": "先闭合单个动作，再推广到一批",
        "level": 2
      },
      {
        "id": "截断是不允许执行并发是两种顺序",
        "title": "截断是“不允许执行”，并发是“两种顺序”",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "Agent Loop 是可证明的状态机 把模型响应与工具结果闭合为可终止、可重放、顺序明确的最小 Agent Loop。 第二部 · 闭合 Agent 核心 agent loop, state machine, stop reason, transcript order, terminal state 你将得到什么 先建立全景 先闭合单个动作，再推广到一批 截断是“不允许执行”，并发是“两种顺序” 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/07-agent-loop.md"
  },
  {
    "id": "08",
    "slug": "coding-tools",
    "part": "core",
    "partTitle": "第二部 · 闭合 Agent 核心",
    "chapter": "08",
    "title": "Read、Write、Edit 与 Bash",
    "summary": "让 Agent 获得可截断、可取消、可诊断的文件和进程能力，同时说清真正的安全边界。",
    "minutes": 135,
    "difficulty": "核心",
    "artifact": "packages/pi-course/src/coding-tools.ts",
    "prerequisites": [
      "06",
      "07"
    ],
    "terms": [
      "execution environment",
      "exact edit",
      "mutation queue",
      "output truncation",
      "containment"
    ],
    "upstream": [
      "packages/coding-agent/src/core/tools/read.ts",
      "packages/coding-agent/src/core/tools/write.ts",
      "packages/coding-agent/src/core/tools/edit.ts",
      "packages/coding-agent/src/core/tools/bash.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "ccb666122c1b58b592f72898a6574358709e079d",
    "parentCommit": "ff876a1fa9537951213d819b62a90430cec73688",
    "commitSubject": "let tools touch files and processes safely",
    "checkpointTest": "packages/pi-course/test/08-coding-tools.test.ts",
    "html": "<h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>进入本章时，Agent Loop 已能可靠执行抽象工具，但 <code>add</code> 不会改变真实世界。现在要把相同 contract 接到文件系统和子进程；风险也随之改变：一次错误调用可能覆盖文件、启动无限进程，或把超长输出塞满 context。</p>\n<p>本章只增加一种复杂性：<strong>受资源约束的环境副作用</strong>。完成后，<code>workshop/src/coding-tools.ts</code> 会导出 <code>createCodingTools({cwd, containment})</code>，提供 read、write、edit、bash；所有实验都在临时 workspace 中，能观察截断范围、编辑数量与字节变化、退出状态、timeout 与 abort。</p>\n<p>不变量是：<strong>失败动作不得留下“看似成功”的半完成状态</strong>。尤其 edit 必须先验证全部替换，再一次写回；同一文件的 mutation 必须串行。</p>\n<p>恢复本章起点时，删除临时 fixture，撤销 <code>workshop/src/coding-tools.ts</code> 与本章测试即可；不要回退 tool contract 或 loop。先用 <code>git diff -- workshop/</code> 保存本章 patch，绝不拿 <code>pi/</code>、<code>practice/</code> 或教材仓库自身做破坏性练习。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 08 · 先让 read 成为有界观察\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 08 · 先让 read 成为有界观察</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 07 的 target 开始，把工具契约接到临时文件系统和子进程。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/coding-tools.ts</code></p>\n<p><strong>第一步：</strong> 先不看 target diff，只实现 <code>createCodingTools</code> 中的 read：规范化 cwd 内路径、返回行号与截断信息；read 通过后再做原子 write、批量 edit 和受限 bash。</p>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/08-coding-tools.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 08</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 08</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/08-*.test.js</code></p>\n<p><strong>通过证据：</strong> 续读、edit 回滚、symlink 逃逸、timeout、abort 与输出上限测试通过；失败不留下半完成 mutation。</p>\n<p>第一次尝试禁止查看完整答案；所有破坏实验只在测试创建的临时目录，禁止拿真实项目当 fixture。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>四个工具不是四段随手的 Node API 包装，而是两类资源协议：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">文件协议\n  read  → 有界观察：范围、行号、是否截断\n  write → 显式创建/整体覆盖：父目录、字节数、同文件串行\n  edit  → 先验证后提交：唯一匹配、内存批处理、一次写回、change details\n\n进程协议\n  bash  → cwd、stdout/stderr、exit、timeout、abort、输出上限、进程回收</code></pre></figure><p><code>cwd</code> 提供相对路径基准，却不天然等于安全边界。课程版额外开启 workspace containment，目的是保护学习者本机；它只是路径层主动强化，不是容器或 VM，也不能安全运行任意恶意代码。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"路径看起来没有 .. 就安全吗\"><header><span class=\"block-kicker\">先预测</span><h4>路径看起来没有 .. 就安全吗</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>有人拒绝字符串中含 <code>..</code> 的路径，却允许绝对路径和 workspace 内指向外部的符号链接。这能保证文件不越界吗？Prompt 中写“不要访问外部”能补上吗？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>不能。路径必须规范化后检查归属，已存在路径还要考虑 realpath；新文件要检查可解析的父目录。Prompt 只是行为建议，不是能力边界。即便课程 containment 做对了路径检查，bash 仍可能访问网络或继承环境变量，所以它仍不是强沙箱。</p>\n</div></details></section><h2 id=\"先让文件动作可证明\"><a class=\"heading-anchor\" href=\"#先让文件动作可证明\" aria-label=\"链接到 先让文件动作可证明\">#</a>先让文件动作可证明</h2><p>测试必须创建可清理的临时目录，再把该目录作为唯一 cwd：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">const tools = createCodingTools({\n  cwd: workspace.path,\n  containment: &quot;workspace&quot;, // 课程主动强化；不是当前上游 Pi 的默认行为\n});</code></pre></figure><p>Read 同时受行数和字节数限制。结果必须告诉模型“看到的只是窗口”，否则模型会把局部当全部：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">1│ export const a = 1;\n2│ export const b = 2;\n\n[Showing lines 1-2 of 8. Continue with offset=3.]\ndetails: { startLine: 1, endLine: 2, lines: 8, truncated: true }</code></pre></figure><p>Write 的语义要简单而显式：自动创建父目录，文件存在时整体覆盖，不提供含糊的“智能保存”。返回路径、写入字节数即可，不要把全部内容再复制进 model context。</p>\n<p>Edit 使用 exact old text → new text。零次匹配表示观察过期，多次匹配表示定位不足；都必须失败且保持磁盘文件逐字节不变。课程批量接口按数组顺序在内存副本上应用，每个后续 edit 看见此前的内存变化；只有整批都成功，才写回一次：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">let next = original;\nfor (const edit of edits) {\n  const at = next.indexOf(edit.oldText);\n  if (at &lt; 0 || next.indexOf(edit.oldText, at + edit.oldText.length) &gt;= 0) {\n    throw new Error(&quot;oldText 必须唯一匹配&quot;);\n  }\n  next = next.slice(0, at) + edit.newText\n    + next.slice(at + edit.oldText.length);\n}\nawait atomicWrite(file, next);</code></pre></figure><p>同一文件上的 write/edit 共享 mutation queue；不同文件仍可并发。取消也不能提前释放锁，让仍在飞行的旧 write 稍后覆盖新操作。</p>\n<p>“一次写回”不等于数据库事务。课程可以先写临时文件再 rename，减少读者看到半截内容的窗口，但断电持久性、权限继承、跨文件原子性仍取决于操作系统。这里真正能证明的是：参数校验失败时零写入；进入提交阶段后，同一路径没有另一个课程 mutation 与它交错。把保证说到恰当强度，比笼统声称“原子编辑”更可靠。</p>\n<p>验收应围绕这些可观测保证，而不是抽象口号。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 8.1 · 构造可恢复的文件工具\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 8.1 · 构造可恢复的文件工具</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 实现 read、write、edit，并证明所有失败都不会误伤 workspace。</p>\n<p><strong>文件：</strong> <code>workshop/src/coding-tools.ts</code>、<code>workshop/test/coding-agent.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>每个测试创建并 finally 清理 temp workspace。</li>\n<li>Read 覆盖窗口、行/字节截断、缺失文件与目录输入。</li>\n<li>Write 覆盖新建、整体覆盖、父目录创建和同文件并发。</li>\n<li>Edit 覆盖 0/1/2 次匹配、顺序内存批处理与任一处失败时零磁盘写入。</li>\n<li>containment 模式拒绝绝对外部路径、<code>../</code> 和符号链接逃逸。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- coding-tools</code></p>\n<p><strong>预期：</strong> 所有错误都经第 06 章执行器成为 <code>isError</code> result；失败 edit 前后的文件 hash 相同。</p>\n</div></section><h2 id=\"bash-是生命周期不是一个字符串\"><a class=\"heading-anchor\" href=\"#bash-是生命周期不是一个字符串\" aria-label=\"链接到 Bash 是生命周期，不是一个字符串\">#</a>Bash 是生命周期，不是一个字符串</h2><p>Bash 的完成条件不是“spawn 返回了”。它必须同时治理：两个输出流、非零退出、启动失败、timeout、用户 abort、子进程回收和内存上限。稳定结果描述语义，不依赖真实耗时：</p>\n<figure class=\"code-frame\"><figcaption><span>json</span><button type=\"button\" data-copy-code aria-label=\"复制 json 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-json\">{\n  &quot;content&quot;:[{&quot;type&quot;:&quot;text&quot;,&quot;text&quot;:&quot;tests: 3 passed&quot;}],\n  &quot;details&quot;:{&quot;command&quot;:&quot;npm test&quot;,&quot;exitCode&quot;:0,\n             &quot;timedOut&quot;:false,&quot;truncated&quot;:false},\n  &quot;isError&quot;:false\n}</code></pre></figure><p>非零退出是一次已结束的进程结果，但对 Agent 动作而言通常标为错误 observation；timeout 和 abort 要终止进程树并等待回收。stdout/stderr 都要持续消费，避免其中一个管道填满造成死锁。超长输出只保留有诊断价值的窗口，同时明确原始规模与截断事实。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 8.2 · 给 Bash 加上终点\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 8.2 · 给 Bash 加上终点</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 让成功、非零退出、无限等待和无限输出都在有限资源内结算。</p>\n<p><strong>文件：</strong> <code>workshop/src/coding-tools.ts</code>、<code>workshop/test/coding-agent.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>用 <code>spawn</code> 同时消费 stdout/stderr，不把模型参数拼进测试 shell 源码。</li>\n<li>将同一个 ToolContext signal 传到进程执行层。</li>\n<li>实现 timeout 与幂等 settle，竞争发生时只产生一个终态。</li>\n<li>限制保留输出并在 details 中记录 truncated。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- coding-tools</code></p>\n<p><strong>预期：</strong> 成功为 exit 0；非零、timeout、abort 均为结构化错误 result；无限输出测试不线性增长内存，结束后没有残留测试子进程。</p>\n</div></section><section class=\"learning-block learning-block--mechanism\" aria-label=\"Containment 的准确边界\"><header><span class=\"block-kicker\">关键机制</span><h4>Containment 的准确边界</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>课程 containment 是主动强化：把文件工具限制在指定 workspace，并让 bash 固定从该 cwd 启动。它不隔离网络、系统调用、用户权限或继承的密钥。要运行不可信代码，仍需容器、VM 或专用沙箱；不要在文档里把路径 jail 称为“安全沙箱”。</p>\n</div></section><aside class=\"learning-block learning-block--pi\" aria-label=\"与当前上游 Pi 对照\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>与当前上游 Pi 对照</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>固定提交 <code>8479bd8</code> 的上游工具更成熟：read 同时按行和字节截断；write 自动建目录；edit 让多处替换针对原始内容定位并拒绝重叠，课程则按内存副本顺序应用；同文件 mutation 串行、不同文件可并行；bash 管理超时、取消、输出截断和完整输出临时文件。关键差异是：当前上游 <code>resolveToCwd</code> 接受绝对路径，<code>..</code> 也可解析到 cwd 外，内建 coding tools 没有 workspace jail 或权限确认，能力边界等价于课程的 <code>containment: &quot;unrestricted&quot;</code>。课程 <code>&quot;workspace&quot;</code> 模式必须被准确标为教学环境的主动强化。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><section class=\"learning-block learning-block--failure\" aria-label=\"把多匹配偷偷改成第一处\"><header><span class=\"block-kicker\">故障实验</span><h4>把多匹配偷偷改成第一处</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>临时把 edit 的“匹配必须唯一”改成 <code>replace</code> 第一处，然后在含两个相同片段的文件运行。</p>\n<p>首次偏差是工具报告成功且文件 hash 改变，而模型并没有提供足够定位信息；这比显式失败危险。恢复唯一匹配后，断言 result 指出匹配数为 2、<code>isError</code> 为 true、文件 bytes 与调用前完全一致。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 08 · Agent 获得受控副作用\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 08 · Agent 获得受控副作用</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p>运行 <code>npm run workshop:test -- coding-tools</code>，现场证明四件事：越界路径被课程 containment 拒绝；read 明示截断；edit 多匹配零写入；bash timeout/abort 后无残留进程。</p>\n<p>随后用 ScriptedModel 完成 <code>read → edit → bash → final</code>，检查 call/result 全配对。测试为绿还不够；你应能说清 containment 防什么、不防什么。恢复时只撤销本章文件，并确认 <code>npm run workshop:test -- agent-loop</code> 仍通过。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"无脚手架迁移 · 并发修改竞态\"><header><span class=\"block-kicker\">可选迁移</span><h4>无脚手架迁移 · 并发修改竞态</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>创建两个对同一文件的延迟 write，以及一个写另一文件的 edit。先画出允许的完成时间线，再写测试：同文件操作必须按注册顺序结算，另一文件可以并发；abort 旧 write 后，新 write 不能被随后醒来的旧操作覆盖。不要复用本章现成断言。</p>\n</div></section><p>额外练习：实现一个只读 <code>list</code> tool。它同样要遵守 containment 和输出上限，但不应复制 write/edit 的 mutation queue；解释为什么“共享环境”不意味着所有动作都串行。</p>\n<h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><p>Coding tools 的难点不是调用 fs 和 shell，而是把副作用变成受约束的协议：Read 明示不完整观察，Write 明示覆盖，Edit 先验证后提交，Bash 拥有可回收的生命周期。课程 containment 保护练习目录，却不冒充强沙箱。至此最小 Agent 已能真实修改环境；下一章会在纯 loop 外增加跨运行状态、取消和用户时序控制。</p>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "先让文件动作可证明",
        "title": "先让文件动作可证明",
        "level": 2
      },
      {
        "id": "bash-是生命周期不是一个字符串",
        "title": "Bash 是生命周期，不是一个字符串",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "Read、Write、Edit 与 Bash 让 Agent 获得可截断、可取消、可诊断的文件和进程能力，同时说清真正的安全边界。 第二部 · 闭合 Agent 核心 execution environment, exact edit, mutation queue, output truncation, containment 你将得到什么 先建立全景 先让文件动作可证明 Bash 是生命周期，不是一个字符串 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/08-coding-tools.md"
  },
  {
    "id": "09",
    "slug": "stateful-agent",
    "part": "state",
    "partTitle": "第三部 · 让 Harness 可靠",
    "chapter": "09",
    "title": "从纯循环到可中断的 Stateful Agent",
    "summary": "用一个薄的有状态 facade 管理 transcript、生命周期、取消与两种用户消息时序。",
    "minutes": 120,
    "difficulty": "核心",
    "artifact": "packages/pi-course/src/agent.ts",
    "prerequisites": [
      "07",
      "08"
    ],
    "terms": [
      "stateful agent",
      "lifecycle",
      "abort",
      "steering",
      "follow-up",
      "reentrancy"
    ],
    "upstream": [
      "packages/agent/src/agent.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "2cc53512238072868ef2e1928657992b419a656f",
    "parentCommit": "ccb666122c1b58b592f72898a6574358709e079d",
    "commitSubject": "add the stateful Agent lifecycle",
    "checkpointTest": "packages/pi-course/test/09-stateful-agent.test.ts",
    "html": "<h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>进入本章时，<code>runAgentLoop</code> 能完成一次可证明的运行，但调用者必须自己传 context、收集消息和管理 signal。关闭一次函数调用后，没有对象记住 transcript；运行途中也没有统一入口接受取消或新指令。</p>\n<p>本章只增加一种复杂性：<strong>跨运行的生命周期所有权</strong>。完成后，<code>workshop/src/agent.ts</code> 的 <code>Agent</code> 会保存消息，提供 <code>prompt()</code>、<code>abort()</code>、<code>steer()</code>、<code>followUp()</code>、<code>subscribe()</code>，并拒绝同一实例上的重入。</p>\n<p>不变量是：<strong>有状态 Agent 只能编排既有 loop，不能复制另一套 model/tool 状态机；任何时刻至多有一个 active run 改写同一 transcript。</strong></p>\n<p>恢复本章起点时，撤销 <code>workshop/src/agent.ts</code> 与本章测试；<code>agent-loop.ts</code> 和 coding tools 不动。恢复后直接运行 <code>npm run workshop:test -- agent-loop</code>，应仍能独立完成所有状态迁移。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 09 · 先证明 busy guard 总能释放\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 09 · 先证明 busy guard 总能释放</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 08 的 target 开始，用对象拥有跨运行状态，但复用既有 loop。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/agent.ts</code></p>\n<p><strong>第一步：</strong> 先不看 target diff，先实现 <code>Agent.prompt()</code> 的单运行路径与 <code>try/finally</code> busy guard；故意让 subscriber 抛错，确认状态仍回到 idle，再加入队列与取消。</p>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/09-stateful-agent.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 09</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 09</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/09-*.test.js</code></p>\n<p><strong>通过证据：</strong> 重入拒绝、坏 listener、abort、steer 与 follow-up 测试通过；同一 transcript 同时最多一个 active run。</p>\n<p>第一次尝试禁止查看完整答案；若状态混乱，让陪练只画 <code>idle → running → idle</code> 和 finally 所有权。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>Loop 与 Agent 的分工可以用“函数栈”和“对象堆”理解：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">Agent（跨运行）\n  ├─ transcript\n  ├─ active AbortController | undefined\n  ├─ steering queue / follow-up queue\n  ├─ subscribers\n  └─ prompt()\n       └─ runAgentLoop()（单次运行）\n            ├─ model turns\n            ├─ tool batches\n            └─ returned messages/events</code></pre></figure><p>Loop 决定“下一步是什么”；Agent 决定“这次运行属于谁、结果保存到哪里、用户现在能发什么命令”。Provider 不拥有 transcript，CLI 也不拥有真相。这样同一个 loop 可以被测试、非交互脚本和交互式 UI 复用。</p>\n<p>为什么这里适合对象，而上一章适合纯函数？因为 controller、订阅者和等待者都有跨越多个 await 的身份，它们需要一个明确寿命；模型决策本身却应尽量由输入 context 决定。把所有东西塞进对象，会让一次 loop 的因果链藏在可变字段里；把所有东西塞进函数，又会迫使每个 UI 重造队列与重入锁。边界正好落在“一次运行”和“多次运行”之间。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"第二次 prompt 应该怎样处理\"><header><span class=\"block-kicker\">先预测</span><h4>第二次 prompt 应该怎样处理</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>第一个 prompt 正在执行 bash，此时调用者又执行 <code>agent.prompt(&quot;顺便改 README&quot;)</code>。是并行启动第二个 loop、自动当 steering，还是显式拒绝？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>第一版应显式拒绝，并指导调用者选择 <code>steer</code> 或 <code>followUp</code>。静默并发会让两个 loop 同时基于旧 transcript 追加消息；静默改语义又使 API 不可预测。用户意图必须通过不同方法表达。</p>\n</div></details></section><h2 id=\"事件是事实状态是派生快照\"><a class=\"heading-anchor\" href=\"#事件是事实状态是派生快照\" aria-label=\"链接到 事件是事实，状态是派生快照\">#</a>事件是事实，状态是派生快照</h2><p>Agent 接收 loop events，先更新自己的只读状态，再通知订阅者。事件回答“发生过什么”，状态回答“现在是什么”：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">type AgentState = {\n  status: &quot;idle&quot; | &quot;running&quot;;\n  messages: AgentMessage[];\n  activeRunId?: number;\n  lastReason?: AgentRunResult[&quot;reason&quot;];\n  streamingText: string;\n  pendingToolCallIds: string[];\n  diagnostics: string[];\n};</code></pre></figure><p>课程的 <code>model_event.text_delta</code> 累积 <code>streamingText</code>，但只有 <code>assistant_message</code> 携带的完整事实才进入 transcript。<code>tool_start/tool_end</code> 维护 pending id 数组；运行终态清空临时状态，却不能清空已经完成的历史。模型 <code>error/aborted</code> 仍是 canonical AssistantMessage，便于 UI 和恢复逻辑看到同一事实。</p>\n<p>订阅者是消费者，不应反向成为 Agent 真相。它们可以渲染、记录或持久化；取消信号仍由 active run 的 controller 所有。运行完成后 controller 作废，下一次 prompt 必须创建新 controller。</p>\n<p>状态更新最好写成小型 reducer，并复制 messages 与 pending 数组后发布快照。这样订阅者拿到的是某一时刻的事实，而不是稍后被内核继续修改的同一引用。一个实用检查是重放同一事件数组：若两次得到不同 state，说明 reducer 偷读了时钟、全局变量或 provider，对恢复和测试都不利。</p>\n<p>每次运行还应有单调递增的 run id。它不是 session identity，只用于区分同一 Agent 的两次生命周期；异步 UI 若晚收到上一轮事件，可以据此拒绝把它显示为当前状态。终态 cleanup 必须核对并清除对应 active run，不能让旧 promise 的 finally 意外清掉已经开始的新 controller。这类“晚到事件”测试比只跑一次成功 prompt 更能证明所有权正确。</p>\n<p>同理，公开的 state 必须是防御性副本：外部修改返回数组或集合，绝对不能绕过事件路径篡改 Agent 内核状态。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 9.1 · 用一个 facade 管理一次运行\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 9.1 · 用一个 facade 管理一次运行</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 实现 Agent 生命周期，不改写 <code>runAgentLoop</code>。</p>\n<p><strong>文件：</strong> <code>workshop/src/agent.ts</code>、<code>workshop/test/coding-agent.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>构造只读 state、subscriber set 和可选 active run。</li>\n<li><code>prompt</code> 先拒绝重入，再创建 controller、追加 user message并调用 loop。</li>\n<li>逐事件更新 streaming/pending 状态，完整消息按一次且仅一次进入 history。</li>\n<li>在成功、provider error 和 abort 的 finally 中统一回到 idle。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- stateful-agent</code></p>\n<p><strong>预期：</strong> 运行中第二次 prompt 得到明确错误；任一终态后都可再次 prompt；Agent 内没有复制 tool 执行代码。</p>\n</div></section><h2 id=\"abortsteering-与-follow-up-是三种不同时间语义\"><a class=\"heading-anchor\" href=\"#abortsteering-与-follow-up-是三种不同时间语义\" aria-label=\"链接到 Abort、steering 与 follow-up 是三种不同时间语义\">#</a>Abort、steering 与 follow-up 是三种不同时间语义</h2><p>Abort 是立即发出的停止意图。<code>Agent</code> 创建一个 controller，其 signal 沿同一棵树传给 loop、model stream、tool context 和 bash。各层协作停止；<code>abort()</code> 可重复调用，但一个运行只产生一个终态。</p>\n<p>Steering 与 follow-up 都不打断正在发送的 request：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">turn N: assistant [call c1, call c2]\n        tools start ── c2 end ── c1 end\n        transcript append result c1, result c2\n        ├─ drain steering ─▶ user steer ─▶ turn N+1\n        └─ 若原本结束：drain follow-up ─▶ 新一段工作</code></pre></figure><p>Steering 表示“当前工作还在推进，请在下一个模型决策前考虑它”，安全注入点是<strong>当前工具批次已经全部形成配对结果之后</strong>。Follow-up 表示“当前工作自然结束后，再发起后续请求”。两者用 FIFO 队列保存，不可把 user message 插在 assistant call 与其 tool result 之间。</p>\n<p>两种队列也解决了不同的用户承诺。Steering 不保证撤销已发生的动作：如果 write 已完成，后来的“不要改文件”只能影响下一决策；UI 应如实显示这个边界。Follow-up 则保证当前任务先走到自己的自然停止点，但不意味着开启另一个 Agent 实例，它仍继承同一 transcript。把这些承诺写进 API 名称，比用一个含糊的 <code>send()</code> 再猜时机可靠得多。</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">const unsubscribe = agent.subscribe((event) =&gt; events.push(event));\nagent.steer(&quot;先不要改配置文件&quot;);\nagent.followUp(&quot;完成后总结测试覆盖&quot;);\nagent.abort(); // 只影响当前 active run\nunsubscribe();</code></pre></figure><section class=\"learning-block learning-block--mechanism\" aria-label=\"控制面顺序与 transcript 顺序\"><header><span class=\"block-kicker\">关键机制</span><h4>控制面顺序与 transcript 顺序</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>工具完成事件可按真实时间出现；steering 的消费时机却由协议边界决定。实时 UI 可以先看到 fast tool 完成，但模型下一次 request 必须先看到按 call 顺序排列的整批 results，再看到 steering。用户交互不能以破坏消息语法为代价追求“即时”。</p>\n</div></section><section class=\"learning-block learning-block--lab\" aria-label=\"实践 9.2 · 固定三种控制路径\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 9.2 · 固定三种控制路径</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 用 ScriptedModel 精确验证 abort、steering 和 follow-up。</p>\n<p><strong>文件：</strong> <code>workshop/src/agent.ts</code>、<code>workshop/test/coding-agent.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>在慢 model stream 与慢 bash 中分别调用 abort，断言不启动下一 turn。</li>\n<li>在双工具批次运行中 enqueue steering，检查它出现在两个 results 之后、下一 request 之前。</li>\n<li>在纯文本 stop 前 enqueue follow-up，检查当前 run 本可结束时才消费。</li>\n<li>断言两个队列各自 FIFO，终态后无悬挂 promise。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- stateful-agent</code></p>\n<p><strong>预期：</strong> abort 幂等且 Agent 回到 idle；steering 延续当前工作；follow-up 在原工作结束点之后开始；任何路径都没有悬空 tool call。</p>\n</div></section><aside class=\"learning-block learning-block--pi\" aria-label=\"与当前上游 Pi 对照\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>与当前上游 Pi 对照</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>固定提交 <code>8479bd8</code> 的 <code>packages/agent/src/agent.ts</code> 同样是低层 loop 的有状态 wrapper：保存 messages/tools，拥有 active AbortController，拒绝 prompt 重入，并以不同队列实现 steering 与 follow-up。上游还支持队列 drain 模式、动态 model/config、异步 listeners 和更多 lifecycle state；课程保留其所有权与时序语义，不复制产品级选项。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><section class=\"learning-block learning-block--failure\" aria-label=\"把 steering 插进 call/result 中间\"><header><span class=\"block-kicker\">故障实验</span><h4>把 steering 插进 call/result 中间</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>临时在收到第一个 <code>tool_end</code> 事件时立即把 steering push 到 messages。构造 assistant 同时请求 slow 与 fast 两个工具。</p>\n<p>首次偏差应出现在第二次 recorded model request：role 顺序变成 <code>assistant → toolResult? → user → toolResult?</code>，破坏完整工具批次。恢复队列 drain 点后，顺序必须是 <code>assistant → result(slow) → result(fast) → user(steer)</code>，不受真实完成先后影响。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 09 · 生命周期只有一个所有者\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 09 · 生命周期只有一个所有者</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p>运行 <code>npm run workshop:test -- stateful-agent</code>，检查成功、error、abort、重入、steering、follow-up 六条路径。现场打印一条“反序完成 + steering”的事件时间线和下一 request，分别解释为什么两种顺序不同。</p>\n<p>验收标准是你能指出 controller、transcript、queues 各由谁拥有，并证明 Agent 没有另写一个 loop。恢复时撤销本章文件，前章 <code>npm run workshop:test -- coding-tools</code> 仍通过。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"无脚手架迁移 · waitForIdle\"><header><span class=\"block-kicker\">可选迁移</span><h4>无脚手架迁移 · waitForIdle</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>在不暴露内部 controller 的前提下实现 <code>waitForIdle()</code>：idle 时立即 resolve，running 时等待当前 prompt 的 <code>run_end</code> 与 finally cleanup 都完成。分别从成功和 abort 路径等待，证明多个等待者都只结算一次，且下一次 prompt 不会复用旧 signal。</p>\n</div></section><p>额外练习：让 subscriber 抛错，验证课程的隔离策略会把诊断追加到 <code>state.diagnostics</code>，active run 仍完成且 Agent 可再次使用；一个 renderer 不能永久锁死内核。</p>\n<h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><p>Stateful Agent 不增加新的推理算法，只集中管理跨运行所有权：一个 transcript、一个 active signal 树、两种消息队列和一组事件消费者。边界清楚以后，交互功能才不会反向污染核心。重入被拒绝，abort 贯穿全链路，steering 与 follow-up 在不同安全边界消费。下一章会把这些已完成的事实追加到 session；运行状态仍是暂时的，历史则开始跨进程存在。</p>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "事件是事实状态是派生快照",
        "title": "事件是事实，状态是派生快照",
        "level": 2
      },
      {
        "id": "abortsteering-与-follow-up-是三种不同时间语义",
        "title": "Abort、steering 与 follow-up 是三种不同时间语义",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "从纯循环到可中断的 Stateful Agent 用一个薄的有状态 facade 管理 transcript、生命周期、取消与两种用户消息时序。 第三部 · 让 Harness 可靠 stateful agent, lifecycle, abort, steering, follow-up, reentrancy 你将得到什么 先建立全景 事件是事实，状态是派生快照 Abort、steering 与 follow-up 是三种不同时间语义 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/09-stateful-agent.md"
  },
  {
    "id": "10",
    "slug": "session-tree",
    "part": "state",
    "partTitle": "第三部 · 让 Harness 可靠",
    "chapter": "10",
    "title": "会话是追加式事件树",
    "summary": "用 JSONL 中的 parent pointer 保存不可改写的历史，并从任意叶子重建一条活动路径。",
    "minutes": 125,
    "difficulty": "核心",
    "artifact": "packages/pi-course/src/session.ts",
    "prerequisites": [
      "03",
      "09"
    ],
    "terms": [
      "append-only log",
      "JSONL",
      "parent pointer",
      "active path",
      "branch",
      "resume"
    ],
    "upstream": [
      "packages/coding-agent/src/core/session-manager.ts",
      "packages/coding-agent/docs/session-format.md"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "8f95afe8ce0f5fd13d0040f8957cfbb7519a77cb",
    "parentCommit": "2cc53512238072868ef2e1928657992b419a656f",
    "commitSubject": "persist history as an append-only tree",
    "checkpointTest": "packages/pi-course/test/10-session-tree.test.ts",
    "html": "<h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>进入本章时，Agent 在进程内保存 transcript；进程一关，历史就消失。更糟的是，如果把历史理解成一个可修改数组，“回到旧消息重试”往往意味着删除后缀，过去的另一种尝试被永久抹掉。</p>\n<p>本章只增加一种复杂性：<strong>持久化的历史身份与分支关系</strong>。完成后，<code>workshop/src/session.ts</code> 的 <code>InMemorySessionStore</code> 与 <code>JsonlSessionStore</code> 会追加并读取 entry；纯函数 <code>pathTo</code> 能从调用者选定的任意叶子重建 active path。Store 不偷偷保存“当前分支”，选择权属于上层。</p>\n<p>不变量是：<strong>已有 SessionEntry 永不原地修改或删除；分支通过在旧 entry 下追加新孩子表达。</strong></p>\n<p>恢复本章起点时，只撤销 <code>workshop/src/session.ts</code> 与本章测试，并删除测试生成的临时 <code>.jsonl</code>。不要清空 Agent transcript 来“修复”store。恢复后 <code>npm run workshop:test -- stateful-agent</code> 应仍通过。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 10 · 先用 parent pointer 重建一条路径\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 10 · 先用 parent pointer 重建一条路径</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 09 的 target 开始，先做纯函数树路径，再接 JSONL。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/session.ts</code></p>\n<p><strong>第一步：</strong> 先不看 target diff，定义最小 <code>SessionEntry</code>，实现 <code>pathTo(entries, leafId)</code>；先让左右两个 leaf 各自还原，再处理重复、缺 parent 和环。</p>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/10-session-tree.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 10</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 10</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/10-*.test.js</code></p>\n<p><strong>通过证据：</strong> 分支路径、结构诊断、追加顺序、尾部损坏恢复测试通过；任何已有 entry 都没有被原地改写。</p>\n<p>第一次尝试禁止查看完整答案；不要先写 store class，先用内存数组证明树的不变量。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>三个看似相同的词，保存的是不同层次：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">runtime event stream   message_update、tool progress、渲染刷新\n        │ 只取完成事实\n        ▼\ncanonical transcript  user / assistant / toolResult（模型协议）\n        │ 加上身份和 parent\n        ▼\nsession log           message、模型变化、未来的 compaction 等持久事实</code></pre></figure><p>把每个 token delta 落盘会使恢复依赖临时渲染过程；只存最终文本又会丢 tool call/result 和错误语义。课程在 canonical 完整消息形成后，由本次 <code>run_end</code> 统一追加完整消息，不持久化 iterator、AbortController、pending set 或 UI 展开状态。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"回到旧节点是否要截断文件\"><header><span class=\"block-kicker\">先预测</span><h4>回到旧节点是否要截断文件</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>已有线性对话 <code>a → b → c</code>。用户选择从 <code>a</code> 继续，产生新回答 <code>d</code>。JSONL 应删除 b/c、复制 a 到新文件，还是只追加 d？最终活动路径与物理行顺序分别是什么？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>只追加 d，并令 <code>d.parentId = a.id</code>。物理顺序仍是 a、b、c、d；逻辑树是 a 同时拥有 b 和 d，活动路径为 a→d。文件追加顺序不是当前 transcript 顺序。</p>\n</div></details></section><h2 id=\"用-parent-pointer-把线性文件变成树\"><a class=\"heading-anchor\" href=\"#用-parent-pointer-把线性文件变成树\" aria-label=\"链接到 用 parent pointer 把线性文件变成树\">#</a>用 parent pointer 把线性文件变成树</h2><p>最小 entry 是 tagged union；header 可以保存格式版本，但不参与树：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">type EntryBase = {\n  id: string;\n  parentId: string | null;\n  timestamp: number;\n};\n\ntype SessionEntry =\n  | (EntryBase &amp; { type: &quot;message&quot;; message: AgentMessage })\n  | (EntryBase &amp; {\n      type: &quot;compaction&quot;;\n      summary: CompactionSummary;\n      compactedEntryIds: string[];\n    })\n  | (EntryBase &amp; {\n      type: &quot;metadata&quot;; key: string; value: unknown\n    });</code></pre></figure><p><code>id</code> 是事实身份，<code>parentId</code> 是逻辑边。调用者提供的 leaf 决定正在看的分支；要开新枝，只需构造一个 <code>parentId</code> 指向旧节点的新 entry 并 append。最小课程 Store 故意不维护 checkout 状态，避免“读写仓库”与“产品当前选中项”耦合。不要把数组下标当 identity：追加、迁移或导出都会改变下标。</p>\n<p>为什么不用“每次保存完整 transcript”的快照？快照虽然读取简单，却重复共享前缀，也无法判断两份相似数组究竟来自同一历史还是巧合。Parent pointer 让共享关系成为显式事实：每个 entry 只增加一个节点，分支成本与新增内容成正比，审计时还能定位选择发生在哪个父节点。代价是读取路径必须遍历并验证引用，这正是 <code>pathTo</code> 集中的职责。</p>\n<p>从 leaf 建 active path 的算法很小，却必须验证图结构：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">function pathTo(entries: SessionEntry[], leafId: string): SessionEntry[] {\n  const byId = new Map&lt;string, SessionEntry&gt;();\n  for (const entry of entries) {\n    if (byId.has(entry.id)) throw new Error(`duplicate id: ${entry.id}`);\n    byId.set(entry.id, entry);\n  }\n  const reverse: SessionEntry[] = [];\n  const visited = new Set&lt;string&gt;();\n  let current = byId.get(leafId);\n  if (!current) throw new Error(`unknown leaf: ${leafId}`);\n  while (current) {\n    if (visited.has(current.id)) throw new Error(&quot;parent cycle&quot;);\n    visited.add(current.id);\n    reverse.push(current);\n    if (current.parentId === null) break;\n    current = byId.get(current.parentId);\n    if (!current) throw new Error(&quot;missing parent&quot;);\n  }\n  return reverse.reverse();\n}</code></pre></figure><p>重复 id、缺失 parent 和 cycle 都是损坏，不能“尽量跳过”。读取不同 leaf 应得到相同共享前缀和不同后缀。</p>\n<p>验证不能只检查 JSON 形状。重复 id 会让 parent 指向产生歧义；缺失 parent 会形成孤岛；cycle 会让回溯永不结束。先建立唯一索引，再对选中路径维护 seen set，能把故障定位到首次偏差。是否要求“所有 entries 都从一个 root 可达”属于更严格的全库校验，可独立于按 leaf 读取，但两种策略都必须写清，不能随数据碰巧排列而变化。</p>\n<p>最小 Store 不保存当前 leaf 还有一个好处：同一历史可以同时服务两个只读视图，而不互相切换状态。产品若要在重启后记住用户最后选择，可把 leaf id 存在独立设置，或追加明确的 metadata entry；无论哪种方式，都不能假装“物理最后一行永远是当前路径”。选择是产品状态，父子边才是历史事实。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 10.1 · 在内存中长出两条分支\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 10.1 · 在内存中长出两条分支</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 实现 append、entries、pathTo 与 tree 查询，不先碰文件系统。</p>\n<p><strong>文件：</strong> <code>workshop/src/session.ts</code>、<code>workshop/test/session-context.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>用 <code>store.append(...)</code> 依次追加 a、b、c，检查 parent 链。</li>\n<li>直接追加 <code>parentId: &quot;a&quot;</code> 的 d；证明 b/c 对象与数量都未变化。</li>\n<li>分别调用 <code>pathTo(await store.entries(), &quot;c&quot;)</code> 与 <code>&quot;d&quot;</code>，断言共享 a。</li>\n<li>注入重复 id、缺 parent 与 cycle，要求错误指出首个坏节点。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- session-tree</code></p>\n<p><strong>预期：</strong> entries 的物理顺序为 a,b,c,d；两条逻辑路径分别为 a,b,c 与 a,d；损坏不会被静默过滤。</p>\n</div></section><h2 id=\"jsonl-提供追加证据不替你解决一切\"><a class=\"heading-anchor\" href=\"#jsonl-提供追加证据不替你解决一切\" aria-label=\"链接到 JSONL 提供追加证据，不替你解决一切\">#</a>JSONL 提供追加证据，不替你解决一切</h2><p>JSONL 一行一个完整对象，适合检查、流式读取与 append。课程文件只保存 <code>SessionEntry</code>；当前上游另有带版本的 header，那是产品格式而不是本章最小接口：</p>\n<figure class=\"code-frame\"><figcaption><span>json</span><button type=\"button\" data-copy-code aria-label=\"复制 json 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-json\">{&quot;type&quot;:&quot;message&quot;,&quot;id&quot;:&quot;a&quot;,&quot;parentId&quot;:null,&quot;timestamp&quot;:0,&quot;message&quot;:{&quot;role&quot;:&quot;user&quot;,&quot;content&quot;:[{&quot;type&quot;:&quot;text&quot;,&quot;text&quot;:&quot;修复测试&quot;}],&quot;timestamp&quot;:0}}\n{&quot;type&quot;:&quot;message&quot;,&quot;id&quot;:&quot;b&quot;,&quot;parentId&quot;:&quot;a&quot;,&quot;timestamp&quot;:1,&quot;message&quot;:{&quot;role&quot;:&quot;assistant&quot;,&quot;content&quot;:[{&quot;type&quot;:&quot;toolCall&quot;,&quot;id&quot;:&quot;c1&quot;,&quot;name&quot;:&quot;read&quot;,&quot;arguments&quot;:{&quot;path&quot;:&quot;a.ts&quot;}}],&quot;provider&quot;:&quot;scripted&quot;,&quot;model&quot;:&quot;scripted-v1&quot;,&quot;usage&quot;:{&quot;input&quot;:0,&quot;output&quot;:0,&quot;totalTokens&quot;:0},&quot;stopReason&quot;:&quot;toolUse&quot;,&quot;timestamp&quot;:1}}\n{&quot;type&quot;:&quot;message&quot;,&quot;id&quot;:&quot;r&quot;,&quot;parentId&quot;:&quot;b&quot;,&quot;timestamp&quot;:2,&quot;message&quot;:{&quot;role&quot;:&quot;toolResult&quot;,&quot;toolCallId&quot;:&quot;c1&quot;,&quot;toolName&quot;:&quot;read&quot;,&quot;content&quot;:[{&quot;type&quot;:&quot;text&quot;,&quot;text&quot;:&quot;...&quot;}],&quot;isError&quot;:false,&quot;timestamp&quot;:2}}</code></pre></figure><p><code>recoverJsonl(text)</code> 要报告行号并区分：尾部半行可能来自崩溃，返回已完成 entries 和 warning；中间坏行意味着后续 parent 关系不可信，必须失败。课程声明<strong>单进程单 writer</strong>，不假装 append 自动解决多进程锁、磁盘 flush 或跨平台原子性。</p>\n<p>尾部恢复之所以可接受，是因为最后一个换行之前的每行已经自包含；中间跳过则会让后续条目的 parent 可能指向被吞掉的事实。Warning 也必须交给调用者，而不是静默降级：用户需要知道最后一次动作可能没有持久化，才能决定重试、审计或停止。</p>\n<p>Resume 不是把所有物理行塞回模型。它先验证格式与树，再按 active leaf 得到 path，最后从 path 中投影 canonical messages。下一章才会加入 compaction，因此本章的投影只是筛出 <code>type: &quot;message&quot;</code>，且必须保留 assistant tool call 与其配对 results。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 10.2 · 证明 append 没有改写过去\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 10.2 · 证明 append 没有改写过去</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 实现 JSONL store，并从分支文件恢复同一逻辑树。</p>\n<p><strong>文件：</strong> <code>workshop/src/session.ts</code>、<code>workshop/test/session-context.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>用 <code>await JsonlSessionStore.open(path)</code> 打开临时文件，再逐行 append 完成 entry。</li>\n<li>每次 append 前保存原始 bytes，之后断言新文件仍以旧 bytes 为前缀。</li>\n<li>重启一个新 store，读取 entries，并由调用者分别选择两个 leaf 恢复路径。</li>\n<li>直接测试 <code>recoverJsonl</code> 的尾部半行与中间坏 JSON，固定 warnings 和错误语义。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- session-tree</code></p>\n<p><strong>预期：</strong> 正常文件可跨实例恢复；branch 不覆盖旧后缀；尾部截断返回 warning；中间损坏指出稳定行号，绝不 <code>catch { return [] }</code>。</p>\n</div></section><section class=\"learning-block learning-block--mechanism\" aria-label=\"持久化时点必须是完成事实\"><header><span class=\"block-kicker\">关键机制</span><h4>持久化时点必须是完成事实</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>Assistant 流中途崩溃时，不应把某个 <code>message_update</code> 当完整回答。课程只在 canonical 完整消息形成并结束本次运行后追加；若产品需要恢复 partial，必须设计独立 entry type 和恢复语义，不能冒充已完成 message。Tool result 同理：异常也先由执行器结构化，再作为完成事实落盘。</p>\n</div></section><aside class=\"learning-block learning-block--pi\" aria-label=\"与当前上游 Pi 对照\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>与当前上游 Pi 对照</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>固定提交 <code>8479bd8</code> 的当前产品主路径 <code>packages/coding-agent/src/core/session-manager.ts</code> 使用带版本 header 的 JSONL；entry 以 id/parentId 形成树，产品层的 branch 会移动 leaf，下一次 append 形成新孩子。它还保存 thinking/model、compaction、branch summary、extension custom entry、label 等事实。课程 Store 则无隐式 leaf，只实现 message 与最小 metadata；两者共享 append-only tree 和 active-path 语义。不要把并存的通用 AgentHarness 当成产品已经完全迁移后的唯一实现。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><section class=\"learning-block learning-block--failure\" aria-label=\"把物理最后一行当 active path\"><header><span class=\"block-kicker\">故障实验</span><h4>把物理最后一行当 active path</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>构造 a→b→c，再用 <code>parentId: &quot;a&quot;</code> 追加 d。临时把 resume 实现改成“读取全部 message 行”，或用文件最后 N 行作为历史。</p>\n<p>首次偏差是恢复出的 context 同时包含互斥分支 b/c 与 d，而不是 provider 报错。恢复 parent traversal 后，分别从 c、d 重建路径；证明选择 d 不删除 c，选择 c 也看不到 d。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 10 · 历史可分支且不可改写\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 10 · 历史可分支且不可改写</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p>运行 <code>npm run workshop:test -- session-tree</code>，演示：追加两轮 → 记录文件 hash/bytes → 指向旧 parent 追加新回答 → 重启 → 调用者仍可选择两条 leaf。原文件前缀必须逐字节保持。</p>\n<p>你还要从一条 toolUse trajectory 指出 call/result 在 session 中如何配对，并解释 event、transcript、session 各自丢弃了什么。恢复时撤销本章文件，<code>npm run workshop:test -- stateful-agent</code> 仍通过。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"无脚手架迁移 · 导出一条 trajectory\"><header><span class=\"block-kicker\">可选迁移</span><h4>无脚手架迁移 · 导出一条 trajectory</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>只给定 entries 与 leaf id，导出该 leaf 的 canonical messages、tool 调用次数、错误 result 数和分支深度。导出函数必须是纯派生：调用前后 entries 深度相等、JSON 序列化完全一致。用两个 sibling leaves 证明共享 prefix 不会被重复修改。</p>\n</div></section><p>额外练习：设计 v0→v1 的微型迁移，为旧的线性记录补 id/parentId。迁移默认只返回新对象，不覆盖原文件；解释为何“可读旧格式”和“自动改写用户历史”是两个授权级别。</p>\n<h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><p>Session 不是 transcript 数组的磁盘副本，而是不可改写事实组成的树。JSONL 提供物理追加，id/parentId 提供逻辑分支，active leaf 决定当前路径；事件只在完成后沉淀为 canonical message。下一章会在不删除这棵历史树的前提下，从 active path 派生有限大小的 context。</p>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "用-parent-pointer-把线性文件变成树",
        "title": "用 parent pointer 把线性文件变成树",
        "level": 2
      },
      {
        "id": "jsonl-提供追加证据不替你解决一切",
        "title": "JSONL 提供追加证据，不替你解决一切",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "会话是追加式事件树 用 JSONL 中的 parent pointer 保存不可改写的历史，并从任意叶子重建一条活动路径。 第三部 · 让 Harness 可靠 append-only log, JSONL, parent pointer, active path, branch, resume 你将得到什么 先建立全景 用 parent pointer 把线性文件变成树 JSONL 提供追加证据，不替你解决一切 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/10-session-tree.md"
  },
  {
    "id": "11",
    "slug": "context-compaction",
    "part": "state",
    "partTitle": "第三部 · 让 Harness 可靠",
    "chapter": "11",
    "title": "History 是事实，Context 是投影",
    "summary": "从追加式会话树派生有预算的模型视图，并用追加摘要而非删除历史完成压缩。",
    "minutes": 120,
    "difficulty": "核心",
    "artifact": "packages/pi-course/src/context.ts",
    "prerequisites": [
      "03",
      "10"
    ],
    "terms": [
      "history",
      "context projection",
      "token budget",
      "safe cut point",
      "compaction"
    ],
    "upstream": [
      "packages/coding-agent/src/core/compaction/compaction.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "22d4ca0319af97e0d6676c5b172e529e5412233c",
    "parentCommit": "8f95afe8ce0f5fd13d0040f8957cfbb7519a77cb",
    "commitSubject": "derive bounded context without rewriting history",
    "checkpointTest": "packages/pi-course/test/11-context-compaction.test.ts",
    "html": "<h1 id=\"history-是事实context-是投影\"><a class=\"heading-anchor\" href=\"#history-是事实context-是投影\" aria-label=\"链接到 History 是事实，Context 是投影\">#</a>History 是事实，Context 是投影</h1><h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>进入本章时，你的 Pi 已经把消息写成带 <code>id</code>、<code>parentId</code> 的追加式会话树，能够恢复和分支；缺口是：模型窗口有限，而会话事实会持续增长。若直接把“省 token”实现成删除旧 entry，你会同时破坏审计、分支和恢复。</p>\n<p>本章只增加一种复杂性：<strong>从不变的 history 派生可替换的 context</strong>。你将新增 <code>workshop/src/context.ts</code>，并在 <code>workshop/src/session.ts</code> 的 tagged union 中加入 <code>CompactionEntry</code>，得到 <code>buildContext(activePath, options)</code> 与 <code>compact(entries, input)</code>。这里的 <code>activePath</code> 由第 10 章的 <code>pathTo</code> 选出，context builder 不拥有“当前 leaf”。完成后可以观察到 history 条目只增不减，而模型收到的 messages 会因预算和最新 compaction entry 改变。</p>\n<p>不能破坏的不变量是：</p>\n<blockquote>\n<p>History 记录发生过什么；context 只回答本次模型需要看到什么。Compaction 改变投影，不改写过去。</p>\n</blockquote>\n<p>先运行 <code>git status --short</code>，把第 10 章验收状态提交为自己的 checkpoint。要回到本章起点，用该提交恢复 <code>workshop/src/context.ts</code>、<code>workshop/src/session.ts</code> 与对应测试；不要用本章结束状态覆盖第 10 章的会话实现。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 11 · 先保持一个 interaction 不被切开\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 11 · 先保持一个 interaction 不被切开</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 10 的 target 开始，history 保持不变，只派生 context。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/context.ts</code></p>\n<p><strong>第一步：</strong> 先不看 target diff，先实现 <code>groupInteractions</code>，用 <code>toolCallId</code> 把 assistant call 与可能逆序完成的 results 组成不可分割组；分组通过后再加入预算和 compaction。</p>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/11-context-compaction.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 11</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 11</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/11-*.test.js</code></p>\n<p><strong>通过证据：</strong> safe cut、单组超限、结果逆序、摘要追加与 context 重建测试通过；history 条目数只增不减。</p>\n<p>第一次尝试禁止查看完整答案；若预算算法卡住，先让陪练只检查分组是否正确，暂时不要讨论 token 估算。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>一次请求实际经过两个不同的数据面：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">SessionEntry 全集（事实）\n        │ 选择当前 leaf 的祖先路径\n        ▼\nactive path\n        │ 应用最新 compaction + 保留后缀\n        │ 加入本轮 system prompt\n        ▼\nContextProjection（临时视图） ──→ model.stream(...)</code></pre></figure><p>Session store 拥有事实；context builder 只有读取权。System prompt、当前工具定义、项目规则和已激活 skill 也不等于历史消息：它们可能随 cwd、配置或运行模式变化，因此必须在每轮投影时组合。</p>\n<p>这一区分还决定了调试方法。若用户说“模型忘了我们已经改过哪个文件”，先沿当前 leaf 查询原始 entry：事实不存在，是写入或分支选择问题；事实存在但没有进入 view，是投影问题；事实进入 view 后模型仍答错，才是模型行为问题。没有这三步，团队很容易靠不断加长 system prompt 掩盖 session 漏写，或为了减少 token 误删唯一可审计证据。</p>\n<p>同一份 history 也可以产生多个合法 context。例如小窗口模型需要更早压缩，大窗口模型可以保留更多原文；只读 mode 可以暴露不同工具描述；切换到子目录后项目指令也会改变。只要投影记录来源并且可重建，这些差异不是历史不一致。反过来，任何会影响“过去发生了什么”的信息都不能只放在瞬时 view 中：关键工具结果必须先成为 entry，再参与下一轮 context。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"删掉旧消息真的等价吗\"><header><span class=\"block-kicker\">先预测</span><h4>删掉旧消息真的等价吗</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>假设当前分支有 20 个 entry。你删除前 12 个，再保留一条摘要。模型也许仍能回答，那么恢复旧分支和审计工具执行还能正确吗？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>不能。摘要是有损派生物，无法证明原工具输入、结果和顺序；旧分支还可能引用被删 entry。正确做法是保留 20 个事实，再追加第 21 个 compaction entry，仅让 context builder 隐藏被摘要的前缀。</p>\n</div></details></section><h2 id=\"先做纯投影再谈压缩\"><a class=\"heading-anchor\" href=\"#先做纯投影再谈压缩\" aria-label=\"链接到 先做纯投影，再谈压缩\">#</a>先做纯投影，再谈压缩</h2><p>第一版 <code>buildContext</code> 不生成摘要，只做两件事：把调用者已经选好的 active path 转成 canonical message，再报告预算。分支选择仍由 Session 层的 <code>pathTo(entries, leafId)</code> 负责；否则 builder 会偷偷拥有第二份“当前 leaf”。纯函数边界让测试可以证明输入没有被修改。</p>\n<p>不要把 <code>ContextProjection</code> 缓存成新的事实源。它可以按 history leaf、模型能力、资源版本组成 cache key 来加速，但缓存失效后必须能从原始输入重新得到等价结果。尤其不能在 projection 上直接追加下一轮消息，再稍后“同步回”session；这会制造两个拥有写权的 transcript。</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">const activePath = pathTo(entries, &quot;e8&quot;);\nconst before = structuredClone(activePath);\nconst view = buildContext(activePath, {\n  systemPrompt: &quot;You are a coding agent.&quot;,\n  tokenBudget: 600,\n});\n\nassert.deepEqual(activePath, before);\nconsole.log(view.messages.map((m) =&gt; m.role));\nconsole.log(view.usage);</code></pre></figure><p>稳定输出模式应类似：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">[ &quot;user&quot;, &quot;assistant&quot;, &quot;toolResult&quot;, &quot;assistant&quot; ]\n{ system: 6, messages: 91, total: 97, budget: 600, overflow: false }</code></pre></figure><p>这里的 token 数是保守估计，不是假装与某家 tokenizer 完全一致。真正需要保证的是：分项可见、同一输入结果确定、给输出预留空间。课程版只统计 system 与 messages；生产系统还应把 tool schema 等固定开销纳入报告。</p>\n<section class=\"learning-block learning-block--mechanism\" aria-label=\"预算是一项准入检查\"><header><span class=\"block-kicker\">关键机制</span><h4>预算是一项准入检查</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>设模型窗口为 <code>W</code>，预留输出为 <code>R</code>，安全余量为 <code>M</code>，那么输入预算最多为 <code>W - R - M</code>。不要先把窗口塞满再等 provider 报错；应在请求前计算并把首次超限归因到 context 层。</p>\n</div></section><section class=\"learning-block learning-block--lab\" aria-label=\"实践 11.1 · 建立只读 ContextProjection\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 11.1 · 建立只读 ContextProjection</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 让同一组 entry 产生确定、可解释且不修改输入的模型视图。</p>\n<p><strong>文件：</strong> <code>workshop/src/context.ts</code>、<code>workshop/test/context-resources.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>定义 <code>ContextProjection</code>，至少包含 <code>systemPrompt</code>、<code>messages</code>、分项 <code>usage</code>。</li>\n<li>在调用处用第 10 章的 <code>pathTo</code> 选择 leaf；builder 只转换 <code>message</code> 和可进入 context 的 summary entry。</li>\n<li>注入字符近似 estimator；为输出和安全余量预留预算。</li>\n<li>测试分支选择、空 history、确定输出与输入深冻结。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- context</code></p>\n<p><strong>预期：</strong> 同一 fixture 连续构建两次结果深相等；SessionEntry 的数量、父子关系和内容均不变。</p>\n</div></section><h2 id=\"安全裁剪单位是语义组\"><a class=\"heading-anchor\" href=\"#安全裁剪单位是语义组\" aria-label=\"链接到 安全裁剪单位是语义组\">#</a>安全裁剪单位是语义组</h2><p>超限后不能简单取最后 N 条。一个 assistant message 可能声明两个 tool call：完成事件可以先报 c2 再报 c1，但第 07 章会按 call 源顺序把 c1、c2 的结果写入 canonical history。无论哪种顺序，若视图以孤立的 <code>toolResult</code> 开头，provider 都无法看到它回答哪次调用。课程版先把路径分成 interaction group，再只在组与组之间选择 cut point。</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">g1: user(u1) → assistant(a1:text)\ng2: user(u2) → assistant(a2:call c1,c2)\n  end events: c2 → c1\n  history:    toolResult(c1) → toolResult(c2)\n             → assistant(a3:text)\nsafe cut:  ^g1 或 ^g2\nunsafe cut:                         ^toolResult(c1)</code></pre></figure><p>注意三个顺序仍然不同：tool call 的声明顺序、工具完成顺序、canonical transcript 的写入顺序。分组逻辑必须依靠 <code>toolCallId</code> 配对，不能假设数组相邻就表示因果关系。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 11.2 · 找到不会拆散工具往返的 cut point\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 11.2 · 找到不会拆散工具往返的 cut point</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 在保留最近内容时，绝不留下孤立 call 或 result。</p>\n<p><strong>文件：</strong> <code>workshop/src/context.ts</code>、<code>workshop/test/context-resources.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>实现 <code>groupInteractions(messages)</code>，输出完整语义组及来源 entry id。</li>\n<li>从新到旧累加估算 token，在完整组边界选择 <code>firstKeptEntryId</code>。</li>\n<li>若单个组本身超预算，返回显式 <code>single_group_overflow</code>，不要悄悄从中间切。</li>\n<li>加入多工具、失败 toolResult、连续 user message 三组 fixture。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- context</code></p>\n<p><strong>预期：</strong> 任意选出的后缀都能通过 call/result 配对校验；单个超大组得到可诊断失败。</p>\n</div></section><h2 id=\"compaction-是追加状态转移\"><a class=\"heading-anchor\" href=\"#compaction-是追加状态转移\" aria-label=\"链接到 Compaction 是追加状态转移\">#</a>Compaction 是追加状态转移</h2><p>摘要不是一段“看起来通顺”的散文，而是可继续工作的状态：目标、约束、已完成工作、关键决策、改动文件、未解决问题和下一步。先用 deterministic summarizer 测协议，不让真实模型随机性污染核心测试。</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">type CompactionSummary = {\n  goal: string;\n  constraints: string[];\n  completed: string[];\n  decisions: string[];\n  changedFiles: string[];\n  unresolved: string[];\n  next: string[];\n};\n\ntype CompactionEntry = SessionEntryBase &amp; {\n  type: &quot;compaction&quot;;\n  summary: CompactionSummary;\n  firstKeptEntryId: string;\n  tokensBefore: number;\n};</code></pre></figure><p><code>CompactionEntry</code> 是历史中的新事实，所以它必须进入第 10 章的 <code>SessionEntry</code> union 并可由两种 store 追加；context builder 只负责把它渲染成 synthetic summary message。不要把 summary 直接塞进一份内存 messages 数组而不落盘，否则 resume 后无法重建同一视图。</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">const after = compact(entries, {\n  id: &quot;cmp-1&quot;,\n  parentId: &quot;e8&quot;,\n  timestamp: &quot;2026-01-01T00:00:00.000Z&quot;,\n  firstKeptEntryId: &quot;e6&quot;,\n  summary: {\n    goal: &quot;修复解析器&quot;,\n    constraints: [&quot;不改公开消息协议&quot;],\n    completed: [&quot;复现失败 fixture&quot;],\n    decisions: [&quot;保留 tagged union&quot;],\n    changedFiles: [&quot;src/parser.ts&quot;],\n    unresolved: [&quot;检查空输入&quot;],\n    next: [&quot;运行边界测试&quot;],\n  },\n  tokensBefore: 1700,\n});\n\nconsole.log(entries.length, after.length);\nconst compactedPath = pathTo(after, &quot;cmp-1&quot;);\nconsole.log(buildContext(compactedPath, options).sourceEntryIds);</code></pre></figure><p>预期关系是：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">history: 8 → 9 entries\ncontext: [cmp-1, e6, e7, e8]\nold entries e1…e5: 仍可查询，但不发送给模型</code></pre></figure><p>重复压缩时，新摘要要接续上一摘要和上次保留的内容；每轮最多自动压缩一次，摘要非法或仍然超限时明确失败，不能递归重试到失控。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 11.3 · 追加摘要并重建有限视图\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 11.3 · 追加摘要并重建有限视图</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 让压缩成为可恢复的 history 状态转移，而不是数组裁剪。</p>\n<p><strong>文件：</strong> <code>workshop/src/context.ts</code>、<code>workshop/src/session.ts</code>、<code>workshop/test/context-resources.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>把 <code>CompactionEntry</code> 加入 <code>SessionEntry</code> union，并保证 memory/JSONL store 原样追加。</li>\n<li>实现 <code>compact</code>：校验安全边界与 summary schema，返回旧 entries 加一条新 entry。</li>\n<li>让 <code>buildContext</code> 使用 active path 上最新 summary 加保留后缀；旧 entry 仍能按 id 查询。</li>\n<li>测试 resume、重复 compaction、非法 summary 和每轮最多一次自动尝试。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- context</code></p>\n<p><strong>预期：</strong> history 增加一条而 context 缩短；重启后投影一致；非法摘要不改变 history。</p>\n</div></section><aside class=\"learning-block learning-block--pi\" aria-label=\"Pi 8479bd84743e 的两条实现线\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>Pi 8479bd84743e 的两条实现线</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>当前产品主路径由 coding-agent 的 <code>SessionManager</code> 沿活动分支构造 context，追加 <code>CompactionEntry{summary, firstKeptEntryId, tokensBefore}</code>；旧 entry 仍留在 JSONL 中。<code>packages/agent/src/harness/</code> 也有通用 session/compaction 实现和 <code>AgentHarness</code>，它是并存的演进方向，不能写成 coding-agent 已迁移完成。课程保留同一不变量，但用结构化 deterministic summary 和单组超限错误缩小机制；这属于教学实现，不是逐行复刻。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><section class=\"learning-block learning-block--failure\" aria-label=\"失败注入 · 从 toolResult 中间截断\"><header><span class=\"block-kicker\">故障实验</span><h4>失败注入 · 从 toolResult 中间截断</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>把安全分组暂时替换成 <code>messages.slice(-3)</code>，让 fixture 的第一条保留消息成为 <code>toolResult(c2)</code>。</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">expected: context begins at user(u2), calls c1/c2 are both visible\nobserved: context begins at toolResult(c2)\nfirst divergence: context.selectCutPoint\nviolated invariant: 每个 toolResult 必须能在当前视图中找到同 id 的 toolCall</code></pre></figure><p>不要在 provider adapter 外层加 catch 来“修复”它。最小下一信号是打印 <code>sourceEntryIds</code> 和未配对的 <code>toolCallId</code>；修复位置是 cut point，而不是模型、session 或工具。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><figure class=\"code-frame\"><figcaption><span>bash</span><button type=\"button\" data-copy-code aria-label=\"复制 bash 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-bash\">npm run workshop:test -- context\nnpm run workshop:test -- session</code></pre></figure><p>验收不仅是绿灯。你还应能展示：压缩前后的 history JSON 完全保留旧 entry；context 从摘要加保留后缀重建；故障输出能指出第一个协议偏差。</p>\n<section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 11 · 有限窗口下仍不改写过去\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 11 · 有限窗口下仍不改写过去</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p><strong>完成状态：</strong> <code>workshop/src/context.ts</code> 能构建分项预算、选择安全边界、追加 compaction 并重建视图；<code>session.ts</code> 能持久化该 entry。</p>\n<p><strong>观察证据：</strong> history 数量增加一，context 数量减少；旧分支和旧工具结果仍可由 id 查询。</p>\n<p><strong>恢复：</strong> 用本章开始前记录的提交恢复 <code>workshop/src/context.ts</code>、<code>workshop/src/session.ts</code> 与 <code>workshop/test/context-resources.test.ts</code>，再运行 <code>npm run workshop:test -- session</code>，应回到“会话可恢复但尚无预算投影”的状态。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"无现成答案 · 为单个超大 interaction 设计策略\"><header><span class=\"block-kicker\">可选迁移</span><h4>无现成答案 · 为单个超大 interaction 设计策略</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>不修改 history，设计并实现一种 <code>single_group_overflow</code> 处理：可以压缩超大工具输出，也可以生成 turn-prefix summary，但必须保留 call/result 配对和来源 id。只给自己写行为测试，不复制 Pi 的 split-turn 实现。比较压缩前后关键事实召回，并记录至少一个摘要丢失的信息。</p>\n</div></section><p>隔一章后，请不看本页重新回答：为什么 summary entry 属于 history，而由它生成的 synthetic message 只属于 context？能从所有权解释清楚，才算掌握，而不只是测试通过。</p>\n<h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><ul>\n<li>History 是追加式事实树；context 是按 leaf、运行资源与预算重建的临时视图。</li>\n<li>预算要在 provider 请求前分项测量，并为输出留空间。</li>\n<li>Cut point 必须尊重完整 interaction，尤其是 tool call/result 配对。</li>\n<li>Compaction 追加可追溯摘要并重建 context，绝不删除旧历史。</li>\n<li>当前 Pi 的生产 <code>AgentSession + SessionManager</code> 与通用 <code>AgentHarness</code> 实现并存；课程对齐行为边界，不假装架构已经统一。</li>\n</ul>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "先做纯投影再谈压缩",
        "title": "先做纯投影，再谈压缩",
        "level": 2
      },
      {
        "id": "安全裁剪单位是语义组",
        "title": "安全裁剪单位是语义组",
        "level": 2
      },
      {
        "id": "compaction-是追加状态转移",
        "title": "Compaction 是追加状态转移",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "History 是事实，Context 是投影 从追加式会话树派生有预算的模型视图，并用追加摘要而非删除历史完成压缩。 第三部 · 让 Harness 可靠 history, context projection, token budget, safe cut point, compaction 你将得到什么 先建立全景 先做纯投影，再谈压缩 安全裁剪单位是语义组 Compaction 是追加状态转移 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/11-context-compaction.md"
  },
  {
    "id": "12",
    "slug": "resources-extensions",
    "part": "product",
    "partTitle": "第四部 · 从核心到产品",
    "chapter": "12",
    "title": "Resources、Skills 与 Extensions",
    "summary": "用渐进式披露加载知识资源，并把可执行扩展放在明确的信任边界之后。",
    "minutes": 110,
    "difficulty": "进阶",
    "artifact": "packages/pi-course/src/resources.ts",
    "prerequisites": [
      "06",
      "11"
    ],
    "terms": [
      "resource",
      "prompt template",
      "skill",
      "extension",
      "progressive disclosure",
      "trust boundary"
    ],
    "upstream": [
      "packages/coding-agent/src/core/resource-loader.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "8c701b3bd31f01b66d4f06a5ab054f374549edc8",
    "parentCommit": "22d4ca0319af97e0d6676c5b172e529e5412233c",
    "commitSubject": "add progressive resources and trusted extensions",
    "checkpointTest": "packages/pi-course/test/12-resources-extensions.test.ts",
    "html": "<h1 id=\"resourcesskills-与-extensions\"><a class=\"heading-anchor\" href=\"#resourcesskills-与-extensions\" aria-label=\"链接到 Resources、Skills 与 Extensions\">#</a>Resources、Skills 与 Extensions</h1><h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>进入本章时，Pi 的 model、tool、session 与 context 已经闭合，但增加一种新工作流仍要改核心源码。缺口不是“再做一个万能插件”，而是先判断新能力究竟是文本、知识、环境动作，还是宿主代码。</p>\n<p>本章只增加一种复杂性：<strong>可发现但有权限分层的扩展面</strong>。你将修改 <code>workshop/src/resources.ts</code>，实现 template/skill 的确定性发现和按需读取，再用受限 <code>ExtensionContext</code> 注册 tool 与 hook。最终能观察每项能力的类型、来源、启用状态、冲突和信任决定。</p>\n<p>不能破坏的不变量是：</p>\n<blockquote>\n<p>Skill 是被读取并进入 context 的资源；Extension 是会执行的宿主代码。文件名相似不能抹平两者的权限差异。</p>\n</blockquote>\n<p>在第 11 章 checkpoint 上保存当前改动。恢复本章起点时，只恢复 <code>workshop/src/resources.ts</code> 和资源测试；Agent loop、context 与 session 不应因卸载资源而改变。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 12 · 先发现元数据，不执行代码\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 12 · 先发现元数据，不执行代码</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 11 的 target 开始，先把资源发现和执行权限分开。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/resources.ts</code></p>\n<p><strong>第一步：</strong> 先不看 target diff，只实现 <code>discoverResources</code> 的确定性 metadata 列表与冲突诊断；确认没有读取 skill 正文、没有 import extension 后，再做 activation 与 trust gate。</p>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/12-resources-extensions.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 12</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 12</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/12-*.test.js</code></p>\n<p><strong>通过证据：</strong> precedence、按需激活、路径逃逸、信任拒绝、hook timeout 与配对错误结果测试通过；skill 与 extension 权限没有混淆。</p>\n<p>第一次尝试禁止查看完整答案；每加一层权限先写出它可以读取或执行什么，不能用一个万能 loader 合并。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>“扩展 Pi”至少有四种不同需求：</p>\n<table>\n<thead>\n<tr>\n<th>原语</th>\n<th>输入变成什么</th>\n<th>何时生效</th>\n<th>获得的权限</th>\n</tr>\n</thead>\n<tbody><tr>\n<td>Prompt template</td>\n<td>一条 canonical user message</td>\n<td>用户显式渲染时</td>\n<td>纯文本变换</td>\n</tr>\n<tr>\n<td>Skill</td>\n<td>说明与必要资源进入 context</td>\n<td>发现后按需读取</td>\n<td>提示影响；动作仍经 tool</td>\n</tr>\n<tr>\n<td>Tool</td>\n<td>结构化环境动作</td>\n<td>模型发出合法 call 时</td>\n<td>由该 tool 的实现决定</td>\n</tr>\n<tr>\n<td>Extension</td>\n<td>tool、hook 等注册项</td>\n<td>模块加载/激活时</td>\n<td>Node 进程的宿主权限</td>\n</tr>\n</tbody></table>\n<p>同一个“代码审查”需求可能同时用三种原语：template 收集审查目标，skill 说明审查步骤，tool 读取 diff。只有确实需要监听生命周期或注册新动作时，才引入 extension。</p>\n<p>选择时可以问两个问题。第一，模型只是缺少知识，还是环境真的需要新增动作？前者优先 skill，后者才是 tool。第二，这个能力是否必须观察运行生命周期？若否，就没有理由让它成为可执行 extension。原语越强，测试面、冲突面和信任成本越大；“以后可能用到”不是提前授予权限的理由。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"Markdown 就一定安全吗\"><header><span class=\"block-kicker\">先预测</span><h4>Markdown 就一定安全吗</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>项目里的 <code>SKILL.md</code> 写着“运行 scripts/review.sh”，资源加载器读取它时是否已经执行脚本？它和加载一个 <code>.ts</code> extension 风险相同吗？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>读取 skill 不会自动执行脚本；正文只是进入模型上下文。不过它会影响模型，模型随后可能通过 bash tool 执行指令，所以它仍是需要展示来源的非可信提示。Extension 在 import 和 factory 阶段就能运行宿主代码，风险更高，必须在 import 之前完成信任判断。</p>\n</div></details></section><h2 id=\"resource-是带来源的数据\"><a class=\"heading-anchor\" href=\"#resource-是带来源的数据\" aria-label=\"链接到 Resource 是带来源的数据\">#</a>Resource 是带来源的数据</h2><p>不要让 loader 返回匿名字符串。后续的冲突诊断、信任提示和 context 归因都依赖来源元数据：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export type Resource =\n  | {\n      kind: &quot;template&quot;;\n      name: string;\n      source: string;\n      body: string;\n    }\n  | {\n      kind: &quot;skill&quot;;\n      name: string;\n      description: string;\n      source: string;\n      root: string;\n      body?: string;\n    };\n\nexport interface ResourceCatalog {\n  resources: Resource[];\n  diagnostics: Array&lt;{ level: &quot;warning&quot; | &quot;error&quot;; message: string }&gt;;\n}</code></pre></figure><p>发现 skill 时先读取很短的 name、description 和 source；只有显式激活才读取完整正文。这叫渐进式披露：把“有哪些能力”常驻 context，把“如何执行某能力”延迟到真正需要时。</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">startup context:\n  code-review — 检查 diff、测试与风险（project/.pi/skills/code-review）\n\nafter activateSkill(&quot;code-review&quot;):\n  + SKILL.md 正文\n  + 被明确引用的 references/checklist.md</code></pre></figure><p>Template 更简单：它是参数到字符串的纯变换。缺变量、重名、转义规则必须明确，渲染结果只能成为 user message，不能偷偷调用 Agent 或读任意文件。</p>\n<section class=\"learning-block learning-block--mechanism\" aria-label=\"来源是资源协议的一部分\"><header><span class=\"block-kicker\">关键机制</span><h4>来源是资源协议的一部分</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>至少记录 <code>kind/name/source/scope</code>。同名冲突不要静默“最后一个赢”；先产生诊断，再按一条公开、可测试的 precedence 决定。这样 <code>/resources</code> 才能回答“加载了什么、从哪里来、为什么胜出”。</p>\n</div></section><section class=\"learning-block learning-block--lab\" aria-label=\"实践 12.1 · 实现确定性资源目录\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 12.1 · 实现确定性资源目录</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 发现 template 与 skill，但只在激活 skill 后读取完整正文。</p>\n<p><strong>文件：</strong> <code>workshop/src/resources.ts</code>、<code>workshop/test/context-resources.test.ts</code>、测试临时目录</p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>实现 <code>discoverResources(roots)</code>，按规范化 source path 排序。</li>\n<li>解析 template 名称和 skill 的 name/description；缺 description 的 skill 返回诊断。</li>\n<li>同名时保留第一个确定候选并报告所有冲突来源。</li>\n<li>实现 <code>activateSkill(catalog, name)</code>，返回正文、来源和诊断，不直接修改 Agent。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- resources</code></p>\n<p><strong>预期：</strong> 未激活时 catalog 不含 skill 正文；改变文件系统枚举顺序不会改变结果；重复名称有稳定 warning。</p>\n</div></section><h2 id=\"skill-的资源根不能变成任意文件入口\"><a class=\"heading-anchor\" href=\"#skill-的资源根不能变成任意文件入口\" aria-label=\"链接到 Skill 的资源根不能变成任意文件入口\">#</a>Skill 的资源根不能变成任意文件入口</h2><p>Skill 可以引用同目录的脚本、资料和资产，但 <code>../../.env</code> 不应因“相对路径”而被当作合法资源。课程版把可读取路径限制在 skill 的 canonical root：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">function resolveSkillResource(root: string, request: string): string {\n  const candidate = realpathSync(resolve(root, request));\n  const canonicalRoot = realpathSync(root);\n  if (candidate !== canonicalRoot &amp;&amp;\n      !candidate.startsWith(canonicalRoot + sep)) {\n    throw new Error(&quot;skill_resource_outside_root&quot;);\n  }\n  return candidate;\n}</code></pre></figure><p>检查必须基于 canonical path，避免 <code>..</code> 和符号链接逃逸。这是<strong>课程主动强化</strong>：当前上游 Pi 的 coding tools 本身没有 cwd jail；不能据此宣称 Pi 已提供完整文件沙箱。即使资源路径被限制，skill 仍可能劝模型调用更强的 bash tool，所以来源和用户信任仍不可省略。</p>\n<p>路径安全也不等于内容安全。Skill 的职责本来就是影响模型行为，因此不能靠“过滤危险句子”把 prompt injection 变成已解决问题。更可靠的控制在动作边界：展示来源、只激活与任务相关的 skill、保持 tool 参数验证，并让高风险动作经过独立策略。资源诊断应保留哪份说明进入了哪一轮 context，事故发生后才能区分模型自行判断、skill 指令与 extension hook。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 12.2 · 让 skill 激活可追踪、不可逃逸\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 12.2 · 让 skill 激活可追踪、不可逃逸</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 读取合法配套资源，同时拒绝目录外路径。</p>\n<p><strong>文件：</strong> <code>workshop/src/resources.ts</code>、<code>workshop/test/context-resources.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>对 root 与目标执行 realpath 后再比较边界。</li>\n<li>测试普通相对路径、<code>..</code>、绝对路径和指向目录外的 symlink。</li>\n<li>让激活结果列出本轮实际读取的 source，而不是只返回拼接文本。</li>\n<li>把读取失败转换为资源诊断，不伪装成 model error。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- resources</code></p>\n<p><strong>预期：</strong> 合法 reference 可读；三种逃逸均在 resource 层失败；没有 tool call 或 session message 被凭空制造。</p>\n</div></section><h2 id=\"extension-先过信任门再执行工厂\"><a class=\"heading-anchor\" href=\"#extension-先过信任门再执行工厂\" aria-label=\"链接到 Extension 先过信任门，再执行工厂\">#</a>Extension 先过信任门，再执行工厂</h2><p>受限 context 的首要价值是降低耦合：extension 只能注册公开能力，不能拿到可随意修改的 Agent 私有对象。但它不是安全沙箱——一个已 import 的 Node 模块仍可自行导入 <code>node:fs</code>。真正的安全边界是：<strong>未信任前不 import</strong>。</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export async function loadExtension(\n  source: ExtensionSource,\n  deps: {\n    isTrusted(source: ExtensionSource): boolean;\n    importModule(path: string): Promise&lt;{ default: ExtensionFactory }&gt;;\n    context: ExtensionContext;\n  },\n): Promise&lt;ExtensionDiagnostic&gt; {\n  if (!deps.isTrusted(source)) {\n    return { source: source.path, status: &quot;skipped_untrusted&quot; };\n  }\n  const module = await deps.importModule(source.path);\n  await module.default(Object.freeze(deps.context));\n  return { source: source.path, status: &quot;active&quot; };\n}</code></pre></figure><p>测试时注入 <code>importModule</code> spy，证明拒绝状态下调用次数为零。Hook 也要有窄语义：例如 <code>beforeToolCall</code> 只能 allow/deny。若 deny 或 hook 抛错，核心 executor 仍负责生成与 call id 配对的结构化 <code>toolResult</code>；extension 不能直接伪造 transcript。</p>\n<p>多个 hook 还需要确定顺序、超时和失败策略。课程版按注册顺序串行执行 <code>beforeToolCall</code>：第一个 deny 立即停止后续策略，审计信息记录做出决定的 extension id；观察型 <code>afterToolResult</code> 即使失败也不能把已经发生的工具结果改写为成功。若未来允许 hook 变换输入，必须为“谁看到前一变换、谁拥有最终值”建立新协议，不能靠数组顺序的偶然行为。</p>\n<aside class=\"learning-block learning-block--pi\" aria-label=\"Pi 8479bd84743e 的资源与执行边界\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>Pi 8479bd84743e 的资源与执行边界</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>当前 coding-agent 的 <code>DefaultResourceLoader</code> 统一发现 skills、prompts、themes、context files 与 extensions；项目级动态资源在 project trust 之后加载。Skill 只把名称/描述放进 system prompt，完整 <code>SKILL.md</code> 由 read 或 <code>/skill:name</code> 按需取得。Extension 则经 jiti 导入 TypeScript，拥有完整系统权限，并可注册 tool、command 与大量生命周期 hook。通用 <code>AgentHarness</code> 另有 skills/promptTemplates 与 hook 面；生产 CLI 仍走 <code>Agent + AgentSession + SessionManager</code> 及 coding-agent 的 extension runner，两条方向处于并存状态。上游工具 schema 使用当前 <code>typebox</code> 包。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><section class=\"learning-block learning-block--failure\" aria-label=\"失败注入 · 先 import，再询问信任\"><header><span class=\"block-kicker\">故障实验</span><h4>失败注入 · 先 import，再询问信任</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>交换 <code>loadExtension</code> 中两步的顺序，让测试模块在顶层把 <code>executed = true</code>，然后令 <code>isTrusted</code> 返回 false。</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">expected: { status: &quot;skipped_untrusted&quot;, imported: false }\nobserved: { status: &quot;skipped_untrusted&quot;, imported: true }\nfirst divergence: extension import\nviolated invariant: 未信任代码不得执行</code></pre></figure><p>错误不在 <code>ExtensionContext</code> 是否足够窄；顶层副作用发生在 factory 收到 context 之前。把信任判断移回 import 前，并保留一条测试锁住这个顺序。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><figure class=\"code-frame\"><figcaption><span>bash</span><button type=\"button\" data-copy-code aria-label=\"复制 bash 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-bash\">npm run workshop:test -- resources\nnpm run workshop:test -- tool\nnpm run workshop:test -- agent-loop</code></pre></figure><p>增加并禁用一个 extension 后，tool 与 loop 的既有测试应完全不变。你还要展示一次 <code>/resources</code> 等价诊断：类型、名称、来源、状态、冲突与 trust decision 都可解释。</p>\n<section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 12 · 知识可发现，代码有信任门\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 12 · 知识可发现，代码有信任门</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p><strong>完成状态：</strong> template/skill 作为带来源数据加载；extension 仅在信任后 import，并通过公开 context 注册能力。</p>\n<p><strong>观察证据：</strong> 未激活 skill 不占完整 context；未信任 extension 的 import spy 为零；卸载全部资源后核心回归仍通过。</p>\n<p><strong>恢复：</strong> 从本章开始前的提交恢复 <code>workshop/src/resources.ts</code> 和资源测试。恢复后 Pi 核心仍能运行，只是不再发现 template、skill 和 extension。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"原语选择 · 把一个模糊需求拆对\"><header><span class=\"block-kicker\">可选迁移</span><h4>原语选择 · 把一个模糊需求拆对</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>需求是“每次准备提交时按团队清单审查 diff，并阻止提交密钥”。不提供 starter：自行决定哪些部分属于 template、skill、tool、extension，写出每项进入 context 的时机和权限。实现最小版本，并证明删除 extension 后审查知识仍可读、删除 skill 后密钥阻止策略仍按你的设计可解释。</p>\n</div></section><p>过两章再做一次无提示检索：面对“查询内部 API 并自动修复代码”，先画出知识与动作边界，再选原语。能拒绝“全部做成 tool/extension”的便利诱惑，才说明你掌握了分层。</p>\n<h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><ul>\n<li>Template 是纯文本变换，skill 是按需读取的知识资源，tool 是结构化动作，extension 是宿主代码。</li>\n<li>渐进式披露降低常驻 context 成本，但提示资源仍需来源与信任信息。</li>\n<li>课程限制 skill 资源根是主动强化，不代表上游 coding tools 自带 cwd jail。</li>\n<li>受限 <code>ExtensionContext</code> 降低耦合，不构成 Node 沙箱；信任判断必须发生在 import 之前。</li>\n<li>当前 Pi 的 coding-agent 生产扩展系统与通用 <code>AgentHarness</code> 方向并存，教材对齐权限和生命周期边界。</li>\n</ul>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "resource-是带来源的数据",
        "title": "Resource 是带来源的数据",
        "level": 2
      },
      {
        "id": "skill-的资源根不能变成任意文件入口",
        "title": "Skill 的资源根不能变成任意文件入口",
        "level": 2
      },
      {
        "id": "extension-先过信任门再执行工厂",
        "title": "Extension 先过信任门，再执行工厂",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "Resources、Skills 与 Extensions 用渐进式披露加载知识资源，并把可执行扩展放在明确的信任边界之后。 第四部 · 从核心到产品 resource, prompt template, skill, extension, progressive disclosure, trust boundary 你将得到什么 先建立全景 Resource 是带来源的数据 Skill 的资源根不能变成任意文件入口 Extension 先过信任门，再执行工厂 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/12-resources-extensions.md"
  },
  {
    "id": "13",
    "slug": "composition-root",
    "part": "product",
    "partTitle": "第四部 · 从核心到产品",
    "chapter": "13",
    "title": "一个核心，多种产品入口",
    "summary": "在唯一组装边界连接模型、工具、会话与资源，让交互、文本和 JSON 模式共享同一套 Agent 语义。",
    "minutes": 120,
    "difficulty": "进阶",
    "artifact": "packages/pi-course/src/composition.ts",
    "prerequisites": [
      "09",
      "10",
      "11",
      "12"
    ],
    "terms": [
      "composition root",
      "runtime",
      "mode adapter",
      "wire event",
      "stdout",
      "stderr"
    ],
    "upstream": [
      "packages/coding-agent/src/core/agent-session-runtime.ts",
      "packages/coding-agent/src/main.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "1d6ce0795bf975b89af0db014234f93fcd34458e",
    "parentCommit": "8c701b3bd31f01b66d4f06a5ab054f374549edc8",
    "commitSubject": "assemble one runtime for every product mode",
    "checkpointTest": "packages/pi-course/test/13-composition-root.test.ts",
    "html": "<h1 id=\"一个核心多种产品入口\"><a class=\"heading-anchor\" href=\"#一个核心多种产品入口\" aria-label=\"链接到 一个核心，多种产品入口\">#</a>一个核心，多种产品入口</h1><h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>进入本章时，你已经有模型、工具、Agent、会话、context 和资源系统，但它们很可能由测试或某个 CLI 文件临时拼在一起。若 print、interactive、JSON 各自再拼一遍，三个“Pi”会逐渐拥有不同的终止、持久化和错误语义。</p>\n<p>本章只增加一种复杂性：<strong>产品入口与核心运行时的组合边界</strong>。你将修改 <code>workshop/src/composition.ts</code>，让一个 composition root 组装 model、tools、session、context、resources 和 Agent；mode 只负责输入与呈现。完成后，同一 ScriptedModel 场景通过三种入口会产生相同的 canonical transcript，只是外部输出协议不同。</p>\n<p>不能破坏的不变量是：</p>\n<blockquote>\n<p>Mode 可以改变输入输出形式，不能改变 Agent 如何思考、调用工具、终止和落盘。</p>\n</blockquote>\n<p>先保存第 12 章 checkpoint。要恢复本章起点，只恢复 <code>workshop/src/composition.ts</code> 及 mode 黑盒测试；核心的 <code>agent-loop.ts</code>、<code>session.ts</code> 和 <code>context.ts</code> 不应该出现模式专用分支。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 13 · 先让依赖只相遇一次\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 13 · 先让依赖只相遇一次</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 12 的 target 开始，先组合一个 runtime，再投影多种 mode。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/composition.ts</code></p>\n<p><strong>第一步：</strong> 先不看 target diff，实现 <code>createRuntime(deps)</code>，只连接 model、tools、session、resources 与 Agent；用同一 fixture 证明核心 transcript 后，再写 <code>runPrint</code>、<code>runJson</code> 和 interactive adapter。</p>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/13-composition-root.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 13</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 13</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/13-*.test.js</code></p>\n<p><strong>通过证据：</strong> 三种 mode 的 canonical transcript 一致，差异只在 stdout/JSON/交互呈现；核心文件没有 mode 分支。</p>\n<p>第一次尝试禁止查看完整答案；若接口太多，先让陪练列出必须注入的依赖，不允许引入全局单例。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>Composition root 不是新的“万能管理器”，而是依赖首次相遇的唯一地点：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">config ─┬─ model\n        ├─ tool registry\n        ├─ session store\n        ├─ context builder\n        └─ resources\n               │\n               ▼\n          createRuntime()\n               │ 共享 Agent/Session 行为\n       ┌───────┼────────┐\n       ▼       ▼        ▼\n interactive  print    json\n  人类 I/O   Unix I/O  wire events</code></pre></figure><p>核心只发 typed events、接收 user message；它不知道 TTY、<code>process.stdout</code>、颜色、JSONL 或命令行参数。Mode adapter 则不知道 provider SDK、JSONL session 文件结构和 coding tool 构造函数。</p>\n<p>对象生命周期也应在这里说清：composition root 创建 runtime，mode 在运行期间借用它，最外层负责 dispose。切换 session 或 cwd 时，先让旧 runtime 完成 shutdown，再为新边界重新发现资源和构造会话相关服务；不能让 UI 保存一个已经失效的 Agent 引用继续写旧 session。所有权明确后，取消、清理子进程和 extension 卸载才有唯一负责人。</p>\n<p>判断边界是否正确有个直接办法：把 CLI 换成测试、网页或定时任务时，核心对象图是否仍能原样复用；把 provider 换成 ScriptedModel 时，mode 是否完全不知情。若答案是否定的，变化轴还没有被挡在正确位置。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"在 loop 里判断 mode 会怎样\"><header><span class=\"block-kicker\">先预测</span><h4>在 loop 里判断 mode 会怎样</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>把 <code>if (mode === &quot;json&quot;) emitRawObject()</code> 写进 agent loop，短期能少一个 adapter。之后添加 RPC 或网页入口时，哪一层最先失控？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>核心控制流会同时承担业务状态机和传输协议，测试必须为每个 mode 重跑所有终止分支，JSON 序列化错误也会伪装成 Agent 错误。正确做法是 loop 只发内部事件，由边界 adapter 映射为各自输出。</p>\n</div></details></section><h2 id=\"composition-root-只组装不承载业务\"><a class=\"heading-anchor\" href=\"#composition-root-只组装不承载业务\" aria-label=\"链接到 Composition root 只组装，不承载业务\">#</a>Composition root 只组装，不承载业务</h2><p>先定义课程运行时的显式依赖。测试注入 ScriptedModel 和 memory session；真实 CLI 注入 provider adapter 和 JSONL store。两条路径调用同一个构造函数。</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export interface RuntimeDeps {\n  model: Model;\n  tools: Tool[];\n  session: SessionStore;\n  resources: ResourceCatalog;\n  systemPrompt: string;\n  tokenBudget: number;\n}\n\nexport function createRuntime(deps: RuntimeDeps): Runtime {\n  const agent = new Agent({\n    model: deps.model,\n    tools: new ToolRegistry(deps.tools),\n    session: deps.session,\n    buildContext: (activePath) =&gt;\n      buildContext(activePath, {\n        systemPrompt: deps.systemPrompt,\n        tokenBudget: deps.tokenBudget,\n      }),\n  });\n  return { agent, session: deps.session, resources: deps.resources };\n}</code></pre></figure><p>这段函数应当无环境探测、无隐藏 singleton、无 <code>process.exit</code>。读取配置、打开文件和选择 mode 可以发生在它外面；一旦 <code>RuntimeDeps</code> 构造完，核心对象图就是可检查的。</p>\n<p>还要抵抗“方便”的 service locator。若任意模块都能 <code>getGlobalRuntime()</code>，依赖虽然从构造函数上消失，却变成运行时顺序：先初始化谁、测试忘记清理什么、并行 case 共享了哪个 session。显式传入 <code>Runtime</code> 看起来多写几个参数，却让调用关系、替换边界和并发隔离都能由类型与测试检查。</p>\n<section class=\"learning-block learning-block--mechanism\" aria-label=\"Dependency injection 的价值是替换副作用\"><header><span class=\"block-kicker\">关键机制</span><h4>Dependency injection 的价值是替换副作用</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>重点不是“所有东西都要接口化”，而是把不稳定边界换掉：真实网络换 ScriptedModel，磁盘会话换 memory store，真实时钟换固定时钟。Agent 语义本身不要因测试而另写一份 fake loop。</p>\n</div></section><section class=\"learning-block learning-block--lab\" aria-label=\"实践 13.1 · 抽出唯一 createRuntime\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 13.1 · 抽出唯一 createRuntime</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 让测试与三种 mode 共用一个 Agent 构造过程。</p>\n<p><strong>文件：</strong> <code>workshop/src/composition.ts</code>、<code>workshop/test/composition-eval.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>定义 <code>RuntimeDeps</code> 与 <code>Runtime</code>，显式列出 model、tools、session、resources、context 配置。</li>\n<li>把所有 <code>new Agent</code> 移到 <code>createRuntime</code>；mode 文件只能接收 <code>Runtime</code>。</li>\n<li>给 model 和 session 加 identity spy，证明三种 mode 的测试没有隐藏构造第二份核心。</li>\n<li>用相同 scripted scenario 分别执行 mode，比较最终 canonical transcript。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- composition</code></p>\n<p><strong>预期：</strong> 三个 transcript 深相等；差异只存在于渲染输出；核心文件 diff 不含 mode 名称。</p>\n</div></section><h2 id=\"mode-是协议适配器\"><a class=\"heading-anchor\" href=\"#mode-是协议适配器\" aria-label=\"链接到 Mode 是协议适配器\">#</a>Mode 是协议适配器</h2><p>Print mode 是 Unix 接口：输入来自参数或 stdin，最终文本写 stdout，诊断写 stderr，退出码表达结果。Interactive mode 可以维护编辑器、命令和流式渲染状态，但会话事实仍归 SessionStore。JSON mode 面向机器，应该把内部事件映射为稳定 wire protocol，而不是把任意内部对象直接 stringify。</p>\n<p>Interactive adapter 的复杂状态尤其容易越界。输入历史、光标位置、折叠区域属于 UI；steering/follow-up 队列属于 Stateful Agent；已经提交的 user message 属于 session。用户按下取消键时，adapter 只发出 abort 意图，Agent 决定何时进入 aborted 终态，工具负责清理其进程。把三种状态放进一个“大界面对象”，恢复 session 时就无法判断哪些应该重放。</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">type WirePayload =\n  | { type: &quot;text_delta&quot;; text: string }\n  | { type: &quot;tool_end&quot;; callId: string; isError: boolean }\n  | { type: &quot;result&quot;; status: &quot;ok&quot; | &quot;error&quot; | &quot;aborted&quot; };\n\ntype WireEvent = WirePayload &amp; { v: 1; seq: number };\n\nfunction createWireSequencer() {\n  let seq = 0;\n  return (payload: WirePayload): WireEvent =&gt;\n    ({ ...payload, v: 1, seq: ++seq });\n}</code></pre></figure><p>Mode 根据第 09 章已经定义的 <code>message_update</code>、<code>tool_execution_end</code> 与 <code>agent_end</code> 选择公开 payload，再交给 sequencer；wire 层不反向修改 Agent event。Model event、Agent event、SessionEntry 与 WireEvent 是四套协议，因为它们分别服务 provider 增量、核心状态、持久化事实和外部兼容性。强行复用一个 union 会让任何内部重构都成为产品破坏性变更。</p>\n<p>稳定黑盒输出应满足：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">stdout line 1: {&quot;v&quot;:1,&quot;seq&quot;:1,&quot;type&quot;:&quot;text_delta&quot;,&quot;text&quot;:&quot;done&quot;}\nstdout line 2: {&quot;v&quot;:1,&quot;seq&quot;:2,&quot;type&quot;:&quot;result&quot;,&quot;status&quot;:&quot;ok&quot;}\nstderr:         [diagnostic] using scripted model\nexit code:      0</code></pre></figure><p>每行 stdout 必须能独立 <code>JSON.parse</code>；日志、颜色和 stack trace 不得混入。课程增加 <code>v</code>、<code>seq</code> 和显式终态，是为了让自动化接口可演进。</p>\n<p>Wire trace 还要能被迟到的消费者重放。<code>seq</code> 在每次 run 从一开始，result 是唯一终态；消费者发现序号缺口时应报告不完整，而不是自行猜测 delta。重放得到的是对外时间线，不是把 wire event 再写成 SessionEntry：若要恢复会话，仍以 session store 为事实源。这样网络重试、UI 重绘和历史恢复不会互相夺取所有权。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 13.2 · 用黑盒测试锁住三条输出通道\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 13.2 · 用黑盒测试锁住三条输出通道</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 实现 text 与 JSON 输出 adapter，并保证 stdout、stderr、exit code 各司其职。</p>\n<p><strong>文件：</strong> <code>workshop/src/composition.ts</code>、<code>workshop/test/composition-eval.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>定义 <code>runPrint(runtime, io)</code> 与 <code>runJson(runtime, io)</code>，由注入的 writer 收集输出。</li>\n<li>Text 成功时 stdout 只有最终文本；error/aborted 时 stderr 有诊断且退出码非零。</li>\n<li>JSON 为每个对外事件分配严格递增 seq，并总以 result 终态结束。</li>\n<li>用子进程或等价 black-box fixture 验证每行可解析、stderr 不污染 stdout。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- composition</code></p>\n<p><strong>预期：</strong> 同一 Agent 错误在 text mode 形成非零退出码，在 JSON mode 形成 error result；两者的 session history 相同。</p>\n</div></section><h2 id=\"配置先归一化再进入对象图\"><a class=\"heading-anchor\" href=\"#配置先归一化再进入对象图\" aria-label=\"链接到 配置先归一化，再进入对象图\">#</a>配置先归一化，再进入对象图</h2><p>Composition root 不应到处读取 <code>process.env</code>。先把默认值、用户配置、项目配置、环境变量和 CLI 参数按公开 precedence 合成一份 <code>ResolvedConfig</code>，保留每个值的来源，再交给依赖工厂。Secret 只保留“已设置/来源”，诊断时永不回显值。</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">tokenBudget = 32000  source=project:.practice.json\nmodel       = fake   source=cli\napiKey      = [set]  source=env:MY_PI_API_KEY\nsessionDir  = .runs  source=default</code></pre></figure><p>可以增加只读 doctor 检查 Node、cwd、配置、认证、session 可写性和 shell，但不要自动修复。这里的 precedence、doctor、版本化 wire events 都是课程产品化增强，不应包装成当前上游的逐项等价实现。</p>\n<p>配置错误也要在启动阶段终止，而不是等到第一次模型调用。例如未知 mode 属于参数错误，不可写 sessionDir 属于存储诊断，缺少真实 provider key 属于认证诊断；使用 ScriptedModel 时则不该强制要求 key。Doctor 与启动共享同一套解析器，但只读取和报告，不偷偷创建目录或改配置，否则“检查”本身会改变待检查状态。</p>\n<aside class=\"learning-block learning-block--pi\" aria-label=\"Pi 8479bd84743e 的真实产品主路径\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>Pi 8479bd84743e 的真实产品主路径</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>当前 <code>main.ts</code> 解析 CLI 后，通过 <code>createAgentSessionServices</code>、<code>createAgentSessionFromServices</code> 和 <code>createAgentSessionRuntime</code> 组装 <code>AgentSession</code>；interactive、print/text、print/json 与 RPC 都消费这套 session/runtime。底层仍是 <code>Agent + coding-agent/AgentSession + coding-agent/SessionManager</code>。<code>packages/agent/src/harness/AgentHarness</code> 提供另一套更通用的 session、resources、compaction 与 hook 组合能力，但 coding-agent 产品入口尚未整体切换过去。上游 JSON mode 直接输出 session header 与 <code>AgentSessionEvent</code>；课程的版本化 wire envelope 是主动增强。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><section class=\"learning-block learning-block--failure\" aria-label=\"失败注入 · JSON adapter 自己创建 Agent\"><header><span class=\"block-kicker\">故障实验</span><h4>失败注入 · JSON adapter 自己创建 Agent</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>在 <code>runJson</code> 内偷偷 <code>new Agent(...)</code>，而不是使用传入 runtime。让原 runtime 先恢复一条已有 session，再运行 JSON。</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">expected transcript: [old user, old assistant, new user, new assistant]\nobserved transcript: [new user, new assistant]\nfirst divergence: mode constructs a second Agent/session\nviolated invariant: mode 只能适配 I/O，不能拥有核心状态</code></pre></figure><p>不要把旧消息复制进新 Agent 作为补丁；删除 mode 的构造权，回到唯一 <code>createRuntime</code>。再检查 identity spy 与 session store 的 append 记录。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><figure class=\"code-frame\"><figcaption><span>bash</span><button type=\"button\" data-copy-code aria-label=\"复制 bash 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-bash\">npm run workshop:test -- composition\nnpm run workshop:test -- agent\nnpm run workshop:test -- session</code></pre></figure><p>另外做一次结构检查：在 <code>agent-loop.ts</code>、<code>agent.ts</code> 中搜索 <code>interactive|print|json|stdout</code>，结果应为空。然后用同一 fixture 比较三种 mode 的 transcript hash。</p>\n<section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 13 · 产品入口共享一个核心\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 13 · 产品入口共享一个核心</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p><strong>完成状态：</strong> <code>createRuntime</code> 是唯一核心组装点；mode 只把输入送入 runtime，并把事件映射为人类或机器协议。</p>\n<p><strong>观察证据：</strong> 三种 mode 的 canonical transcript 相同；JSON stdout 每行可解析且 seq 递增；诊断只到 stderr。</p>\n<p><strong>恢复：</strong> 从本章开始前的提交恢复 <code>workshop/src/composition.ts</code> 和 composition 测试。核心能力仍完整，只失去统一的多入口组装。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"新增消费者，而核心 diff 为零\"><header><span class=\"block-kicker\">可选迁移</span><h4>新增消费者，而核心 diff 为零</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>不提供 mode 模板。自行增加一个收集事件并返回内存对象的 library adapter，供另一个 Node 程序调用。验收要求：<code>agent-loop.ts</code>、<code>agent.ts</code>、<code>session.ts</code> diff 为零；取消时返回 aborted 终态；同一 scripted scenario 的 transcript 与 print mode 相同。</p>\n</div></section><p>延迟检索题：一周后不看源码解释“为什么 SessionEntry 不能直接作为 JSON wire event”。至少从持久化兼容、敏感信息、增量粒度和内部重构四个方面作答。</p>\n<h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><ul>\n<li>Composition root 是依赖唯一相遇点，不是新的业务层或 service locator。</li>\n<li>三种 mode 共享 Agent、会话、context 与错误语义，只改变输入输出协议。</li>\n<li>内部事件、持久化 entry 和外部 wire event 必须分层。</li>\n<li>stdout、stderr、exit code 是独立产品契约，需要黑盒测试。</li>\n<li>当前 Pi 产品主路径仍基于 <code>AgentSessionRuntime/AgentSession/SessionManager</code>；通用 <code>AgentHarness</code> 是并存方向，而非已完成迁移。</li>\n</ul>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "composition-root-只组装不承载业务",
        "title": "Composition root 只组装，不承载业务",
        "level": 2
      },
      {
        "id": "mode-是协议适配器",
        "title": "Mode 是协议适配器",
        "level": 2
      },
      {
        "id": "配置先归一化再进入对象图",
        "title": "配置先归一化，再进入对象图",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "一个核心，多种产品入口 在唯一组装边界连接模型、工具、会话与资源，让交互、文本和 JSON 模式共享同一套 Agent 语义。 第四部 · 从核心到产品 composition root, runtime, mode adapter, wire event, stdout, stderr 你将得到什么 先建立全景 Composition root 只组装，不承载业务 Mode 是协议适配器 配置先归一化，再进入对象图 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/13-composition-root.md"
  },
  {
    "id": "14",
    "slug": "eval-capstone",
    "part": "product",
    "partTitle": "第四部 · 从核心到产品",
    "chapter": "14",
    "title": "用故障矩阵证明你造出了 Pi",
    "summary": "用确定性黑盒评测、跨层故障归因和无 starter 终局任务证明系统在失败时仍守住不变量。",
    "minutes": 180,
    "difficulty": "综合",
    "artifact": "packages/pi-course/src/eval.ts",
    "prerequisites": [
      "04",
      "07",
      "08",
      "10",
      "11",
      "12",
      "13"
    ],
    "terms": [
      "deterministic eval",
      "fault injection",
      "first divergence",
      "protocol violation",
      "capstone"
    ],
    "upstream": [
      "packages/agent/test/agent-loop.test.ts",
      "packages/coding-agent/test/agent-session-compaction.test.ts"
    ],
    "courseBranch": "course/build-your-own-pi",
    "commit": "63fde63882ba27f1c850a7543ff6a22801ee9411",
    "parentCommit": "1d6ce0795bf975b89af0db014234f93fcd34458e",
    "commitSubject": "prove the whole system with deterministic evals",
    "checkpointTest": "packages/pi-course/test/14-eval-capstone.test.ts",
    "html": "<h1 id=\"用故障矩阵证明你造出了-pi\"><a class=\"heading-anchor\" href=\"#用故障矩阵证明你造出了-pi\" aria-label=\"链接到 用故障矩阵证明你造出了 Pi\">#</a>用故障矩阵证明你造出了 Pi</h1><h2 id=\"你将得到什么\"><a class=\"heading-anchor\" href=\"#你将得到什么\" aria-label=\"链接到 你将得到什么\">#</a>你将得到什么</h2><p>进入本章时，你的 Pi 能完成一次 coding task，也能恢复、压缩、扩展并从多种入口运行。最后的缺口是证据：一次成功演示无法说明截断参数、工具异常、取消、损坏会话或恶意扩展出现时，系统仍知道发生了什么。</p>\n<p>本章不再增加 Agent 核心抽象，只增加一种复杂性：<strong>可重复的系统级评测与故障归因</strong>。你将修改 <code>workshop/src/eval.ts</code>，用 ScriptedModel、临时 workspace 和结构化 assertions 批量运行任务；随后从空白文件完成无 starter capstone。</p>\n<p>不能破坏的不变量是：</p>\n<blockquote>\n<p>每个失败必须归属到首次偏离契约的那一层；评测不能用一个 <code>agent_failed</code> 抹平 provider、protocol、tool、session、context 与 product 的差异。</p>\n</blockquote>\n<p>先保存第 13 章 checkpoint。恢复本章起点时，恢复 <code>workshop/src/eval.ts</code> 与 eval fixtures 即可；被评系统不应为了让评测通过而获得测试专用分支。</p>\n<section class=\"learning-block learning-block--rebuild\" aria-label=\"Checkpoint 14 · 先让一个失败能被归因\"><header><span class=\"block-kicker\">本章重建入口</span><h4>Checkpoint 14 · 先让一个失败能被归因</h4><small>先跨过从理解到动手的第一步</small></header><div class=\"block-body\"><p><strong>模式：</strong> 重建。从 13 的 target 开始，评测系统，不给被评系统加捷径。</p>\n<p><strong>起终点：</strong> parent 是本章开始时的起点快照；target 是聚焦测试通过的终点快照。</p>\n<p><strong>教学文件：</strong> <code>packages/pi-course/src/eval.ts</code></p>\n<p><strong>第一步：</strong> 先不看 target diff，实现单个 <code>runEvalCase</code>：建立隔离 fixture、运行 runtime、收集结构化 assertion 与首次失败层；单 case 可重复后再做 suite 和 capstone。</p>\n<p><strong>聚焦测试：</strong> <code>packages/pi-course/test/14-eval-capstone.test.ts</code></p>\n<p><strong>定位命令：</strong> <code>npm run checkpoint -w @pi/course -- 14</code></p>\n<p><strong>练习目录：</strong> <code>npm run practice -w @pi/course -- 14</code></p>\n<p><strong>聚焦运行：</strong> <code>npm run build -w @pi/course</code>，然后 <code>node --test packages/pi-course/dist/test/14-*.test.js</code></p>\n<p><strong>通过证据：</strong> 正常任务与 provider、protocol、tool、session、context、product 故障都能稳定归因；全量 51 个教学测试通过。</p>\n<p>第一次尝试禁止查看完整答案；capstone 允许查看接口与测试，不允许复制 <code>workshop/</code> 或 target 完整实现。</p>\n</div></section><h2 id=\"先建立全景\"><a class=\"heading-anchor\" href=\"#先建立全景\" aria-label=\"链接到 先建立全景\">#</a>先建立全景</h2><p>一个完整 eval case 有五段生命周期：</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">fresh temp workspace\n  → arrange fixture files + ScriptedModel\n  → createRuntime(与产品相同的 composition root)\n  → run prompt and collect transcript/events/files\n  → assert task outcome + protocol + resources + failure owner</code></pre></figure><p>评测至少分三类结果：</p>\n<ul>\n<li><strong>任务结果</strong>：目标文件是否正确、测试是否通过；</li>\n<li><strong>协议结果</strong>：call/result 是否配对、终态是否合法、history 是否追加；</li>\n<li><strong>基础设施结果</strong>：fixture、runner 或环境是否坏了。</li>\n</ul>\n<p>若 setup 自己失败，却被计为 Agent 不会修代码，指标没有意义。反过来，文件碰巧正确也不能掩盖孤立 toolResult 或被执行的截断参数。</p>\n<p>可重复不等于“把所有变量写死”。它要求把影响结果的变量显式记录：教材 commit、Node 与 lockfile、fixture 版本、ScriptedModel 脚本、初始文件和策略配置。报告不应记录临时绝对路径和真实时间；需要比较时使用 case-relative path、固定 id 和逻辑序号。这样一次回归才能回答“哪项输入变化导致哪项行为变化”。</p>\n<section class=\"learning-block learning-block--predict\" aria-label=\"五个已知 fixture 全绿就是掌握吗\"><header><span class=\"block-kicker\">先预测</span><h4>五个已知 fixture 全绿就是掌握吗</h4><small>先写判断，再看推理</small></header><div class=\"block-body prediction-question\"><p>同一组 ScriptedModel 响应和断言连续运行十次都通过，能否证明你已经理解 Agent 架构？</p>\n</div><details class=\"prediction-answer\"><summary>展开参考推理</summary><div><p>只能证明当前实现对已知轨迹可重复。掌握还需要在延迟后、不看答案，面对新 workspace 和未见故障仍能定位首次偏差并守住相同不变量。最终 capstone 因而不会提供实现 starter。</p>\n</div></details></section><h2 id=\"eval-case-是可执行规格\"><a class=\"heading-anchor\" href=\"#eval-case-是可执行规格\" aria-label=\"链接到 Eval case 是可执行规格\">#</a>Eval case 是可执行规格</h2><p>Runner 不应依赖真实 API。脚本模型给出确定事件，临时目录隔离文件副作用，时钟和 id 也由 fixture 固定：</p>\n<figure class=\"code-frame\"><figcaption><span>ts</span><button type=\"button\" data-copy-code aria-label=\"复制 ts 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-ts\">export interface EvalCase {\n  id: string;\n  prompt: string;\n  files: Record&lt;string, string&gt;;\n  script: ScriptStep[][];\n  assert(result: EvalResult): void;\n}\n\nexport interface EvalResult {\n  status: &quot;passed&quot; | &quot;task_failed&quot; | &quot;protocol_failed&quot; | &quot;infra_failed&quot;;\n  transcript: AgentMessage[];\n  events: AgentEvent[];\n  files: Record&lt;string, string&gt;;\n  metrics: { turns: number; toolCalls: number };\n  failure?: { layer: string; firstDivergence: string };\n}</code></pre></figure><p><code>runEvalCase</code> 每次创建新 temp root，调用第 13 章同一个 <code>createRuntime</code>，最后在 <code>finally</code> 释放子进程和目录。一个 case 失败不能阻止后续 case；runner 汇总结果后再决定总体 exit code。</p>\n<p>第一组任务应覆盖：纯文本回答、读取、精确编辑、执行测试、工具失败后恢复。断言写行为，而不是依赖随机 id、绝对路径、耗时或模型措辞。</p>\n<p>除了固定样例，再加入不改变语义的变形检查：交换两个独立工具的完成延迟，canonical transcript 仍按 call 顺序；改变 temp root，报告仍使用相对路径；把无关日志写入 stderr，JSON stdout 仍逐行可解析。此类关系比单个 golden 字符串更能发现所有权或顺序被意外耦合。</p>\n<section class=\"learning-block learning-block--mechanism\" aria-label=\"先锁协议，再看任务分数\"><header><span class=\"block-kicker\">关键机制</span><h4>先锁协议，再看任务分数</h4><small>把现象连接到不变量</small></header><div class=\"block-body\"><p>建议断言顺序为：事件终态 → 消息结构 → call/result 配对 → history 单调追加 → 文件结果。这样当最终文件不对时，你先知道基础协议是否可信，不会把多层错误压成一条红灯。</p>\n</div></section><section class=\"learning-block learning-block--lab\" aria-label=\"实践 14.1 · 建立确定性黑盒 Eval Harness\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 14.1 · 建立确定性黑盒 Eval Harness</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 批量运行五类离线任务，并输出结构化、可重复报告。</p>\n<p><strong>文件：</strong> <code>workshop/src/eval.ts</code>、<code>workshop/test/composition-eval.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>定义 <code>EvalCase/EvalResult</code>，每个 case 使用独立 temp workspace。</li>\n<li>通过 ScriptedModel 和 composition root 运行，不复制 Agent loop。</li>\n<li>分别断言终态、transcript、tool 配对、文件和 turns/toolCalls。</li>\n<li>隔离 case 异常并继续运行，最终按分类汇总。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- eval</code></p>\n<p><strong>预期：</strong> 相同 commit 重跑报告深相等；一个故意失败 case 不影响其余 case；报告不含临时绝对路径。</p>\n</div></section><h2 id=\"故障矩阵必须覆盖层间传播\"><a class=\"heading-anchor\" href=\"#故障矩阵必须覆盖层间传播\" aria-label=\"链接到 故障矩阵必须覆盖层间传播\">#</a>故障矩阵必须覆盖层间传播</h2><p>Happy path 只证明各层在合作。故障注入则检查边界能否阻止错误伪装成成功：</p>\n<table>\n<thead>\n<tr>\n<th>注入点</th>\n<th>预期归属</th>\n<th>必须观察到</th>\n<th>绝不能发生</th>\n</tr>\n</thead>\n<tbody><tr>\n<td>tool arguments 增量后 <code>stopReason=length</code></td>\n<td>model/protocol</td>\n<td>assistant 以 length 结束</td>\n<td>执行半截参数</td>\n</tr>\n<tr>\n<td>provider 发出 error 终态</td>\n<td>model</td>\n<td>最终 AssistantMessage 为 error</td>\n<td><code>result()</code> 随机 reject</td>\n</tr>\n<tr>\n<td>tool execute 抛异常</td>\n<td>tool</td>\n<td>同 callId 的 error toolResult</td>\n<td>孤立 tool call</td>\n</tr>\n<tr>\n<td>bash 收到 abort</td>\n<td>tool/agent</td>\n<td>aborted 终态并清理进程</td>\n<td>悬挂子进程</td>\n</tr>\n<tr>\n<td>JSONL 尾行损坏</td>\n<td>session</td>\n<td>明确恢复策略与诊断</td>\n<td>改写既有有效 entry</td>\n</tr>\n<tr>\n<td>summary schema 非法</td>\n<td>context</td>\n<td>压缩失败、history 不变</td>\n<td>无限压缩重试</td>\n</tr>\n<tr>\n<td>未信任 extension</td>\n<td>resources</td>\n<td>import 次数为零</td>\n<td>顶层代码执行</td>\n</tr>\n<tr>\n<td>JSON stdout 混入日志</td>\n<td>product</td>\n<td>wire parser 精确报错</td>\n<td>静默丢行</td>\n</tr>\n</tbody></table>\n<p>模型 error 与 aborted 都是流内终态；课程 EventStream 的 <code>result()</code> resolve 最终 AssistantMessage，而不是把它们变成外层随机 reject。<code>finish_reason=length</code> 则意味着 tool arguments 可能不完整，即使当前 JSON 恰好能 parse，也禁止执行。</p>\n<figure class=\"code-frame\"><figcaption><span>json</span><button type=\"button\" data-copy-code aria-label=\"复制 json 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-json\">{&quot;case&quot;:&quot;truncated-tool-call&quot;,&quot;status&quot;:&quot;passed&quot;,&quot;owner&quot;:&quot;model/protocol&quot;,&quot;toolCallsExecuted&quot;:0}\n{&quot;case&quot;:&quot;tool-throws&quot;,&quot;status&quot;:&quot;passed&quot;,&quot;owner&quot;:&quot;tool&quot;,&quot;pairedResult&quot;:true}\n{&quot;case&quot;:&quot;bad-summary&quot;,&quot;status&quot;:&quot;passed&quot;,&quot;owner&quot;:&quot;context&quot;,&quot;historyDelta&quot;:0,&quot;retryCount&quot;:1}</code></pre></figure><p>这些字段是证据，不是漂亮仪表盘。每条失败记录都要包含 observed、expected、first divergence、violated invariant 和 next smallest signal。</p>\n<p>总成功率也不能替代逐类分布。十个纯文本题全过、一个工具协议题失败，显示为 91% 会掩盖系统性风险。报告应先按能力和失败层分组，再展示 turns、tool calls 或估算成本；这些效率指标只有在任务与协议都正确之后才有解释价值。</p>\n<section class=\"learning-block learning-block--lab\" aria-label=\"实践 14.2 · 把八类故障变成矩阵\"><header><span class=\"block-kicker\">动手实现</span><h4>实践 14.2 · 把八类故障变成矩阵</h4><small>在真实文件中建立能力</small></header><div class=\"block-body\"><p><strong>目标：</strong> 证明故障被正确归属、持久化和隔离。</p>\n<p><strong>文件：</strong> <code>workshop/src/eval.ts</code>、<code>workshop/test/composition-eval.test.ts</code></p>\n<p><strong>动作：</strong></p>\n<ol>\n<li>为表中八项分别提供可控注入器，不使用真实网络和随机 timeout。</li>\n<li>捕获首次偏差层，而非只捕获最后抛出的异常。</li>\n<li>检查失败后的 session、活跃进程、extension import spy 和 stdout。</li>\n<li>生成结构化 matrix；若发现缺陷，只在拥有该不变量的层修复。</li>\n</ol>\n<p><strong>运行：</strong> <code>npm run workshop:test -- eval</code></p>\n<p><strong>预期：</strong> 八项都有唯一 owner；无悬挂进程、无孤立 result、无 history 删除、无未信任代码执行。</p>\n</div></section><aside class=\"learning-block learning-block--pi\" aria-label=\"与 Pi 8479bd84743e 的关系\"><header><span class=\"block-kicker\">Pi 源码对照</span><h4>与 Pi 8479bd84743e 的关系</h4><small>课程模型与生产实现</small></header><div class=\"block-body\"><p>当前上游在 <code>packages/agent/test/</code> 和 <code>packages/coding-agent/test/</code> 对 loop、Agent、AgentSession、compaction、extensions、print/RPC 等有大量专项测试；生产路径仍是 <code>Agent + AgentSession + SessionManager</code>，通用 <code>AgentHarness</code> 测试是并存方向。本章统一的 <code>workshop/src/eval.ts</code>、ScriptedModel 任务集、failure owner 和 capstone 评分是<strong>课程增强</strong>，不是声称上游存在同名 benchmark 或已经迁移到 AgentHarness。</p>\n</div></aside><h2 id=\"故意把它弄坏\"><a class=\"heading-anchor\" href=\"#故意把它弄坏\" aria-label=\"链接到 故意把它弄坏\">#</a>故意把它弄坏</h2><section class=\"learning-block learning-block--failure\" aria-label=\"失败注入 · catch-all 抹掉根因\"><header><span class=\"block-kicker\">故障实验</span><h4>失败注入 · catch-all 抹掉根因</h4><small>寻找第一次偏差</small></header><div class=\"block-body\"><p>在 runner 最外层把所有异常转换成 <code>{status:&quot;task_failed&quot;}</code>，再运行“fixture 路径不存在”和“tool 抛错”两个 case。</p>\n<figure class=\"code-frame\"><figcaption><span>text</span><button type=\"button\" data-copy-code aria-label=\"复制 text 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-text\">expected: infra_failed/setup 与 protocol-safe tool failure\nobserved: task_failed 与 task_failed\nfirst divergence: eval error classification\nviolated invariant: 失败必须归属到首次偏离契约的层\nnext signal: 记录 phase、event tail、cause chain，不先记录最终文件</code></pre></figure><p>修复分类器和 phase 边界，而不是根据错误字符串猜类别。随后确认正常 tool 异常仍通过配对的 error toolResult 表达，而不是泄漏为 runner 基础设施错误。</p>\n</div></section><h2 id=\"本章验收\"><a class=\"heading-anchor\" href=\"#本章验收\" aria-label=\"链接到 本章验收\">#</a>本章验收</h2><figure class=\"code-frame\"><figcaption><span>bash</span><button type=\"button\" data-copy-code aria-label=\"复制 bash 代码\">复制</button></figcaption><pre tabindex=\"0\"><code class=\"language-bash\">npm run workshop:test -- eval\nnpm run workshop:test\nnpm run typecheck</code></pre></figure><p>完整验收还包括：同一 suite 连跑两次结果一致；所有 temp workspace 隔离；失败 case 不阻塞后续；JSON 报告不含 secret、绝对路径和随机时间；被评核心没有 <code>if (process.env.EVAL)</code> 一类后门。</p>\n<section class=\"learning-block learning-block--checkpoint\" aria-label=\"Checkpoint 14 · 每条核心不变量都有反证实验\"><header><span class=\"block-kicker\">本章关卡</span><h4>Checkpoint 14 · 每条核心不变量都有反证实验</h4><small>以证据进入下一状态</small></header><div class=\"block-body\"><p><strong>完成状态：</strong> Eval Harness 能运行离线任务、分类故障、生成稳定矩阵，并在失败后清理资源。</p>\n<p><strong>观察证据：</strong> 八项故障各有 owner 与首次偏差；截断参数执行数为零；tool error 有配对 result；compaction 失败时 historyDelta 为零。</p>\n<p><strong>恢复：</strong> 从第 13 章 checkpoint 恢复 <code>workshop/src/eval.ts</code>、eval tests 和 fixtures。恢复后产品仍能运行，但失去系统级回归证据。</p>\n</div></section><h2 id=\"可选迁移练习\"><a class=\"heading-anchor\" href=\"#可选迁移练习\" aria-label=\"链接到 可选迁移练习\">#</a>可选迁移练习</h2><section class=\"learning-block learning-block--transfer\" aria-label=\"最终 Capstone · 无 starter 的跨层事故实验室\"><header><span class=\"block-kicker\">可选迁移</span><h4>最终 Capstone · 无 starter 的跨层事故实验室</h4><small>完成引导重建后再减少脚手架</small></header><div class=\"block-body\"><p>现在关闭本章正文，在空白的 <code>workshop/capstone/</code> 下自行创建 <code>incident.ts</code>、<code>incident.test.ts</code> 和 <code>report.md</code>；教材不提供 starter、函数签名或半成品。</p>\n<p><strong>任务：</strong> 用你已经完成的公共模块构造一次离线 coding run：用户要求修复临时项目中的错误函数；ScriptedModel 必须经历 read → edit → bash test → final text；运行中追加 session，触发一次 compaction，并从 JSON mode 输出可重放事件。</p>\n<p><strong>未知故障变体：</strong> 由测试顺序随机之外的显式参数选择，至少包含截断 tool call、tool 抛错、bash abort、损坏 JSONL 尾行、非法 summary、未信任 extension、stdout 污染。不得为每个故障复制一套 runtime。</p>\n<p><strong>交付证据：</strong></p>\n<ol>\n<li>clean case 的最终文件、测试、canonical transcript、history 与 wire trace；</li>\n<li>每项事故的 observed/expected、first divergence、violated invariant、最小修复层；</li>\n<li>证明 compaction 前事实仍可查询，extension 拒绝时 import 为零；</li>\n<li>一条你最初误判、随后用事件或 entry 证据纠正的根因。</li>\n</ol>\n<p><strong>硬性验收：</strong> 所有 case 完全离线；没有孤立 toolResult、执行半截参数、悬挂进程、删除 history、泄漏 secret 或污染 JSONL；<code>agent-loop.ts</code> 不出现 mode/eval 分支。最后请另一人只看报告任选一个事故，你应能沿 event → message → entry → wire trace 解释因果链。</p>\n</div></section><p>Capstone 通过仍不是终点。七天后换一个新 fixture，不看本书重建其中两项故障；能迁移不变量和诊断方法，才是“造出了自己的 Pi”。</p>\n<h2 id=\"小结\"><a class=\"heading-anchor\" href=\"#小结\" aria-label=\"链接到 小结\">#</a>小结</h2><ul>\n<li>确定性 eval 同时检查任务结果、协议完整性和基础设施，而不是只算成功率。</li>\n<li>ScriptedModel、临时 workspace 与同一个 composition root 让系统测试可重复。</li>\n<li>故障矩阵的核心产物是首次偏差和不变量归属。</li>\n<li>模型 error/aborted 是流内终态；length 截断的 tool arguments 永不执行。</li>\n<li>课程 Eval Harness 与无 starter capstone 是教学增强；最终证明来自跨层失败证据，而不是一次 happy-path 演示。</li>\n</ul>\n",
    "toc": [
      {
        "id": "你将得到什么",
        "title": "你将得到什么",
        "level": 2
      },
      {
        "id": "先建立全景",
        "title": "先建立全景",
        "level": 2
      },
      {
        "id": "eval-case-是可执行规格",
        "title": "Eval case 是可执行规格",
        "level": 2
      },
      {
        "id": "故障矩阵必须覆盖层间传播",
        "title": "故障矩阵必须覆盖层间传播",
        "level": 2
      },
      {
        "id": "故意把它弄坏",
        "title": "故意把它弄坏",
        "level": 2
      },
      {
        "id": "本章验收",
        "title": "本章验收",
        "level": 2
      },
      {
        "id": "可选迁移练习",
        "title": "可选迁移练习",
        "level": 2
      },
      {
        "id": "小结",
        "title": "小结",
        "level": 2
      }
    ],
    "searchText": "用故障矩阵证明你造出了 Pi 用确定性黑盒评测、跨层故障归因和无 starter 终局任务证明系统在失败时仍守住不变量。 第四部 · 从核心到产品 deterministic eval, fault injection, first divergence, protocol violation, capstone 你将得到什么 先建立全景 Eval case 是可执行规格 故障矩阵必须覆盖层间传播 故意把它弄坏 本章验收 可选迁移练习 小结",
    "sourceFile": "content/chapters/14-eval-capstone.md"
  }
];

export const chapterBySlug: Record<string, Chapter> = Object.fromEntries(
  chapters.map((chapter) => [chapter.slug, chapter]),
);

export const chapterById: Record<string, Chapter> = Object.fromEntries(
  chapters.map((chapter) => [chapter.id, chapter]),
);
