/**
 * 10進数の小数を IEEE 754 単精度（32ビット）に変換する手順を生成する。
 * 2進数への変換と丸めは BigInt による厳密な有理数計算で行い、JavaScript の浮動小数点誤差を持ち込まない。
 * 丸めは IEEE 754 の既定である「最近接偶数丸め」。
 */
import type { Bit } from '../bits';

export interface FractionRow { before: string; after: string; digit: Bit }

export type FloatPhase = 'input' | 'sign' | 'int' | 'frac' | 'binary' | 'normalize' | 'exponent' | 'mantissa' | 'fields' | 'stored';

export interface FloatParsed {
  negative: boolean;
  /** |x| = num / den（den は 10 の累乗） */
  num: bigint;
  den: bigint;
  text: string;
}

export interface FloatResult {
  sign: Bit;
  exponent: number; // バイアス前の指数 e（1.xxx × 2^e）
  biased: number;
  exponentBits: Bit[];
  mantissaBits: Bit[];
  rounded: boolean;
  intBinary: string;
  fracRows: FractionRow[];
  fracDigits: string;
  /** 小数部の2進展開が循環するか（有限で終わらない） */
  repeating: boolean;
  /** 小数部の ×2 を表示上の上限で打ち切ったか */
  fracTruncated: boolean;
  /** 正規化（丸め前）の指数と、「1.」の後ろのビット（先頭から最大30ビット） */
  normExponent: number;
  normBits: string;
  normMore: boolean;
  /** 実際に格納される値（10進、厳密） */
  storedExact: string;
  /** 格納値 − 入力値（概算） */
  error: number;
  hex: string;
}

export interface FloatStep { phase: FloatPhase; message: string }

const MAX_FRAC_ROWS = 10;

export function parseDecimal(text: string): FloatParsed | null {
  const m = /^\s*([+-])?(\d{1,10})(?:\.(\d{1,6}))?\s*$/.exec(text);
  if (!m) return null;
  const frac = m[3] ?? '';
  const num = BigInt(m[2] + frac);
  if (num === 0n) return null; // 0 は指数部・仮数部がすべて0の特殊な値なので対象外
  return { negative: m[1] === '-', num, den: 10n ** BigInt(frac.length), text: text.trim() };
}

const decimalOf = (num: bigint, den: bigint): string => {
  // den は 10^k
  const k = den.toString().length - 1;
  const intPart = num / den;
  const fracPart = (num % den).toString().padStart(k, '0').replace(/0+$/, '');
  return fracPart ? `${intPart}.${fracPart}` : `${intPart}`;
};

const bitsOf = (value: number, width: number): Bit[] =>
  Array.from({ length: width }, (_, i) => ((value >> (width - 1 - i)) & 1) as Bit);

export function toFloat32(p: FloatParsed): FloatResult {
  const { num: N, den: D } = p;
  const intPart = N / D;
  let f = N % D;

  // 小数部 ×2 法（循環の検出つき）
  const fracRows: FractionRow[] = [];
  const seen = new Set<bigint>();
  let fracDigits = '';
  let repeating = false;
  while (f !== 0n && fracRows.length < MAX_FRAC_ROWS) {
    if (seen.has(f)) { repeating = true; break; }
    seen.add(f);
    const doubled = f * 2n;
    const digit: Bit = doubled >= D ? 1 : 0;
    fracRows.push({ before: decimalOf(f, D), after: decimalOf(doubled, D), digit });
    fracDigits += digit;
    f = doubled - (digit ? D : 0n);
  }
  if (f !== 0n && !repeating) {
    // 表示は打ち切ったが、続きに循環があるかを調べる（分母が 2^a × 5^b の形なら有限）
    let d = D / gcd(N % D, D);
    while (d % 2n === 0n) d /= 2n;
    repeating = d !== 1n;
  }

  // 指数 e: 2^e ≤ |x| < 2^(e+1)
  let e: number;
  if (intPart > 0n) e = intPart.toString(2).length - 1;
  else {
    e = 0;
    let g = N % D;
    while (g < D) { g *= 2n; e--; }
  }

  // 正規化: |x| / 2^e は [1, 2) にある。「1.」の後ろのビットを厳密に取り出す
  const normExponent = e;
  const nNum = e >= 0 ? N : N * 2n ** BigInt(-e);
  const nDen = e >= 0 ? D * 2n ** BigInt(e) : D;
  let rest = nNum - nDen;
  let normBits = '';
  while (rest !== 0n && normBits.length < 30) {
    rest *= 2n;
    if (rest >= nDen) { normBits += '1'; rest -= nDen; } else normBits += '0';
  }
  const normMore = rest !== 0n;

  // 有効数字24ビットに最近接偶数丸め
  const shift = 23 - e;
  const sNum = shift >= 0 ? N * 2n ** BigInt(shift) : N;
  const sDen = shift >= 0 ? D : D * 2n ** BigInt(-shift);
  let q = sNum / sDen;
  const r = sNum % sDen;
  const rounded = r !== 0n;
  if (2n * r > sDen || (2n * r === sDen && q % 2n === 1n)) q += 1n;
  if (q === 2n ** 24n) { q = 2n ** 23n; e += 1; }

  const biased = e + 127;
  const mantissa = Number(q - 2n ** 23n);
  const sign: Bit = p.negative ? 1 : 0;
  const exponentBits = bitsOf(biased, 8);
  const mantissaBits = bitsOf(mantissa, 23);
  const word = (sign * 2 ** 31) + biased * 2 ** 23 + mantissa;

  // 格納値 = q × 2^(e−23) を厳密な10進表記に
  const exp2 = e - 23;
  let storedExact: string;
  let errNum: bigint;
  let errDen: bigint;
  if (exp2 >= 0) {
    const v = q * 2n ** BigInt(exp2);
    storedExact = v.toString();
    errNum = v * D - N;
    errDen = D;
  } else {
    const k = BigInt(-exp2);
    const scaled = q * 5n ** k; // q / 2^k = q*5^k / 10^k
    storedExact = decimalOf(scaled, 10n ** k);
    errNum = q * D - N * 2n ** k;
    errDen = D * 2n ** k;
  }

  return {
    sign, exponent: e, biased, exponentBits, mantissaBits, rounded,
    intBinary: intPart.toString(2), fracRows, fracDigits, repeating, fracTruncated: f !== 0n,
    normExponent, normBits, normMore,
    storedExact: (p.negative ? '-' : '') + storedExact,
    error: (p.negative ? -1 : 1) * Number(errNum) / Number(errDen),
    hex: word.toString(16).toUpperCase().padStart(8, '0'),
  };
}

