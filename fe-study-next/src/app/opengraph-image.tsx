import { ImageResponse } from 'next/og';
import { loadOgFont, OG_FONT_NAME } from '@/lib/ogFont';
import { SITE_HOST } from '@/lib/site';

// edge を外し、章ページと同じくビルド時に静的生成する
export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = '基本情報技術者試験 完全対策 — 図解でわかる無料学習サイト';

const BADGES = ['科目A 対応', '科目B 対応', '章末問題付き'] as const;

export default async function Image() {
  const fontData = await loadOgFont(
    `無料学習サイト基本情報技術者試験完全対策図解でわかりやすく学べる無料学習サイト${BADGES.join('')}${SITE_HOST}`
  );

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
          fontFamily: OG_FONT_NAME,
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
            {BADGES.map((label) => (
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
            {SITE_HOST}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: OG_FONT_NAME, data: fontData, weight: 700, style: 'normal' }],
    }
  );
}
