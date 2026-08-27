'use client';
import { usePublicRecords } from '@/hooks/usePublicRecords';
export function HomepagePromotions({ title }: { title: string }) {
  const {items:banners}=usePublicRecords('banners');
  const {items:advertisements}=usePublicRecords('advertisements');
  const ads=advertisements.filter(item=>item.placement==='homepage');
  if(!banners.length&&!ads.length)return null;
  return <section className="cms-home" aria-label={title}>
    {banners.map(item=><a key={item.id} className="cms-banner" href={String(item.ctaUrl||'/tractors')}
      style={item.image?{backgroundImage:'linear-gradient(90deg,rgba(7,20,11,.85),rgba(7,20,11,.2)),url('+JSON.stringify(String(item.image))+')'}:undefined}>
      <p>FEATURED</p><h2>{String(item.title)}</h2><strong>{String(item.ctaLabel||'Explore')} →</strong>
    </a>)}
    {ads.map(item=><a key={item.id} className="cms-ad" href={String(item.destinationUrl||'/contact')}><small>ADVERTISEMENT</small>
      {item.image?<img src={String(item.image)} alt={String(item.title||'Advertisement')}/>:<strong>{String(item.title)}</strong>}
    </a>)}
  </section>;
}
