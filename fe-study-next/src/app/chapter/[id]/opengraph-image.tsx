import { ImageResponse } from 'next/og';
import { curriculum, getChapterById } from '@/data/curriculum';
import { loadOgFont, OG_FONT_NAME } from '@/lib/ogFont';
import { SITE_HOST } from '@/lib/site';

// edge ランタイムは generateStaticParams と併用できずビルドが失敗するため指定しない（ビルド時に静的生成）
export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return curriculum.map(ch => ({ id: ch.id }));
}

const SITE_NAME = '基本情報技術者試験 学習サイト';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Next 16 では params は Promise
  const chapter = getChapterById(id);

  const title = chapter?.title ?? '学習コンテンツ';
  const subject = chapter?.subject ?? 'A';
  const chIdx = chapter ? curriculum.findIndex(c => c.id === chapter.id) + 1 : 0;
  const subjectColor = subject === 'A' ? '#2563eb' : '#7c3aed';
  const fontData = await loadOgFont(`科目${subject}第${chIdx}章${title}FE 対策${SITE_NAME}${SITE_HOST}`);

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
          fontFamily: OG_FONT_NAME,
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
            {`科目${subject}`}
          </div>
          {chIdx > 0 && (
            <div style={{ color: '#b0c4d8', fontSize: 22 }}>
              {`第${chIdx}章`}
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
            {SITE_NAME}
          </div>
          <div style={{ color: '#4a6580', fontSize: 18 }}>
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
