'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Field, Segment, UnitBox, useValidated } from './ui';
import { availability, pareto, parallel, series } from './traces/devmgmt';

const num = (min: number, max: number) => (s: string): number | null => {
  const t = s.trim();
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const v = Number(t);
  return v >= min && v <= max ? v : null;
};
const r4 = (x: number) => Math.round(x * 10000) / 10000;
const CONFIGS = [{ value: 'series', label: '直列（両方必要）' }, { value: 'parallel', label: '並列（どちらか1つ）' }] as const;

function AvailabilityPart() {
  const mtbf = useValidated(900, String, num(1, 1e6));
  const mttr = useValidated(100, String, num(0, 1e6));
  const [cfg, setCfg] = useState<'series' | 'parallel'>('parallel');
  const a = availability(mtbf.value, mttr.value);
  const total = cfg === 'series' ? series([a, a]) : parallel([a, a]);
  const steps = useMemo(() => [
    { stage: 0, message: '装置が故障せずに動いている平均時間を MTBF（平均故障間隔）、故障してから直るまでの平均時間を MTTR（平均修復時間）といいます。' },
    { stage: 1, message: `装置1台の稼働率 = MTBF ÷ (MTBF + MTTR) = ${mtbf.value} ÷ (${mtbf.value} + ${mttr.value}) = ${r4(a)} です。` },
    {
      stage: 2,
      message: cfg === 'series'
        ? `直列では、2台とも動いていないとシステムが止まります。稼働率は積になり、${r4(a)} × ${r4(a)} = ${r4(total)} と、1台のときより下がります。`
        : `並列では、どちらか1台が動いていればシステムは動きます。両方同時に故障する確率は (1 − ${r4(a)}) × (1 − ${r4(a)}) = ${r4((1 - a) ** 2)} なので、稼働率は 1 − ${r4((1 - a) ** 2)} = ${r4(total)} と、1台のときより上がります（冗長化）。`,
    },
  ], [mtbf.value, mttr.value, cfg, a, total]);

  return (
    <StepPlayer
      key={`${mtbf.value}|${mttr.value}|${cfg}`}
      title="稼働率（MTBF・MTTR と直列・並列）"
      steps={steps}
      settings={
        <>
          <Field label="MTBF（時間）" text={mtbf.text} invalid={mtbf.invalid} onChange={mtbf.onChange} inputMode="decimal" width="5em" />
          <Field label="MTTR（時間）" text={mttr.text} invalid={mttr.invalid} onChange={mttr.onChange} inputMode="decimal" width="5em" />
          <Segment label="接続のしかた" options={CONFIGS} value={cfg} onChange={setCfg} />
        </>
      }
      renderVisual={s => (
        <svg className="viz-svg" viewBox="0 0 600 220" role="img" aria-label={`${cfg === 'series' ? '直列' : '並列'}構成`}>
          <line className="viz-line" x1={20} y1={110} x2={100} y2={110} strokeWidth={3} />
          <line className="viz-line" x1={500} y1={110} x2={580} y2={110} strokeWidth={3} />
          {cfg === 'series' ? (
            <>
              <line className="viz-line" x1={260} y1={110} x2={340} y2={110} strokeWidth={3} />
              <UnitBox x={100} y={75} w={160} h={70} title="装置A" sub={s.stage >= 1 ? `稼働率 ${r4(a)}` : ''} active={s.stage >= 1} tone="range" />
              <UnitBox x={340} y={75} w={160} h={70} title="装置B" sub={s.stage >= 1 ? `稼働率 ${r4(a)}` : ''} active={s.stage >= 1} tone="range" />
            </>
          ) : (
            <>
              <path className="viz-line" d="M100 110 V45 H220 M100 110 V175 H220 M380 45 H500 V110 M380 175 H500 V110" strokeWidth={3} />
              <UnitBox x={220} y={10} w={160} h={70} title="装置A" sub={s.stage >= 1 ? `稼働率 ${r4(a)}` : ''} active={s.stage >= 1} tone="range" />
              <UnitBox x={220} y={140} w={160} h={70} title="装置B" sub={s.stage >= 1 ? `稼働率 ${r4(a)}` : ''} active={s.stage >= 1} tone="range" />
            </>
          )}
          {s.stage >= 2 && (
            <text className="viz-text is-strong tone-done" x={300} y={cfg === 'series' ? 190 : 110} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 22 }}>
              システム全体 {r4(total)}
            </text>
          )}
        </svg>
      )}
      getMessage={s => s.message}
      getVars={s => [
        { label: '1台の稼働率', value: s.stage >= 1 ? r4(a) : '—', tone: 'range' },
        { label: 'システム全体', value: s.stage >= 2 ? r4(total) : '—', tone: 'done' },
      ]}
      footnote="直列: R₁ × R₂（下がる）、並列: 1 − (1 − R₁)(1 − R₂)（上がる）。MTBF は長いほど、MTTR は短いほど稼働率が上がります。"
    />
  );
}

