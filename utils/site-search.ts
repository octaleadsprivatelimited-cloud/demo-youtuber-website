export const searchCategories = ['All', 'Tractors', 'Brands', 'Articles', 'Videos', 'Equipment', 'Dealers', 'Reviews'] as const;
export type SearchCategory = typeof searchCategories[number];
export type SearchItem = { id: string; title: string; category: Exclude<SearchCategory, 'All'>; href: string; description: string; image: string; keywords: string };
export type SearchRecord = { id: string; [key: string]: unknown };
export const searchSources = ['tractors', 'brands', 'articles', 'videos', 'equipment', 'dealers', 'expertReviews'] as const;
export type SearchSource = typeof searchSources[number];

export function normalizeSearch(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/(\p{L})(\d)/gu, '$1 $2').replace(/(\d)(\p{L})/gu, '$1 $2')
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}
const text = (value: unknown) => typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
const slug = (value: unknown) => text(value).toLowerCase().replaceAll(' ', '-');
const path = (...parts: string[]) => '/' + parts.map(encodeURIComponent).join('/');
const imageUrl = (value: unknown) => /^(https?:\/\/|\/(?!\/))/.test(text(value)) ? text(value) : '';

export function buildSearchItems(source: SearchSource, rows: SearchRecord[]): SearchItem[] {
  return rows.filter(row => row.status === 'published').flatMap(row => {
    let title = text(row.title ?? row.name);
    let category: SearchItem['category'];
    let href = '';
    let description = text(row.excerpt ?? row.description);
    let keywords = '';
    let image = imageUrl(row.image ?? row.coverImage ?? row.thumbnail ?? row.logo);
    const recordSlug = text(row.slug);
    switch (source) {
      case 'tractors': {
        category = 'Tractors';
        const brand = text(row.brandName ?? row.brand);
        const model = text(row.model ?? row.modelName ?? row.title);
        title = text(row.name ?? row.displayName) || [brand, model].filter(Boolean).join(' ');
        const brandSlug = text(row.brandSlug) || slug(brand);
        const modelSlug = recordSlug || slug(model);
        if (brandSlug && modelSlug) href = path('tractor', brandSlug, modelSlug);
        const hp = Number(row.hp ?? row.horsepower);
        description = [brand, hp > 0 ? hp + ' HP' : '', text(row.driveType), text(row.transmission)].filter(Boolean).join(' · ');
        keywords = [brand, model, hp > 0 ? hp + ' hp horsepower' : '', text(row.condition), text(row.fuelType), text(row.description)].join(' ');
        break;
      }
      case 'brands': category = 'Brands'; title = text(row.name ?? row.title); if (recordSlug) href = path('brand', recordSlug); image = imageUrl(row.logo ?? row.image); break;
      case 'articles': category = 'Articles'; if (recordSlug) href = path('articles', recordSlug); keywords = [row.categoryName, row.category, row.articleType, row.body ?? row.content].map(text).join(' '); break;
      case 'videos': category = 'Videos'; if (recordSlug) href = path('videos', recordSlug); keywords = [row.category, row.tractorName].map(text).join(' '); break;
      case 'equipment': category = 'Equipment'; title = text(row.name ?? row.title); if (recordSlug) href = path('equipment', text(row.categorySlug) || slug(row.category ?? 'equipment'), recordSlug); keywords = [row.categoryName, row.category, row.brandName, row.brand].map(text).join(' '); break;
      case 'dealers': category = 'Dealers'; title = text(row.name ?? row.title); if (recordSlug) href = path('dealers', recordSlug); description = [row.brand, row.city, row.district, row.state].map(text).filter(Boolean).join(' · '); keywords = text(row.address); break;
      case 'expertReviews': category = 'Reviews'; if (recordSlug) href = path('reviews', recordSlug); keywords = [row.tractorName, row.verdict, row.body ?? row.content].map(text).join(' '); break;
    }
    if (!title || !href) return [];
    keywords += ' ' + Object.entries(row).filter(([key]) => key.endsWith('Te')).map(([,value]) => text(value)).join(' ');
    return [{ id: source + ':' + row.id, title, category, href, image, description: description.slice(0, 180), keywords }];
  });
}

export function findSearchResults(items: SearchItem[], query: string, category: SearchCategory = 'All') {
  const term = normalizeSearch(query.slice(0, 120));
  if (term.length < 2) return [];
  const tokens = term.split(' ');
  const seen = new Set<string>();
  return items.flatMap(item => {
    if (category !== 'All' && item.category !== category) return [];
    const title = normalizeSearch(item.title);
    const words = normalizeSearch([item.title, item.category, item.description, item.keywords].join(' ')).split(' ');
    if (!tokens.every(token => words.some(word => /^\d+$/.test(token) ? word === token : word.startsWith(token)))) return [];
    const titleWords = title.split(' ');
    const score = (title === term ? 100 : title.startsWith(term) ? 70 : title.includes(term) ? 50 : 0)
      + tokens.reduce((total, token) => total + (titleWords.includes(token) ? 10 : titleWords.some(word => word.startsWith(token)) ? 5 : 0), 0);
    return [{ item, score }];
  }).sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title) || a.item.id.localeCompare(b.item.id))
    .filter(({ item }) => { if (seen.has(item.href)) return false; seen.add(item.href); return true; })
    .map(({ item }) => item);
}
