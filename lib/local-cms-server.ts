import { env } from 'cloudflare:workers';
import { localCmsSchema } from '@/db/schema';

export function requireLocalRequest(request: Request) {
  void request;
  throw new Error('Local CMS is disabled. This website uses Firebase.');
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
