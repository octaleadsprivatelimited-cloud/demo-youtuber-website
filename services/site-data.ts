import{collection,getDocs,limit,query,where}from'firebase/firestore';import{db,isLocalDemo}from'@/lib/firebase/client';import{published}from'@/lib/local-demo';
export type SiteRecord={id:string;status?:unknown;[key:string]:unknown};
export async function listPublicRecords(name:string,max=30):Promise<SiteRecord[]>{if(isLocalDemo&&!db)return published<SiteRecord>(name).slice(0,max);if(!db)return[];const snap=await getDocs(query(collection(db,name),where('status','in',['published','approved']),limit(max)));return snap.docs.map(d=>({id:d.id,...d.data()}));}
