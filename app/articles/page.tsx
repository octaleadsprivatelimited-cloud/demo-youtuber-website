import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import { ArticleIndex } from '@/components/ArticleIndex';

const pageMetadata: Metadata = {
  title: 'Articles | RJ Tractor Techs',
  description:
    'Read tractor stories, buying guides and practical farming insights from our editorial newsroom.',
  alternates: {
    canonical: '/articles',
  },
};
export async function generateMetadata() { return withSeoOverride('/articles', pageMetadata); }

export default function ArticlesPage() {
  return <ArticleIndex type="article" />;
}
