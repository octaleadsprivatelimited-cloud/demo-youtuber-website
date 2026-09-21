'use client';
import { useEffect, useState } from 'react';
import { subscribePublicRecords, type SiteRecord } from '@/services/site-data';
export function usePublicRecords(collection: string) {
  const [items, setItems] = useState<SiteRecord[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => subscribePublicRecords(collection, records => { setItems(records); setError(''); setLoading(false); }, reason => { setError(reason.message); setLoading(false); }), [collection]);
  return { items, error, loading };
}
