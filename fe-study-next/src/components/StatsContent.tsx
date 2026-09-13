'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { curriculum } from '@/data/curriculum';
import { useProgress } from '@/hooks/useProgress';
import { chapterMeta } from '@/data/chapterMeta';

export default function StatsContent() {
  const { completedChapters, quizScores, streakDays, studyDates, resetProgress } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  const exportCSV = () => {
    const BOM = '﻿';
    const rows: string[][] = [
      ['章ID', '章タイトル', '科目', 'セクション数', '難易度', '難易度ラベル', '完了', 'スコア', '合計問題数', '正答率(%)'],
    ];
    for (const ch of curriculum) {
      const score = quizScores[ch.id];
      const meta = chapterMeta[ch.id];
      rows.push([
        ch.id,
        ch.title,
        `科目${ch.subject}`,
        String(ch.sections.length),
        meta ? String(meta.difficulty) : '',
        meta ? meta.difficultyLabel : '',
        completedChapters.includes(ch.id) ? '○' : '×',
        score ? String(score.score) : '',
        score ? String(score.total) : '',
        score ? String(Math.round(score.score / score.total * 100)) : '',
      ]);
    }
    rows.push([]);
    rows.push(['連続学習日数', String(streakDays)]);
    rows.push(['学習記録日数', String(studyDates.length)]);
    rows.push(['最終学習日', studyDates[studyDates.length - 1] ?? '']);

    const csv = BOM + rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fe-study-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalChapters = curriculum.length;
  const completedCount = completedChapters.length;
  const overallPct = Math.round((completedCount / totalChapters) * 100);

  const scoreEntries = Object.values(quizScores);
  const avgScore = scoreEntries.length > 0
    ? Math.round(scoreEntries.reduce((sum, s) => sum + (s.score / s.total * 100), 0) / scoreEntries.length)
    : null;

  const weakChapters = curriculum.filter(ch => {
    const s = quizScores[ch.id];
    return s && (s.score / s.total) < 0.7;
  });

  const studyDateSet = new Set(studyDates);

  const calDays: { date: string; studied: boolean }[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    calDays.push({ date: ds, studied: studyDateSet.has(ds) });
  }

  const hasPerfect = Object.values(quizScores).some(s => s.score === s.total);

  // Score distribution
  const scoredChapters = curriculum.filter(ch => quizScores[ch.id]);
  const tierGood = scoredChapters.filter(ch => (quizScores[ch.id].score / quizScores[ch.id].total) >= 0.8).length;
  const tierOk   = scoredChapters.filter(ch => { const r = quizScores[ch.id].score / quizScores[ch.id].total; return r >= 0.6 && r < 0.8; }).length;
  const tierPoor = scoredChapters.filter(ch => (quizScores[ch.id].score / quizScores[ch.id].total) < 0.6).length;

  // Total Q stats
  const totalAttempted = scoreEntries.reduce((s, e) => s + e.total, 0);
  const totalCorrect   = scoreEntries.reduce((s, e) => s + e.score, 0);

  // Next recommended chapter (first incomplete or lowest score)
  const nextRecommended = (() => {
    const incomplete = curriculum.find(ch => !completedChapters.includes(ch.id));
    if (incomplete) return incomplete;
    return weakChapters[0] ?? null;
  })();

  const achievements = [
    { id: 'first',    icon: '🚀', label: 'スタート',    desc: '最初の章を完了',                          earned: completedCount >= 1 },
    { id: 'perfect',  icon: '💯', label: '満点合格',    desc: '章末問題で満点を獲得',                     earned: hasPerfect },
    { id: 'half',     icon: '📖', label: '折り返し地点', desc: `全章の半分以上を完了`,                     earned: completedCount >= Math.ceil(totalChapters / 2) },
    { id: 'all',      icon: '🏆', label: '全章制覇',    desc: `全${totalChapters}章を完了`,               earned: completedCount === totalChapters },
    { id: 'streak3',  icon: '🔥', label: '3日連続',     desc: '3日間連続で学習',                          earned: streakDays >= 3 },
    { id: 'streak7',  icon: '⚡', label: '7日連続',     desc: '7日間連続で学習',                          earned: streakDays >= 7 },
    { id: 'nofear',   icon: '💪', label: '弱点克服',    desc: '苦手章ゼロを達成',                         earned: completedCount > 0 && weakChapters.length === 0 },
    { id: 'q100',     icon: '📝', label: '100問突破',   desc: '合計100問以上に挑戦',                      earned: totalAttempted >= 100 },
  ];

  return (
    <div className="stats-content">
      <div className="stats-header">
        <h1 className="stats-title">📊 学習統計</h1>
        <p className="stats-subtitle">あなたの学習進捗と苦手分野を確認しましょう。</p>
      </div>

      {/* Overview cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <span className="stat-num">{completedCount}<span className="stat-denom">/{totalChapters}</span></span>
          <span className="stat-label">章完了</span>
          <div className="stat-mini-bar">
            <div className="stat-mini-fill" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <span className="stat-num">{avgScore !== null ? `${avgScore}` : '—'}<span className="stat-denom">{avgScore !== null ? '%' : ''}</span></span>
          <span className="stat-label">平均スコア</span>
          {avgScore !== null && (
            <span className={`stat-verdict ${avgScore >= 80 ? 'good' : avgScore >= 60 ? 'ok' : 'poor'}`}>
              {avgScore >= 80 ? '合格圏' : avgScore >= 60 ? 'もう少し' : '要復習'}
            </span>
          )}
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <span className="stat-num">{streakDays}<span className="stat-denom">日</span></span>
          <span className="stat-label">連続学習</span>
          <span className="stat-verdict good">{streakDays > 0 ? 'Keep going!' : '今日から始めよう'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⚠️</span>
          <span className="stat-num">{weakChapters.length}<span className="stat-denom">章</span></span>
          <span className="stat-label">要復習</span>
          <span className={`stat-verdict ${weakChapters.length === 0 ? 'good' : 'poor'}`}>
            {weakChapters.length === 0 ? '弱点なし！' : '70%未満'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✏️</span>
          <span className="stat-num">{totalCorrect}<span className="stat-denom">/{totalAttempted}</span></span>
          <span className="stat-label">総正解数</span>
          {totalAttempted > 0 && (
            <div className="stat-mini-bar">
              <div className="stat-mini-fill" style={{ width: `${Math.round(totalCorrect / totalAttempted * 100)}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Weak chapters alert */}
      {weakChapters.length > 0 && (
        <div className="stats-weak-alert">
          <span className="stats-weak-icon">⚠️</span>
          <div>
            <strong>重点復習が必要な章</strong>
            <div className="stats-weak-list">
              {weakChapters.map(ch => (
                <Link key={ch.id} href={`/chapter/${ch.id}`} className="stats-weak-chip">
                  <span className={`subject-tag subject-${ch.subject.toLowerCase()}`}>科目{ch.subject}</span>
                  {ch.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Score distribution */}
      {scoredChapters.length > 0 && (
        <div className="stats-dist-section">
          <h2 className="stats-subject-heading" style={{ marginBottom: 12 }}>📈 スコア分布</h2>
          <div className="stats-dist-bars">
            {[
              { label: '合格圏（80%以上）', count: tierGood, total: scoredChapters.length, cls: 'good' },
              { label: 'もう少し（60〜79%）',count: tierOk,   total: scoredChapters.length, cls: 'ok'   },
              { label: '要復習（60%未満）',  count: tierPoor, total: scoredChapters.length, cls: 'poor' },
            ].map(row => (
              <div key={row.cls} className="stats-dist-row">
                <span className="stats-dist-label">{row.label}</span>
                <div className="stats-dist-track">
                  <div
                    className={`stats-dist-fill ${row.cls}`}
                    style={{ width: row.total > 0 ? `${Math.round(row.count / row.total * 100)}%` : '0%' }}
                  />
                </div>
                <span className="stats-dist-count">{row.count}章</span>
              </div>
            ))}
          </div>
          <p className="stats-dist-note">挑戦済み {scoredChapters.length}章 / 全{totalChapters}章</p>
        </div>
      )}

      {/* Next recommended action */}
      {nextRecommended && (
        <div className="stats-next-action">
          <div className="stats-next-label">
            <span className="stats-next-icon">👉</span>
            <strong>次のおすすめ</strong>
          </div>
          <Link href={`/chapter/${nextRecommended.id}`} className="stats-next-chapter">
            <span className={`subject-tag subject-${nextRecommended.subject.toLowerCase()}`}>科目{nextRecommended.subject}</span>
            <span className="stats-next-title">{nextRecommended.title}</span>
            {quizScores[nextRecommended.id] && (
              <span className="stats-next-score poor">
                {Math.round(quizScores[nextRecommended.id].score / quizScores[nextRecommended.id].total * 100)}%
              </span>
            )}
            <span className="stats-next-arrow">→</span>
          </Link>
        </div>
      )}

      {/* Achievements */}
      <div className="stats-achievements">
        <h2 className="stats-subject-heading" style={{ marginBottom: 12 }}>🏅 実績</h2>
        <div className="achievement-grid">
          {achievements.map(a => (
            <div key={a.id} className={`achievement-card${a.earned ? ' earned' : ''}`}>
              <span className="achievement-icon">{a.icon}</span>
              <span className="achievement-label">{a.label}</span>
              <span className="achievement-desc">{a.desc}</span>
              {a.earned && <span className="achievement-check">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Study calendar */}
      <div className="stats-calendar-section">
        <h2 className="stats-subject-heading" style={{ marginBottom: 12 }}>📅 学習カレンダー（直近90日）</h2>
        <div className="stats-calendar">
          {calDays.map(d => (
            <div
              key={d.date}
              className={`cal-day${d.studied ? ' studied' : ''}`}
              title={d.date}
            />
          ))}
        </div>
        <p className="stats-calendar-legend">
          <span className="cal-legend-empty" />未学習
          <span className="cal-legend-done" />学習済み
        </p>
      </div>

      {/* Subject A */}
      {(['A', 'B'] as const).map(subject => (
        <div key={subject} className="stats-subject-section">
          <h2 className="stats-subject-heading">
            <span className={`subject-tag subject-${subject.toLowerCase()}`}>科目{subject}</span>
            {subject === 'A' ? 'テクノロジ・マネジメント・ストラテジ' : 'アルゴリズムとプログラミング'}
          </h2>
          <div className="stats-chapter-list">
            {curriculum.filter(ch => ch.subject === subject).map((ch, i) => {
              const score = quizScores[ch.id];
              const pct = score ? Math.round((score.score / score.total) * 100) : null;
              const done = completedChapters.includes(ch.id);
              const barColor = pct === null ? '' : pct >= 80 ? 'good' : pct >= 60 ? 'ok' : 'poor';

              return (
                <Link key={ch.id} href={`/chapter/${ch.id}`} className="stats-chapter-row">
                  <span className="stats-ch-num">{i + 1}</span>
                  <span className="stats-ch-title">{ch.title}</span>
                  <div className="stats-score-area">
                    {pct !== null ? (
                      <>
                        <div className="stats-score-bar">
                          <div className={`stats-score-fill ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`stats-score-text ${barColor}`}>{score!.score}/{score!.total}点</span>
                      </>
                    ) : (
                      <span className="stats-not-done">未挑戦</span>
                    )}
                  </div>
                  {done && <span className="stats-done-badge">✓</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <div className="stats-actions">
        <Link href="/quiz" className="btn-go-quiz">📝 模擬テストで腕試し →</Link>
        <button className="btn-export-csv" onClick={exportCSV}>📥 学習記録を CSV 出力</button>
        <Link href="/" className="btn-go-home">← トップへ戻る</Link>
      </div>

      <div className="stats-reset-zone">
        {!confirmReset ? (
          <button className="btn-reset-progress" onClick={() => setConfirmReset(true)}>
            進捗をリセット
          </button>
        ) : (
          <div className="stats-reset-confirm">
            <span className="stats-reset-msg">⚠️ 全ての学習記録が消去されます。本当によろしいですか？</span>
            <div className="stats-reset-actions">
              <button className="btn-reset-confirm" onClick={() => { resetProgress(); setConfirmReset(false); }}>
                リセットする
              </button>
              <button className="btn-reset-cancel" onClick={() => setConfirmReset(false)}>
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
