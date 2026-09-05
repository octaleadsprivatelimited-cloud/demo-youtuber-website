import type { Metadata } from 'next';
import ReviewsPageClient from './reviews-page-client';

export const metadata: Metadata = {
  title: 'Reviews | RJ Tractor Techs',
  description:
    'Read editorial tractor reviews with verdicts, scores, strengths, limitations and practical recommendations.',
  alternates: { canonical: '/reviews' },
};

export default function ReviewsPage() {
  return <ReviewsPageClient />;
}
