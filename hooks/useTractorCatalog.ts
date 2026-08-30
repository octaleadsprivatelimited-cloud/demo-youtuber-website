'use client';
import { useEffect, useState } from 'react';
import { subscribeComparisonCatalog } from '@/services/comparison';
import type { Tractor } from '@/types/content';

export function useTractorCatalog() {
  const [items, setItems] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setLoading(true); setError('');
    return subscribeComparisonCatalog(records => { setItems(records); setLoading(false); setError(''); }, reason => { setError(reason.message); setLoading(false); });
  }, [attempt]);
  return { items, loading, error, retry: () => setAttempt(value => value + 1) };
}
