import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReaderShell } from "@/components/reader-shell";
import {
  adjacentChapters,
  chapterBySlug,
  chapters,
  courseNav,
  courseParts,
} from "@/lib/course";

export function generateStaticParams() {
  return chapters.map((chapter) => ({ slug: chapter.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = chapterBySlug[slug];
  if (!chapter) return {};
  return {
    title: `${chapter.id} · ${chapter.title}`,
    description: chapter.summary,
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = chapterBySlug[slug];
  if (!chapter) notFound();
  const { previous, next } = adjacentChapters(chapter);

  return (
    <ReaderShell
      chapter={chapter}
      chapters={courseNav}
      parts={courseParts}
      previous={
        previous
          ? { id: previous.id, slug: previous.slug, title: previous.title }
          : undefined
      }
      next={
        next
          ? { id: next.id, slug: next.slug, title: next.title }
          : undefined
      }
    />
  );
}
