import {collection,getDocs,limit,orderBy,query} from 'firebase/firestore';
import {getFunctions,httpsCallable} from 'firebase/functions';
import {db,firebaseApp} from '@/lib/firebase/client';
export type AdminUser={id:string;email?:string;displayName?:string;role?:string;disabled?:boolean;createdAt?:unknown};
export async function listUsers(){if(!db)throw new Error('Firebase is not configured.');const result=await getDocs(query(collection(db,'users'),orderBy('createdAt','desc'),limit(100)));return result.docs.map(row=>({id:row.id,...row.data()} as AdminUser));}
export async function setUserRole(uid:string,role:string){if(!firebaseApp)throw new Error('Firebase is not configured.');return httpsCallable(getFunctions(firebaseApp),'setUserRole')({uid,role});}
export async function setUserDisabled(uid:string,disabled:boolean){if(!firebaseApp)throw new Error('Firebase is not configured.');return httpsCallable(getFunctions(firebaseApp),'setUserDisabled')({uid,disabled});}
