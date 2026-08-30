import {collection,getDocs,query,where,limit} from 'firebase/firestore';
import {db,isLocalDemo} from '@/lib/firebase/client';
import {readLocal} from '@/lib/local-demo';
import type {OwnerReview} from './phase-three';
export async function listMyReviews(userId:string):Promise<OwnerReview[]>{
  if(!userId)return [];
  if(isLocalDemo&&!db)return(await readLocal<OwnerReview>('reviews')).filter(item=>item.userId===userId);
  if(!db)throw new Error('Sign-in is not configured.');
  const snapshot=await getDocs(query(collection(db,'reviews'),where('userId','==',userId),limit(100)));
  return snapshot.docs.map(item=>({...item.data(),id:item.id}) as OwnerReview);
}
