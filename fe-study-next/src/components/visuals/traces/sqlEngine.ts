/**
 * SQL の処理を、論理的な実行順（FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY）で
 * 1段階ずつ実行する小さなエンジン。教材用に、決まった形のクエリだけを扱う。
 */

export type Value = string | number | null;
export type Row = Record<string, Value>;

export const EMPLOYEES: Row[] = [
  { 社員ID: 1, 氏名: '田中', 年齢: 34, 部署ID: 10 },
  { 社員ID: 2, 氏名: '鈴木', 年齢: 28, 部署ID: 20 },
  { 社員ID: 3, 氏名: '佐藤', 年齢: 41, 部署ID: 10 },
  { 社員ID: 4, 氏名: '高橋', 年齢: 25, 部署ID: 30 },
  { 社員ID: 5, 氏名: '伊藤', 年齢: 38, 部署ID: 20 },
  { 社員ID: 6, 氏名: '渡辺', 年齢: 30, 部署ID: null },
  { 社員ID: 7, 氏名: '山本', 年齢: 45, 部署ID: 10 },
];
export const DEPTS: Row[] = [
  { 部署ID: 10, 部署名: '営業部' },
  { 部署ID: 20, 部署名: '開発部' },
  { 部署ID: 30, 部署名: '総務部' },
];

export type Phase = 'from' | 'where' | 'group' | 'having' | 'select' | 'order';

export interface SqlStage { phase: Phase; clause: string; columns: string[]; rows: Row[]; removed?: Row[]; groups?: { key: Value; rows: Row[] }[]; message: string }

export interface QueryDef {
  id: string;
  label: string;
  sql: string[];
  run: () => SqlStage[];
}

const cols = (rows: Row[], fallback: string[]) => (rows.length ? Object.keys(rows[0]) : fallback);

function joinRows(left: boolean): Row[] {
  const out: Row[] = [];
  for (const e of EMPLOYEES) {
    const matches = DEPTS.filter(d => d.部署ID === e.部署ID && e.部署ID !== null);
    if (matches.length) matches.forEach(d => out.push({ 社員ID: e.社員ID, 氏名: e.氏名, 年齢: e.年齢, 部署ID: e.部署ID, 部署名: d.部署名 }));
    else if (left) out.push({ 社員ID: e.社員ID, 氏名: e.氏名, 年齢: e.年齢, 部署ID: e.部署ID, 部署名: null });
  }
  return out;
}

