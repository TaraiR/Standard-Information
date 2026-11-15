'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Field, Segment, useValidated } from './ui';
import { intInRange } from './bits';
import { abc, LP_EXAMPLE, lpVertices, reorderPoint } from './traces/strategy';

// 例題は固定なので、頂点と最適解はモジュールの読み込み時に一度だけ計算する
const lp = LP_EXAMPLE;
const Z = (p: { x: number; y: number }) => lp.profit[0] * p.x + lp.profit[1] * p.y;
const vs = lpVertices(lp);
const best = vs.reduce((a, p) => (Z(p) > Z(a) ? p : a));
/** 多角形として塗るため、原点から見た角度の順に並べる */
const order = [...vs].sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));

function LpPart() {
  const steps = [
    { stage: 0, message: '製品A（利益3万円・材料2kg・工数3時間）と製品B（利益5万円・材料4kg・工数2時間）を作ります。材料は20kg、工数は18時間までです。A を x 個、B を y 個作るとき、利益 3x + 5y を最大にします。' },
    { stage: 1, message: '材料の制約 2x + 4y ≦ 20 を満たすのは、直線 2x + 4y = 20 より下側です。' },
    { stage: 2, message: '工数の制約 3x + 2y ≦ 18 を満たすのは、直線 3x + 2y = 18 より下側です。両方を満たす色の付いた範囲が「実行可能領域」です。' },
    { stage: 3, message: `最適解は実行可能領域の頂点のどれかにあります。各頂点で利益を計算すると、${vs.filter(p => p.x || p.y).map(p => `(${p.x}, ${p.y}) → ${Z(p)}`).join('、')}。` },
    { stage: 4, message: `最大は (${best.x}, ${best.y}) の ${Z(best)} 万円です。製品A を ${best.x} 個、製品B を ${best.y} 個作ると利益が最大になります。` },
  ];
  const X = (x: number) => 60 + x * 45;
  const Y = (y: number) => 260 - y * 36;
  return (
    <StepPlayer
      title="線形計画法（グラフ法）"
      steps={steps}
      renderVisual={s => (
        <svg className="viz-svg" viewBox="0 0 520 290" role="img" aria-label="実行可能領域">
          <line className="viz-line" x1={X(0)} y1={Y(0)} x2={X(10)} y2={Y(0)} />
          <line className="viz-line" x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(6.6)} />
          <text className="viz-label" x={X(10)} y={Y(0) + 22} textAnchor="end" style={{ fontSize: 14 }}>A の個数 x →</text>
          <text className="viz-label" x={X(0) + 8} y={Y(6.6) + 4} style={{ fontSize: 14 }}>B の個数 y</text>
          {Array.from({ length: 11 }, (_, i) => <text key={i} className="viz-label" x={X(i)} y={Y(0) + 18} textAnchor="middle" style={{ fontSize: 11 }}>{i}</text>)}
          {s.stage >= 2 && <polygon points={order.map(p => `${X(p.x)},${Y(p.y)}`).join(' ')} style={{ fill: 'var(--viz-range-bg)', stroke: 'none' }} />}
          {s.stage >= 1 && <line className="viz-line tone-range" x1={X(0)} y1={Y(5)} x2={X(10)} y2={Y(0)} strokeWidth={3} />}
          {s.stage >= 1 && <text className="viz-text tone-range" x={X(7.4)} y={Y(1.6)} style={{ fontSize: 14 }}>2x+4y=20</text>}
          {s.stage >= 2 && <line className="viz-line tone-focus" x1={X(0)} y1={Y(9)} x2={X(6)} y2={Y(0)} strokeWidth={3} />}
          {s.stage >= 2 && <text className="viz-text tone-focus" x={X(2.3)} y={Y(6)} style={{ fontSize: 14 }}>3x+2y=18</text>}
          {s.stage >= 3 && vs.map(p => (
            <g key={`${p.x},${p.y}`}>
              <circle cx={X(p.x)} cy={Y(p.y)} r={s.stage >= 4 && p === best ? 10 : 6} style={{ fill: s.stage >= 4 && p === best ? 'var(--viz-done)' : 'var(--text)' }} />
              <text className={`viz-text${s.stage >= 4 && p === best ? ' tone-done is-strong' : ''}`} x={X(p.x) + 10} y={Y(p.y) - 10} style={{ fontSize: 14 }}>
                ({p.x},{p.y}) 利益{Z(p)}
              </text>
            </g>
          ))}
        </svg>
      )}
      getMessage={s => s.message}
      footnote="y 軸は工数の直線が 9 まで伸びますが、材料の制約で y は 5 までに制限されます。"
    />
  );
}

