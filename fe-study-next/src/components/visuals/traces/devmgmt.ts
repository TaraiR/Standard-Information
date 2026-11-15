/** 開発・マネジメント分野の計算とシミュレーション（状態遷移・テスト技法・クリティカルパス・稼働率・パレート図・SLA） */

// ---------- 状態遷移 ----------
export type OrderState = '注文確定' | '支払済' | '発送済' | '完了' | 'キャンセル済';
export type OrderEvent = '支払い完了' | '発送' | '到着' | 'キャンセル';
export const TRANSITIONS: { from: OrderState; event: OrderEvent; to: OrderState }[] = [
  { from: '注文確定', event: '支払い完了', to: '支払済' },
  { from: '支払済', event: '発送', to: '発送済' },
  { from: '発送済', event: '到着', to: '完了' },
  { from: '注文確定', event: 'キャンセル', to: 'キャンセル済' },
  { from: '支払済', event: 'キャンセル', to: 'キャンセル済' },
];
export function nextState(s: OrderState, e: OrderEvent): OrderState | null {
  return TRANSITIONS.find(t => t.from === s && t.event === e)?.to ?? null;
}

// ---------- 同値分割・境界値分析 ----------
/** 仕様: 年齢 0〜120 は有効。わざと境界を間違えた実装（0 を無効にしてしまう） */
export const isValidSpec = (age: number) => age >= 0 && age <= 120;
export const isValidBuggy = (age: number) => age > 0 && age <= 120;
export interface TestCase { value: number; kind: string; technique: '同値分割' | '境界値分析' }
export const EQUIVALENCE: TestCase[] = [
  { value: -5, kind: '無効（0 未満）', technique: '同値分割' },
  { value: 30, kind: '有効（0〜120）', technique: '同値分割' },
  { value: 200, kind: '無効（120 超え）', technique: '同値分割' },
];
export const BOUNDARY: TestCase[] = [
  { value: -1, kind: '下限の1つ下', technique: '境界値分析' },
  { value: 0, kind: '下限', technique: '境界値分析' },
  { value: 120, kind: '上限', technique: '境界値分析' },
  { value: 121, kind: '上限の1つ上', technique: '境界値分析' },
];

// ---------- 命令網羅（C0）と分岐網羅（C1） ----------
/**
 * 対象のコード:
 *   1: if (x > 0) {
 *   2:   y = y + 1
 *      }
 *   3: if (z > 0) {
 *   4:   y = y * 2
 *      }
 *   5: return y
 * 命令は 1〜5、分岐は 1T/1F/3T/3F の4つ
 */
export interface CovInput { x: number; z: number }
export function coverage(cases: CovInput[]): { statements: Set<number>; branches: Set<string> } {
  const statements = new Set<number>();
  const branches = new Set<string>();
  for (const { x, z } of cases) {
    statements.add(1);
    if (x > 0) { branches.add('1T'); statements.add(2); } else branches.add('1F');
    statements.add(3);
    if (z > 0) { branches.add('3T'); statements.add(4); } else branches.add('3F');
    statements.add(5);
  }
  return { statements, branches };
}

// ---------- クリティカルパス ----------
export interface Activity { id: string; days: number; pred: string[] }
export interface CpmRow { id: string; days: number; es: number; ef: number; ls: number; lf: number; float: number }

export const NETWORKS: Record<string, { label: string; acts: Activity[] }> = {
  text: {
    label: '本文の例',
    acts: [
      { id: 'A', days: 3, pred: [] }, { id: 'B', days: 2, pred: [] },
      { id: 'C', days: 2, pred: ['A'] }, { id: 'D', days: 4, pred: ['B'] },
    ],
  },
  web: {
    label: 'Web サイト構築',
    acts: [
      { id: '要件', days: 3, pred: [] },
      { id: '設計', days: 4, pred: ['要件'] },
      { id: 'デザイン', days: 5, pred: ['要件'] },
      { id: '実装', days: 6, pred: ['設計'] },
      { id: 'テスト', days: 3, pred: ['実装', 'デザイン'] },
      { id: 'マニュアル', days: 2, pred: ['設計'] },
      { id: '公開', days: 1, pred: ['テスト', 'マニュアル'] },
    ],
  },
};

/** 作業を前から（最早）、後ろから（最遅）計算する。acts は前の作業が先に並んでいること */
export function cpm(acts: Activity[]): { rows: CpmRow[]; total: number; critical: string[] } {
  const ef = new Map<string, number>();
  const es = new Map<string, number>();
  for (const a of acts) {
    const s = Math.max(0, ...a.pred.map(p => ef.get(p)!));
    es.set(a.id, s);
    ef.set(a.id, s + a.days);
  }
  const total = Math.max(...acts.map(a => ef.get(a.id)!));
  const lf = new Map<string, number>();
  const ls = new Map<string, number>();
  for (const a of [...acts].reverse()) {
    const succ = acts.filter(x => x.pred.includes(a.id));
    const f = succ.length ? Math.min(...succ.map(x => ls.get(x.id)!)) : total;
    lf.set(a.id, f);
    ls.set(a.id, f - a.days);
  }
  const rows = acts.map(a => ({
    id: a.id, days: a.days, es: es.get(a.id)!, ef: ef.get(a.id)!, ls: ls.get(a.id)!, lf: lf.get(a.id)!,
    float: ls.get(a.id)! - es.get(a.id)!,
  }));
  return { rows, total, critical: rows.filter(r => r.float === 0).map(r => r.id) };
}

// ---------- 稼働率 ----------
export const availability = (mtbf: number, mttr: number) => mtbf / (mtbf + mttr);
export const series = (rs: number[]) => rs.reduce((a, r) => a * r, 1);
export const parallel = (rs: number[]) => 1 - rs.reduce((a, r) => a * (1 - r), 1);

// ---------- パレート図 ----------
export const DEFECTS = [
  { cause: '入力ミス', count: 12 }, { cause: '仕様の誤解', count: 46 }, { cause: '設定漏れ', count: 8 },
  { cause: 'テスト不足', count: 25 }, { cause: 'その他', count: 4 }, { cause: '環境の違い', count: 5 },
];
export function pareto(items = DEFECTS) {
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((a, d) => a + d.count, 0);
  let cum = 0;
  return sorted.map(d => { cum += d.count; return { ...d, cumulative: cum, percent: Math.round((cum / total) * 1000) / 10 }; });
}

// ---------- SLA ----------
/** 稼働率 percent のとき、30日間に許される停止時間（分） */
export const allowedDowntimeMinutes = (percent: number, days = 30) => Math.round(days * 24 * 60 * (1 - percent / 100) * 10) / 10;
