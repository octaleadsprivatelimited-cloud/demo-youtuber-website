'use client';


import {ReadingContent} from '@/components/PublicPageParts';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { useEditorialReviews } from '@/components/EditorialReviews';
import { useTractorCatalog } from '@/hooks/useTractorCatalog';

export default function ReviewDetailClient({slug}:{slug:string}) {
  const { items, loading, error } = useEditorialReviews();
  const review = items.find(item => item.slug === slug);
  const { items: tractors } = useTractorCatalog();
  const tractor = tractors.find(item => item.id === review?.tractorId);
  return <PublicShell><main className="review-detail">{!isFirebaseConfigured?<SetupNotice/>:loading?<div className="detail-loading">Loading review…</div>:error?<div className="error-state"><h3>Review unavailable.</h3><p>{error}</p></div>:!review?<div className="empty-state"><h3>Review not found.</h3><a href="/reviews">Browse reviews →</a></div>:<><header><p>EXPERT REVIEW {review.tractorName?'· '+review.tractorName:''}</p><h1>{review.title}</h1><span>{review.excerpt}</span><small>By {review.authorName} · Editorial review</small></header>{review.coverImage&&<div className="review-cover" style={{backgroundImage:'url('+review.coverImage+')'}}/>}<section className="review-article"><article><div className="article-copy">{review.body?<ReadingContent text={review.body}/>:<p>The full review is not available yet.</p>}</div>{review.score!==undefined&&<p><strong>Expert score: {review.score}/10</strong></p>}{review.verdict&&<div className="verdict"><p>RJ VERDICT</p><h2>{review.verdict}</h2></div>}<section className="review-methodology"><h2>How we assessed this tractor</h2><p>{review.methodology || "Assessment details have not been provided for this older review."}</p>{review.disclosure&&<><h3>Disclosure</h3><p>{review.disclosure}</p></>}<p>Editorial score on a ten-point scale. This is not an owner rating.</p><a href="/contact">Suggest a correction →</a></section></article><aside>{tractor&&<div><h3>{tractor.name}</h3><a href={"/tractor/"+tractor.brandSlug+"/"+tractor.slug}>Specifications & comparison →</a></div>}{review.pros?.length?<div><h3>What stands out</h3>{review.pros.map(item=><p key={item}>＋ {item}</p>)}</div>:null}{review.cons?.length?<div><h3>Consider before buying</h3>{review.cons.map(item=><p key={item}>− {item}</p>)}</div>:null}<a href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">▶ Watch RJ Tractor Techs</a></aside></section></>}</main></PublicShell>;
}

