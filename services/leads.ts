import { addDoc,collection,doc,getDoc,getDocs,limit,orderBy,query,serverTimestamp,updateDoc,where } from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';
import { db,isFirebaseConfigured } from '@/lib/firebase/client';

export type LeadStatus='New'|'Contacted'|'Interested'|'Follow-up'|'Converted'|'Closed'|'Spam';
export interface Lead {id:string;name:string;phone:string;email?:string;city:string;state:string;tractorId?:string;tractorName?:string;dealerId?:string;message?:string;source:string;status:LeadStatus;assignedTo?:string;notes?:string;userId?:string;createdAt?:{toDate?:()=>Date};updatedAt?:unknown;}
export type NewLead=Pick<Lead,'name'|'phone'|'city'|'state'|'source'>&Partial<Pick<Lead,'email'|'tractorId'|'tractorName'|'dealerId'|'message'|'userId'>>;

function database(){if(!isFirebaseConfigured||!db)throw new Error('Firebase is not configured.');return db;}
export async function createLead(input:NewLead){const clean=Object.fromEntries(Object.entries(input).filter(([,value])=>value!==undefined&&value!==''));return addDoc(collection(database(),'leads'),{...clean,status:'New',assignedTo:null,notes:'',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});}
export async function getAdminRole(userId:string){const snapshot=await getDoc(doc(database(),'admins',userId));if(!snapshot.exists()||snapshot.data().active!==true)return null;return String(snapshot.data().role??'');}
export async function listLeads(filters:{status?:LeadStatus;source?:string}={}){const clauses:QueryConstraint[]=[orderBy('createdAt','desc'),limit(100)];if(filters.status)clauses.unshift(where('status','==',filters.status));if(filters.source)clauses.unshift(where('source','==',filters.source));const snapshot=await getDocs(query(collection(database(),'leads'),...clauses));return snapshot.docs.map(item=>({id:item.id,...item.data()}) as Lead);}
export async function updateLeadStatus(id:string,status:LeadStatus,assignedTo?:string){await updateDoc(doc(database(),'leads',id),{status,...(assignedTo!==undefined?{assignedTo}:{}),updatedAt:serverTimestamp()});}
