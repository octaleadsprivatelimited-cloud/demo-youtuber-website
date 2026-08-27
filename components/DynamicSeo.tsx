'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {usePublicRecords} from '@/hooks/usePublicRecords';
export function DynamicSeo(){
  const path=usePathname();const {items}=usePublicRecords('seo');
  const item=items.find(record=>record.path===path);
  useEffect(()=>{
    if(!item)return;
    const oldTitle=document.title;
    if(item.title)document.title=String(item.title);
    const cleanups:(()=>void)[]=[];
    for(const [attribute,key,value] of [['name','description',item.description],['property','og:title',item.title],['property','og:description',item.description],['property','og:image',item.image]]){
      if(!value)continue;
      let element=document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      const existing=Boolean(element);const previous=element?.content;
      if(!element){element=document.createElement('meta');element.setAttribute(String(attribute),String(key));document.head.appendChild(element);}
      element.content=String(value);const meta=element;
      cleanups.push(()=>{if(existing)meta.content=previous??'';else meta.remove();});
    }
    return()=>{if(document.title===String(item.title))document.title=oldTitle;cleanups.forEach(cleanup=>cleanup());};
  },[path,item]);
  return null;
}
