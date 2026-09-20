export const homepageSections = [
  { key: 'hero', title: 'Your next tractor, researched.', visible: true },
  { key: 'tractors', title: 'Tractors in ' + new Date().getUTCFullYear(), visible: true },
  { key: 'reviews', title: 'Tractor reviews from our editorial team', visible: true },
  { key: 'brands', title: 'Tractors by brands', visible: true },
  { key: 'compare', title: 'Compare the details. Make a confident choice.', visible: true },
  { key: 'articles', title: 'Stories from the field.', visible: true },
  { key: 'videos', title: 'Recent videos on YouTube', visible: true },
  { key: 'promotions', title: 'Featured promotions', visible: true },
  { key: 'introduction', title: 'Research your next tractor', visible: false },
  { key: 'partners', title: 'Our Partners', visible: true },
];
export function resolveHomepageSections(records: { id: string; [key: string]: unknown }[]) {
  const resolved = homepageSections.map((section, index) => {
    const override = records.find(row => row.key === section.key);
    return { ...section, title: String(override?.title || section.title), order: Number(override?.order ?? ({hero:1,partners:2,videos:3,tractors:4,reviews:5,brands:6,compare:7,articles:8,promotions:9,introduction:10}[section.key] ?? index + 1)), visible: typeof override?.visible === 'boolean' ? override.visible : section.visible };
  }).filter(section => section.visible).sort((a, b) => a.order - b.order);
  // Retain the established layout until the owner explicitly configures ordering.
  if (records.some(record => Number(record.order) > 0)) return resolved;
  const pinnedKeys = ['hero', 'partners', 'videos', 'tractors'];
  return [...pinnedKeys.flatMap(key => resolved.filter(section => section.key === key)), ...resolved.filter(section => !pinnedKeys.includes(section.key))];
}
