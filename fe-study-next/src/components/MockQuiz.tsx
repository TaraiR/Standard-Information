'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { curriculum } from '@/data/curriculum';
import type { Question } from '@/data/curriculum';
import { recordStudyDay } from '@/hooks/useProgress';

interface MockQuestion {
  question: Question;
  chapterId: string;
  chapterTitle: string;
  subject: 'A' | 'B';
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const SECS_PER_10 = 10 * 60;

export default function MockQuiz() {
  const [count, setCount] = useState<10 | 20 | 30>(10);
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allQuestions = useMemo<MockQuestion[]>(() => {
    const all: MockQuestion[] = [];
    for (const ch of curriculum) {
      for (const sec of ch.sections) {
        for (const q of sec.questions) {
          all.push({ question: q, chapterId: ch.id, chapterTitle: ch.title, subject: ch.subject });
        }
      }
    }
    return all;
  }, []);

  const handleStart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const secs = (count / 10) * SECS_PER_10;
    setTimeLeft(secs);
    setQuestions(shuffle(allQuestions).slice(0, Math.min(count, allQuestions.length)));
    setAnswers({});
    setSubmitted(false);
    setShowReview(false);
    setStarted(true);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStarted(false);
    setAnswers({});
    setSubmitted(false);
    setTimeLeft(0);
  };