export const QUERIES: QueryDef[] = [
  {
    id: 'where',
    label: 'WHERE と ORDER BY',
    sql: ['SELECT 氏名, 年齢', 'FROM 社員', 'WHERE 年齢 >= 30', 'ORDER BY 年齢 DESC'],
    run() {
      const all = EMPLOYEES;
      const kept = all.filter(r => (r.年齢 as number) >= 30);
      const sel = kept.map(r => ({ 氏名: r.氏名, 年齢: r.年齢 }));
      const ord = [...sel].sort((a, b) => (b.年齢 as number) - (a.年齢 as number));
      return [
        { phase: 'from', clause: 'FROM 社員', columns: cols(all, []), rows: all, message: 'まず FROM で対象の表（社員）を決めます。全7行が対象です。' },
        { phase: 'where', clause: 'WHERE 年齢 >= 30', columns: cols(all, []), rows: kept, removed: all.filter(r => !kept.includes(r)), message: `WHERE で条件に合う行だけを残します。年齢が30未満の ${all.length - kept.length} 行が除かれ、${kept.length} 行が残りました。` },
        { phase: 'select', clause: 'SELECT 氏名, 年齢', columns: ['氏名', '年齢'], rows: sel, message: 'SELECT で、結果に出す列（氏名・年齢）だけを取り出します。' },
        { phase: 'order', clause: 'ORDER BY 年齢 DESC', columns: ['氏名', '年齢'], rows: ord, message: 'ORDER BY 年齢 DESC で、年齢の高い順（降順）に並べ替えます。ASC なら昇順です。' },
      ];
    },
  },
  {
    id: 'group',
    label: 'GROUP BY と HAVING',
    sql: ['SELECT 部署ID, COUNT(*) AS 人数, AVG(年齢) AS 平均年齢', 'FROM 社員', 'WHERE 部署ID IS NOT NULL', 'GROUP BY 部署ID', 'HAVING COUNT(*) >= 2'],
    run() {
      const all = EMPLOYEES;
      const kept = all.filter(r => r.部署ID !== null);
      const keys = [...new Set(kept.map(r => r.部署ID))];
      const groups = keys.map(k => ({ key: k, rows: kept.filter(r => r.部署ID === k) }));
      const kept2 = groups.filter(g => g.rows.length >= 2);
      const agg = kept2.map(g => ({ 部署ID: g.key, 人数: g.rows.length, 平均年齢: Math.round((g.rows.reduce((a, r) => a + (r.年齢 as number), 0) / g.rows.length) * 10) / 10 }));
      return [
        { phase: 'from', clause: 'FROM 社員', columns: cols(all, []), rows: all, message: 'FROM で社員表の全7行を対象にします。' },
        { phase: 'where', clause: 'WHERE 部署ID IS NOT NULL', columns: cols(all, []), rows: kept, removed: all.filter(r => !kept.includes(r)), message: 'WHERE は「グループにまとめる前」の行に対する条件です。部署ID が NULL の行を除きます（NULL の判定は = NULL ではなく IS NULL / IS NOT NULL を使います）。' },
        { phase: 'group', clause: 'GROUP BY 部署ID', columns: cols(all, []), rows: kept, groups, message: `GROUP BY で、部署ID が同じ行を1つのグループにまとめます。${groups.length} つのグループができました。` },
        {
          phase: 'having', clause: 'HAVING COUNT(*) >= 2', columns: cols(all, []), rows: kept2.flatMap(g => g.rows), groups: kept2,
          removed: groups.filter(g => !kept2.includes(g)).flatMap(g => g.rows),
          message: `HAVING は「グループにまとめた後」の条件です。行数（COUNT(*)）が2未満のグループ（部署ID ${groups.filter(g => !kept2.includes(g)).map(g => g.key).join('・')}）を除きます。集計関数を使った条件は WHERE には書けず、HAVING に書きます。`,
        },
        { phase: 'select', clause: 'SELECT 部署ID, COUNT(*), AVG(年齢)', columns: ['部署ID', '人数', '平均年齢'], rows: agg, message: '残ったグループごとに集計関数を計算し、1グループを1行にします。COUNT(*) は行数、AVG は平均です。' },
      ];
    },
  },
  {
    id: 'inner',
    label: 'INNER JOIN',
    sql: ['SELECT 社員.氏名, 部署.部署名', 'FROM 社員 INNER JOIN 部署', '  ON 社員.部署ID = 部署.部署ID'],
    run() {
      const j = joinRows(false);
      return [
        { phase: 'from', clause: 'FROM 社員', columns: cols(EMPLOYEES, []), rows: EMPLOYEES, message: '社員表（7行）と部署表（3行）を、部署ID が等しい行どうしで結び付けます。' },
        { phase: 'from', clause: 'INNER JOIN 部署 ON …', columns: cols(j, []), rows: j, removed: EMPLOYEES.filter(e => !j.some(r => r.社員ID === e.社員ID)), message: `INNER JOIN は、両方の表に一致する行がある組み合わせだけを残します。部署ID が NULL の渡辺さんは相手がいないので結果に含まれず、${j.length} 行になります。` },
        { phase: 'select', clause: 'SELECT 社員.氏名, 部署.部署名', columns: ['氏名', '部署名'], rows: j.map(r => ({ 氏名: r.氏名, 部署名: r.部署名 })), message: 'SELECT で氏名と部署名を取り出します。' },
      ];
    },
  },
  {
    id: 'left',
    label: 'LEFT JOIN',
    sql: ['SELECT 社員.氏名, 部署.部署名', 'FROM 社員 LEFT JOIN 部署', '  ON 社員.部署ID = 部署.部署ID'],
    run() {
      const j = joinRows(true);
      return [
        { phase: 'from', clause: 'FROM 社員', columns: cols(EMPLOYEES, []), rows: EMPLOYEES, message: '同じ2つの表を、今度は LEFT JOIN で結び付けます。' },
        { phase: 'from', clause: 'LEFT JOIN 部署 ON …', columns: cols(j, []), rows: j, message: `LEFT JOIN は、左側（社員表）の行をすべて残します。一致する部署がない渡辺さんの部署名は NULL になります。結果は ${j.length} 行です。` },
        { phase: 'select', clause: 'SELECT 社員.氏名, 部署.部署名', columns: ['氏名', '部署名'], rows: j.map(r => ({ 氏名: r.氏名, 部署名: r.部署名 })), message: 'SELECT で氏名と部署名を取り出します。INNER JOIN との違いは、相手のいない行を残すかどうかです。' },
      ];
    },
  },
];
