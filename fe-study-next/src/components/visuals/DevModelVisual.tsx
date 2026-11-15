'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment } from './ui';

type Model = 'waterfall' | 'scrum';
const MODELS = [{ value: 'waterfall', label: 'ウォーターフォール' }, { value: 'scrum', label: 'アジャイル（スクラム）' }] as const;
const WEEKS = 14;
const CHANGE_WEEK = 6;

/** 週ごとの作業と、その週の終わりに動くソフトがあるか */
interface Week { work: string; tone: 'range' | 'focus' | 'done' | 'muted'; release: boolean; note: string }

const WATERFALL: Week[] = [
  ...[1, 2].map(() => ({ work: '要件定義', tone: 'range' as const, release: false, note: '何を作るかをすべて決め、文書にまとめます。' })),
  ...[3, 4, 5].map(() => ({ work: '設計', tone: 'range' as const, release: false, note: '決めた要件をもとに、全体を設計します。' })),
  { work: '実装', tone: 'range', release: false, note: `${CHANGE_WEEK}週目、実装の途中で顧客から「この機能を変えたい」という要件変更が来ました。` },
  ...[7, 8].map(() => ({ work: '手戻り', tone: 'focus' as const, release: false, note: '前の工程（要件定義・設計）に戻って文書を直す「手戻り」が発生します。後の工程ほど手戻りのコストは大きくなります。' })),
  ...[9, 10, 11].map(() => ({ work: '実装', tone: 'range' as const, release: false, note: '実装を再開します。この時点でも、利用者が触れる動くソフトはまだありません。' })),
  ...[12, 13].map(() => ({ work: 'テスト', tone: 'range' as const, release: false, note: 'すべての実装が終わってから、まとめてテストします。' })),
  { work: 'リリース', tone: 'done', release: true, note: '14週目にやっと、初めて動くソフトを利用者に届けられました。' },
];

const SCRUM: Week[] = Array.from({ length: WEEKS }, (_, i) => {
  const w = i + 1;
  const sprint = Math.ceil(w / 2);
  const end = w % 2 === 0;
  if (w === CHANGE_WEEK) {
    return { work: `スプリント${sprint}`, tone: 'focus', release: true, note: `${CHANGE_WEEK}週目に要件変更が来ました。プロダクトバックログに追加して優先順位を付け直し、次のスプリントで取り組みます。進行中のスプリントはそのまま終えます。` };
  }
  return {
    work: `スプリント${sprint}`, tone: end ? 'done' : 'range', release: end,
    note: end
      ? `スプリント${sprint}の終わり。動く機能をレビューで見せ、振り返りをして次に生かします。${sprint === 4 ? '要件変更の内容も、このスプリントで反映されました。' : ''}`
      : `スプリント${sprint}（2週間）が始まりました。バックログの上から優先度の高い機能を作ります。毎日 15 分のデイリースクラムで進捗を共有します。`,
  };
});

export default function DevModelVisual() {
  const [model, setModel] = useState<Model>('waterfall');
  const weeks = model === 'waterfall' ? WATERFALL : SCRUM;
  const firstRelease = weeks.findIndex(w => w.release) + 1;
  const steps = useMemo(() => [
    { week: 0, message: `同じシステムを ${MODELS.find(m => m.value === model)!.label} で作り、${CHANGE_WEEK}週目に要件変更が入る場合を比べます。` },
    ...weeks.map((w, i) => ({ week: i + 1, message: `${i + 1}週目: ${w.note}` })),
    {
      week: WEEKS,
      message: model === 'waterfall'
        ? `動くソフトが初めて届いたのは ${firstRelease} 週目でした。計画や見積もりは立てやすい一方、途中の変更には弱い方式です（要件が固まっている大規模開発向き）。`
        : `動くソフトは ${firstRelease} 週目から2週間ごとに届き、要件変更にも次のスプリントで対応できました（変化の多い Web サービス向き）。`,
    },
  ], [model, weeks, firstRelease]);

  return (
    <StepPlayer
      key={model}
      title={`開発モデルの比較: ${MODELS.find(m => m.value === model)!.label}`}
      steps={steps}
      settings={<Segment label="開発モデル" options={MODELS} value={model} onChange={setModel} />}
      renderVisual={s => (
        <div className="viz-table-wrap">
          <table className="viz-grid">
            <thead><tr><th>週</th>{weeks.map((_, i) => <th key={i} className={i + 1 === s.week ? 'is-now' : undefined}>{i + 1}</th>)}</tr></thead>
            <tbody>
              <tr>
                <th>作業</th>
                {weeks.map((w, i) => (
                  <td key={i} className={i < s.week ? `tone-${w.tone}${i + 1 === s.week ? ' is-now' : ''}` : undefined} style={{ fontSize: '0.7rem', minWidth: '3.4em' }}>
                    {i < s.week ? w.work.replace('スプリント', 'S') : ''}
                  </td>
                ))}
              </tr>
              <tr>
                <th>変更要求</th>
                {weeks.map((_, i) => <td key={i} className={i + 1 === CHANGE_WEEK && i < s.week ? 'tone-focus' : undefined}>{i + 1 === CHANGE_WEEK && i < s.week ? '!' : ''}</td>)}
              </tr>
              <tr>
                <th>動くソフト</th>
                {weeks.map((w, i) => <td key={i} className={w.release && i < s.week ? 'tone-done' : undefined}>{w.release && i < s.week ? '✓' : ''}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      getMessage={s => s.message}
      getVars={s => [
        { label: '経過', value: `${s.week} 週`, tone: 'range' },
        { label: '動くソフトを届けた回数', value: weeks.slice(0, s.week).filter(w => w.release).length, tone: 'done' },
      ]}
      legend={[{ tone: 'focus', label: '要件変更・手戻り' }, { tone: 'done', label: '動くソフトを届けた' }]}
      footnote="期間は説明のための例です。ほかに、試作品で要件を確かめるプロトタイプモデル、リスク分析しながら反復するスパイラルモデルがあります。"
    />
  );
}
