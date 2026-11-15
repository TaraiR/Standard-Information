'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment } from './ui';
import { BUSINESSES, GROWTH_LINE, PPM_NOTE, ppmOf, SHARE_LINE, SWOT_ITEMS, SWOT_LABEL, swotOf, type Swot } from './traces/strategy';

function SwotPart() {
  const steps = useMemo(() => [
    { n: 0, message: 'SWOT 分析では、自社の内部環境（強み・弱み）と、自社ではどうにもできない外部環境（機会・脅威）を、プラス要因とマイナス要因に分けて整理します。' },
    ...SWOT_ITEMS.map((it, i) => {
      const k = swotOf(it.internal, it.positive);
      return { n: i + 1, message: `「${it.text}」は${it.internal ? '自社の内部' : '外部の環境'}の${it.positive ? 'プラス' : 'マイナス'}要因なので「${SWOT_LABEL[k]}（${k}）」です。` };
    }),
    { n: SWOT_ITEMS.length, message: '整理した後は、「強みを生かして機会をつかむ」「弱みを補って脅威を避ける」のように組み合わせて戦略を考えます（クロス SWOT）。' },
  ], []);
  const cells: { k: Swot; internal: boolean; positive: boolean }[] = [
    { k: 'S', internal: true, positive: true }, { k: 'W', internal: true, positive: false },
    { k: 'O', internal: false, positive: true }, { k: 'T', internal: false, positive: false },
  ];
  return (
    <StepPlayer
      title="SWOT 分析"
      steps={steps}
      renderVisual={s => (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 6, alignItems: 'stretch' }}>
          <span /><b className="viz-hint" style={{ textAlign: 'center' }}>プラス要因</b><b className="viz-hint" style={{ textAlign: 'center' }}>マイナス要因</b>
          {[true, false].map(internal => (
            <div key={String(internal)} style={{ display: 'contents' }}>
              <b className="viz-hint" style={{ writingMode: 'vertical-rl', textAlign: 'center' }}>{internal ? '内部環境' : '外部環境'}</b>
              {cells.filter(c => c.internal === internal).map(c => {
                const items = SWOT_ITEMS.slice(0, s.n).filter(i => swotOf(i.internal, i.positive) === c.k);
                const last = s.n > 0 && s.n <= SWOT_ITEMS.length && swotOf(SWOT_ITEMS[s.n - 1].internal, SWOT_ITEMS[s.n - 1].positive) === c.k;
                return (
                  <div key={c.k} className="viz-panel" style={{ minHeight: 110, borderColor: last ? 'var(--viz-focus)' : undefined }}>
                    <h5>{c.k}: {SWOT_LABEL[c.k]}</h5>
                    {items.map(i => <div key={i.text} style={{ fontSize: '0.85rem' }}>・{i.text}</div>)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      getMessage={s => s.message}
      footnote="外部環境の分析には PEST 分析（政治・経済・社会・技術）やファイブフォース分析も使います。"
    />
  );
}

function PpmPart() {
  const steps = useMemo(() => [
    { n: 0, message: `PPM では、事業を「市場成長率」（縦軸、${GROWTH_LINE}% を境目とします）と「相対的市場占有率」（横軸、${SHARE_LINE} を境目）で4つに分け、経営資源の配分を決めます。` },
    ...BUSINESSES.map((b, i) => {
      const q = ppmOf(b.growth, b.share);
      return { n: i + 1, message: `${b.name}: 成長率 ${b.growth}%・相対占有率 ${b.share} → 「${q}」。${PPM_NOTE[q]}` };
    }),
    { n: BUSINESSES.length, message: '典型的な資金の流れは、「金のなる木」で得た資金を「問題児」に投資して「花形」に育てることです。' },
  ], []);
  // 横軸は占有率が高いほど左（PPM の慣例）
  const X = (share: number) => 560 - (Math.min(share, 2.5) / 2.5) * 460;
  const Y = (g: number) => 260 - ((Math.max(-10, Math.min(g, 35)) + 10) / 45) * 220;
  return (
    <StepPlayer
      title="PPM（プロダクト・ポートフォリオ・マネジメント）"
      steps={steps}
      renderVisual={s => (
        <svg className="viz-svg" viewBox="0 0 600 300" role="img" aria-label="PPM の4象限">
          {(['花形', '問題児', '金のなる木', '負け犬'] as const).map((q, i) => {
            const left = i % 2 === 0;
            const top = i < 2;
            const x = left ? 100 : X(SHARE_LINE);
            const y = top ? 40 : Y(GROWTH_LINE);
            const w = left ? X(SHARE_LINE) - 100 : 560 - X(SHARE_LINE);
            const h = top ? Y(GROWTH_LINE) - 40 : 260 - Y(GROWTH_LINE);
            const hit = BUSINESSES.slice(0, s.n).some(b => ppmOf(b.growth, b.share) === q);
            return (
              <g key={q}>
                <rect className={`viz-box${hit ? ' tone-range' : ''}`} x={x} y={y} width={w} height={h} />
                <text className="viz-label" x={x + w / 2} y={y + 22} textAnchor="middle">{q}</text>
              </g>
            );
          })}
          <text className="viz-label" x={330} y={290} textAnchor="middle" style={{ fontSize: 14 }}>← 相対的市場占有率 高い　　　低い →</text>
          <text className="viz-label" x={40} y={150} textAnchor="middle" style={{ fontSize: 14 }} transform="rotate(-90 40 150)">市場成長率 →</text>
          {BUSINESSES.slice(0, s.n).map((b, i) => (
            <g key={b.name}>
              <circle cx={X(b.share)} cy={Y(b.growth)} r={i === s.n - 1 ? 12 : 9} style={{ fill: i === s.n - 1 ? 'var(--viz-focus)' : 'var(--viz-range)' }} />
              <text className="viz-text is-strong" x={X(b.share)} y={Y(b.growth) + 28} textAnchor="middle" style={{ fontSize: 15 }}>{b.name}</text>
            </g>
          ))}
        </svg>
      )}
      getMessage={s => s.message}
      footnote="花形: 成長率高・占有率高、金のなる木: 成長率低・占有率高、問題児: 成長率高・占有率低、負け犬: 成長率低・占有率低。"
    />
  );
}

const TABS = [{ value: 'swot', label: 'SWOT 分析' }, { value: 'ppm', label: 'PPM' }] as const;

export default function StrategyVisual() {
  const [tab, setTab] = useState<'swot' | 'ppm'>('swot');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'swot' ? <SwotPart /> : <PpmPart />}
    </div>
  );
}
