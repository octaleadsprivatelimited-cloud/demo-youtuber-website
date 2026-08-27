import { addDoc, collection, deleteDoc, doc, getCountFromServer, getDocs, limit, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage, isLocalDemo } from '@/lib/firebase/client';
import { localRequest, readLocal, writeLocal } from '@/lib/local-demo';
import { adminSections } from '@/config/admin-sections';
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
  const section=Object.values(adminSections).find(item=>item.collection===name);
  for(const field of section?.fields??[]){
    if(field.required&&(data[field.key]===undefined||String(data[field.key]).trim()===''))throw new Error(field.label+' is required.');
    if(field.type==='select'&&field.options&&data[field.key]&&!field.options.some(option=>option.value===String(data[field.key])))throw new Error('Choose a valid '+field.label.toLowerCase()+'.');
    if(field.type==='number'&&data[field.key]!==undefined&&data[field.key]!==''&&(!Number.isFinite(Number(data[field.key]))||Number(data[field.key])<0))throw new Error(field.label+' must be a positive number.');
  }
  const related={...data};
  for(const [field,collection,label] of [['brandId','brands','brand'],['categoryId','articleCategories','category'],['tractorId','tractors','tractorName']]){
    const ownsField=section?.fields.some(item=>item.key===field&&item.source);
    if(ownsField&&field in related&&!related[field]){
      related[label]='';if(field==='categoryId'){related.categoryName='';related.categorySlug='';}
    }
    if(related[field]&&ownsField){
      const selected=(await listAdminRecords(collection)).find(row=>row.id===related[field]);
      if(!selected)throw new Error('The selected '+label+' no longer exists. Select another record.');
      related[label]=String(selected.name??selected.title??selected.model??'');
      if(field==='brandId')related.brandSlug=selected.slug;
      if(field==='categoryId')related.categorySlug=selected.slug;
    }
  }
  const clean = prepareAdminRecord(name, related);
  const uniqueField=['settings','homepageSections'].includes(name)?'key':name==='seo'?'path':['tractors','brands','articles','expertReviews','videos','equipment','dealers','articleCategories'].includes(name)?'slug':null;
  if(uniqueField&&clean[uniqueField]){
    const duplicate=(await listAdminRecords(name)).find(row=>row.id!==id&&row[uniqueField]===clean[uniqueField]&&(name!=='tractors'||row.brandId===clean.brandId));
    if(duplicate)throw new Error('A record with this '+uniqueField+' already exists. Edit the existing record instead.');
  }
  if (isLocalDemo && !db) {
    const items = await readLocal<AdminRecord>(name);
    const existing = items.find(item => item.id === id);
    if (id && !existing) throw new Error('This record was removed. Refresh the list before editing.');
    const key = id ?? crypto.randomUUID();
    const now=new Date().toISOString();
    const next = { ...existing, ...clean, id: key, createdAt:existing?.createdAt??now, publishedAt:existing?.publishedAt??now, updatedAt:now };
    await writeLocal(name, id ? items.map(item => item.id === id ? next : item) : [next, ...items]);
    return key;
  }
  const payload = { ...clean, publishedAt:clean.publishedAt??serverTimestamp(), updatedAt: serverTimestamp() };
  if (id) { await updateDoc(doc(needDb(), name, id), payload); return id; }
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

