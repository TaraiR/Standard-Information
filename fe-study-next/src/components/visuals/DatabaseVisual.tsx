'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment } from './ui';
import { QUERIES, type Row, type SqlStage, type Value } from './traces/sqlEngine';

const show = (v: Value) => (v === null ? 'NULL' : String(v));
const GROUP_TONES = ['tone-range', 'tone-done', 'tone-focus'];

export function DataTable({ columns, rows, removed = [], groups, caption }: {
  columns: string[]; rows: Row[]; removed?: Row[]; groups?: { key: Value; rows: Row[] }[]; caption?: string;
}) {
  const groupOf = (r: Row) => groups?.findIndex(g => g.rows.includes(r)) ?? -1;
  const all = [...rows, ...removed];
  // 元の並び順を保ったまま、除かれた行も薄く表示する
  const ordered = removed.length ? all.sort((a, b) => (Number(a.社員ID ?? a.部署ID ?? 0) - Number(b.社員ID ?? b.部署ID ?? 0))) : rows;
  return (
    <div className="viz-table-wrap">
      <table className="viz-table" aria-label={caption}>
        {caption && <caption className="viz-hint" style={{ captionSide: 'top', textAlign: 'left' }}>{caption}</caption>}
        <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {ordered.map((r, i) => {
            const gone = removed.includes(r);
            const g = groupOf(r);
            return (
              <tr key={i} style={gone ? { opacity: 0.35, textDecoration: 'line-through' } : undefined}>
                {columns.map(c => (
                  <td key={c} className={!gone && g >= 0 ? GROUP_TONES[g % 3] : undefined}
                    style={!gone && g >= 0 ? { background: `var(--viz-${['range', 'done', 'focus'][g % 3]}-bg)` } : undefined}>
                    {show(r[c])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const OPTIONS = QUERIES.map(q => ({ value: q.id, label: q.label }));
const KEYWORD: Record<string, string> = { from: 'FROM', where: 'WHERE', group: 'GROUP BY', having: 'HAVING', select: 'SELECT', order: 'ORDER BY' };

/** いま処理している句の行か（JOIN の段階では JOIN と ON の行） */
function isActiveLine(s: { phase: string; clause: string }, line: string): boolean {
  const text = line.trim();
  if (/^(INNER|LEFT) JOIN/.test(s.clause)) return text.includes('JOIN') || text.startsWith('ON');
  const kw = KEYWORD[s.phase];
  return !!kw && text.startsWith(kw);
}

export default function DatabaseVisual() {
  const [id, setId] = useState('group');
  const q = QUERIES.find(x => x.id === id)!;
  const stages = useMemo(() => q.run(), [q]);
  const steps = useMemo(() => [{ phase: 'start', clause: '', columns: [], rows: [], message: 'SQL は書いた順ではなく、FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY の順に処理されると考えると理解しやすくなります。' } as SqlStage | { phase: 'start'; clause: string; columns: string[]; rows: Row[]; message: string }, ...stages], [stages]);

  return (
    <StepPlayer
      key={id}
      title={`SQL の処理順: ${q.label}`}
      steps={steps}
      settings={<Segment label="クエリ" options={OPTIONS} value={id} onChange={setId} />}
      renderVisual={s => (
        <>
          <pre className="viz-code" style={{ marginTop: 0 }}>
            {q.sql.map((line, i) => <span key={i} className={isActiveLine(s, line) ? 'is-active' : undefined}>{line}{'\n'}</span>)}
          </pre>
          {s.phase !== 'start' && (
            <div style={{ marginTop: 10 }}>
              <DataTable columns={s.columns} rows={s.rows} removed={'removed' in s ? s.removed : undefined}
                groups={'groups' in s ? s.groups : undefined} caption={`「${s.clause}」の後`} />
            </div>
          )}
        </>
      )}
      getMessage={s => s.message}
      getVars={s => [{ label: '残っている行', value: s.phase === 'start' ? '—' : s.rows.length, tone: 'range' }]}
      legend={[{ tone: 'range', label: 'グループ（色ごと）' }, { tone: 'muted', label: '取り消し線 = 除かれた行' }]}
      footnote="WHERE はグループ化の前、HAVING はグループ化の後に絞り込みます。INNER JOIN は一致する行だけ、LEFT JOIN は左の表の行をすべて残します。"
    />
  );
}
