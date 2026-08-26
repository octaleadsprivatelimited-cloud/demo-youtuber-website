'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listExpertReviews, type ExpertReview } from '@/services/phase-three';

export default function ReviewsPage() {
  const [items,setItems]=useState<ExpertReview[]>([]); const [loading,setLoading]=useState(isFirebaseConfigured); const [error,setError]=useState('');
  useEffect(()=>{if(!isFirebaseConfigured)return;listExpertReviews().then(setItems).catch(reason=>setError(reason instanceof Error?reason.message:'Unable to load reviews.')).finally(()=>setLoading(false));},[]);
  return <PublicShell><main className="reviews-page"><section className="page-hero"><p>RJ TRACTOR TECHS EDITORIAL</p><h1>Expert tractor reviews</h1><span>Detailed assessments, field observations and practical verdicts from the RJ Tractor Techs editorial workflow.</span></section>{!isFirebaseConfigured?<SetupNotice/>:<section className="reviews-list">{loading?<div className="detail-loading">Loading expert reviews…</div>:error?<div className="error-state"><h3>Reviews are unavailable.</h3><p>{error}</p></div>:!items.length?<div className="empty-state"><h3>No expert reviews are published yet.</h3><p>Published editorial reviews will appear here automatically.</p></div>:<div className="review-grid">{items.map((review,index)=><article className={index===0?'lead-review':''} key={review.id}><div style={review.coverImage?{backgroundImage:'url('+review.coverImage+')'}:undefined}/><section><p>EXPERT REVIEW {review.tractorName?'· '+review.tractorName:''}</p><h2>{review.title}</h2><span>{review.excerpt}</span><a href={'/reviews/'+review.slug}>Read full review →</a></section></article>)}</div>}</section>}</main></PublicShell>;
}

