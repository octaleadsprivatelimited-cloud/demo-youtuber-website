import type { Tractor } from '@/types/content';

const formatPrice = (value: number) => value >= 100000 ? `₹${(value / 100000).toFixed(2)} Lakh` : `₹${value.toLocaleString('en-IN')}`;

export function TractorCard({ tractor }: { tractor: Tractor }) {
  return <article className="tractor-card">
    <div className="card-image" style={tractor.image ? { backgroundImage: `url(${tractor.image})` } : undefined}>
      <span>{tractor.featured ? 'FEATURED' : tractor.driveType ?? 'TRACTOR'}</span><button aria-label={`Favourite ${tractor.name}`}>♡</button>
    </div>
    <div className="card-body"><p>{tractor.hp} HP · {tractor.transmission}</p><h3>{tractor.name}</h3><strong>{formatPrice(tractor.minPrice)}–{formatPrice(tractor.maxPrice)}<small>Estimated price</small></strong><div><a href={`/tractor/${tractor.brandSlug}/${tractor.slug}`}>View details</a><a href={`/compare?tractor=${tractor.id}`}>+ Compare</a></div></div>
  </article>;
}

