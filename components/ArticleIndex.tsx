'use client';

import { useEffect,useState } from 'react';
import {usePublicRecords} from '@/hooks/usePublicRecords';
import { PublicShell } from './SiteChrome';
import { SetupNotice } from './SetupNotice';
import { FavouriteButton } from './FavouriteButton';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listArticles,type Article } from '@/services/media';

export function ArticleIndex({type}:{type:'article'|'news'}){
 const {items:categories}=usePublicRecords('articleCategories');
 const [items,setItems]=useState<Article[]>([]);const [loading,setLoading]=useState(isFirebaseConfigured);const [error,setError]=useState('');
 useEffect(()=>{if(!isFirebaseConfigured)return;listArticles(type).then(setItems).catch(reason=>setError(reason instanceof Error?reason.message:'Unable to load stories.')).finally(()=>setLoading(false));},[type]);
 const title=type==='news'?'Agriculture and tractor news':'Farming insights and articles';
 return <PublicShell><main className="media-index"><section className="page-hero"><p>{type==='news'?'LATEST UPDATES':'KNOWLEDGE FOR THE FIELD'}</p><h1>{title}</h1><span>{type==='news'?'New launches, industry developments and agricultural updates.':'Practical guides, tractor explainers and farming information from the RJ Tractor Techs editorial workflow.'}</span>{categories.length>0&&<nav className="category-links" aria-label="Article categories">{categories.map(category=><a key={category.id} href={'/category/'+category.slug}>{String(category.title??category.name)}</a>)}</nav>}</section>{!isFirebaseConfigured?<SetupNotice/>:<section className="article-list">{loading?<div className="detail-loading">Loading stories…</div>:error?<div className="error-state"><h3>Stories are unavailable.</h3><p>{error}</p></div>:!items.length?<div className="empty-state"><h3>No published stories yet.</h3><p>Published {type==='news'?'news':'articles'} will appear here automatically.</p></div>:<div className="article-grid">{items.map((item,index)=><article className={index===0?'article-lead':''} key={item.id}><div style={item.coverImage?{backgroundImage:'url('+item.coverImage+')'}:undefined}/><section><p>{item.categoryName} · {type.toUpperCase()}</p><h2>{item.title}</h2><span>{item.excerpt}</span><div><a href={'/articles/'+item.slug}>Read story →</a><FavouriteButton compact itemId={item.id} itemType="article" title={item.title} href={'/articles/'+item.slug} image={item.coverImage}/></div></section></article>)}</div>}</section>}</main></PublicShell>;
}

