import { env } from 'cloudflare:workers';
import { localCmsSchema } from '@/db/schema';

export function requireLocalRequest(request: Request) {
  const url = new URL(request.url);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (process.env.NODE_ENV !== 'development' || !local) {
    throw new Error('Local CMS is available only on the development server.');
  }
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) throw new Error('Cross-origin request rejected.');
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') throw new Error('Cross-origin request rejected.');
}

export async function localDatabase() {
  const database = (env as unknown as { LOCAL_CMS_DB?: D1Database }).LOCAL_CMS_DB;
  if (!database) throw new Error('Local content storage is unavailable. Restart the development server.');
  await database.prepare(localCmsSchema).run();
  return database;
}

export function localMedia() {
  const bucket = (env as unknown as { LOCAL_CMS_MEDIA?: R2Bucket }).LOCAL_CMS_MEDIA;
  if (!bucket) throw new Error('Local image storage is unavailable. Restart the development server.');
  return bucket;
}

export function localJson(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}
