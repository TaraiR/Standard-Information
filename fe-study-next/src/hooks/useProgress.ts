'use client';
import { useState, useEffect, useCallback } from 'react';

interface ProgressData {
  completedChapters: string[];
  quizScores: Record<string, { score: number; total: number }>;
  streakDays: number;
  lastStudyDate: string | null;
  studyDates: string[];
  chapterPositions: Record<string, number>;
}

const STORAGE_KEY = 'fe-study-progress';
const defaultProgress: ProgressData = {
  completedChapters: [],
  quizScores: {},
  streakDays: 0,
  lastStudyDate: null,
  studyDates: [],
  chapterPositions: {},
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function recordStudyDay(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const today = todayStr();
    const dates: string[] = data.studyDates ?? [];
    if (dates.includes(today)) return;
    const newDates = [...dates, today].slice(-180);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    const streak = data.lastStudyDate === today
      ? (data.streakDays ?? 0)
      : data.lastStudyDate === yStr
      ? (data.streakDays ?? 0) + 1
      : 1;
    data.studyDates = newDates;
    data.streakDays = streak;
    data.lastStudyDate = today;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function computeStreak(prev: ProgressData): Pick<ProgressData, 'streakDays' | 'lastStudyDate' | 'studyDates'> {
  const today = todayStr();
  const dates = prev.studyDates ?? [];
  const newDates = dates.includes(today) ? dates : [...dates, today].slice(-180);

  if (prev.lastStudyDate === today) {
    return { streakDays: prev.streakDays, lastStudyDate: today, studyDates: newDates };
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  if (prev.lastStudyDate === yStr) {
    return { streakDays: prev.streakDays + 1, lastStudyDate: today, studyDates: newDates };
  }
  return { streakDays: 1, lastStudyDate: today, studyDates: newDates };
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(defaultProgress);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ProgressData = { ...defaultProgress, ...JSON.parse(saved) };
        setProgress(parsed);
      }
    } catch {}
  }, []);

  const markChapterComplete = useCallback((id: string) => {
    setProgress(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev: ProgressData = raw ? { ...defaultProgress, ...JSON.parse(raw) } : defaultProgress;
      const streak = computeStreak(prev);
      const completed = prev.completedChapters.includes(id)
        ? prev.completedChapters
        : [...prev.completedChapters, id];
      const next = { ...prev, ...streak, completedChapters: completed };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const saveQuizScore = useCallback((id: string, score: number, total: number) => {
    setProgress(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev: ProgressData = raw ? { ...defaultProgress, ...JSON.parse(raw) } : defaultProgress;
      const existing = prev.quizScores[id];
      if (existing && existing.score >= score) return prev;
      const streak = computeStreak(prev);
      const next = { ...prev, ...streak, quizScores: { ...prev.quizScores, [id]: { score, total } } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const saveChapterPosition = useCallback((chapterId: string, sectionIndex: number) => {
    setProgress(prev => {
      if ((prev.chapterPositions ?? {})[chapterId] === sectionIndex) return prev;
      const next = { ...prev, chapterPositions: { ...(prev.chapterPositions ?? {}), [chapterId]: sectionIndex } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setProgress(defaultProgress);
  }, []);

  return {
    completedChapters: progress.completedChapters,
    quizScores: progress.quizScores,
    streakDays: progress.streakDays,
    studyDates: progress.studyDates ?? [],
    chapterPositions: progress.chapterPositions ?? {},
    markChapterComplete,
    saveQuizScore,
    saveChapterPosition,
    resetProgress,
    isComplete: (id: string) => progress.completedChapters.includes(id),
    getScore: (id: string) => progress.quizScores[id] ?? null,
  };
}
