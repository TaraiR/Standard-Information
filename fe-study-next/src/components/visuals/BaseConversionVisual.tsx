'use client';

import { useMemo, useState } from 'react';
import StepPlayer, { type VizVar } from './StepPlayer';
import { CellRow, Field, Segment, rowWidth, useValidated } from './ui';
import { bitString, intInRange, toBits } from './bits';
import { traceBase, WEIGHTS, WIDTH, type BaseMode, type BaseStep } from './traces/baseConversion';

const MODES = [
  { value: 'div', label: '10進→2進' },
  { value: 'weight', label: '2進→10進' },
  { value: 'hex', label: '2進→16進' },
  { value: 'oct', label: '2進→8進' },
] as const;

const TITLES: Record<BaseMode, string> = {
  div: '10進数 → 2進数（割り算法）',
  weight: '2進数 → 10進数（重み法）',
  hex: '2進数 → 16進数（4桁ずつ区切る）',
  oct: '2進数 → 8進数（3桁ずつ区切る）',
};

const SIZE = 52;
const GAP = 6;
const X0 = 24;
const Y0 = 36;
const W = rowWidth(WIDTH, SIZE, GAP);
const ROW_H = 38;
const parse = intInRange(0, 255);
const cellX = (i: number) => X0 + i * (SIZE + GAP);

export default function BaseConversionVisual() {
  const [mode, setMode] = useState<BaseMode>('div');
  const num = useValidated(45, String, parse);
  const steps = useMemo(() => traceBase(mode, num.value), [mode, num.value]);
  const last = steps[steps.length - 1];

  // 各マスの上に出す重み（16進・8進はグループ内の重み）
  const above = useMemo(() => {
    if (mode === 'div' || mode === 'weight') return WEIGHTS;
    const labels: number[] = Array(WIDTH).fill(0);
    for (const g of last.groups) for (let i = g.start; i <= g.end; i++) labels[i] = 2 ** (g.end - i);
    return labels;
  }, [mode, last]);

  const divRows = Math.max(1, last.rows.length);
  const height = mode === 'div' ? Y0 + SIZE + 46 + divRows * ROW_H : Y0 + SIZE + 96;

  const renderVisual = (s: BaseStep) => (
    <svg className="viz-svg" viewBox={`0 0 ${X0 * 2 + W} ${height}`} role="img"
      aria-label={`ビット列 ${s.bits.map(b => (b === null ? '?' : b)).join('')}`}>
      <CellRow x={X0} y={Y0} size={SIZE} gap={GAP} above={above}
        cells={s.bits.map((b, i) => ({ text: b === null ? '' : String(b), tone: s.tones[i] }))} />

      {s.groups.map(g => {
        const x1 = cellX(g.start);
        const x2 = cellX(g.end) + SIZE;
        const y = Y0 + SIZE + 12;
        const tone = g.active ? 'focus' : g.digit ? 'done' : 'plain';
        return (
          <g key={g.start}>
            <path className={`viz-line tone-${tone}`} d={`M${x1} ${y} v10 H${x2} v-10`} />
            <text className={`viz-text is-strong tone-${tone} viz-fade${g.digit ? '' : ' is-hidden'}`}
              x={(x1 + x2) / 2} y={y + 44} textAnchor="middle" style={{ fontSize: 32 }}>
              {g.digit ?? ''}
            </text>
          </g>
        );
      })}

      {mode === 'div' && s.rows.map((r, i) => {
        const y = Y0 + SIZE + 46 + i * ROW_H;
        const active = i === s.activeRow;
        return (
          <g key={i}>
            <text className={`viz-text${active ? ' is-strong tone-focus' : ''}`} x={X0} y={y}>
              {r.n} ÷ 2 = {r.q}
            </text>
            <text className={`viz-text is-strong tone-${active ? 'focus' : s.readUp ? 'done' : 'range'}`}
              x={X0 + W - 54} y={y} textAnchor="end">
              余り {r.r}
            </text>
          </g>
        );
      })}
      {mode === 'div' && s.readUp && s.rows.length > 1 && (
        <g className="viz-pointer tone-done">
          <line className="viz-line tone-done" x1={X0 + W - 22} x2={X0 + W - 22}
            y1={Y0 + SIZE + 46 + (s.rows.length - 1) * ROW_H} y2={Y0 + SIZE + 34} strokeWidth={3} />
          <polygon points={`${X0 + W - 22},${Y0 + SIZE + 22} ${X0 + W - 31},${Y0 + SIZE + 38} ${X0 + W - 13},${Y0 + SIZE + 38}`} />
        </g>
      )}
    </svg>
  );

  const getVars = (s: BaseStep): VizVar[] => {
    if (mode === 'div') {
      return [
        { label: '10進数', value: num.value, tone: 'range' },
        { label: '割った回数', value: s.rows.length },
        { label: '2進数', value: s.result ?? '—', tone: s.result ? 'done' : 'plain' },
      ];
    }
    if (mode === 'weight') {
      return [
        { label: '2進数', value: bitString(toBits(num.value, WIDTH)), tone: 'range' },
        { label: '合計', value: s.sum ?? 0, tone: s.result ? 'done' : 'focus' },
      ];
    }
    return [
      { label: '2進数', value: bitString(toBits(num.value, WIDTH), mode === 'hex' ? 4 : 3), tone: 'range' },
      { label: mode === 'hex' ? '16進数' : '8進数', value: s.result ?? '—', tone: s.result ? 'done' : 'plain' },
    ];
  };

  return (
    <StepPlayer
      key={`${mode}|${num.value}`}
      title={TITLES[mode]}
      steps={steps}
      settings={
        <>
          <Segment label="変換の種類" options={MODES} value={mode} onChange={setMode} />
          <Field label="数（0〜255）" text={num.text} invalid={num.invalid} onChange={num.onChange} width="4.5em" />
          <button type="button" className="viz-mini-btn" onClick={() => num.set(Math.floor(Math.random() * 256))}>ランダム</button>
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={getVars}
      legend={[
        { tone: 'focus', label: 'いま計算している桁' },
        { tone: 'range', label: '求めた桁' },
        { tone: 'done', label: '確定' },
      ]}
      footnote={
        mode === 'div' ? '最初に出た余りが一番下の位（2^0 の位）、最後に出た余りが一番上の位になります。'
          : mode === 'weight' ? 'マスの上の数字が各桁の重み（2の累乗）です。'
            : mode === 'hex' ? '16進数では 10〜15 を A〜F で表します。2進4桁 ↔ 16進1桁の対応は試験の頻出事項です。'
              : '8進数は2進3桁ずつに対応します。Unix のファイル権限（例: 755）などで使われます。'
      }
    />
  );
}
