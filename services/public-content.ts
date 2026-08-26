import {addDoc,collection,getDocs,limit,query,serverTimestamp,where} from 'firebase/firestore';
import {db} from '@/lib/firebase/client';
export async function getPublishedSetting(key:string){if(!db)return null;const snap=await getDocs(query(collection(db,'settings'),where('key','==',key),where('status','==','published'),limit(1)));return snap.docs[0]?.data()??null;}
export async function submitContact(input:{name:string;email:string;phone?:string;message:string}){if(!db)throw new Error('Firebase is not configured.');return addDoc(collection(db,'contactMessages'),{...input,status:'New',createdAt:serverTimestamp()});}
export async function subscribeNewsletter(email:string){if(!db)throw new Error('Firebase is not configured.');return addDoc(collection(db,'newsletterSubscribers'),{email,status:'active',createdAt:serverTimestamp()});}
