import { listAdminRecords, saveAdminRecord } from './admin';
import type { YouTubeFeedVideo } from './youtube-feed';
// Import the whole visible feed before editing one item so other cards remain.
// Existing edits, drafts and archived records are never overwritten.
export async function manageChannelVideos(videos: YouTubeFeedVideo[]) {
  if (!videos.length) throw new Error('No channel videos are available to import. Add a video below instead.');
  const existing = await listAdminRecords('videos');
  for (const [index,video] of videos.entries()) {
    if (existing.some(row=>row.youtubeVideoId===video.youtubeVideoId || row.youtubeId===video.youtubeVideoId || row.slug===video.slug)) continue;
    const id=await saveAdminRecord('videos',undefined,{...video,youtubeId:video.youtubeVideoId,showOnHomepage:true,order:index+1,status:'published'});
    existing.push({...video,id});
  }
  const setting=(await listAdminRecords('settings')).find(row=>row.key==='videoSource');
  await saveAdminRecord('settings',setting?.id,{key:'videoSource',value:'library',status:'published'},setting);
  return existing;
}
