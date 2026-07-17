import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <span>404 / BROKEN REFERENCE</span>
      <h1>这一页不在课程图中。</h1>
      <p>链接可能属于另一个教材版本，或者章节 ID 已写错。</p>
      <Link href="/">回到教材首页 →</Link>
    </main>
  );
}
