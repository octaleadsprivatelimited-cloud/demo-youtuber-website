'use client';
import { useState } from 'react';
import { heroImageSource } from '@/lib/admin-records';
import './tractor-gallery.css';

export function TractorGallery({ name, image, images }: { name: string; image?: string; images?: unknown }) {
  const photos = [...new Set([image, ...(Array.isArray(images) ? images : [])].map(heroImageSource).filter(Boolean))];
  const [selected, setSelected] = useState('');
  const current = photos.includes(selected) ? selected : photos[0];
  return <div className="tractor-gallery" aria-label={`${name} photos`}>
    {current ? <a className="tractor-gallery-main" href={current} target="_blank" rel="noopener noreferrer" aria-label={`Open ${name} photo in full size`}><img src={current} alt={name}/></a> : <div className="tractor-gallery-empty">Tractor photos have not been added yet.</div>}
    {photos.length > 1 && <div className="tractor-gallery-thumbnails">{photos.map((photo, index) => <button type="button" key={photo} aria-label={`View tractor photo ${index + 1}`} aria-pressed={photo === current} onClick={() => setSelected(photo)}><img src={photo} alt=""/></button>)}</div>}
  </div>;
}
