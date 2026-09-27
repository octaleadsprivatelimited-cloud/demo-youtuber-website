import { publishedSeoRecords, contentPath, type SeoRecord } from './seo-content';
import { withSeoOverride } from './seo-metadata';
import { heroImageSource } from './admin-records';

export async function productSeoRecord(collection: string, path: string) {
  return (await publishedSeoRecords(collection)).find(row => contentPath(collection, row) === path) ?? null;
}
export function productSeoDetails(row: SeoRecord) {
  const name = String(row.name || [row.brandName || row.brand, row.model || row.title].filter(Boolean).join(' ') || 'Tractor');
  const description = `${name}: explore specifications, features, available price information, photos and the EMI calculator on RJ Tractor Techs.`;
  const image = heroImageSource(row.image || row.thumbnail) || '/og.png';
  return { name, description, image };
}
export async function productMetadata(row: SeoRecord, path: string) {
  const {name, description, image} = productSeoDetails(row);
  return withSeoOverride(path, {title:`${name} Specifications & EMI | RJ Tractor Techs`,description,alternates:{canonical:path},openGraph:{type:'website',title:name,description,url:path,images:[image]},twitter:{card:'summary_large_image',title:name,description,images:[image]}});
}
