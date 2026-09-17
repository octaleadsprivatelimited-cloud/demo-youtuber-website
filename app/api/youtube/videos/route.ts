import { NextResponse } from 'next/server';
import { fetchChannelVideos } from '@/services/youtube-feed';

export const dynamic = 'force-dynamic';

export async function GET() {
  const videos = await fetchChannelVideos();
  return NextResponse.json({
    videos,
    channel: 'https://www.youtube.com/@Rjtractortechs',
    updatedAt: new Date().toISOString(),
  });
}
