export function slugify(value: unknown) {
  return String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
export function prepareAdminRecord(collection: string, input: Record<string, unknown>) {
  const data: Record<string, unknown> = Object.fromEntries(Object.entries(input).filter(([key, value]) => !['id', 'createdAt', 'updatedAt'].includes(key) && value !== undefined));
  for (const [key, value] of Object.entries(data)) if (typeof value === 'string' && !key.toLowerCase().includes('image')) data[key] = value.trim();
  data.status = collection === 'reviews' ? 'approved' : collection === 'newsletterSubscribers' ? 'active' : 'published';
  if (!data.slug && (data.title || data.model || data.name)) data.slug = slugify(data.title || data.model || data.name);
  if (['heroSlides', 'partners'].includes(collection)) {
    if (!String(data.title ?? '').trim()) throw new Error('Please enter a name.');
    if (!Number.isInteger(Number(data.order)) || Number(data.order) < 1) throw new Error('Display order must be a whole number starting at 1.');
    data.order = Number(data.order);
    if (collection === 'heroSlides' && data.backgroundColor && !/^#[0-9a-f]{6}$/i.test(String(data.backgroundColor))) throw new Error('Use a six-digit colour such as #ffffff.');
  }
  if (['brands', 'equipment', 'dealers'].includes(collection)) data.name = data.title ?? data.name;
  if (collection === 'tractors') {
    data.brandName = data.brand;
    data.brandSlug = slugify(data.brand);
    data.brandId = data.brandId || data.brandSlug;
    data.name = [data.brand, data.model].filter(Boolean).join(' ');
    data.hp = Number(data.horsepower ?? data.hp ?? 0);
    data.minPrice = Number(data.price ?? data.minPrice ?? 0);
    data.maxPrice = Number(data.price ?? data.maxPrice ?? data.minPrice ?? 0);
    data.popularityScore = Number(data.popularityScore ?? 0);
    data.transmission = data.transmission || 'Not specified';
    const name = String(data.name).toLowerCase();
    data.searchTerms = [...new Set([name, ...name.split(/\s+/), String(data.model).toLowerCase(), String(data.brand).toLowerCase()])];
    data.searchPrefixes = Array.from({ length: Math.min(name.length, 30) }, (_, index) => name.slice(0, index + 1));
  }
  if (['articles', 'expertReviews'].includes(collection)) {
    data.coverImage = data.image ?? data.coverImage ?? '';
    data.body = data.content ?? data.body ?? '';
    data.authorName = data.authorName || 'RJ Tractor Techs';
  }
  if (['articles', 'equipment'].includes(collection)) {
    data.categoryName = data.category ?? data.categoryName ?? '';
    data.categorySlug = slugify(data.categoryName);
  }
  if (collection === 'videos') data.youtubeVideoId = data.youtubeId ?? data.youtubeVideoId;
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

export function sortHeroSlides<T extends { id: string; order?: number; status?: string }>(items: T[]) {
  return items.filter(item => ['published', 'approved'].includes(item.status ?? ''))
    .sort((a, b) => (Number(a.order) || 1) - (Number(b.order) || 1) || a.id.localeCompare(b.id));
}

// Keep data URLs and signed URLs intact. New uploads already have unique paths.
export function heroImageSource(image: unknown) {
  if (typeof image !== 'string') return '';
  const value = image.trim();
  return /^(\/(?!\/)|https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,)/i.test(value) ? value : '';
}
