/** 論理演算（ビットごと）とシフト演算（論理・算術）の手順を生成する */
import { bitString, signedOf, toBits, unsignedOf, type Bit } from '../bits';
import type { CellTone } from '../ui';

export const WIDTH = 8;

// ---------- 論理演算 ----------
export type LogicOp = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'NOT';

export function applyOp(op: LogicOp, a: Bit, b: Bit): Bit {
  switch (op) {
    case 'AND': return (a & b) as Bit;
    case 'OR': return (a | b) as Bit;
    case 'XOR': return (a ^ b) as Bit;
    case 'NAND': return (1 - (a & b)) as Bit;
    case 'NOR': return (1 - (a | b)) as Bit;
    case 'NOT': return (1 - a) as Bit;
  }
}

const OP_HINT: Record<LogicOp, string> = {
  AND: 'AND は「マスク」に使います。B が 1 の桁だけ A の値を取り出し、B が 0 の桁は 0 にできます。',
  OR: 'OR は B が 1 の桁を必ず 1 にできます（特定のビットを立てる操作）。',
  XOR: 'XOR は B が 1 の桁だけ A を反転できます。同じ値どうしの XOR は 0 になります。',
  NAND: 'NAND は AND の結果を反転したものです。NAND だけですべての論理演算を作れます（汎用ゲート）。',
  NOR: 'NOR は OR の結果を反転したものです。NOR だけでもすべての論理演算を作れます（汎用ゲート）。',
  NOT: 'NOT は全ビットを反転します。2の補数を求める最初の手順でもあります。',
};

export interface LogicStep {
  a: Bit[];
  b: Bit[];
  out: (Bit | null)[];
  col: number | null;
  /** 真理値表の行（A,B = 00,01,10,11 → 0〜3。NOT は A = 0,1 → 0,1） */
  tableRow: number | null;
  message: string;
  done: boolean;
}

export function traceLogic(op: LogicOp, aValue: number, bValue: number): LogicStep[] {
  const a = toBits(aValue, WIDTH);
  const b = toBits(bValue, WIDTH);
  const out: (Bit | null)[] = Array(WIDTH).fill(null);
  const unary = op === 'NOT';
  const steps: LogicStep[] = [{
    a, b, out: [...out], col: null, tableRow: null, done: false,
    message: unary
      ? `A = ${bitString(a)} の各ビットに NOT を行います。ビットごとに独立して計算します。`
      : `A = ${bitString(a)} と B = ${bitString(b)} の ${op} を、同じ位置のビットどうしで1桁ずつ計算します。`,
  }];
  for (let i = 0; i < WIDTH; i++) {
    out[i] = applyOp(op, a[i], b[i]);
    steps.push({
      a, b, out: [...out], col: i, done: false,
      tableRow: unary ? a[i] : a[i] * 2 + b[i],
      message: unary
        ? `左から ${i + 1} 桁目: NOT ${a[i]} = ${out[i]}`
        : `左から ${i + 1} 桁目: ${a[i]} ${op} ${b[i]} = ${out[i]}（真理値表の A=${a[i]}, B=${b[i]} の行）`,
    });
  }
  const result = out as Bit[];
  steps.push({
    a, b, out: result, col: null, tableRow: null, done: true,
    message: `結果は ${bitString(result)}（10進数で ${unsignedOf(result)}）です。${OP_HINT[op]}`,
  });
  return steps;
}

// ---------- シフト演算 ----------
export type ShiftKind = 'logical' | 'arith';
export type ShiftDir = 'left' | 'right';

export interface ShiftCell { id: number; bit: Bit; tone: CellTone }

export interface ShiftStep {
  cells: ShiftCell[];
  /** あふれたビット（古い順） */
  out: ShiftCell[];
  value: number;
  overflow: boolean;
  count: number;
  message: string;
}

const valueOf = (kind: ShiftKind, cells: ShiftCell[]) => {
  const bits = cells.map(c => c.bit);
  return kind === 'arith' ? signedOf(bits) : unsignedOf(bits);
};

