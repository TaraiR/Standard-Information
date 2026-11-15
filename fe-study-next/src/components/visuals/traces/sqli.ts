/**
 * SQL インジェクションの仕組みを示すための、ごく小さな SQL（WHERE 句）評価器。
 * 文字列連結で組み立てたクエリと、プレースホルダ（入力を値としてだけ扱う）を比べる。
 * 対応: 識別子 = '文字列' / 識別子 = 識別子 / '文字列' = '文字列' / AND / OR / 括弧 / -- コメント
 */

export interface UserRow { id: string; pw: string; name: string }

export const USERS: UserRow[] = [
  { id: 'tanaka', pw: 'sakura2024', name: '田中' },
  { id: 'suzuki', pw: 'umi-0707', name: '鈴木' },
  { id: 'admin', pw: 'Adm!n#9', name: '管理者' },
];

type Tok = { t: 'id' | 'str' | 'op' | 'kw' | 'lp' | 'rp'; v: string };

export function tokenize(src: string): Tok[] | null {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (src.startsWith('--', i)) break; // 行末までコメント
    if (c === "'") {
      let v = '';
      i++;
      for (;;) {
        if (i >= src.length) return null; // 閉じていない文字列 → 構文エラー
        if (src[i] === "'") {
          if (src[i + 1] === "'") { v += "'"; i += 2; continue; }
          i++;
          break;
        }
        v += src[i++];
      }
      out.push({ t: 'str', v });
      continue;
    }
    if (c === '=') { out.push({ t: 'op', v: '=' }); i++; continue; }
    if (c === '(') { out.push({ t: 'lp', v: c }); i++; continue; }
    if (c === ')') { out.push({ t: 'rp', v: c }); i++; continue; }
    const m = /^[A-Za-z_][A-Za-z0-9_]*|^\d+/.exec(src.slice(i));
    if (!m) return null;
    const word = m[0];
    if (/^(AND|OR)$/i.test(word)) out.push({ t: 'kw', v: word.toUpperCase() });
    else if (/^\d+$/.test(word)) out.push({ t: 'str', v: word });
    else out.push({ t: 'id', v: word });
    i += word.length;
  }
  return out;
}

type Expr =
  | { k: 'eq'; a: Tok; b: Tok }
  | { k: 'and' | 'or'; a: Expr; b: Expr };

export function parseWhere(tokens: Tok[]): Expr | null {
  let p = 0;
  const peek = () => tokens[p];
  const operand = (): Tok | null => {
    const t = tokens[p];
    if (t && (t.t === 'id' || t.t === 'str')) { p++; return t; }
    return null;
  };
  const primary = (): Expr | null => {
    if (peek()?.t === 'lp') {
      p++;
      const e = or();
      if (!e || peek()?.t !== 'rp') return null;
      p++;
      return e;
    }
    const a = operand();
    if (!a || peek()?.t !== 'op') return null;
    p++;
    const b = operand();
    return b ? { k: 'eq', a, b } : null;
  };
  const and = (): Expr | null => {
    let l = primary();
    while (l && peek()?.t === 'kw' && peek().v === 'AND') { p++; const r = primary(); if (!r) return null; l = { k: 'and', a: l, b: r }; }
    return l;
  };
  const or = (): Expr | null => {
    let l = and();
    while (l && peek()?.t === 'kw' && peek().v === 'OR') { p++; const r = and(); if (!r) return null; l = { k: 'or', a: l, b: r }; }
    return l;
  };
  const e = or();
  return e && p === tokens.length ? e : null;
}

function evalExpr(e: Expr, row: UserRow): boolean {
  if (e.k === 'eq') {
    const val = (t: Tok) => (t.t === 'str' ? t.v : (row as unknown as Record<string, string>)[t.v]);
    return val(e.a) !== undefined && val(e.a) === val(e.b);
  }
  return e.k === 'and'
    ? evalExpr(e.a, row) && evalExpr(e.b, row)
    : evalExpr(e.a, row) || evalExpr(e.b, row);
}

export interface QueryResult { sql: string; where: string; error: string | null; rows: UserRow[] }

/** 文字列連結で組み立てる（脆弱な書き方） */
export function runConcatenated(id: string, pw: string): QueryResult {
  const where = `id = '${id}' AND pw = '${pw}'`;
  const sql = `SELECT * FROM users WHERE ${where}`;
  const tokens = tokenize(where);
  if (!tokens) return { sql, where, error: '構文エラー（引用符の対応が崩れた）', rows: [] };
  const expr = parseWhere(tokens);
  if (!expr) return { sql, where, error: '構文エラー', rows: [] };
  return { sql, where, error: null, rows: USERS.filter(r => evalExpr(expr, r)) };
}

/** プレースホルダ（入力は値としてだけ使われ、SQL の構文にはならない） */
export function runPrepared(id: string, pw: string): QueryResult {
  return {
    sql: "SELECT * FROM users WHERE id = ? AND pw = ?",
    where: 'id = ? AND pw = ?',
    error: null,
    rows: USERS.filter(r => r.id === id && r.pw === pw),
  };
}

// ---------- 総当たり攻撃のパターン数 ----------
export const CHARSETS = {
  digits: { label: '数字のみ（10種類）', size: 10 },
  lower: { label: '英小文字（26種類）', size: 26 },
  alnum: { label: '英大小文字＋数字（62種類）', size: 62 },
  full: { label: '英大小文字＋数字＋記号（94種類）', size: 94 },
} as const;
export type Charset = keyof typeof CHARSETS;

export function patterns(size: number, length: number): number { return size ** length; }

/** 1秒に rate 回試せるとき、全パターンを試し終える時間（秒）を読みやすく */
export function crackTime(total: number, rate: number): string {
  const s = total / rate;
  if (s < 1) return '1秒未満';
  if (s < 60) return `約${Math.round(s)}秒`;
  if (s < 3600) return `約${Math.round(s / 60)}分`;
  if (s < 86400) return `約${Math.round(s / 3600)}時間`;
  if (s < 86400 * 365) return `約${Math.round(s / 86400)}日`;
  const y = s / (86400 * 365);
  return y < 1e4 ? `約${Math.round(y).toLocaleString()}年` : `約${y.toExponential(1).replace('e+', '×10^')}年`;
}
