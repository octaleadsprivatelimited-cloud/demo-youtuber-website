'use client';
import { useState } from 'react';
import { heroImageSource } from '@/lib/admin-records';
import { youtubeVideoId } from '@/lib/content-links';
import './tractor-gallery.css';

export function TractorGallery({ name, image, images, video, videoFirst = false }: { name: string; image?: string; images?: unknown; video?: string; videoFirst?: boolean }) {
  const photos = [...new Set([image, ...(Array.isArray(images) ? images : [])].map(heroImageSource).filter(Boolean))];
  const videoId = youtubeVideoId(video);
  const videoKey = videoId ? `video:${videoId}` : '';
  const slides = videoKey ? (videoFirst ? [videoKey, ...photos] : [...photos, videoKey]) : photos;
  const [selected, setSelected] = useState('');
  const current = slides.includes(selected) ? selected : slides[0];
  return <div className="tractor-gallery" aria-label={`${name} photos and video`}>
    {videoKey && current === videoKey ? <div className="tractor-gallery-video">
      <iframe key={videoId} src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={`${name} — product video`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
      <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
    </div> : current ? <a className="tractor-gallery-main" href={current} target="_blank" rel="noopener noreferrer" aria-label={`Open ${name} photo in full size`}><img src={current} alt={name}/></a> : <div className="tractor-gallery-empty">Tractor photos have not been added yet.</div>}
    {slides.length > 1 && <div className="tractor-gallery-thumbnails">{slides.map(slide => <button type="button" key={slide} aria-label={slide === videoKey ? 'Watch tractor video' : `View tractor photo ${photos.indexOf(slide) + 1}`} aria-pressed={slide === current} onClick={() => setSelected(slide)}>
      {slide === videoKey ? <><img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt=""/><span className="tractor-gallery-video-label">▶ Video</span></> : <img src={slide} alt=""/>}
    </button>)}</div>}
  </div>;
}
