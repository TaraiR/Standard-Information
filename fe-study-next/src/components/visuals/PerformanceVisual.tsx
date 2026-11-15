'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Field, Segment, useValidated } from './ui';
import {
  computeAmdahl, computePerf, fmt, fmtTime, traceAmdahl, tracePerf,
  type AmdahlStep, type PerfStep,
} from './traces/performance';

const num = (min: number, max: number) => (s: string): number | null => {
  const t = s.trim().replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const v = Number(t);
  return v >= min && v <= max ? v : null;
};

const PERF_ORDER: PerfStep['phase'][] = ['input', 'clock', 'cycles', 'time', 'mips'];

function PerfPart() {
  const ghz = useValidated(1, String, num(0.001, 100));
  const cpi = useValidated(2, String, num(0.1, 100));
  const count = useValidated(5_000_000, String, num(1, 1e13));
  const [r, steps] = useMemo(() => {
    const input = { ghz: ghz.value, cpi: cpi.value, instructions: count.value };
    const result = computePerf(input);
    return [result, tracePerf(input, result)] as const;
  }, [ghz.value, cpi.value, count.value]);

  // 先頭の数命令を、CPI 個ぶんのクロックの長さで並べて見せる
  const shown = 4;
  const unit = Math.min(48, 560 / Math.max(1, shown * cpi.value));
  const renderVisual = (s: PerfStep) => {
    const at = PERF_ORDER.indexOf(s.phase);
    const ticks = Math.ceil(shown * cpi.value);
    return (
      <>
        <svg className="viz-svg" viewBox="0 0 620 150" role="img" aria-label={`1命令あたり ${cpi.value} クロック`}>
          <text className="viz-label" x={20} y={22}>クロック（1目盛り = {fmt(r.cycleNs)} ns）</text>
          {Array.from({ length: Math.min(ticks, 200) + 1 }, (_, i) => (
            <line key={i} className={`viz-line${at >= 1 ? ' tone-range' : ''}`} x1={20 + i * unit} x2={20 + i * unit} y1={34} y2={50} />
          ))}
          {Array.from({ length: shown }, (_, i) => (
            <g key={i} className="viz-fade" style={{ opacity: at >= 2 ? 1 : 0.25 }}>
              <rect className={`viz-box tone-${i % 2 ? 'done' : 'focus'}`} x={20 + i * cpi.value * unit} y={62}
                width={cpi.value * unit - 3} height={44} rx={8} />
              <text className="viz-text" x={20 + (i + 0.5) * cpi.value * unit} y={84} textAnchor="middle"
                dominantBaseline="central" style={{ fontSize: Math.min(18, cpi.value * unit / 3.2) }}>命令{i + 1}</text>
            </g>
          ))}
          <text className="viz-label" x={20} y={136}>1命令に平均 {fmt(cpi.value)} クロック（CPI）かかる</text>
        </svg>
        <ol className="viz-work">
          <li className={at === 1 ? 'is-current' : at < 1 ? 'is-pending' : undefined}><span>周波数</span><span className="viz-mono">{fmt(ghz.value)} GHz = {fmt(r.hz)} Hz</span></li>
          <li className={at === 2 ? 'is-current' : at < 2 ? 'is-pending' : undefined}><span>クロック数</span><span className="viz-mono">{fmt(count.value)} × {fmt(cpi.value)} = {fmt(r.cycles)}</span></li>
          <li className={at === 3 ? 'is-current' : at < 3 ? 'is-pending' : undefined}><span>実行時間</span><span className="viz-mono">{fmt(r.cycles)} ÷ {fmt(r.hz)} = {fmtTime(r.seconds)}</span></li>
          <li className={at === 4 ? 'is-current' : at < 4 ? 'is-pending' : undefined}><span>MIPS</span><span className="viz-mono">{fmt(r.mhz)} ÷ {fmt(cpi.value)} = {fmt(r.mips)}</span></li>
        </ol>
      </>
    );
  };

  return (
    <StepPlayer
      key={`${ghz.value}|${cpi.value}|${count.value}`}
      title="CPU の性能計算（CPI・実行時間・MIPS）"
      steps={steps}
      settings={
        <>
          <Field label="クロック周波数(GHz)" text={ghz.text} invalid={ghz.invalid} onChange={ghz.onChange} inputMode="decimal" width="4.5em" />
          <Field label="CPI" text={cpi.text} invalid={cpi.invalid} onChange={cpi.onChange} inputMode="decimal" width="4em" />
          <Field label="命令数" text={count.text} invalid={count.invalid} onChange={count.onChange} width="8em" />
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={() => [
        { label: '実行時間', value: fmtTime(r.seconds), tone: 'done' },
        { label: 'MIPS', value: fmt(r.mips), tone: 'range' },
      ]}
      footnote="実行時間 = 命令数 × CPI ÷ クロック周波数(Hz)、MIPS = クロック周波数(MHz) ÷ CPI。単位（G = 10⁹、M = 10⁶）の換算に注意しましょう。"
    />
  );
}

const AMDAHL_ORDER: AmdahlStep['phase'][] = ['before', 'split', 'improve', 'after', 'limit'];

function AmdahlPart() {
  const percent = useValidated(60, String, num(0, 100));
  const factor = useValidated(4, String, num(1, 1_000_000));
  const [r, steps] = useMemo(() => {
    const input = { percent: percent.value, factor: factor.value };
    const result = computeAmdahl(input);
    return [result, traceAmdahl(input, result)] as const;
  }, [percent.value, factor.value]);
  const W = 560;

  const renderVisual = (s: AmdahlStep) => {
    const at = AMDAHL_ORDER.indexOf(s.phase);
    const split = at >= 1;
    const after = at >= 2;
    return (
      <svg className="viz-svg" viewBox="0 0 620 190" role="img" aria-label={`改善後の時間 ${fmt(r.newTime)}`}>
        <text className="viz-label" x={20} y={24}>改善前（時間 1）</text>
        <rect className={`viz-box${split ? ' tone-range' : ''}`} x={20} y={34} width={W * (split ? r.rest : 1)} height={40} rx={6} />
        {split && <rect className="viz-box tone-focus" x={20 + W * r.rest} y={34} width={W * r.p} height={40} rx={6} />}
        {split && r.rest > 0.08 && <text className="viz-label" x={20 + (W * r.rest) / 2} y={60} textAnchor="middle">そのまま {fmt(r.rest)}</text>}
        {split && r.p > 0.08 && <text className="viz-label" x={20 + W * r.rest + (W * r.p) / 2} y={60} textAnchor="middle">改善 {fmt(r.p)}</text>}

        <g className="viz-fade" style={{ opacity: after ? 1 : 0 }}>
          <text className="viz-label" x={20} y={112}>改善後（時間 {fmt(r.newTime, 4)}）</text>
          <rect className="viz-box tone-range" x={20} y={122} width={Math.max(0.5, W * r.rest)} height={40} rx={6} />
          <rect className="viz-box tone-done" x={20 + W * r.rest} y={122} width={Math.max(2, W * r.improved)} height={40} rx={6} />
          <line className="viz-line tone-focus" x1={20 + W * r.rest} x2={20 + W * r.rest} y1={100} y2={176} strokeDasharray="5 4" />
          <text className="viz-label" x={20 + W * r.rest + 6} y={184} style={{ fontSize: 15 }}>どれだけ速くしてもここより短くならない</text>
        </g>
      </svg>
    );
  };

  return (
    <StepPlayer
      key={`${percent.value}|${factor.value}`}
      title="アムダールの法則（一部を速くしたときの全体の速度向上）"
      steps={steps}
      settings={
        <>
          <Field label="改善する割合(%)" text={percent.text} invalid={percent.invalid} onChange={percent.onChange} inputMode="decimal" width="4em" />
          <Field label="その部分の速度(倍)" text={factor.text} invalid={factor.invalid} onChange={factor.onChange} inputMode="decimal" width="5em" />
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={s => {
        const at = AMDAHL_ORDER.indexOf(s.phase);
        return [
          { label: '速度向上率', value: at >= 3 ? `${fmt(r.speedup, 4)} 倍` : '—', tone: at >= 3 ? 'done' : 'plain' },
          { label: '上限', value: at >= 4 ? (r.limit === Infinity ? 'なし' : `${fmt(r.limit, 4)} 倍`) : '—', tone: at >= 4 ? 'focus' : 'plain' },
        ];
      }}
      footnote="全体の速度向上率 = 1 ÷ ((1 − 改善割合) + 改善割合 ÷ 速度向上倍率)"
    />
  );
}

const TABS = [{ value: 'perf', label: 'CPI・MIPS・実行時間' }, { value: 'amdahl', label: 'アムダールの法則' }] as const;

export default function PerformanceVisual() {
  const [tab, setTab] = useState<'perf' | 'amdahl'>('perf');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'perf' ? <PerfPart /> : <AmdahlPart />}
    </div>
  );
}
