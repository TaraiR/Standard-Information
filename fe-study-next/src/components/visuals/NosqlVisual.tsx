'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment, UnitBox } from './ui';
import { capScenario, type CapChoice, type CapStep } from './traces/dbDesign';

const CHOICES = [{ value: 'cp', label: '一貫性を優先（CP）' }, { value: 'ap', label: '可用性を優先（AP）' }] as const;

function CapPart() {
  const [choice, setChoice] = useState<CapChoice>('ap');
  const steps = useMemo(() => capScenario(choice), [choice]);
  return (
    <StepPlayer
      key={choice}
      title="CAP 定理（ネットワーク分断が起きたら）"
      steps={steps}
      settings={<Segment label="優先するもの" options={CHOICES} value={choice} onChange={setChoice} />}
      renderVisual={(s: CapStep) => (
        <svg className="viz-svg" viewBox="0 0 600 230" role="img" aria-label={`ノード1 ${s.n1}、ノード2 ${s.n2}`}>
          <line className={`viz-line${s.partition ? ' tone-focus' : ' tone-range'}`} x1={200} y1={80} x2={400} y2={80} strokeDasharray={s.partition ? '6 6' : undefined} strokeWidth={3} />
          {s.partition && <text className="viz-text is-strong tone-focus" x={300} y={70} textAnchor="middle" style={{ fontSize: 26 }}>✕ 分断</text>}
          <UnitBox x={40} y={40} w={160} h={80} title="ノード1" sub={`在庫 ${s.n1}`} active tone={s.write ? 'focus' : 'range'} />
          <UnitBox x={400} y={40} w={160} h={80} title="ノード2" sub={`在庫 ${s.n2}`} active tone={s.read ? (s.read.includes('エラー') ? 'focus' : s.n1 !== s.n2 ? 'focus' : 'done') : s.n1 === s.n2 ? 'done' : 'range'} />
          <text className="viz-text" x={120} y={160} textAnchor="middle" style={{ fontSize: 17 }}>{s.write}</text>
          <text className="viz-text" x={480} y={160} textAnchor="middle" style={{ fontSize: 17 }}>{s.read}</text>
          <text className="viz-label" x={300} y={210} textAnchor="middle">{s.n1 === s.n2 ? '2台の値は一致しています' : '2台の値が食い違っています'}</text>
        </svg>
      )}
      getMessage={s => s.message}
      footnote="CAP 定理: 分散システムは 一貫性（C）・可用性（A）・分断耐性（P）の3つを同時には満たせません。分断は避けられないので、実際には C と A のどちらを優先するかを選びます。"
    />
  );
}

const TYPES = [
  { name: 'キーバリュー型', ex: 'Redis・DynamoDB', use: 'セッション・キャッシュ', sample: 'user:42 → "ログイン中"' },
  { name: 'ドキュメント型', ex: 'MongoDB', use: 'Web アプリ（項目が変わりやすいデータ）', sample: '{ "name": "田中", "tags": ["FE", "SQL"] }' },
  { name: 'カラム（列）型', ex: 'Cassandra・HBase', use: '大量データの集計・分析', sample: '列ごとにまとめて保存: 年齢 = [34, 28, 41, …]' },
  { name: 'グラフ型', ex: 'Neo4j', use: 'SNS のつながり・おすすめ', sample: '(田中) -[フォロー]-> (鈴木)' },
];

function TypesPart() {
  const steps = [
    { i: -1, message: 'NoSQL は、表形式の RDB 以外のデータベースの総称です。データの持ち方で主に4種類に分かれます。' },
    ...TYPES.map((t, i) => ({ i, message: `${t.name}（例: ${t.ex}）: ${t.use}に向いています。データの例: ${t.sample}` })),
    { i: 4, message: '複雑な結合やトランザクションが重要なら RDB、大量データを速く読み書きしたい・項目が頻繁に変わるなら NoSQL、と使い分けます。' },
  ];
  return (
    <StepPlayer
      title="NoSQL の4種類"
      steps={steps}
      renderVisual={s => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          {TYPES.map((t, i) => (
            <div key={t.name} className={`viz-panel`} style={{ borderColor: s.i === i ? 'var(--viz-focus)' : undefined, opacity: s.i >= i || s.i === 4 ? 1 : 0.35 }}>
              <h5 style={{ color: s.i === i ? 'var(--viz-focus)' : undefined }}>{t.name}</h5>
              <code className="viz-mono" style={{ fontSize: '0.8rem' }}>{t.sample}</code>
            </div>
          ))}
        </div>
      )}
      getMessage={s => s.message}
    />
  );
}

const TABS = [{ value: 'cap', label: 'CAP 定理' }, { value: 'types', label: 'NoSQL の種類' }] as const;

export default function NosqlVisual() {
  const [tab, setTab] = useState<'cap' | 'types'>('cap');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'cap' ? <CapPart /> : <TypesPart />}
    </div>
  );
}
