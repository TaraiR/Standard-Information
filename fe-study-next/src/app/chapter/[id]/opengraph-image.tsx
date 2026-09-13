import { ImageResponse } from 'next/og';
import { curriculum, getChapterById } from '@/data/curriculum';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return curriculum.map(ch => ({ id: ch.id }));
}

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

export default async function Image({ params }: { params: { id: string } }) {
  const chapter = getChapterById(params.id);
  const fontData = await loadFont();

  const title = chapter?.title ?? '学習コンテンツ';
  const subject = chapter?.subject ?? 'A';
  const chIdx = chapter ? curriculum.findIndex(c => c.id === chapter.id) + 1 : 0;
  const subjectColor = subject === 'A' ? '#2563eb' : '#7c3aed';

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
          padding: '52px 64px 48px',
          fontFamily: fontData ? 'NotoSansJP' : 'sans-serif',
        }}
      >
        {/* Top: subject badge + chapter number */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              background: subjectColor,
              color: '#fff',
              borderRadius: 8,
              padding: '6px 20px',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            科目{subject}
          </div>
          {chIdx > 0 && (
            <div style={{ color: '#b0c4d8', fontSize: 22 }}>
              第{chIdx}章
            </div>
          )}
        </div>

        {/* Chapter title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              color: '#feffff',
              fontSize: title.length > 12 ? 54 : 66,
              fontWeight: 700,
              lineHeight: 1.25,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
            }}
          >
            <div style={{ width: 40, height: 4, background: '#2da3d9', borderRadius: 2 }} />
            <div style={{ flex: 1, height: 1, background: 'rgba(45,163,217,0.3)', marginLeft: 8 }} />
          </div>
        </div>

        {/* Bottom: site name */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              color: '#b0c4d8',
              fontSize: 22,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                background: '#2da3d9',
                borderRadius: 6,
                padding: '4px 12px',
                color: '#fff',
                fontSize: 18,
              }}
            >
              FE 対策
            </div>
            基本情報技術者試験 学習サイト
          </div>
          <div style={{ color: '#4a6580', fontSize: 18 }}>
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
