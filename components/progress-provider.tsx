"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "build-your-own-pi:progress:v1";

interface StoredProgress {
  version: 1;
  completed: string[];
  bookmarks: string[];
  lastVisited?: string;
}

interface ProgressContextValue {
  hydrated: boolean;
  completed: Set<string>;
  bookmarks: Set<string>;
  lastVisited?: string;
  setLastVisited(slug: string): void;
  toggleCompleted(chapterId: string): void;
  toggleBookmark(chapterId: string): void;
  resetProgress(): void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function readProgress(): StoredProgress {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return { version: 1, completed: [], bookmarks: [] };
    const parsed = JSON.parse(value) as Partial<StoredProgress>;
    if (parsed.version !== 1) {
      return { version: 1, completed: [], bookmarks: [] };
    }
    return {
      version: 1,
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      lastVisited:
        typeof parsed.lastVisited === "string" ? parsed.lastVisited : undefined,
    };
  } catch {
    return { version: 1, completed: [], bookmarks: [] };
  }
}

export function ProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState<StoredProgress>({
    version: 1,
    completed: [],
    bookmarks: [],
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    const syncFromStorage = () => {
      if (!active) return;
      setProgress(readProgress());
      setHydrated(true);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) syncFromStorage();
    };
    queueMicrotask(syncFromStorage);
    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [hydrated, progress]);

  const setLastVisited = useCallback((slug: string) => {
    setProgress((current) =>
      current.lastVisited === slug
        ? current
        : { ...current, lastVisited: slug },
    );
  }, []);

  const toggleCompleted = useCallback((chapterId: string) => {
    setProgress((current) => {
      const completed = new Set(current.completed);
      if (completed.has(chapterId)) completed.delete(chapterId);
      else completed.add(chapterId);
      return { ...current, completed: [...completed] };
    });
  }, []);

  const toggleBookmark = useCallback((chapterId: string) => {
    setProgress((current) => {
      const bookmarks = new Set(current.bookmarks);
      if (bookmarks.has(chapterId)) bookmarks.delete(chapterId);
      else bookmarks.add(chapterId);
      return { ...current, bookmarks: [...bookmarks] };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ version: 1, completed: [], bookmarks: [] });
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      hydrated,
      completed: new Set(progress.completed),
      bookmarks: new Set(progress.bookmarks),
      lastVisited: progress.lastVisited,
      setLastVisited,
      toggleCompleted,
      toggleBookmark,
      resetProgress,
    }),
    [
      hydrated,
      progress,
      resetProgress,
      setLastVisited,
      toggleBookmark,
      toggleCompleted,
    ],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress 必须在 ProgressProvider 内使用");
  return value;
}
