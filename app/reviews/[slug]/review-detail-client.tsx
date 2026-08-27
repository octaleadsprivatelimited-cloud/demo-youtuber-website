'use client';

import { useEffect,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getExpertReview,type ExpertReview } from '@/services/phase-three';

export default function ReviewDetailClient({slug}:{slug:string}) {
  const [review,setReview]=useState<ExpertReview|null>(null); const [loading,setLoading]=useState(isFirebaseConfigured); const [error,setError]=useState('');
  useEffect(()=>{if(!isFirebaseConfigured)return;getExpertReview(slug).then(setReview).catch(reason=>setError(reason instanceof Error?reason.message:'Unable to load review.')).finally(()=>setLoading(false));},[slug]);
  return <PublicShell><main className="review-detail">{!isFirebaseConfigured?<SetupNotice/>:loading?<div className="detail-loading">Loading review…</div>:error?<div className="error-state"><h3>Review unavailable.</h3><p>{error}</p></div>:!review?<div className="empty-state"><h3>Review not found.</h3><a href="/reviews">Browse reviews →</a></div>:<><header><p>EXPERT REVIEW {review.tractorName?'· '+review.tractorName:''}</p><h1>{review.title}</h1><span>{review.excerpt}</span><small>By {review.authorName}</small></header>{review.coverImage&&<div className="review-cover" style={{backgroundImage:'url('+review.coverImage+')'}}/>}<section className="review-article"><article><div className="article-copy">{review.body ?? 'The complete editorial review will appear here once its content has been published in the CMS.'}</div>{review.score!==undefined&&<p><strong>Expert score: {review.score}/10</strong></p>}{review.verdict&&<div className="verdict"><p>RJ VERDICT</p><h2>{review.verdict}</h2></div>}</article><aside>{review.pros?.length?<div><h3>What stands out</h3>{review.pros.map(item=><p key={item}>＋ {item}</p>)}</div>:null}{review.cons?.length?<div><h3>Consider before buying</h3>{review.cons.map(item=><p key={item}>− {item}</p>)}</div>:null}<a href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">▶ Watch RJ Tractor Techs</a></aside></section></>}</main></PublicShell>;
}

