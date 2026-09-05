'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { useEffect, useState } from 'react';
import { subscribePublicRecords } from '@/services/site-data';
import type { ExpertReview } from '@/services/phase-three';
import { reviewTimestamp } from '@/lib/editorial-review';
import '@/app/editorial-reviews.css';

export function useEditorialReviews() {
  const [items, setItems] = useState<ExpertReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => subscribePublicRecords('expertReviews', rows => {
    setItems((rows as unknown as ExpertReview[]).sort((a,b) => reviewTimestamp(b.publishedAt) - reviewTimestamp(a.publishedAt)));
    setLoading(false); setError('');
  }, reason => { setError(reason.message); setLoading(false); }, 500), []);
  return { items, loading, error };
}
export function EditorialReviewCard({ review }: { review: ExpertReview }) {
  return <article className="editorial-card">
    <LocalizedElement as="a" href={'/reviews/' + review.slug} className="editorial-card-image" tabIndex={-1} aria-hidden="true">{review.coverImage ? <LocalizedElement as="img" src={review.coverImage} alt="" loading="lazy"/> : <LocalizedElement as="span">RJ · EDITORIAL</LocalizedElement>}</LocalizedElement>
    <LocalizedElement as="div"><LocalizedElement as="p" className="editorial-eyebrow">{review.tractorName || 'Tractor review'}</LocalizedElement><LocalizedElement as="h3"><LocalizedElement as="a" href={'/reviews/' + review.slug}>{review.title}</LocalizedElement></LocalizedElement><LocalizedElement as="p">{review.excerpt}</LocalizedElement><footer><LocalizedElement as="span">By {review.authorName}</LocalizedElement>{typeof review.score === 'number' && <LocalizedElement as="strong">{review.score}<LocalizedElement as="small">/10</LocalizedElement></LocalizedElement>}</footer></LocalizedElement>
  </article>;
}
export function EditorialReviews({ tractorId, title = 'Editorial reviews' }: { tractorId?: string; title?: string }) {
  const { items, loading, error } = useEditorialReviews();
  const matches = items.filter(item => !tractorId || item.tractorId === tractorId).slice(0,3);
  return <section className="editorial-section"><LocalizedElement as="div" className="editorial-section-heading"><LocalizedElement as="div"><LocalizedElement as="p" className="editorial-eyebrow">RJ TRACTOR TECHS</LocalizedElement><LocalizedElement as="h2">{title}</LocalizedElement></LocalizedElement><LocalizedElement as="a" href="/reviews">All reviews →</LocalizedElement></LocalizedElement>
    {loading ? <LocalizedElement as="p" role="status">Loading reviews…</LocalizedElement> : error ? <LocalizedElement as="p" role="alert">Reviews could not be loaded. Please try again later.</LocalizedElement> : matches.length ? <LocalizedElement as="div" className="editorial-grid">{matches.map(review => <EditorialReviewCard key={review.id} review={review}/>)}</LocalizedElement> : <LocalizedElement as="div" className="editorial-empty"><LocalizedElement as="h3">{tractorId ? 'This tractor has not been reviewed yet.' : 'Our next tractor review starts here.'}</LocalizedElement><LocalizedElement as="p">Published reviews will include an editorial score, strengths, limitations and how the tractor was assessed.</LocalizedElement><LocalizedElement as="a" href="/tractors">Explore tractor specifications →</LocalizedElement></LocalizedElement>}
  </section>;
}
