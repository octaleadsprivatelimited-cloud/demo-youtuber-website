import { collection, documentId, getDocs, limit, orderBy, query, startAfter, where, type DocumentSnapshot, type QueryConstraint } from 'firebase/firestore';
import { db, isLocalDemo } from '@/lib/firebase/client';
import { readLocal } from '@/lib/local-demo';
import { buildSearchItems, searchSources, type SearchItem, type SearchRecord, type SearchSource } from '@/utils/site-search';

async function publishedRecords(source: SearchSource): Promise<SearchRecord[]> {
  if (isLocalDemo && !db) return (await readLocal<SearchRecord>(source)).filter(row => row.status === 'published');
  if (!db) throw new Error('Search is not configured.');
  const records: SearchRecord[] = [];
  let cursor: DocumentSnapshot | undefined;
  // Paginate by document ID so older records without popularity/date fields are searchable too.
  for (;;) {
    const constraints: QueryConstraint[] = [where('status', '==', 'published'), orderBy(documentId()), limit(200)];
    if (cursor) constraints.push(startAfter(cursor));
    const snapshot = await getDocs(query(collection(db, source), ...constraints));
    records.push(...snapshot.docs.map(row => ({ ...row.data(), id: row.id })));
    if (snapshot.docs.length < 200) return records;
    cursor = snapshot.docs.at(-1);
  }
}

export async function loadSearchIndex(): Promise<{ items: SearchItem[]; unavailable: string[] }> {
  const results = await Promise.allSettled(searchSources.map(async source => buildSearchItems(source, await publishedRecords(source))));
  const items: SearchItem[] = [];
  const unavailable: string[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') items.push(...result.value);
    else unavailable.push(searchSources[index] === 'expertReviews' ? 'reviews' : searchSources[index]);
  });
  return { items, unavailable };
}
