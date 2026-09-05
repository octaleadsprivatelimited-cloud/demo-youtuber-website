'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getTractorBySlugs } from '@/services/tractors';
import type { Tractor } from '@/types/content';
import { FavouriteButton } from '@/components/FavouriteButton';
import { EditorialReviews } from '@/components/EditorialReviews';

import { LeadForm } from '@/components/LeadForm';
import { trackEvent } from '@/services/analytics';
import { TractorSpecifications } from '@/components/TractorSpecifications';
import { tractorPrice, readSpecification } from '@/lib/tractor-specifications';
import { tractorSpecFields } from '@/config/tractor-specifications';

const spec = (tractor: Tractor, key: string) => readSpecification(tractor, tractorSpecFields.find(field=>field.key===key)!);

export default function TractorDetailClient({ brandSlug, modelSlug }: { brandSlug: string; modelSlug: string }) {
  const [tractor, setTractor] = useState<Tractor | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    getTractorBySlugs(brandSlug, modelSlug).then(setTractor).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load tractor.')).finally(() => setLoading(false));
  }, [brandSlug, modelSlug]);
  useEffect(() => { if (tractor) trackEvent('tractor_view', { tractor_id: tractor.id, tractor_name: tractor.name }); }, [tractor]);

  return <PublicShell><main className="detail-page">{!isFirebaseConfigured ? <SetupNotice /> : loading ? <LocalizedElement as="div" className="detail-loading">Loading tractor details…</LocalizedElement> : error ? <LocalizedElement as="div" className="error-state"><LocalizedElement as="h3">Tractor details are unavailable.</LocalizedElement><LocalizedElement as="p">{error}</LocalizedElement></LocalizedElement> : !tractor ? <LocalizedElement as="div" className="empty-state"><LocalizedElement as="h3">Tractor not found.</LocalizedElement><LocalizedElement as="a" href="/tractors">Browse all tractors</LocalizedElement></LocalizedElement> : <>
    <LocalizedElement as="div" className="breadcrumbs"><LocalizedElement as="a" href="/">Home</LocalizedElement><LocalizedElement as="span">›</LocalizedElement><LocalizedElement as="a" href="/tractors">Tractors</LocalizedElement><LocalizedElement as="span">›</LocalizedElement><LocalizedElement as="a" href={`/tractors?brand=${tractor.brandId}`}>{tractor.brandName}</LocalizedElement><LocalizedElement as="span">›</LocalizedElement><b>{tractor.model}</b></LocalizedElement>
    <section className="tractor-detail-hero"><LocalizedElement as="div" className="detail-image" style={tractor.image ? {backgroundImage:`url(${tractor.image})`} : undefined}><LocalizedElement as="span">{tractor.featured ? 'FEATURED TRACTOR' : `${tractor.driveType ?? ''} TRACTOR`}</LocalizedElement></LocalizedElement><LocalizedElement as="div" className="detail-summary"><LocalizedElement as="p">{tractor.brandName} · {spec(tractor,'horsepower')}</LocalizedElement><LocalizedElement as="h1">{tractor.name}</LocalizedElement><LocalizedElement as="span">{tractor.tagline ?? 'Specifications, features and estimated pricing.'}</LocalizedElement><LocalizedElement as="div" className="price-box" id="price" style={{scrollMarginTop:100}}><LocalizedElement as="small">Estimated price range</LocalizedElement><LocalizedElement as="strong">{tractorPrice(tractor)}</LocalizedElement><em>Ex-showroom estimate. Local prices may vary.</em></LocalizedElement><LocalizedElement as="div" className="detail-actions"><LocalizedElement as="a" href={`/compare?tractor=${tractor.id}`}>Compare tractor</LocalizedElement><FavouriteButton itemId={tractor.id} itemType="tractor" title={tractor.name} href={`/tractor/${tractor.brandSlug}/${tractor.slug}`} image={tractor.image} /><LocalizedElement as="a" href="#enquire">Send enquiry</LocalizedElement></LocalizedElement></LocalizedElement></section>
    <section className="spec-highlights"><LocalizedElement as="div"><LocalizedElement as="span">POWER</LocalizedElement><LocalizedElement as="strong">{spec(tractor,'horsepower')}</LocalizedElement></LocalizedElement><LocalizedElement as="div"><LocalizedElement as="span">ENGINE</LocalizedElement><LocalizedElement as="strong">{spec(tractor,'engineCapacityCc')}</LocalizedElement></LocalizedElement><LocalizedElement as="div"><LocalizedElement as="span">TRANSMISSION</LocalizedElement><LocalizedElement as="strong">{spec(tractor,'transmission')}</LocalizedElement></LocalizedElement><LocalizedElement as="div"><LocalizedElement as="span">LIFTING CAPACITY</LocalizedElement><LocalizedElement as="strong">{spec(tractor,'liftingCapacityKg')}</LocalizedElement></LocalizedElement><LocalizedElement as="div"><LocalizedElement as="span">DRIVE</LocalizedElement><LocalizedElement as="strong">{spec(tractor,'driveType')}</LocalizedElement></LocalizedElement></section>
    <section className="detail-content"><article><LocalizedElement as="p">OVERVIEW</LocalizedElement><LocalizedElement as="h2">About the {tractor.name}</LocalizedElement><LocalizedElement as="div">{tractor.description ?? 'The editorial overview for this tractor will be published after verification by the RJ Tractor Techs content team.'}</LocalizedElement><LocalizedElement as="h2">Specifications</LocalizedElement><TractorSpecifications tractor={tractor}/><EditorialReviews tractorId={tractor.id}/><LeadForm tractorId={tractor.id} tractorName={tractor.name} source="tractor_detail" /></article><aside id="enquire"><LocalizedElement as="p">PLAN YOUR PURCHASE</LocalizedElement><LocalizedElement as="h2">Estimate monthly payments</LocalizedElement><LocalizedElement as="span">Use the EMI calculator, then send an enquiry from this page.</LocalizedElement><LocalizedElement as="a" href={`/emi-calculator?tractor=${tractor.id}&price=${tractor.minPrice}`}>Calculate EMI →</LocalizedElement><LocalizedElement as="a" className="youtube-cta" href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">▶ Watch on YouTube</LocalizedElement></aside></section>
    <LocalizedElement as="div" className="mobile-action-bar"><LocalizedElement as="a" href={`/compare?tractor=${tractor.id}`}>Compare</LocalizedElement><LocalizedElement as="a" href="#enquire">Enquire</LocalizedElement></LocalizedElement>
  </>}</main></PublicShell>;
}
