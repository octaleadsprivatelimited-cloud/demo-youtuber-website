import { addDoc, collection, deleteDoc, doc, getCountFromServer, getDocs, limit, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage, isLocalDemo } from '@/lib/firebase/client';
import { localRequest, readLocal, writeLocal } from '@/lib/local-demo';
import { prepareAdminRecord } from '@/lib/admin-records';
export type AdminRecord = { id: string; [key: string]: unknown };
function needDb() { if (!db) throw new Error('Firebase is not configured.'); return db; }
export async function listAdminRecords(name: string): Promise<AdminRecord[]> {
  if (isLocalDemo && !db) return readLocal<AdminRecord>(name);
  // Do not exclude older records that have no updatedAt field.
  const snapshot = await getDocs(query(collection(needDb(), name), limit(100)));
  return snapshot.docs.map(item => ({ ...item.data(), id: item.id }));
}
export async function saveAdminRecord(name: string, id: string | undefined, data: Record<string, unknown>) {
  const clean = prepareAdminRecord(name, data);
  if (isLocalDemo && !db) {
    const items = await readLocal<AdminRecord>(name);
    const existing = items.find(item => item.id === id);
    if (id && !existing) throw new Error('This record was removed. Refresh the list before editing.');
    const key = id ?? crypto.randomUUID();
    const next = { ...existing, ...clean, id: key, updatedAt: new Date().toISOString() };
    await writeLocal(name, id ? items.map(item => item.id === id ? next : item) : [next, ...items]);
    return key;
  }
  const payload = { ...clean, updatedAt: serverTimestamp() };
  if (id) { await updateDoc(doc(needDb(), name, id), payload); return id; }
  return (await addDoc(collection(needDb(), name), { ...payload, createdAt: serverTimestamp() })).id;
}
export async function removeAdminRecord(name: string, id: string) {
  if (isLocalDemo && !db) {
    const items = await readLocal<AdminRecord>(name);
    await writeLocal(name, items.filter(item => item.id !== id));
    return;
  }
  await deleteDoc(doc(needDb(), name, id));
}
export async function uploadAdminImage(file: File, folder: string) {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) throw new Error('Use a JPG, PNG, WebP, or GIF image.');
  if (!file.size || file.size > 8 * 1024 * 1024) throw new Error('Choose an image smaller than 8 MB.');
  if (isLocalDemo && !storage) {
    const form = new FormData(); form.set('file', file);
    const result = await localRequest('/api/local-media', { method: 'POST', body: form });
    return String(result.url);
  }
  if (!storage) throw new Error('Firebase Storage is not configured.');
  const clean = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const target = ref(storage, 'admin/' + folder + '/' + crypto.randomUUID() + '-' + clean);
  await uploadBytes(target, file, { contentType: file.type });
  return getDownloadURL(target);
}
export async function getAdminCounts(names: string[]) {
  if (isLocalDemo && !db) return Object.fromEntries(await Promise.all(names.map(async name => [name, (await readLocal(name)).length])));
  return Object.fromEntries(await Promise.all(names.map(async name => [name, (await getCountFromServer(collection(needDb(), name))).data().count])));
}
