'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment } from './ui';
import {
  CIA_CASES, CIA_LABEL, CIA_MEANS, RESPONSE_NOTE, RISK_CASES, riskResponse, type Cia, type RiskResponse,
} from './traces/security';

function CiaPart() {
  const steps = useMemo(() => [
    { i: -1, message: '情報セキュリティの3要素（CIA）は、機密性・完全性・可用性です。事件の例が、どの要素を損なうものかを考えてみましょう。' },
    ...CIA_CASES.map((c, i) => ({ i, message: `「${c.text}」→ ${CIA_LABEL[c.answer]}。${c.why}守る手段は ${CIA_MEANS[c.answer]} です。` })),
  ], []);
  return (
    <StepPlayer
      title="CIA（機密性・完全性・可用性）"
      steps={steps}
      renderVisual={s => {
        const c = s.i >= 0 ? CIA_CASES[s.i] : null;
        return (
          <div>
            <p className="viz-big" style={{ fontSize: '1.15rem', minHeight: '2.4em', margin: '0 0 10px' }}>
              {c ? `事例: ${c.text}` : '事例を順に見ていきます'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {(['C', 'I', 'A'] as Cia[]).map(k => (
                <div key={k} className={`viz-var tone-${c?.answer === k ? 'focus' : 'plain'}`}>
                  <dt>{k === 'C' ? 'Confidentiality' : k === 'I' ? 'Integrity' : 'Availability'}</dt>
                  <dd>{CIA_LABEL[k]}</dd>
                  <dt style={{ marginTop: 4 }}>{CIA_MEANS[k]}</dt>
                </div>
              ))}
            </div>
          </div>
        );
      }}
      getMessage={s => s.message}
      legend={[{ tone: 'focus', label: 'この事例で損なわれた要素' }]}
      footnote="さらに真正性・責任追跡性・否認防止を加えて6要素とすることもあります。"
    />
  );
}

const QUAD: { p: 'high' | 'low'; i: 'high' | 'low'; x: number; y: number }[] = [
  { p: 'low', i: 'high', x: 90, y: 40 }, { p: 'high', i: 'high', x: 330, y: 40 },
  { p: 'low', i: 'low', x: 90, y: 190 }, { p: 'high', i: 'low', x: 330, y: 190 },
];

function RiskPart() {
  const steps = useMemo(() => [
    { i: -1, message: 'リスクは「発生確率」と「影響度」の大きさで評価し、組み合わせに応じて4種類の対応から選びます。' },
    ...RISK_CASES.map((c, i) => {
      const r = riskResponse(c.probability, c.impact);
      return {
        i,
        message: `「${c.text}」→ 発生確率${c.probability === 'high' ? '高' : '低'}・影響度${c.impact === 'high' ? '大' : '小'}なので「リスク${r}」。${RESPONSE_NOTE[r]}。例: ${c.action}。`,
      };
    }),
  ], []);
  return (
    <StepPlayer
      title="リスク対応の4種類（回避・低減・移転・受容）"
      steps={steps}
      renderVisual={s => {
        const c = s.i >= 0 ? RISK_CASES[s.i] : null;
        return (
          <svg className="viz-svg" viewBox="0 0 600 360" role="img" aria-label="発生確率と影響度のリスクマトリクス">
            <text className="viz-label" x={330} y={352} textAnchor="middle">発生確率 →（低 / 高）</text>
            <text className="viz-label" x={22} y={180} textAnchor="middle" transform="rotate(-90 22 180)">影響度 →（小 / 大）</text>
            {QUAD.map(q => {
              const r: RiskResponse = riskResponse(q.p, q.i);
              const hit = c && c.probability === q.p && c.impact === q.i;
              const shown = s.i >= RISK_CASES.findIndex(rc => rc.probability === q.p && rc.impact === q.i);
              return (
                <g key={`${q.p}${q.i}`}>
                  <rect className={`viz-box${hit ? ' tone-focus' : shown ? ' tone-range' : ''}`} x={q.x - 40} y={q.y} width={230} height={140} rx={12} />
                  <text className="viz-text is-strong" x={q.x + 75} y={q.y + 60} textAnchor="middle" style={{ fontSize: 26 }}>
                    {shown ? `リスク${r}` : '？'}
                  </text>
                  {shown && <text className="viz-label" x={q.x + 75} y={q.y + 96} textAnchor="middle" style={{ fontSize: 14 }}>{RESPONSE_NOTE[r].slice(0, 16)}</text>}
                </g>
              );
            })}
          </svg>
        );
      }}
      getMessage={s => s.message}
      legend={[{ tone: 'focus', label: 'いまの事例' }, { tone: 'range', label: '確認済み' }]}
      footnote="試験では「保険に加入する = 移転」「パッチを適用する = 低減」「業務をやめる = 回避」の対応がよく問われます。"
    />
  );
}

const TABS = [{ value: 'cia', label: 'CIA の3要素' }, { value: 'risk', label: 'リスク対応' }] as const;

export default function SecurityVisual() {
  const [tab, setTab] = useState<'cia' | 'risk'>('cia');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'cia' ? <CiaPart /> : <RiskPart />}
    </div>
  );
}
