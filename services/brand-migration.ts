import {collection, doc, getDoc, getDocs, runTransaction, serverTimestamp, setDoc} from 'firebase/firestore';
import {db} from '@/lib/firebase/client';
let pending: Promise<void> | null = null;
export function migratePartnersToBrands() {
 if (pending) return pending;
 pending = migrate().finally(() => {pending=null;});
 return pending;
}
async function migrate() {
 if(!db)throw new Error('Firebase is not configured.');
 const marker=doc(db,'settings','migration-partners-to-brands-v1');
 if((await getDoc(marker)).exists())return;
 const [partners,brands]=await Promise.all([getDocs(collection(db,'partners')),getDocs(collection(db,'brands'))]);
 const slugs=new Set(brands.docs.map(row=>row.data().slug).filter(Boolean));
 for(const partner of partners.docs){
  const source=partner.data();
  if(source.slug && slugs.has(source.slug))continue;
  const target=doc(db,'brands',partner.id);
  await runTransaction(db,async transaction=>{
   if((await transaction.get(target)).exists())return;
   const title=String(source.title ?? source.name ?? '');
   transaction.set(target,{...source,title,name:title,logo:String(source.image ?? source.logo ?? ''),status:source.status==='approved'?'published':source.status ?? 'draft',updatedAt:serverTimestamp()});
  });
  if(source.slug)slugs.add(source.slug);
 }
 await setDoc(marker,{key:'migration-partners-to-brands-v1',title:'Partner migration completed',status:'archived',completedAt:serverTimestamp()});
}
