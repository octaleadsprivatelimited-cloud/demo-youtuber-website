'use client';
import { PublicShell } from './SiteChrome';
import { TractorCard } from './TractorCard';
import { useTractorCatalog } from '@/hooks/useTractorCatalog';
import { selectShowcaseTractors } from '@/lib/tractor-showcase';

export function TractorCollectionPage({ mode }: { mode: 'new' | 'upcoming' | 'popular' }) {
  const { items: catalog, loading, error, retry } = useTractorCatalog();
  const items = selectShowcaseTractors(catalog, mode === 'new' ? 'latest' : mode);
  const heading = mode === 'popular' ? 'Popular tractors' : mode === 'upcoming' ? 'Upcoming tractors' : 'Latest tractors';
  const description = mode === 'upcoming' ? 'Expected dates, prices and specifications remain unconfirmed until officially published.' : mode === 'popular' ? 'Explore the models selected for our Popular tractor collection.' : 'Browse the most recently added new models and open their full specifications.';
  return <PublicShell><main><section className="page-hero"><p>EXPLORE THE CATALOG</p><h1>{heading}</h1><span>{description}</span></section><section className="hp-content">
    {loading ? <div className="detail-loading" role="status">Loading tractors…</div> : error ? <div className="error-state" role="alert"><h2>Unable to load tractors</h2><p>Please try again.</p><button onClick={retry}>Try again</button></div> : !items.length ? <div className="empty-state"><h3>No {mode === 'new' ? 'new' : mode} tractors published.</h3><p>Models will appear here when they are added to this collection.</p><a href="/tractors">Explore all tractors</a></div> : <div className="tractor-grid">{items.map(item => <TractorCard key={item.id} tractor={item}/>)}</div>}
  </section></main></PublicShell>;
}
