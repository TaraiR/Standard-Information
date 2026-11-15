'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Field, Segment, useValidated } from './ui';
import { breakEven, payback, roi } from './traces/strategy';

const num = (min: number, max: number) => (s: string): number | null => {
  const t = s.trim().replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const v = Number(t);
  return v >= min && v <= max ? v : null;
};
const r1 = (x: number) => Math.round(x * 10) / 10;

function BepPart() {
  const fixed = useValidated(300, String, num(1, 100000));
  const rate = useValidated(60, String, num(0, 95));
  const bep = breakEven(fixed.value, rate.value / 100);
  const steps = useMemo(() => [
    { stage: 0, message: `固定費 ${fixed.value} 万円（売上に関係なくかかる家賃・人件費など）と、変動費率 ${rate.value}%（売上に比例してかかる材料費などの割合）の会社で、損益分岐点を求めます。` },
    { stage: 1, message: `売上高から変動費を引いた残り（売上の ${100 - rate.value}%）で固定費をまかないます。この割合を限界利益率といいます。` },
    { stage: 2, message: `損益分岐点売上高 = 固定費 ÷ (1 − 変動費率) = ${fixed.value} ÷ (1 − ${rate.value / 100}) = ${fixed.value} ÷ ${r1((100 - rate.value) / 100 * 100) / 100} = ${r1(bep)} 万円。これを超える売上で黒字になります。` },
  ], [fixed.value, rate.value, bep]);
  const maxS = bep * 2;
  const X = (v: number) => 60 + (v / maxS) * 500;
  const Y = (v: number) => 230 - (v / maxS) * 200;
  return (
    <StepPlayer
      key={`${fixed.value}|${rate.value}`}
      title="損益分岐点"
      steps={steps}
      settings={
        <>
          <Field label="固定費(万円)" text={fixed.text} invalid={fixed.invalid} onChange={fixed.onChange} inputMode="decimal" width="5em" />
          <Field label="変動費率(%)" text={rate.text} invalid={rate.invalid} onChange={rate.onChange} inputMode="decimal" width="4em" />
        </>
      }
      renderVisual={s => (
        <svg className="viz-svg" viewBox="0 0 600 270" role="img" aria-label={`損益分岐点 ${r1(bep)} 万円`}>
          <line className="viz-line" x1={60} y1={230} x2={560} y2={230} />
          <line className="viz-line" x1={60} y1={30} x2={60} y2={230} />
          <text className="viz-label" x={560} y={252} textAnchor="end" style={{ fontSize: 13 }}>売上高 →</text>
          <line className="viz-line tone-range" x1={X(0)} y1={Y(0)} x2={X(maxS)} y2={Y(maxS)} strokeWidth={3} />
          <text className="viz-text tone-range" x={X(maxS) - 4} y={Y(maxS) + 18} textAnchor="end" style={{ fontSize: 14 }}>売上高</text>
          <line className="viz-line" x1={X(0)} y1={Y(fixed.value)} x2={X(maxS)} y2={Y(fixed.value)} strokeDasharray="5 5" />
          <text className="viz-label" x={X(maxS) - 4} y={Y(fixed.value) - 6} textAnchor="end" style={{ fontSize: 13 }}>固定費</text>
          {s.stage >= 1 && (
            <>
              <line className="viz-line tone-focus" x1={X(0)} y1={Y(fixed.value)} x2={X(maxS)} y2={Y(fixed.value + (rate.value / 100) * maxS)} strokeWidth={3} />
              <text className="viz-text tone-focus" x={X(maxS) - 4} y={Y(fixed.value + (rate.value / 100) * maxS) - 8} textAnchor="end" style={{ fontSize: 14 }}>総費用（固定費＋変動費）</text>
            </>
          )}
          {s.stage >= 2 && (
            <g>
              <line className="viz-line tone-done" x1={X(bep)} y1={Y(bep)} x2={X(bep)} y2={230} strokeDasharray="4 4" />
              <circle cx={X(bep)} cy={Y(bep)} r={8} style={{ fill: 'var(--viz-done)' }} />
              <text className="viz-text tone-done is-strong" x={X(bep)} y={248} textAnchor="middle" style={{ fontSize: 15 }}>{r1(bep)} 万円</text>
              <text className="viz-label" x={X(bep * 0.45)} y={Y(bep * 0.45) - 30} textAnchor="middle" style={{ fontSize: 13 }}>赤字</text>
              <text className="viz-label" x={X(bep * 1.6)} y={Y(bep * 1.6) + 26} textAnchor="middle" style={{ fontSize: 13 }}>黒字</text>
            </g>
          )}
        </svg>
      )}
      getMessage={s => s.message}
      getVars={s => [{ label: '損益分岐点売上高', value: s.stage >= 2 ? `${r1(bep)} 万円` : '—', tone: 'done' }]}
      footnote="売上高の線と総費用の線が交わる点が損益分岐点です。「固定費 ÷ 変動費率」ではないことに注意しましょう。"
    />
  );
}

