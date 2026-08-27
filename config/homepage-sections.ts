export const homepageSections = [
  { key: 'hero', title: 'Find Your Right Tractor' },
  { key: 'introduction', title: 'Research your next tractor' },
  { key: 'promotions', title: 'Featured promotions' },
  { key: 'tractors', title: 'Popular tractors' },
  { key: 'brands', title: 'Popular tractor brands' },
  { key: 'compare', title: 'Compare tractors, side by side.' },
  { key: 'articles', title: 'Latest insights & reviews' },
  { key: 'videos', title: 'Latest videos' },
  { key: 'youtube', title: 'RJ Tractor Techs on YouTube' },
  { key: 'partners', title: 'Partner logos' },
];
export function resolveHomepageSections(records: { id: string; [key: string]: unknown }[]) {
  return homepageSections.map((section, index) => {
    const override = records.find(row => row.key === section.key);
    return { ...section, title: String(override?.title || section.title), order: Number(override?.order ?? index + 1), visible: override?.visible !== false };
  }).filter(section => section.visible).sort((a, b) => a.order - b.order);
}
