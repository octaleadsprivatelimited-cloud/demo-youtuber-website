'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TractorCollectionPage } from '@/components/TractorCollectionPage';
import type { DocumentSnapshot } from 'firebase/firestore';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { TractorCard } from '@/components/TractorCard';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listBrands, listTractors, searchTractorSuggestions } from '@/services/tractors';
import type { Brand, Tractor, TractorFilters } from '@/types/content';
import './tractors-page.css';

export default function TractorsPage() {
  return (
    <Suspense fallback={<LocalizedElement as="p" role="status">Loading tractors…</LocalizedElement>}>
      <TractorsRoute />
    </Suspense>
  );
}

function TractorsRoute() {
  const params = useSearchParams();
  return params.get('view') === 'popular' ? <TractorCollectionPage mode="popular" /> : <TractorCatalog />;
}

function TractorCatalog() {
  const [items, setItems] = useState<Tractor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filters, setFilters] = useState<TractorFilters>({ pageSize: 12 });
  const [draftSearch, setDraftSearch] = useState('');
  const [cursor, setCursor] = useState<DocumentSnapshot | number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<Tractor[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  async function load(reset = true) {
    if (!isFirebaseConfigured) return;
    setLoading(true);
    setError('');
    try {
      const page = await listTractors(filters, reset ? null : cursor);
      setItems((current) => (reset ? page.items : [...current, ...page.items]));
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load tractors.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isFirebaseConfigured) listBrands().then(setBrands).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || draftSearch.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = window.setTimeout(
      () => searchTractorSuggestions(draftSearch).then(setSuggestions).catch(() => setSuggestions([])),
      220,
    );
    return () => window.clearTimeout(timer);
  }, [draftSearch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search')?.trim().toLowerCase();
    const brandId = params.get('brand')?.trim();
    if (search) setDraftSearch(params.get('search') ?? '');
    const numberParam = (key: string) => {
      const value = params.get(key);
      return value !== null && Number.isFinite(Number(value)) ? Number(value) : undefined;
    };
    const condition = params.get('condition');
    setFilters((current) => ({
      ...current,
      search: search || undefined,
      brandId: brandId || undefined,
      minHp: numberParam('minHp'),
      maxHp: numberParam('maxHp'),
      condition: condition === 'new' || condition === 'used' ? condition : undefined,
    }));
  }, []);

  useEffect(() => { load(true); }, [filters]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setFilters((current) => ({ ...current, search: draftSearch.trim().toLowerCase() || undefined }));
  }

  function clearFilters() {
    setFilters({ pageSize: 12 });
    setDraftSearch('');
    setSuggestions([]);
  }

  const activeFilterCount = [filters.search, filters.brandId, filters.minHp, filters.condition, filters.driveType, filters.transmission].filter(Boolean).length;

  return (
    <PublicShell>
      <main className="catalog-page new-tractors-page">
        <section className="catalog-hero">
          <LocalizedElement as="div" className="catalog-hero-copy">
            <LocalizedElement as="p">NEW TRACTOR RESEARCH</LocalizedElement>
            <LocalizedElement as="h1">
              New tractors,<br />clearly compared.
            </LocalizedElement>
            <LocalizedElement as="span">Explore published models by brand, power and drivetrain. Open the full specifications or add a tractor to your comparison.</LocalizedElement>
            <nav className="catalog-power-links" aria-label="Browse tractors by horsepower">
              <LocalizedElement as="a" href="/tractors/20-30-hp">20–30 HP</LocalizedElement>
              <LocalizedElement as="a" href="/tractors/30-40-hp">30–40 HP</LocalizedElement>
              <LocalizedElement as="a" href="/tractors/40-50-hp">40–50 HP</LocalizedElement>
              <LocalizedElement as="a" href="/tractors/50-60-hp">50–60 HP</LocalizedElement>
            </nav>
          </LocalizedElement>
          <form className="catalog-search-card" onSubmit={submitSearch}>
            <LocalizedElement as="div" className="catalog-search-heading">
              <LocalizedElement as="span">SEARCH THE CATALOG</LocalizedElement>
              <LocalizedElement as="small">Model or brand</LocalizedElement>
            </LocalizedElement>
            <LocalizedElement as="div" className="catalog-search-row">
              <LocalizedElement as="div" className="catalog-search-field">
                <LocalizedElement as="input"
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                  placeholder="Search tractor, brand or model"
                  aria-label="Search tractors"
                />
                {suggestions.length > 0 && (
                  <LocalizedElement as="div" className="search-suggestions">
                    {suggestions.map((tractor) => (
                      <LocalizedElement as="a" key={tractor.id} href={`/tractor/${tractor.brandSlug}/${tractor.slug}`}>
                        <LocalizedElement as="span">{tractor.brandName}</LocalizedElement>
                        <LocalizedElement as="strong">{tractor.name}</LocalizedElement>
                        <LocalizedElement as="small">{tractor.hp} HP →</LocalizedElement>
                      </LocalizedElement>
                    ))}
                  </LocalizedElement>
                )}
              </LocalizedElement>
              <LocalizedElement as="button">Search <LocalizedElement as="span" aria-hidden="true">→</LocalizedElement></LocalizedElement>
            </LocalizedElement>
            <LocalizedElement as="p">Search published tractors only. Use the filters below to refine the results.</LocalizedElement>
          </form>
        </section>
        {!isFirebaseConfigured ? (
          <SetupNotice />
        ) : (
          <section className="catalog-layout">
            <LocalizedElement as="button"
              className="mobile-filter-toggle"
              type="button"
              aria-controls="tractor-filters"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((value) => !value)}
            >
              <LocalizedElement as="strong">Filters</LocalizedElement>
              <LocalizedElement as="span">{activeFilterCount ? `${activeFilterCount} active` : 'Refine results'} · {filtersOpen ? 'Close' : 'Open'}</LocalizedElement>
            </LocalizedElement>
            <aside id="tractor-filters" className={`filters${filtersOpen ? ' is-open' : ''}`}>
              <header>
                <LocalizedElement as="div">
                  <LocalizedElement as="span">FILTER TRACTORS</LocalizedElement>
                  <LocalizedElement as="small">{activeFilterCount ? `${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}` : 'Refine the catalog'}</LocalizedElement>
                </LocalizedElement>
                <LocalizedElement as="button" type="button" onClick={clearFilters} disabled={!activeFilterCount}>Clear all</LocalizedElement>
              </header>
              <LocalizedElement as="label">
                Brand
                <LocalizedElement as="select"
                  value={filters.brandId ?? ''}
                  onChange={(event) => setFilters({ ...filters, brandId: event.target.value || undefined })}
                >
                  <LocalizedElement as="option" value="">All brands</LocalizedElement>
                  {brands.map((brand) => <LocalizedElement as="option" value={brand.id} key={brand.id}>{brand.name}</LocalizedElement>)}
                </LocalizedElement>
              </LocalizedElement>
              <LocalizedElement as="label">
                Horsepower
                <LocalizedElement as="select"
                  value={filters.minHp ?? ''}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setFilters({
                      ...filters,
                      minHp: value || undefined,
                      maxHp: value ? value + 10 : undefined,
                    });
                  }}
                >
                  <LocalizedElement as="option" value="">All HP ranges</LocalizedElement>
                  <LocalizedElement as="option" value="20">20–30 HP</LocalizedElement>
                  <LocalizedElement as="option" value="30">30–40 HP</LocalizedElement>
                  <LocalizedElement as="option" value="40">40–50 HP</LocalizedElement>
                  <LocalizedElement as="option" value="50">50–60 HP</LocalizedElement>
                  <LocalizedElement as="option" value="60">60–70 HP</LocalizedElement>
                </LocalizedElement>
              </LocalizedElement>
              <LocalizedElement as="label">
                Condition
                <LocalizedElement as="select"
                  value={filters.condition ?? ''}
                  onChange={(event) => setFilters({ ...filters, condition: (event.target.value as TractorFilters['condition']) || undefined })}
                >
                  <LocalizedElement as="option" value="">New &amp; used</LocalizedElement>
                  <LocalizedElement as="option" value="new">New</LocalizedElement>
                  <LocalizedElement as="option" value="used">Used</LocalizedElement>
                </LocalizedElement>
              </LocalizedElement>
              <LocalizedElement as="label">
                Drive type
                <LocalizedElement as="select" value={filters.driveType ?? ''} onChange={(event) => setFilters({ ...filters, driveType: event.target.value || undefined })}>
                  <LocalizedElement as="option" value="">2WD &amp; 4WD</LocalizedElement>
                  <LocalizedElement as="option">2WD</LocalizedElement>
                  <LocalizedElement as="option">4WD</LocalizedElement>
                </LocalizedElement>
              </LocalizedElement>
              <LocalizedElement as="label">
                Transmission
                <LocalizedElement as="select" value={filters.transmission ?? ''} onChange={(event) => setFilters({ ...filters, transmission: event.target.value || undefined })}>
                  <LocalizedElement as="option" value="">All transmissions</LocalizedElement>
                  <LocalizedElement as="option">Manual</LocalizedElement>
                  <LocalizedElement as="option">Synchromesh</LocalizedElement>
                  <LocalizedElement as="option">Power Reverser</LocalizedElement>
                </LocalizedElement>
              </LocalizedElement>
            </aside>
            <LocalizedElement as="div" className="results">
              <LocalizedElement as="div" className="results-head">
                <LocalizedElement as="div">
                  <LocalizedElement as="p">TRACTOR RESULTS</LocalizedElement>
                  <LocalizedElement as="h2">{loading ? 'Loading tractors…' : `${items.length} tractor${items.length === 1 ? '' : 's'} found`}</LocalizedElement>
                </LocalizedElement>
                <LocalizedElement as="span">{activeFilterCount ? `Filtered by ${activeFilterCount} selection${activeFilterCount === 1 ? '' : 's'}` : 'All published models'}</LocalizedElement>
              </LocalizedElement>
              {error && (
                <LocalizedElement as="div" className="error-state">
                  <LocalizedElement as="h3">The tractor catalog is temporarily unavailable.</LocalizedElement>
                  <LocalizedElement as="p">{error}</LocalizedElement>
                  <LocalizedElement as="button" onClick={() => load(true)}>Try again</LocalizedElement>
                </LocalizedElement>
              )}
              {!loading && !error && items.length === 0 && (
                <LocalizedElement as="div" className="empty-state">
                  <LocalizedElement as="span">NO MATCHING MODELS</LocalizedElement>
                  <LocalizedElement as="h3">No tractors match these filters.</LocalizedElement>
                  <LocalizedElement as="p">Try another brand, a wider horsepower range or clear the current selections.</LocalizedElement>
                  <LocalizedElement as="button" onClick={clearFilters}>Clear filters</LocalizedElement>
                </LocalizedElement>
              )}
              <LocalizedElement as="div" className="catalog-grid">{items.map((tractor) => <TractorCard key={tractor.id} tractor={tractor} />)}</LocalizedElement>
              {hasMore && <LocalizedElement as="button" className="load-more" disabled={loading} onClick={() => load(false)}>{loading ? 'Loading…' : 'Load more tractors'}</LocalizedElement>}
            </LocalizedElement>
          </section>
        )}
      </main>
    </PublicShell>
  );
}
