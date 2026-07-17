import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "术语表",
  description: "Pi 教材中反复使用的消息、状态、会话与扩展术语。",
};

const terms = [
  ["Agent Loop", "在模型生成、工具执行和下一轮决策之间维护顺序与终止条件的纯编排过程。"],
  ["Agent", "拥有运行状态、AbortController、steering/follow-up 队列并调用 loop 的有状态外壳。"],
  ["Canonical IR", "Provider 与 UI 都必须翻译到的内部消息表示；它是系统语义，不是聊天界面字符串。"],
  ["Content Block", "消息内容的结构化单元，例如 text 或 toolCall；保留纯字符串无法表达的语义。"],
  ["EventStream", "同时提供 AsyncIterable 过程事件和最终 result 的流容器。"],
  ["Stop Reason", "一次模型生成的唯一终态：stop、length、toolUse、error 或 aborted。"],
  ["Tool Call", "模型提出的结构化环境动作请求；arguments 只有在完成并验证后才可执行。"],
  ["Tool Result", "环境对某个 toolCallId 的结构化观察，无论成功或失败都必须出现。"],
  ["Transcript", "当前运行中按协议排列、将进入下一次模型请求的 canonical messages。"],
  ["Session Log", "持久化的 append-only entry 序列；通过 parentId 表达分支和恢复。"],
  ["Context", "某一次模型决策实际看见的消息投影，不等于完整历史。"],
  ["Compaction", "追加结构化摘要 entry，并据此重建较小 Context 的过程；不删除历史。"],
  ["Steering", "当前 run 尚未结束时，在下一模型决策前注入的用户方向。"],
  ["Follow-up", "当前任务自然停止后，使用同一 transcript 发起的后续用户请求。"],
  ["Skill", "按需读取的说明资源；被发现并不意味着执行代码。"],
  ["Extension", "可注册工具和 hook 的可执行模块，因此是明确的信任边界。"],
  ["Composition Root", "选择具体 model、tools、session、resources 与输出 mode 的唯一装配位置。"],
  ["Deterministic Eval", "用 ScriptedModel、固定 fixture 与故障矩阵得到可重复架构证据的评测。"],
];

export default function GlossaryPage() {
  return (
    <main className="reference-page">
      <header className="reference-hero compact">
        <p>GLOSSARY</p>
        <h1>先统一语言，<br />再讨论架构。</h1>
        <span>
          这些词描述不同的所有权和事实层。把它们混用，是许多 Agent 故障难以定位的根源。
        </span>
      </header>
      <dl className="glossary">
        {terms.map(([term, definition], index) => (
          <div key={term}>
            <dt>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {term}
            </dt>
            <dd>{definition}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
