import { firebaseConfig } from './firebase/config';
type Field = {stringValue?:string; timestampValue?:string; integerValue?:string; doubleValue?:number; booleanValue?:boolean};
export type SeoRecord = {id:string; [key:string]:unknown};
export async function publishedSeoRecords(name: string): Promise<SeoRecord[]> {
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(firebaseConfig.projectId)}/databases/(default)/documents:runQuery`, {
    method:'POST', headers:{'Content-Type':'application/json'}, next:{revalidate:300},
    body:JSON.stringify({structuredQuery:{from:[{collectionId:name}],where:{fieldFilter:{field:{fieldPath:'status'},op:'EQUAL',value:{stringValue:'published'}}}}}),
    signal:AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Unable to load published SEO content: '+name);
  const rows = await response.json() as {document?:{name:string;fields:Record<string,Field>};error?:unknown}[];
  if(rows.some(row=>row.error))throw new Error('Unable to load published SEO content: '+name);
  return rows.flatMap(({document})=>document ? [{id:document.name.split('/').at(-1)!,...Object.fromEntries(Object.entries(document.fields).map(([key,value])=>[key,value.stringValue ?? value.timestampValue ?? value.integerValue ?? value.doubleValue ?? value.booleanValue]))}] : []);
}
export function contentPath(collection:string,row:SeoRecord): string | null {
  const slug=typeof row.slug==='string'&&row.slug ? encodeURIComponent(row.slug) : '';
  if(!slug)return null;
  if(collection==='tractors')return row.brandSlug?`/tractor/${encodeURIComponent(String(row.brandSlug))}/${slug}`:null;
  if(collection==='equipment')return row.categorySlug?`/equipment/${encodeURIComponent(String(row.categorySlug))}/${slug}`:null;
  const prefix:Record<string,string>={brands:'brand',dealers:'dealers',articles:'articles',videos:'videos',expertReviews:'reviews',articleCategories:'category'};
  return prefix[collection]?`/${prefix[collection]}/${slug}`:null;
}
