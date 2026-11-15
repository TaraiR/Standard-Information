/** 逐次処理とパイプライン処理を、クロックごとに実際に進めて記録する */

export const STAGE_SETS: Record<number, string[]> = {
  3: ['F', 'D', 'E'],
  4: ['F', 'D', 'E', 'W'],
  5: ['F', 'D', 'E', 'M', 'W'],
};
export const STAGE_NAMES: Record<string, string> = {
  F: 'フェッチ', D: 'デコード', E: '実行', M: 'メモリアクセス', W: '書き戻し',
};

export type PipeMode = 'seq' | 'pipe';

export interface PipeStep {
  clock: number;
  /** grid[命令][クロック-1] = 段の記号（その時点までに実行済みのもの）。未実行は null */
  grid: (string | null)[][];
  /** このクロックで動いている（命令, 段） */
  current: { instr: number; stage: string }[];
  completed: number;
  message: string;
}

/** 命令 i（0始まり）がクロック t（1始まり）で処理している段の番号。処理していなければ -1 */
export function stageAt(mode: PipeMode, m: number, i: number, t: number): number {
  const s = mode === 'pipe' ? t - 1 - i : t - 1 - i * m;
  return s >= 0 && s < m ? s : -1;
}

export const totalClocks = (mode: PipeMode, m: number, n: number) => (mode === 'pipe' ? m + (n - 1) : m * n);

export function tracePipeline(mode: PipeMode, m: number, n: number): PipeStep[] {
  const stages = STAGE_SETS[m];
  const total = totalClocks(mode, m, n);
  const grid: (string | null)[][] = Array.from({ length: n }, () => Array(total).fill(null));
  const steps: PipeStep[] = [{
    clock: 0, grid: grid.map(r => [...r]), current: [], completed: 0,
    message: `${m}段（${stages.map(s => STAGE_NAMES[s]).join('・')}）の命令 ${n} 個を、` +
      `${mode === 'pipe' ? 'パイプラインで（前の命令が終わるのを待たずに、段をずらして重ねて）' : '逐次処理で（1命令ずつ順番に）'}実行します。`,
  }];
  let completed = 0;
  for (let t = 1; t <= total; t++) {
    const current: PipeStep['current'] = [];
    for (let i = 0; i < n; i++) {
      const s = stageAt(mode, m, i, t);
      if (s >= 0) {
        grid[i][t - 1] = stages[s];
        current.push({ instr: i, stage: stages[s] });
        if (s === m - 1) completed++;
      }
    }
    const list = current.map(c => `命令${c.instr + 1}が${STAGE_NAMES[c.stage]}`).join('、');
    steps.push({
      clock: t, grid: grid.map(r => [...r]), current, completed,
      message: `クロック ${t}: ${list}。` +
        (mode === 'pipe' && current.length > 1 ? `${current.length} 個の命令が同時に別々の段を処理しています。` : '') +
        `完了した命令は ${completed} 個です。`,
    });
  }
  const other = totalClocks(mode === 'pipe' ? 'seq' : 'pipe', m, n);
  steps.push({
    clock: total, grid: grid.map(r => [...r]), current: [], completed,
    message: mode === 'pipe'
      ? `全 ${n} 命令が ${total} クロックで完了しました。式で書くと 段数 + (命令数 − 1) = ${m} + (${n} − 1) = ${total} です。` +
        `逐次処理なら ${m} × ${n} = ${other} クロックかかるので、約 ${(other / total).toFixed(2)} 倍速くなりました。`
      : `全 ${n} 命令が ${total} クロック（${m} × ${n}）で完了しました。パイプラインなら ${m} + (${n} − 1) = ${other} クロックで済みます。`,
  });
  return steps;
}
