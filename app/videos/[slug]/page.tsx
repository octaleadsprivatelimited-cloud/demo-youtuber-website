import VideoDetailClient from './video-detail-client';
import {SeoJsonLd} from '@/components/SeoJsonLd';
import {breadcrumbs,detailMetadata,titleFromSlug} from '@/utils/seo';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const title=titleFromSlug(slug);return detailMetadata(title,`Watch ${title} from the official RJ Tractor Techs video library.`,`/videos/${slug}`);}
export default async function VideoPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <><SeoJsonLd data={breadcrumbs([{name:'Home',path:'/'},{name:'Videos',path:'/videos'},{name:titleFromSlug(slug),path:`/videos/${slug}`}])}/><VideoDetailClient slug={slug}/></>;}
