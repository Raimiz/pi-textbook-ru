import {
  chapterById,
  chapterBySlug,
  chapters,
  courseParts,
} from "./generated-course";
import type { Chapter } from "./course-types";

export const UPSTREAM_COMMIT = "8479bd84743e8889f728acb21a62794102db0529";

export interface CourseNavChapter {
  id: string;
  slug: string;
  part: Chapter["part"];
  partTitle: string;
  title: string;
  summary: string;
  minutes: number;
}

export const courseNav: CourseNavChapter[] = chapters.map((chapter) => ({
  id: chapter.id,
  slug: chapter.slug,
  part: chapter.part,
  partTitle: chapter.partTitle,
  title: chapter.title,
  summary: chapter.summary,
  minutes: chapter.minutes,
}));

export function adjacentChapters(chapter: Chapter): {
  previous?: Chapter;
  next?: Chapter;
} {
  const index = chapters.findIndex((candidate) => candidate.id === chapter.id);
  return {
    previous: index > 0 ? chapters[index - 1] : undefined,
    next: index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : undefined,
  };
}

export {
  chapterById,
  chapterBySlug,
  chapters,
  courseParts,
};
