import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import { ArticleIndex } from '@/components/ArticleIndex';

const pageMetadata: Metadata = {
  title: 'News | RJ Tractor Techs',
  description:
    'Track news and launch updates from the tractor and agricultural equipment space.',
  alternates: {
    canonical: '/news',
  },
};
export async function generateMetadata() { return withSeoOverride('/news', pageMetadata); }

export default function NewsPage() {
  return <ArticleIndex type='news' />;
}
