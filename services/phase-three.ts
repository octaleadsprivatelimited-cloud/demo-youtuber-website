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
import { db, isFirebaseConfigured,isLocalDemo } from '@/lib/firebase/client';
import {published,readLocal,writeLocal} from '@/lib/local-demo';
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
  if(isLocalDemo&&!db)return published<Tractor>('tractors').filter(item=>ids.includes(item.id));
  const snapshot = await getDocs(query(collection(database(), 'tractors'), where(documentId(), 'in', ids.slice(0, 3)), where('status', '==', 'published')));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as Tractor);
}

export async function listExpertReviews(): Promise<ExpertReview[]> {
  if(isLocalDemo&&!db)return published<ExpertReview>('expertReviews');
  const snapshot = await getDocs(query(collection(database(), 'expertReviews'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(24)));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as ExpertReview);
}

export async function getExpertReview(slug: string): Promise<ExpertReview | null> {
  if(isLocalDemo&&!db)return published<ExpertReview>('expertReviews').find(item=>item.slug===slug)??null;
  const snapshot = await getDocs(query(collection(database(), 'expertReviews'), where('slug', '==', slug), where('status', '==', 'published'), limit(1)));
  const item = snapshot.docs[0];
  return item ? ({ id: item.id, ...item.data() } as ExpertReview) : null;
}

export async function listApprovedOwnerReviews(tractorId?: string): Promise<OwnerReview[]> {
  if(isLocalDemo&&!db)return published<OwnerReview>('reviews').filter(item=>!tractorId||item.tractorId===tractorId);
  const filters = [where('status', '==', 'approved'), orderBy('createdAt', 'desc'), limit(20)];
  if (tractorId) filters.unshift(where('tractorId', '==', tractorId));
  const snapshot = await getDocs(query(collection(database(), 'reviews'), ...filters));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as OwnerReview);
}

export async function submitOwnerReview(input: Omit<OwnerReview, 'id' | 'status' | 'createdAt'>) {
  if (input.rating < 1 || input.rating > 5) throw new Error('Rating must be between 1 and 5.');
  if(isLocalDemo&&!db){writeLocal('reviews',[{...input,id:`demo-${Date.now()}`,status:'pending'},...readLocal<OwnerReview>('reviews')]);return;}
  await addDoc(collection(database(), 'reviews'), { ...input, status: 'pending', createdAt: serverTimestamp() });
}

export async function isFavourite(userId: string, itemType: FavouriteRecord['itemType'], itemId: string) {
  if(isLocalDemo&&!db)return readLocal<FavouriteRecord>('favorites').some(item=>item.userId===userId&&item.itemType===itemType&&item.itemId===itemId);
  return (await getDoc(doc(database(), 'favorites', `${userId}_${itemType}_${itemId}`))).exists();
}

export async function toggleFavourite(record: Omit<FavouriteRecord, 'id' | 'createdAt'>) {
  if(isLocalDemo&&!db){const items=readLocal<FavouriteRecord>('favorites');const found=items.find(item=>item.userId===record.userId&&item.itemType===record.itemType&&item.itemId===record.itemId);writeLocal('favorites',found?items.filter(item=>item.id!==found.id):[{...record,id:`demo-${Date.now()}`},...items]);return !found;}
  const reference = doc(database(), 'favorites', `${record.userId}_${record.itemType}_${record.itemId}`);
  const existing = await getDoc(reference);
  if (existing.exists()) { await deleteDoc(reference); return false; }
  await setDoc(reference, { ...record, createdAt: serverTimestamp() });
  return true;
}

export async function listFavourites(userId: string): Promise<FavouriteRecord[]> {
  if(isLocalDemo&&!db)return readLocal<FavouriteRecord>('favorites').filter(item=>item.userId===userId);
  const snapshot = await getDocs(query(collection(database(), 'favorites'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(50)));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as FavouriteRecord);
}
