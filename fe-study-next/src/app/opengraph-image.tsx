import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = '基本情報技術者試験 完全対策 — 図解でわかる無料学習サイト';

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' } }
    ).then(r => r.text());
    const m = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:woff2?)'\)/);
    if (!m) return null;
    return fetch(m[1]).then(r => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const fontData = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          background: '#282867',
          padding: '56px 64px 48px',
          fontFamily: fontData ? 'NotoSansJP' : 'sans-serif',
        }}
      >
        {/* Top: site tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              background: '#2da3d9',
              color: '#fff',
              borderRadius: 8,
              padding: '6px 18px',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            無料学習サイト
          </div>
        </div>

        {/* Main text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: '#feffff', fontSize: 68, fontWeight: 700, lineHeight: 1.2 }}>
            基本情報技術者試験
          </div>
          <div style={{ color: '#2da3d9', fontSize: 46, fontWeight: 700 }}>
            完全対策
          </div>
          <div style={{ color: '#b0c4d8', fontSize: 28, marginTop: 8 }}>
            図解でわかりやすく学べる無料学習サイト
          </div>
        </div>

        {/* Bottom: badges + URL */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {(['科目A 対応', '科目B 対応', '章末問題付き'] as const).map((label) => (
              <div
                key={label}
                style={{
                  background: 'rgba(45,163,217,0.18)',
                  color: '#2da3d9',
                  border: '1.5px solid #2da3d9',
                  borderRadius: 8,
                  padding: '8px 20px',
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div style={{ color: '#6b8ba4', fontSize: 18 }}>
            standard-information.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'NotoSansJP', data: fontData, weight: 700, style: 'normal' }]
        : [],
    }
  );
}
