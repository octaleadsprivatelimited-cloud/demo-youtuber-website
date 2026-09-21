'use client';
import { LocalizedElement } from '@/components/LocalizedElement';
import { youtubeVideoId } from '@/lib/content-links';
import type { Tractor } from '@/types/content';
export function TractorVideo({tractor}: {tractor: Tractor}) {
  const id = youtubeVideoId(tractor.youtubeId ?? tractor.youtubeVideoId);
  if (!id) return null;
  return <section aria-label="Product video">
    <LocalizedElement as="h2">Product video</LocalizedElement>
    <div className="youtube-frame"><iframe src={'https://www.youtube-nocookie.com/embed/' + id} title={tractor.name + ' — product video'} loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div>
    <LocalizedElement as="a" href={'https://www.youtube.com/watch?v=' + id} target="_blank" rel="noreferrer">Watch this tractor on YouTube ↗</LocalizedElement>
  </section>;
}
