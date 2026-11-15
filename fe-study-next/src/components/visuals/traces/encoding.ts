/** 情報量（必要なビット数）と UTF-8 の符号化の手順を生成する */
import type { Bit } from '../bits';

// ---------- 必要なビット数 ----------
export interface BitsNeededStep { k: number; patterns: number; enough: boolean; message: string }

/** N 通りを区別するのに必要な最小ビット数 ⌈log₂N⌉（N ≥ 2） */
export const bitsNeeded = (n: number) => {
  let k = 0;
  while (2 ** k < n) k++;
  return k;
};

export function traceBitsNeeded(n: number): BitsNeededStep[] {
  const steps: BitsNeededStep[] = [{
    k: 0, patterns: 1, enough: false,
    message: `${n} 通りのものを区別するには、何ビットあればよいかを調べます。1ビット増えるごとに、表せるパターンは2倍になります。`,
  }];
  const need = bitsNeeded(n);
  for (let k = 1; k <= need; k++) {
    const patterns = 2 ** k;
    const enough = patterns >= n;
    steps.push({
      k, patterns, enough,
      message: `${k} ビットなら 2^${k} = ${patterns.toLocaleString()} 通り。` +
        (enough ? `${n.toLocaleString()} 通り以上あるので足ります。` : `${n.toLocaleString()} 通りには足りません。`),
    });
  }
  steps.push({
    k: need, patterns: 2 ** need, enough: true,
    message: `答えは ${need} ビットです（2^${need - 1} = ${(2 ** (need - 1)).toLocaleString()} < ${n.toLocaleString()} ≦ 2^${need} = ${(2 ** need).toLocaleString()}）。` +
      '式で書くと ⌈log₂N⌉（log₂N 以上の最小の整数）です。',
  });
  return steps;
}

// ---------- UTF-8 ----------
export interface Utf8Plan {
  char: string;
  codePoint: number;
  bytes: number;
  /** 符号位置を入れる x の桁数（ペイロード） */
  payload: number;
  /** 各バイトに入る符号位置のビット数 */
  segments: number[];
  /** 各バイトの先頭の固定ビット */
  prefixes: string[];
  codeBits: Bit[];
  encoded: number[];
}

export const UTF8_RANGES = [
  { bytes: 1, from: 0x0000, to: 0x007f, pattern: '0xxxxxxx', example: '英数字（ASCII と同じ）' },
  { bytes: 2, from: 0x0080, to: 0x07ff, pattern: '110xxxxx 10xxxxxx', example: 'ラテン文字の記号付き文字など' },
  { bytes: 3, from: 0x0800, to: 0xffff, pattern: '1110xxxx 10xxxxxx 10xxxxxx', example: 'ひらがな・カタカナ・漢字' },
  { bytes: 4, from: 0x10000, to: 0x10ffff, pattern: '11110xxx 10xxxxxx 10xxxxxx 10xxxxxx', example: '絵文字など' },
] as const;

const SEGMENTS: Record<number, number[]> = { 1: [7], 2: [5, 6], 3: [4, 6, 6], 4: [3, 6, 6, 6] };
const PREFIXES: Record<number, string[]> = {
  1: ['0'], 2: ['110', '10'], 3: ['1110', '10', '10'], 4: ['11110', '10', '10', '10'],
};

export const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');
export const codePointLabel = (cp: number) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;

export function planUtf8(char: string): Utf8Plan | null {
  const first = Array.from(char)[0];
  if (!first) return null;
  const cp = first.codePointAt(0)!;
  if (cp >= 0xd800 && cp <= 0xdfff) return null; // 単独のサロゲートは文字ではない
  const range = UTF8_RANGES.find(r => cp >= r.from && cp <= r.to)!;
  const segments = SEGMENTS[range.bytes];
  const payload = segments.reduce((a, b) => a + b, 0);
  const codeBits = Array.from({ length: payload }, (_, i) => ((cp >> (payload - 1 - i)) & 1) as Bit);
  const encoded: number[] = [];
  let pos = 0;
  segments.forEach((len, i) => {
    const bits = PREFIXES[range.bytes][i] + codeBits.slice(pos, pos + len).join('');
    encoded.push(parseInt(bits, 2));
    pos += len;
  });
  return {
    char: first, codePoint: cp, bytes: range.bytes, payload, segments,
    prefixes: PREFIXES[range.bytes], codeBits, encoded,
  };
}

export type Utf8Phase = 'char' | 'range' | 'bits' | 'template' | 'fill' | 'bytes';
export interface Utf8Step { phase: Utf8Phase; message: string }

export function traceUtf8(p: Utf8Plan): Utf8Step[] {
  const range = UTF8_RANGES[p.bytes - 1];
  return [
    { phase: 'char', message: `文字「${p.char}」の Unicode の符号位置（コードポイント）は ${codePointLabel(p.codePoint)}（10進数で ${p.codePoint}）です。` },
    {
      phase: 'range',
      message: `${codePointLabel(p.codePoint)} は ${codePointLabel(range.from)}〜${codePointLabel(range.to)} の範囲なので、UTF-8 では ${p.bytes} バイトで表します（${range.example}）。`,
    },
    {
      phase: 'bits',
      message: `符号位置を2進数にし、${p.payload} 桁になるよう上位を 0 で埋めます。` +
        (p.bytes > 1 ? `これを上から ${p.segments.join('・')} ビットに区切ります。` : ''),
    },
    {
      phase: 'template',
      message: `${p.bytes} バイトの型は「${range.pattern}」です。` +
        (p.bytes > 1 ? `先頭バイトの 1 の個数がバイト数を表し、2バイト目以降は必ず 10 で始まります。` : '先頭が 0 なら1バイト文字です。'),
    },
    { phase: 'fill', message: '区切ったビットを、型の x の部分に上から順に入れます。' },
    {
      phase: 'bytes',
      message: `16進数にすると ${p.encoded.map(hex2).join(' ')} の ${p.bytes} バイトです。` +
        (p.bytes === 1 ? 'ASCII と同じ値なので、英数字だけのテキストは ASCII と UTF-8 で同じバイト列になります。' : ''),
    },
  ];
}
