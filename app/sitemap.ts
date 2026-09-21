import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site-url';
import { contentPath, publishedSeoRecords } from '@/lib/seo-content';
export const revalidate = 300;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base=siteOrigin();
  const paths=['','/tractors','/brands','/videos','/reviews','/new-tractors','/upcoming-tractors','/compare','/equipment','/articles','/news','/dealers','/emi-calculator','/about','/contact','/privacy-policy','/terms-and-conditions','/disclaimer','/cookie-policy'];
  const entries:MetadataRoute.Sitemap=paths.map(path=>({url:base+path,changeFrequency:path?'weekly':'daily',priority:path?0.7:1}));
  const collections=['tractors','brands','equipment','dealers','articles','videos','expertReviews','articleCategories'];
  const content=await Promise.all(collections.map(async name=>({name,rows:await publishedSeoRecords(name)})));
  for(const {name,rows} of content)for(const row of rows){
    const path=contentPath(name,row); if(!path)continue;
    const date=String(row.updatedAt || row.publishedAt || row.createdAt || '');
    entries.push({url:base+path,...(date&&!Number.isNaN(Date.parse(date))?{lastModified:new Date(date)}:{}),changeFrequency:'weekly',priority:0.8});
  }
  return [...new Map(entries.map(entry=>[entry.url,entry])).values()];
}
