import { collection, getDocs, limit, onSnapshot, query, where } from 'firebase/firestore';
import { db, isLocalDemo } from '@/lib/firebase/client';
import { readLocal, subscribeLocal } from '@/lib/local-demo';
export type SiteRecord = { id: string; status?: unknown; [key: string]: unknown };
export function publicStatuses(name: string) { return name === 'reviews' ? ['approved'] : ['heroSlides','partners'].includes(name) ? ['published','approved'] : ['published']; }
function visible(name: string, rows: SiteRecord[], max: number) {
  return rows.filter(row => publicStatuses(name).includes(String(row.status))).slice(0, max);
}
function publicQuery(name: string, max: number) {
  if (!db) throw new Error('Firebase is not configured.');
  const statuses = publicStatuses(name);
  return query(collection(db, name), where('status', statuses.length === 1 ? '==' : 'in', statuses.length === 1 ? statuses[0] : statuses), limit(max));
}
import { demoArticles, demoEquipment, demoDealers, demoReviews } from '@/data/demo-content';

export async function listPublicRecords(name: string, max = 100): Promise<SiteRecord[]> {
  if (isLocalDemo && !db) return visible(name, await readLocal<SiteRecord>(name), max);
  if (!db) {
    if (name === 'articles') return demoArticles as unknown as SiteRecord[];
    if (name === 'equipment') return demoEquipment as unknown as SiteRecord[];
    if (name === 'dealers') return demoDealers as unknown as SiteRecord[];
    if (name === 'reviews') return demoReviews as unknown as SiteRecord[];
    return [];
  }
  const snapshot = await getDocs(publicQuery(name, max));
  return snapshot.docs.map(row => ({ ...row.data(), id: row.id }));
}
export function subscribePublicRecords(name: string, callback: (items: SiteRecord[]) => void, onError?: (error: Error) => void, max = 100) {
  if (isLocalDemo && !db) return subscribeLocal<SiteRecord>(name, rows => callback(visible(name, rows, max)), onError);
  if (!db) { 
    if (name === 'articles') callback(demoArticles as unknown as SiteRecord[]);
    else if (name === 'equipment') callback(demoEquipment as unknown as SiteRecord[]);
    else if (name === 'dealers') callback(demoDealers as unknown as SiteRecord[]);
    else if (name === 'reviews') callback(demoReviews as unknown as SiteRecord[]);
    else callback([]); 
    return () => {}; 
  }
  return onSnapshot(publicQuery(name, max), snapshot => callback(snapshot.docs.map(row => ({ ...row.data(), id: row.id }))), onError);
}
