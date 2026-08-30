'use client';
import { useState, type FormEvent } from 'react';
import { heroImageSource } from '@/lib/admin-records';
import type { HeroSlide } from '@/services/hero-slides';

export function homepageFinderUrl(brand: string, power: string) {
  const query = new URLSearchParams({ condition: 'new' });
  if (brand) query.set('brand', brand);
  if (['0:29', '30:45', '45:60', '61'].includes(power)) {
    const [min, max] = power.split(':');
    query.set('minHp', min);
    if (max) query.set('maxHp', max);
  }
  return '/tractors?' + query.toString();
}
export function homepageSearchUrl(searchTerm: string) {
  const query = new URLSearchParams({ condition: 'new' });
  if (searchTerm.trim()) query.set('search', searchTerm.trim());
  return '/tractors?' + query.toString();
}

const powerLinks = [
  { label: 'Under 40 HP', href: '/tractors?condition=new&maxHp=39', icon: 'tractor' },
  { label: '40–50 HP', href: '/tractors?condition=new&minHp=40&maxHp=50', icon: 'tractor' },
  { label: '50+ HP', href: '/tractors?condition=new&minHp=50', icon: 'tractor' },
  { label: 'Latest launches', href: '/new-tractors', icon: 'news' },
];

const fallbackHeroImage = '/hero/tractor-hero-cinematic.png';

export function HomepageHero({ title, slides, index, onSlide }: { title: string; slides: HeroSlide[]; index: number; onSlide: (index: number) => void; brands?: { id: string; name: string }[] }) {
  const [query, setQuery] = useState('');
  const [failedSource, setFailedSource] = useState('');
  const slide = slides[index];
  const source = heroImageSource(slide?.image);
  const displaySource = source && source !== failedSource ? source : fallbackHeroImage;
  function search(event: FormEvent) {
    event.preventDefault();
    window.location.assign(homepageSearchUrl(query));
  }
  return <section className="ref-home-hero" aria-labelledby="ref-home-hero-title">
    <div className="ref-home-hero-scene">
      <div className="ref-home-hero-media" style={{ backgroundColor: slide?.backgroundColor || '#ffffff' }}>
        <img key={displaySource} src={displaySource} alt={slide?.title || 'Featured tractor'} fetchPriority="high" onError={() => {
          if (displaySource !== fallbackHeroImage) setFailedSource(displaySource);
        }}/>
      </div>
      <div className="ref-home-hero-inner"><div className="ref-home-hero-copy">
        <p className="ref-home-eyebrow">RJ TRACTOR TECHS</p>
        <h1 id="ref-home-hero-title">{title}</h1>
        <p className="ref-home-hero-description">Explore reliable specifications, comparisons and field-tested guidance.</p>
        <form className="ref-home-hero-search" role="search" onSubmit={search}>
          <img src="/icons/tabler/search.svg" alt="" width={21} height={21}/>
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label="Search tractor, brand or model" placeholder="Search tractor, brand or model"/>
          <button type="submit">Search</button>
        </form>
        <div className="ref-home-hero-actions"><a className="ref-home-link" href="/tractors">Browse tractors<img src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></a><a className="ref-home-link" href="/compare">Compare models<img src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></a></div>
      </div></div>
      {slides.length > 1 && <div className="ref-home-slide-controls" aria-label="Hero slides">{slides.map((item, position) => <button key={item.id} type="button" aria-label={'Show slide ' + (position + 1)} aria-pressed={position === index} onClick={() => onSlide(position)}/>)}</div>}
      <nav className="ref-home-power-rail" aria-label="Browse tractors by horsepower">{powerLinks.map(item => <a href={item.href} key={item.label}><img src={'/icons/tabler/' + item.icon + '.svg'} alt="" width={25} height={25}/><span>{item.label}</span></a>)}</nav>
    </div>
  </section>;
}
