'use client';

/** ビジュアル教材の設定欄で使う小さな部品 */
import { useId, useState, type ReactNode } from 'react';
import type { VizTone } from './StepPlayer';

export type CellTone = VizTone;

/** 入力途中の文字列と、確定した正しい値を分けて持つ（不正な入力中も図は直前の値のまま） */
export function useValidated<T>(initial: T, toText: (v: T) => string, parse: (s: string) => T | null) {
  const [text, setText] = useState(toText(initial));
  const [value, setValue] = useState(initial);
  return {
    text,
    value,
    invalid: parse(text) === null,
    onChange: (s: string) => {
      setText(s);
      const v = parse(s);
      if (v !== null) setValue(v);
    },
    set: (v: T) => { setValue(v); setText(toText(v)); },
  };
}

export function Field({ label, text, invalid, onChange, inputMode = 'numeric', width, hint }: {
  label: string;
  text: string;
  invalid: boolean;
  onChange: (s: string) => void;
  inputMode?: 'numeric' | 'decimal' | 'text';
  width?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <label className="viz-field" htmlFor={id}>
      {label}
      <input
        id={id} className="viz-input" type="text" inputMode={inputMode} value={text}
        style={width ? { width } : undefined} aria-invalid={invalid}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={e => onChange(e.target.value)}
      />
      {hint && <span id={`${id}-hint`} className="viz-hint">{hint}</span>}
    </label>
  );
}

export function Segment<T extends string | number>({ label, options, value, onChange }: {
  label: string;
  options: readonly { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="viz-segment" role="group" aria-label={label}>
      {options.map(o => (
        <button key={String(o.value)} type="button" className={o.value === value ? 'is-on' : ''}
          aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export interface Cell {
  id?: string | number;
  text: string;
  tone?: CellTone;
  /** 位置合わせ用の見えないマス */
  hidden?: boolean;
}

/** HTML でビット列を並べる（長いビット列は折り返す） */
export function Bits({ bits, tones, fixed }: {
  bits: readonly (string | number)[];
  tones?: readonly (CellTone | 'alt')[] | CellTone | 'alt';
  /** 固定ビット（UTF-8 の先頭ビットなど）を点線で示す */
  fixed?: readonly boolean[];
}) {
  return (
    <span className="viz-bits">
      {bits.map((b, i) => {
        const t = Array.isArray(tones) ? tones[i] : tones;
        return (
          <span key={i} className={`viz-bit${t ? ` tone-${t}` : ''}${fixed?.[i] ? ' is-fixed' : ''}`}>{b}</span>
        );
      })}
    </span>
  );
}

/**
 * SVG 上に横一列のマス（ビット・配列要素など）を描く。
 * id を指定すると、位置が変わったマスが滑らかに移動する（シフト演算など）。
 */
export function CellRow({ cells, x, y, size = 52, gap = 6, above, caption }: {
  cells: readonly Cell[];
  x: number;
  y: number;
  size?: number;
  gap?: number;
  /** 各マスの上に出す小さなラベル（重み・要素番号など） */
  above?: readonly (string | number | undefined)[];
  /** 行の左に出す見出し */
  caption?: string;
}) {
  return (
    <g>
      {caption && (
        <text className="viz-label" x={x - 12} y={y + size / 2} textAnchor="end" dominantBaseline="central">
          {caption}
        </text>
      )}
      {cells.map((c, i) => (
        <g key={c.id ?? i} className={`viz-cell is-${c.tone ?? 'plain'}`}
          style={{ transform: `translate(${x + i * (size + gap)}px, ${y}px)`, opacity: c.hidden ? 0 : undefined }}>
          {above?.[i] !== undefined && (
            <text className="viz-idx" x={size / 2} y={-9} textAnchor="middle">{above[i]}</text>
          )}
          <rect width={size} height={size} rx={8} />
          <text className="viz-val" x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central">
            {c.text}
          </text>
        </g>
      ))}
    </g>
  );
}

/** CellRow の幅（viewBox 単位） */
export const rowWidth = (count: number, size = 52, gap = 6) => count * size + Math.max(0, count - 1) * gap;
