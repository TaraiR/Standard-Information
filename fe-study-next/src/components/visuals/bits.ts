/** ビット列の共通ユーティリティ（配列の先頭が MSB） */

export type Bit = 0 | 1;

/** value を width ビットで表す（負の値は 2^width で折り返した2の補数表現） */
export function toBits(value: number, width: number): Bit[] {
  const mod = 2 ** width;
  const u = ((value % mod) + mod) % mod;
  return Array.from({ length: width }, (_, i) => (Math.floor(u / 2 ** (width - 1 - i)) % 2) as Bit);
}

export const unsignedOf = (bits: readonly Bit[]): number => bits.reduce<number>((acc, b) => acc * 2 + b, 0);

export const signedOf = (bits: readonly Bit[]): number =>
  unsignedOf(bits) - (bits[0] === 1 ? 2 ** bits.length : 0);

/** 右から group 桁ごとに空白で区切った文字列（例: 0010 1101） */
export function bitString(bits: readonly (Bit | string)[], group = 4): string {
  return bits.map((b, i) => ((i > 0 && (bits.length - i) % group === 0) ? ' ' : '') + b).join('');
}

/** 整数として妥当なら値を、そうでなければ null を返すパーサを作る */
export const intInRange = (min: number, max: number) => (text: string): number | null => {
  const t = text.trim();
  if (!/^-?\d+$/.test(t)) return null;
  const n = Number(t);
  return n >= min && n <= max ? n : null;
};
