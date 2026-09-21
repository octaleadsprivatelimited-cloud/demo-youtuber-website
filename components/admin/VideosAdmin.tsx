'use client';
import { useState } from 'react';
import { AdminCrud } from './AdminCrud';
import { adminSections } from '@/config/admin-sections';
import { useChannelVideos } from '@/hooks/useChannelVideos';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { getAdminRecord, type AdminRecord } from '@/services/admin';
import { manageChannelVideos } from '@/services/video-library-admin';
export function VideosAdmin() {
  const {videos, loading, error} = useChannelVideos();
  const settings = useSiteSettings();
  const [revision,setRevision] = useState(0);
  const [initialRecord,setInitialRecord] = useState<AdminRecord>();
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  async function manage(videoId?: string) {
    setBusy(true);setNotice('');
    try {
      const requested=videos.find(video=>video.youtubeVideoId===videoId);
      const records=await manageChannelVideos(settings.videoSource==='library' && requested ? [requested] : videos);
      const selected=videoId?records.find(row=>row.youtubeVideoId===videoId || row.youtubeId===videoId || row.slug===requested?.slug):undefined;
      const record=selected?await getAdminRecord('videos',selected.id):null;
      setInitialRecord(record ?? undefined);
      setRevision(value=>value+1);
      setNotice('The channel videos are now in your editable library below. Saved changes control the homepage.');
    } catch(reason){setNotice(reason instanceof Error?reason.message:'Unable to prepare the video library. Please retry.');}
    finally{setBusy(false);}
  }
  return <>
    <section className="cms-panel" style={{padding:24,marginBottom:24}}>
      <h1>Homepage: Recent videos on YouTube</h1>
      <p>Edit the YouTube link to replace a video. Set its homepage display order, change its thumbnail, or turn off “Show in homepage video slider”. Draft and archived videos are hidden from the website.</p>
      <p><a href="/admin/homepage">Section title, visibility and position</a> · <a href="/admin/settings">YouTube channel button link</a> · <a href="/" target="_blank" rel="noreferrer">Preview homepage ↗</a></p>
      {notice&&<p role="status">{notice}</p>}
      {settings.videoSource!=='library' && <div>
        <h2>Videos currently supplied by your channel</h2>
        <p>Make these videos editable to keep the current selection and control it here. Future channel uploads will appear only when you add them.</p>
        <button type="button" disabled={busy || loading || !videos.length} onClick={()=>void manage()}>{busy?'Preparing editable videos…':'Make current videos editable'}</button>
      </div>}
      <details open={settings.videoSource!=='library'}><summary>Add or edit channel videos</summary>
        {loading&&<p>Loading channel videos…</p>}{error&&<p role="alert">{error}</p>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginTop:16}}>{videos.map(video=><article key={video.youtubeVideoId} style={{border:'1px solid #ddd',borderRadius:8,padding:12}}>
          <img src={video.thumbnail} alt="" loading="lazy" style={{width:'100%',aspectRatio:'16/9',objectFit:'cover'}}/>
          <p><strong>{video.title}</strong></p>
          <button type="button" disabled={busy} onClick={()=>void manage(video.youtubeVideoId)}>Edit this video</button>
        </article>)}</div>
      </details>
    </section>
    <AdminCrud key={revision} section={adminSections.videos} initialRecord={initialRecord}/>
  </>;
}
