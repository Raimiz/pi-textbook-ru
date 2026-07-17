"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CourseNavChapter } from "@/lib/course";
import { useProgress } from "./progress-provider";

export function ContinueLearning({
  chapters,
}: {
  chapters: CourseNavChapter[];
}) {
  const { completed, hydrated, lastVisited } = useProgress();
  const last = chapters.find((chapter) => chapter.slug === lastVisited);
  const nextIncomplete = chapters.find((chapter) => !completed.has(chapter.id));
  const target = last ?? nextIncomplete ?? chapters[0];
  const label = last ? "继续上次阅读" : completed.size ? "继续下一章" : "开始序章";

  return (
    <Link className="primary-action" href={`/learn/${target.slug}`}>
      <span>
        <small>{hydrated ? label : "开始学习"}</small>
        <strong>
          {target.id} · {target.title}
        </strong>
      </span>
      <ArrowRight aria-hidden="true" size={20} />
    </Link>
  );
}
