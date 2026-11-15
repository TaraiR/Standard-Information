/**
 * OGP 画像用の日本語フォント（Noto Sans JP Bold）を、画像内で使う文字だけに絞って取得する。
 *
 * - ImageResponse（satori）は woff2 を読めない。UA を付けずに取得すると truetype が返る。
 * - フォントが無いと ImageResponse は必ず失敗するため、取得できなければ原因が分かるエラーを投げる。
 */
export async function loadOgFont(text: string): Promise<ArrayBuffer> {
  const chars = Array.from(new Set(text)).join('');
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(chars)}`;
  const css = await fetch(cssUrl).then(r => r.text());
  const m = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype|woff)'\)/);
  if (!m) throw new Error(`OGP 用フォントの URL を取得できませんでした: ${cssUrl}`);

  const res = await fetch(m[1]);
  if (!res.ok) throw new Error(`OGP 用フォントのダウンロードに失敗しました: ${res.status}`);
  return res.arrayBuffer();
}

export const OG_FONT_NAME = 'NotoSansJP';
