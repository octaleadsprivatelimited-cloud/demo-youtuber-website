
import { LocalizedElement } from '@/components/LocalizedElement';
import type { Tractor } from '@/types/content';
import { FavouriteButton } from './FavouriteButton';
import { tractorPrice } from '@/lib/tractor-specifications';


export function TractorCard({ tractor, duplicate=false }: { tractor: Tractor; duplicate?:boolean }) {
  return <article className="tractor-card" aria-hidden={duplicate||undefined} inert={duplicate||undefined}>
    <LocalizedElement as="div" className="card-image" style={tractor.image ? { backgroundImage: `url(${tractor.image})` } : undefined}>
      <LocalizedElement as="span">{tractor.featured ? 'FEATURED' : tractor.driveType ?? 'TRACTOR'}</LocalizedElement><FavouriteButton compact itemId={tractor.id} itemType="tractor" title={tractor.name} href={`/tractor/${tractor.brandSlug}/${tractor.slug}`} image={tractor.image} />
    </LocalizedElement>
    <LocalizedElement as="div" className="card-body"><LocalizedElement as="p">{tractor.hp>0?tractor.hp+' HP':tractor.powerCategory||'Power not provided'} · {tractor.transmission}</LocalizedElement><LocalizedElement as="h3">{tractor.name}</LocalizedElement><LocalizedElement as="strong">{tractorPrice(tractor)}<LocalizedElement as="small">Estimated price</LocalizedElement></LocalizedElement><LocalizedElement as="div"><LocalizedElement as="a" href={`/tractor/${tractor.brandSlug}/${tractor.slug}`}>View details</LocalizedElement><LocalizedElement as="a" href={`/compare?tractor=${tractor.id}`}>+ Compare</LocalizedElement></LocalizedElement></LocalizedElement>
  </article>;
}
