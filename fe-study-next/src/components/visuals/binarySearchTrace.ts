/**
 * 二分探索を実際に実行し、各ステップの状態を記録する（描画から独立した純粋関数）。
 * 教材の表示はすべてこのトレース結果から作るため、図と説明がアルゴリズムとずれない。
 *
 * base: 要素番号の始まり。0 = このサイトの擬似コード、1 = 基本情報技術者試験の擬似言語（配列は1始まり）
 */

export type IndexBase = 0 | 1;
export type BinarySearchPhase = 'init' | 'mid' | 'compare' | 'move' | 'found' | 'notfound';

export interface BinarySearchStep {
  phase: BinarySearchPhase;
  /** 要素番号（base を反映した値） */
  left: number;
  right: number;
  mid: number | null;
  /** A[中央] を目標値と比較した回数 */
  comparisons: number;
  /** ハイライトする擬似コードの行（0始まり） */
  lines: number[];
  message: string;
}

export interface BinarySearchTrace {
  steps: BinarySearchStep[];
  /** 見つかった要素番号。見つからなければ -1 */
  result: number;
}

export function binarySearchCode(base: IndexBase): string[] {
  return [
    `左 ← ${base}`,
    base === 0 ? '右 ← Aの要素数 - 1' : '右 ← Aの要素数',
    '左 ≦ 右 の間、繰り返す',
    '    中央 ← (左 + 右) ÷ 2 の整数部分',
    '    もし A[中央] = 目標値 なら',
    '        中央 を返す          // 発見',
    '    そうでなく A[中央] < 目標値 なら',
    '        左 ← 中央 + 1        // 右半分を探す',
    '    そうでなければ',
    '        右 ← 中央 - 1        // 左半分を探す',
    '-1 を返す                    // 見つからなかった',
  ];
}

/** 要素数 n の配列に対する二分探索の最大比較回数 ⌊log₂n⌋ + 1 */
export function maxComparisons(n: number): number {
  return n <= 0 ? 0 : Math.floor(Math.log2(n)) + 1;
}

const rangeText = (left: number, right: number) =>
  left <= right
    ? `残りの探索範囲は A[${left}]〜A[${right}]（${right - left + 1}個）です。`
    : '探索範囲が空になりました。';

export function traceBinarySearch(sorted: number[], target: number, base: IndexBase = 0): BinarySearchTrace {
  const A = (i: number) => sorted[i - base];
  const steps: BinarySearchStep[] = [];
  let left = base;
  let right = sorted.length - 1 + base;
  let comparisons = 0;

  steps.push({
    phase: 'init', left, right, mid: null, comparisons, lines: [0, 1],
    message: `目標値 ${target} を探します。最初の探索範囲は配列全体で、左 = ${left}、右 = ${right} です。` +
      '二分探索は、配列が昇順に並んでいる（ソート済み）ことが前提です。',
  });

  while (left <= right) {
    const sum = left + right;
    const mid = Math.floor(sum / 2);
    steps.push({
      phase: 'mid', left, right, mid, comparisons, lines: [2, 3],
      message: `左(${left}) ≦ 右(${right}) なので繰り返します。中央 = (${left} + ${right}) ÷ 2 = ` +
        (sum % 2 === 0 ? `${mid}` : `${sum / 2} → 整数部分をとって ${mid}`) + ' です。',
    });

    comparisons++;
    const value = A(mid);

    if (value === target) {
      steps.push({
        phase: 'found', left, right, mid, comparisons, lines: [4, 5],
        message: `A[${mid}] = ${value} は目標値 ${target} と等しいので、発見です！ 要素番号 ${mid} を返します。` +
          `比較は ${comparisons} 回でした。`,
      });
      return { steps, result: mid };
    }

    if (value < target) {
      steps.push({
        phase: 'compare', left, right, mid, comparisons, lines: [4, 6],
        message: `A[${mid}] = ${value} は目標値 ${target} より小さいです。` +
          `配列は昇順なので、A[${mid}] 以下の要素に ${target} はありません。目標値があるとすれば右側です。`,
      });
      left = mid + 1;
      steps.push({
        phase: 'move', left, right, mid, comparisons, lines: [7],
        message: `左 ← 中央 + 1 = ${left} とし、左半分を探索範囲から外します。${rangeText(left, right)}`,
      });
    } else {
      steps.push({
        phase: 'compare', left, right, mid, comparisons, lines: [4, 6, 8],
        message: `A[${mid}] = ${value} は目標値 ${target} より大きいです。` +
          `配列は昇順なので、A[${mid}] 以上の要素に ${target} はありません。目標値があるとすれば左側です。`,
      });
      right = mid - 1;
      steps.push({
        phase: 'move', left, right, mid, comparisons, lines: [9],
        message: `右 ← 中央 - 1 = ${right} とし、右半分を探索範囲から外します。${rangeText(left, right)}`,
      });
    }
  }

  steps.push({
    phase: 'notfound', left, right, mid: null, comparisons, lines: [2, 10],
    message: `左(${left}) > 右(${right}) となり、繰り返しを終えます。探索範囲が空になったので、` +
      `目標値 ${target} は配列にありません。-1 を返します（比較 ${comparisons} 回）。`,
  });
  return { steps, result: -1 };
}
