/** 基数変換（10進→2進の割り算法、2進→10進の重み法、2進→16進・8進）の手順を生成する */
import { bitString, toBits, unsignedOf, type Bit } from '../bits';
import type { CellTone } from '../ui';

export const WIDTH = 8;
export const WEIGHTS = Array.from({ length: WIDTH }, (_, i) => 2 ** (WIDTH - 1 - i));

export type BaseMode = 'div' | 'weight' | 'hex' | 'oct';

export interface DivisionRow { n: number; q: number; r: Bit }
/** start〜end は 8ビット列の添字（0 = MSB） */
export interface BitGroup { start: number; end: number; digit: string | null; active: boolean }

export interface BaseStep {
  bits: (Bit | null)[];
  tones: CellTone[];
  rows: DivisionRow[];
  activeRow: number | null;
  readUp: boolean;
  groups: BitGroup[];
  sum: number | null;
  message: string;
  result: string | null;
}

const blank = (): Omit<BaseStep, 'message'> => ({
  bits: Array(WIDTH).fill(null), tones: Array(WIDTH).fill('muted'), rows: [], activeRow: null,
  readUp: false, groups: [], sum: null, result: null,
});

/** 先頭の0を除いた2進数表記（0 は "0"） */
export const binaryOf = (n: number) => n.toString(2);

export function traceDivision(n: number): BaseStep[] {
  const steps: BaseStep[] = [{
    ...blank(),
    message: `10進数の ${n} を 2 で割り続け、余りを順に書き出します。商が 0 になったら終わりです。`,
  }];
  if (n === 0) {
    steps.push({ ...blank(), bits: toBits(0, WIDTH), tones: Array(WIDTH).fill('done'), result: '0',
      message: '0 は 2 で割るまでもなく、2進数でも 0 です。8ビットで書くと 0000 0000 です。' });
    return steps;
  }
  const bits: (Bit | null)[] = Array(WIDTH).fill(null);
  const rows: DivisionRow[] = [];
  let x = n;
  let pos = WIDTH - 1;
  while (x > 0) {
    const q = Math.floor(x / 2);
    const r = (x % 2) as Bit;
    rows.push({ n: x, q, r });
    bits[pos] = r;
    const tones: CellTone[] = bits.map((b, i) => (i === pos ? 'focus' : b === null ? 'muted' : 'range'));
    steps.push({
      ...blank(), bits: [...bits], tones, rows: [...rows], activeRow: rows.length - 1,
      message: `${x} ÷ 2 = ${q} 余り ${r}。この余り ${r} が 2^${WIDTH - 1 - pos}（${2 ** (WIDTH - 1 - pos)}）の位になります。` +
        (q === 0 ? '商が 0 になったので、割り算はここで終わりです。' : `次は商の ${q} を 2 で割ります。`),
    });
    x = q;
    pos--;
  }
  const final = toBits(n, WIDTH);
  const sig = binaryOf(n).length;
  steps.push({
    ...blank(), bits: final, rows: [...rows], readUp: true,
    tones: final.map((_, i) => (i >= WIDTH - sig ? 'done' : 'muted')),
    result: binaryOf(n),
    message: `余りを下から上へ（最後に出た余りから順に）読むと ${binaryOf(n)}(2) です。` +
      (sig < WIDTH ? `8ビットで表すときは、空いている上位の桁を 0 で埋めて ${bitString(final)} とします。` : ''),
  });
  return steps;
}

