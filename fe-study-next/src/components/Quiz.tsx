'use client';
import React, { useState } from 'react';
import { Question } from '@/data/curriculum';

interface QuizProps {
  questions: Question[];
  onComplete?: (score: number, total: number, wrongIds: number[]) => void;
  isReview?: boolean;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, isReview }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qId: number, choiceIdx: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: choiceIdx }));
  };

  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  const score = submitted
    ? questions.filter(q => answers[q.id] === q.answer).length
    : 0;

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className={`quiz-section${isReview ? ' quiz-review-mode' : ''}`}>
      {questions.map((q, qi) => {
        const selected = answers[q.id];
        const isCorrect = submitted && selected === q.answer;
        const isWrong = submitted && selected !== undefined && selected !== q.answer;

        return (
          <div key={q.id} className={`quiz-card ${submitted ? (isCorrect ? 'correct' : isWrong ? 'wrong' : 'unanswered') : ''}`}>
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
                  <button key={ci} className={cls} onClick={() => handleSelect(q.id, ci)}>
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
