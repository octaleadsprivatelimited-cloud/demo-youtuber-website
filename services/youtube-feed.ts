export interface YouTubeFeedVideo {
  id: string;
  slug: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  thumbnail: string;
  publishedAt: string;
  category: string;
  status: 'published';
  channelUrl: string;
  [key: string]: unknown;
}

const CHANNEL_ID = 'UCcWOjB3K7_q563uwk337uJA';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

function slugify(title: string, videoId: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 75);
  return base ? `${base}-${videoId}` : videoId;
}

function parseXmlEntries(xml: string): YouTubeFeedVideo[] {
  const entries = xml.split('<entry>').slice(1);
  const videos: YouTubeFeedVideo[] = [];

  for (const entry of entries) {
    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
    const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);
    const thumbMatch = entry.match(/<media:thumbnail[^>]*url="([^"]+)"/);

    const videoId = videoIdMatch?.[1]?.trim();
    const title = titleMatch?.[1]?.trim() ?? 'RJ Tractor Techs Video';
    const publishedAt = publishedMatch?.[1]?.trim() ?? new Date().toISOString();

    if (!videoId) continue;

    const thumbnail = thumbMatch?.[1] ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const description = (descMatch?.[1]?.trim() || title).slice(0, 300);

    videos.push({
      id: `yt-${videoId}`,
      slug: slugify(title, videoId),
      youtubeVideoId: videoId,
      title,
      description,
      thumbnail,
      publishedAt,
      category: 'RJ Tractor Techs',
      status: 'published',
      channelUrl: `https://www.youtube.com/@Rjtractortechs`,
    });
  }

  return videos;
}

export async function fetchChannelVideos(): Promise<YouTubeFeedVideo[]> {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate: 300 }, // Cache for 5 minutes in Next.js
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RJTractorTechsBot/1.0)',
      },
    });
    if (!res.ok) {
      return [];
    }
    const xml = await res.text();
    return parseXmlEntries(xml);
  } catch {
    return [];
  }
}
