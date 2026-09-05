'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { useState } from 'react';
import { heroImageSource } from '@/lib/admin-records';
import type { HeroSlide } from '@/services/hero-slides';
export function HeroSlideImage({ slide }: { slide?: HeroSlide }) {
  const source = heroImageSource(slide?.image);
  const [failedSource, setFailedSource] = useState('');
  return <LocalizedElement as="div" className={'reference-hero-image ' + (!source || source === failedSource ? 'is-blank' : '')}
    style={{ backgroundColor: slide?.backgroundColor || '#ffffff', backgroundImage: 'none' }}>
    {source && source !== failedSource && <LocalizedElement as="img" key={source} src={source} alt={slide?.title || 'Homepage hero'}
      fetchPriority="high" onError={() => setFailedSource(source)}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}/>}
  </LocalizedElement>;
}
