'use client';

import { useEffect,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { FavouriteButton } from '@/components/FavouriteButton';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getVideo,type Video } from '@/services/media';

export default function VideoDetailClient({slug}:{slug:string}){const [video,setVideo]=useState<Video|null>(null);const [loading,setLoading]=useState(isFirebaseConfigured);const [error,setError]=useState('');useEffect(()=>{if(!isFirebaseConfigured)return;getVideo(slug).then(setVideo).catch(reason=>setError(reason instanceof Error?reason.message:'Unable to load video.')).finally(()=>setLoading(false));},[slug]);return <PublicShell><main className="video-detail">{!isFirebaseConfigured?<SetupNotice/>:loading?<div className="detail-loading">Loading video…</div>:error?<div className="error-state"><h3>Video unavailable.</h3><p>{error}</p></div>:!video?<div className="empty-state"><h3>Video not found.</h3><a href="/videos">Browse videos →</a></div>:<><div className="youtube-frame"><iframe src={'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(video.youtubeVideoId)} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div><section className="video-summary"><div><p>{video.category??'RJ TRACTOR TECHS VIDEO'}</p><h1>{video.title}</h1><span>{video.description}</span>{video.tractorName&&<small>Related tractor: {video.tractorName}</small>}</div><FavouriteButton itemId={video.id} itemType="video" title={video.title} href={'/videos/'+video.slug} image={video.thumbnail}/></section><div className="subscribe-band"><div><strong>RJ Tractor Techs</strong><span>More tractor reviews and farming information on YouTube.</span></div><a href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">Subscribe on YouTube ↗</a></div></>}</main></PublicShell>;}

