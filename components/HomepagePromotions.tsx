'use client';
import { usePublicRecords } from '@/hooks/usePublicRecords';
export function HomepagePromotions({ title }: { title: string }) {
  const {items: banners} = usePublicRecords('banners');
  const {items: advertisements} = usePublicRecords('advertisements');
  const ads = advertisements.filter(item => item.placement === 'homepage');
  if (!banners.length && !ads.length) return null;
  return <section className="home-v2 home-promotions" aria-label={title}><div className="cms-home">
    {banners.map(item => <a key={item.id} className="cms-banner" href={String(item.ctaUrl || '/tractors')}>
      {item.image ? <img src={String(item.image)} alt={String(item.title)} loading="lazy"/> : null}
      <div className="cms-banner-copy"><p>FEATURED</p><h2>{String(item.title)}</h2><strong>{String(item.ctaLabel || 'Explore')} <span aria-hidden="true">↗</span></strong></div>
    </a>)}
    {ads.map(item => <a key={item.id} className="cms-ad" href={String(item.destinationUrl || '/contact')}><small>ADVERTISEMENT</small>
      {item.image ? <img src={String(item.image)} alt={String(item.title || 'Advertisement')} loading="lazy"/> : <strong>{String(item.title)}</strong>}
    </a>)}
  </div></section>;
}
