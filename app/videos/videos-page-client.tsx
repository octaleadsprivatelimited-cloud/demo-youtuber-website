'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { FavouriteButton } from '@/components/FavouriteButton';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listVideos, type Video } from '@/services/media';

export default function VideosPage() {
  const settings = { youtube: 'https://www.youtube.com/@Rjtractortechs' };
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    listVideos()
      .then(setItems)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load videos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicShell>
      <main className="video-index">
        <section className="video-hero">
          <LocalizedElement as="div">
            <LocalizedElement as="p">OFFICIAL YOUTUBE CHANNEL</LocalizedElement>
            <LocalizedElement as="h1">Watch RJ Tractor Techs</LocalizedElement>
            <LocalizedElement as="span">Tractor stories, model explainers and topics from the field. Explore the published videos or continue on the RJ Tractor Techs channel.</LocalizedElement>
            <LocalizedElement as="a" href={settings.youtube || 'https://www.youtube.com/@Rjtractortechs'} target="_blank" rel="noreferrer">
              Visit YouTube channel ↗
            </LocalizedElement>
          </LocalizedElement>
        </section>
        {!isFirebaseConfigured ? (
          <SetupNotice />
        ) : (
          <section className="video-list">
            {loading ? (
              <LocalizedElement as="div" className="detail-loading">Loading videos…</LocalizedElement>
            ) : error ? (
              <LocalizedElement as="div" className="error-state">
                <LocalizedElement as="h3">Videos are unavailable.</LocalizedElement>
                <LocalizedElement as="p">{error}</LocalizedElement>
              </LocalizedElement>
            ) : !items.length ? (
              <LocalizedElement as="div" className="empty-state">
                <LocalizedElement as="h3">Your next watch is on the channel.</LocalizedElement>
                <LocalizedElement as="p">The website library has no published videos yet. Visit our channel to keep exploring.</LocalizedElement>
                <LocalizedElement as="a" href={settings.youtube || 'https://www.youtube.com/@Rjtractortechs'} target="_blank" rel="noreferrer">Explore YouTube ↗</LocalizedElement>
              </LocalizedElement>
            ) : (
              <LocalizedElement as="div" className="video-grid">
                {items.map((item) => (
                  <article key={item.id}>
                    <LocalizedElement as="a"
                      className="video-thumb"
                      href={`/videos/${item.slug}`}
                      style={item.thumbnail ? { backgroundImage: `url(${item.thumbnail})` } : undefined}
                    >
                      <LocalizedElement as="span">▶</LocalizedElement>
                    </LocalizedElement>
                    <section>
                      <LocalizedElement as="p">{item.category ?? 'RJ TRACTOR TECHS'}</LocalizedElement>
                      <LocalizedElement as="h2"><LocalizedElement as="a" href={`/videos/${item.slug}`}>{item.title}</LocalizedElement></LocalizedElement>
                      <LocalizedElement as="div">
                        {item.tractorName && <LocalizedElement as="small">{item.tractorName}</LocalizedElement>}
                        <FavouriteButton compact itemId={item.id} itemType="video" title={item.title} href={`/videos/${item.slug}`} image={item.thumbnail} />
                      </LocalizedElement>
                    </section>
                  </article>
                ))}
              </LocalizedElement>
            )}
          </section>
        )}
      </main>
    </PublicShell>
  );
}
