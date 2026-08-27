import { collection, documentId, getDocs, limit, orderBy, query, type QueryConstraint, startAfter, where, type DocumentSnapshot } from 'firebase/firestore';
import { db, isLocalDemo } from '@/lib/firebase/client';
import { published } from '@/lib/local-demo';
import type { Brand, Tractor, TractorFilters } from '@/types/content';
export interface TractorPage {
    items: Tractor[];
    cursor: DocumentSnapshot | number | null;
    hasMore: boolean;
}
export function normalizeTractor(raw: Record<string, unknown>): Tractor { const brand = String(raw.brandName ?? raw.brand ?? 'Unbranded'); const model = String(raw.model ?? raw.modelName ?? raw.title ?? 'Untitled'); return { ...raw, id: String(raw.id), name: String(raw.name ?? raw.displayName ?? `${brand} ${model}`), brandName: brand, brandId: String(raw.brandId ?? brand.toLowerCase().replaceAll(' ', '-')), brandSlug: String(raw.brandSlug ?? brand.toLowerCase().replaceAll(' ', '-')), model, slug: String(raw.slug ?? model.toLowerCase().replaceAll(' ', '-')), hp: Number(raw.hp ?? raw.horsepower ?? 0), minPrice: Number(raw.minPrice ?? raw.priceMin ?? raw.price ?? 0), maxPrice: Number(raw.maxPrice ?? raw.priceMax ?? raw.price ?? 0), transmission: String(raw.transmission ?? 'Not specified'), image: String(raw.image ?? raw.thumbnail ?? ''), condition: raw.condition==='used'?'used':'new', status: 'published' } as Tractor; }
async function locals() { return (await published<Record<string, unknown> & {
    id: string;
}>('tractors')).map(normalizeTractor); }
export async function listTractors(filters: TractorFilters = {}, cursor?: DocumentSnapshot | number | null): Promise<TractorPage> { const pageSize = Math.min(filters.pageSize ?? 12, 24); if (isLocalDemo && !db) {
    let items = (await locals());
    if(filters.condition)items=items.filter(x=>x.condition===filters.condition);
    const q = filters.search?.toLowerCase();
    if (q)
        items = items.filter(x => `${x.name} ${x.brandName} ${x.model}`.toLowerCase().includes(q));
    if (filters.brandId)
        items = items.filter(x => x.brandId === filters.brandId || x.brandSlug === filters.brandId);
    if (filters.driveType)
        items = items.filter(x => x.driveType === filters.driveType);
    if (filters.transmission)
        items = items.filter(x => x.transmission === filters.transmission);
    if (filters.minHp !== undefined)
        items = items.filter(x => x.hp >= filters.minHp!);
    if (filters.maxHp !== undefined)
        items = items.filter(x => x.hp <= filters.maxHp!);
    if (filters.maxPrice !== undefined)
        items = items.filter(x => x.minPrice <= filters.maxPrice!);
    const offset=typeof cursor==='number'?cursor:0;
    return { items: items.slice(offset, offset+pageSize), cursor: offset+pageSize, hasMore: items.length > offset+pageSize };
} if (!db)
    throw new Error('Firebase is not configured.'); const constraints: QueryConstraint[] = [where('status', '==', 'published')]; if (filters.search)
    constraints.push(where('searchTerms', 'array-contains', filters.search.trim().toLowerCase())); if (filters.brandId)
    constraints.push(where('brandId', '==', filters.brandId)); if(filters.condition)constraints.push(where('condition','==',filters.condition)); if (filters.driveType)
    constraints.push(where('driveType', '==', filters.driveType)); if (filters.transmission)
    constraints.push(where('transmission', '==', filters.transmission)); if (filters.minHp !== undefined)
    constraints.push(where('hp', '>=', filters.minHp)); if (filters.maxHp !== undefined)
    constraints.push(where('hp', '<=', filters.maxHp)); if (filters.maxPrice !== undefined)
    constraints.push(where('minPrice', '<=', filters.maxPrice)); if (filters.minHp !== undefined || filters.maxHp !== undefined)
    constraints.push(orderBy('hp'));
else if (filters.maxPrice !== undefined)
    constraints.push(orderBy('minPrice')); constraints.push(orderBy('popularityScore', 'desc'), orderBy(documentId()), limit(pageSize + 1)); if (cursor && typeof cursor!=='number')
    constraints.splice(constraints.length - 1, 0, startAfter(cursor)); const snapshot = await getDocs(query(collection(db, 'tractors'), ...constraints)); const docs = snapshot.docs.slice(0, pageSize); return { items: docs.map(d => normalizeTractor({ id: d.id, ...d.data() })), cursor: docs.at(-1) ?? null, hasMore: snapshot.docs.length > pageSize }; }
export async function searchTractorSuggestions(prefix: string) { if (isLocalDemo && !db)
    return (await locals()).filter(x => x.name.toLowerCase().includes(prefix.toLowerCase())).slice(0, 6); if (!db)
    return []; const snap = await getDocs(query(collection(db, 'tractors'), where('status', '==', 'published'), where('searchPrefixes', 'array-contains', prefix.trim().toLowerCase().slice(0, 30)), orderBy('popularityScore', 'desc'), limit(6))); return snap.docs.map(d => normalizeTractor({ id: d.id, ...d.data() })); }
export async function getTractorBySlugs(brandSlug: string, modelSlug: string) { if (isLocalDemo && !db)
    return (await locals()).find(x => x.brandSlug === brandSlug && x.slug === modelSlug) ?? null; if (!db)
    return null; const snap = await getDocs(query(collection(db, 'tractors'), where('brandSlug', '==', brandSlug), where('slug', '==', modelSlug), where('status', '==', 'published'), limit(1))); const d = snap.docs[0]; return d ? normalizeTractor({ id: d.id, ...d.data() }) : null; }
export async function listBrands(): Promise<Brand[]> { if (isLocalDemo && !db)
    return (await published<Record<string, unknown> & {
        id: string;
    }>('brands')).map(x => ({ ...x, id: x.id, name: String(x.name ?? x.title), slug: String(x.slug), status: 'published' } as Brand)); if (!db)
    return []; const snap = await getDocs(query(collection(db, 'brands'), where('status', '==', 'published'), orderBy('name'), limit(50))); return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Brand); }