export function traceShift(kind: ShiftKind, dir: ShiftDir, start: number, amount: number): ShiftStep[] {
  let cells: ShiftCell[] = toBits(start, WIDTH).map((bit, i) => ({ id: i, bit, tone: kind === 'arith' && i === 0 ? 'focus' : 'range' }));
  const out: ShiftCell[] = [];
  let nextId = WIDTH;
  let overflow = false;
  const initial = valueOf(kind, cells);
  const steps: ShiftStep[] = [{
    cells, out: [], value: initial, overflow: false, count: 0,
    message: `${kind === 'arith' ? '符号付き' : '符号なし'}整数 ${initial}（${bitString(cells.map(c => c.bit))}）を、` +
      `${kind === 'arith' ? '算術' : '論理'}${dir === 'left' ? '左' : '右'}シフトで ${amount} ビットずらします。` +
      (kind === 'arith' ? '算術シフトでは、最上位の符号ビットは動かしません。' : ''),
  }];

  for (let k = 1; k <= amount; k++) {
    const prev = valueOf(kind, cells);
    const bits = cells.map(c => c.bit);
    const settled = cells.map(c => ({ ...c, tone: (kind === 'arith' && c === cells[0] ? 'focus' : 'range') as CellTone }));
    let lost: ShiftCell;
    let message: string;
    if (kind === 'logical' && dir === 'left') {
      lost = settled[0];
      cells = [...settled.slice(1), { id: nextId++, bit: 0, tone: 'done' }];
      const v = valueOf(kind, cells);
      message = `全ビットを左へ 1 つずらし、空いた右端に 0 を入れます。左端からあふれた「${lost.bit}」は捨てられます。` +
        (lost.bit ? `あふれたのが 1 なので、${prev} × 2 = ${prev * 2} は8ビットに収まらず、値は ${v} になります。`
          : `値は ${prev} × 2 = ${v} です。`);
    } else if (kind === 'logical') {
      lost = settled[WIDTH - 1];
      cells = [{ id: nextId++, bit: 0, tone: 'done' }, ...settled.slice(0, WIDTH - 1)];
      const v = valueOf(kind, cells);
      message = `全ビットを右へ 1 つずらし、空いた左端に 0 を入れます。右端からあふれた「${lost.bit}」は捨てられます。` +
        `値は ${prev} ÷ 2 = ${v}${prev % 2 ? '（余りの 1 は捨てられる）' : ''} です。`;
    } else if (dir === 'right') {
      const sign = bits[0];
      lost = settled[WIDTH - 1];
      cells = [settled[0], { id: nextId++, bit: sign, tone: 'done' }, ...settled.slice(1, WIDTH - 1)];
      const v = valueOf(kind, cells);
      message = `符号ビット（${sign}）はそのままにして、残りの7ビットを右へずらし、空いた桁に符号ビットと同じ「${sign}」を入れます。` +
        (prev % 2 === 0
          ? `値は ${prev} ÷ 2 = ${v} です。`
          : `値は ${prev} → ${v} です（${prev} ÷ 2 = ${prev / 2} を小さい方の整数に切り捨て）。`);
    } else {
      const sign = bits[0];
      lost = settled[1];
      cells = [settled[0], ...settled.slice(2), { id: nextId++, bit: 0, tone: 'done' }];
      const v = valueOf(kind, cells);
      const ov = lost.bit !== sign;
      overflow = overflow || ov;
      message = `符号ビット（${sign}）はそのままにして、残りの7ビットを左へずらし、空いた右端に 0 を入れます。` +
        (ov
          ? `符号ビットと違う「${lost.bit}」があふれたので、オーバーフローです。${prev} × 2 = ${prev * 2} は −128〜127 の範囲外で、結果の ${v} は正しくありません。`
          : `値は ${prev} × 2 = ${v} です。`);
    }
    out.push({ ...lost, tone: 'muted' });
    steps.push({ cells, out: [...out], value: valueOf(kind, cells), overflow, count: k, message });
  }

  const finalValue = valueOf(kind, cells);
  const factor = 2 ** amount;
  steps.push({
    cells: cells.map(c => ({ ...c, tone: kind === 'arith' && c === cells[0] ? 'focus' : 'done' })),
    out: [...out], value: finalValue, overflow, count: amount,
    message: `${amount} ビットの${dir === 'left' ? '左' : '右'}シフトで ${initial} → ${finalValue} になりました。` +
      (dir === 'left'
        ? (overflow || finalValue !== initial * factor
          ? `あふれが起きたため、× 2^${amount}（× ${factor}）の結果にはなっていません。`
          : `あふれがなければ、${amount} ビット左シフトは × 2^${amount}（× ${factor}）と同じです。`)
        : `${amount} ビット右シフトは ÷ 2^${amount}（÷ ${factor}）の${kind === 'arith' && initial < 0 ? '結果を小さい方へ切り捨てたもの' : '商（余りは捨てる）'}と同じです。`),
  });
  return steps;
}