function AbcPart() {
  const rows = useMemo(() => abc(), []);
  const steps = [
    { n: 0, message: '商品を売上の多い順に並べ、売上の累積構成比で A・B・C の3つに分けます。ここでは累積 80% までを A、95% までを B、残りを C とします。' },
    ...rows.map((r, i) => ({ n: i + 1, message: `${i + 1}位 ${r.name}（${r.sales}万円）までの累積は ${r.percent}% → ${r.rank} ランク。` })),
    { n: rows.length, message: `A ランクは ${rows.filter(r => r.rank === 'A').length} 品目（全${rows.length}品目）だけで、売上の大部分を占めています。A を重点的に管理し、C は管理の手間を減らします（パレートの法則）。` },
  ];
  return (
    <StepPlayer
      title="ABC 分析"
      steps={steps}
      renderVisual={s => (
        <div className="viz-table-wrap">
          <table className="viz-table">
            <thead><tr><th>順位</th><th>商品</th><th>売上</th><th>累積構成比</th><th>ランク</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name} className={i === s.n - 1 ? 'is-active' : undefined} style={{ opacity: i < s.n ? 1 : 0.3 }}>
                  <td>{i + 1}</td><td>{r.name}</td><td>{r.sales}</td>
                  <td>{i < s.n ? `${r.percent}%` : ''}</td>
                  <td style={{ fontWeight: 700, color: `var(--viz-${r.rank === 'A' ? 'focus' : r.rank === 'B' ? 'range' : 'muted'})` }}>{i < s.n ? r.rank : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      getMessage={s => s.message}
      footnote="境目（70%・90% とすることもある）は問題文の指定に従います。"
    />
  );
}

function ReorderPart() {
  const daily = useValidated(10, String, intInRange(1, 10000));
  const lead = useValidated(3, String, intInRange(1, 365));
  const safety = useValidated(20, String, intInRange(0, 100000));
  const rop = reorderPoint(daily.value, lead.value, safety.value);
  const steps = [
    { message: '在庫が「発注点」まで減ったら発注します。発注してから届くまで（リードタイム）の間も売れ続けるので、その分を見込んでおく必要があります。' },
    { message: `リードタイム中の需要量 = 1日の平均需要 ${daily.value} 個 × リードタイム ${lead.value} 日 = ${daily.value * lead.value} 個。` },
    { message: `需要の変動や配送の遅れに備えて、安全在庫 ${safety.value} 個を足します。発注点 = ${daily.value * lead.value} + ${safety.value} = ${rop} 個。在庫が ${rop} 個になったら発注します。` },
  ];
  return (
    <StepPlayer
      key={`${daily.value}|${lead.value}|${safety.value}`}
      title="発注点（定量発注方式）"
      steps={steps}
      settings={
        <>
          <Field label="1日の需要(個)" text={daily.text} invalid={daily.invalid} onChange={daily.onChange} width="4em" />
          <Field label="リードタイム(日)" text={lead.text} invalid={lead.invalid} onChange={lead.onChange} width="3.5em" />
          <Field label="安全在庫(個)" text={safety.text} invalid={safety.invalid} onChange={safety.onChange} width="4em" />
        </>
      }
      renderVisual={(_, i) => (
        <ol className="viz-work">
          <li className={i === 1 ? 'is-current' : i < 1 ? 'is-pending' : undefined}><span>リードタイム中の需要</span><span className="viz-big">{i >= 1 ? `${daily.value * lead.value} 個` : '—'}</span></li>
          <li className={i === 2 ? 'is-current' : 'is-pending'}><span>発注点</span><span className="viz-big">{i >= 2 ? `${rop} 個` : '—'}</span></li>
        </ol>
      )}
      getMessage={s => s.message}
    />
  );
}

const TABS = [{ value: 'lp', label: '線形計画法' }, { value: 'abc', label: 'ABC 分析' }, { value: 'rop', label: '発注点' }] as const;

export default function OrIeVisual() {
  const [tab, setTab] = useState<'lp' | 'abc' | 'rop'>('lp');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'lp' ? <LpPart /> : tab === 'abc' ? <AbcPart /> : <ReorderPart />}
    </div>
  );
}
