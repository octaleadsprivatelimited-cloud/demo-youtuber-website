import type { Tractor } from '../types/content';

export const tractorShowcaseTabs = ['popular', 'latest', 'upcoming'] as const;
export type TractorShowcaseTab = typeof tractorShowcaseTabs[number];
export const tractorShowcaseLabels: Record<TractorShowcaseTab, string> = { popular: 'Popular', latest: 'Latest', upcoming: 'Upcoming' };
export const tractorShowcaseLinks: Record<TractorShowcaseTab, string> = { popular: '/tractors?view=popular', latest: '/new-tractors', upcoming: '/upcoming-tractors' };

function createdTime(value: unknown): number {
  if (typeof value === 'string') return Date.parse(value) || 0;
  if (value instanceof Date) return value.getTime();
  if (value && typeof value === 'object' && 'seconds' in value) return Number(value.seconds) * 1000 || 0;
  return 0;
}
export function selectShowcaseTractors(tractors: Tractor[], tab: TractorShowcaseTab): Tractor[] {
  const seen = new Set<string>();
  return tractors.filter(item => {
    if (item.status !== 'published' || item.condition === 'used' || !item.slug || !item.brandSlug || seen.has(item.id)) return false;
    seen.add(item.id);
    if (tab === 'upcoming') return item.upcoming === true;
    if (item.upcoming === true) return false;
    return tab === 'popular' ? item.popular === true : true;
  }).sort((a, b) => {
    if (tab === 'popular') return (Number(b.popularityScore) || 0) - (Number(a.popularityScore) || 0) || a.name.localeCompare(b.name);
    return createdTime(b.createdAt) - createdTime(a.createdAt) || a.name.localeCompare(b.name);
  });
}
