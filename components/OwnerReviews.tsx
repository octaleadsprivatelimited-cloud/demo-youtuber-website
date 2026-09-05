'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import {usePublicRecords} from '@/hooks/usePublicRecords';
export function OwnerReviews({tractorId}:{tractorId:string}){
  const {items,error}=usePublicRecords('reviews');
  const reviews=items.filter(item=>item.tractorId===tractorId);
  return <section className="owner-reviews" aria-label="Owner reviews"><LocalizedElement as="h2">Owner reviews</LocalizedElement>
    {error?<LocalizedElement as="p" role="alert">Unable to load owner reviews.</LocalizedElement>:!reviews.length?<LocalizedElement as="p">No approved owner reviews yet.</LocalizedElement>:reviews.map(review=><article key={review.id}>
      <LocalizedElement as="h3">{String(review.title||'Owner review')}</LocalizedElement><LocalizedElement as="p"><LocalizedElement as="strong">{String(review.userName||'Tractor owner')}</LocalizedElement> · {Number(review.rating)}/5</LocalizedElement><LocalizedElement as="p">{String(review.comment||'')}</LocalizedElement>
    </article>)}
  </section>;
}
