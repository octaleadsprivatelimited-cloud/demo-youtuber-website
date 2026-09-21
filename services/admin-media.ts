import { collection, doc, getDocs, runTransaction, serverTimestamp, type Firestore } from 'firebase/firestore';
import { adminSections } from '@/config/admin-sections';
import { mediaIds, stagedImage } from '@/lib/staged-media';
import { sameAdminRecord } from '@/lib/admin-form';
export const MEDIA_LOCK_ID = '_mediaMutationLock';
// All CMS saves/deletes share this transaction lock, including new records. A
// concurrent mutation retries the reference scan before any image can be deleted.
export async function commitAdminContent(db: Firestore, name: string, id: string | undefined, payload: Record<string, unknown> | null, expected: Record<string, unknown> | null) {
  const target = id ? doc(db, name, id) : doc(collection(db, name));
  const staged = new Map<string, {id:string; data:NonNullable<ReturnType<typeof stagedImage>>}>();
  function materialize(value: unknown): unknown {
    if (typeof value === 'string') {
      const data = stagedImage(value);
      if (data) {
        if (!staged.has(value)) staged.set(value, {id:doc(collection(db,'media')).id,data});
        return '/api/media/' + staged.get(value)!.id;
      }
      if (value.startsWith('blob:')) throw new Error('This image selection expired. Choose the image again.');
      return value;
    }
    if (Array.isArray(value)) return value.map(materialize);
    // Leave Firestore Timestamp and FieldValue instances intact.
    if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,materialize(item)]));
    return value;
  }
  const saved = payload ? materialize(payload) as Record<string,unknown> : null;
  await runTransaction(db, async transaction => {
    const lock = doc(db,'settings',MEDIA_LOCK_ID);
    await transaction.get(lock);
    const current = await transaction.get(target);
    const existing = current.exists() ? {...current.data(),id:current.id} : null;
    if (!sameAdminRecord(existing,expected)) throw new Error('This record changed since you opened it or was removed. Refresh and reopen it before saving or deleting.');
    const retained = mediaIds(saved);
    const removed = [...mediaIds(existing)].filter(key=>!retained.has(key));
    const referenced = new Set<string>();
    let videoSetting: {id:string; [key:string]:unknown} | undefined;
    if (removed.length || (name==='videos' && !saved)) {
      const names = [...new Set(Object.values(adminSections).map(section=>section.collection))];
      for (const collectionName of names) {
        const snapshot = await getDocs(collection(db,collectionName));
        for (const row of snapshot.docs) {
          if (collectionName===name && row.id===target.id) continue;
          const data = row.data();
          for (const key of mediaIds(data)) referenced.add(key);
          if (collectionName==='settings' && data.key==='videoSource') videoSetting={...data,id:row.id};
        }
      }
    }
    // Checking retained media prevents saving an old URL after its file was deleted.
    const newIds = new Set([...staged.values()].map(item=>item.id));
    for (const key of retained) {
      if (!newIds.has(key) && !(await transaction.get(doc(db,'media',key))).exists()) throw new Error('A selected image was deleted. Choose a replacement before saving.');
    }
    for (const item of staged.values()) transaction.set(doc(db,'media',item.id),{...item.data,folder:name,createdAt:serverTimestamp()});
    if (saved) transaction.set(target,saved,{merge:true});
    else transaction.delete(target);
    for (const key of removed) if (!referenced.has(key)) transaction.delete(doc(db,'media',key));
    // Do not let a deleted library video reappear from the automatic channel feed.
    if (name==='videos' && !saved) transaction.set(doc(db,'settings',videoSetting?.id || '_managedVideoSource'),{key:'videoSource',value:'library',status:'published',updatedAt:serverTimestamp()},{merge:true});
    transaction.set(lock,{key:MEDIA_LOCK_ID,status:'draft',updatedAt:serverTimestamp()});
  });
  return target.id;
}
