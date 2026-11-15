'use client';

import { useMemo, useState } from 'react';
import StepPlayer, { type VizVar } from './StepPlayer';
import { CellRow, Field, Segment, rowWidth, useValidated, type Cell } from './ui';
import { bitString, toBits, unsignedOf } from './bits';
import {
  applyOp, traceLogic, traceShift, WIDTH,
  type LogicOp, type LogicStep, type ShiftDir, type ShiftKind, type ShiftStep,
} from './traces/logicShift';

const SIZE = 52;
const GAP = 6;
const W = rowWidth(WIDTH, SIZE, GAP);

/** 8桁以内の 0/1 を受け付け、8ビットに右詰めした値を返す */
const parseBinary = (s: string): number | null => (/^[01]{1,8}$/.test(s.trim()) ? parseInt(s.trim(), 2) : null);
const toBinText = (v: number) => toBits(v, WIDTH).join('');

const OPS = (['AND', 'OR', 'XOR', 'NAND', 'NOR', 'NOT'] as const).map(v => ({ value: v, label: v }));

function LogicPart() {
  const [op, setOp] = useState<LogicOp>('AND');
  const a = useValidated(0b10110110, toBinText, parseBinary);
  const b = useValidated(0b00001111, toBinText, parseBinary);
  const steps = useMemo(() => traceLogic(op, a.value, b.value), [op, a.value, b.value]);
  const unary = op === 'NOT';
  const caption = 86;
  const rows = unary ? 2 : 3;
  const height = 40 + rows * 80;

  const toneAt = (s: LogicStep, i: number, filled: boolean): Cell['tone'] =>
    s.col === i ? 'focus' : s.done ? 'done' : filled ? 'range' : 'plain';

  const renderVisual = (s: LogicStep) => {
    const tableRows = unary ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
    return (
      <>
        <svg className="viz-svg" viewBox={`0 0 ${caption + W + 16} ${height}`} role="img"
          aria-label={`A ${s.a.join('')}${unary ? '' : ` B ${s.b.join('')}`} 結果 ${s.out.map(o => o ?? '?').join('')}`}>
          <CellRow x={caption} y={30} size={SIZE} gap={GAP} caption="A"
            above={Array.from({ length: WIDTH }, (_, i) => i + 1)}
            cells={s.a.map((bit, i) => ({ text: String(bit), tone: s.col === i ? 'focus' : 'plain' }))} />
          {!unary && (
            <CellRow x={caption} y={110} size={SIZE} gap={GAP} caption="B"
              cells={s.b.map((bit, i) => ({ text: String(bit), tone: s.col === i ? 'focus' : 'plain' }))} />
          )}
          <CellRow x={caption} y={unary ? 110 : 190} size={SIZE} gap={GAP} caption={op}
            cells={s.out.map((bit, i) => ({ text: bit === null ? '' : String(bit), tone: bit === null ? 'muted' : toneAt(s, i, true) }))} />
        </svg>
        <div className="viz-table-wrap">
          <table className="viz-table" aria-label={`${op} の真理値表`}>
            <thead>
              <tr>{unary ? <th>A</th> : <><th>A</th><th>B</th></>}<th>{op}</th></tr>
            </thead>
            <tbody>
              {tableRows.map((r, ri) => (
                <tr key={ri} className={s.tableRow === ri ? 'is-active' : undefined}>
                  {r.map((v, i) => <td key={i}>{v}</td>)}
                  <td>{applyOp(op, r[0] as 0 | 1, (r[1] ?? 0) as 0 | 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const getVars = (s: LogicStep): VizVar[] => [
    { label: 'A', value: unsignedOf(s.a), tone: 'plain' },
    ...(unary ? [] : [{ label: 'B', value: unsignedOf(s.b), tone: 'plain' as const }]),
    { label: '結果', value: s.done ? unsignedOf(s.out as (0 | 1)[]) : '—', tone: s.done ? 'done' : 'plain' },
  ];

  return (
    <StepPlayer
      key={`${op}|${a.value}|${b.value}`}
      title={`論理演算（${op}）をビットごとに計算する`}
      steps={steps}
      settings={
        <>
          <Segment label="演算" options={OPS} value={op} onChange={setOp} />
          <Field label="A" text={a.text} invalid={a.invalid} onChange={a.onChange} width="7.5em" hint="0と1で8桁まで" />
          {!unary && <Field label="B" text={b.text} invalid={b.invalid} onChange={b.onChange} width="7.5em" />}
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={getVars}
      legend={[{ tone: 'focus', label: 'いま計算している桁' }, { tone: 'range', label: '計算済み' }, { tone: 'done', label: '結果' }]}
      footnote="ド・モルガンの法則: NOT(A AND B) = (NOT A) OR (NOT B)、NOT(A OR B) = (NOT A) AND (NOT B)"
    />
  );
}

const KINDS = [{ value: 'logical', label: '論理シフト' }, { value: 'arith', label: '算術シフト' }] as const;
const DIRS = [{ value: 'left', label: '左へ' }, { value: 'right', label: '右へ' }] as const;
const AMOUNTS = [1, 2, 3, 4].map(v => ({ value: v, label: `${v}ビット` }));

function ShiftPart() {
  const [kind, setKind] = useState<ShiftKind>('arith');
  const [dir, setDir] = useState<ShiftDir>('right');
  const [amount, setAmount] = useState(2);
  const value = useValidated(0b11101100, toBinText, parseBinary);
  // 算術シフトは符号付きとして解釈する
  const start = kind === 'arith' && value.value >= 128 ? value.value - 256 : value.value;
  const steps = useMemo(() => traceShift(kind, dir, start, amount), [kind, dir, start, amount]);

  // あふれたビットを置く場所を、シフトする方向の側にだけ、ずらすビット数の分だけ空ける
  const OUT_W = amount * (SIZE + GAP);
  const X = dir === 'left' ? 16 + OUT_W + 12 : 16;
  const width = 16 + OUT_W + 12 + W + 16;
  const renderVisual = (s: ShiftStep) => {
    // 古くあふれたビットほど、配列から遠くへ押し出される
    const outX = (i: number) => {
      const distance = s.out.length - 1 - i;
      return dir === 'left' ? X - 12 - SIZE - (SIZE + GAP) * distance : X + W + 12 + (SIZE + GAP) * distance;
    };
    return (
      <svg className="viz-svg" viewBox={`0 0 ${width} 150`} role="img"
        aria-label={`ビット列 ${s.cells.map(c => c.bit).join('')}、値 ${s.value}`}>
        {kind === 'arith' && (
          <text className="viz-label" x={X + SIZE / 2} y={22} textAnchor="middle">符号</text>
        )}
        <rect className="viz-box" x={X - 6} y={36} width={W + 12} height={SIZE + 12} rx={12} fill="none" />
        <CellRow x={X} y={42} size={SIZE} gap={GAP}
          cells={s.cells.map(c => ({ id: c.id, text: String(c.bit), tone: c.tone }))} />
        {s.out.map((c, i) => (
          <g key={c.id} className="viz-cell is-muted" style={{ transform: `translate(${outX(i)}px, 42px)` }}>
            <rect width={SIZE} height={SIZE} rx={8} />
            <text className="viz-val" x={SIZE / 2} y={SIZE / 2} textAnchor="middle" dominantBaseline="central">{c.bit}</text>
          </g>
        ))}
        {s.out.length > 0 && (
          <text className="viz-label" x={dir === 'left' ? X - 12 : X + W + 12} y={128}
            textAnchor={dir === 'left' ? 'end' : 'start'}>あふれたビット</text>
        )}
      </svg>
    );
  };

  const getVars = (s: ShiftStep): VizVar[] => [
    { label: kind === 'arith' ? '値（符号付き）' : '値（符号なし）', value: s.value, tone: 'range' },
    { label: 'シフト回数', value: `${s.count} / ${amount}` },
    { label: 'オーバーフロー', value: s.overflow ? 'あり' : 'なし', tone: s.overflow ? 'focus' : 'plain' },
  ];

  return (
    <StepPlayer
      key={`${kind}|${dir}|${amount}|${value.value}`}
      title={`${kind === 'arith' ? '算術' : '論理'}${dir === 'left' ? '左' : '右'}シフト（${amount}ビット）`}
      steps={steps}
      settings={
        <>
          <Segment label="シフトの種類" options={KINDS} value={kind} onChange={setKind} />
          <Segment label="方向" options={DIRS} value={dir} onChange={setDir} />
          <Segment label="ずらすビット数" options={AMOUNTS} value={amount} onChange={setAmount} />
          <Field label="ビット列" text={value.text} invalid={value.invalid} onChange={value.onChange} width="7.5em" hint="0と1で8桁まで" />
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={getVars}
      legend={[
        { tone: 'done', label: '新しく入ったビット' },
        ...(kind === 'arith' ? [{ tone: 'focus' as const, label: '符号ビット（動かさない）' }] : []),
        { tone: 'muted', label: 'あふれて捨てられたビット' },
      ]}
      footnote={`入力 ${bitString(toBits(value.value, WIDTH))} を${kind === 'arith' ? '符号付き（2の補数）' : '符号なし'}の整数として扱っています。` +
        '算術シフトは基本情報技術者試験の定義どおり、符号ビットを固定して残りのビットをずらします。'}
    />
  );
}

const TABS = [{ value: 'logic', label: '論理演算' }, { value: 'shift', label: 'シフト演算' }] as const;

export default function LogicShiftVisual() {
  const [tab, setTab] = useState<'logic' | 'shift'>('logic');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'logic' ? <LogicPart /> : <ShiftPart />}
    </div>
  );
}
