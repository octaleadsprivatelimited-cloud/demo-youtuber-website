import ArticleDetailClient from './article-detail-client';
import {SeoJsonLd} from '@/components/SeoJsonLd';
import {breadcrumbs,detailMetadata,titleFromSlug} from '@/utils/seo';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const title=titleFromSlug(slug);return detailMetadata(title,`${title} — tractor and farming insight from RJ Tractor Techs.`,`/articles/${slug}`);}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <><SeoJsonLd data={breadcrumbs([{name:'Home',path:'/'},{name:'Articles',path:'/articles'},{name:titleFromSlug(slug),path:`/articles/${slug}`}])}/><ArticleDetailClient slug={slug}/></>;}
