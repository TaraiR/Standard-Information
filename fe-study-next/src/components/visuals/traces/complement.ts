/** 8ビットの2の補数（負の数の作り方・読み方）の手順を生成する */
import { bitString, signedOf, toBits, unsignedOf, type Bit } from '../bits';
import type { CellTone } from '../ui';

export const WIDTH = 8;
export type ComplementMode = 'make' | 'read';

export interface ComplementRow {
  label: string;
  /** 9桁目（あふれた桁）を表示するときは先頭に入れる */
  bits: (Bit | '')[];
  tones: CellTone[];
  /** 各桁の上に書く繰り上がり（1 のときだけ表示） */
  carries?: (Bit | null)[];
}

export interface ComplementStep {
  rows: ComplementRow[];
  message: string;
  value: number | null;
}

const invert = (bits: readonly Bit[]) => bits.map(b => (b ? 0 : 1) as Bit);

/** bits + 1 を計算し、和と各桁への繰り上がり、最上位からのあふれを返す */
export function addOne(bits: readonly Bit[]) {
  const sum = [...bits];
  const carries: (Bit | null)[] = Array(bits.length).fill(null);
  let carry: Bit = 1;
  for (let i = bits.length - 1; i >= 0 && carry; i--) {
    const s = sum[i] + carry;
    sum[i] = (s % 2) as Bit;
    carry = (s >= 2 ? 1 : 0) as Bit;
    if (carry && i > 0) carries[i - 1] = 1;
  }
  return { sum, carries, carryOut: carry };
}

const tone = (bits: readonly (Bit | '')[], t: CellTone): CellTone[] => bits.map(() => t);

export function traceMake(n: number): ComplementStep[] {
  const p = Math.abs(n);
  const pos = toBits(p, WIDTH); // p = 128 のときも 1000 0000（符号なしとしての表現）
  const inv = invert(pos);
  const { sum: neg, carries, carryOut } = addOne(inv);
  const trailingOnes = inv.length - 1 - inv.lastIndexOf(0);
  const steps: ComplementStep[] = [];

  steps.push({
    rows: [], value: null,
    message: n > 0
      ? `+${n} の2の補数、つまり −${n} を8ビットで表すビット列を求めます。手順は「全ビット反転 → 1を足す」です。`
      : n < 0
        ? `−${p} を8ビットの2の補数で表します。まず絶対値の ${p} を2進数にし、「全ビット反転 → 1を足す」を行います。`
        : '0 の2の補数を求めてみます。−0 が 0 と同じビット列になることを確かめられます。',
  });
  steps.push({
    rows: [{ label: `${p}`, bits: pos, tones: tone(pos, 'range') }], value: p,
    message: `絶対値 ${p} を2進数にすると ${bitString(pos)} です。` +
      (p === 128 ? '※ +128 は8ビット符号付き（−128〜127）の範囲外ですが、ビット列としては同じ手順で −128 が求まります。' : ''),
  });
  steps.push({
    rows: [
      { label: `${p}`, bits: pos, tones: tone(pos, 'muted') },
      { label: '反転', bits: inv, tones: tone(inv, 'focus') },
    ],
    value: null,
    message: `全ビットを反転（0 ↔ 1）すると ${bitString(inv)} です。これを「1の補数」といいます。`,
  });
  steps.push({
    rows: [
      { label: '反転', bits: inv, tones: tone(inv, 'range'), carries },
      { label: '+1', bits: toBits(1, WIDTH), tones: tone(inv, 'plain') },
      { label: '結果', bits: neg, tones: neg.map((b, i) => (b !== inv[i] ? 'focus' : 'range')) },
    ],
    value: null,
    message: `1 を足します。` +
      (trailingOnes > 0
        ? `右端から 1 が ${trailingOnes} 個続いているので、その桁は 0 になって繰り上がりが伝わります（上の小さな 1 が繰り上がり）。`
        : '右端が 0 なので、その桁が 1 になるだけで繰り上がりはありません。') +
      (carryOut ? ' 8桁目からあふれた繰り上がりは捨てます。' : ''),
  });
  steps.push({
    rows: [{ label: `−${p}`, bits: neg, tones: neg.map((_, i) => (i === 0 ? 'focus' : 'done')) }],
    value: signedOf(neg),
    message: p === 0
      ? '結果は 0000 0000 で、0 に戻りました。2の補数表現では +0 と −0 の区別がなく、0 は1通りだけです。'
      : `${bitString(neg)} が −${p} の表現です。最上位ビット（MSB）が 1 なので負の数だと分かります。`,
  });
  const total = unsignedOf(pos) + unsignedOf(neg);
  const sumBits = toBits(total, WIDTH + 1);
  steps.push({
    rows: [
      { label: `${p}`, bits: ['', ...pos], tones: ['muted', ...tone(pos, 'range')] },
      { label: `+(−${p})`, bits: ['', ...neg], tones: ['muted', ...tone(neg, 'range')] },
      {
        label: '和', bits: total >= 2 ** WIDTH ? sumBits : ['', ...sumBits.slice(1)],
        tones: ['muted', ...tone(pos, 'done')],
      },
    ],
    value: 0,
    message: total >= 2 ** WIDTH
      ? `確認: ${p} + (−${p}) を2進数で足すと ${sumBits[0]} ${bitString(sumBits.slice(1))} になります。8ビットからあふれた9桁目の 1 を捨てると 0000 0000 = 0。正しく打ち消し合っています。`
      : `確認: ${p} + (−${p}) = 0000 0000 = 0 です。`,
  });
  return steps;
}

