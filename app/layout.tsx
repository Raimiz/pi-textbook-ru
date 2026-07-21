import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ProgressProvider } from "@/components/progress-provider";
import { SiteHeader } from "@/components/site-header";
import {
  COURSE_REPOSITORY_URL,
  UPSTREAM_REPOSITORY_URL,
} from "@/lib/course-links";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const rawHost =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3002";
  const host = /^[A-Za-z0-9.:[\]-]+$/.test(rawHost)
    ? rawHost
    : "localhost:3002";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const socialImage = `${protocol}://${host}/og.png`;

  return {
    title: {
      default: "Практический Pi",
      template: "%s · Практический Pi",
    },
    description:
      "15 этапов: от офлайн-траектории до работающего Pi на TypeScript.",
    applicationName: "Практический Pi",
    authors: [{ name: "Pi Textbook Project" }],
    keywords: [
      "Agent",
      "Pi",
      "TypeScript",
      "LLM",
      "Tool Calling",
      "Учебник по агентам",
    ],
    openGraph: {
      title: "Практический Pi",
      description: "15 этапов, чтобы своими руками собрать работающий, восстанавливаемый и расширяемый Pi.",
      type: "website",
      locale: "ru_RU",
      images: [
        {
          url: socialImage,
          width: 1672,
          height: 941,
          alt: "Практический Pi",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Практический Pi",
      description: "15 этапов, чтобы своими руками собрать работающий Pi.",
      images: [socialImage],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f5f0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <ProgressProvider>
          <SiteHeader />
          {children}
          <footer className="site-footer">
            <div>
              <span className="brand-mark" aria-hidden="true">π</span>
              <p>
                Открытый русскоязычный учебник. Подход вдохновлён Dive into
                Deep Learning; содержание и код созданы независимо.
              </p>
            </div>
            <nav aria-label="Навигация в подвале">
              <Link href="/map">Программа</Link>
              <Link href="/about">Метод обучения</Link>
              <Link href="/glossary">Глоссарий</Link>
              <a
                href={COURSE_REPOSITORY_URL}
                target="_blank"
                rel="noreferrer"
              >
                Код курса
              </a>
              <a
                href={UPSTREAM_REPOSITORY_URL}
                target="_blank"
                rel="noreferrer"
              >
                Pi upstream
              </a>
            </nav>
          </footer>
        </ProgressProvider>
      </body>
    </html>
  );
}
