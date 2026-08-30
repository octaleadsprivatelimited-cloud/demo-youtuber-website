import type { Tractor } from '@/types/content';
import { FavouriteButton } from './FavouriteButton';
import { tractorPrice } from '@/lib/tractor-specifications';


export function TractorCard({ tractor, duplicate=false }: { tractor: Tractor; duplicate?:boolean }) {
  return <article className="tractor-card" aria-hidden={duplicate||undefined} inert={duplicate||undefined}>
    <div className="card-image" style={tractor.image ? { backgroundImage: `url(${tractor.image})` } : undefined}>
      <span>{tractor.featured ? 'FEATURED' : tractor.driveType ?? 'TRACTOR'}</span><FavouriteButton compact itemId={tractor.id} itemType="tractor" title={tractor.name} href={`/tractor/${tractor.brandSlug}/${tractor.slug}`} image={tractor.image} />
    </div>
    <div className="card-body"><p>{tractor.hp>0?tractor.hp+' HP':tractor.powerCategory||'Power not provided'} · {tractor.transmission}</p><h3>{tractor.name}</h3><strong>{tractorPrice(tractor)}<small>Estimated price</small></strong><div><a href={`/tractor/${tractor.brandSlug}/${tractor.slug}`}>View details</a><a href={`/compare?tractor=${tractor.id}`}>+ Compare</a></div></div>
  </article>;
}
