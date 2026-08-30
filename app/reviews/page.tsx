'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listExpertReviews, type ExpertReview } from '@/services/phase-three';

export default function ReviewsPage() {
  const [items,setItems]=useState<ExpertReview[]>([]); const [loading,setLoading]=useState(isFirebaseConfigured); const [error,setError]=useState('');
  useEffect(()=>{if(!isFirebaseConfigured)return;listExpertReviews().then(setItems).catch(reason=>setError(reason instanceof Error?reason.message:'Unable to load reviews.')).finally(()=>setLoading(false));},[]);
  return <PublicShell><main className="reviews-page"><section className="page-hero"><p>RJ TRACTOR TECHS EDITORIAL</p><h1>Expert tractor reviews</h1><span>Read the full story behind the model. Explore published reviews, the details they cover and the questions to take into your own research.</span></section>{!isFirebaseConfigured?<SetupNotice/>:<section className="reviews-list">{loading?<div className="detail-loading">Loading expert reviews…</div>:error?<div className="error-state"><h3>Reviews are unavailable.</h3><p>{error}</p></div>:!items.length?<div className="empty-state"><h3>The next review starts here.</h3><p>There are no published reviews in this section yet. Explore the specifications and comparison tools while you build your shortlist.</p><a href="/compare">Compare tractor specifications →</a></div>:<div className="review-grid">{items.map((review,index)=><article className={index===0?'lead-review':''} key={review.id}><div style={review.coverImage?{backgroundImage:'url('+review.coverImage+')'}:undefined}/><section><p>EXPERT REVIEW {review.tractorName?'· '+review.tractorName:''}</p><h2>{review.title}</h2><span>{review.excerpt}</span><a href={'/reviews/'+review.slug}>Read full review →</a></section></article>)}</div>}</section>}</main></PublicShell>;
}

