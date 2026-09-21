'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useEffect,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { FavouriteButton } from '@/components/FavouriteButton';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getVideo,type Video } from '@/services/media';
import { trackEvent } from '@/services/analytics';
import { useChannelVideos } from '@/hooks/useChannelVideos';

export default function VideoDetailClient({slug}:{slug:string}){
 const settings = useSiteSettings();
 const { videos: channelVideos, loading: channelLoading } = useChannelVideos();
 const channelMatch = channelVideos.find(v => v.slug === slug || v.youtubeVideoId === slug) as unknown as Video | undefined;
 const [video,setVideo]=useState<Video|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');

 useEffect(() => {
   let cancelled = false;
   setLoading(true);setError('');setVideo(null);
   async function load() {
     try {
       const saved=isFirebaseConfigured ? await getVideo(slug) : null;
       if(cancelled)return;
       setVideo(saved ?? (settings.videoSource === 'library' ? null : channelMatch ?? null));
     } catch(reason) {
       if(!cancelled)setError(reason instanceof Error ? reason.message : 'Unable to load video.');
     } finally {if(!cancelled)setLoading(false);}
   }
   if (!channelLoading || settings.videoSource === 'library') void load();
   return()=>{cancelled=true;};
 }, [channelMatch, channelLoading, slug, settings.videoSource]);

 useEffect(()=>{if(video)trackEvent('video_click',{video_id:video.id,video_title:video.title});},[video]);
 return <PublicShell><main className="video-detail">{loading?<LocalizedElement as="div" className="detail-loading">Loading video…</LocalizedElement>:error?<LocalizedElement as="div" className="error-state"><LocalizedElement as="h3">Video unavailable.</LocalizedElement><LocalizedElement as="p">{error}</LocalizedElement></LocalizedElement>:!video?<LocalizedElement as="div" className="empty-state"><LocalizedElement as="h3">Video not found.</LocalizedElement><LocalizedElement as="a" href="/videos">Browse videos →</LocalizedElement></LocalizedElement>:<><LocalizedElement as="div" className="youtube-frame"><iframe src={'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(video.youtubeVideoId)} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></LocalizedElement><section className="video-summary"><LocalizedElement as="div"><LocalizedElement as="p">{video.category??'RJ TRACTOR TECHS VIDEO'}</LocalizedElement><LocalizedElement as="h1">{video.title}</LocalizedElement><LocalizedElement as="span">{video.description}</LocalizedElement>{video.tractorName&&<LocalizedElement as="small">Related tractor: {video.tractorName}</LocalizedElement>}</LocalizedElement><FavouriteButton itemId={video.id} itemType="video" title={video.title} href={'/videos/'+video.slug} image={video.thumbnail}/></section><LocalizedElement as="div" className="subscribe-band"><LocalizedElement as="div"><LocalizedElement as="strong">RJ Tractor Techs</LocalizedElement><LocalizedElement as="span">More tractor reviews and farming information on YouTube.</LocalizedElement></LocalizedElement><LocalizedElement as="a" href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer" onClick={()=>trackEvent('youtube_click',{source:'video_detail'})}>Subscribe on YouTube ↗</LocalizedElement></LocalizedElement></>}</main></PublicShell>;
}

