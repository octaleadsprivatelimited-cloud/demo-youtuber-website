'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    // Fetch upcoming images ahead of their transition to avoid blank frames.
    slides.forEach(item => { const src = heroImageSource(item.image); if (src) { const image = new Image(); image.src = src; } });
  }, [slides]);
  const [failedSource, setFailedSource] = useState('');
  const slide = slides[index];
  const source = heroImageSource(slide?.image);
  const displaySource = source && source !== failedSource ? source : fallbackHeroImage;
  function search(event: FormEvent) {
    event.preventDefault();
    window.location.assign(homepageSearchUrl(query));
  }
  return <section className="ref-home-hero" aria-labelledby="ref-home-hero-title">
    <LocalizedElement as="div" className="ref-home-hero-scene">
      <LocalizedElement as="div" className="ref-home-hero-media" style={{ backgroundColor: slide?.backgroundColor || '#ffffff' }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={slide?.id || 'fallback'}
            className="hero-slide-frame"
            initial={{ x: reduceMotion ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : '-100%' }}
            transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{ backgroundColor: slide?.backgroundColor || '#ffffff' }}
          >
            <LocalizedElement as="img" src={displaySource} alt={slide?.title || 'Featured tractor'} fetchPriority="high" draggable={false} onError={() => {
              if (displaySource !== fallbackHeroImage) setFailedSource(displaySource);
            }}/>
          </motion.div>
        </AnimatePresence>
      </LocalizedElement>
      <LocalizedElement as="div" className="ref-home-hero-inner"><LocalizedElement as="div" className="ref-home-hero-copy">
        <LocalizedElement as="p" className="ref-home-eyebrow">RJ TRACTOR TECHS</LocalizedElement>
        <LocalizedElement as="h1" id="ref-home-hero-title">{title}</LocalizedElement>
        <LocalizedElement as="p" className="ref-home-hero-description">Explore reliable specifications, comparisons and field-tested guidance.</LocalizedElement>
        <form className="ref-home-hero-search" role="search" onSubmit={search}>
          <LocalizedElement as="img" src="/icons/tabler/search.svg" alt="" width={21} height={21}/>
          <LocalizedElement as="input" type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label="Search tractor, brand or model" placeholder="Search tractor, brand or model"/>
          <LocalizedElement as="button" type="submit">Search</LocalizedElement>
        </form>
        <LocalizedElement as="div" className="ref-home-hero-actions"><LocalizedElement as="a" className="ref-home-link" href="/tractors">Browse tractors<LocalizedElement as="img" src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></LocalizedElement><LocalizedElement as="a" className="ref-home-link" href="/compare">Compare models<LocalizedElement as="img" src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></LocalizedElement></LocalizedElement>
      </LocalizedElement></LocalizedElement>
      {slides.length > 1 && <LocalizedElement as="div" className="ref-home-slide-controls" aria-label="Hero slides">{slides.map((item, position) => <LocalizedElement as="button" key={item.id} type="button" aria-label={'Show slide ' + (position + 1)} aria-pressed={position === index} onClick={() => onSlide(position)}/>)}</LocalizedElement>}
      <nav className="ref-home-power-rail" aria-label="Browse tractors by horsepower">{powerLinks.map(item => <LocalizedElement as="a" href={item.href} key={item.label}><LocalizedElement as="img" src={'/icons/tabler/' + item.icon + '.svg'} alt="" width={25} height={25}/><LocalizedElement as="span">{item.label}</LocalizedElement></LocalizedElement>)}</nav>
    </LocalizedElement>
  </section>;
}
