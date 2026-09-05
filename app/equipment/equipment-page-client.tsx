'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useEffect, useMemo, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { PageIntro, EmptyContent } from '@/components/PublicPageParts';
import { listEquipment, type Equipment } from '@/services/media';

export default function EquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listEquipment()
      .then(setItems)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load equipment.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Map(
        items
          .filter((item) => item.categorySlug)
          .map((item) => [String(item.categorySlug), item.categoryName || 'Equipment']),
      ).entries(),
    );
  }, [items]);
  const shown = items.filter((item) => !category || String(item.categorySlug) === category);

  return (
    <PublicShell>
      <main className="equipment-index">
        <PageIntro
          eyebrow="FARM EQUIPMENT"
          title="Explore the tools for the job."
          description="Research implements and machinery alongside your tractor. Browse the listed equipment, read the details and prepare your questions about compatibility."
        />
        <section className="equipment-list">
          <LocalizedElement as="div" className="listing-bar">
            <LocalizedElement as="h2">Equipment directory</LocalizedElement>
            <LocalizedElement as="a" className="text-action" href="/contact">Ask a question →</LocalizedElement>
          </LocalizedElement>
          <nav aria-label="Equipment categories">
            <LocalizedElement as="button" aria-pressed={!category} className={!category ? 'active' : ''} onClick={() => setCategory('')}>
              All equipment
            </LocalizedElement>
            {categories.map(([slug, name]) => (
              <LocalizedElement as="button"
                key={slug}
                aria-pressed={category === slug}
                className={category === slug ? 'active' : ''}
                onClick={() => setCategory(slug)}
              >
                {name}
              </LocalizedElement>
            ))}
          </nav>
          {loading ? (
            <LocalizedElement as="div" className="detail-loading" role="status">Loading equipment…</LocalizedElement>
          ) : error ? (
            <LocalizedElement as="div" className="error-state" role="alert">{error}</LocalizedElement>
          ) : !shown.length ? (
            <EmptyContent
              title="Equipment details are on the way."
              description="Published implements and machinery will appear here. Explore tractor specifications while you prepare your equipment shortlist."
            />
          ) : (
            <LocalizedElement as="div" className="equipment-grid">
              {shown.map((item) => (
                <article key={item.id}>
                  <LocalizedElement as="div" style={item.image ? { backgroundImage: `url(${item.image})` } : undefined} />
                  <section>
                    <LocalizedElement as="p">
                      {item.categoryName}
                      {item.brandName ? ` · ${item.brandName}` : ''}
                    </LocalizedElement>
                    <LocalizedElement as="h2">{item.name}</LocalizedElement>
                    <LocalizedElement as="span">{item.description}</LocalizedElement>
                    {Number(item.price) > 0 && <LocalizedElement as="strong">From ₹{Number(item.price).toLocaleString('en-IN')}</LocalizedElement>}
                    <LocalizedElement as="a" href={`/equipment/${item.categorySlug}/${item.slug}`}>View equipment →</LocalizedElement>
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
