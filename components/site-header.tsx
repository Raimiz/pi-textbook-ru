"use client";

import { BookOpen, Route } from "lucide-react";
import Link from "next/link";
import { CourseSearch } from "./course-search";
import { useProgress } from "./progress-provider";

const TOTAL_CHAPTERS = 15;

export function SiteHeader() {
  const { completed } = useProgress();
  const progress = Math.round((completed.size / TOTAL_CHAPTERS) * 100);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="На главную страницу учебника">
        <span className="brand-mark" aria-hidden="true">
          π
        </span>
        <span>
          <strong>Практический Pi</strong>
          <small>Собираем Pi с нуля</small>
        </span>
      </Link>
      <nav aria-label="Навигация">
        <Link href="/map">
          <Route aria-hidden="true" size={16} />
          Программа
        </Link>
        <Link href="/about">
          <BookOpen aria-hidden="true" size={16} />
          Метод
        </Link>
        <Link href="/glossary">Термины</Link>
      </nav>
      <div className="header-actions">
        <CourseSearch />
        <span
          className="header-progress"
          title={`Пройдено ${completed.size}/${TOTAL_CHAPTERS} глав`}
        >
          <span style={{ width: `${progress}%` }} />
        </span>
      </div>
    </header>
  );
}
