'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Field, Segment, useValidated } from './ui';
import { REPLACE_LABEL, simulatePaging, type PageStep, type Replace } from './traces/paging';

const ALGOS = (['fifo', 'lru', 'opt'] as Replace[]).map(v => ({ value: v, label: REPLACE_LABEL[v].replace(/（.*/, '') }));
const FRAMES = [2, 3, 4].map(v => ({ value: v, label: `${v}枠` }));
const parseRefs = (s: string): number[] | null => {
  const parts = s.trim().split(/[\s,、]+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 20 || parts.some(p => !/^\d$/.test(p))) return null;
  return parts.map(Number);
};

export default function PagingVisual() {
  const [algo, setAlgo] = useState<Replace>('lru');
  const [frames, setFrames] = useState(3);
  const refs = useValidated([1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], r => r.join(' '), parseRefs);
  const steps = useMemo(() => simulatePaging(algo, refs.value, frames), [algo, refs.value, frames]);
  const last = steps.length - 1;

  const renderVisual = (s: PageStep, idx: number) => (
    <div className="viz-table-wrap">
      <table className="viz-grid" aria-label="参照ごとの物理メモリの中身">
        <thead>
          <tr>
            <th>参照</th>
            {refs.value.map((p, i) => <th key={i} className={i === s.index - 1 && idx < last ? 'is-now' : undefined}>{p}</th>)}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: frames }, (_, f) => (
            <tr key={f}>
              <th>枠{f + 1}</th>
              {refs.value.map((_, i) => {
                const st = steps[i + 1];
                const shown = i < s.index;
                const val = shown ? st.frames[f] : null;
                const hit = shown && st.slot === f;
                return (
                  <td key={i} className={!shown || val === null ? undefined : hit ? (st.fault ? (i === s.index - 1 && idx < last ? 'tone-focus is-now' : 'tone-focus') : 'tone-done') : 'tone-range'}>
                    {val ?? ''}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <th>結果</th>
            {refs.value.map((_, i) => <td key={i} className={i < s.index ? (s.history[i] === 'F' ? 'tone-focus' : 'tone-done') : undefined}>{i < s.index ? (s.history[i] === 'F' ? 'F' : '○') : ''}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <StepPlayer
      key={`${algo}|${frames}|${refs.value.join(',')}`}
      title={`ページ置換: ${REPLACE_LABEL[algo]}`}
      steps={steps}
      settings={
        <>
          <Segment label="アルゴリズム" options={ALGOS} value={algo} onChange={setAlgo} />
          <Segment label="物理メモリの枠" options={FRAMES} value={frames} onChange={setFrames} />
          <Field label="参照するページ" text={refs.text} invalid={refs.invalid} onChange={refs.onChange} inputMode="text" width="12em" hint="0〜9 を空白区切りで20個まで" />
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={s => [
        { label: 'ページフォルト', value: s.faults, tone: 'focus' },
        { label: '追い出したページ', value: s.evicted ?? '—', tone: s.evicted !== null ? 'focus' : 'plain' },
      ]}
      legend={[{ tone: 'focus', label: 'ページフォルト（F）で読み込んだ' }, { tone: 'done', label: 'ヒット（○）' }]}
      footnote="この参照列（Belady の例）では、FIFO は枠を3つから4つに増やすとページフォルトが9回から10回に増えます（Belady の異常）。"
    />
  );
}
