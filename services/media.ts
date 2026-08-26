import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/client';

export interface Article {
  id:string; slug:string; title:string; excerpt:string; body?:string; coverImage?:string;
  categoryName:string; categorySlug:string; authorName:string; articleType?:'article'|'news';
  status:'draft'|'review'|'published'|'archived'; featured?:boolean;
  publishedAt?:{toDate?:()=>Date}; relatedTractorIds?:string[]; relatedVideoIds?:string[];
}
export interface Video {
  id:string; slug:string; title:string; description:string; youtubeVideoId:string;
  thumbnail?:string; category?:string; tractorId?:string; tractorName?:string;
  featured?:boolean; status:'draft'|'published'; publishedAt?:{toDate?:()=>Date};
}
export interface Equipment {
  id:string; slug:string; name:string; categoryName:string; categorySlug:string; brandName?:string;
  description?:string; image?:string; price?:number; specifications?:Record<string,string|number>;
  status:'draft'|'published';
}
export interface Dealer {
  id:string; slug:string; name:string; brand?:string; phone?:string; whatsapp?:string; email?:string;
  address:string; city:string; district:string; state:string; pincode?:string; latitude?:number; longitude?:number;
  services?:string[]; images?:string[]; logo?:string; verified?:boolean; status:'draft'|'published';
}

function database(){if(!isFirebaseConfigured||!db)throw new Error('Firebase is not configured.');return db;}
function mapped<T extends {id:string}>(snapshot:Awaited<ReturnType<typeof getDocs>>){return snapshot.docs.map(item=>({id:item.id,...(item.data() as Record<string,unknown>)}) as T);}

export async function listArticles(articleType?:'article'|'news',categorySlug?:string){
  const filters=[where('status','==','published'),orderBy('publishedAt','desc'),limit(24)];
  if(articleType)filters.unshift(where('articleType','==',articleType));
  if(categorySlug)filters.unshift(where('categorySlug','==',categorySlug));
  return mapped<Article>(await getDocs(query(collection(database(),'articles'),...filters)));
}
export async function getArticle(slug:string){
  const items=mapped<Article>(await getDocs(query(collection(database(),'articles'),where('slug','==',slug),where('status','==','published'),limit(1))));
  return items[0]??null;
}
export async function listVideos(){
  return mapped<Video>(await getDocs(query(collection(database(),'videos'),where('status','==','published'),orderBy('publishedAt','desc'),limit(24))));
}
export async function getVideo(slug:string){
  const items=mapped<Video>(await getDocs(query(collection(database(),'videos'),where('slug','==',slug),where('status','==','published'),limit(1))));
  return items[0]??null;
}
export async function listEquipment(categorySlug?:string){
  const filters=[where('status','==','published'),orderBy('name'),limit(30)];
  if(categorySlug)filters.unshift(where('categorySlug','==',categorySlug));
  return mapped<Equipment>(await getDocs(query(collection(database(),'equipment'),...filters)));
}
export async function getEquipment(categorySlug:string,slug:string){
  const items=mapped<Equipment>(await getDocs(query(collection(database(),'equipment'),where('categorySlug','==',categorySlug),where('slug','==',slug),where('status','==','published'),limit(1))));
  return items[0]??null;
}
export async function listDealers(filters:{brand?:string;state?:string;district?:string;city?:string}={}){
  const clauses=[where('status','==','published'),orderBy('name'),limit(30)];
  if(filters.brand)clauses.unshift(where('brand','==',filters.brand));
  if(filters.state)clauses.unshift(where('state','==',filters.state));
  if(filters.district)clauses.unshift(where('district','==',filters.district));
  if(filters.city)clauses.unshift(where('city','==',filters.city));
  return mapped<Dealer>(await getDocs(query(collection(database(),'dealers'),...clauses)));
}
export async function getDealer(slug:string){
  const items=mapped<Dealer>(await getDocs(query(collection(database(),'dealers'),where('slug','==',slug),where('status','==','published'),limit(1))));
  return items[0]??null;
}
