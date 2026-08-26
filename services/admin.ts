import {addDoc,collection,deleteDoc,doc,getCountFromServer,getDocs,limit,orderBy,query,serverTimestamp,setDoc} from 'firebase/firestore';
import {getDownloadURL,ref,uploadBytes} from 'firebase/storage';
import {db,storage} from '@/lib/firebase/client';

export type AdminRecord={id:string;[key:string]:unknown};
function needDb(){if(!db)throw new Error('Firebase is not configured.');return db;}
export async function listAdminRecords(name:string){const snap=await getDocs(query(collection(needDb(),name),orderBy('updatedAt','desc'),limit(100)));return snap.docs.map(item=>({id:item.id,...item.data()}));}
export async function saveAdminRecord(name:string,id:string|undefined,data:Record<string,unknown>){const payload={...data,updatedAt:serverTimestamp()};if(id){await setDoc(doc(needDb(),name,id),payload,{merge:true});return id;}const created=await addDoc(collection(needDb(),name),{...payload,createdAt:serverTimestamp()});return created.id;}
export async function removeAdminRecord(name:string,id:string){await deleteDoc(doc(needDb(),name,id));}
export async function uploadAdminImage(file:File,folder:string){if(!storage)throw new Error('Firebase Storage is not configured.');const clean=file.name.replace(/[^a-zA-Z0-9._-]/g,'-');const target=ref(storage,`admin/${folder}/${Date.now()}-${clean}`);await uploadBytes(target,file,{contentType:file.type});return getDownloadURL(target);}
export async function getAdminCounts(names:string[]){const rows=await Promise.all(names.map(async name=>[name,(await getCountFromServer(collection(needDb(),name))).data().count] as const));return Object.fromEntries(rows) as Record<string,number>;}
