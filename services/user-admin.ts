import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, firebaseApp, isLocalDemo } from '@/lib/firebase/client';
import { readLocal, writeLocal } from '@/lib/local-demo';
export type AdminUser = {
    id: string;
    email?: string;
    displayName?: string;
    role?: string;
    disabled?: boolean;
    createdAt?: unknown;
};
async function users() { return (await readLocal<AdminUser>('users')); }
export async function listUsers() { if (isLocalDemo && !db) {
    const items = (await users());
    return items;
} if (!db)
    throw new Error('Firebase is not configured.'); const result = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100))); return result.docs.map(row => ({ id: row.id, ...row.data() } as AdminUser)); }
export async function setUserRole(uid: string, role: string) { if (isLocalDemo && !firebaseApp) {
    throw new Error('Account access control requires Firebase Authentication and the deployed admin functions.');
} if (!firebaseApp)
    throw new Error('Firebase is not configured.'); return httpsCallable(getFunctions(firebaseApp), 'setUserRole')({ uid, role }); }
export async function setUserDisabled(uid: string, disabled: boolean) { if (isLocalDemo && !firebaseApp) {
    throw new Error('Account access control requires Firebase Authentication and the deployed admin functions.');
} if (!firebaseApp)
    throw new Error('Firebase is not configured.'); return httpsCallable(getFunctions(firebaseApp), 'setUserDisabled')({ uid, disabled }); }
