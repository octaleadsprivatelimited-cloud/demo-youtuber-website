import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const base = siteOrigin();
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/media/'],
        disallow: [
          '/admin',
          '/account',
          '/api/',
          '/login',
          '/search',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
