'use client';

import { usePublicRecords } from './usePublicRecords';

export function useSiteSettings() {
  const { items } = usePublicRecords('settings');
  return Object.fromEntries(items.map(item => [String(item.key), String(item.value ?? '')]));
}
