'use client';

import { useEffect,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { FavouriteButton } from '@/components/FavouriteButton';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listVideos,type Video } from '@/services/media';

export default function VideosPage(){const [items,setItems]=useState<Video[]>([]);const [loading,setLoading]=useState(isFirebaseConfigured);const [error,setError]=useState('');useEffect(()=>{if(!isFirebaseConfigured)return;listVideos().then(setItems).catch(reason=>setError(reason instanceof Error?reason.message:'Unable to load videos.')).finally(()=>setLoading(false));},[]);return <PublicShell><main className="video-index"><section className="video-hero"><div><p>OFFICIAL YOUTUBE CHANNEL</p><h1>Watch RJ Tractor Techs</h1><span>Tractor reviews, field demonstrations, new launches and agricultural explainers.</span><a href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">Visit YouTube channel ↗</a></div><div className="video-play">▶</div></section>{!isFirebaseConfigured?<SetupNotice/>:<section className="video-list">{loading?<div className="detail-loading">Loading videos…</div>:error?<div className="error-state"><h3>Videos are unavailable.</h3><p>{error}</p></div>:!items.length?<div className="empty-state"><h3>No videos are published yet.</h3><p>Videos synced or published from the CMS will appear here.</p></div>:<div className="video-grid">{items.map(item=><article key={item.id}><a className="video-thumb" href={'/videos/'+item.slug} style={item.thumbnail?{backgroundImage:'url('+item.thumbnail+')'}:undefined}><span>▶</span></a><section><p>{item.category??'RJ TRACTOR TECHS'}</p><h2><a href={'/videos/'+item.slug}>{item.title}</a></h2><div>{item.tractorName&&<small>{item.tractorName}</small>}<FavouriteButton compact itemId={item.id} itemType="video" title={item.title} href={'/videos/'+item.slug} image={item.thumbnail}/></div></section></article>)}</div>}</section>}</main></PublicShell>;}

