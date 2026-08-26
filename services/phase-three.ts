import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/client';
import type { Tractor } from '@/types/content';

export interface ExpertReview {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  authorName: string;
  coverImage?: string;
  tractorId?: string;
  tractorName?: string;
  verdict?: string;
  pros?: string[];
  cons?: string[];
  status: 'draft' | 'published';
  publishedAt?: { toDate?: () => Date };
}

export interface OwnerReview {
  id: string;
  tractorId: string;
  tractorName: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: unknown;
}

export interface FavouriteRecord {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'tractor' | 'article' | 'video';
  title: string;
  href: string;
  image?: string;
  createdAt?: unknown;
}

function database() {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.');
  return db;
}

export async function getTractorsByIds(ids: string[]): Promise<Tractor[]> {
  if (!ids.length) return [];
  const snapshot = await getDocs(query(collection(database(), 'tractors'), where(documentId(), 'in', ids.slice(0, 3)), where('status', '==', 'published')));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as Tractor);
}

export async function listExpertReviews(): Promise<ExpertReview[]> {
  const snapshot = await getDocs(query(collection(database(), 'expertReviews'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(24)));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as ExpertReview);
}

export async function getExpertReview(slug: string): Promise<ExpertReview | null> {
  const snapshot = await getDocs(query(collection(database(), 'expertReviews'), where('slug', '==', slug), where('status', '==', 'published'), limit(1)));
  const item = snapshot.docs[0];
  return item ? ({ id: item.id, ...item.data() } as ExpertReview) : null;
}

export async function listApprovedOwnerReviews(tractorId?: string): Promise<OwnerReview[]> {
  const filters = [where('status', '==', 'approved'), orderBy('createdAt', 'desc'), limit(20)];
  if (tractorId) filters.unshift(where('tractorId', '==', tractorId));
  const snapshot = await getDocs(query(collection(database(), 'reviews'), ...filters));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as OwnerReview);
}

export async function submitOwnerReview(input: Omit<OwnerReview, 'id' | 'status' | 'createdAt'>) {
  if (input.rating < 1 || input.rating > 5) throw new Error('Rating must be between 1 and 5.');
  await addDoc(collection(database(), 'reviews'), { ...input, status: 'pending', createdAt: serverTimestamp() });
}

export async function isFavourite(userId: string, itemType: FavouriteRecord['itemType'], itemId: string) {
  return (await getDoc(doc(database(), 'favorites', `${userId}_${itemType}_${itemId}`))).exists();
}

export async function toggleFavourite(record: Omit<FavouriteRecord, 'id' | 'createdAt'>) {
  const reference = doc(database(), 'favorites', `${record.userId}_${record.itemType}_${record.itemId}`);
  const existing = await getDoc(reference);
  if (existing.exists()) { await deleteDoc(reference); return false; }
  await setDoc(reference, { ...record, createdAt: serverTimestamp() });
  return true;
}

export async function listFavourites(userId: string): Promise<FavouriteRecord[]> {
  const snapshot = await getDocs(query(collection(database(), 'favorites'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(50)));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as FavouriteRecord);
}

