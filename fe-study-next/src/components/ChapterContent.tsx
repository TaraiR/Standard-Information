'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Chapter, Question } from '@/data/curriculum';
import Diagram from './Diagram';
import Quiz from './Quiz';
import { useProgress, recordStudyDay } from '@/hooks/useProgress';
import { pastExamGuides } from '@/data/pastExams';

interface Props {
  chapter: Chapter;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
}

export default function ChapterContent({ chapter, prevChapter, nextChapter }: Props) {
  const [activeSection, setActiveSection] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);
  const [reviewKey, setReviewKey] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [readSections, setReadSections] = useState<Set<number>>(new Set());
  const [justCompleted, setJustCompleted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [readPct, setReadPct] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const positionApplied = React.useRef<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { markChapterComplete, saveQuizScore, saveChapterPosition, chapterPositions, isComplete } = useProgress();

  const changeSection = (index: number) => {
    if (index > activeSection && activeSection < chapter.sections.length) {
      setReadSections(prev => new Set([...prev, activeSection]));
    }
    setActiveSection(index);
    try {
      const raw = localStorage.getItem('fe-study-progress');
      const data = raw ? JSON.parse(raw) : {};
      data.chapterPositions = { ...(data.chapterPositions || {}), [chapter.id]: index };
      localStorage.setItem('fe-study-progress', JSON.stringify(data));
    } catch {}
    recordStudyDay();
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    positionApplied.current = null;
    const sParam = searchParams.get('s');
    let startIdx = 0;
    if (sParam !== null) {
      const sIdx = parseInt(sParam, 10);
      if (!isNaN(sIdx) && sIdx >= 0 && sIdx < chapter.sections.length) startIdx = sIdx;
    }
    setActiveSection(startIdx);
    setSidebarOpen(false);
    setReviewQuestions([]);
    setReviewOpen(false);
    setReadSections(new Set());
    setJustCompleted(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    recordStudyDay();
  }, [chapter.id]);

  useEffect(() => {
    if (searchParams.get('s') !== null) return;
    if (positionApplied.current === chapter.id) return;
    const saved = chapterPositions[chapter.id];
    if (saved !== undefined && saved > 0 && saved <= chapter.sections.length) {
      positionApplied.current = chapter.id;
      setActiveSection(saved);
    }
  }, [chapterPositions, chapter.id, chapter.sections.length]);

  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      if (cancelled) return;
      const body = document.querySelector('.section-body');
      if (!body) return;
      body.querySelectorAll('pre').forEach(pre => {
        if (pre.querySelector('.copy-code-btn')) return;
        const btn = document.createElement('button');
        btn.className = 'copy-code-btn';
        btn.textContent = 'コピー';
        btn.addEventListener('click', () => {
          const code = pre.querySelector('code');
          navigator.clipboard.writeText(code ? code.innerText : pre.innerText).then(() => {
            btn.textContent = '✓ コピー済み';
            btn.classList.add('copied');
            setTimeout(() => { btn.textContent = 'コピー'; btn.classList.remove('copied'); }, 1500);
          });
        });
        pre.style.position = 'relative';
        pre.appendChild(btn);
      });
    }, 50);
    return () => { cancelled = true; clearTimeout(id); };
  }, [activeSection]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (!q) return;
    const id = setTimeout(() => {
      const body = document.querySelector('.section-body');
      if (!body) return;
      if (body.querySelector('.search-highlight')) return;
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) textNodes.push(node as Text);
      textNodes.forEach(tn => {
        if (!tn.nodeValue || !re.test(tn.nodeValue)) return;
        re.lastIndex = 0;
        const span = document.createElement('span');
        span.innerHTML = tn.nodeValue.replace(re, m => `<mark class="search-highlight">${m}</mark>`);
        tn.parentNode?.replaceChild(span, tn);
      });
      const first = body.querySelector('.search-highlight');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    return () => clearTimeout(id);
  }, [activeSection, searchParams]);


  useEffect(() => {
    setReadPct(0);
    const onScroll = () => {
      const body = document.querySelector('.section-body') as HTMLElement | null;
      if (!body) return;
      const rect = body.getBoundingClientRect();
      const total = rect.height;
      if (total <= 0) return;
      const visible = window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const pct = Math.min(100, Math.round((scrolled / (total - visible + 120)) * 100));
      const clamped = isNaN(pct) ? 0 : pct;
      setReadPct(clamped);
      if (clamped >= 90 && activeSection < chapter.sections.length) {
        setReadSections(prev => new Set([...prev, activeSection]));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeSection]);

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchTarget: EventTarget | null = null;

    const hasHorizontalScroll = (el: HTMLElement | null): boolean => {
      let node = el;
      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        const ox = style.overflowX;
        if ((ox === 'auto' || ox === 'scroll') && node.scrollWidth > node.clientWidth) {
          return true;
        }
        node = node.parentElement;
      }
      return false;
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchTarget = e.target;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Too short, or more vertical than horizontal → ignore
      if (Math.abs(dx) < 60) return;
      if (Math.abs(dy) > Math.abs(dx) * 0.8) return;
      // Started on a horizontally scrollable element → ignore
      if (hasHorizontalScroll(touchTarget as HTMLElement | null)) return;
      const total = chapter.sections.length;
      if (dx < 0 && activeSection < total) changeSection(activeSection + 1);
      if (dx > 0 && activeSection > 0) changeSection(activeSection - 1);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [activeSection, chapter.sections.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLButtonElement) return;
      const total = chapter.sections.length;
      if (e.key === 'ArrowRight' && activeSection < total) changeSection(activeSection + 1);
      if (e.key === 'ArrowLeft' && activeSection > 0) changeSection(activeSection - 1);
      if (e.key === '?') setShowHelp(h => !h);
      if (e.key === 'f' || e.key === 'F') setFocusMode(f => !f);
      if (e.key === 'Escape') { setShowHelp(false); setFocusMode(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeSection, chapter.sections.length]);

  const section = chapter.sections[activeSection];
  const allQuestions = chapter.sections.flatMap(s => s.questions);

  return (
    <div className={`chapter-page${focusMode ? ' focus-mode' : ''}`}>
      {focusMode && (
        <button className="focus-mode-exit" onClick={() => setFocusMode(false)}>
          ✕ フォーカスモード終了
        </button>
      )}
      {showHelp && (
        <div className="shortcut-overlay" onClick={() => setShowHelp(false)}>
          <div className="shortcut-modal" onClick={e => e.stopPropagation()}>
            <div className="shortcut-modal-header">
              <span className="shortcut-modal-title">⌨️ キーボードショートカット</span>
              <button className="shortcut-close" onClick={() => setShowHelp(false)}>✕</button>
            </div>
            <table className="shortcut-table">
              <tbody>
                <tr><td><kbd>→</kbd></td><td>次のセクションへ</td></tr>
                <tr><td><kbd>←</kbd></td><td>前のセクションへ</td></tr>
                <tr><td><kbd>F</kbd></td><td>フォーカスモード切替</td></tr>
                <tr><td><kbd>?</kbd></td><td>このヘルプを表示/閉じる</td></tr>
                <tr><td><kbd>Esc</kbd></td><td>閉じる</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      <aside className="chapter-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-subject-row">
            <span className={`subject-tag ${chapter.subject === 'A' ? 'subject-a' : 'subject-b'}`}>
              科目{chapter.subject}
            </span>
            {isComplete(chapter.id) && (
              <span className="sidebar-complete-badge">✓ 完了</span>
            )}
          </div>
          <h1 className="sidebar-title">{chapter.title}</h1>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen
              ? '▲ 目次を閉じる'
              : `▼ ${activeSection < chapter.sections.length ? chapter.sections[activeSection].title : '章末確認問題'}`}
          </button>
        </div>
        <button className="shortcut-hint-btn" onClick={() => setShowHelp(true)} title="キーボードショートカット（?）">?</button>
        <button className="focus-mode-btn" onClick={() => setFocusMode(f => !f)} title="フォーカスモード（F）">⛶</button>
        <nav className={`section-nav${sidebarOpen ? '' : ' sidebar-nav-collapsed'}`}>
          {chapter.sections.map((sec, i) => (
            <button
              key={sec.id}
              className={`section-nav-btn ${activeSection === i ? 'active' : ''} ${readSections.has(i) && activeSection !== i ? 'sec-read' : ''}`}
              onClick={() => changeSection(i)}
            >
              <span className="sec-num">{readSections.has(i) && activeSection !== i ? '✓' : i + 1}</span>
              {sec.title}
            </button>
          ))}
          <button
            className={`section-nav-btn ${activeSection === chapter.sections.length ? 'active' : ''}`}
            onClick={() => changeSection(chapter.sections.length)}
          >
            <span className="sec-num">✓</span>
            章末確認問題
          </button>
        </nav>
      </aside>

      <main className="chapter-main">
        <div className="breadcrumb">
          <Link href="/">トップ</Link>
          <span> / </span>
          <span>{chapter.title}</span>
          {activeSection < chapter.sections.length && (
            <><span> / </span><span>{section.title}</span></>
          )}
        </div>
        <div className="chapter-disclaimer-bar">
          本サイトは非公式の学習支援サイトです。内容に誤りを含む可能性があります。
          <Link href="/disclaimer" className="chapter-disclaimer-link">詳細</Link>
        </div>

        {activeSection < chapter.sections.length ? (
          <div className="section-content" key={activeSection}>
            <div className="section-read-bar" aria-hidden="true">
              <div className="section-read-fill" style={{ width: `${readPct}%` }} />
            </div>
            <h2 className="section-title">{section.title}</h2>
            <div className="section-body" dangerouslySetInnerHTML={{ __html: section.content }} />
            {section.diagram && (
              <div className="diagram-wrapper">
                <Diagram type={section.diagram} />
              </div>
            )}
            {section.questions.length > 0 && (
              <div className="section-quiz">
                <h3 className="mini-quiz-title">このセクションの確認問題</h3>
                <Quiz key={section.id} questions={section.questions} />
              </div>
            )}
            <div className="section-nav-buttons">
              {activeSection > 0 && (
                <button className="nav-btn prev" onClick={() => changeSection(activeSection - 1)}>
                  ← {chapter.sections[activeSection - 1].title}
                </button>
              )}
              <button className="nav-btn next" onClick={() => changeSection(activeSection + 1)}>
                {activeSection < chapter.sections.length - 1
                  ? `次へ: ${chapter.sections[activeSection + 1].title} →`
                  : '章末確認問題へ →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="section-content" key="chapter-end-view">
            <h2 className="section-title">章末確認問題：{chapter.title}</h2>
            <p className="chapter-quiz-desc">この章で学んだ内容を確認しましょう。全 {allQuestions.length} 問です。</p>

            {justCompleted && (
              <>
                <div className="confetti-burst" aria-hidden="true">
                  {[...Array(18)].map((_, i) => (
                    <span key={i} className="confetti-piece" style={{
                      left: `${5 + (i * 5.5) % 90}%`,
                      animationDelay: `${(i * 0.07).toFixed(2)}s`,
                      background: ['#2da3d9','#282867','#48bb78','#f6ad55','#f56565','#63b3ed'][i % 6],
                    }} />
                  ))}
                </div>
                <div className="chapter-complete-banner">
                  <span className="complete-banner-icon">🎉</span>
                  <div className="complete-banner-text">
                    <strong>「{chapter.title}」を完了しました！</strong>
                    <span>学習進捗が更新されました。このまま次の章へ進みましょう。</span>
                  </div>
                </div>
              </>
            )}

            <Quiz
              key="chapter-end"
              questions={allQuestions}
              onComplete={(score, total, wrongIds) => {
                const wasComplete = isComplete(chapter.id);
                saveQuizScore(chapter.id, score, total);
                markChapterComplete(chapter.id);
                if (!wasComplete) setJustCompleted(true);
                const wrong = allQuestions.filter(q => wrongIds.includes(q.id));
                setReviewQuestions(wrong);
                setReviewOpen(false);
              }}
            />

            {reviewQuestions.length > 0 && (
              <div className="review-section">
                <div className="review-section-header">
                  <div className="review-section-info">
                    <span className="review-icon">🔁</span>
                    <span className="review-label">間違えた問題の復習</span>
                    <span className="review-count">{reviewQuestions.length}問</span>
                  </div>
                  <button
                    className="btn-review-toggle"
                    onClick={() => {
                      setReviewOpen(o => !o);
                      setReviewKey(k => k + 1);
                    }}
                  >
                    {reviewOpen ? '復習を閉じる ▲' : '復習する →'}
                  </button>
                </div>
                {reviewOpen && (
                  <Quiz
                    key={`review-${reviewKey}`}
                    questions={reviewQuestions}
                    isReview
                  />
                )}
              </div>
            )}

            {pastExamGuides[chapter.id] && (() => {
              const guide = pastExamGuides[chapter.id];
              return (
                <div className="past-exam-guide">
                  <p className="past-exam-guide-title">📋 この章の試験ガイド</p>
                  <div className="past-exam-meta">
                    <span className="past-exam-badge category">{guide.category}</span>
                    <span className="past-exam-badge count">{guide.feSection} ｜ {guide.approxCount}</span>
                  </div>
                  <div className="past-exam-topics">
                    <p className="past-exam-topics-label">よく出るテーマ</p>
                    <ul className="past-exam-topic-list">
                      {guide.topics.map((t, i) => (
                        <li key={i} className="past-exam-topic-item">
                          <span className="past-exam-topic-dot" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="past-exam-tip">
                    <span className="past-exam-tip-icon">💡</span>
                    <p>{guide.tip}</p>
                  </div>
                </div>
              );
            })()}

            <div className="kakomon-section">
              <p className="kakomon-section-label">📝 過去問で実力確認</p>
              <div className="kakomon-links">
                <a href="https://www.fe-siken.com/fekakomon.php" target="_blank" rel="noopener noreferrer" className="kakomon-link kakomon-link-primary">
                  <span className="kakomon-link-icon">🏋️</span>
                  <div className="kakomon-link-text">
                    <strong>過去問道場</strong>
                    <span>分野別・年度別に演習（fe-siken.com）</span>
                  </div>
                  <span className="kakomon-arrow">↗</span>
                </a>
                <a href="https://www.ipa.go.jp/shiken/mondai-kaiotu/" target="_blank" rel="noopener noreferrer" className="kakomon-link kakomon-link-secondary">
                  <span className="kakomon-link-icon">📄</span>
                  <div className="kakomon-link-text">
                    <strong>IPA 公式過去問</strong>
                    <span>PDF・解答・解説（ipa.go.jp）</span>
                  </div>
                  <span className="kakomon-arrow">↗</span>
                </a>
              </div>
            </div>

            <div className="chapter-nav">
              {prevChapter && (
                <button className="nav-btn prev" onClick={() => router.push(`/chapter/${prevChapter.id}`)}>
                  ← 前の章: {prevChapter.title}
                </button>
              )}
              {nextChapter && (
                <button className="nav-btn next" onClick={() => router.push(`/chapter/${nextChapter.id}`)}>
                  次の章: {nextChapter.title} →
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