export function traceRead(n: number): ComplementStep[] {
  const bits = toBits(n, WIDTH);
  const steps: ComplementStep[] = [{
    rows: [{ label: '入力', bits, tones: tone(bits, 'plain') }], value: null,
    message: `8ビットの2の補数で表されたビット列 ${bitString(bits)} が、10進数でいくつかを読み取ります。`,
  }];
  if (bits[0] === 0) {
    steps.push({
      rows: [{ label: '入力', bits, tones: bits.map((_, i) => (i === 0 ? 'focus' : 'range')) }], value: n,
      message: `最上位ビット（MSB）が 0 なので正の数です。普通の2進数として重みを足せば ${n} になります。`,
    });
    return steps;
  }
  const inv = invert(bits);
  const { sum: abs, carries } = addOne(inv);
  const absValue = unsignedOf(abs);
  steps.push({
    rows: [{ label: '入力', bits, tones: bits.map((_, i) => (i === 0 ? 'focus' : 'range')) }], value: null,
    message: '最上位ビット（MSB）が 1 なので負の数です。もう一度2の補数をとると、絶対値が分かります。',
  });
  steps.push({
    rows: [
      { label: '入力', bits, tones: tone(bits, 'muted') },
      { label: '反転', bits: inv, tones: tone(inv, 'focus') },
    ],
    value: null,
    message: `全ビットを反転すると ${bitString(inv)} です。`,
  });
  steps.push({
    rows: [
      { label: '反転', bits: inv, tones: tone(inv, 'range'), carries },
      { label: '+1', bits: toBits(1, WIDTH), tones: tone(inv, 'plain') },
      { label: '絶対値', bits: abs, tones: tone(abs, 'done') },
    ],
    value: absValue,
    message: `1 を足すと ${bitString(abs)} = ${absValue} です。` +
      (absValue === 128 ? '（1000 0000 は8ビットでは −128 しか表せない特別なビット列で、2の補数をとっても同じ形に戻ります。）' : ''),
  });
  steps.push({
    rows: [{ label: '入力', bits, tones: tone(bits, 'done') }], value: n,
    message: `絶対値が ${absValue} なので、${bitString(bits)} は −${absValue} を表します。` +
      `（別の求め方: MSB の重みを −128 として足すと −128 + ${n + 128} = ${n} になります。）`,
  });
  return steps;
}
