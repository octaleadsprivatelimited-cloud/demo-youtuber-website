'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { websiteLink } from '@/lib/content-links';
import { usePublicRecords } from '@/hooks/usePublicRecords';
export function HomepagePromotions({ title }: { title: string }) {
  const {items: banners} = usePublicRecords('banners');
  const {items: advertisements} = usePublicRecords('advertisements');
  const ads = advertisements.filter(item => item.placement === 'homepage');
  if (!banners.length && !ads.length) return null;
  return <section className="home-v2 home-promotions" aria-label={title}><LocalizedElement as="div" className="cms-home">
    {banners.map(item => <LocalizedElement as="a" key={item.id} className="cms-banner" href={websiteLink(item.ctaUrl ?? item.destinationUrl ?? item.url ?? item.link) || undefined}>
      {item.image ? <LocalizedElement as="img" src={String(item.image)} alt={String(item.title)} loading="lazy"/> : null}
      <LocalizedElement as="div" className="cms-banner-copy"><LocalizedElement as="p">FEATURED</LocalizedElement><LocalizedElement as="h2">{String(item.title)}</LocalizedElement><LocalizedElement as="strong">{String(item.ctaLabel || 'Explore')} <LocalizedElement as="span" aria-hidden="true">↗</LocalizedElement></LocalizedElement></LocalizedElement>
    </LocalizedElement>)}
    {ads.map(item => <LocalizedElement as="a" key={item.id} className="cms-ad" href={websiteLink(item.destinationUrl ?? item.ctaUrl ?? item.url ?? item.link) || undefined}><LocalizedElement as="small">ADVERTISEMENT</LocalizedElement>
      {item.image ? <LocalizedElement as="img" src={String(item.image)} alt={String(item.title || 'Advertisement')} loading="lazy"/> : <LocalizedElement as="strong">{String(item.title)}</LocalizedElement>}
    </LocalizedElement>)}
  </LocalizedElement></section>;
}
