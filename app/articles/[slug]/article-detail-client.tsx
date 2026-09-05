'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


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
 return <PublicShell><main className="article-detail">{!isFirebaseConfigured?<SetupNotice/>:loading?<LocalizedElement as="div" className="detail-loading">Loading article…</LocalizedElement>:error?<LocalizedElement as="div" className="error-state"><LocalizedElement as="h3">Article unavailable.</LocalizedElement><LocalizedElement as="p">{error}</LocalizedElement></LocalizedElement>:!article?<LocalizedElement as="div" className="empty-state"><LocalizedElement as="h3">Article not found.</LocalizedElement><LocalizedElement as="a" href="/articles">Browse articles →</LocalizedElement></LocalizedElement>:<><header><LocalizedElement as="p">{article.categoryName} · {article.articleType==='news'?'NEWS':'ARTICLE'}</LocalizedElement><LocalizedElement as="h1">{article.title}</LocalizedElement><LocalizedElement as="span">{article.excerpt}</LocalizedElement><LocalizedElement as="div"><LocalizedElement as="small">By {article.authorName}</LocalizedElement><FavouriteButton itemId={article.id} itemType="article" title={article.title} href={'/articles/'+article.slug} image={article.coverImage}/></LocalizedElement></header>{article.coverImage&&<LocalizedElement as="div" className="article-cover" style={{backgroundImage:'url('+article.coverImage+')'}}/>}<section className="article-reading"><article>{article.body?<ReadingContent text={article.body}/>:<LocalizedElement as="p">The full article is not available yet. Explore another story from the reading room.</LocalizedElement>}</article><aside><LocalizedElement as="p">KEEP RESEARCHING</LocalizedElement><LocalizedElement as="a" href="/tractors">Explore tractors →</LocalizedElement><LocalizedElement as="a" href="/reviews">Read expert reviews →</LocalizedElement><LocalizedElement as="a" href="/videos">Watch videos →</LocalizedElement><LocalizedElement as="a" className="youtube-cta" href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">▶ RJ Tractor Techs</LocalizedElement></aside></section></>}</main></PublicShell>;
}
