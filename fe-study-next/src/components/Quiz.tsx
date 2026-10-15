'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '@/data/curriculum';

interface QuizProps {
  questions: Question[];
  onComplete?: (score: number, total: number, wrongIds: number[]) => void;
  isReview?: boolean;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, isReview }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleSelect = (qId: number, choiceIdx: number, qArrayIdx: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: choiceIdx }));
    // Auto-advance focus to next unanswered question
    const nextUnanswered = questions.findIndex((q, i) => i > qArrayIdx && answers[q.id] === undefined);
    if (nextUnanswered !== -1) {
      setFocusedIdx(nextUnanswered);
      setTimeout(() => cardRefs.current[nextUnanswered]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  };

  useEffect(() => {
    if (submitted) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const keyMap: Record<string, number> = { a: 0, A: 0, '1': 0, b: 1, B: 1, '2': 1, c: 2, C: 2, '3': 2, d: 3, D: 3, '4': 3 };
      if (e.key in keyMap) {
        e.preventDefault();
        const q = questions[focusedIdx];
        if (!q || answers[q.id] !== undefined) return;
        const ci = keyMap[e.key];
        if (ci < q.choices.length) handleSelect(q.id, ci, focusedIdx);
      }
      if (e.key === 'ArrowDown' || e.key === 'Tab') {
        e.preventDefault();
        const next = Math.min(focusedIdx + 1, questions.length - 1);
        setFocusedIdx(next);
        cardRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(focusedIdx - 1, 0);
        setFocusedIdx(prev);
        cardRefs.current[prev]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [submitted, focusedIdx, answers, questions]);

  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  const score = submitted
    ? questions.filter(q => answers[q.id] === q.answer).length
    : 0;

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setFocusedIdx(0);
  };

  return (
    <div className={`quiz-section${isReview ? ' quiz-review-mode' : ''}`}>
      {!submitted && questions.length > 1 && (
        <p className="quiz-kb-hint">⌨️ <kbd>A</kbd><kbd>B</kbd><kbd>C</kbd><kbd>D</kbd> キーで選択 ／ <kbd>↑</kbd><kbd>↓</kbd> で移動</p>
      )}
      {questions.map((q, qi) => {
        const selected = answers[q.id];
        const isCorrect = submitted && selected === q.answer;
        const isWrong = submitted && selected !== undefined && selected !== q.answer;
        const isFocused = !submitted && qi === focusedIdx;

        return (
          <div
            key={q.id}
            ref={el => { cardRefs.current[qi] = el; }}
            className={`quiz-card${submitted ? (isCorrect ? ' correct' : isWrong ? ' wrong' : ' unanswered') : ''}${isFocused ? ' kb-focused' : ''}`}
            onClick={() => !submitted && setFocusedIdx(qi)}
          >
            <p className="quiz-question">
              <span className="quiz-num">Q{qi + 1}.</span>
              {q.question.split('\n').map((line, i) => (
                <span key={i}>{line}{i < q.question.split('\n').length - 1 && <br />}</span>
              ))}
            </p>
            <div className="quiz-choices">
              {q.choices.map((choice, ci) => {
                let cls = 'choice-btn';
                if (selected === ci) cls += ' selected';
                if (submitted && ci === q.answer) cls += ' correct-answer';
                if (submitted && selected === ci && ci !== q.answer) cls += ' wrong-answer';
                return (
                  <button key={ci} className={cls} onClick={() => handleSelect(q.id, ci, qi)}>
                    <span className="choice-label">{String.fromCharCode(65 + ci)}.</span>
                    {choice}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className={`explanation ${isCorrect ? 'exp-correct' : 'exp-wrong'}`}>
                <span className="exp-icon">{isCorrect ? '✓' : '✗'}</span>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      <div className="quiz-actions">
        {!submitted ? (
          <button
            className="btn-submit"
            disabled={!allAnswered}
            onClick={() => {
              const finalScore = questions.filter(q => answers[q.id] === q.answer).length;
              const wrongIds = questions.filter(q => answers[q.id] !== q.answer).map(q => q.id);
              setSubmitted(true);
              onComplete?.(finalScore, questions.length, wrongIds);
            }}
          >
            {allAnswered ? '回答を確認する' : `残り ${questions.length - Object.keys(answers).length} 問未回答`}
          </button>
        ) : (
          <div className="quiz-result">
            <div className="score-display">
              <span className="score-num">{score}</span>
              <span className="score-sep">/</span>
              <span className="score-total">{questions.length}</span>
              <span className="score-label">正解</span>
            </div>
            {score === questions.length && (
              <p className="perfect-msg">{isReview ? '全問正解！苦手問題を克服しました🎉' : '完璧です！次の章へ進みましょう。'}</p>
            )}
            <button className="btn-reset" onClick={reset}>もう一度挑戦する</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
