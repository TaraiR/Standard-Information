'use client';

import { useMemo } from 'react';
import StepPlayer, { type VizVar } from './StepPlayer';
import { Bits, Field, useValidated } from './ui';
import { parseDecimal, shorten, toFloat32, traceFloat, type FloatParsed, type FloatPhase, type FloatStep } from './traces/floatingPoint';

const ORDER: FloatPhase[] = ['input', 'sign', 'int', 'frac', 'binary', 'normalize', 'exponent', 'mantissa', 'fields', 'stored'];
const PRESETS = ['6.5', '0.1', '-0.75', '10.375', '0.3'];
const DEFAULT = parseDecimal('6.5')!;

export default function FloatingPointVisual() {
  const input = useValidated<FloatParsed>(DEFAULT, p => p.text, parseDecimal);
  const p = input.value;
  const r = useMemo(() => toFloat32(p), [p]);
  const steps = useMemo(() => traceFloat(p, r), [p, r]);
  const absText = p.text.replace(/^[+-]/, '');
  const binary = `${r.intBinary}${r.fracDigits ? `.${r.fracDigits}${r.fracTruncated ? '…' : ''}` : ''}`;
  const shownNorm = r.normBits.slice(0, 16);
  const normalized = `1.${shownNorm || '0'}${r.normBits.length > 16 || r.normMore ? '…' : ''} × 2^${r.normExponent}`;

  const renderVisual = (s: FloatStep) => {
    const at = ORDER.indexOf(s.phase);
    const cls = (phase: FloatPhase) => {
      const i = ORDER.indexOf(phase);
      return i === at ? 'is-current' : i > at ? 'is-pending' : undefined;
    };
    const showSign = at >= ORDER.indexOf('sign');
    const showExp = at >= ORDER.indexOf('exponent');
    const showMan = at >= ORDER.indexOf('mantissa');
    return (
      <div>
        <ol className="viz-work">
          <li className={cls('sign')}><span>符号</span><span>{p.negative ? '負' : '正'} → 符号部 = <b>{r.sign}</b></span></li>
          <li className={cls('int')}><span>整数部</span><span className="viz-mono">{(p.num / p.den).toString()} → {r.intBinary}</span></li>
          <li className={cls('frac')}>
            <span>小数部 ×2</span>
            <span className="viz-mono">
              {r.fracRows.length === 0 ? 'なし' : r.fracRows.map((row, i) => (
                <span key={i} style={{ display: 'block' }}>{row.before} × 2 = {row.after} → <b>{row.digit}</b></span>
              ))}
              {r.fracTruncated && (
                <span style={{ display: 'block' }}>{r.repeating ? '…（同じ小数部が繰り返し現れ、終わらない）' : '…（以下省略）'}</span>
              )}
            </span>
          </li>
          <li className={cls('binary')}><span>2進数</span><span className="viz-mono">{absText} = {binary}</span></li>
          <li className={cls('normalize')}><span>正規化</span><span className="viz-mono">{normalized}</span></li>
          <li className={cls('exponent')}><span>指数部</span><span className="viz-mono">{r.exponent} + 127 = {r.biased} → {r.exponentBits.join('')}</span></li>          <li className={cls('mantissa')}>
            <span>仮数部</span>
            <span className="viz-mono">{r.mantissaBits.join('')}{r.rounded ? '（丸めあり）' : ''}</span>
          </li>
        </ol>
        <div className="viz-float-fields" aria-label="32ビットの内訳">
          <div><small>符号 1</small><Bits bits={showSign ? [r.sign] : ['?']} tones={showSign ? 'focus' : 'muted'} /></div>
          <div><small>指数部 8</small><Bits bits={showExp ? r.exponentBits : Array(8).fill('?')} tones={showExp ? 'range' : 'muted'} /></div>
          <div><small>仮数部 23</small><Bits bits={showMan ? r.mantissaBits : Array(23).fill('?')} tones={showMan ? 'done' : 'muted'} /></div>
        </div>
      </div>
    );
  };

  const getVars = (s: FloatStep): VizVar[] => {
    const at = ORDER.indexOf(s.phase);
    return [
      { label: '入力', value: p.text, tone: 'range' },
      { label: '16進数', value: at >= ORDER.indexOf('fields') ? r.hex : '—', tone: at >= ORDER.indexOf('fields') ? 'done' : 'plain' },
      {
        label: '格納される値', value: at >= ORDER.indexOf('stored') ? shorten(r.storedExact, 12) : '—',
        tone: at >= ORDER.indexOf('stored') ? (r.rounded ? 'focus' : 'done') : 'plain',
      },
    ];
  };

  return (
    <StepPlayer
      key={p.text}
      title="10進数の小数を IEEE 754 単精度（32ビット）で表す"
      steps={steps}
      settings={
        <>
          <Field label="10進数" text={input.text} invalid={input.invalid} onChange={input.onChange}
            inputMode="text" width="7em" hint="小数第6位まで" />
          <div className="viz-presets">
            {PRESETS.map(v => (
              <button key={v} type="button" className="viz-mini-btn" onClick={() => input.set(parseDecimal(v)!)}>{v}</button>
            ))}
          </div>
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={getVars}
      footnote="値 = (−1)^符号 × 1.仮数部 × 2^(指数部 − 127)。0.1 のように2進数で循環する小数は、必ず丸め誤差が生じます。"
    />
  );
}
