import { addDoc, collection, getDocs, limit, query, serverTimestamp, where } from 'firebase/firestore';
import { db, isLocalDemo } from '@/lib/firebase/client';
import { published, readLocal, writeLocal } from '@/lib/local-demo';
type Generic = {
    id: string;
    [key: string]: unknown;
};
export async function getPublishedSetting(key: string) { if (isLocalDemo && !db)
    return (await published<Generic>('settings')).find(x => x.key === key) ?? null; if (!db)
    return null; const snap = await getDocs(query(collection(db, 'settings'), where('key', '==', key), where('status', '==', 'published'), limit(1))); return snap.docs[0]?.data() ?? null; }
export async function submitContact(input: {
    name: string;
    email: string;
    phone?: string;
    message: string;
}) { if (isLocalDemo && !db) {
    (await writeLocal('contactMessages', [{ ...input, id: `demo-${Date.now()}`, status: 'New', createdAt:new Date().toISOString() }, ...(await readLocal<Generic>('contactMessages'))]));
    return;
} if (!db)
    throw new Error('Firebase is not configured.'); return addDoc(collection(db, 'contactMessages'), { ...input, status: 'New', createdAt: serverTimestamp() }); }
export async function subscribeNewsletter(email: string) { if (isLocalDemo && !db) {
    (await writeLocal('newsletterSubscribers', [{ id: `demo-${Date.now()}`, email, status: 'active' }, ...(await readLocal<Generic>('newsletterSubscribers'))]));
    return;
} if (!db)
    throw new Error('Firebase is not configured.'); return addDoc(collection(db, 'newsletterSubscribers'), { email, status: 'active', createdAt: serverTimestamp() }); }
