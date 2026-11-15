'use client';

import { useEffect, useState } from 'react';

/** 文字列の SHA-256（16進）をブラウザの Web Crypto で計算する。計算中・非対応環境では null */
export function useSha256(text: string): string | null {
  const [result, setResult] = useState<{ text: string; hex: string } | null>(null);
  useEffect(() => {
    let alive = true;
    if (typeof crypto === 'undefined' || !crypto.subtle) return;
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(buf => {
      if (!alive) return;
      const hex = Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
      setResult({ text, hex });
    });
    return () => { alive = false; };
  }, [text]);
  return result && result.text === text ? result.hex : null;
}

/** 2つの16進文字列で、異なるビットの数 */
export function differingBits(a: string, b: string): number {
  let n = 0;
  for (let i = 0; i < a.length; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) { n += x & 1; x >>= 1; }
  }
  return n;
}
