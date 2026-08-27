'use client';

import { useEffect, useState } from 'react';
import type { DocumentSnapshot } from 'firebase/firestore';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { TractorCard } from '@/components/TractorCard';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listBrands, listTractors, searchTractorSuggestions } from '@/services/tractors';
import type { Brand, Tractor, TractorFilters } from '@/types/content';

export default function TractorsPage() {
  const [items, setItems] = useState<Tractor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filters, setFilters] = useState<TractorFilters>({ pageSize: 12 });
  const [draftSearch, setDraftSearch] = useState('');
  const [cursor, setCursor] = useState<DocumentSnapshot | number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<Tractor[]>([]);

  async function load(reset = true) {
    if (!isFirebaseConfigured) return;
    setLoading(true); setError('');
    try {
      const page = await listTractors(filters, reset ? null : cursor);
      setItems((current) => reset ? page.items : [...current, ...page.items]);
      setCursor(page.cursor); setHasMore(page.hasMore);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load tractors.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (isFirebaseConfigured) listBrands().then(setBrands).catch(() => undefined); }, []);
  useEffect(() => {
    if (!isFirebaseConfigured || draftSearch.trim().length < 2) { setSuggestions([]); return; }
    const timer = window.setTimeout(() => searchTractorSuggestions(draftSearch).then(setSuggestions).catch(() => setSuggestions([])), 220);
    return () => window.clearTimeout(timer);
  }, [draftSearch]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search')?.trim().toLowerCase();
    const brandId = params.get('brand')?.trim();
    if (search) setDraftSearch(params.get('search') ?? '');
    const numberParam=(key:string)=>{const value=params.get(key);return value!==null&&Number.isFinite(Number(value))?Number(value):undefined;};
    const condition=params.get('condition');
    setFilters(current=>({...current,search:search||undefined,brandId:brandId||undefined,minHp:numberParam('minHp'),maxHp:numberParam('maxHp'),condition:condition==='new'||condition==='used'?condition:undefined}));
  }, []);
  useEffect(() => { load(true); }, [filters]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setFilters((current) => ({ ...current, search: draftSearch.trim().toLowerCase() || undefined }));
  }

  return <PublicShell><main className="catalog-page">
    <section className="catalog-hero"><p>TRACTOR DATABASE</p><h1>Find the right tractor for your work.</h1><span>Research specifications, estimated prices and features from the RJ Tractor Techs database.</span>
      <form onSubmit={submitSearch}><div className="catalog-search-field"><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Search by tractor, brand or model" aria-label="Search tractors" />{suggestions.length > 0 && <div className="search-suggestions">{suggestions.map((tractor) => <a key={tractor.id} href={`/tractor/${tractor.brandSlug}/${tractor.slug}`}><span>{tractor.brandName}</span><strong>{tractor.name}</strong><small>{tractor.hp} HP →</small></a>)}</div>}</div><button>Search →</button></form>
    </section>
    {!isFirebaseConfigured ? <SetupNotice /> : <section className="catalog-layout">
      <aside className="filters"><div><span>FILTER TRACTORS</span><button onClick={() => { setFilters({ pageSize: 12 }); setDraftSearch(''); }}>Clear</button></div>
        <label>Brand<select value={filters.brandId ?? ''} onChange={(event) => setFilters({...filters, brandId:event.target.value || undefined})}><option value="">All brands</option>{brands.map((brand) => <option value={brand.id} key={brand.id}>{brand.name}</option>)}</select></label>
        <label>Horsepower<select value={filters.minHp ?? ''} onChange={(event) => { const value=Number(event.target.value); setFilters({...filters,minHp:value || undefined,maxHp:value ? value+10 : undefined}); }}><option value="">All HP ranges</option><option value="20">20–30 HP</option><option value="30">30–40 HP</option><option value="40">40–50 HP</option><option value="50">50–60 HP</option><option value="60">60–70 HP</option></select></label>
        <label>Condition<select value={filters.condition??''} onChange={event=>setFilters({...filters,condition:event.target.value as TractorFilters['condition']||undefined})}><option value="">New &amp; used</option><option value="new">New</option><option value="used">Used</option></select></label><label>Drive type<select value={filters.driveType ?? ''} onChange={(event) => setFilters({...filters,driveType:event.target.value || undefined})}><option value="">2WD &amp; 4WD</option><option>2WD</option><option>4WD</option></select></label>
        <label>Transmission<select value={filters.transmission ?? ''} onChange={(event) => setFilters({...filters,transmission:event.target.value || undefined})}><option value="">All transmissions</option><option>Manual</option><option>Synchromesh</option><option>Power Reverser</option></select></label>
      </aside>
      <div className="results"><div className="results-head"><div><p>TRACTOR RESULTS</p><h2>{loading ? 'Loading tractors…' : `${items.length} tractors found`}</h2></div><span>Published models from the catalog</span></div>
        {error && <div className="error-state"><h3>We couldn&apos;t load the tractor database.</h3><p>{error}</p><button onClick={() => load(true)}>Try again</button></div>}
        {!loading && !error && items.length === 0 && <div className="empty-state"><h3>No tractors found matching your filters.</h3><p>Try widening the horsepower range or choosing another brand.</p><button onClick={() => setFilters({pageSize:12})}>Clear filters</button></div>}
        <div className="catalog-grid">{items.map((tractor) => <TractorCard key={tractor.id} tractor={tractor} />)}</div>
        {hasMore && <button className="load-more" disabled={loading} onClick={() => load(false)}>{loading ? 'Loading…' : 'Load more tractors'}</button>}
      </div>
    </section>}
  </main></PublicShell>;
}
