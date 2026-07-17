"use client";

import {
  ArrowRight,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { searchIndex } from "@/lib/generated-search";

function rank(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return searchIndex.slice(0, 8);
  return searchIndex
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const haystack = entry.searchText.toLowerCase();
      let score = 0;
      if (title === normalized) score += 100;
      if (title.startsWith(normalized)) score += 40;
      if (title.includes(normalized)) score += 20;
      if (entry.terms.some((term) => term.toLowerCase().includes(normalized))) {
        score += 12;
      }
      if (haystack.includes(normalized)) score += 5;
      return { entry, score };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 10)
    .map((result) => result.entry);
}

export function CourseSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = useMemo(() => rank(query), [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        className="search-trigger"
        onClick={() => setOpen(true)}
        aria-label="搜索整本教材"
      >
        <Search aria-hidden="true" size={17} />
        <span>搜索</span>
        <kbd>/</kbd>
      </button>
      {open ? (
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="搜索教材"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="search-panel">
            <div className="search-input-row">
              <Search aria-hidden="true" size={20} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActive((current) =>
                      Math.min(current + 1, results.length - 1),
                    );
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActive((current) => Math.max(current - 1, 0));
                  } else if (event.key === "Enter" && results[active]) {
                    navigate(results[active].href);
                  }
                }}
                placeholder="搜索概念、事件、API 或故障…"
                aria-label="搜索词"
                aria-controls="course-search-results"
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setOpen(false)}
                aria-label="关闭搜索"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <div id="course-search-results" className="search-results">
              <div className="search-results-label">
                {query ? `${results.length} 个相关位置` : "建议入口"}
              </div>
              {results.length ? (
                results.map((entry, index) => (
                  <button
                    type="button"
                    key={entry.id}
                    className={index === active ? "is-active" : undefined}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => navigate(entry.href)}
                  >
                    <span className="search-result-number">
                      {entry.chapterId}
                    </span>
                    <span>
                      <strong>{entry.title}</strong>
                      <small>
                        {entry.chapterTitle === entry.title
                          ? entry.partTitle
                          : entry.chapterTitle}
                      </small>
                    </span>
                    <ArrowRight aria-hidden="true" size={17} />
                  </button>
                ))
              ) : (
                <p className="search-empty">
                  没有匹配项。试试 “tool result”“compaction” 或 “abort”。
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
