'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getTractorBySlugs } from '@/services/tractors';
import type { Tractor } from '@/types/content';
import { FavouriteButton } from '@/components/FavouriteButton';
import { ReviewForm } from '@/components/ReviewForm';
import { LeadForm } from '@/components/LeadForm';
import { trackEvent } from '@/services/analytics';

const money = (value: number) => `₹${(value / 100000).toFixed(2)} Lakh`;

export default function TractorDetailClient({ brandSlug, modelSlug }: { brandSlug: string; modelSlug: string }) {
  const [tractor, setTractor] = useState<Tractor | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    getTractorBySlugs(brandSlug, modelSlug).then(setTractor).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load tractor.')).finally(() => setLoading(false));
  }, [brandSlug, modelSlug]);
  useEffect(() => { if (tractor) trackEvent('tractor_view', { tractor_id: tractor.id, tractor_name: tractor.name }); }, [tractor]);

  return <PublicShell><main className="detail-page">{!isFirebaseConfigured ? <SetupNotice /> : loading ? <div className="detail-loading">Loading tractor details…</div> : error ? <div className="error-state"><h3>Tractor details are unavailable.</h3><p>{error}</p></div> : !tractor ? <div className="empty-state"><h3>Tractor not found.</h3><a href="/tractors">Browse all tractors</a></div> : <>
    <div className="breadcrumbs"><a href="/">Home</a><span>›</span><a href="/tractors">Tractors</a><span>›</span><a href={`/tractors?brand=${tractor.brandId}`}>{tractor.brandName}</a><span>›</span><b>{tractor.model}</b></div>
    <section className="tractor-detail-hero"><div className="detail-image" style={tractor.image ? {backgroundImage:`url(${tractor.image})`} : undefined}><span>{tractor.featured ? 'FEATURED TRACTOR' : `${tractor.driveType ?? ''} TRACTOR`}</span></div><div className="detail-summary"><p>{tractor.brandName} · {tractor.hp} HP</p><h1>{tractor.name}</h1><span>{tractor.tagline ?? 'Specifications, features and estimated pricing.'}</span><div className="price-box"><small>Estimated price range</small><strong>{money(tractor.minPrice)} – {money(tractor.maxPrice)}</strong><em>Ex-showroom estimate. Local prices may vary.</em></div><div className="detail-actions"><a href={`/compare?tractor=${tractor.id}`}>Compare tractor</a><FavouriteButton itemId={tractor.id} itemType="tractor" title={tractor.name} href={`/tractor/${tractor.brandSlug}/${tractor.slug}`} image={tractor.image} /><a href="#enquire">Send enquiry</a></div></div></section>
    <section className="spec-highlights"><div><span>POWER</span><strong>{tractor.hp} HP</strong></div><div><span>ENGINE</span><strong>{tractor.engineCapacityCc ?? '—'} cc</strong></div><div><span>TRANSMISSION</span><strong>{tractor.transmission}</strong></div><div><span>LIFTING CAPACITY</span><strong>{tractor.liftingCapacityKg ? `${tractor.liftingCapacityKg} kg` : '—'}</strong></div><div><span>DRIVE</span><strong>{tractor.driveType ?? '—'}</strong></div></section>
    <section className="detail-content"><article><p>OVERVIEW</p><h2>About the {tractor.name}</h2><div>{tractor.description ?? 'The editorial overview for this tractor will be published after verification by the RJ Tractor Techs content team.'}</div><h2>Specifications</h2><table><tbody>{Object.entries(tractor.specifications ?? {}).map(([label,value]) => <tr key={label}><th>{label}</th><td>{String(value)}</td></tr>)}</tbody></table><ReviewForm tractorId={tractor.id} tractorName={tractor.name} /><LeadForm tractorId={tractor.id} tractorName={tractor.name} source="tractor_detail" /></article><aside id="enquire"><p>PLAN YOUR PURCHASE</p><h2>Estimate monthly payments</h2><span>Use the EMI calculator, then send an enquiry from this page.</span><a href={`/emi-calculator?tractor=${tractor.id}&price=${tractor.minPrice}`}>Calculate EMI →</a><a className="youtube-cta" href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">▶ Watch on YouTube</a></aside></section>
    <div className="mobile-action-bar"><a href={`/compare?tractor=${tractor.id}`}>Compare</a><button>♡ Favourite</button><a href="#enquire">Enquire</a></div>
  </>}</main></PublicShell>;
}
