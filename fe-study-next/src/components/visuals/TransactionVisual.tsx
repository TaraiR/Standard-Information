'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment } from './ui';
import { lostUpdate, transfer, type TransferStep, type TxnStep } from './traces/dbDesign';

const LOCK = [{ value: 'nolock', label: 'ロックなし' }, { value: 'lock', label: '排他ロックあり' }] as const;

function LockPart() {
  const [mode, setMode] = useState<'nolock' | 'lock'>('nolock');
  const steps = useMemo(() => lostUpdate(mode === 'lock'), [mode]);
  const renderVisual = (s: TxnStep, idx: number) => (
    <div className="viz-table-wrap">
      <table className="viz-table">
        <thead><tr><th>時間</th><th>トランザクション T1</th><th>データベースの在庫</th><th>トランザクション T2</th></tr></thead>
        <tbody>
          {steps.slice(1, idx + 1).map((st, i) => (
            <tr key={i} className={i === idx - 1 ? 'is-active' : undefined}>
              <td>{i + 1}</td>
              <td className="is-left">{st.t1}</td>
              <td style={st.tone ? { color: `var(--viz-${st.tone})`, fontWeight: 700 } : undefined}>
                {st.db}{st.lock ? `（${st.lock} がロック中）` : ''}
              </td>
              <td className="is-left">{st.t2}</td>
            </tr>
          ))}
          {idx === 0 && <tr><td colSpan={4}>在庫 {s.db} 個</td></tr>}
        </tbody>
      </table>
    </div>
  );
  return (
    <StepPlayer
      key={mode}
      title={`同時更新とロック（${mode === 'lock' ? '排他ロックあり' : 'ロックなし'}）`}
      steps={steps}
      settings={<Segment label="排他制御" options={LOCK} value={mode} onChange={setMode} />}
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={s => [
        { label: '在庫', value: s.db, tone: s.tone === 'focus' ? 'focus' : s.tone === 'done' ? 'done' : 'range' },
        { label: '正しい値', value: 4, tone: 'done' },
      ]}
      footnote="共有ロック（S）は読み取り用で他の共有ロックと共存でき、排他ロック（X）は書き込み用で他のどのロックとも共存できません。"
    />
  );
}

const FAIL = [{ value: 'ok', label: '正常に終わる' }, { value: 'fail', label: '途中で障害' }] as const;

function AtomicPart() {
  const [mode, setMode] = useState<'ok' | 'fail'>('fail');
  const steps = useMemo(() => transfer(mode === 'fail'), [mode]);
  return (
    <StepPlayer
      key={mode}
      title="トランザクションの原子性（COMMIT と ROLLBACK）"
      steps={steps}
      settings={<Segment label="処理の結果" options={FAIL} value={mode} onChange={setMode} />}
      renderVisual={(s: TransferStep, idx) => (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(['a', 'b'] as const).map(k => (
              <div key={k} className={`viz-var tone-${s.tone === 'focus' ? 'focus' : s.committed !== null ? 'done' : 'range'}`}>
                <dt>{k === 'a' ? 'A さんの口座' : 'B さんの口座'}</dt>
                <dd>{s[k]} 万円</dd>
              </div>
            ))}
          </div>
          <ol className="viz-work">
            {steps.map((st, i) => (
              <li key={i} className={i === idx ? 'is-current' : i > idx ? 'is-pending' : undefined}>
                <span>{i === 0 ? '開始' : `処理 ${i}`}</span>
                <span style={st.tone ? { color: `var(--viz-${st.tone})`, fontWeight: 700 } : undefined}>{st.action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      getMessage={s => s.message}
      getVars={s => [{ label: '合計', value: `${s.a + s.b} 万円`, tone: s.a + s.b === 15 ? 'done' : 'focus' }]}
      footnote="ACID 特性: 原子性（全部か無か）・一貫性（整合性を保つ）・独立性（互いに干渉しない）・耐久性（確定した結果は消えない）"
    />
  );
}

const TABS = [{ value: 'lock', label: 'ロック（同時実行制御）' }, { value: 'atomic', label: '原子性（ROLLBACK）' }] as const;

export default function TransactionVisual() {
  const [tab, setTab] = useState<'lock' | 'atomic'>('lock');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'lock' ? <LockPart /> : <AtomicPart />}
    </div>
  );
}
