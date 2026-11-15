'use client';

import { useMemo, useState } from 'react';
import StepPlayer, { type VizVar } from './StepPlayer';
import { CellRow, Field, Segment, useValidated } from './ui';
import { bitString, intInRange, toBits } from './bits';
import { traceMake, traceRead, type ComplementMode, type ComplementStep } from './traces/complement';

const MODES = [
  { value: 'make', label: '負の数を作る' },
  { value: 'read', label: 'ビット列を読む' },
] as const;

const SIZE = 50;
const GAP = 6;
const CAPTION = 120;
const ROW_H = 88;
const parse = intInRange(-128, 127);

export default function ComplementVisual() {
  const [mode, setMode] = useState<ComplementMode>('make');
  const num = useValidated(-5, String, parse);
  const steps = useMemo(() => (mode === 'make' ? traceMake(num.value) : traceRead(num.value)), [mode, num.value]);
  const maxRows = Math.max(...steps.map(s => s.rows.length), 1);
  const width = CAPTION + 9 * (SIZE + GAP) + 16;
  const height = 30 + maxRows * ROW_H;

  const renderVisual = (s: ComplementStep) => (
    <svg className="viz-svg" viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={s.rows.map(r => `${r.label}: ${r.bits.join('')}`).join('、')}>
      {s.rows.map((row, ri) => {
        // 8桁の行は右詰めにして、9桁（あふれ桁つき）の行と位をそろえる
        const offset = 9 - row.bits.length;
        const x = CAPTION + offset * (SIZE + GAP);
        const y = 34 + ri * ROW_H;
        return (
          <g key={`${ri}-${row.label}`}>
            {row.carries && row.carries.map((c, i) => (
              <text key={i} className="viz-text is-strong tone-focus" x={x + i * (SIZE + GAP) + SIZE / 2} y={y - 8}
                textAnchor="middle" style={{ fontSize: 18 }}>
                {c ? '1' : ''}
              </text>
            ))}
            <CellRow x={x} y={y} size={SIZE} gap={GAP} caption={row.label}
              cells={row.bits.map((b, i) => ({ text: String(b), tone: row.tones[i], hidden: b === '' }))} />
          </g>
        );
      })}
      {s.rows.length === 0 && (
        <text className="viz-text" x={width / 2} y={height / 2} textAnchor="middle">
          {mode === 'make' ? `${num.value} → 2の補数` : `${bitString(toBits(num.value, 8))} → 10進数`}
        </text>
      )}
    </svg>
  );

  const getVars = (s: ComplementStep): VizVar[] => [
    { label: '10進数', value: num.value, tone: 'range' },
    { label: '8ビット表現', value: bitString(toBits(num.value, 8)) },
    { label: 'この段階の値', value: s.value ?? '—', tone: s.value === null ? 'plain' : 'done' },
  ];

  return (
    <StepPlayer
      key={`${mode}|${num.value}`}
      title={mode === 'make' ? '2の補数で負の数を表す（8ビット）' : '2の補数のビット列を10進数に読む（8ビット）'}
      steps={steps}
      settings={
        <>
          <Segment label="学ぶ内容" options={MODES} value={mode} onChange={setMode} />
          <Field label="10進数（−128〜127）" text={num.text} invalid={num.invalid} onChange={num.onChange}
            inputMode="text" width="4.5em" />
          <div className="viz-presets">
            {[-5, -1, -128, 0, 100].map(v => (
              <button key={v} type="button" className="viz-mini-btn" onClick={() => num.set(v)}>{v}</button>
            ))}
          </div>
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={getVars}
      legend={[
        { tone: 'focus', label: '変化したビット・繰り上がり' },
        { tone: 'range', label: '計算中' },
        { tone: 'done', label: '結果' },
      ]}
      footnote="8ビットの2の補数で表せる範囲は −128〜127 です。負の数の最上位ビットは必ず 1 になります。"
    />
  );
}
