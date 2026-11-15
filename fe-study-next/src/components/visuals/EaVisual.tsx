'use client';

import { useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment, SequenceDiagram } from './ui';

const PROCURE = [
  { from: 'buyer', to: 'vendor', label: 'RFI（情報提供依頼書）', message: 'まず RFI で、どんな製品・技術があるかの情報提供をベンダーに依頼します（情報収集の段階）。' },
  { from: 'vendor', to: 'buyer', label: '製品・技術の情報', tone: 'muted' as const, message: 'ベンダーが、自社の製品や技術の情報を提供します。' },
  { from: 'buyer', to: 'vendor', label: 'RFP（提案依頼書）', tone: 'focus' as const, message: '集めた情報をもとに要件を固め、RFP で具体的な提案と見積もりを依頼します。順番は RFI が先、RFP が後です。' },
  { from: 'vendor', to: 'buyer', label: '提案書・見積書', message: '各ベンダーが提案書と見積書を出します。' },
  { from: 'buyer', to: 'buyer', label: '評価して選定', tone: 'muted' as const, message: '発注者は、あらかじめ決めた評価基準で提案を比べ、ベンダーを選びます。' },
  { from: 'buyer', to: 'vendor', label: '契約・SLA の締結', tone: 'done' as const, message: '契約を結び、稼働率などのサービス品質を SLA で合意して、サービスの提供が始まります。' },
];

function ProcurePart() {
  const steps = [{ shown: 0, message: '情報システムを外部のベンダーから調達するときの流れです。' }, ...PROCURE.map((m, i) => ({ shown: i + 1, message: m.message }))];
  return (
    <StepPlayer
      title="システム調達の流れ（RFI → RFP → 契約）"
      steps={steps}
      renderVisual={s => (
        <SequenceDiagram shown={s.shown} messages={PROCURE} width={540}
          actors={[{ id: 'buyer', label: '発注者' }, { id: 'vendor', label: 'ベンダー' }]} />
      )}
      getMessage={s => s.message}
    />
  );
}

const SYSTEMS = [
  { name: 'ERP', full: '統合基幹業務システム', task: '会計・人事・在庫・生産・販売のデータを1つのデータベースでまとめて管理したい' },
  { name: 'CRM', full: '顧客関係管理', task: '顧客ごとの購入履歴や問い合わせ履歴を管理して、リピーターを増やしたい' },
  { name: 'SFA', full: '営業支援システム', task: '営業担当の訪問記録や商談の進み具合を共有して、営業の効率を上げたい' },
  { name: 'SCM', full: 'サプライチェーン管理', task: '調達・生産・在庫・配送の流れ全体を最適化して、在庫を減らしたい' },
];

function SystemsPart() {
  const steps = [
    { n: 0, message: '企業の課題に応じて、使う業務システムが変わります。課題を読んで、どのシステムが合うかを考えてみましょう。' },
    ...SYSTEMS.map((s, i) => ({ n: i + 1, message: `「${s.task}」→ ${s.name}（${s.full}）です。` })),
  ];
  return (
    <StepPlayer
      title="業務システムの使い分け（ERP・CRM・SFA・SCM）"
      steps={steps}
      renderVisual={s => (
        <div className="viz-table-wrap">
          <table className="viz-table">
            <thead><tr><th>課題</th><th>システム</th></tr></thead>
            <tbody>
              {SYSTEMS.map((sys, i) => (
                <tr key={sys.name} className={i === s.n - 1 ? 'is-active' : undefined}>
                  <td className="is-left">{sys.task}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{i < s.n ? <><b>{sys.name}</b><br /><small>{sys.full}</small></> : '？'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      getMessage={s => s.message}
      footnote="エンタープライズアーキテクチャ（EA）では、業務・データ・アプリケーション・技術の4層で、現状（As-Is）と理想（To-Be）を整理します。"
    />
  );
}

const TABS = [{ value: 'procure', label: 'システム調達' }, { value: 'systems', label: '業務システム' }] as const;

export default function EaVisual() {
  const [tab, setTab] = useState<'procure' | 'systems'>('procure');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'procure' ? <ProcurePart /> : <SystemsPart />}
    </div>
  );
}
