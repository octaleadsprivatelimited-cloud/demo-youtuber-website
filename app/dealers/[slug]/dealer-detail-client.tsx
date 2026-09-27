'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { getDealer, type Dealer } from '@/services/media';
import { heroImageSource } from '@/lib/admin-records';
import './dealer-profile.css';

export default function DealerDetailClient({ slug }: { slug: string }) {
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError(false); setDealer(null); setSelected('');
    getDealer(slug).then(value => { if (active) setDealer(value); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, retry]);
  const savedPhotos = [...new Set([dealer?.image, ...(Array.isArray(dealer?.images) ? dealer.images : [])].map(heroImageSource).filter(Boolean))];
  const photos = savedPhotos.length ? savedPhotos : [heroImageSource(dealer?.logo)].filter(Boolean);
  const address = dealer ? [...new Set([dealer.address, dealer.city, dealer.district, dealer.state, dealer.pincode].filter(Boolean))].join(', ') : '';
  const coordinates = dealer && Number.isFinite(dealer.latitude) && Number.isFinite(dealer.longitude);
  const mapQuery = coordinates ? `${dealer!.latitude},${dealer!.longitude}` : address;
  const whatsapp = dealer?.whatsapp?.replace(/\D/g, '');
  return <PublicShell><main className="showroom-page">
    {loading ? <p role="status" className="showroom-state">Loading dealer profile…</p> : error ? <div className="showroom-state" role="alert"><h1>Unable to load this dealer</h1><p>Please try again in a moment.</p><button onClick={() => setRetry(value => value + 1)}>Try again</button></div> : !dealer ? <div className="showroom-state"><h1>Dealer not found</h1><a href="/dealers">Browse showrooms</a></div> : <>
      <header className="showroom-heading">
        <div className="showroom-logo">{heroImageSource(dealer.logo) ? <img src={dealer.logo} alt={`${dealer.name} logo`}/> : <span>{dealer.name.slice(0, 2).toUpperCase()}</span>}</div>
        <div><p className="showroom-eyebrow">{dealer.verified ? 'VERIFIED DEALER' : 'OUR DEALER NETWORK'}</p><h1>{dealer.name}</h1>{dealer.brand && <p className="showroom-brand">{dealer.brand}</p>}{address && <p>{address}</p>}</div>
      </header>
      <div className="showroom-layout"><div>
        {photos.length > 0 ? <section className="showroom-gallery" aria-label={`${dealer.name} showroom photos`}>
          <a className="showroom-photo" href={selected || photos[0]} target="_blank" rel="noopener noreferrer" aria-label="Open showroom photo in full size"><img key={selected || photos[0]} src={selected || photos[0]} alt={`${dealer.name} showroom`}/></a>
          {photos.length > 1 && <div className="showroom-thumbnails">{photos.map((photo, index) => <button key={photo} type="button" aria-label={`View showroom photo ${index + 1}`} aria-pressed={(selected || photos[0]) === photo} onClick={() => setSelected(photo)}><img src={photo} alt=""/></button>)}</div>}
        </section> : <div className="showroom-no-photos"><h2>Visit {dealer.name}</h2><p>Showroom photos have not been added yet.</p></div>}
        {dealer.description && <section className="showroom-card"><h2>About this showroom</h2><p className="showroom-description">{dealer.description}</p></section>}
        {!!dealer.services?.length && <section className="showroom-card"><h2>Services available</h2><ul className="showroom-services">{dealer.services.map(service => <li key={service}>{service}</li>)}</ul></section>}
      </div><aside className="showroom-sidebar">
        <section className="showroom-card"><p className="showroom-eyebrow">LET’S TALK TRACTORS</p><h2>Contact this dealer</h2><p>Ask about availability, demonstrations and service.</p><div className="showroom-actions">
          {dealer.phone && <a className="showroom-call" href={`tel:${dealer.phone.replace(/[^+\d]/g, '')}`}>Call {dealer.phone}</a>}
          {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp dealer ↗</a>}
          {dealer.email && <a href={`mailto:${dealer.email}`}>Email dealer</a>}
          {!dealer.phone && !whatsapp && !dealer.email && <p>Contact details have not been published yet.</p>}
        </div></section>
        {mapQuery && <section className="showroom-card"><h2>Visit the showroom</h2>{address && <address>{address}</address>}<a className="showroom-directions" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer">Get directions ↗</a></section>}
        <a className="showroom-back" href="/dealers">Explore all showrooms →</a>
      </aside></div>
    </>}
  </main></PublicShell>;
}
