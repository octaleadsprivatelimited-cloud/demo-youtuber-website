'use client';
import { useState } from 'react';
import { heroImageSource } from '@/lib/admin-records';
import type { HeroSlide } from '@/services/hero-slides';
export function HeroSlideImage({ slide }: { slide?: HeroSlide }) {
  const source = heroImageSource(slide?.image);
  const [failedSource, setFailedSource] = useState('');
  return <div className={'reference-hero-image ' + (!source || source === failedSource ? 'is-blank' : '')}
    style={{ backgroundColor: slide?.backgroundColor || '#ffffff', backgroundImage: 'none' }}>
    {source && source !== failedSource && <img key={source} src={source} alt={slide?.title || 'Homepage hero'}
      fetchPriority="high" onError={() => setFailedSource(source)}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}/>}
  </div>;
}
