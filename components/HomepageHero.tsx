'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { useEffect, useState } from 'react';
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

export function HomepageHero({ slides, index, onSlide, paused = false, onPause }: { title: string; slides: HeroSlide[]; index: number; onSlide: (index: number) => void; paused?: boolean; onPause?: () => void; brands?: { id: string; name: string }[] }) {
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    // Fetch upcoming images ahead of their transition to avoid blank frames.
    slides.forEach(item => { const src = heroImageSource(item.image); if (src) { const image = new Image(); image.src = src; } });
  }, [slides]);
  const [failedSource, setFailedSource] = useState('');
  const slide = slides[index];
  const source = heroImageSource(slide?.image);
  const displaySource = source && source !== failedSource ? source : '';
  return <section className="ref-home-hero hero-fullbleed" aria-label="Featured tractor images">
    <LocalizedElement as="div" className="ref-home-hero-scene">
      <LocalizedElement as="div" className="ref-home-hero-media" style={{ backgroundColor: slide?.backgroundColor || '#ffffff' }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={(slide?.id || 'empty') + source}
            className="hero-slide-frame"
            initial={{ x: reduceMotion ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : '-100%' }}
            transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{ backgroundColor: slide?.backgroundColor || '#ffffff' }}
          >
            {displaySource && <LocalizedElement as="img" src={displaySource} alt={slide?.imageAlt || slide?.title || 'Featured tractor'} fetchPriority="high" draggable={false}
              style={{objectFit: slide?.imageFit === 'contain' ? 'contain' : 'cover', objectPosition: slide?.imagePosition || 'center'}}
              onError={() => setFailedSource(displaySource)}/>}

          </motion.div>
        </AnimatePresence>
      </LocalizedElement>
      <div className="hero-image-spacer" aria-hidden="true"/>
      {slides.length > 1 && <LocalizedElement as="div" className="ref-home-slide-controls" aria-label="Hero slides">{slides.map((item, position) => <LocalizedElement as="button" key={item.id} type="button" aria-label={'Show slide ' + (position + 1)} aria-pressed={position === index} onClick={() => onSlide(position)}/>)}{onPause && <button className="hero-playback-toggle" type="button" onClick={onPause} aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}>{paused ? '▶' : 'Ⅱ'}</button>}</LocalizedElement>}

    </LocalizedElement>
  </section>;
}
