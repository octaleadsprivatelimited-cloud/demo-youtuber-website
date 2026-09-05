import type { Metadata } from 'next';
import { ArticleIndex } from '@/components/ArticleIndex';

export const metadata: Metadata = {
  title: 'News | RJ Tractor Techs',
  description:
    'Track news and launch updates from the tractor and agricultural equipment space.',
  alternates: {
    canonical: '/news',
  },
};

export default function NewsPage() {
  return <ArticleIndex type='news' />;
}
