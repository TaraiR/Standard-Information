'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Field, Segment, SequenceDiagram, useValidated } from './ui';
import { allowedDowntimeMinutes } from './traces/devmgmt';

const FLOW = [
  { from: 'user', to: 'desk', label: '「メールが送れない」', message: '利用者が、単一の窓口であるサービスデスクに連絡します。' },
  { from: 'desk', to: 'incident', label: 'インシデントとして記録', message: 'サービスデスクは、通常のサービスを妨げる出来事を「インシデント」として記録します。' },
  { from: 'incident', to: 'user', label: '回避策で一時復旧', tone: 'done' as const, message: 'インシデント管理の目的は、とにかく早くサービスを元に戻すことです。メールサーバを再起動して、ひとまず使えるようにしました（根本原因はまだ不明）。' },
  { from: 'incident', to: 'problem', label: '同じ障害が繰り返し発生', tone: 'focus' as const, message: '同じ障害が何度も起きているので、問題管理に引き継ぎます。' },
  { from: 'problem', to: 'problem', label: '根本原因を調査', tone: 'muted' as const, message: '問題管理の目的は、根本原因を突き止めて再発を防ぐことです。調査の結果、ディスク容量不足が原因と分かりました。' },
  { from: 'problem', to: 'change', label: '恒久対策の変更要求', message: 'ディスクを増設する変更を、変更管理に依頼します。' },
  { from: 'change', to: 'change', label: '影響を評価して承認', tone: 'muted' as const, message: '変更管理では、変更のリスクと影響を評価し、承認されてから、計画どおり安全に実施します。実施後は構成管理（CMDB）の情報も更新します。' },
  { from: 'change', to: 'user', label: '再発しなくなった', tone: 'done' as const, message: '恒久対策で、同じ障害は起きなくなりました。インシデント管理（早期回復）と問題管理（根本原因の除去）の目的の違いが試験でよく問われます。' },
];

function FlowPart() {
  const steps = [{ shown: 0, message: 'IT サービスで障害が起きたときの、ITIL に基づく管理の流れを見ていきます。' }, ...FLOW.map((m, i) => ({ shown: i + 1, message: m.message }))];
  return (
    <StepPlayer
      title="インシデント管理・問題管理・変更管理"
      steps={steps}
      renderVisual={s => (
        <SequenceDiagram shown={s.shown} messages={FLOW} width={720}
          actors={[
            { id: 'user', label: '利用者' }, { id: 'desk', label: 'サービス', sub: 'デスク' },
            { id: 'incident', label: 'インシデント', sub: '管理' }, { id: 'problem', label: '問題管理' }, { id: 'change', label: '変更管理' },
          ]} />
      )}
      getMessage={s => s.message}
    />
  );
}

const pct = (s: string): number | null => (/^\d{1,2}(\.\d{1,3})?$|^100$/.test(s.trim()) && Number(s) >= 90 ? Number(s) : null);

function SlaPart() {
  const p = useValidated(99.9, String, pct);
  const minutes = allowedDowntimeMinutes(p.value);
  const steps = useMemo(() => [
    { message: `SLA（サービスレベル合意書）で「月間稼働率 ${p.value}% 以上」と約束した場合に、1か月（30日）で何分まで止まってよいかを計算します。` },
    { message: `30日は 30 × 24 × 60 = 43,200 分です。止まってよい割合は 100 − ${p.value} = ${Math.round((100 - p.value) * 1000) / 1000}% です。` },
    { message: `43,200 × ${Math.round((100 - p.value) * 1000) / 1000}% = ${minutes} 分。これを超えて止まると SLA 違反です。稼働率の「9」が1つ増えるごとに、許される停止時間は 1/10 になります。` },
  ], [p.value, minutes]);
  return (
    <StepPlayer
      key={p.value}
      title="SLA の稼働率と、許される停止時間"
      steps={steps}
      settings={
        <>
          <Field label="稼働率(%)" text={p.text} invalid={p.invalid} onChange={p.onChange} inputMode="decimal" width="5em" hint="90〜100" />
          <div className="viz-presets">
            {[99, 99.9, 99.99].map(v => <button key={v} type="button" className="viz-mini-btn" onClick={() => p.set(v)}>{v}%</button>)}
          </div>
        </>
      }
      renderVisual={(_, i) => (
        <ol className="viz-work">
          <li className={i === 1 ? 'is-current' : i < 1 ? 'is-pending' : undefined}><span>30日間</span><span className="viz-mono">43,200 分</span></li>
          <li className={i === 2 ? 'is-current' : 'is-pending'}><span>停止してよい</span><span className="viz-big">{i >= 2 ? `${minutes} 分（約 ${Math.round((minutes / 60) * 10) / 10} 時間）` : '—'}</span></li>
        </ol>
      )}
      getMessage={s => s.message}
      footnote="SLA は、サービスの提供者と利用者が、稼働率や障害時の対応時間などの品質の水準を合意した文書です。"
    />
  );
}

const TABS = [{ value: 'flow', label: '管理の流れ' }, { value: 'sla', label: 'SLA の計算' }] as const;

export default function ItsmVisual() {
  const [tab, setTab] = useState<'flow' | 'sla'>('flow');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'flow' ? <FlowPart /> : <SlaPart />}
    </div>
  );
}
