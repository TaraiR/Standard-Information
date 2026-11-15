'use client';

/**
 * ステップ再生型のビジュアル教材の共通部品。
 * 各教材は「アルゴリズムを実際に実行して得たステップ列」を渡し、
 * 描画・説明文・変数表示・擬似コードのハイライトだけを担当する。
 *
 * 操作: 次へ / 戻る / リセット / 自動再生（速度3段階）
 * キーボード: → 次へ、← 戻る、Space 再生/停止、Home 最初へ（教材にフォーカスがあるとき）
 */
import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';

export type VizTone = 'range' | 'focus' | 'done' | 'muted' | 'plain';

export interface VizVar {
  label: string;
  value: ReactNode;
  tone?: VizTone;
}

interface StepPlayerProps<S> {
  title: string;
  steps: S[];
  renderVisual: (step: S, index: number) => ReactNode;
  getMessage: (step: S, index: number) => ReactNode;
  getVars?: (step: S) => VizVar[];
  code?: { lines: string[]; getActive: (step: S) => number[] };
  /** 探索対象の変更など、教材ごとの設定 UI */
  settings?: ReactNode;
  legend?: { tone: VizTone; label: string }[];
  footnote?: ReactNode;
}

const SPEEDS = [
  { label: 'ゆっくり', ms: 2400 },
  { label: 'ふつう', ms: 1500 },
  { label: 'はやい', ms: 800 },
] as const;

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d={d} fill="currentColor" />
  </svg>
);
const ICONS = {
  reset: 'M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z',
  prev: 'M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z',
  next: 'M8.6 16.6 10 18l6-6-6-6-1.4 1.4 4.6 4.6z',
  play: 'M8 5v14l11-7z',
  pause: 'M6 5h4v14H6zm8 0h4v14h-4z',
};

export default function StepPlayer<S>({
  title, steps, renderVisual, getMessage, getVars, code, settings, legend, footnote,
}: StepPlayerProps<S>) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const last = steps.length - 1;
  const current = Math.min(index, last);
  const step = steps[current];

  // 自動再生: 一定間隔で1ステップ進め、最後で止まる
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      if (current + 1 >= last) setPlaying(false);
      setIndex(Math.min(current + 1, last));
    }, SPEEDS[speed].ms);
    return () => window.clearTimeout(id);
  }, [playing, current, last, speed]);

  const go = (i: number) => { setPlaying(false); setIndex(Math.max(0, Math.min(last, i))); };
  const togglePlay = () => {
    if (playing) { setPlaying(false); return; }
    if (current >= last) setIndex(0);
    setPlaying(true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === ' ' && tag !== 'BUTTON') { e.preventDefault(); togglePlay(); }
  };

  const vars = getVars?.(step) ?? [];
  const active = new Set(code?.getActive(step) ?? []);

  return (
    <section className="viz" aria-label={title} tabIndex={-1} onKeyDown={onKeyDown}>
      <header className="viz-head">
        <h4 className="viz-title">{title}</h4>
        <span className="viz-count" aria-label={`全${steps.length}ステップ中 ${current + 1}`}>
          {current + 1} / {steps.length}
        </span>
      </header>

      {settings && <div className="viz-settings">{settings}</div>}

      <div className="viz-stage">{renderVisual(step, current)}</div>

      {legend && (
        <ul className="viz-legend">
          {legend.map(l => (
            <li key={l.label}><span className={`viz-swatch tone-${l.tone}`} />{l.label}</li>
          ))}
        </ul>
      )}

      {vars.length > 0 && (
        <dl className="viz-vars">
          {vars.map(v => (
            <div key={v.label} className={`viz-var tone-${v.tone ?? 'plain'}`}>
              <dt>{v.label}</dt>
              <dd>{v.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="viz-message" aria-live="polite">{getMessage(step, current)}</p>

      <div className="viz-progress" aria-hidden="true">
        <div className="viz-progress-bar" style={{ width: `${last > 0 ? (current / last) * 100 : 100}%` }} />
      </div>

      <div className="viz-controls">
        <button type="button" className="viz-btn" onClick={() => go(0)} disabled={current === 0 && !playing}>
          <Icon d={ICONS.reset} /><span>リセット</span>
        </button>
        <button type="button" className="viz-btn" onClick={() => go(current - 1)} disabled={current === 0}>
          <Icon d={ICONS.prev} /><span>戻る</span>
        </button>
        <button type="button" className="viz-btn viz-btn-play" onClick={togglePlay} aria-pressed={playing}>
          <Icon d={playing ? ICONS.pause : ICONS.play} /><span>{playing ? '停止' : '自動再生'}</span>
        </button>
        <button type="button" className="viz-btn viz-btn-primary" onClick={() => go(current + 1)} disabled={current === last}>
          <span>次へ</span><Icon d={ICONS.next} />
        </button>
      </div>

      <div className="viz-speed" role="group" aria-label="自動再生の速度">
        <span>速度</span>
        {SPEEDS.map((s, i) => (
          <button key={s.label} type="button" className={`viz-chip${i === speed ? ' is-on' : ''}`}
            aria-pressed={i === speed} onClick={() => setSpeed(i)}>
            {s.label}
          </button>
        ))}
      </div>

      {code && (
        <details className="viz-code-wrap" open>
          <summary>擬似コード（実行中の行をハイライト）</summary>
          <pre className="viz-code">
            {code.lines.map((line, i) => (
              <span key={i} className={active.has(i) ? 'is-active' : undefined}>{line}{'\n'}</span>
            ))}
          </pre>
        </details>
      )}

      {footnote && <p className="viz-footnote">{footnote}</p>}
    </section>
  );
}
