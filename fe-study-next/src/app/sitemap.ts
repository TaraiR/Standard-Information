import { MetadataRoute } from 'next';
import { curriculum } from '@/data/curriculum';

const SITE_URL = 'https://standard-information.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                      lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/glossary`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/formulas`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/quiz`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8  },
    { url: `${SITE_URL}/stats`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6  },
    { url: `${SITE_URL}/disclaimer`,      lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2  },
  ];

  const chapterRoutes = curriculum.map(ch => ({
    url: `${SITE_URL}/chapter/${ch.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...chapterRoutes];
}
