'use client';
import React, { useState, useEffect } from 'react';
import { curriculum } from '@/data/curriculum';
import { recordStudyDay } from '@/hooks/useProgress';

const DAILY_KEY = 'fe-daily-quiz';
const DAILY_COUNT = 5;

function dateStr() {
  return new Date().toISOString().slice(0, 10);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function dateToSeed(ds: string): number {
  let h = 0;
  for (const c of ds) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return h;
}

interface DailyQuestion {
  id: number;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  chapterTitle: string;
  subject: 'A' | 'B';
}

function pickDailyQuestions(): DailyQuestion[] {
  const seed = dateToSeed(dateStr());
  const all: DailyQuestion[] = [];
  for (const ch of curriculum) {
    for (const sec of ch.sections) {
      for (const q of sec.questions) {
        all.push({ ...q, chapterTitle: ch.title, subject: ch.subject });
      }
    }
  }
  return seededShuffle(all, seed).slice(0, DAILY_COUNT);
}

export default function DailyQuiz() {
  const [questions] = useState<DailyQuestion[]>(() => pickDailyQuestions());
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExp, setShowExp] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [prevScore, setPrevScore] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DAILY_KEY) || 'null');
      if (saved?.date === dateStr()) {
        setAlreadyDone(true);
        setPrevScore(saved.score ?? 0);
      }
    } catch {}
  }, []);

  const q = questions[current];
  const chosen = answers[current];
  const isAnswered = chosen !== undefined;
  const isCorrect = chosen === q?.answer;

  const handleChoose = (ci: number) => {
    if (isAnswered) return;
    setAnswers(prev => ({ ...prev, [current]: ci }));
    setShowExp(true);
  };

  const handleNext = () => {
    setShowExp(false);
    if (current + 1 < DAILY_COUNT) {
      setCurrent(c => c + 1);
    } else {
      const score = questions.filter((_, i) => answers[i] === questions[i].answer).length
        + (answers[current] === q.answer ? 1 : 0);
      setCompleted(true);
      try {
        localStorage.setItem(DAILY_KEY, JSON.stringify({ date: dateStr(), score }));
      } catch {}
      recordStudyDay();
    }
  };

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}月${today.getDate()}日`;

  if (alreadyDone) {
    return (
      <div className="daily-quiz-wrap">
        <button className="daily-quiz-header done" onClick={() => setOpen(o => !o)}>
          <span className="daily-quiz-title">
            <span className="daily-date-badge">{dateLabel}</span>
            今日の5問
          </span>
          <span className="daily-done-badge">✓ {prevScore}/{DAILY_COUNT}点 完了</span>
        </button>
      </div>
    );
  }

  if (completed) {
    const finalScore = questions.filter((q, i) => answers[i] === q.answer).length;
    return (
      <div className="daily-quiz-wrap">
        <div className="daily-quiz-card">
          <div className="daily-quiz-header-row">
            <span className="daily-date-badge">{dateLabel}</span>
            <span className="daily-quiz-label">今日の5問</span>
          </div>
          <div className="daily-result">
            <span className="daily-result-score">{finalScore}<span className="daily-result-denom">/{DAILY_COUNT}</span></span>
            <p className="daily-result-msg">
              {finalScore === DAILY_COUNT ? '完璧！全問正解です🎉' : finalScore >= 3 ? 'いい調子！この調子で続けましょう' : '復習してまた挑戦しよう'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-quiz-wrap">
      <div className="daily-quiz-card">
        <div className="daily-quiz-header-row">
          <span className="daily-date-badge">{dateLabel}</span>
          <span className="daily-quiz-label">今日の5問</span>
          <span className="daily-progress-text">{current + 1} / {DAILY_COUNT}</span>
        </div>
        <div className="daily-progress-bar">
          <div className="daily-progress-fill" style={{ width: `${(current / DAILY_COUNT) * 100}%` }} />
        </div>

        <div className="daily-q-meta">
          <span className={`subject-tag subject-${q.subject.toLowerCase()}`}>科目{q.subject}</span>
          <span className="daily-chapter-name">{q.chapterTitle}</span>
        </div>
        <p className="daily-question">
          {q.question.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </p>

        <div className="daily-choices">
          {q.choices.map((ch, ci) => {
            let cls = 'daily-choice-btn';
            if (isAnswered) {
              if (ci === q.answer) cls += ' correct-answer';
              else if (ci === chosen) cls += ' wrong-answer';
            } else if (chosen === ci) {
              cls += ' selected';
            }
            return (
              <button key={ci} className={cls} onClick={() => handleChoose(ci)} disabled={isAnswered}>
                <span className="daily-choice-label">{String.fromCharCode(65 + ci)}.</span>
                {ch}
              </button>
            );
          })}
        </div>

        {showExp && (
          <div className={`daily-explanation${isCorrect ? ' correct' : ' wrong'}`}>
            <span className="daily-exp-icon">{isCorrect ? '✓ 正解' : '✗ 不正解'}</span>
            <p>{q.explanation}</p>
          </div>
        )}

        {isAnswered && (
          <button className="daily-next-btn" onClick={handleNext}>
            {current + 1 < DAILY_COUNT ? '次の問題 →' : '結果を見る →'}
          </button>
        )}
      </div>
    </div>
  );
}
