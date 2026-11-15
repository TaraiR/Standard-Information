/** ページ置換アルゴリズム（FIFO・LRU・OPT）のシミュレーション */

export type Replace = 'fifo' | 'lru' | 'opt';
export const REPLACE_LABEL: Record<Replace, string> = {
  fifo: 'FIFO（最も古く読み込んだページ）',
  lru: 'LRU（最も長く使われていないページ）',
  opt: 'OPT（今後最も長く使われないページ）',
};

export interface PageStep {
  index: number;            // 何番目の参照か（0 = 開始前）
  page: number | null;
  frames: (number | null)[];
  fault: boolean | null;
  evicted: number | null;
  slot: number | null;      // 読み込んだ／参照した枠
  faults: number;
  history: ('F' | 'H')[];
  message: string;
}

export function simulatePaging(algo: Replace, refs: number[], frameCount: number): PageStep[] {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const loadedAt: number[] = Array(frameCount).fill(-1);
  const usedAt: number[] = Array(frameCount).fill(-1);
  const history: ('F' | 'H')[] = [];
  let faults = 0;
  const steps: PageStep[] = [{
    index: 0, page: null, frames: [...frames], fault: null, evicted: null, slot: null, faults: 0, history: [],
    message: `物理メモリの枠は ${frameCount} つです。ページを順に参照し、枠にないとページフォルト（補助記憶から読み込み）が起きます。満杯なら ${REPLACE_LABEL[algo]} を追い出します。`,
  }];

  refs.forEach((page, i) => {
    const at = frames.indexOf(page);
    let message: string;
    let slot: number;
    let evicted: number | null = null;
    if (at >= 0) {
      slot = at;
      usedAt[at] = i;
      history.push('H');
      message = `ページ ${page} はすでに物理メモリにあるので、そのまま使えます（ページフォルトなし）。`;
    } else {
      faults++;
      history.push('F');
      const empty = frames.indexOf(null);
      if (empty >= 0) {
        slot = empty;
        message = `ページ ${page} がないのでページフォルト。空いている枠に読み込みます。`;
      } else {
        slot = victim(i);
        evicted = frames[slot];
        message = `ページ ${page} がないのでページフォルト。枠が満杯なので、${algoReason(slot, i)}ページ ${evicted} を追い出して読み込みます。`;
      }
      frames[slot] = page;
      loadedAt[slot] = i;
      usedAt[slot] = i;
    }
    steps.push({ index: i + 1, page, frames: [...frames], fault: at < 0, evicted, slot, faults, history: [...history], message });
  });

  steps.push({
    ...steps[steps.length - 1], index: refs.length,
    message: `${refs.length} 回の参照で、ページフォルトは ${faults} 回でした。アルゴリズムを切り替えて回数を比べてみましょう（OPT は理論上の最少回数ですが、将来の参照を知る必要があるので実際には使えません）。`,
  });
  return steps;

  function victim(i: number): number {
    const idx = frames.map((_, k) => k);
    if (algo === 'fifo') return idx.reduce((a, k) => (loadedAt[k] < loadedAt[a] ? k : a), 0);
    if (algo === 'lru') return idx.reduce((a, k) => (usedAt[k] < usedAt[a] ? k : a), 0);
    // OPT: 次に使われるのが最も遠い（または二度と使われない）ページ
    const nextUse = (k: number) => {
      const n = refs.indexOf(frames[k] as number, i + 1);
      return n < 0 ? Infinity : n;
    };
    return idx.reduce((a, k) => (nextUse(k) > nextUse(a) ? k : a), 0);
  }
  function algoReason(slot: number, i: number): string {
    if (algo === 'fifo') return '最も早く読み込まれた';
    if (algo === 'lru') return '最も長い間使われていない';
    const n = refs.indexOf(frames[slot] as number, i + 1);
    return n < 0 ? 'この先もう使われない' : '次に使われるのが最も先の';
  }
}
