import type {Metadata} from 'next';
export function titleFromSlug(value:string){return value.split('-').map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(' ');}
export function detailMetadata(title:string,description:string,path:string):Metadata{return{title:`${title} | RJ Tractor Techs`,description,alternates:{canonical:path},openGraph:{title,description,url:path,type:'article',images:[]},twitter:{card:'summary',title,description,images:[]}};}
export function breadcrumbs(items:{name:string;path:string}[]){const base=process.env.NEXT_PUBLIC_SITE_URL??'http://localhost:3000';return{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:base+item.path}))};}
