'use client';

import { useMemo, useState } from 'react';
import StepPlayer, { type VizVar } from './StepPlayer';
import { Arrow, Field, Segment, UnitBox, useValidated } from './ui';
import { intInRange } from './bits';
import { instrText, makeProgram, runCpu, type CpuStep, type Flow, type Register, type Unit } from './traces/cpuSim';

const PROGRAMS = [
  { value: 'io', label: '入力→計算→出力' },
  { value: 'add', label: '足し算' },
  { value: 'sub', label: '引き算' },
] as const;
type ProgId = (typeof PROGRAMS)[number]['value'];

const PHASE_LABEL: Record<CpuStep['phase'], string> = {
  start: '開始', fetch: 'フェッチ', decode: 'デコード', execute: '実行', halt: '終了',
};

// 5大装置の配置（viewBox 640 × 340）
const BOX = {
  input: { x: 16, y: 24, w: 150, h: 76, title: '入力装置', sub: 'キーボードなど' },
  memory: { x: 245, y: 24, w: 150, h: 76, title: '記憶装置', sub: '主記憶' },
  output: { x: 474, y: 24, w: 150, h: 76, title: '出力装置', sub: 'ディスプレイなど' },
  control: { x: 120, y: 214, w: 170, h: 80, title: '制御装置', sub: '命令の解読・指示' },
  alu: { x: 350, y: 214, w: 170, h: 80, title: '演算装置', sub: 'ALU・ACC' },
} as const;

const DATA_ARROWS: Record<Flow, [number, number][]> = {
  'in-mem': [[166, 56], [245, 56]],
  'mem-out': [[395, 56], [474, 56]],
  'mem-ctrl': [[286, 100], [222, 214]],
  'mem-alu': [[340, 100], [404, 214]],
  'alu-mem': [[434, 214], [370, 100]],
};
const CONTROL_ARROWS: Partial<Record<Unit, [number, number][]>> = {
  input: [[150, 214], [91, 100]],
  memory: [[256, 214], [256, 162], [312, 162], [312, 100]],
  alu: [[290, 268], [350, 268]],
  output: [[205, 294], [205, 330], [600, 330], [600, 100]],
};

const parse = intInRange(-99, 99);

export default function CpuVisual() {
  const [prog, setProg] = useState<ProgId>('io');
  const a = useValidated(7, String, parse);
  const b = useValidated(5, String, parse);
  const steps = useMemo(() => runCpu(makeProgram(prog, a.value, b.value)), [prog, a.value, b.value]);

  const renderVisual = (s: CpuStep) => {
    const on = (u: Unit) => s.active.includes(u);
    return (
      <>
        <svg className="viz-svg" viewBox="0 0 640 340" role="img"
          aria-label={`動いている装置: ${s.active.map(u => BOX[u].title).join('、') || 'なし'}`}>
          <rect x={100} y={196} width={440} height={116} rx={16} className="viz-box" fill="none" strokeDasharray="6 5" />
          <text className="viz-label" x={112} y={190}>CPU（中央処理装置）</text>
          {(Object.keys(CONTROL_ARROWS) as Unit[]).map(u => (
            <Arrow key={`c-${u}`} points={CONTROL_ARROWS[u]!} dashed tone="focus" active={s.control.includes(u)} />
          ))}
          {(Object.keys(DATA_ARROWS) as Flow[]).map(f => (
            <Arrow key={f} points={DATA_ARROWS[f]} tone="range" active={s.flows.includes(f)} />
          ))}
          {(Object.keys(BOX) as Unit[]).map(u => (
            <UnitBox key={u} {...BOX[u]} active={on(u)} tone={u === 'control' ? 'focus' : 'range'} />
          ))}
        </svg>
        <div className="viz-panels">
          <div className="viz-panel">
            <h5>レジスタ（{PHASE_LABEL[s.phase]}）</h5>
            <dl className="viz-kv">
              {(['PC', 'IR', 'ACC', 'MAR', 'MDR'] as Register[]).map(r => (
                <div key={r} style={{ display: 'contents' }}>
                  <dt>{r}</dt>
                  <dd className={s.changed.includes(r) ? 'is-changed' : undefined}>{s.regs[r] ?? '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="viz-panel">
            <h5>主記憶（番地: 内容）</h5>
            <dl className="viz-kv">
              {/* 命令と、データ領域（8〜10番地）だけを表示する */}
              {s.mem.map((w, i) => (typeof w === 'number' && (i < 8 || i > 10) ? null : (
                <div key={i} style={{ display: 'contents' }}>
                  <dt>{i}</dt>
                  <dd className={s.memHighlight === i ? 'is-hl' : undefined}>
                    {instrText(w)}{typeof w === 'number' ? '' : '（命令）'}
                  </dd>
                </div>
              )))}
            </dl>
          </div>
        </div>
        {prog !== 'add' && (
          <p className="viz-footnote">出力装置の表示: <b>{s.output.length ? s.output.join(', ') : '（まだなし）'}</b></p>
        )}
      </>
    );
  };

  const getVars = (s: CpuStep): VizVar[] => [
    { label: '段階', value: PHASE_LABEL[s.phase], tone: s.phase === 'execute' ? 'focus' : s.phase === 'halt' ? 'done' : 'range' },
    { label: '実行中の命令', value: s.regs.IR },
    { label: 'ACC', value: s.regs.ACC, tone: s.changed.includes('ACC') ? 'focus' : 'plain' },
  ];

  return (
    <StepPlayer
      key={`${prog}|${a.value}|${b.value}`}
      title="5大装置とレジスタの動き（命令実行サイクル）"
      steps={steps}
      settings={
        <>
          <Segment label="プログラム" options={PROGRAMS} value={prog} onChange={setProg} />
          <Field label={prog === 'io' ? '入力する値' : '値A（8番地）'} text={a.text} invalid={a.invalid} onChange={a.onChange} inputMode="text" width="4em" />
          <Field label="値B（9番地）" text={b.text} invalid={b.invalid} onChange={b.onChange} inputMode="text" width="4em" />
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={getVars}
      legend={[
        { tone: 'range', label: 'データ・命令の流れ（実線）' },
        { tone: 'focus', label: '制御信号（点線）・変化したレジスタ' },
      ]}
      footnote="制御装置と演算装置をあわせて CPU と呼びます。PC: プログラムカウンタ、IR: 命令レジスタ、ACC: アキュムレータ、MAR / MDR: メモリアドレス / データレジスタ。"
    />
  );
}
