import ArticleDetailClient from './article-detail-client';
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){return <ArticleDetailClient slug={(await params).slug}/>;}

