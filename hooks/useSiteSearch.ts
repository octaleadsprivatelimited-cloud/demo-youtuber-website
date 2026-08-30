'use client';
import { useEffect, useMemo, useState } from 'react';
import { loadSearchIndex } from '@/services/search';
import { findSearchResults, normalizeSearch, type SearchItem } from '@/utils/site-search';

export function useSiteSearch(query: string) {
  const [index, setIndex] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    let current = true;
    setLoading(true);
    loadSearchIndex().then(result => {
      if (!current) return;
      setIndex(result.items); setUnavailable(result.unavailable); setLoading(false);
    }).catch(() => {
      if (!current) return;
      setIndex([]); setUnavailable(['content']); setLoading(false);
    });
    return () => { current = false; };
  }, [attempt]);
  useEffect(() => { const timer = setTimeout(() => setDebounced(query), 180); return () => clearTimeout(timer); }, [query]);
  const results = useMemo(() => findSearchResults(index, debounced), [index, debounced]);
  const pending = loading || debounced !== query;
  return { results: pending ? [] : results, pending, unavailable, ready: normalizeSearch(query).length >= 2, retry: () => setAttempt(value => value + 1) };
}