function RoiPart() {
  const invest = useValidated(1000, String, num(1, 1e7));
  const gain = useValidated(200, String, num(0.1, 1e7));
  const running = useValidated(50, String, num(0, 1e7));
  const years = 5;
  const tco = invest.value + running.value * years;
  const steps = useMemo(() => [
    { message: `${invest.value} 万円でシステムを導入し、毎年 ${gain.value} 万円のコストを削減できる計画を評価します。` },
    { message: `ROI = 利益 ÷ 投資額 × 100 = ${gain.value} ÷ ${invest.value} × 100 = ${r1(roi(gain.value, invest.value))}%（1年あたり）。高いほど投資の効率が良いことを表します。` },
    { message: `投資回収期間 = 投資額 ÷ 年間の利益 = ${invest.value} ÷ ${gain.value} = ${r1(payback(invest.value, gain.value))} 年。この年数で元が取れます。` },
    { message: `ただし運用・保守に毎年 ${running.value} 万円かかります。${years}年間の TCO（総所有コスト）= 初期費用 ${invest.value} + 運用費 ${running.value} × ${years} = ${tco} 万円。購入費だけで比べると判断を誤るので、TCO で比べます。` },
  ], [invest.value, gain.value, running.value, tco]);
  return (
    <StepPlayer
      key={`${invest.value}|${gain.value}|${running.value}`}
      title="ROI・投資回収期間・TCO"
      steps={steps}
      settings={
        <>
          <Field label="投資額(万円)" text={invest.text} invalid={invest.invalid} onChange={invest.onChange} inputMode="decimal" width="5em" />
          <Field label="年間の削減額(万円)" text={gain.text} invalid={gain.invalid} onChange={gain.onChange} inputMode="decimal" width="5em" />
          <Field label="年間の運用費(万円)" text={running.text} invalid={running.invalid} onChange={running.onChange} inputMode="decimal" width="5em" />
        </>
      }
      renderVisual={(_, i) => (
        <ol className="viz-work">
          <li className={i === 1 ? 'is-current' : i < 1 ? 'is-pending' : undefined}><span>ROI</span><span className="viz-big">{i >= 1 ? `${r1(roi(gain.value, invest.value))}%` : '—'}</span></li>
          <li className={i === 2 ? 'is-current' : i < 2 ? 'is-pending' : undefined}><span>回収期間</span><span className="viz-big">{i >= 2 ? `${r1(payback(invest.value, gain.value))} 年` : '—'}</span></li>
          <li className={i === 3 ? 'is-current' : 'is-pending'}><span>{years}年間の TCO</span><span className="viz-big">{i >= 3 ? `${tco} 万円` : '—'}</span></li>
        </ol>
      )}
      getMessage={s => s.message}
    />
  );
}

const TABS = [{ value: 'bep', label: '損益分岐点' }, { value: 'roi', label: 'ROI・TCO' }] as const;

export default function FinanceVisual() {
  const [tab, setTab] = useState<'bep' | 'roi'>('bep');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'bep' ? <BepPart /> : <RoiPart />}
    </div>
  );
}
