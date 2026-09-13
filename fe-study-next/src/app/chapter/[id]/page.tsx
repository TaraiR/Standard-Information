import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { curriculum, getChapterById } from '@/data/curriculum';
import ChapterContent from '@/components/ChapterContent';
import { chapterDescriptions } from '@/data/chapterSeo';

const SITE_URL = 'https://standard-information.vercel.app';

// ビルド時に全章のパスを静的生成
export function generateStaticParams() {
  return curriculum.map(ch => ({ id: ch.id }));
}

// 各章ページのメタデータを動的生成
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const chapter = getChapterById(id);
  if (!chapter) return {};

  const chapterIndex = curriculum.findIndex(c => c.id === id) + 1;
  const title = `${chapter.title}【第${chapterIndex}章・科目${chapter.subject}】基本情報技術者試験対策`;
  const description = chapterDescriptions[id]
    ?? chapter.description + ` 図解・練習問題付きで${chapter.title}を徹底解説。基本情報技術者試験（FE試験）完全対策。`;
  const url = `${SITE_URL}/chapter/${id}`;
  const keywords = [
    chapter.title, `科目${chapter.subject}`, '基本情報技術者試験', 'FE試験',
    ...chapter.sections.map(s => s.title),
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: `${SITE_URL}/chapter/${id}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/chapter/${id}/opengraph-image`],
    },
  };
}

export default async function ChapterPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chapter = getChapterById(id);
  if (!chapter) notFound();

  const chapterIndex = curriculum.findIndex(c => c.id === id);
  const prevChapter = chapterIndex > 0 ? curriculum[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < curriculum.length - 1 ? curriculum[chapterIndex + 1] : null;

  const chapterUrl = `${SITE_URL}/chapter/${id}`;
  const subjectLabel = chapter.subject === 'A' ? '科目A' : '科目B';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: chapter.title,
    description: chapterDescriptions[id] ?? chapter.description,
    provider: { '@type': 'Organization', name: '基本情報技術者試験 学習サイト', url: SITE_URL },
    url: chapterUrl,
    educationalLevel: 'intermediate',
    inLanguage: 'ja',
    about: { '@type': 'Thing', name: '基本情報技術者試験' },
    teaches: chapter.sections.map(s => s.title),
    hasPart: chapter.sections.map(s => ({
      '@type': 'CourseSection',
      name: s.title,
    })),
    isPartOf: {
      '@type': 'Course',
      name: '基本情報技術者試験 完全対策',
      url: SITE_URL,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: subjectLabel, item: `${SITE_URL}/#subject-${chapter.subject.toLowerCase()}` },
      { '@type': 'ListItem', position: 3, name: chapter.title, item: chapterUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Suspense>
        <ChapterContent
          chapter={chapter}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
        />
      </Suspense>
    </>
  );
}
