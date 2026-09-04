'use client';
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
    <a href={'/reviews/' + review.slug} className="editorial-card-image" tabIndex={-1} aria-hidden="true">{review.coverImage ? <img src={review.coverImage} alt="" loading="lazy"/> : <span>RJ · EDITORIAL</span>}</a>
    <div><p className="editorial-eyebrow">{review.tractorName || 'Tractor review'}</p><h3><a href={'/reviews/' + review.slug}>{review.title}</a></h3><p>{review.excerpt}</p><footer><span>By {review.authorName}</span>{typeof review.score === 'number' && <strong>{review.score}<small>/10</small></strong>}</footer></div>
  </article>;
}
export function EditorialReviews({ tractorId, title = 'Editorial reviews' }: { tractorId?: string; title?: string }) {
  const { items, loading, error } = useEditorialReviews();
  const matches = items.filter(item => !tractorId || item.tractorId === tractorId).slice(0,3);
  return <section className="editorial-section"><div className="editorial-section-heading"><div><p className="editorial-eyebrow">RJ TRACTOR TECHS</p><h2>{title}</h2></div><a href="/reviews">All reviews →</a></div>
    {loading ? <p role="status">Loading reviews…</p> : error ? <p role="alert">Reviews could not be loaded. Please try again later.</p> : matches.length ? <div className="editorial-grid">{matches.map(review => <EditorialReviewCard key={review.id} review={review}/>)}</div> : <div className="editorial-empty"><h3>{tractorId ? 'This tractor has not been reviewed yet.' : 'Our next tractor review starts here.'}</h3><p>Published reviews will include an editorial score, strengths, limitations and how the tractor was assessed.</p><a href="/tractors">Explore tractor specifications →</a></div>}
  </section>;
}
