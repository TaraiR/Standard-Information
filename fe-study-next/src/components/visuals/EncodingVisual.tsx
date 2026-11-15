'use client';

import { useMemo, useState } from 'react';
import StepPlayer, { type VizVar } from './StepPlayer';
import { Bits, CellRow, Field, Segment, rowWidth, useValidated, type CellTone } from './ui';
import { intInRange } from './bits';
import {
  bitsNeeded, codePointLabel, hex2, planUtf8, traceBitsNeeded, traceUtf8, UTF8_RANGES,
  type BitsNeededStep, type Utf8Phase, type Utf8Plan, type Utf8Step,
} from './traces/encoding';

// ---------- 必要なビット数 ----------
const N_PRESETS = [
  { n: 10, label: '数字 10' },
  { n: 26, label: '英字 26' },
  { n: 52, label: '大小英字 52' },
  { n: 365, label: '日 365' },
  { n: 1000, label: '1000' },
];

function BitsNeededPart() {
  const n = useValidated(26, String, intInRange(2, 100000));
  const steps = useMemo(() => traceBitsNeeded(n.value), [n.value]);
  const maxK = bitsNeeded(n.value);
  const size = maxK > 10 ? 36 : 48;
  const width = Math.max(rowWidth(maxK, size, 6), 420) + 40;

  const renderVisual = (s: BitsNeededStep) => (
    <svg className="viz-svg" viewBox={`0 0 ${width} 170`} role="img" aria-label={`${s.k}ビットで${s.patterns}通り`}>
      <CellRow x={20} y={30} size={size} gap={6}
        cells={Array.from({ length: maxK }, (_, i) => ({
          text: i < s.k ? '■' : '',
          tone: (i < s.k ? (s.enough ? 'done' : 'range') : 'muted') as CellTone,
        }))} />
      <text className="viz-label" x={20} y={18}>ビット数: {s.k}</text>
      <text className={`viz-text is-strong tone-${s.enough ? 'done' : 'focus'}`} x={20} y={30 + size + 50} style={{ fontSize: 30 }}>
        2^{s.k} = {s.patterns.toLocaleString()} 通り {s.enough ? '≧' : '<'} {n.value.toLocaleString()} 通り
      </text>
      <text className="viz-label" x={20} y={30 + size + 84}>
        {s.enough ? '足りる' : s.k === 0 ? '' : '足りない → もう1ビット増やす'}
      </text>
    </svg>
  );

  return (
    <StepPlayer
      key={n.value}
      title={`${n.value.toLocaleString()} 通りを区別するのに必要なビット数`}
      steps={steps}
      settings={
        <>
          <Field label="区別したい数" text={n.text} invalid={n.invalid} onChange={n.onChange} width="6em" hint="2〜100000" />
          <div className="viz-presets">
            {N_PRESETS.map(p => (
              <button key={p.n} type="button" className="viz-mini-btn" onClick={() => n.set(p.n)}>{p.label}</button>
            ))}
          </div>
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={s => [
        { label: 'ビット数', value: s.k, tone: s.enough ? 'done' : 'range' },
        { label: '表せる数', value: s.patterns.toLocaleString(), tone: s.enough ? 'done' : 'plain' },
        { label: '必要な数', value: n.value.toLocaleString(), tone: 'focus' },
      ]}
      footnote="例: 英字26文字を区別するには 2^4 = 16 < 26 ≦ 2^5 = 32 なので 5 ビット必要です。"
    />
  );
}

// ---------- UTF-8 ----------
const CHAR_PRESETS = ['A', 'é', 'あ', '漢', '😀'];
const SEG_TONES: ('range' | 'focus' | 'done' | 'alt')[] = ['range', 'focus', 'done', 'alt'];
const ORDER: Utf8Phase[] = ['char', 'range', 'bits', 'template', 'fill', 'bytes'];

function Utf8Part() {
  const ch = useValidated<Utf8Plan>(planUtf8('あ')!, p => p.char, s => planUtf8(s));
  const p = ch.value;
  const steps = useMemo(() => traceUtf8(p), [p]);

  // 符号位置の各ビットが何番目の区切り（バイト）に入るか
  const segOf = useMemo(() => {
    const out: number[] = [];
    p.segments.forEach((len, i) => { for (let k = 0; k < len; k++) out.push(i); });
    return out;
  }, [p]);

  const renderVisual = (s: Utf8Step) => {
    const at = ORDER.indexOf(s.phase);
    let pos = 0;
    return (
      <div>
        <div className="viz-table-wrap">
          <table className="viz-table" aria-label="UTF-8 のバイト数と符号位置の範囲">
            <thead><tr><th>バイト</th><th>符号位置の範囲</th><th className="viz-hide-sm">型</th></tr></thead>
            <tbody>
              {UTF8_RANGES.map(r => (
                <tr key={r.bytes} className={at >= 1 && r.bytes === p.bytes ? 'is-active' : undefined}>
                  <td>{r.bytes}</td>
                  <td>{codePointLabel(r.from)}〜{codePointLabel(r.to)}</td>
                  <td className="viz-mono viz-hide-sm">{r.pattern}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ol className="viz-work" style={{ marginTop: 12 }}>
          <li className={at === 0 ? 'is-current' : undefined}>
            <span>文字</span>
            <span><span className="viz-big">{p.char}</span>　{codePointLabel(p.codePoint)}（{p.codePoint}）</span>
          </li>
          <li className={at === 2 ? 'is-current' : at < 2 ? 'is-pending' : undefined}>
            <span>符号位置（2進）</span>
            <span>
              {at >= 2
                ? <Bits bits={p.codeBits} tones={p.codeBits.map((_, i) => SEG_TONES[segOf[i]])} />
                : '—'}
            </span>
          </li>
          <li className={at === 3 || at === 4 ? 'is-current' : at < 3 ? 'is-pending' : undefined}>
            <span>UTF-8</span>
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {at >= 3 ? p.segments.map((len, bi) => {
                const prefix = p.prefixes[bi].split('');
                const payload = at >= 4
                  ? p.codeBits.slice(pos, pos + len).map(String)
                  : Array(len).fill('x');
                pos += len;
                return (
                  <Bits key={bi}
                    bits={[...prefix, ...payload]}
                    tones={[...prefix.map(() => 'muted' as const), ...payload.map(() => SEG_TONES[bi])]}
                    fixed={[...prefix.map(() => true), ...payload.map(() => false)]} />
                );
              }) : '—'}
            </span>
          </li>
          <li className={at === 5 ? 'is-current' : 'is-pending'}>
            <span>バイト列</span>
            <span className="viz-big">{at >= 5 ? p.encoded.map(hex2).join(' ') : '—'}</span>
          </li>
        </ol>
      </div>
    );
  };

  const getVars = (s: Utf8Step): VizVar[] => {
    const at = ORDER.indexOf(s.phase);
    return [
      { label: '符号位置', value: codePointLabel(p.codePoint), tone: 'range' },
      { label: 'バイト数', value: at >= 1 ? p.bytes : '—', tone: at >= 1 ? 'focus' : 'plain' },
      { label: 'UTF-8', value: at >= 5 ? p.encoded.map(hex2).join(' ') : '—', tone: at >= 5 ? 'done' : 'plain' },
    ];
  };

  return (
    <StepPlayer
      key={p.char}
      title={`文字「${p.char}」を UTF-8 で符号化する`}
      steps={steps}
      settings={
        <>
          <Field label="文字" text={ch.text} invalid={ch.invalid} onChange={ch.onChange} inputMode="text" width="4em" hint="先頭の1文字を使います" />
          <div className="viz-presets">
            {CHAR_PRESETS.map(c => (
              <button key={c} type="button" className="viz-mini-btn" onClick={() => ch.set(planUtf8(c)!)}>{c}</button>
            ))}
          </div>
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={getVars}
      legend={[{ tone: 'muted', label: 'バイト数を示す固定ビット（点線）' }, { tone: 'range', label: '符号位置のビット（色ごとに各バイトへ）' }]}
      footnote="UTF-8 は英数字を1バイト、ひらがな・漢字を3バイト、絵文字を4バイトで表します。"
    />
  );
}

const TABS = [{ value: 'bits', label: '必要なビット数' }, { value: 'utf8', label: 'UTF-8 の符号化' }] as const;

export default function EncodingVisual() {
  const [tab, setTab] = useState<'bits' | 'utf8'>('bits');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'bits' ? <BitsNeededPart /> : <Utf8Part />}
    </div>
  );
}
