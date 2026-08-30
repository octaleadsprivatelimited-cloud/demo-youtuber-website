import { addDoc, collection, deleteDoc, doc, documentId, getCountFromServer, getDoc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp, startAfter, type QueryDocumentSnapshot } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage, isLocalDemo } from '@/lib/firebase/client';
import { localRequest, readLocal, writeLocal } from '@/lib/local-demo';
import { adminSections } from '@/config/admin-sections';
import { prepareAdminRecord } from '@/lib/admin-records';
import { prepareAdminForm, sameAdminRecord } from '@/lib/admin-form';
export type AdminRecord = { id: string; [key: string]: unknown };
function needDb() { if (!db) throw new Error('Firebase is not configured.'); return db; }
const conflictMessage = 'This record changed since you opened it. Your changes have not been saved. Close and reopen Edit to load the latest details.';
export async function listAdminRecords(name: string): Promise<AdminRecord[]> {
  if (isLocalDemo && !db) return readLocal<AdminRecord>(name);
  const items: AdminRecord[] = [];
  let cursor: QueryDocumentSnapshot | undefined;
  do {
    // Paginate by document ID so old records without timestamps are still editable.
    const snapshot = await getDocs(query(collection(needDb(), name), orderBy(documentId()), ...(cursor ? [startAfter(cursor)] : []), limit(200)));
    items.push(...snapshot.docs.map(item => ({ ...item.data(), id: item.id })));
    if (snapshot.docs.length < 200) break;
    cursor = snapshot.docs.at(-1);
  } while (cursor);
  return items;
}
export async function getAdminRecord(name: string, id: string): Promise<AdminRecord | null> {
  if (isLocalDemo && !db) return (await readLocal<AdminRecord>(name)).find(item => item.id === id) ?? null;
  const snapshot = await getDoc(doc(needDb(), name, id));
  return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null;
}
export async function saveAdminRecord(name: string, id: string | undefined, input: Record<string, unknown>, original?: AdminRecord) {
  const section = Object.values(adminSections).find(item => item.collection === name);
  if (section?.readOnly) throw new Error('This module is read-only.');
  if (!id && section?.allowCreate === false) throw new Error('New records are received through the website. Existing records can be edited.');
  const existing = id ? await getAdminRecord(name, id) : null;
  if (id && !existing) throw new Error('This record was removed. Refresh the list before editing.');
  if (original && !sameAdminRecord(existing, original)) throw new Error(conflictMessage);
  const sources: Record<string, AdminRecord[]> = {};
  for (const source of new Set(section?.fields.flatMap(field => field.source ? [field.source] : []) ?? [])) sources[source] = await listAdminRecords(source);
  const base = section ? prepareAdminForm(section, existing, [], sources) : { ...existing };
  const data = { ...base, ...Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) };
  // Editing a title must not silently change a published URL, even with a partial payload.
  if (existing?.slug) data.slug = existing.slug;
  if (section?.fields.some(field => field.key === 'order') && (!id && input.order == null || data.order == null || String(data.order).trim() === '')) {
    data.order = Number(existing?.order) > 0 ? existing!.order : Math.max(0, ...(await listAdminRecords(name)).map(row => Number(row.order) || 0)) + 1;
  }
  for (const field of section?.fields ?? []) {
    const value = data[field.key];
    if (field.required && (value == null || String(value).trim() === '')) throw new Error(field.label + ' is required.');
    if (field.type === 'select' && field.options && value && !field.options.some(option => option.value === String(value)) && (!existing || value !== existing[field.key])) throw new Error('Choose a valid ' + field.label.toLowerCase() + '.');
    if (field.type === 'number' && value != null && value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0)) throw new Error(field.label + ' must be zero or a positive number.');
  }
  const related = { ...data };
  for (const [field, collectionName, label] of [['brandId','brands','brand'],['categoryId','articleCategories','category'],['tractorId','tractors','tractorName']]) {
    const ownsField = section?.fields.some(item => item.key === field && item.source);
    if (!ownsField) continue;
    if (!related[field]) {
      related[label] = '';
      if (field === 'categoryId') { related.categoryName = ''; related.categorySlug = ''; }
    } else {
      const selected = sources[collectionName]?.find(row => row.id === related[field]);
      if (!selected) {
        // Keep legacy references during unrelated edits; only new selections must resolve.
        if (!existing || related[field] !== existing[field]) throw new Error('The selected ' + label + ' no longer exists. Select another record.');
        continue;
      }
      related[label] = String(selected.title ?? selected.name ?? selected.model ?? '');
      if (field === 'brandId') related.brandSlug = selected.slug;
      if (field === 'categoryId') related.categorySlug = selected.slug;
    }
  }
  const clean = prepareAdminRecord(name, related);
  const uniqueField = ['settings','homepageSections'].includes(name) ? 'key' : name === 'seo' ? 'path' : ['tractors','brands','articles','expertReviews','videos','equipment','dealers','articleCategories'].includes(name) ? 'slug' : null;
  if (uniqueField && clean[uniqueField]) {
    const duplicate = (await listAdminRecords(name)).find(row => row.id !== id && row[uniqueField] === clean[uniqueField] && (name !== 'tractors' || row.brandId === clean.brandId));
    if (duplicate) throw new Error('A record with this ' + uniqueField + ' already exists. Edit the existing record instead.');
  }
  if (isLocalDemo && !db) {
    const items = await readLocal<AdminRecord>(name);
    const current = items.find(item => item.id === id);
    if (id && !current) throw new Error('This record was removed. Refresh the list before editing.');
    if (id && !sameAdminRecord(current, existing)) throw new Error(conflictMessage);
    const key = id ?? crypto.randomUUID();
    const now = new Date().toISOString();
    const next = { ...current, ...clean, id: key, createdAt: current?.createdAt ?? now, publishedAt: current?.publishedAt ?? now, updatedAt: now };
    await writeLocal(name, id ? items.map(item => item.id === id ? next : item) : [next, ...items]);
    return key;
  }
  const payload = { ...clean, publishedAt: clean.publishedAt ?? serverTimestamp(), updatedAt: serverTimestamp() };
  if (id) {
    const target = doc(needDb(), name, id);
    await runTransaction(needDb(), async transaction => {
      const current = await transaction.get(target);
      if (!current.exists()) throw new Error('This record was removed. Refresh the list before editing.');
      if (!sameAdminRecord({ ...current.data(), id: current.id }, existing)) throw new Error(conflictMessage);
      transaction.update(target, payload);
    });
    return id;
  }
  return (await addDoc(collection(needDb(), name), { ...payload, createdAt: serverTimestamp() })).id;
}
export async function removeAdminRecord(name: string, id: string) {
  const relation=name==='brands'?['tractors','brandId']:name==='articleCategories'?['articles','categoryId']:null;
  if(relation&&(await listAdminRecords(relation[0])).some(row=>row[relation[1]]===id))throw new Error('This record is still in use. Reassign its related content before deleting it.');

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

