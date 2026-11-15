/** ストラテジ分野の計算と分類（PPM・SWOT・知的財産権・損益分岐点・ROI・TCO・線形計画法・ABC分析・発注点） */

// ---------- SWOT ----------
export type Swot = 'S' | 'W' | 'O' | 'T';
export const SWOT_LABEL: Record<Swot, string> = { S: '強み', W: '弱み', O: '機会', T: '脅威' };
/** 内部環境（自社のこと）か外部環境か × プラスかマイナスか */
export const swotOf = (internal: boolean, positive: boolean): Swot => (internal ? (positive ? 'S' : 'W') : (positive ? 'O' : 'T'));
export const SWOT_ITEMS: { text: string; internal: boolean; positive: boolean }[] = [
  { text: '自社の配送網が全国に整っている', internal: true, positive: true },
  { text: 'IT 人材が不足している', internal: true, positive: false },
  { text: 'ネット通販の市場が拡大している', internal: false, positive: true },
  { text: '海外の大手企業が国内に参入してきた', internal: false, positive: false },
  { text: '長年の顧客から高い信頼を得ている', internal: true, positive: true },
  { text: '法改正で配送ルールが厳しくなる', internal: false, positive: false },
];

// ---------- PPM ----------
export type Ppm = '花形' | '金のなる木' | '問題児' | '負け犬';
export const GROWTH_LINE = 10; // 市場成長率（%）の境目
export const SHARE_LINE = 1.0; // 相対的市場占有率の境目
export function ppmOf(growth: number, share: number): Ppm {
  const highG = growth >= GROWTH_LINE;
  const highS = share >= SHARE_LINE;
  return highG ? (highS ? '花形' : '問題児') : (highS ? '金のなる木' : '負け犬');
}
export const PPM_NOTE: Record<Ppm, string> = {
  花形: '成長率も占有率も高い。売上は大きいが、成長を続けるための投資も大きい。',
  金のなる木: '成長率は低いが占有率が高い。投資が少なくて済み、資金を生み出す。ここで得た資金を他へ回す。',
  問題児: '成長率は高いが占有率が低い。投資して花形に育てるか、撤退するかを判断する。',
  負け犬: '成長率も占有率も低い。撤退や縮小を検討する。',
};
export const BUSINESSES = [
  { name: 'スマホアプリ', growth: 25, share: 1.6 },
  { name: '業務用ソフト', growth: 3, share: 2.2 },
  { name: 'AI 分析サービス', growth: 30, share: 0.4 },
  { name: 'フロッピー販売', growth: -8, share: 0.3 },
];

// ---------- 知的財産権 ----------
export interface IpRight { name: string; target: string; register: string; term: string }
export const IP_RIGHTS: Record<string, IpRight> = {
  著作権: { name: '著作権', target: '文章・音楽・プログラムなどの表現', register: '不要（創作した時点で自動的に発生）', term: '著作者の死後70年（法人は公表後70年）' },
  特許権: { name: '特許権', target: '技術的なアイデア（発明）', register: '必要（審査あり・先に出願した者が優先）', term: '出願から20年' },
  実用新案権: { name: '実用新案権', target: '物の形・構造の工夫（考案）', register: '必要（無審査）', term: '出願から10年' },
  意匠権: { name: '意匠権', target: '製品の外観デザイン', register: '必要', term: '出願から25年' },
  商標権: { name: '商標権', target: 'ブランド名・ロゴ', register: '必要', term: '登録から10年（何度でも更新できる）' },
};
export const IP_CASES: { text: string; right: keyof typeof IP_RIGHTS; note: string }[] = [
  { text: '社員が業務として作成した会計ソフトのプログラム', right: '著作権', note: '職務著作として、原則は会社が著作者になります。登録しなくても保護されます。' },
  { text: '新しい画像圧縮の方法（アルゴリズムを使った技術的な発明）', right: '特許権', note: 'アイデア自体は著作権では守られません。特許を取るには出願と審査が必要です。' },
  { text: 'スマートフォンの、他にない独特な外観デザイン', right: '意匠権', note: '外観のデザインは意匠権で守ります。' },
  { text: '自社サービスの名前とロゴマーク', right: '商標権', note: '更新すれば何度でも延長できるのが商標権の特徴です。' },
  { text: '持ち運びやすくしたキーボードの折りたたみ構造', right: '実用新案権', note: '物の形状・構造の工夫は、審査なしで登録できる実用新案権で守れます。' },
];

// ---------- 損益分岐点 ----------
export const breakEven = (fixed: number, variableRate: number) => fixed / (1 - variableRate);

// ---------- ROI・回収期間・TCO ----------
export const roi = (profit: number, investment: number) => (profit / investment) * 100;
export const payback = (investment: number, annualProfit: number) => investment / annualProfit;

// ---------- 線形計画法（2変数・2制約・非負） ----------
export interface Lp { profit: [number, number]; c1: [number, number, number]; c2: [number, number, number] }
export const LP_EXAMPLE: Lp = { profit: [3, 5], c1: [2, 4, 20], c2: [3, 2, 18] };

/** 実行可能領域の頂点（原点・各軸との交点・2直線の交点のうち、すべての制約を満たすもの） */
export function lpVertices(lp: Lp): { x: number; y: number }[] {
  const [a1, b1, r1] = lp.c1;
  const [a2, b2, r2] = lp.c2;
  const cands = [
    { x: 0, y: 0 },
    { x: 0, y: Math.min(r1 / b1, r2 / b2) },
    { x: Math.min(r1 / a1, r2 / a2), y: 0 },
  ];
  const det = a1 * b2 - a2 * b1;
  if (det !== 0) cands.push({ x: (r1 * b2 - r2 * b1) / det, y: (a1 * r2 - a2 * r1) / det });
  const feasible = (p: { x: number; y: number }) =>
    p.x >= -1e-9 && p.y >= -1e-9 && a1 * p.x + b1 * p.y <= r1 + 1e-9 && a2 * p.x + b2 * p.y <= r2 + 1e-9;
  const seen = new Set<string>();
  return cands.filter(feasible).filter(p => {
    const k = `${p.x.toFixed(6)},${p.y.toFixed(6)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---------- ABC 分析 ----------
export const ITEMS = [
  { name: '商品P', sales: 420 }, { name: '商品Q', sales: 35 }, { name: '商品R', sales: 260 }, { name: '商品S', sales: 18 },
  { name: '商品T', sales: 90 }, { name: '商品U', sales: 12 }, { name: '商品V', sales: 60 }, { name: '商品W', sales: 5 },
];
/** 累積構成比 80% まで A、95% まで B、残りを C とする */
export function abc(items = ITEMS) {
  const sorted = [...items].sort((a, b) => b.sales - a.sales);
  const total = sorted.reduce((a, i) => a + i.sales, 0);
  let cum = 0;
  return sorted.map(i => {
    cum += i.sales;
    const pct = Math.round((cum / total) * 1000) / 10;
    // その品目までの累積構成比が 80% 以内なら A、95% 以内なら B、それ以外は C
    const rank = cum / total <= 0.8 ? 'A' : cum / total <= 0.95 ? 'B' : 'C';
    return { ...i, cumulative: cum, percent: pct, rank };
  });
}

// ---------- 発注点 ----------
export const reorderPoint = (daily: number, lead: number, safety: number) => daily * lead + safety;
