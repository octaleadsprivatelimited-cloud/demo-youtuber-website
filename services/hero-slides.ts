import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, isLocalDemo } from '@/lib/firebase/client';
import { subscribeLocal } from '@/lib/local-demo';
import { sortHeroSlides } from '@/lib/admin-records';
export type HeroSlide = { id: string; title?: string; image?: string; order?: number; backgroundColor?: string; status?: string; updatedAt?: unknown };
export function subscribeHeroSlides(callback: (slides: HeroSlide[]) => void, onError?: (error: Error) => void) {
  if (isLocalDemo && !db) return subscribeLocal<HeroSlide>('heroSlides', items => callback(sortHeroSlides(items)), onError);
  if (!db) { callback([]); return () => {}; }
  return onSnapshot(query(collection(db, 'heroSlides'), where('status', 'in', ['published', 'approved'])),
    snapshot => callback(sortHeroSlides(snapshot.docs.map(item => ({ ...item.data(), id: item.id } as HeroSlide)))), onError);
}
