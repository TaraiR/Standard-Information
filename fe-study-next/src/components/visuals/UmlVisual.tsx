'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Arrow, Segment, SequenceDiagram, UnitBox } from './ui';
import { nextState, TRANSITIONS, type OrderEvent, type OrderState } from './traces/devmgmt';

const POS: Record<OrderState, { x: number; y: number }> = {
  注文確定: { x: 10, y: 40 }, 支払済: { x: 160, y: 40 }, 発送済: { x: 310, y: 40 }, 完了: { x: 460, y: 40 }, キャンセル済: { x: 160, y: 200 },
};
const W = 120;
const H = 56;
const EVENTS: OrderEvent[] = ['支払い完了', '到着', '発送', 'キャンセル', '到着'];

function StatePart() {
  const steps = useMemo(() => {
    let state: OrderState = '注文確定';
    const out: { state: OrderState; event: OrderEvent | null; ok: boolean; message: string }[] = [
      { state, event: null, ok: true, message: '注文の状態は「注文確定」から始まります。状態遷移図は、状態（角丸の箱）と、状態を変えるイベント（矢印）で表します。' },
    ];
    for (const e of EVENTS) {
      const to = nextState(state, e);
      out.push(to
        ? { state: to, event: e, ok: true, message: `イベント「${e}」で、${state} → ${to} に遷移します。` }
        : { state, event: e, ok: false, message: `「${state}」の状態では、イベント「${e}」の矢印がないので受け付けず、状態は変わりません。${e === 'キャンセル' ? '発送済みの注文はキャンセルできない、という仕様が図から読み取れます。' : ''}` });
      state = to ?? state;
    }
    return out;
  }, []);
  return (
    <StepPlayer
      title="状態遷移図（注文の状態）"
      steps={steps}
      renderVisual={s => (
        <svg className="viz-svg" viewBox="0 0 600 280" role="img" aria-label={`現在の状態: ${s.state}`}>
          {TRANSITIONS.map(t => {
            const a = POS[t.from];
            const b = POS[t.to];
            const down = b.y > a.y;
            const pts: [number, number][] = down
              ? [[a.x + W / 2 + (t.from === '支払済' ? 0 : 20), a.y + H], [b.x + W / 2 + (t.from === '支払済' ? 0 : -30), b.y]]
              : [[a.x + W, a.y + H / 2], [b.x, b.y + H / 2]];
            const active = s.event === t.event && s.ok && s.state === t.to;
            return (
              <g key={`${t.from}-${t.event}`}>
                <Arrow points={pts} tone="focus" active={active} />
                <text className={`viz-label${active ? ' tone-focus' : ''}`} style={{ fontSize: 14 }}
                  x={(pts[0][0] + pts[1][0]) / 2 + (down ? 8 : 0)} y={(pts[0][1] + pts[1][1]) / 2 - 8} textAnchor="middle">{t.event}</text>
              </g>
            );
          })}
          {(Object.keys(POS) as OrderState[]).map(st => (
            <UnitBox key={st} x={POS[st].x} y={POS[st].y} w={W} h={H} title={st} active={s.state === st} tone={s.ok ? 'done' : 'focus'} />
          ))}
          {s.event && !s.ok && (
            <text className="viz-text is-strong tone-focus" x={420} y={230} textAnchor="middle" style={{ fontSize: 20 }}>「{s.event}」は受け付けない</text>
          )}
        </svg>
      )}
      getMessage={s => s.message}
      getVars={s => [{ label: '現在の状態', value: s.state, tone: 'done' }, { label: 'イベント', value: s.event ?? '—', tone: s.ok ? 'range' : 'focus' }]}
      footnote="UML の主な図: ユースケース図（誰が何をできるか）、クラス図（静的な構造）、シーケンス図（時系列のやり取り）、アクティビティ図（処理の流れ）、状態遷移図（状態の変化）。"
    />
  );
}

const LOGIN = [
  { from: 'user', to: 'browser', label: 'ID・パスワード入力', message: 'ユーザーがブラウザにログイン情報を入力します。シーケンス図は、縦方向が時間の流れです。' },
  { from: 'browser', to: 'server', label: 'POST /login', message: 'ブラウザが Web サーバにログイン要求を送ります。' },
  { from: 'server', to: 'db', label: 'SELECT（照会）', message: 'Web サーバがデータベースに利用者を問い合わせます。' },
  { from: 'db', to: 'server', label: '利用者の情報', tone: 'muted' as const, message: 'データベースが結果を返します。' },
  { from: 'server', to: 'browser', label: '200 OK', tone: 'done' as const, message: 'パスワードが一致したので、ログイン成功を返します。' },
  { from: 'browser', to: 'user', label: 'ログイン成功の画面', tone: 'done' as const, message: '誰が・どの順番で・何を送るかが一目で分かります。詳細設計で処理の流れを確認するのに使います。' },
];

function SequencePart() {
  const steps = [{ shown: 0, message: 'ログイン処理を、UML のシーケンス図で表します。' }, ...LOGIN.map((m, i) => ({ shown: i + 1, message: m.message }))];
  return (
    <StepPlayer
      title="シーケンス図（ログイン処理）"
      steps={steps}
      renderVisual={s => (
        <SequenceDiagram shown={s.shown} messages={LOGIN}
          actors={[{ id: 'user', label: 'ユーザー' }, { id: 'browser', label: 'ブラウザ' }, { id: 'server', label: 'Web サーバ' }, { id: 'db', label: 'DB' }]} />
      )}
      getMessage={s => s.message}
    />
  );
}

const TABS = [{ value: 'state', label: '状態遷移図' }, { value: 'seq', label: 'シーケンス図' }] as const;

export default function UmlVisual() {
  const [tab, setTab] = useState<'state' | 'seq'>('state');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'state' ? <StatePart /> : <SequencePart />}
    </div>
  );
}
