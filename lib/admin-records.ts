import { websiteLink, youtubeVideoId } from './content-links';
import { prepareEditorialReview } from './editorial-review';
import { prepareTractorSpecifications } from './tractor-specifications';
export function slugify(value: unknown) {
  return String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
export function prepareAdminRecord(collection: string, input: Record<string, unknown>) {
  const data: Record<string, unknown> = Object.fromEntries(Object.entries(input).filter(([key, value]) => !['id', 'createdAt', 'updatedAt'].includes(key) && value !== undefined));
  for (const [key, value] of Object.entries(data)) if (typeof value === 'string' && !key.toLowerCase().includes('image')) data[key] = value.trim();
  if (collection !== 'contactMessages' && collection !== 'expertReviews') data.status = collection === 'reviews' ? (['pending','approved','rejected'].includes(String(data.status))?data.status:'approved') : collection === 'newsletterSubscribers' ? data.status || 'active' : (['draft','published','archived','approved'].includes(String(data.status)) ? data.status : 'published');
  if (!['settings', 'homepageSections', 'contactMessages', 'newsletterSubscribers'].includes(collection) && !data.slug && (data.title || data.model || data.name)) data.slug = slugify(data.title || data.model || data.name);
  if (['heroSlides', 'partners'].includes(collection)) {
    if (!String(data.title ?? '').trim()) throw new Error('Please enter a name.');
    if (!Number.isInteger(Number(data.order)) || Number(data.order) < 1) throw new Error('Display order must be a whole number starting at 1.');
    data.order = Number(data.order);
    if (collection === 'heroSlides' && data.backgroundColor && !/^#[0-9a-f]{6}$/i.test(String(data.backgroundColor))) throw new Error('Use a six-digit colour such as #ffffff.');
  }
  if (collection === 'heroSlides') {
    if (data.duration !== '' && data.duration != null && (!Number.isFinite(Number(data.duration)) || Number(data.duration) < 3 || Number(data.duration) > 30)) throw new Error('Slide duration must be between 3 and 30 seconds.');
    for (const [label, url] of [['ctaLabel','ctaUrl'],['secondaryCtaLabel','secondaryCtaUrl']]) {
      if (Boolean(data[label]) !== Boolean(data[url])) throw new Error('Enter both button text and its link, or clear both.');
    }
  }
  if (collection === 'settings' && ['youtube','instagram','facebook'].includes(String(data.key)) && data.value && !/^https?:\/\//i.test(String(data.value))) throw new Error('Social links must start with https:// or http://.');
  if (collection === 'partners' && !String(data.image ?? '').trim()) throw new Error('Please upload a partner logo before saving.');
  if (['brands', 'equipment', 'dealers'].includes(collection)) data.name = data.title ?? data.name;
  if (collection === 'dealers' && typeof data.services === 'string') data.services = data.services.split(/\n+/).map(value => value.trim()).filter(Boolean);
  if (collection === 'tractors') {
    Object.assign(data, prepareTractorSpecifications(data));
    if(data.variant&&!input.slug)data.slug=slugify([data.model,data.variant].filter(Boolean).join(' '));
    data.brandName = data.brand ?? data.brandName;
    data.brandSlug = data.brandSlug || slugify(data.brand ?? data.brandName);
    data.brandId = data.brandId || data.brandSlug;
    data.condition=data.condition||'new';
    data.name = [data.brandName, data.model, data.variant].filter(Boolean).join(' ');
    data.hp = Number(data.horsepower ?? data.hp ?? 0);
    data.minPrice = Number(data.price ?? data.minPrice ?? 0);
    const hasMaximum = data.maxPrice != null && String(data.maxPrice).trim() !== '';
    data.maxPrice = hasMaximum ? Number(data.maxPrice) : '';
    if(!Number.isFinite(Number(data.minPrice))||Number(data.minPrice)<0||(hasMaximum&&(!Number.isFinite(Number(data.maxPrice))||Number(data.maxPrice)<Number(data.minPrice))))throw new Error('Enter valid prices with maximum price at least equal to starting price.');
    data.popularityScore = Number(data.popularityScore ?? 0);
    data.transmission = data.transmission ?? '';
    const name = String(data.name).toLowerCase();
    data.searchTerms = [...new Set([name, ...name.split(/\s+/), String(data.model).toLowerCase(), String(data.brand).toLowerCase()])];
    data.searchPrefixes = Array.from({ length: Math.min(name.length, 30) }, (_, index) => name.slice(0, index + 1));
  }
  if (['articles', 'expertReviews'].includes(collection)) {
    data.coverImage = data.image ?? data.coverImage ?? '';
    data.body = data.content ?? data.body ?? '';
    data.authorName = data.authorName || 'RJ Tractor Techs';
  }
  if (collection === 'expertReviews') Object.assign(data, prepareEditorialReview(data));
  if (['articles', 'equipment'].includes(collection)) {
    data.categoryName = data.category ?? data.categoryName ?? '';
    data.categorySlug = collection === 'equipment' ? slugify(data.categoryName) || 'equipment' : data.categorySlug || slugify(data.categoryName);
  }
  if(collection==='advertisements')data.placement='homepage';
  if(collection==='articles')data.articleType=data.articleType||'article';
  if(collection==='videos' || collection==='tractors'){
    const raw=String(data.youtubeId ?? data.youtubeVideoId ?? '').trim();
    const videoId=youtubeVideoId(raw);
    if ((collection==='videos' || raw) && !videoId) throw new Error('Enter a valid YouTube video URL or 11-character ID.');
    data.youtubeVideoId=videoId; data.youtubeId=videoId;
  }
  if(collection==='reviews'&&(!Number.isInteger(Number(data.rating))||Number(data.rating)<1||Number(data.rating)>5))throw new Error('Review rating must be a whole number from 1 to 5.');
  if(collection==='expertReviews'&&data.score!==''&&data.score!==undefined&&(Number(data.score)<0||Number(data.score)>10))throw new Error('Review score must be between 0 and 10.');
  for(const key of ['ctaUrl','secondaryCtaUrl','destinationUrl']){
    if(data[key]) { const url=websiteLink(data[key]); if(!url) throw new Error('Use a website URL starting with https:// or a local path starting with /.'); data[key]=url; }
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
