import { localMedia, requireLocalRequest } from '@/lib/local-cms-server';
export async function GET(request: Request, context: { params: Promise<{ key: string }> }) {
  try { requireLocalRequest(request); } catch { return new Response('Unavailable', { status: 403 }); }
  const { key } = await context.params;
  if (!/^[a-f0-9-]{36}\.(png|jpg|webp|gif)$/.test(key)) return new Response('Not found', { status: 404 });
  const file = await localMedia().get(key);
  if (!file) return new Response('Not found', { status: 404 });
  return new Response(file.body, { headers: {
    'Content-Type': file.httpMetadata?.contentType ?? 'application/octet-stream',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'ETag': file.httpEtag,
  } });
}