export function traceWeights(n: number): BaseStep[] {
  const bits = toBits(n, WIDTH);
  const steps: BaseStep[] = [{
    ...blank(), bits, tones: Array(WIDTH).fill('plain'), sum: 0,
    message: `2進数 ${bitString(bits)} を10進数に直します。各桁の「重み」（右から 1, 2, 4, 8 … と2倍ずつ）を、その桁が 1 のときだけ足し合わせます。`,
  }];
  let sum = 0;
  for (let i = 0; i < WIDTH; i++) {
    const w = WEIGHTS[i];
    sum += bits[i] * w;
    const tones: CellTone[] = bits.map((b, j) => (j === i ? 'focus' : j < i ? (b ? 'done' : 'muted') : 'plain'));
    steps.push({
      ...blank(), bits, tones, sum,
      message: bits[i]
        ? `2^${WIDTH - 1 - i} = ${w} の位は 1 なので ${w} を足します。ここまでの合計は ${sum} です。`
        : `2^${WIDTH - 1 - i} = ${w} の位は 0 なので足しません。ここまでの合計は ${sum} です。`,
    });
  }
  const terms = bits.map((b, i) => (b ? WEIGHTS[i] : 0)).filter(Boolean);
  steps.push({
    ...blank(), bits, tones: bits.map(b => (b ? 'done' : 'muted')), sum, result: String(n),
    message: `${terms.length ? terms.join(' + ') : '0'} = ${n}。よって ${bitString(bits)}(2) = ${n}(10) です。`,
  });
  return steps;
}

const HEX = '0123456789ABCDEF';

export function traceGroups(n: number, size: 3 | 4): BaseStep[] {
  const bits = toBits(n, WIDTH);
  const radix = size === 4 ? 16 : 8;
  const name = size === 4 ? '16進数' : '8進数';
  // 右（下位）から size 桁ずつ区切る
  const groups: BitGroup[] = [];
  for (let end = WIDTH - 1; end >= 0; end -= size) {
    groups.unshift({ start: Math.max(0, end - size + 1), end, digit: null, active: false });
  }
  const steps: BaseStep[] = [{
    ...blank(), bits, tones: Array(WIDTH).fill('plain'), groups: groups.map(g => ({ ...g })),
    message: `2進数の ${size} 桁は、${name}のちょうど 1 桁に対応します（2^${size} = ${radix}）。` +
      `${bitString(bits, size)} を右から ${size} 桁ずつ区切ります。`,
  }];
  const done: BitGroup[] = groups.map(g => ({ ...g }));
  done.forEach((g, gi) => {
    const part = bits.slice(g.start, g.end + 1) as Bit[];
    const width = g.end - g.start + 1;
    const value = unsignedOf(part);
    const ws = Array.from({ length: width }, (_, i) => 2 ** (width - 1 - i));
    const terms = part.map((b, i) => (b ? ws[i] : 0)).filter(Boolean);
    g.digit = HEX[value];
    const view = done.map((x, xi) => ({ ...x, active: xi === gi }));
    steps.push({
      ...blank(), bits, groups: view,
      tones: bits.map((_, i) => (i >= g.start && i <= g.end ? 'focus' : done.some((x, xi) => xi < gi && i >= x.start && i <= x.end) ? 'done' : 'plain')),
      message: `${part.join('')} を重み ${ws.join('・')} で計算すると ${terms.length ? terms.join(' + ') : '0'} = ${value} なので、${name}の「${HEX[value]}」です。` +
        (width < size ? `左端は ${width} 桁しかないので、上に 0 を補って ${'0'.repeat(size - width)}${part.join('')} と考えます。` : ''),
    });
  });
  const result = n.toString(radix).toUpperCase();
  steps.push({
    ...blank(), bits, groups: done.map(g => ({ ...g, active: false })), tones: Array(WIDTH).fill('done'), result,
    message: `各グループの数字を並べると ${result}(${radix}) です。` +
      (size === 4 ? `プログラムでは 0x${result.padStart(2, '0')} と書くこともあります。` : '') +
      `（10進数では ${n}）`,
  });
  return steps;
}

export function traceBase(mode: BaseMode, n: number): BaseStep[] {
  switch (mode) {
    case 'div': return traceDivision(n);
    case 'weight': return traceWeights(n);
    case 'hex': return traceGroups(n, 4);
    case 'oct': return traceGroups(n, 3);
  }
}
