import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import ReviewsPageClient from './reviews-page-client';

const pageMetadata: Metadata = {
  title: 'Reviews | RJ Tractor Techs',
  description:
    'Read editorial tractor reviews with verdicts, scores, strengths, limitations and practical recommendations.',
  alternates: { canonical: '/reviews' },
};
export async function generateMetadata() { return withSeoOverride('/reviews', pageMetadata); }

export default function ReviewsPage() {
  return <ReviewsPageClient />;
}
