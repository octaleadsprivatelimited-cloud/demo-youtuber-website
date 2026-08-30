import { listAdminRecords } from '@/services/admin';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp, isLocalDemo } from '@/lib/firebase/client';
export type AdminUser = {
    id: string;
    email?: string;
    displayName?: string;
    role?: string;
    disabled?: boolean;
    createdAt?: unknown;
};
export async function listUsers() { return await listAdminRecords('users') as AdminUser[]; }
export async function setUserRole(uid: string, role: string) { if (isLocalDemo && !firebaseApp) {
    throw new Error('Account access control requires Firebase Authentication and the deployed admin functions.');
} if (!firebaseApp)
    throw new Error('Firebase is not configured.'); return httpsCallable(getFunctions(firebaseApp), 'setUserRole')({ uid, role }); }
export async function setUserDisabled(uid: string, disabled: boolean) { if (isLocalDemo && !firebaseApp) {
    throw new Error('Account access control requires Firebase Authentication and the deployed admin functions.');
} if (!firebaseApp)
    throw new Error('Firebase is not configured.'); return httpsCallable(getFunctions(firebaseApp), 'setUserDisabled')({ uid, disabled }); }
