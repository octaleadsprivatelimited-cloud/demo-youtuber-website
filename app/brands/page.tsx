'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listBrands } from '@/services/tractors';
import type { Brand } from '@/types/content';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    listBrands().then(setBrands).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load brands.')).finally(() => setLoading(false));
  }, []);
  return <PublicShell><main className="simple-page"><section className="page-hero"><p>TRACTOR MAKERS</p><h1>Explore tractor brands</h1><span>Browse published manufacturers and discover their tractor ranges.</span></section>
    {!isFirebaseConfigured ? <SetupNotice /> : <section className="brand-listing">{loading ? <div className="loading-grid">{[1,2,3,4,5,6].map(item => <span key={item} />)}</div> : error ? <div className="error-state"><h3>Brands are temporarily unavailable.</h3><p>{error}</p></div> : brands.length === 0 ? <div className="empty-state"><h3>No published brands yet.</h3><p>Add and publish brands from the admin panel when Phase 6 is ready.</p></div> : <div className="brand-directory">{brands.map((brand) => <a key={brand.id} href={`/tractors?brand=${brand.id}`}><div>{brand.logo ? <img src={brand.logo} alt={`${brand.name} logo`} /> : brand.name.slice(0,2).toUpperCase()}</div><h2>{brand.name}</h2><p>{brand.description ?? 'Explore published tractor models, specifications and prices.'}</p><span>{brand.modelCount ?? 0} models →</span></a>)}</div>}</section>}
  </main></PublicShell>;
}

