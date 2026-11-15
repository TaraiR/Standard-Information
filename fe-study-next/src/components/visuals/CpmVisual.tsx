'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment } from './ui';
import { cpm, NETWORKS } from './traces/devmgmt';

const OPTIONS = Object.entries(NETWORKS).map(([k, v]) => ({ value: k, label: v.label }));

export default function CpmVisual() {
  const [net, setNet] = useState('web');
  const acts = NETWORKS[net].acts;
  const r = useMemo(() => cpm(acts), [acts]);
  const steps = useMemo(() => {
    const out: { fwd: number; bwd: number; done: boolean; message: string }[] = [
      { fwd: 0, bwd: 0, done: false, message: '作業ごとの日数と、前に終わっている必要がある作業（先行作業）から、プロジェクト全体の日数とクリティカルパスを求めます。まず前から順に「最早開始日」を計算します。' },
    ];
    r.rows.forEach((row, i) => {
      const a = acts[i];
      out.push({
        fwd: i + 1, bwd: 0, done: false,
        message: `${row.id}: ` + (a.pred.length
          ? `先行作業 ${a.pred.join('・')} がすべて終わる日（${a.pred.map(p => r.rows.find(x => x.id === p)!.ef).join('・')} の最大）= ${row.es} 日目から始められます。`
          : '先行作業がないので 0 日目から始められます。') + ` ${row.days} 日かかるので ${row.ef} 日目に終わります。`,
      });
    });
    out.push({ fwd: acts.length, bwd: 0, done: false, message: `すべての作業が終わるのは ${r.total} 日目です。次は後ろから「最遅開始日」（全体を遅らせずに済む、いちばん遅い開始日）を計算します。` });
    [...r.rows].reverse().forEach((row, i) => {
      const succ = acts.filter(x => x.pred.includes(row.id)).map(x => x.id);
      out.push({
        fwd: acts.length, bwd: i + 1, done: false,
        message: `${row.id}: ` + (succ.length
          ? `後続作業 ${succ.join('・')} の最遅開始日の最小 = ${row.lf} 日目までに終われば間に合います。`
          : `最後の作業なので ${r.total} 日目までに終わればよい。`) + ` ${row.days} 日かかるので、遅くとも ${row.ls} 日目に始めます。余裕は ${row.ls} − ${row.es} = ${row.float} 日です。`,
      });
    });
    out.push({
      fwd: acts.length, bwd: acts.length, done: true,
      message: `余裕が 0 日の作業をつないだ ${r.critical.join(' → ')} がクリティカルパス（${r.total} 日）です。この上の作業が1日遅れると、全体も1日遅れます。余裕のある作業は、その日数までなら遅れても影響しません。`,
    });
    return out;
  }, [r, acts]);

  return (
    <StepPlayer
      key={net}
      title={`クリティカルパスの計算: ${NETWORKS[net].label}`}
      steps={steps}
      settings={<Segment label="例題" options={OPTIONS} value={net} onChange={setNet} />}
      renderVisual={s => {
        const bwdShown = new Set([...r.rows].reverse().slice(0, s.bwd).map(x => x.id));
        return (
          <>
            <div className="viz-table-wrap">
              <table className="viz-grid" aria-label="作業ごとの日程">
                <thead><tr><th>作業</th>{Array.from({ length: r.total }, (_, d) => <th key={d}>{d + 1}</th>)}</tr></thead>
                <tbody>
                  {r.rows.map((row, i) => {
                    const shown = i < s.fwd;
                    const crit = s.done && row.float === 0;
                    return (
                      <tr key={row.id}>
                        <th style={{ textAlign: 'right' }}>{row.id}</th>
                        {Array.from({ length: r.total }, (_, d) => {
                          const work = shown && d >= row.es && d < row.ef;
                          const slack = bwdShown.has(row.id) && d >= row.ef && d < row.lf;
                          return <td key={d} className={work ? (crit ? 'tone-focus' : 'tone-range') : slack ? 'tone-muted' : undefined}>{work ? '' : slack ? '余' : ''}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="viz-table-wrap">
              <table className="viz-table">
                <thead><tr><th>作業</th><th>日数</th><th>先行</th><th>最早開始</th><th>最早終了</th><th>最遅開始</th><th>余裕</th></tr></thead>
                <tbody>
                  {r.rows.map((row, i) => (
                    <tr key={row.id} className={!s.done && ((s.bwd === 0 && i === s.fwd - 1) || (s.bwd > 0 && [...r.rows].reverse()[s.bwd - 1]?.id === row.id)) ? 'is-active' : undefined}>
                      <td>{row.id}</td><td>{row.days}</td><td>{acts[i].pred.join('・') || '—'}</td>
                      <td>{i < s.fwd ? row.es : ''}</td><td>{i < s.fwd ? row.ef : ''}</td>
                      <td>{bwdShown.has(row.id) ? row.ls : ''}</td>
                      <td style={s.done && row.float === 0 ? { color: 'var(--viz-focus)', fontWeight: 700 } : undefined}>{bwdShown.has(row.id) ? row.float : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      }}
      getMessage={s => s.message}
      getVars={s => [
        { label: '全体の日数', value: s.fwd === acts.length ? `${r.total} 日` : '—', tone: 'range' },
        { label: 'クリティカルパス', value: s.done ? r.critical.join('→') : '—', tone: 'focus' },
      ]}
      legend={[{ tone: 'range', label: '作業の期間' }, { tone: 'focus', label: 'クリティカルパス上の作業' }, { tone: 'muted', label: '余裕（遅れてもよい日数）' }]}
      footnote="クリティカルパスは「最も時間がかかる経路」です（最短の経路ではありません）。ガントチャートは期間を、アローダイアグラムは作業の順序関係を表します。"
    />
  );
}
