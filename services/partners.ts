import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, isLocalDemo } from '@/lib/firebase/client';
import { subscribeLocal } from '@/lib/local-demo';
import { sortHeroSlides } from '@/lib/admin-records';
export type Partner = { id: string; title: string; image?: string; order?: number; status?: string };
export function subscribePartners(callback: (partners: Partner[]) => void) {
  const deliver = (items: Partner[]) => callback(sortHeroSlides(items).filter(item => item.image));
  if (isLocalDemo && !db) return subscribeLocal<Partner>('partners', deliver);
  if (!db) { callback([]); return () => {}; }
  return onSnapshot(query(collection(db, 'partners'), where('status', 'in', ['published', 'approved'])),
    snapshot => deliver(snapshot.docs.map(item => ({ ...item.data(), id: item.id } as Partner))));
}
