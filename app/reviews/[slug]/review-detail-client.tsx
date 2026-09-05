'use client';
import { LocalizedElement } from '@/components/LocalizedElement';



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
  return <PublicShell><main className="review-detail">{!isFirebaseConfigured?<SetupNotice/>:loading?<LocalizedElement as="div" className="detail-loading">Loading review…</LocalizedElement>:error?<LocalizedElement as="div" className="error-state"><LocalizedElement as="h3">Review unavailable.</LocalizedElement><LocalizedElement as="p">{error}</LocalizedElement></LocalizedElement>:!review?<LocalizedElement as="div" className="empty-state"><LocalizedElement as="h3">Review not found.</LocalizedElement><LocalizedElement as="a" href="/reviews">Browse reviews →</LocalizedElement></LocalizedElement>:<><header><LocalizedElement as="p">EXPERT REVIEW {review.tractorName?'· '+review.tractorName:''}</LocalizedElement><LocalizedElement as="h1">{review.title}</LocalizedElement><LocalizedElement as="span">{review.excerpt}</LocalizedElement><LocalizedElement as="small">By {review.authorName} · Editorial review</LocalizedElement></header>{review.coverImage&&<LocalizedElement as="div" className="review-cover" style={{backgroundImage:'url('+review.coverImage+')'}}/>}<section className="review-article"><article><LocalizedElement as="div" className="article-copy">{review.body?<ReadingContent text={review.body}/>:<LocalizedElement as="p">The full review is not available yet.</LocalizedElement>}</LocalizedElement>{review.score!==undefined&&<LocalizedElement as="p"><LocalizedElement as="strong">Expert score: {review.score}/10</LocalizedElement></LocalizedElement>}{review.verdict&&<LocalizedElement as="div" className="verdict"><LocalizedElement as="p">RJ VERDICT</LocalizedElement><LocalizedElement as="h2">{review.verdict}</LocalizedElement></LocalizedElement>}<section className="review-methodology"><LocalizedElement as="h2">How we assessed this tractor</LocalizedElement><LocalizedElement as="p">{review.methodology || "Assessment details have not been provided for this older review."}</LocalizedElement>{review.disclosure&&<><LocalizedElement as="h3">Disclosure</LocalizedElement><LocalizedElement as="p">{review.disclosure}</LocalizedElement></>}<LocalizedElement as="p">Editorial score on a ten-point scale. This is not an owner rating.</LocalizedElement><LocalizedElement as="a" href="/contact">Suggest a correction →</LocalizedElement></section></article><aside>{tractor&&<LocalizedElement as="div"><LocalizedElement as="h3">{tractor.name}</LocalizedElement><LocalizedElement as="a" href={"/tractor/"+tractor.brandSlug+"/"+tractor.slug}>Specifications & comparison →</LocalizedElement></LocalizedElement>}{review.pros?.length?<LocalizedElement as="div"><LocalizedElement as="h3">What stands out</LocalizedElement>{review.pros.map(item=><LocalizedElement as="p" key={item}>＋ {item}</LocalizedElement>)}</LocalizedElement>:null}{review.cons?.length?<LocalizedElement as="div"><LocalizedElement as="h3">Consider before buying</LocalizedElement>{review.cons.map(item=><LocalizedElement as="p" key={item}>− {item}</LocalizedElement>)}</LocalizedElement>:null}<LocalizedElement as="a" href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">▶ Watch RJ Tractor Techs</LocalizedElement></aside></section></>}</main></PublicShell>;
}

