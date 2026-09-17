import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rjtractortechs.com';

  // Static routes with priority tiers
  const highPriority = [
    '',           // home
    '/tractors',
    '/brands',
    '/videos',
    '/reviews',
  ];
  const mediumPriority = [
    '/new-tractors',
    '/upcoming-tractors',
    '/compare',
    '/equipment',
    '/articles',
    '/news',
    '/dealers',
    '/emi-calculator',
  ];
  const lowPriority = [
    '/about',
    '/contact',
    '/search',
    '/privacy-policy',
    '/terms-and-conditions',
    '/disclaimer',
    '/cookie-policy',
  ];

  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    ...highPriority.map(route => ({
      url: base + route,
      lastModified: now,
      changeFrequency: (route === '' ? 'daily' : 'weekly') as MetadataRoute.Sitemap[0]['changeFrequency'],
      priority: route === '' ? 1.0 : 0.9,
    })),
    ...mediumPriority.map(route => ({
      url: base + route,
      lastModified: now,
      changeFrequency: 'weekly' as MetadataRoute.Sitemap[0]['changeFrequency'],
      priority: 0.7,
    })),
    ...lowPriority.map(route => ({
      url: base + route,
      lastModified: now,
      changeFrequency: 'monthly' as MetadataRoute.Sitemap[0]['changeFrequency'],
      priority: 0.4,
    })),
  ];

  return entries;
}
