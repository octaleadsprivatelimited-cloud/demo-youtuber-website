import type { Metadata } from 'next';
import { ArticleIndex } from '@/components/ArticleIndex';

export const metadata: Metadata = {
  title: 'Articles | RJ Tractor Techs',
  description:
    'Read tractor stories, buying guides and practical farming insights from our editorial newsroom.',
  alternates: {
    canonical: '/articles',
  },
};

export default function ArticlesPage() {
  return <ArticleIndex type="article" />;
}
