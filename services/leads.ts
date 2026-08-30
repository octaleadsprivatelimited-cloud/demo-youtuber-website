import { listAdminRecords } from '@/services/admin';
import { readLocal, writeLocal } from '@/lib/local-demo';
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, isLocalDemo } from '@/lib/firebase/client';
export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Follow-up' | 'Converted' | 'Closed' | 'Spam';
export interface Lead {
    id: string;
    name: string;
    phone: string;
    email?: string;
    city: string;
    state: string;
    tractorId?: string;
    tractorName?: string;
    dealerId?: string;
    message?: string;
    source: string;
    status: LeadStatus;
    assignedTo?: string;
    notes?: string;
    userId?: string;
    createdAt?: string | {
        toDate?: () => Date;
    };
    updatedAt?: unknown;
}
export type NewLead = Pick<Lead, 'name' | 'phone' | 'city' | 'state' | 'source'> & Partial<Pick<Lead, 'email' | 'tractorId' | 'tractorName' | 'dealerId' | 'message' | 'userId'>>;
function database() { if (!isFirebaseConfigured || !db)
    throw new Error('Firebase is not configured.'); return db; }
async function demos() { return (await readLocal<Lead>('leads')); }
async function save(items: Lead[]) { return (await writeLocal('leads', items)); }
export async function createLead(input: NewLead) { if (isLocalDemo && !db) {
    (await save([{ ...input, id: `demo-${Date.now()}`, status: 'New', assignedTo: '', notes: '', createdAt:new Date().toISOString() } as Lead, ...(await demos())]));
    return;
} const clean = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined && v !== '')); return addDoc(collection(database(), 'leads'), { ...clean, status: 'New', assignedTo: null, notes: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); }
export async function getAdminRole(userId: string) { if (isLocalDemo && !db)
    return 'Super Admin'; const snap = await getDoc(doc(database(), 'admins', userId)); if (!snap.exists() || snap.data().active !== true)
    return null; return String(snap.data().role ?? ''); }
export async function listLeads(filters: { status?: LeadStatus; source?: string } = {}) {
    const records = await listAdminRecords('leads');
    return (records as unknown as Lead[]).filter(item => (!filters.status || item.status === filters.status) && (!filters.source || item.source === filters.source));
}
async function patchLead(id: string, patch: Partial<Lead>): Promise<Lead> {
    if (isLocalDemo && !db) {
        const items = await demos(); const current = items.find(item => item.id === id);
        if (!current) throw new Error('This lead was removed. Refresh the list.');
        const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
        await save(items.map(item => item.id === id ? updated : item)); return updated;
    }
    const target = doc(database(), 'leads', id);
    await updateDoc(target, { ...patch, updatedAt: serverTimestamp() });
    const updated = await getDoc(target);
    if (!updated.exists()) throw new Error('This lead was removed. Refresh the list.');
    return { ...updated.data(), id: updated.id } as Lead;
}
export async function updateLeadStatus(id: string, status: LeadStatus, assignedTo?: string) {
    if (!['New','Contacted','Interested','Follow-up','Converted','Closed','Spam'].includes(status)) throw new Error('Choose a valid lead status.');
    return patchLead(id, { status, ...(assignedTo !== undefined ? { assignedTo } : {}) });
}
export async function updateLeadNotes(id: string, notes: string) { return patchLead(id, { notes }); }
export async function updateLeadDetails(id: string, input: Record<string, unknown>) {
    const allowed = ['name','phone','email','city','state','message'];
    const patch = Object.fromEntries(Object.entries(input).filter(([key]) => allowed.includes(key)).map(([key, value]) => [key, String(value ?? '').trim()]));
    if ('name' in patch && patch.name.length < 2) throw new Error('Enter a name with at least two characters.');
    if ('phone' in patch && patch.phone.replace(/[^0-9]/g, '').length < 8) throw new Error('Enter a valid phone number.');
    if (patch.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email)) throw new Error('Enter a valid email address or leave it blank.');
    if (Object.values(patch).some(value => value.length > 10000)) throw new Error('Please shorten the entered details.');
    return patchLead(id, patch);
}
export async function deleteLead(id: string) { if (isLocalDemo && !db) {
    (await save((await demos()).filter(x => x.id !== id)));
    return;
} await deleteDoc(doc(database(), 'leads', id)); }
