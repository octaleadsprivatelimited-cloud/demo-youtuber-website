'use client';

import { useEffect,useState } from 'react';
import {ReadingContent} from '@/components/PublicPageParts';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { FavouriteButton } from '@/components/FavouriteButton';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getArticle,type Article } from '@/services/media';
import { trackEvent } from '@/services/analytics';

export default function ArticleDetailClient({slug}:{slug:string}){
 const [article,setArticle]=useState<Article|null>(null);const [loading,setLoading]=useState(isFirebaseConfigured);const [error,setError]=useState('');
 useEffect(()=>{if(!isFirebaseConfigured)return;getArticle(slug).then(setArticle).catch(reason=>setError(reason instanceof Error?reason.message:'Unable to load article.')).finally(()=>setLoading(false));},[slug]);
 useEffect(()=>{if(article)trackEvent('article_view',{article_id:article.id,article_title:article.title});},[article]);
 return <PublicShell><main className="article-detail">{!isFirebaseConfigured?<SetupNotice/>:loading?<div className="detail-loading">Loading article…</div>:error?<div className="error-state"><h3>Article unavailable.</h3><p>{error}</p></div>:!article?<div className="empty-state"><h3>Article not found.</h3><a href="/articles">Browse articles →</a></div>:<><header><p>{article.categoryName} · {article.articleType==='news'?'NEWS':'ARTICLE'}</p><h1>{article.title}</h1><span>{article.excerpt}</span><div><small>By {article.authorName}</small><FavouriteButton itemId={article.id} itemType="article" title={article.title} href={'/articles/'+article.slug} image={article.coverImage}/></div></header>{article.coverImage&&<div className="article-cover" style={{backgroundImage:'url('+article.coverImage+')'}}/>}<section className="article-reading"><article>{article.body?<ReadingContent text={article.body}/>:<p>The full article is not available yet. Explore another story from the reading room.</p>}</article><aside><p>KEEP RESEARCHING</p><a href="/tractors">Explore tractors →</a><a href="/reviews">Read expert reviews →</a><a href="/videos">Watch videos →</a><a className="youtube-cta" href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">▶ RJ Tractor Techs</a></aside></section></>}</main></PublicShell>;
}
