'use client';
import React from 'react';
import Link from 'next/link';
import { Chapter } from '@/data/curriculum';
import { useProgress } from '@/hooks/useProgress';

interface Props {
  chapters: Chapter[];
  subject: 'A' | 'B';
}

export default function ChapterGrid({ chapters, subject }: Props) {
  const { isComplete, getScore, chapterPositions } = useProgress();

  return (
    <div className="chapter-grid">
      {chapters.map((ch, i) => {
        const done = isComplete(ch.id);
        const score = getScore(ch.id);
        const totalQuestions = ch.sections.reduce((n, s) => n + s.questions.length, 0);
        const estMins = ch.sections.length * 3 + totalQuestions;
        const savedPos = (chapterPositions ?? {})[ch.id];
        const inProgress = !done && savedPos !== undefined && savedPos > 0;
        return (
          <Link
            key={ch.id}
            href={`/chapter/${ch.id}`}
            className={`chapter-card chapter-card-${subject.toLowerCase()} ${done ? 'chapter-card-done' : ''}`}
          >
            <div className="chapter-card-top-row">
              <div className="chapter-num">第{i + 1}章</div>
              {done && <span className="chapter-done-badge">✓ 完了</span>}
              {inProgress && <span className="chapter-inprogress-badge">▶ 続きから</span>}
            </div>
            <h3 className="chapter-card-title">{ch.title}</h3>
            <p className="chapter-card-desc">{ch.description}</p>
            <div className="chapter-card-footer">
              <span>{ch.sections.length} セクション</span>
              <span className="chapter-est-time">⏱ 約{estMins}分</span>
              {score ? (
                <span className={`chapter-score ${score.score === score.total ? 'chapter-score-perfect' : ''}`}>
                  {score.score}/{score.total} 点
                </span>
              ) : (
                <span className="arrow">→</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
