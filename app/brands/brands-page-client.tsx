'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { PageIntro, EmptyContent } from '@/components/PublicPageParts';
import { listBrands } from '@/services/tractors';
import type { Brand } from '@/types/content';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listBrands()
      .then(setBrands)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load brands.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicShell>
      <main>
        <PageIntro
          eyebrow="THE BRAND DIRECTORY"
          title="Find a familiar name. Explore the details."
          description="Browse the manufacturers in our catalog, open a brand profile and discover its listed tractor models."
        />
        <section className="brand-listing">
          <LocalizedElement as="div" className="listing-bar">
            <LocalizedElement as="h2">Explore tractor brands</LocalizedElement>
            <LocalizedElement as="p">{!loading && !error ? `${brands.length} ${brands.length === 1 ? 'brand' : 'brands'} in the directory` : ''}</LocalizedElement>
          </LocalizedElement>
          {loading ? (
            <LocalizedElement as="div" className="detail-loading" role="status">Loading brands…</LocalizedElement>
          ) : error ? (
            <LocalizedElement as="div" className="error-state" role="alert">{error}</LocalizedElement>
          ) : !brands.length ? (
            <EmptyContent
              title="The brand directory is being prepared."
              description="Manufacturer profiles will appear here when they are published. In the meantime, explore the research tools."
              href="/compare"
              action="Explore comparisons"
            />
          ) : (
            <LocalizedElement as="div" className="brand-directory">
              {brands.map((brand) => (
                <LocalizedElement as="a" key={brand.id} href={`/brand/${brand.slug}`}>
                  <LocalizedElement as="div">{brand.logo ? <LocalizedElement as="img" src={brand.logo} alt={`${brand.name} logo`} /> : <LocalizedElement as="strong">{brand.name}</LocalizedElement>}</LocalizedElement>
                  <LocalizedElement as="h2">{brand.name}</LocalizedElement>
                  <LocalizedElement as="p">{brand.description || `Explore the listed models, specifications and reviews for ${brand.name}.`}</LocalizedElement>
                  <LocalizedElement as="span">Explore models →</LocalizedElement>
                </LocalizedElement>
              ))}
            </LocalizedElement>
          )}
        </section>
      </main>
    </PublicShell>
  );
}
