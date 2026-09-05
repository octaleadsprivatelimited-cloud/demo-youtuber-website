'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { PageIntro, EmptyContent } from '@/components/PublicPageParts';
import { listDealers, type Dealer } from '@/services/media';

export default function DealersPage() {
  const [items, setItems] = useState<Dealer[]>([]);
  const [filters, setFilters] = useState({ brand: '', state: '', district: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listDealers()
      .then(setItems)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load the dealer directory.'))
      .finally(() => setLoading(false));
  }, []);

  const shown = items.filter((item) =>
    Object.entries(filters).every(([key, value]) =>
      String(item[key as keyof Dealer] ?? '')
        .toLowerCase()
        .includes(value.trim().toLowerCase()),
    ),
  );

  return (
    <PublicShell>
      <main className="dealers-index">
        <PageIntro
          eyebrow="THE NEXT CONVERSATION"
          title="Find a dealer. Bring your questions."
          description="Explore the published dealer directory by brand and location. Open a profile for its listed contact and address details."
        />
        <section className="dealer-list">
          <LocalizedElement as="div" className="dealer-filters">
            {(['brand', 'state', 'district', 'city'] as const).map((field) => (
              <LocalizedElement as="label" key={field}>
                {field}
                <LocalizedElement as="input"
                  value={filters[field]}
                  onChange={(event) => setFilters({ ...filters, [field]: event.target.value })}
                  placeholder={`Search ${field}`}
                />
              </LocalizedElement>
            ))}
            <LocalizedElement as="button" onClick={() => setFilters({ brand: '', state: '', district: '', city: '' })}>Clear filters</LocalizedElement>
          </LocalizedElement>
          {loading ? (
            <LocalizedElement as="div" className="detail-loading" role="status">Loading dealers…</LocalizedElement>
          ) : error ? (
            <LocalizedElement as="div" className="error-state" role="alert">{error}</LocalizedElement>
          ) : !shown.length ? (
            <EmptyContent
              title={items.length ? 'No dealers match those filters.' : 'The dealer directory is being prepared.'}
              description={
                items.length
                  ? 'Try a nearby city, fewer filters or a different brand.'
                  : 'Dealer profiles will appear here as they are published. Use the catalog to prepare your shortlist before arranging a visit.'
              }
            />
          ) : (
            <LocalizedElement as="div" className="dealer-grid">
              {shown.map((item) => (
                <article key={item.id}>
                  <LocalizedElement as="div" className="dealer-logo">
                    {item.logo ? <LocalizedElement as="img" src={item.logo} alt={`${item.name} logo`} /> : item.name.slice(0, 2).toUpperCase()}
                  </LocalizedElement>
                  <section>
                    <LocalizedElement as="p">{item.verified ? 'VERIFIED DEALER' : 'DEALER PROFILE'}</LocalizedElement>
                    <LocalizedElement as="h2">{item.name}</LocalizedElement>
                    <LocalizedElement as="span">{[item.address, item.city, item.state].filter(Boolean).join(', ')}</LocalizedElement>
                    {item.brand && <LocalizedElement as="small">{item.brand}</LocalizedElement>}
                    <LocalizedElement as="a" href={`/dealers/${item.slug}`}>Contact & details →</LocalizedElement>
                  </section>
                </article>
              ))}
            </LocalizedElement>
          )}
        </section>
      </main>
    </PublicShell>
  );
}
