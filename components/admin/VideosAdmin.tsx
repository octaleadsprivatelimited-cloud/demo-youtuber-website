'use client';
import { useState } from 'react';
import { AdminCrud } from './AdminCrud';
import { adminSections } from '@/config/admin-sections';
import { useChannelVideos } from '@/hooks/useChannelVideos';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { listAdminRecords, saveAdminRecord } from '@/services/admin';
import type { YouTubeFeedVideo } from '@/services/youtube-feed';
export function VideosAdmin() {
  const {videos, loading, error} = useChannelVideos();
  const settings = useSiteSettings();
  const [revision,setRevision] = useState(0);
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  async function source(value: string) {
    setBusy(true); setNotice('');
    try {
      const current=(await listAdminRecords('settings')).find(item=>item.key==='videoSource');
      await saveAdminRecord('settings',current?.id,{key:'videoSource',value,status:'published'},current);
      setNotice(value==='library'?'Only published admin videos will appear.':'Channel videos will appear when the published library is empty.');
    } catch(reason){setNotice(reason instanceof Error?reason.message:'Unable to save video source.');}
    finally{setBusy(false);}
  }
  async function copy(video: YouTubeFeedVideo) {
    setBusy(true);setNotice('');
    try {
      const existing=(await listAdminRecords('videos')).find(item=>item.youtubeVideoId===video.youtubeVideoId);
      if(existing){setNotice('This video is already in the library. Use Edit below.');return;}
      await saveAdminRecord('videos',undefined,{...video,youtubeId:video.youtubeVideoId,status:'draft'});
      setRevision(value=>value+1);
      setNotice('Copied to drafts. Use Edit below to update the title, thumbnail or description, then publish.');
    } catch(reason){setNotice(reason instanceof Error?reason.message:'Unable to copy video.');}
    finally{setBusy(false);}
  }
  return <>
    <section className="cms-panel" style={{padding:24,marginBottom:24}}>
      <h1>YouTube section controls</h1>
      <p>Manage the homepage and video library here. Copy channel videos into drafts to edit their titles, thumbnails, descriptions and publication status.</p>
      <label>Website video source <select aria-label="Website video source" disabled={busy} value={settings.videoSource==='library'?'library':'fallback'} onChange={event=>void source(event.target.value)}>
        <option value="fallback">Published library, with channel feed when empty</option>
        <option value="library">Published library only</option>
      </select></label>
      <p><a href="/admin/homepage">Edit section title, visibility and position</a> · <a href="/videos" target="_blank" rel="noreferrer">Preview videos ↗</a></p>
      {notice&&<p role="status">{notice}</p>}
      <details><summary>Channel videos available to edit</summary>
        {loading&&<p>Loading channel videos…</p>}{error&&<p role="alert">{error}</p>}
        <div className="cms-record-list">{videos.map(video=><article key={video.youtubeVideoId}><div><strong>{video.title}</strong></div><button type="button" disabled={busy} onClick={()=>void copy(video)}>Copy to drafts</button></article>)}</div>
      </details>
    </section>
    <AdminCrud key={revision} section={adminSections.videos}/>
  </>;
}
