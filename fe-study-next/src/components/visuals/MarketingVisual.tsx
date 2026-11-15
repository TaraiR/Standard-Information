'use client';

import { useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment } from './ui';

const PHASES = [
  { name: '導入期', from: 0, to: 0.2, sales: '少ない', profit: '赤字', strategy: '広告で製品を知ってもらい、市場を開拓する', ppm: '問題児' },
  { name: '成長期', from: 0.2, to: 0.45, sales: '急増', profit: '黒字化・増加', strategy: '競合が参入してくるので、シェア拡大と差別化を図る', ppm: '花形' },
  { name: '成熟期', from: 0.45, to: 0.75, sales: 'ピーク', profit: '最大から減少へ', strategy: '競争が激しくなるので、コスト削減とブランド維持に努める', ppm: '金のなる木' },
  { name: '衰退期', from: 0.75, to: 1, sales: '減少', profit: '減少', strategy: '撤退や新製品への移行を検討する', ppm: '負け犬' },
];
const W = 520;
const X0 = 50;
const sales = (t: number) => Math.exp(-((t - 0.6) ** 2) / 0.06); // 0〜1 の釣り鐘型
const profit = (t: number) => 1.15 * Math.exp(-((t - 0.55) ** 2) / 0.05) - 0.25;
const path = (f: (t: number) => number, upTo: number) =>
  Array.from({ length: 101 }, (_, i) => i / 100).filter(t => t <= upTo).map((t, i) => `${i ? 'L' : 'M'}${X0 + t * W},${200 - f(t) * 150}`).join(' ');

function PlcPart() {
  const steps = [
    { p: -1, message: 'プロダクトライフサイクルは、製品が市場に出てから撤退するまでの売上と利益の変化を、4つの時期に分けて考えるものです。' },
    ...PHASES.map((ph, i) => ({ p: i, message: `${ph.name}: 売上は${ph.sales}、利益は${ph.profit}。戦略は「${ph.strategy}」。PPM では「${ph.ppm}」に当たることが多い時期です。` })),
  ];
  return (
    <StepPlayer
      title="プロダクトライフサイクル"
      steps={steps}
      renderVisual={s => {
        const upTo = s.p < 0 ? 0 : PHASES[s.p].to;
        return (
          <svg className="viz-svg" viewBox="0 0 600 260" role="img" aria-label="売上と利益の推移">
            <line className="viz-line" x1={X0} y1={200} x2={X0 + W} y2={200} />
            <line className="viz-line" x1={X0} y1={20} x2={X0} y2={240} />
            {PHASES.map((ph, i) => (
              <g key={ph.name}>
                <rect className={`viz-box${i === s.p ? ' tone-focus' : ''}`} x={X0 + ph.from * W} y={20} width={(ph.to - ph.from) * W} height={220} style={{ opacity: i === s.p ? 0.35 : 0.12 }} />
                <text className={`viz-label${i === s.p ? ' tone-focus' : ''}`} x={X0 + ((ph.from + ph.to) / 2) * W} y={256} textAnchor="middle" style={{ fontSize: 15 }}>{ph.name}</text>
              </g>
            ))}
            <path className="viz-line tone-range" d={path(sales, upTo)} strokeWidth={4} fill="none" />
            <path className="viz-line tone-done" d={path(profit, upTo)} strokeWidth={4} strokeDasharray="8 5" fill="none" />
            <text className="viz-text tone-range is-strong" x={X0 + 10} y={36} style={{ fontSize: 15 }}>━ 売上</text>
            <text className="viz-text tone-done is-strong" x={X0 + 90} y={36} style={{ fontSize: 15 }}>┅ 利益</text>
            <text className="viz-label" x={X0 + W - 4} y={194} textAnchor="end" style={{ fontSize: 13 }}>時間 →</text>
          </svg>
        );
      }}
      getMessage={s => s.message}
      footnote="利益が 0 の線（横軸）より下は赤字です。導入期は広告費などがかさむため、売上があっても赤字になりがちです。"
    />
  );
}

const STP = [
  { key: 'S', name: 'セグメンテーション', text: '市場を年齢・地域・ニーズなどで細かく分ける', ex: '「20代・都市部・健康志向」などのグループに分ける' },
  { key: 'T', name: 'ターゲティング', text: 'どのグループを狙うかを決める', ex: '「都市部の20代の健康志向の人」に絞る' },
  { key: 'P', name: 'ポジショニング', text: '競合と比べた自社の立ち位置を決める', ex: '「手軽に買える高品質な健康ドリンク」として差別化' },
];
const FOUR_P = [
  { p: 'Product（製品）', c: 'Customer Value（顧客価値）', ex: '低糖・高たんぱくのドリンク' },
  { p: 'Price（価格）', c: 'Cost（顧客の負担）', ex: '1本 200円' },
  { p: 'Place（流通）', c: 'Convenience（利便性）', ex: '駅のコンビニと EC で販売' },
  { p: 'Promotion（販売促進）', c: 'Communication（対話）', ex: 'SNS でトレーナーと協力して宣伝' },
];

function StpPart() {
  const steps = [
    { n: 0, message: 'マーケティング戦略は、STP で「誰に・どんな立ち位置で売るか」を決め、4P で「具体的にどう売るか」を組み立てます。健康ドリンクを例に見ていきます。' },
    ...STP.map((x, i) => ({ n: i + 1, message: `${x.key}: ${x.name} — ${x.text}。例: ${x.ex}。` })),
    ...FOUR_P.map((x, i) => ({ n: STP.length + i + 1, message: `4P の ${x.p}: ${x.ex}。顧客の視点（4C）で見ると ${x.c} に当たります。` })),
  ];
  return (
    <StepPlayer
      title="STP と 4P（マーケティング戦略）"
      steps={steps}
      renderVisual={s => (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {STP.map((x, i) => (
              <div key={x.key} className={`viz-var tone-${s.n === i + 1 ? 'focus' : s.n > i ? 'range' : 'plain'}`}>
                <dt>{x.key}: {x.name}</dt>
                <dd style={{ fontSize: '0.8rem', fontWeight: 400 }}>{s.n > i ? x.ex : '—'}</dd>
              </div>
            ))}
          </div>
          <div className="viz-table-wrap">
            <table className="viz-table">
              <thead><tr><th>4P（企業の視点）</th><th>例</th><th>4C（顧客の視点）</th></tr></thead>
              <tbody>
                {FOUR_P.map((x, i) => {
                  const shown = s.n > STP.length + i;
                  return (
                    <tr key={x.p} className={s.n === STP.length + i + 1 ? 'is-active' : undefined}>
                      <td>{x.p}</td><td>{shown ? x.ex : ''}</td><td>{shown ? x.c : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      getMessage={s => s.message}
      footnote="STP は S → T → P の順番で行います。4P と 4C は同じ要素を、企業と顧客の立場から見たものです。"
    />
  );
}

const TABS = [{ value: 'plc', label: 'プロダクトライフサイクル' }, { value: 'stp', label: 'STP と 4P' }] as const;

export default function MarketingVisual() {
  const [tab, setTab] = useState<'plc' | 'stp'>('plc');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'plc' ? <PlcPart /> : <StpPart />}
    </div>
  );
}
