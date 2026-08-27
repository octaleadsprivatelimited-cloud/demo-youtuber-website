export function slugify(value: unknown) {
  return String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
export function prepareAdminRecord(collection: string, input: Record<string, unknown>) {
  const data: Record<string, unknown> = Object.fromEntries(Object.entries(input).filter(([key, value]) => !['id', 'createdAt', 'updatedAt'].includes(key) && value !== undefined));
  for (const [key, value] of Object.entries(data)) if (typeof value === 'string' && !key.toLowerCase().includes('image')) data[key] = value.trim();
  data.status = collection === 'reviews' ? (['pending','approved','rejected'].includes(String(data.status))?data.status:'approved') : collection === 'newsletterSubscribers' ? 'active' : 'published';
  if (!data.slug && (data.title || data.model || data.name)) data.slug = slugify(data.title || data.model || data.name);
  if (['heroSlides', 'partners'].includes(collection)) {
    if (!String(data.title ?? '').trim()) throw new Error('Please enter a name.');
    if (!Number.isInteger(Number(data.order)) || Number(data.order) < 1) throw new Error('Display order must be a whole number starting at 1.');
    data.order = Number(data.order);
    if (collection === 'heroSlides' && data.backgroundColor && !/^#[0-9a-f]{6}$/i.test(String(data.backgroundColor))) throw new Error('Use a six-digit colour such as #ffffff.');
  }
  if (['brands', 'equipment', 'dealers'].includes(collection)) data.name = data.title ?? data.name;
  if (collection === 'tractors') {
    data.brandName = data.brand ?? data.brandName;
    data.brandSlug = data.brandSlug || slugify(data.brand);
    data.brandId = data.brandId || data.brandSlug;
    data.condition=data.condition||'new';
    data.name = [data.brandName, data.model].filter(Boolean).join(' ');
    data.hp = Number(data.horsepower ?? data.hp ?? 0);
    data.minPrice = Number(data.price ?? data.minPrice ?? 0);
    data.maxPrice = Math.max(Number(data.maxPrice ?? data.price ?? 0),Number(data.minPrice));
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
    data.categorySlug = data.categorySlug || slugify(data.categoryName);
  }
  if(collection==='advertisements')data.placement='homepage';
  if(collection==='articles')data.articleType=data.articleType||'article';
  if(collection==='videos'){
    const raw=String(data.youtubeId??data.youtubeVideoId??'').trim();
    let videoId=raw;
    if(/^https?:/i.test(raw)){try{const url=new URL(raw);if(!['youtube.com','www.youtube.com','m.youtube.com','youtu.be'].includes(url.hostname))throw new Error('Invalid host');videoId=url.hostname==='youtu.be'?url.pathname.slice(1):url.searchParams.get('v')||url.pathname.split('/').filter(Boolean).at(-1)||'';}catch{videoId='';}}
    if(!/^[a-zA-Z0-9_-]{11}$/.test(videoId))throw new Error('Enter a valid YouTube video URL or 11-character ID.');
    data.youtubeVideoId=videoId;data.youtubeId=videoId;
  }
  if(collection==='reviews'&&(!Number.isInteger(Number(data.rating))||Number(data.rating)<1||Number(data.rating)>5))throw new Error('Review rating must be a whole number from 1 to 5.');
  if(collection==='expertReviews'&&data.score!==''&&data.score!==undefined&&(Number(data.score)<0||Number(data.score)>10))throw new Error('Review score must be between 0 and 10.');
  for(const key of ['ctaUrl','destinationUrl']){
    if(data[key]&&!/^(https?:\/\/|\/(?!\/))/i.test(String(data[key])))throw new Error('Use a website URL starting with https:// or a local path starting with /.');
  }
  if(collection==='seo'&&!/^\/(?!\/)[^?#]*$/.test(String(data.path??'')))throw new Error('Enter a page path such as /tractors.');
  if(collection==='homepageSections'&&(!Number.isInteger(Number(data.order))||Number(data.order)<1))throw new Error('Section order must start at 1.');

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
