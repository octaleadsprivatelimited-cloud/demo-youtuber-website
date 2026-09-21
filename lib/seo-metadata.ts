import type { Metadata } from 'next';
import { publishedSeoRecords } from './seo-content';
export async function withSeoOverride(path: string, defaults: Metadata): Promise<Metadata> {
  const title = typeof defaults.title === 'string' ? defaults.title : 'RJ Tractor Techs';
  defaults = {...defaults, alternates:{...defaults.alternates,canonical:path},openGraph:{title,description:defaults.description || '',url:path,images:['/og.png'],...defaults.openGraph},twitter:{card:'summary_large_image',title,description:defaults.description || '',images:['/og.png'],...defaults.twitter}};
  try {
    const record=(await publishedSeoRecords('seo')).find(row=>row.path===path);
    if(!record)return defaults;
    const title=String(record.title || defaults.title || 'RJ Tractor Techs');
    const description=String(record.description || defaults.description || '');
    const images=[String(record.image || '/og.png')];
    return {...defaults,title,description,alternates:{...defaults.alternates,canonical:path},openGraph:{...defaults.openGraph,title,description,url:path,images},twitter:{...defaults.twitter,card:'summary_large_image',title,description,images}};
  } catch { return defaults; }
}
