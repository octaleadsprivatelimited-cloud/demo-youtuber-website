import type {Metadata} from 'next';
import {withSeoOverride} from '@/lib/seo-metadata';
import {siteOrigin} from '@/lib/site-url';
export function titleFromSlug(value:string){return value.split('-').map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(' ');}
export function detailMetadata(title:string,description:string,path:string):Promise<Metadata>{return withSeoOverride(path,{title:`${title} | RJ Tractor Techs`,description,alternates:{canonical:path},openGraph:{title,description,url:path,type:'article',images:['/og.png']},twitter:{card:'summary_large_image',title,description,images:['/og.png']}});}
export function breadcrumbs(items:{name:string;path:string}[]){const base=siteOrigin();return{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:base+item.path}))};}
