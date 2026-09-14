import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, isLocalDemo } from '@/lib/firebase/client';
import { subscribeLocal } from '@/lib/local-demo';
import { sortHeroSlides } from '@/lib/admin-records';
export type Partner = { id: string; title: string; image?: string; order?: number; status?: string };
export function subscribePartners(callback: (partners: Partner[]) => void) {
  const deliver = (items: Partner[]) => callback(sortHeroSlides(items).filter(item => item.image));
  if (isLocalDemo && !db) return subscribeLocal<Partner & {logo?:string;name?:string}>('brands', items => deliver(items.map(item => ({...item, title:item.title || item.name || '',image:item.logo}))));
  if (!db) { callback([]); return () => {}; }
  return onSnapshot(query(collection(db, 'brands'), where('status', '==', 'published')),
    snapshot => deliver(snapshot.docs.map(item => {const data=item.data();return {...data,id:item.id,title:String(data.title ?? data.name ?? ''),image:String(data.logo ?? '')} as Partner;})));
}
