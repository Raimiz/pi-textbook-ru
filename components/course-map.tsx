"use client";

import { Check, Circle } from "lucide-react";
import Link from "next/link";
import type { CourseNavChapter } from "@/lib/course";
import type { CoursePart } from "@/lib/course-types";
import { useProgress } from "./progress-provider";

export function CourseMap({
  parts,
  chapters,
}: {
  parts: CoursePart[];
  chapters: CourseNavChapter[];
}) {
  const { completed } = useProgress();

  return (
    <div className="course-map">
      {parts.map((part) => {
        const items = chapters.filter((chapter) => chapter.part === part.id);
        const done = items.filter((chapter) => completed.has(chapter.id)).length;
        return (
          <section key={part.id} className={`course-part accent-${part.accent}`}>
            <div className="part-index">{part.number}</div>
            <div className="part-content">
              <header>
                <div>
                  <p>{part.shortTitle}</p>
                  <h2>{part.title.replace(/^.+?·\s*/, "")}</h2>
                  <span>{part.thesis}</span>
                </div>
                <small>
                  {done}/{items.length} 完成
                </small>
              </header>
              <ol>
                {items.map((chapter) => {
                  const isDone = completed.has(chapter.id);
                  return (
                    <li key={chapter.id}>
                      <Link href={`/learn/${chapter.slug}`}>
                        <span className={`chapter-state ${isDone ? "is-done" : ""}`}>
                          {isDone ? (
                            <Check aria-hidden="true" size={14} />
                          ) : (
                            <Circle aria-hidden="true" size={12} />
                          )}
                        </span>
                        <span className="chapter-number">{chapter.id}</span>
                        <span>
                          <strong>{chapter.title}</strong>
                          <small>{chapter.summary}</small>
                        </span>
                        <time>{chapter.minutes} min</time>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        );
      })}
    </div>
  );
}
