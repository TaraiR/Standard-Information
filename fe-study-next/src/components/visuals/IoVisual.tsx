'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Field, Segment, useValidated } from './ui';
import { intInRange } from './bits';
import { addressCapacity, CPU_LABEL, TOTAL, traceIo, WORDS, type CpuTask, type IoMode, type IoStep } from './traces/io';

const MODES = [
  { value: 'polling', label: 'ポーリング' },
  { value: 'interrupt', label: '割り込み' },
  { value: 'dma', label: 'DMA' },
] as const;

const CPU_TONE: Record<CpuTask, string> = {
  work: 'tone-done', poll: 'tone-muted', request: 'tone-range', setup: 'tone-range',
  copy: 'tone-focus', isr: 'tone-focus', 'done-irq': 'tone-focus',
};

function IoPart() {
  const [mode, setMode] = useState<IoMode>('polling');
  const steps = useMemo(() => traceIo(mode), [mode]);

  const renderVisual = (s: IoStep) => {
    const cols = Array.from({ length: TOTAL }, (_, t) => s.slots[t]);
    const now = (t: number) => (t + 1 === s.time && s.time > 0 && s !== steps[steps.length - 1] ? ' is-now' : '');
    return (
      <div className="viz-table-wrap">
        <table className="viz-grid" aria-label="時間ごとの CPU と装置の動き">
          <thead>
            <tr><th />{cols.map((_, t) => <th key={t} className={now(t).trim() || undefined}>{t + 1}</th>)}</tr>
          </thead>
          <tbody>
            <tr>
              <th>CPU</th>
              {cols.map((c, t) => <td key={t} className={c ? `${CPU_TONE[c.cpu]}${now(t)}` : undefined}>{c ? CPU_LABEL[c.cpu] : ''}</td>)}
            </tr>
            {mode === 'dma' && (
              <tr>
                <th>DMA</th>
                {cols.map((c, t) => <td key={t} className={c?.dma ? `tone-range${now(t)}` : undefined}>{c?.dma ? '転送' : ''}</td>)}
              </tr>
            )}
            <tr>
              <th>装置</th>
              {cols.map((c, t) => (
                <td key={t} className={c ? (c.dev === 'ready' ? 'tone-range' : c.dev === 'prep' ? 'tone-muted' : '') + now(t) : undefined}>
                  {c ? (c.dev === 'ready' ? '完了' : c.dev === 'prep' ? '準備' : '') : ''}
                </td>
              ))}
            </tr>
            <tr>
              <th>主記憶</th>
              {cols.map((c, t) => <td key={t} className={c?.word ? `tone-done${now(t)}` : undefined}>{c?.word ? `${c.word}語` : ''}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <StepPlayer
      key={mode}
      title={`入出力の方式: ${MODES.find(m => m.value === mode)!.label}`}
      steps={steps}
      settings={<Segment label="入出力の方式" options={MODES} value={mode} onChange={setMode} />}
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={s => [
        { label: '転送済み', value: `${s.transferred} / ${WORDS} 語`, tone: s.transferred === WORDS ? 'done' : 'range' },
        { label: 'CPUの仕事', value: `${s.cpuWork} 単位`, tone: 'done' },
        { label: '入出力に使った', value: `${s.cpuIo} 単位`, tone: 'focus' },
      ]}
      legend={[
        { tone: 'done', label: 'CPU が本来の仕事をしている' },
        { tone: 'focus', label: 'CPU が転送・割り込み処理をしている' },
        { tone: 'muted', label: '状態確認（ポーリング）・装置が準備中' },
      ]}
      footnote="3つの方式を切り替えて、CPU が本来の仕事（緑）に使える時間を比べてみましょう。"
    />
  );
}

function AddressPart() {
  const bits = useValidated(32, String, intInRange(1, 64));
  const cap = addressCapacity(bits.value);
  const steps = useMemo(() => [
    { message: `アドレスバスが ${bits.value} 本（${bits.value} ビット）あるとき、何バイトのメモリを区別できるかを考えます。` },
    { message: `${bits.value} 本の信号線はそれぞれ 0 か 1 なので、区別できるアドレスは 2^${bits.value} 通りです。` },
    { message: `1つのアドレスが1バイトを指すとすると、2^${bits.value} バイトのメモリを管理できます。` },
    { message: `2^10 = 1,024 バイト = 1KB、2^20 = 1MB、2^30 = 1GB なので、2^${bits.value} バイト = ${cap.value} です。` },
  ], [bits.value, cap.value]);

  return (
    <StepPlayer
      key={bits.value}
      title="アドレスバスの幅と管理できるメモリ容量"
      steps={steps}
      settings={
        <>
          <Field label="アドレスバス(ビット)" text={bits.text} invalid={bits.invalid} onChange={bits.onChange} width="4em" />
          <div className="viz-presets">
            {[16, 20, 32, 36, 64].map(v => (
              <button key={v} type="button" className="viz-mini-btn" onClick={() => bits.set(v)}>{v}ビット</button>
            ))}
          </div>
        </>
      }
      renderVisual={(_, i) => (
        <ol className="viz-work">
          <li className={i === 1 ? 'is-current' : i < 1 ? 'is-pending' : undefined}><span>アドレス数</span><span className="viz-big">2^{bits.value} 通り</span></li>
          <li className={i === 2 ? 'is-current' : i < 2 ? 'is-pending' : undefined}><span>容量</span><span className="viz-mono">2^{bits.value} バイト</span></li>
          <li className={i === 3 ? 'is-current' : i < 3 ? 'is-pending' : undefined}><span>単位換算</span><span className="viz-big">{cap.value}</span></li>
        </ol>
      )}
      getMessage={s => s.message}
      footnote="このサイトでは 1KB = 1,024 バイト（2^10）で計算しています。"
    />
  );
}

const TABS = [{ value: 'io', label: '入出力の方式' }, { value: 'addr', label: 'アドレスバス' }] as const;

export default function IoVisual() {
  const [tab, setTab] = useState<'io' | 'addr'>('io');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'io' ? <IoPart /> : <AddressPart />}
    </div>
  );
}
