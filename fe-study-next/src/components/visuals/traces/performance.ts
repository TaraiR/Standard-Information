/** CPU 性能（CPI・MIPS・実行時間）とアムダールの法則の計算手順 */

/** 有効数字を保ちつつ、余計な 0 を付けない表示 */
export function fmt(x: number, digits = 6): string {
  if (!Number.isFinite(x)) return '∞';
  if (x === 0) return '0';
  const r = Number(x.toPrecision(digits));
  return Math.abs(r) >= 1e15 || Math.abs(r) < 1e-6 ? r.toExponential() : r.toLocaleString('ja-JP', { maximumFractionDigits: 10 });
}

/** 秒を、読みやすい単位（秒・ミリ秒・マイクロ秒・ナノ秒）で */
export function fmtTime(sec: number): string {
  if (sec >= 1) return `${fmt(sec)} 秒`;
  if (sec >= 1e-3) return `${fmt(sec * 1e3)} ミリ秒`;
  if (sec >= 1e-6) return `${fmt(sec * 1e6)} マイクロ秒`;
  return `${fmt(sec * 1e9)} ナノ秒`;
}

export interface PerfInput { ghz: number; cpi: number; instructions: number }
export interface PerfResult { hz: number; mhz: number; cycles: number; seconds: number; mips: number; cycleNs: number }

export function computePerf({ ghz, cpi, instructions }: PerfInput): PerfResult {
  const hz = ghz * 1e9;
  const cycles = instructions * cpi;
  return { hz, mhz: ghz * 1000, cycles, seconds: cycles / hz, mips: (ghz * 1000) / cpi, cycleNs: 1 / ghz };
}

export interface PerfStep { phase: 'input' | 'clock' | 'cycles' | 'time' | 'mips'; message: string }

export function tracePerf(p: PerfInput, r: PerfResult): PerfStep[] {
  return [
    { phase: 'input', message: `クロック周波数 ${fmt(p.ghz)} GHz、CPI ${fmt(p.cpi)}（1命令あたり平均 ${fmt(p.cpi)} クロック）のCPUで、${fmt(p.instructions)} 命令のプログラムを実行します。` },
    { phase: 'clock', message: `${fmt(p.ghz)} GHz = ${fmt(p.ghz)} × 10⁹ Hz、つまり1秒間に ${fmt(r.hz)} 回クロックが刻まれます。1クロックの長さは 1 ÷ ${fmt(r.hz)} 秒 = ${fmt(r.cycleNs)} ナノ秒です。` },
    { phase: 'cycles', message: `必要なクロック数 = 命令数 × CPI = ${fmt(p.instructions)} × ${fmt(p.cpi)} = ${fmt(r.cycles)} クロックです。` },
    { phase: 'time', message: `実行時間 = クロック数 ÷ クロック周波数 = ${fmt(r.cycles)} ÷ ${fmt(r.hz)} = ${fmt(r.seconds)} 秒（${fmtTime(r.seconds)}）です。` },
    { phase: 'mips', message: `MIPS = クロック周波数(MHz) ÷ CPI = ${fmt(r.mhz)} ÷ ${fmt(p.cpi)} = ${fmt(r.mips)} MIPS。1秒間に ${fmt(r.mips)} 百万命令を実行できます。` },
  ];
}

// ---------- アムダールの法則 ----------
export interface AmdahlInput { percent: number; factor: number }
export interface AmdahlResult { p: number; rest: number; improved: number; newTime: number; speedup: number; limit: number }

export function computeAmdahl({ percent, factor }: AmdahlInput): AmdahlResult {
  const p = percent / 100;
  const improved = p / factor;
  const newTime = (1 - p) + improved;
  return { p, rest: 1 - p, improved, newTime, speedup: 1 / newTime, limit: p === 1 ? Infinity : 1 / (1 - p) };
}

export interface AmdahlStep { phase: 'before' | 'split' | 'improve' | 'after' | 'limit'; message: string }

export function traceAmdahl(a: AmdahlInput, r: AmdahlResult): AmdahlStep[] {
  return [
    { phase: 'before', message: `改善前の処理時間を 1 とします。このうち ${fmt(a.percent)}% の部分を ${fmt(a.factor)} 倍速くします。` },
    { phase: 'split', message: `改善できる部分は ${fmt(r.p)}、改善できない部分は 1 − ${fmt(r.p)} = ${fmt(r.rest)} です。` },
    { phase: 'improve', message: `改善できる部分は ${fmt(a.factor)} 倍速くなるので、${fmt(r.p)} ÷ ${fmt(a.factor)} = ${fmt(r.improved)} になります。改善できない部分 ${fmt(r.rest)} はそのままです。` },
    { phase: 'after', message: `改善後の時間は ${fmt(r.rest)} + ${fmt(r.improved)} = ${fmt(r.newTime)}。全体の速度向上率は 1 ÷ ${fmt(r.newTime)} ≒ ${fmt(r.speedup, 4)} 倍です。` },
    {
      phase: 'limit',
      message: r.limit === Infinity
        ? 'すべてを改善できるなら、倍率を上げるほど全体も速くなります。'
        : `改善する部分をどれだけ速くしても、改善できない ${fmt(r.rest)} が残るので、速度向上率は 1 ÷ ${fmt(r.rest)} ≒ ${fmt(r.limit, 4)} 倍を超えられません。これがアムダールの法則です。`,
    },
  ];
}
