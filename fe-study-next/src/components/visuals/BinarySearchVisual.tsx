'use client';

import { useId, useMemo, useState } from 'react';
import StepPlayer, { type VizVar } from './StepPlayer';
import {
  binarySearchCode, maxComparisons, traceBinarySearch,
  type BinarySearchStep, type IndexBase,
} from './binarySearchTrace';

const DEFAULT_ARRAY = [3, 8, 12, 17, 23, 31, 38, 45, 56, 72];
const DEFAULT_TARGET = 38; // 比較4回（10要素の最大）かかる例
const SIZE = DEFAULT_ARRAY.length;

// SVG のレイアウト（viewBox 単位）。左右に1マスずつ余白を取り、
// 探索終了時に 左 > 右 となってポインタが配列の外に出る様子も描けるようにする。
const CELL = 64;
const BOX = 56;
const PAD = CELL;
const WIDTH = PAD * 2 + CELL * SIZE;
const HEIGHT = 190;
// スマホでは CSS で文字を大きくするため、文字の位置は基準線（baseline）指定で重ならないようにしている
const ROW = { idx: 22, box: 30, mid: 96, bounds: 140 };

function randomSortedArray(): number[] {
  const set = new Set<number>();
  while (set.size < SIZE) set.add(1 + Math.floor(Math.random() * 99));
  return [...set].sort((a, b) => a - b);
}

type CellState = 'range' | 'focus' | 'done' | 'muted';

function cellState(step: BinarySearchStep, index: number): CellState {
  if (step.phase === 'found' && index === step.mid) return 'done';
  if ((step.phase === 'mid' || step.phase === 'compare') && index === step.mid) return 'focus';
  if (step.phase !== 'notfound' && index >= step.left && index <= step.right) return 'range';
  return 'muted';
}

