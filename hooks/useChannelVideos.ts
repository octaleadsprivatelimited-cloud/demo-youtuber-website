'use client';

import { useEffect, useState } from 'react';
import type { YouTubeFeedVideo } from '@/services/youtube-feed';

let memoryCache: YouTubeFeedVideo[] | null = null;

export function useChannelVideos() {
  const [videos, setVideos] = useState<YouTubeFeedVideo[]>(memoryCache || []);
  const [loading, setLoading] = useState(!memoryCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch('/api/youtube/videos');
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = (await res.json()) as { videos?: YouTubeFeedVideo[] };
        if (mounted && Array.isArray(data.videos)) {
          memoryCache = data.videos;
          setVideos(data.videos);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to fetch videos');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { videos, loading, error };
}
