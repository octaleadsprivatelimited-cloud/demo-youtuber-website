import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, isLocalDemo } from '@/lib/firebase/client';
import { subscribeLocal } from '@/lib/local-demo';
import { sortHeroSlides } from '@/lib/admin-records';
export type HeroSlide = { id: string; title?: string; image?: string; order?: number; backgroundColor?: string; status?: string; updatedAt?: unknown };
export function subscribeHeroSlides(callback: (slides: HeroSlide[]) => void, onError?: (error: Error) => void) {
  if (!db) { 
    callback([
      { id: '1', title: 'Find the right tractor', image: '/hero/tractor-hero-cinematic.png', order: 1, backgroundColor: '#000000', status: 'published' }
    ]); 
    return () => {}; 
  }
  return onSnapshot(query(collection(db, 'heroSlides'), where('status', 'in', ['published', 'approved'])),
    snapshot => callback(sortHeroSlides(snapshot.docs.map(item => ({ ...item.data(), id: item.id } as HeroSlide)))), onError);
}
