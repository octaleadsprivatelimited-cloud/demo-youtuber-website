import type { AdminField, AdminSection } from '../config/admin-sections';

type Row = { id: string; [key: string]: unknown };
const aliases: Record<string, string[]> = {
  title: ['name'], model: ['modelName'], horsepower: ['hp'], price: ['minPrice', 'priceMin'],
  maxPrice: ['priceMax'], image: ['coverImage', 'thumbnail'], content: ['body'],
  youtubeId: ['youtubeVideoId'], category: ['categoryName'],
};

// Keep explicit blanks: an empty field is a deliberate removal, not a request for a fallback.
export function prepareAdminForm(section: AdminSection, item?: Row | null, items: Row[] = [], sources: Record<string, Row[]> = {}) {
  const next: Record<string, unknown> = { ...item };
  for (const field of section.fields) {
    if (next[field.key] == null) {
      for (const alias of aliases[field.key] ?? []) {
        if (item?.[alias] != null) { next[field.key] = item[alias]; break; }
      }
    }
    if (field.source && next[field.key] == null) {
      const legacy = field.key === 'brandId' ? item?.brand ?? item?.brandName : field.key === 'categoryId' ? item?.category ?? item?.categoryName : item?.tractorName;
      const match = legacy ? sources[field.source]?.find(row => String(row.title ?? row.name ?? row.model) === String(legacy)) : undefined;
      if (match) next[field.key] = match.id;
    }
    if (field.key === 'order' && !item) next.order = Math.max(0, ...items.map(row => Number(row.order) || 0)) + 1;
    if (next[field.key] == null) next[field.key] = field.type === 'boolean' ? field.key === 'visible' : '';
  }
  if (!item) {
    if (section.collection === 'homepageSections') next.visible = true;
  }
  if (section.collection === 'heroSlides' && !next.backgroundColor) next.backgroundColor = '#ffffff';
  if (section.collection === 'articles' && !next.articleType) next.articleType = 'article';
  if (section.collection === 'tractors') {
    if (next.horsepower === 0) next.horsepower = '';
    if (!next.condition) next.condition = 'new';
  }
  return next;
}

// Submit changed fields only; never send a stale copy of hidden metadata or relationships.
export function adminFormChanges(section: AdminSection, initial: Record<string, unknown>, form: Record<string, unknown>) {
  return Object.fromEntries(section.fields.filter(field => JSON.stringify(initial[field.key]) !== JSON.stringify(form[field.key]))
    .map(field => [field.key, form[field.key]]));
}

export function adminSelectOptions(field: AdminField, value: unknown, sources: Record<string, Row[]>) {
  const options = field.source ? (sources[field.source] ?? []).map(row => ({ value: row.id, label: String(row.title ?? row.name ?? row.model ?? row.id) })) : [...field.options ?? []];
  if (value && !options.some(option => option.value === String(value))) options.unshift({ value: String(value), label: 'Saved selection (unavailable): ' + String(value) });
  return options;
}

export function sameAdminRecord(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const left = Object.entries(a).filter(([, value]) => value !== undefined);
  const right = Object.entries(b).filter(([, value]) => value !== undefined);
  return left.length === right.length && left.every(([key, value]) => Object.hasOwn(b, key) && sameAdminRecord(value, (b as Record<string, unknown>)[key]));
}
