'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { PublicShell } from './SiteChrome';
import { TractorCard } from './TractorCard';
import { useTractorCatalog } from '@/hooks/useTractorCatalog';
import { selectShowcaseTractors } from '@/lib/tractor-showcase';

export function TractorCollectionPage({ mode }: { mode: 'new' | 'upcoming' | 'popular' }) {
  const { items: catalog, loading, error, retry } = useTractorCatalog();
  const items = selectShowcaseTractors(catalog, mode === 'new' ? 'latest' : mode);
  const heading = mode === 'popular' ? 'Popular tractors' : mode === 'upcoming' ? 'Upcoming tractors' : 'Latest tractors';
  const description = mode === 'upcoming' ? 'Expected dates, prices and specifications remain unconfirmed until officially published.' : mode === 'popular' ? 'Explore the models selected for our Popular tractor collection.' : 'Browse the most recently added new models and open their full specifications.';
  return <PublicShell><main><section className="page-hero"><LocalizedElement as="p">EXPLORE THE CATALOG</LocalizedElement><LocalizedElement as="h1">{heading}</LocalizedElement><LocalizedElement as="span">{description}</LocalizedElement></section><section className="hp-content">
    {loading ? <LocalizedElement as="div" className="detail-loading" role="status">Loading tractors…</LocalizedElement> : error ? <LocalizedElement as="div" className="error-state" role="alert"><LocalizedElement as="h2">Unable to load tractors</LocalizedElement><LocalizedElement as="p">Please try again.</LocalizedElement><LocalizedElement as="button" onClick={retry}>Try again</LocalizedElement></LocalizedElement> : !items.length ? <LocalizedElement as="div" className="empty-state"><LocalizedElement as="h3">No {mode === 'new' ? 'new' : mode} tractors published.</LocalizedElement><LocalizedElement as="p">Models will appear here when they are added to this collection.</LocalizedElement><LocalizedElement as="a" href="/tractors">Explore all tractors</LocalizedElement></LocalizedElement> : <LocalizedElement as="div" className="tractor-grid">{items.map(item => <TractorCard key={item.id} tractor={item}/>)}</LocalizedElement>}
  </section></main></PublicShell>;
}
