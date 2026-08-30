import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, isLocalDemo } from '@/lib/firebase/client';
import { subscribeLocal } from '@/lib/local-demo';
import { normalizeTractor } from './tractors';
import type { Tractor } from '@/types/content';
export function subscribeComparisonCatalog(onData: (items: Tractor[]) => void, onError: (reason: Error) => void) {
  const deliver = (rows: { id: string; [key: string]: unknown }[]) => onData(rows.filter(row => row.status === 'published').map(normalizeTractor).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)));
  if (isLocalDemo && !db) return subscribeLocal('tractors', deliver, onError);
  if (!db) { onError(new Error('The tractor catalog is not configured.')); return () => {}; }
  // No 24-model listing limit or optional sort field: every published model is eligible.
  return onSnapshot(query(collection(db, 'tractors'), where('status', '==', 'published')), snapshot => deliver(snapshot.docs.map(item => ({ ...item.data(), id: item.id }))), onError);
}
