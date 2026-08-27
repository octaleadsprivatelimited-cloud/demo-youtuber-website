'use client';
import {usePublicRecords} from '@/hooks/usePublicRecords';
export function OwnerReviews({tractorId}:{tractorId:string}){
  const {items,error}=usePublicRecords('reviews');
  const reviews=items.filter(item=>item.tractorId===tractorId);
  return <section className="owner-reviews" aria-label="Owner reviews"><h2>Owner reviews</h2>
    {error?<p role="alert">Unable to load owner reviews.</p>:!reviews.length?<p>No approved owner reviews yet.</p>:reviews.map(review=><article key={review.id}>
      <h3>{String(review.title||'Owner review')}</h3><p><strong>{String(review.userName||'Tractor owner')}</strong> · {Number(review.rating)}/5</p><p>{String(review.comment||'')}</p>
    </article>)}
  </section>;
}
