'use client';

import { usePublicRecords } from './usePublicRecords';

export function useSiteSettings(): Record<string, string> {
  const { items } = usePublicRecords('settings');
  const recordSettings = Object.fromEntries(items.map(item => [String(item.key), String(item.value ?? '')]));
  return {
    logo: '/logo.png',
    websiteName: 'RJ Tractor Techs',
    ...recordSettings,
  };
}
