import VideoDetailClient from './video-detail-client';
export default async function VideoPage({params}:{params:Promise<{slug:string}>}){return <VideoDetailClient slug={(await params).slug}/>;}

