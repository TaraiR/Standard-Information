'use client';

import StepPlayer from './StepPlayer';
import { NORM_STAGES, rowsToUpdate, type Table } from './traces/dbDesign';

function TableView({ t, highlight = [], focusValue }: { t: Table; highlight?: string[]; focusValue?: string }) {
  return (
    <div className="viz-table-wrap">
      <table className="viz-table">
        <caption className="viz-hint" style={{ captionSide: 'top', textAlign: 'left', fontWeight: 700 }}>
          {t.name}（主キー: {t.key.join(', ')}）
        </caption>
        <thead>
          <tr>{t.columns.map(c => (
            <th key={c} style={t.key.includes(c) ? { textDecoration: 'underline' } : highlight.includes(c) ? { color: 'var(--viz-focus)' } : undefined}>{c}</th>
          ))}</tr>
        </thead>
        <tbody>
          {t.rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, k) => (
                <td key={k} style={
                  focusValue && v === focusValue ? { background: 'var(--viz-focus-bg)', color: 'var(--viz-focus)', fontWeight: 700 }
                    : highlight.includes(t.columns[k]) ? { background: 'var(--viz-range-bg)' } : undefined
                }>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function NormalizeVisual() {
  const steps = [
    ...NORM_STAGES.map((st, i) => ({ stage: i, anomaly: false, message: st.message })),
    {
      stage: 1, anomaly: true,
      message: `更新時の異常: 担当者「山田」の部署が変わったとします。1NF の表では、山田さんの部署が書かれた ${rowsToUpdate(1)} 行すべてを書き換える必要があり、1行でも書き忘れると矛盾が生じます。`,
    },
    {
      stage: 3, anomaly: true,
      message: `3NF の表では、担当者表の ${rowsToUpdate(3)} 行を書き換えるだけで済みます。正規化の目的は、このようにデータの重複をなくして更新時の異常を防ぐことです（検索を速くすることが目的ではありません）。`,
    },
  ];
  return (
    <StepPlayer
      title="正規化（非正規形 → 第1・第2・第3正規形）"
      steps={steps}
      renderVisual={s => {
        const st = NORM_STAGES[s.stage];
        return (
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="viz-presets">
              {NORM_STAGES.map((n, i) => (
                <span key={n.label} className={`viz-chip${i === s.stage ? ' is-on' : ''}`}>{n.label}</span>
              ))}
            </div>
            {st.tables.map(t => (
              <TableView key={t.name} t={t} highlight={s.anomaly ? [] : st.highlight} focusValue={s.anomaly ? '営業部' : undefined} />
            ))}
          </div>
        );
      }}
      getMessage={s => s.message}
      legend={[{ tone: 'range', label: '問題のある列' }, { tone: 'focus', label: '更新が必要なセル' }]}
      footnote="1NF: 繰り返しをなくす（1セル1値）、2NF: 部分関数従属をなくす、3NF: 推移関数従属をなくす。下線は主キーです。"
    />
  );
}
