'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Arrow, Segment, UnitBox } from './ui';
import { ALGO_LABEL, PROCS, simulate, type Algo, type SchedStep } from './traces/scheduling';

const ALGOS = (['fcfs', 'sjf', 'rr', 'prio'] as Algo[]).map(v => ({ value: v, label: ALGO_LABEL[v].replace(/（.*/, '') }));

function SchedulePart() {
  const [algo, setAlgo] = useState<Algo>('fcfs');
  const result = useMemo(() => simulate(algo), [algo]);
  const total = PROCS.reduce((a, p) => a + p.burst, 0);
  const last = result.steps.length - 1;

  const renderVisual = (s: SchedStep, idx: number) => (
    <>
      <div className="viz-table-wrap">
        <table className="viz-grid" aria-label="ガントチャート">
          <thead>
            <tr><th />{Array.from({ length: total }, (_, t) => <th key={t} className={t === s.time - 1 && idx < last ? 'is-now' : undefined}>{t}</th>)}</tr>
          </thead>
          <tbody>
            {PROCS.map(p => (
              <tr key={p.name}>
                <th>{p.name}</th>
                {Array.from({ length: total }, (_, t) => {
                  const ran = s.timeline[t] === p.name;
                  const arrivedWaiting = !ran && t < s.time && t >= p.arrival && (s.finish[p.name] === undefined || t < s.finish[p.name]);
                  return (
                    <td key={t} className={ran ? (t === s.time - 1 && idx < last ? 'tone-focus is-now' : 'tone-range') : arrivedWaiting ? 'tone-muted' : undefined}>
                      {ran ? '■' : t === p.arrival ? '↓' : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="viz-table-wrap">
        <table className="viz-table">
          <thead><tr><th>プロセス</th><th>到着</th><th>実行時間</th><th>優先度</th><th>残り</th><th>待ち時間</th></tr></thead>
          <tbody>
            {PROCS.map(p => (
              <tr key={p.name} className={s.running === p.name && idx < last ? 'is-active' : undefined}>
                <td>{p.name}</td><td>{p.arrival}</td><td>{p.burst}</td><td>{p.priority}</td>
                <td>{s.remaining[p.name]}</td>
                <td>{s.finish[p.name] !== undefined ? result.waiting[p.name] : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const avgWait = Object.values(result.waiting).reduce((a, b) => a + b, 0) / PROCS.length;
  return (
    <StepPlayer
      key={algo}
      title={`CPU スケジューリング: ${ALGO_LABEL[algo]}`}
      steps={result.steps}
      settings={<Segment label="スケジューリング方式" options={ALGOS} value={algo} onChange={setAlgo} />}
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={s => [
        { label: '時刻', value: s.time, tone: 'range' },
        { label: '実行中', value: s.running ?? '—', tone: 'focus' },
        { label: '平均待ち時間', value: Object.keys(s.finish).length === PROCS.length ? avgWait : '—', tone: 'done' },
      ]}
      legend={[{ tone: 'focus', label: 'いま実行中' }, { tone: 'range', label: '実行した時間' }, { tone: 'muted', label: '到着後に待っている時間' }]}
      footnote="↓ は到着時刻です。方式を切り替えて、平均待ち時間を比べてみましょう（SJF が最小になります）。"
    />
  );
}

const DEADLOCK = [
  { a: null, b: null, aWait: null, bWait: null, message: 'プロセス A と B が、ファイル X と データベース Y の両方を使う処理をします。資源は同時に1つのプロセスしか使えません（相互排除）。' },
  { a: 'X', b: null, aWait: null, bWait: null, message: 'A が X をロックしました。' },
  { a: 'X', b: 'Y', aWait: null, bWait: null, message: 'B が Y をロックしました。' },
  { a: 'X', b: 'Y', aWait: 'Y', bWait: null, message: 'A は X を持ったまま Y を要求しますが、B が使っているので待ちます（占有と待機）。' },
  { a: 'X', b: 'Y', aWait: 'Y', bWait: 'X', message: 'B も Y を持ったまま X を要求しますが、A が使っているので待ちます。A は B を、B は A を待つ循環ができ、どちらも永遠に進めません。これがデッドロックです。' },
  { a: 'X', b: null, aWait: null, bWait: null, fixed: true, message: '対策: 「必ず X → Y の順にロックする」と決めておくと、B は X を取れるまで Y を持たずに待つので、循環待ちが起きません。' },
] as const;

function DeadlockPart() {
  const res = { X: { x: 230, y: 20 }, Y: { x: 230, y: 200 } };
  const proc = { A: { x: 10, y: 110 }, B: { x: 450, y: 110 } };
  return (
    <StepPlayer
      title="デッドロック（互いに相手の資源を待ち続ける）"
      steps={[...DEADLOCK]}
      renderVisual={(s, i) => (
        <svg className="viz-svg" viewBox="0 0 600 290" role="img" aria-label="プロセスと資源の関係">
          {s.a && <Arrow points={[[res[s.a].x + 70, res[s.a].y + 70], [proc.A.x + 140, proc.A.y + 10]]} tone="range" active />}
          {s.b && <Arrow points={[[res[s.b].x + 70, res[s.b].y + 70 - (s.b === 'Y' ? 70 : 0)], [proc.B.x, proc.B.y + 40]]} tone="range" active />}
          {s.aWait && <Arrow points={[[proc.A.x + 140, proc.A.y + 60], [res[s.aWait].x, res[s.aWait].y + 35]]} tone="focus" active />}
          {s.bWait && <Arrow points={[[proc.B.x, proc.B.y + 20], [res[s.bWait].x + 140, res[s.bWait].y + 35]]} tone="focus" active />}
          <UnitBox x={res.X.x} y={res.X.y} w={140} h={70} title="ファイル X" active={!!s.a} tone="range" />
          <UnitBox x={res.Y.x} y={res.Y.y} w={140} h={70} title="DB Y" active={!!s.b} tone="range" />
          <UnitBox x={proc.A.x} y={proc.A.y} w={140} h={70} title="プロセス A" sub={s.aWait ? '待機中' : ''} active tone={s.aWait ? 'focus' : 'done'} />
          <UnitBox x={proc.B.x} y={proc.B.y} w={140} h={70} title="プロセス B" sub={s.bWait ? '待機中' : 'fixed' in s ? 'X が空くのを待つ' : ''} active tone={s.bWait ? 'focus' : 'done'} />
          {i === 4 && <text className="viz-text is-strong tone-focus" x={300} y={160} textAnchor="middle" style={{ fontSize: 24 }}>循環待ち！</text>}
        </svg>
      )}
      getMessage={s => s.message}
      legend={[{ tone: 'range', label: '保持している資源' }, { tone: 'focus', label: '要求して待っている資源' }]}
      footnote="デッドロックの4条件: 相互排除・占有と待機・非横取り・循環待機。どれか1つを崩せば防げます。"
    />
  );
}

const TABS = [{ value: 'sched', label: 'CPU スケジューリング' }, { value: 'dead', label: 'デッドロック' }] as const;

export default function OsVisual() {
  const [tab, setTab] = useState<'sched' | 'dead'>('sched');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'sched' ? <SchedulePart /> : <DeadlockPart />}
    </div>
  );
}
