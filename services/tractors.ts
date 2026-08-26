import {
  collection,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  startAfter,
  where,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/client';
import type { Brand, Tractor, TractorFilters } from '@/types/content';

export interface TractorPage {
  items: Tractor[];
  cursor: DocumentSnapshot | null;
  hasMore: boolean;
}

function requireDatabase() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. Add the project variables to connect live tractor data.');
  }
  return db;
}

export async function listTractors(filters: TractorFilters = {}, cursor?: DocumentSnapshot | null): Promise<TractorPage> {
  const database = requireDatabase();
  const pageSize = Math.min(filters.pageSize ?? 12, 24);
  const constraints: QueryConstraint[] = [where('status', '==', 'published')];

  if (filters.search) constraints.push(where('searchTerms', 'array-contains', filters.search.trim().toLowerCase()));
  if (filters.brandId) constraints.push(where('brandId', '==', filters.brandId));
  if (filters.driveType) constraints.push(where('driveType', '==', filters.driveType));
  if (filters.transmission) constraints.push(where('transmission', '==', filters.transmission));
  if (filters.minHp !== undefined) constraints.push(where('hp', '>=', filters.minHp));
  if (filters.maxHp !== undefined) constraints.push(where('hp', '<=', filters.maxHp));
  if (filters.maxPrice !== undefined) constraints.push(where('minPrice', '<=', filters.maxPrice));

  if (filters.minHp !== undefined || filters.maxHp !== undefined) constraints.push(orderBy('hp'));
  else if (filters.maxPrice !== undefined) constraints.push(orderBy('minPrice'));
  constraints.push(orderBy('popularityScore', 'desc'), orderBy(documentId()), limit(pageSize + 1));
  if (cursor) constraints.splice(constraints.length - 1, 0, startAfter(cursor));

  const snapshot = await getDocs(query(collection(database, 'tractors'), ...constraints));
  const documents = snapshot.docs.slice(0, pageSize);
  return {
    items: documents.map((item) => ({ id: item.id, ...item.data() }) as Tractor),
    cursor: documents.at(-1) ?? null,
    hasMore: snapshot.docs.length > pageSize,
  };
}

export async function searchTractorSuggestions(prefix: string): Promise<Tractor[]> {
  const database = requireDatabase();
  const normalized = prefix.trim().toLowerCase();
  if (normalized.length < 2) return [];
  const snapshot = await getDocs(query(
    collection(database, 'tractors'),
    where('status', '==', 'published'),
    where('searchPrefixes', 'array-contains', normalized.slice(0, 30)),
    orderBy('popularityScore', 'desc'),
    limit(6),
  ));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Tractor);
}

export async function getTractorBySlugs(brandSlug: string, modelSlug: string): Promise<Tractor | null> {
  const database = requireDatabase();
  const snapshot = await getDocs(query(
    collection(database, 'tractors'),
    where('brandSlug', '==', brandSlug),
    where('slug', '==', modelSlug),
    where('status', '==', 'published'),
    limit(1),
  ));
  const item = snapshot.docs[0];
  return item ? ({ id: item.id, ...item.data() } as Tractor) : null;
}

export async function listBrands(): Promise<Brand[]> {
  const database = requireDatabase();
  const snapshot = await getDocs(query(collection(database, 'brands'), where('status', '==', 'published'), orderBy('name'), limit(50)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Brand);
}