  useEffect(() => {
    if (!started || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setSubmitted(true);
          recordStudyDay();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, submitted]);

  const allAnswered = questions.length > 0 && questions.every((_, i) => answers[i] !== undefined);
  const score = submitted ? questions.filter((mq, i) => answers[i] === mq.question.answer).length : 0;

  if (!started) {
    return (
      <div className="mock-setup">
        <div className="mock-setup-icon">📝</div>
        <h2 className="mock-setup-title">総合模擬テスト</h2>
        <p className="mock-setup-desc">全章からランダムに問題を出題します。本番に近い形式で実力を試しましょう。</p>
        <div className="mock-count-selector">
          <p className="mock-count-label">出題数を選んでください</p>
          <div className="mock-count-options">
            {([10, 20, 30] as const).map(n => (
              <button
                key={n}
                className={`mock-count-btn${count === n ? ' selected' : ''}`}
                onClick={() => setCount(n)}
              >
                <span className="mock-count-num">{n}</span>
                <span className="mock-count-unit">問</span>
              </button>
            ))}
          </div>
        </div>
        <button className="btn-start-mock" onClick={handleStart}>テストを開始する →</button>
      </div>
    );
  }

  if (submitted) {
    const totalSecs = (questions.length / 10) * SECS_PER_10;
    const usedSecs = totalSecs - timeLeft;
    const usedMin = Math.floor(usedSecs / 60);
    const usedSec = usedSecs % 60;

    const chapterMap: Record<string, { title: string; subject: 'A' | 'B'; total: number; correct: number }> = {};
    questions.forEach((mq, i) => {
      if (!chapterMap[mq.chapterId]) {
        chapterMap[mq.chapterId] = { title: mq.chapterTitle, subject: mq.subject, total: 0, correct: 0 };
      }
      chapterMap[mq.chapterId].total++;
      if (answers[i] === mq.question.answer) chapterMap[mq.chapterId].correct++;
    });

    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 80;

    return (
      <div className="mock-result">
        <div className={`mock-score-circle${passed ? ' pass' : ' fail'}`}>
          <span className="mock-score-pct">{pct}%</span>
          <span className="mock-score-label">{score} / {questions.length} 正解</span>
        </div>
        <p className={`mock-verdict ${passed ? 'pass' : 'fail'}`}>
          {passed ? '合格圏内です！この調子で過去問に挑戦しましょう 🎉' : '苦手分野を重点的に復習しましょう。'}
        </p>
        {usedSecs > 0 && (
          <p className="mock-time-used">
            ⏱ 解答時間: {usedMin}分{String(usedSec).padStart(2, '0')}秒
          </p>
        )}

        <div className="mock-breakdown">
          <h3 className="mock-breakdown-title">章別の結果</h3>
          {Object.entries(chapterMap).map(([id, ch]) => {
            const chPct = ch.correct / ch.total;
            return (
              <Link key={id} href={`/chapter/${id}`} className="mock-breakdown-row">
                <span className={`subject-tag subject-${ch.subject.toLowerCase()}`}>科目{ch.subject}</span>
                <span className="mock-breakdown-chapter">{ch.title}</span>
                <span className={`mock-breakdown-score${chPct === 1 ? ' perfect' : chPct < 0.5 ? ' poor' : ''}`}>
                  {ch.correct}/{ch.total}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mock-result-actions">
          <button className="btn-retry-mock" onClick={handleStart}>もう一度（問題を変える）</button>
          <button className="btn-back-mock" onClick={handleReset}>設定に戻る</button>
        </div>

        <div className="mock-answer-review">
          <button
            className="mock-review-toggle"
            onClick={() => setShowReview(r => !r)}
          >
            {showReview ? '▲ 解答を閉じる' : `▼ 解答・解説を見る（${questions.length}問）`}
          </button>
          {showReview && (
            <div className="mock-review-list">
              {questions.map((mq, qi) => {
                const userAns = answers[qi];
                const correct = userAns === mq.question.answer;
                return (
                  <div key={qi} className={`mock-review-item${correct ? ' correct' : ' wrong'}`}>
                    <div className="mock-review-q-header">
                      <span className={`mock-review-badge${correct ? ' correct' : ' wrong'}`}>
                        {correct ? '○' : '✕'}
                      </span>
                      <span className="mock-review-qnum">Q{qi + 1}</span>
                      <Link
                        href={`/chapter/${mq.chapterId}`}
                        className={`subject-tag subject-${mq.subject.toLowerCase()} mock-chapter-tag`}
                        onClick={e => e.stopPropagation()}
                      >
                        {mq.chapterTitle}
                      </Link>
                    </div>
                    <p className="mock-review-question">
                      {mq.question.question.split('\n').map((line, i, arr) => (
                        <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                      ))}
                    </p>
                    <div className="mock-review-choices">
                      {mq.question.choices.map((ch, ci) => (
                        <div
                          key={ci}
                          className={`mock-review-choice${ci === mq.question.answer ? ' answer' : ''}${ci === userAns && !correct ? ' user-wrong' : ''}`}
                        >
                          <span className="choice-label">{String.fromCharCode(65 + ci)}.</span>
                          {ch}
                        </div>
                      ))}
                    </div>
                    {mq.question.explanation && (
                      <div className="mock-review-exp">
                        <span className="mock-review-exp-icon">💡</span>
                        {mq.question.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerWarning = timeLeft <= 60 && timeLeft > 0;

  return (
    <div className="mock-quiz">
      <div className="mock-progress-header">
        <span className="mock-progress-text">
          {questions.length}問中 <strong>{Object.keys(answers).length}問</strong> 回答済み
        </span>
        <span className={`mock-timer${timerWarning ? ' warning' : ''}`}>
          ⏱ {mins}:{String(secs).padStart(2, '0')}
        </span>
        <div className="mock-progress-bar">
          <div
            className="mock-progress-fill"
            style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {questions.map((mq, qi) => (
        <div key={qi} className="quiz-card">
          <div className="mock-q-header">
            <span className="quiz-num">Q{qi + 1}</span>
            <Link
              href={`/chapter/${mq.chapterId}`}
              className={`subject-tag subject-${mq.subject.toLowerCase()} mock-chapter-tag`}
              onClick={e => e.stopPropagation()}
            >
              {mq.chapterTitle}
            </Link>
          </div>
          <p className="quiz-question" style={{ marginTop: 8 }}>
            {mq.question.question.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>
          <div className="quiz-choices">
            {mq.question.choices.map((choice, ci) => {
              let cls = 'choice-btn';
              if (answers[qi] === ci) cls += ' selected';
              return (
                <button key={ci} className={cls} onClick={() => setAnswers(prev => ({ ...prev, [qi]: ci }))}>
                  <span className="choice-label">{String.fromCharCode(65 + ci)}.</span>
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="quiz-actions">
        <button
          className="btn-submit"
          disabled={!allAnswered}
          onClick={() => { setSubmitted(true); recordStudyDay(); }}
        >
          {allAnswered ? '回答を確認する' : `残り ${questions.length - Object.keys(answers).length} 問未回答`}
        </button>
      </div>
    </div>
  );
}
