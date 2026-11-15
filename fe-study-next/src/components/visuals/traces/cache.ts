/**
 * キャッシュメモリのシミュレーション（フルアソシアティブ、LRU 置換）。
 * アドレスを1つずつ読み、ヒット/ミスを判定してヒット率と実効アクセス時間を求める。
 */

export const LINES = 4;
export const BLOCK = 4; // 1ブロック = 4アドレス（連続した領域をまとめて持ってくる）

export interface CacheLine { block: number; lastUsed: number }

export interface CacheStep {
  index: number;            // 何回目のアクセスか（0 = 開始前）
  address: number | null;
  block: number | null;
  hit: boolean | null;
  lines: (CacheLine | null)[];
  /** 今回読み込んだ／使ったライン */
  touched: number | null;
  evicted: number | null;   // 追い出したブロック番号
  hits: number;
  misses: number;
  results: ('H' | 'M')[];
  message: string;
  final?: { rate: number; effective: number };
}

export const blockRange = (b: number) => `${b * BLOCK}〜${b * BLOCK + BLOCK - 1}`;

export function traceCache(addresses: number[], cacheNs: number, memNs: number): CacheStep[] {
  const lines: (CacheLine | null)[] = Array(LINES).fill(null);
  const results: ('H' | 'M')[] = [];
  let hits = 0;
  let misses = 0;
  const steps: CacheStep[] = [{
    index: 0, address: null, block: null, hit: null, lines: [...lines], touched: null, evicted: null,
    hits, misses, results: [],
    message: `キャッシュは空の状態から始めます。キャッシュは ${LINES} ブロック分の容量で、1ブロックは連続する ${BLOCK} アドレスです。` +
      'アドレスを1つずつ読みにいき、キャッシュにあれば「ヒット」、なければ主記憶から読み込む「ミス」です。',
  }];

  addresses.forEach((addr, k) => {
    const time = k + 1;
    const block = Math.floor(addr / BLOCK);
    const at = lines.findIndex(l => l?.block === block);
    let message: string;
    let touched: number;
    let evicted: number | null = null;
    if (at >= 0) {
      hits++;
      lines[at] = { block, lastUsed: time };
      touched = at;
      results.push('H');
      message = `アドレス ${addr} はブロック ${block}（${blockRange(block)}）に含まれ、キャッシュにあるのでヒットです。主記憶にアクセスせずに読めました。`;
    } else {
      misses++;
      results.push('M');
      const empty = lines.findIndex(l => l === null);
      if (empty >= 0) {
        touched = empty;
        message = `アドレス ${addr} のブロック ${block}（${blockRange(block)}）はキャッシュにないのでミスです。主記憶からブロックごと読み込み、空いている場所に入れます。`;
      } else {
        // LRU: 最も長く使われていないブロックを追い出す
        touched = lines.reduce((best, l, i) => (l!.lastUsed < lines[best]!.lastUsed ? i : best), 0);
        evicted = lines[touched]!.block;
        message = `アドレス ${addr} のブロック ${block} はキャッシュにないのでミスです。キャッシュが満杯なので、` +
          `最も長く使われていないブロック ${evicted} を追い出して（LRU 方式）、ブロック ${block} を読み込みます。`;
      }
      lines[touched] = { block, lastUsed: time };
    }
    steps.push({
      index: time, address: addr, block, hit: at >= 0, lines: lines.map(l => (l ? { ...l } : null)),
      touched, evicted, hits, misses, results: [...results], message,
    });
  });

  const total = hits + misses;
  const rate = total ? hits / total : 0;
  const effective = rate * cacheNs + (1 - rate) * memNs;
  const r2 = (x: number) => Number(x.toFixed(4));
  steps.push({
    index: total, address: null, block: null, hit: null, lines: lines.map(l => (l ? { ...l } : null)),
    touched: null, evicted: null, hits, misses, results: [...results], final: { rate, effective },
    message: `${total} 回中 ${hits} 回ヒットしたので、ヒット率は ${hits} ÷ ${total} = ${r2(rate)} です。` +
      `実効アクセス時間 = ヒット率 × キャッシュ時間 + (1 − ヒット率) × 主記憶時間 = ${r2(rate)} × ${cacheNs} + ${r2(1 - rate)} × ${memNs} = ${r2(effective)} ns です。`,
  });
  return steps;
}

export const CACHE_PATTERNS = {
  sequential: { label: '配列を順に読む', note: '空間的局所性', addresses: Array.from({ length: 16 }, (_, i) => i) },
  loop: { label: '同じ所を繰り返す', note: '時間的局所性', addresses: [0, 4, 8, 0, 4, 8, 0, 4, 8, 0, 4, 8] },
  stride: { label: '飛び飛びに読む', note: '局所性なし', addresses: [0, 4, 8, 12, 16, 20, 0, 4, 8, 12, 16, 20] },
} as const;
export type CachePattern = keyof typeof CACHE_PATTERNS;
