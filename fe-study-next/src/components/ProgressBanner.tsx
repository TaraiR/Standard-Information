'use client';
import React from 'react';
import Link from 'next/link';
import { curriculum } from '@/data/curriculum';
import { useProgress } from '@/hooks/useProgress';

export default function ProgressBanner() {
  const { completedChapters, streakDays } = useProgress();
  const total = curriculum.length;
  const done = completedChapters.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const nextChapter = curriculum.find(ch => !completedChapters.includes(ch.id));

  if (done === 0) return null;

  return (
    <div className="progress-banner">
      <div className="progress-banner-top">
        <div className="progress-banner-header">
          <span className="progress-label">学習進捗</span>
          <span className="progress-count">
            <strong>{done}</strong> / {total} 章 完了
            {done === total && <span className="progress-complete-badge">全章制覇！</span>}
          </span>
        </div>
        <div className="progress-banner-meta">
          {streakDays > 0 && (
            <span className="progress-streak">🔥 {streakDays}日連続</span>
          )}
          <Link href="/stats" className="progress-stats-link">📊 詳細を見る</Link>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      {nextChapter && done < total && (
        <div className="progress-continue">
          <span className="progress-continue-label">次の章：</span>
          <Link href={`/chapter/${nextChapter.id}`} className="progress-continue-link">
            <span className={`subject-tag subject-${nextChapter.subject.toLowerCase()}`}>科目{nextChapter.subject}</span>
            {nextChapter.title} →
          </Link>
        </div>
      )}
    </div>
  );
}