function gcd(a: bigint, b: bigint): bigint {
  while (b) [a, b] = [b, a % b];
  return a < 0n ? -a : a;
}

/** 有効桁を絞って表示（長い10進数を省略） */
export function shorten(decimal: string, significant = 20): string {
  const neg = decimal.startsWith('-');
  const body = neg ? decimal.slice(1) : decimal;
  const firstSig = body.search(/[1-9]/);
  if (firstSig < 0) return decimal;
  let count = 0;
  let cut = body.length;
  for (let i = firstSig; i < body.length; i++) {
    if (/\d/.test(body[i])) count++;
    if (count === significant) { cut = i + 1; break; }
  }
  return (neg ? '-' : '') + body.slice(0, cut) + (cut < body.length ? '…' : '');
}

export function traceFloat(p: FloatParsed, r: FloatResult): FloatStep[] {
  const abs = decimalOf(p.num, p.den);
  const fracShown = r.fracDigits + (r.fracTruncated ? '…' : '');
  const binary = `${r.intBinary}${r.fracDigits ? '.' + fracShown : ''}`;
  const e = r.normExponent;
  const steps: FloatStep[] = [
    { phase: 'input', message: `10進数の ${p.text} を、IEEE 754 単精度（符号1ビット・指数部8ビット・仮数部23ビット）で表します。` },
    { phase: 'sign', message: `${p.negative ? '負' : '正'}の数なので、符号部は ${r.sign} です。以降は絶対値の ${abs} を2進数にします。` },
    { phase: 'int', message: `整数部 ${p.num / p.den} を2進数にすると ${r.intBinary} です（2で割り続けて余りを下から読む方法）。` },
    {
      phase: 'frac',
      message: r.fracRows.length === 0
        ? '小数部はないので、この手順は不要です。'
        : `小数部は「2倍して整数部分を取り出す」を繰り返します。取り出した数字を上から順に並べると 0.${fracShown} です。` +
          (r.repeating ? ' 同じ小数部が再び現れるので、この2進小数は無限に循環し、有限のビット数では正確に表せません。' : ''),
    },
    { phase: 'binary', message: `合わせると ${abs} = ${binary}(2) です。` },
    {
      phase: 'normalize',
      message: `小数点を${e >= 0 ? `左へ ${e}` : `右へ ${-e}`} 桁動かして「1.xxx × 2^指数」の形（正規化）にすると、指数は ${e} です。` +
        '先頭の「1.」は必ず 1 なので、格納しません（けち表現）。',
    },
    {
      phase: 'exponent',
      message: `指数部には ${r.exponent} に 127 を足した ${r.biased} を8ビットで入れます（バイアス表現）: ${r.exponentBits.join('')}` +
        (r.exponent !== e ? `（丸めで仮数が 2.0 に繰り上がったため、指数が ${e} から ${r.exponent} に1つ増えています）` : ''),
    },
    {
      phase: 'mantissa',
      message: `仮数部には「1.」の後ろのビットを23ビット分入れます。` +
        (r.rounded ? '24ビット目以降が残るので、最も近い値に丸めます（丸め誤差の原因）。' : 'ちょうど23ビット以内に収まるので、丸めは不要です。'),
    },
    { phase: 'fields', message: `32ビットを並べると、16進数で ${r.hex} になります。` },
    {
      phase: 'stored',
      message: r.rounded
        ? `実際に格納される値は ${shorten(r.storedExact)} で、入力の ${p.text} とは約 ${r.error.toPrecision(3)} ずれています。これが丸め誤差です。`
        : `格納される値は ${r.storedExact} で、入力と完全に一致します（誤差なし）。`,
    },
  ];
  return steps;
}
