"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  List,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import type { CourseNavChapter } from "@/lib/course";
import {
  courseBranchUrl,
  courseCommitUrl,
  courseComparisonUrl,
  courseFileUrl,
} from "@/lib/course-links";
import type {
  Chapter,
  CoursePart,
} from "@/lib/course-types";
import { useProgress } from "./progress-provider";

interface Adjacent {
  id: string;
  slug: string;
  title: string;
}

export function ReaderShell({
  chapter,
  chapters,
  parts,
  previous,
  next,
}: {
  chapter: Chapter;
  chapters: CourseNavChapter[];
  parts: CoursePart[];
  previous?: Adjacent;
  next?: Adjacent;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const {
    completed,
    bookmarks,
    setLastVisited,
    toggleBookmark,
    toggleCompleted,
  } = useProgress();
  const isCompleted = completed.has(chapter.id);
  const isBookmarked = bookmarks.has(chapter.id);

  useEffect(() => {
    setLastVisited(chapter.slug);
  }, [chapter.slug, setLastVisited]);

  useEffect(() => {
    const update = () => {
      const article = articleRef.current;
      if (!article) return;
      const start = article.offsetTop;
      const distance = Math.max(1, article.offsetHeight - window.innerHeight);
      const value = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      setReadingProgress(Math.round(value * 100));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [chapter.slug]);

  function handleArticleClick(event: React.MouseEvent<HTMLElement>) {
    const textButton = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-copy-text]",
    );
    if (textButton?.dataset.copyText) {
      const old = textButton.textContent;
      void navigator.clipboard.writeText(textButton.dataset.copyText).then(() => {
        textButton.textContent = "已复制";
        window.setTimeout(() => {
          textButton.textContent = old;
        }, 1400);
      });
      return;
    }
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-copy-code]",
    );
    if (!button) return;
    const code = button
      .closest(".code-frame")
      ?.querySelector("code")
      ?.textContent;
    if (!code) return;
    void navigator.clipboard.writeText(code).then(() => {
      const old = button.textContent;
      button.textContent = "已复制";
      button.dataset.copied = "true";
      window.setTimeout(() => {
        button.textContent = old;
        delete button.dataset.copied;
      }, 1400);
    });
  }

  return (
    <div
      className="reader"
      style={{ "--reading-progress": `${readingProgress}%` } as React.CSSProperties}
    >
      <div className="reading-progress" aria-hidden="true" />
      <button
        type="button"
        className="mobile-course-toggle"
        onClick={() => setMenuOpen(true)}
      >
        <Menu aria-hidden="true" size={18} />
        课程目录
      </button>

      <aside className={`course-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="mobile-drawer-heading">
          <strong>课程目录</strong>
          <button
            type="button"
            className="icon-button"
            onClick={() => setMenuOpen(false)}
            aria-label="关闭课程目录"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>
        <div className="sidebar-scroll">
          {parts.map((part) => {
            const items = chapters.filter((item) => item.part === part.id);
            return (
              <section key={part.id}>
                <h2>
                  <span>{part.number}</span>
                  {part.shortTitle}
                </h2>
                <ol>
                  {items.map((item) => {
                    const current = item.id === chapter.id;
                    const done = completed.has(item.id);
                    return (
                      <li key={item.id}>
                        <Link
                          href={`/learn/${item.slug}`}
                          aria-current={current ? "page" : undefined}
                          onClick={() => setMenuOpen(false)}
                        >
                          <span>{done ? <Check size={12} /> : item.id}</span>
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      </aside>
      {menuOpen ? (
        <button
          type="button"
          className="drawer-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-label="关闭目录"
        />
      ) : null}

      <main className="chapter-main">
        <article
          ref={articleRef}
          className="chapter-article"
          onClick={handleArticleClick}
        >
          <header className="chapter-hero">
            <div className="chapter-breadcrumb">
              <span>{chapter.partTitle}</span>
              <span>Checkpoint {chapter.id}</span>
            </div>
            <h1>{chapter.title}</h1>
            <p>{chapter.summary}</p>
            <dl className="chapter-facts">
              <div>
                <dt>预计</dt>
                <dd>{chapter.minutes} 分钟</dd>
              </div>
              <div>
                <dt>难度</dt>
                <dd>{chapter.difficulty}</dd>
              </div>
              <div>
                <dt>产物</dt>
                <dd><code>{chapter.artifact}</code></dd>
              </div>
              <div>
                <dt>前置</dt>
                <dd>
                  {chapter.prerequisites.length
                    ? chapter.prerequisites.map((id, index) => {
                        const prerequisite = chapters.find((item) => item.id === id);
                        return prerequisite ? (
                          <span key={id}>
                            {index ? "、" : ""}
                            <Link href={`/learn/${prerequisite.slug}`}>{id}</Link>
                          </span>
                        ) : null;
                      })
                    : "无"}
                </dd>
              </div>
            </dl>
            <div className="chapter-hero-actions">
              <button
                type="button"
                className={isBookmarked ? "is-active" : undefined}
                onClick={() => toggleBookmark(chapter.id)}
              >
                <Bookmark
                  aria-hidden="true"
                  size={16}
                  fill={isBookmarked ? "currentColor" : "none"}
                />
                {isBookmarked ? "已书签" : "加书签"}
              </button>
              <button
                type="button"
                className={isCompleted ? "is-complete" : undefined}
                onClick={() => toggleCompleted(chapter.id)}
              >
                <CheckCircle2 aria-hidden="true" size={16} />
                {isCompleted ? "本章已完成" : "标记完成"}
              </button>
            </div>
          </header>
          <section className="commit-companion" aria-label="本章真实教学提交">
            <header>
              <div>
                <small>
                  REAL CHECKPOINT ·{" "}
                  <a
                    href={courseBranchUrl(chapter.courseBranch)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {chapter.courseBranch}
                  </a>
                </small>
                <h2>从 parent 到本章，只增加这一层复杂性</h2>
              </div>
              <code>
                <a
                  href={courseCommitUrl(chapter.commit)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {chapter.commit.slice(0, 8)}
                </a>
              </code>
            </header>
            <p>
              这是 Pi 仓库中的真实可检出提交，不是页面占位符。parent
              是本章开始时的干净起点；target 是聚焦测试已经通过的终点。
              {chapter.id === "00"
                ? " 本章会导出 target 供观察，但不会附带另一份答案或 Git 历史。"
                : " 先定位两者，再从 parent 创建一个只有聚焦测试、没有 target 实现和 Git 历史的隔离练习目录。"}
            </p>
            <dl>
              <div>
                <dt>起点</dt>
                <dd><code>{chapter.parentCommit.slice(0, 8)}</code></dd>
              </div>
              <div>
                <dt>目标</dt>
                <dd><code>{chapter.commit.slice(0, 8)}</code></dd>
              </div>
              <div>
                <dt>聚焦测试</dt>
                <dd><code>{chapter.checkpointTest}</code></dd>
              </div>
            </dl>
            <nav className="commit-links" aria-label="本章 GitHub 源码链接">
              <a
                href={courseComparisonUrl(chapter.parentCommit, chapter.commit)}
                target="_blank"
                rel="noreferrer"
              >
                查看本章 diff
              </a>
              <a
                href={courseCommitUrl(chapter.commit)}
                target="_blank"
                rel="noreferrer"
              >
                查看目标 commit
              </a>
              <a
                href={courseFileUrl(chapter.commit, chapter.checkpointTest)}
                target="_blank"
                rel="noreferrer"
              >
                查看聚焦测试
              </a>
            </nav>
            <div className="commit-command-group">
              <small>1 · 定位本章</small>
              <div className="commit-command">
                <code>
                  npm run checkpoint -w @pi/course -- {chapter.id}
                </code>
                <button
                  type="button"
                  data-copy-text={`npm run checkpoint -w @pi/course -- ${chapter.id}`}
                >
                  复制
                </button>
              </div>
              <small>2 · 创建无答案练习目录</small>
              <div className="commit-command">
                <code>
                  npm run practice -w @pi/course -- {chapter.id}
                </code>
                <button
                  type="button"
                  data-copy-text={`npm run practice -w @pi/course -- ${chapter.id}`}
                >
                  复制
                </button>
              </div>
            </div>
            <blockquote>
              不要直接给完整答案。先问我对下一次测试输出的预测，然后一次只给一个动作；
              再阅读练习目录里的 LEARNING.md。我卡住时按“定位文件 → 指出签名 →
              伪代码 → 局部代码”逐级提示。
            </blockquote>
          </section>
          <div
            className="chapter-prose"
            dangerouslySetInnerHTML={{ __html: chapter.html }}
          />
          <section className="chapter-complete">
            <span className="completion-mark" aria-hidden="true">
              {isCompleted ? <Check size={24} /> : chapter.id}
            </span>
            <div>
              <small>Checkpoint {chapter.id}</small>
              <h2>{isCompleted ? "证据已记录" : "完成验收后再点亮本章"}</h2>
              <p>
                阅读进度只保存在这台设备；本章证据是聚焦测试、commit diff 与你对首次偏差的解释。
                迁移练习是熟练后的可选挑战。
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleCompleted(chapter.id)}
            >
              {isCompleted ? "取消完成" : "标记完成"}
            </button>
          </section>
          <nav className="chapter-pagination" aria-label="章节前后导航">
            {previous ? (
              <Link href={`/learn/${previous.slug}`}>
                <ArrowLeft aria-hidden="true" size={18} />
                <span>
                  <small>上一章 · {previous.id}</small>
                  <strong>{previous.title}</strong>
                </span>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/learn/${next.slug}`}>
                <span>
                  <small>下一章 · {next.id}</small>
                  <strong>{next.title}</strong>
                </span>
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            ) : (
              <Link href="/map">
                <span>
                  <small>你已走完全书</small>
                  <strong>回看能力地图</strong>
                </span>
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            )}
          </nav>
        </article>
      </main>

      <aside className="on-this-page">
        <h2>
          <List aria-hidden="true" size={15} />
          本章目录
        </h2>
        <ol>
          {chapter.toc
            .filter((item) => item.level === 2)
            .map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.title}</a>
              </li>
            ))}
        </ol>
        <div className="toc-meta">
          <span>阅读进度</span>
          <strong>{readingProgress}%</strong>
        </div>
      </aside>
    </div>
  );
}