function ParetoPart() {
  const data = useMemo(() => pareto(), []);
  const max = data[0].count;
  const steps = useMemo(() => [
    { n: 0, message: '不具合の原因ごとの件数を集計しました。パレート図では、件数の多い順に棒を並べ、累積の割合を折れ線で重ねます。' },
    ...data.map((d, i) => ({ n: i + 1, message: `${i + 1}位「${d.cause}」${d.count}件。ここまでの累積は ${d.cumulative}件（全体の ${d.percent}%）です。` })),
    { n: data.length, message: `上位2つの原因（${data[0].cause}・${data[1].cause}）だけで全体の ${data[1].percent}% を占めています。この2つを重点的に対策すれば、効率よく不具合を減らせます（80:20 の法則）。` },
  ], [data]);
  const X0 = 60;
  const BW = 80;
  const H = 200;
  return (
    <StepPlayer
      title="パレート図（重点的に対策すべき原因を見つける）"
      steps={steps}
      renderVisual={s => (
        <svg className="viz-svg" viewBox="0 0 600 300" role="img" aria-label="パレート図">
          <line className="viz-line" x1={X0} y1={20} x2={X0} y2={20 + H} />
          <line className="viz-line" x1={X0} y1={20 + H} x2={X0 + data.length * BW} y2={20 + H} />
          {data.map((d, i) => {
            const h = (d.count / max) * (H * 0.9);
            return (
              <g key={d.cause} className="viz-fade" style={{ opacity: i < s.n ? 1 : 0.12 }}>
                <rect className={`viz-box tone-${i < 2 ? 'focus' : 'range'}`} x={X0 + i * BW + 8} y={20 + H - h} width={BW - 16} height={h} rx={4} />
                <text className="viz-label" x={X0 + i * BW + BW / 2} y={20 + H + 20} textAnchor="middle" style={{ fontSize: 13 }}>{d.cause}</text>
                <text className="viz-label" x={X0 + i * BW + BW / 2} y={20 + H - h - 6} textAnchor="middle" style={{ fontSize: 14 }}>{d.count}</text>
              </g>
            );
          })}
          <polyline className="viz-line tone-done" strokeWidth={3}
            points={data.slice(0, s.n).map((d, i) => `${X0 + i * BW + BW / 2},${20 + H - (d.percent / 100) * H}`).join(' ')} />
          {data.slice(0, s.n).map((d, i) => (
            <g key={i}>
              <circle cx={X0 + i * BW + BW / 2} cy={20 + H - (d.percent / 100) * H} r={5} style={{ fill: 'var(--viz-done)' }} />
              <text className="viz-text tone-done" x={X0 + i * BW + BW / 2 + 8} y={20 + H - (d.percent / 100) * H - 8} style={{ fontSize: 13 }}>{d.percent}%</text>
            </g>
          ))}
        </svg>
      )}
      getMessage={s => s.message}
      legend={[{ tone: 'focus', label: '重点的に対策する原因' }, { tone: 'done', label: '累積比率' }]}
      footnote="QC 七つ道具: パレート図・特性要因図・ヒストグラム・管理図・散布図・チェックシート・層別"
    />
  );
}

const TABS = [{ value: 'avail', label: '稼働率' }, { value: 'pareto', label: 'パレート図' }] as const;

export default function ReliabilityVisual() {
  const [tab, setTab] = useState<'avail' | 'pareto'>('avail');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'avail' ? <AvailabilityPart /> : <ParetoPart />}
    </div>
  );
}
