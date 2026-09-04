'use client';
import { useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { EditorialReviewCard, useEditorialReviews } from '@/components/EditorialReviews';
import { reviewTimestamp } from '@/lib/editorial-review';
export default function ReviewsPage() {
  const { items, loading, error } = useEditorialReviews();
  const [search, setSearch] = useState('');
  const [tractor, setTractor] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const filtered = items.filter(item => (!tractor || item.tractorId === tractor) && [item.title,item.tractorName,item.excerpt].join(' ').toLowerCase().includes(search.trim().toLowerCase())).sort((a,b) => sort === 'score' ? (b.score ?? -1) - (a.score ?? -1) : reviewTimestamp(b.publishedAt) - reviewTimestamp(a.publishedAt));
  const models = [...new Map(items.filter(item => item.tractorId).map(item => [item.tractorId, item.tractorName])).entries()];
  return <PublicShell><main className="editorial-hub"><header className="page-hero"><p>RJ TRACTOR TECHS EDITORIAL</p><h1>Find your next tractor.<br/>Read the full review.</h1><span>Our editorial team's verdicts, scores and practical buying advice, with the assessment method explained in every review.</span></header>
    <section className="editorial-section"><div className="editorial-filters"><label>Search reviews<input type="search" placeholder="Tractor, model or keyword" value={search} onChange={event => {setSearch(event.target.value);setPage(1);}}/></label><label>Tractor<select value={tractor} onChange={event => {setTractor(event.target.value);setPage(1);}}><option value="">All tractors</option>{models.map(([id,name])=><option value={id} key={id}>{name}</option>)}</select></label><label>Sort by<select value={sort} onChange={event => {setSort(event.target.value);setPage(1);}}><option value="newest">Newest reviews</option><option value="score">Highest score</option></select></label></div>
    {loading ? <p role="status">Loading editorial reviews…</p> : error ? <div role="alert" className="editorial-empty"><h2>Unable to load reviews</h2><p>{error}</p><button onClick={()=>window.location.reload()}>Try again</button></div> : <><p aria-live="polite">{filtered.length} {filtered.length === 1 ? 'review' : 'reviews'}</p>{filtered.length ? <><div className="editorial-grid">{filtered.slice(0,page*9).map(review => <EditorialReviewCard review={review} key={review.id}/>)}</div>{filtered.length > page*9 && <button className="editorial-more" onClick={()=>setPage(page+1)}>Show more reviews</button>}</> : <div className="editorial-empty"><h2>{items.length ? 'No matching reviews' : 'No reviews published yet'}</h2><p>{items.length ? 'Try another model or clear your filters.' : 'Browse the tractor catalog while our editorial team prepares its first reviews.'}</p>{items.length ? <button onClick={()=>{setSearch('');setTractor('');}}>Clear filters</button> : <a href="/tractors">Explore tractors →</a>}</div>}</>}
    <aside className="editorial-policy"><h2>What is behind a review?</h2><p>Reviews are written and published by our editorial team. Each published review explains how the tractor was assessed, its strengths and limitations, and the final verdict. Scores are editorial assessments on a ten-point scale, not customer ratings.</p><a href="/contact">Send a correction or suggest a tractor →</a></aside></section>
  </main></PublicShell>;
}
