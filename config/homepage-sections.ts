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
    return { ...section, title: String(override?.title || section.title), order: Number(override?.order ?? index + 1), visible: typeof override?.visible === 'boolean' ? override.visible : section.visible };
  }).filter(section => section.visible).sort((a, b) => a.order - b.order);
  const videos = resolved.find(section => section.key === 'videos');
  const partners = resolved.find(section => section.key === 'partners');
  const tractors = resolved.find(section => section.key === 'tractors');
  const sections = resolved.filter(section => !['videos', 'partners', 'tractors'].includes(section.key));
  const pinned = [partners, videos, tractors].filter((section): section is NonNullable<typeof section> => Boolean(section));
  if (pinned.length) sections.splice(sections.findIndex(section => section.key === 'hero') + 1, 0, ...pinned);
  return sections;
}
