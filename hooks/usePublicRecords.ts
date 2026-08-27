'use client';
import { useEffect, useState } from 'react';
import { subscribePublicRecords, type SiteRecord } from '@/services/site-data';
export function usePublicRecords(collection: string) {
  const [items, setItems] = useState<SiteRecord[]>([]);
  const [error, setError] = useState('');
  useEffect(() => subscribePublicRecords(collection, records => { setItems(records); setError(''); }, reason => setError(reason.message)), [collection]);
  return { items, error };
}
