'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment } from './ui';
import { STAGE_NAMES, STAGE_SETS, totalClocks, tracePipeline, type PipeMode, type PipeStep } from './traces/pipeline';

const MODES = [{ value: 'pipe', label: 'パイプライン' }, { value: 'seq', label: '逐次処理' }] as const;
const STAGES = [3, 4, 5].map(v => ({ value: v, label: `${v}段` }));
const COUNTS = [1, 2, 3, 4, 5, 6, 8].map(v => ({ value: v, label: `${v}命令` }));

export default function PipelineVisual() {
  const [mode, setMode] = useState<PipeMode>('pipe');
  const [m, setM] = useState(4);
  const [n, setN] = useState(4);
  const steps = useMemo(() => tracePipeline(mode, m, n), [mode, m, n]);
  const total = totalClocks(mode, m, n);

  const renderVisual = (s: PipeStep) => (
    <div className="viz-table-wrap">
      <table className="viz-grid" aria-label="クロックごとの各命令の処理段">
        <thead>
          <tr>
            <th />
            {Array.from({ length: total }, (_, t) => (
              <th key={t} className={t + 1 === s.clock && s.current.length ? 'is-now' : undefined}>{t + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {s.grid.map((row, i) => (
            <tr key={i}>
              <th>命令{i + 1}</th>
              {row.map((cell, t) => {
                const now = t + 1 === s.clock && s.current.length > 0;
                const complete = row.includes(STAGE_SETS[m][m - 1]); // 最後の段まで終わった命令
                const tone = cell ? (now ? 'tone-focus' : complete ? 'tone-done' : 'tone-range') : '';
                return (
                  <td key={t} className={`${tone}${now ? ' is-now' : ''}`.trim() || undefined}
                    title={cell ? STAGE_NAMES[cell] : undefined}>
                    {cell ?? ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <StepPlayer
      key={`${mode}|${m}|${n}`}
      title={`${mode === 'pipe' ? 'パイプライン' : '逐次処理'}（${m}段・${n}命令）`}
      steps={steps}
      settings={
        <>
          <Segment label="処理方式" options={MODES} value={mode} onChange={setMode} />
          <Segment label="段数" options={STAGES} value={m} onChange={setM} />
          <Segment label="命令数" options={COUNTS} value={n} onChange={setN} />
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={s => [
        { label: 'クロック', value: `${s.clock} / ${total}`, tone: 'range' },
        { label: '完了した命令', value: `${s.completed} / ${n}`, tone: s.completed === n ? 'done' : 'plain' },
        { label: mode === 'pipe' ? '総クロック m+(n−1)' : '総クロック m×n', value: total, tone: 'focus' },
      ]}
      legend={[
        { tone: 'focus', label: 'このクロックで処理中' },
        { tone: 'range', label: '処理済みの段' },
        { tone: 'done', label: '完了した命令' },
      ]}
      footnote={`段の記号: ${STAGE_SETS[m].map(s => `${s} = ${STAGE_NAMES[s]}`).join('、')}。実際のCPUでは、前の命令の結果を待つ「ハザード」でパイプラインが止まることもあります。`}
    />
  );
}