function Pointer({ x, y, label, tone, hidden }: { x: number; y: number; label: string; tone: string; hidden?: boolean }) {
  return (
    <g className={`viz-pointer tone-${tone}${hidden ? ' is-hidden' : ''}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
      <polygon points="0,0 -10,14 10,14" />
      <text x={0} y={18} textAnchor="middle" dominantBaseline="hanging">{label}</text>
    </g>
  );
}

export default function BinarySearchVisual() {
  const inputId = useId();
  const [array, setArray] = useState(DEFAULT_ARRAY);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [targetText, setTargetText] = useState(String(DEFAULT_TARGET));
  const [base, setBase] = useState<IndexBase>(0);

  const trace = useMemo(() => traceBinarySearch(array, target, base), [array, target, base]);
  const code = useMemo(() => binarySearchCode(base), [base]);
  const inputInvalid = !/^-?\d{1,3}$/.test(targetText.trim());

  const chooseTarget = (value: number) => { setTarget(value); setTargetText(String(value)); };
  const pickPresent = () => chooseTarget(array[Math.floor(Math.random() * array.length)]);
  const pickAbsent = () => {
    const absent = Array.from({ length: 100 }, (_, i) => i).filter(v => !array.includes(v));
    chooseTarget(absent[Math.floor(Math.random() * absent.length)]);
  };

  const cx = (index: number) => PAD + (index - base) * CELL + CELL / 2;
  const showMid = (s: BinarySearchStep) => s.mid !== null && (s.phase === 'mid' || s.phase === 'compare' || s.phase === 'found');

  const settings = (
    <>
      <label className="viz-field" htmlFor={inputId}>
        目標値
        <input
          id={inputId} className="viz-input" type="number" inputMode="numeric" min={0} max={999}
          value={targetText} aria-invalid={inputInvalid}
          onChange={e => {
            setTargetText(e.target.value);
            if (/^-?\d{1,3}$/.test(e.target.value.trim())) setTarget(Number(e.target.value));
          }}
        />
      </label>
      <button type="button" className="viz-mini-btn" onClick={pickPresent}>配列にある値</button>
      <button type="button" className="viz-mini-btn" onClick={pickAbsent}>配列にない値</button>
      <button type="button" className="viz-mini-btn" onClick={() => setArray(randomSortedArray())}>配列を作り直す</button>
      <div className="viz-segment" role="group" aria-label="要素番号の始まり">
        <button type="button" className={base === 0 ? 'is-on' : ''} aria-pressed={base === 0} onClick={() => setBase(0)}>
          0始まり
        </button>
        <button type="button" className={base === 1 ? 'is-on' : ''} aria-pressed={base === 1} onClick={() => setBase(1)}>
          1始まり（試験）
        </button>
      </div>
    </>
  );

  const getVars = (s: BinarySearchStep): VizVar[] => {
    const ended = s.phase === 'notfound';
    const midShown = showMid(s);
    return [
      { label: '左 (left)', value: s.left, tone: ended ? 'muted' : 'range' },
      { label: '右 (right)', value: s.right, tone: ended ? 'muted' : 'range' },
      { label: '中央 (mid)', value: midShown ? s.mid : '—', tone: s.phase === 'found' ? 'done' : midShown ? 'focus' : 'plain' },
      { label: 'A[中央]', value: midShown && s.mid !== null ? array[s.mid - base] : '—', tone: midShown ? 'focus' : 'plain' },
      { label: '比較回数', value: s.comparisons, tone: s.phase === 'found' ? 'done' : 'plain' },
    ];
  };

  const renderVisual = (s: BinarySearchStep) => (
    <svg className="viz-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img"
      aria-label={`配列 ${array.join(', ')}。左 ${s.left}、右 ${s.right}${showMid(s) ? `、中央 ${s.mid}` : ''}`}>
      {array.map((value, p) => {
        const index = p + base;
        const x = PAD + p * CELL + (CELL - BOX) / 2;
        return (
          <g key={p} className={`viz-cell is-${cellState(s, index)}`}>
            <text className="viz-idx" x={x + BOX / 2} y={ROW.idx} textAnchor="middle">[{index}]</text>
            <rect x={x} y={ROW.box} width={BOX} height={BOX} rx={10} />
            <text className="viz-val" x={x + BOX / 2} y={ROW.box + BOX / 2} textAnchor="middle" dominantBaseline="central">
              {value}
            </text>
          </g>
        );
      })}
      <Pointer x={cx(s.mid ?? s.left)} y={ROW.mid} label="中央" tone={s.phase === 'found' ? 'done' : 'focus'} hidden={!showMid(s)} />
      {/* 左と右が同じ要素を指すときは1つにまとめて表示する */}
      <Pointer x={cx(s.left)} y={ROW.bounds} label={s.left === s.right ? '左=右' : '左'} tone="range" />
      <Pointer x={cx(s.right)} y={ROW.bounds} label="右" tone="range" hidden={s.left === s.right} />
    </svg>
  );

  return (
    <StepPlayer
      // 配列・目標値・要素番号の始まりが変わったら最初のステップから再生し直す
      key={`${array.join(',')}|${target}|${base}`}
      title={`二分探索：目標値 ${target} を探す`}
      steps={trace.steps}
      settings={settings}
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={getVars}
      code={{ lines: code, getActive: s => s.lines }}
      legend={[
        { tone: 'range', label: '探索範囲' },
        { tone: 'focus', label: '比較する中央の要素' },
        { tone: 'done', label: '発見' },
        { tone: 'muted', label: '探索範囲外' },
      ]}
      footnote={
        <>
          要素数 {array.length} の配列では、二分探索の比較回数は最大 {maxComparisons(array.length)} 回
          （⌊log₂{array.length}⌋ + 1）です。先頭から順に調べる線形探索では、最大 {array.length} 回かかります。
          {base === 1 && ' 1始まりでは中央の位置が0始まりと変わることがありますが、どちらも正しい二分探索です。'}
        </>
      }
    />
  );
}
