import { IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/firestore-media';
export async function GET(_request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  if (!/^[a-zA-Z0-9]{20}$/.test(id)) return new Response('Not found', {status: 404});
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!project) return new Response('Firebase is not configured', {status: 503});
  try {
    // Public Firestore reads are checked by the same rules as the browser SDK.
    const result = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/(default)/documents/media/${id}`);
    if (!result.ok) return new Response('Image unavailable', {status: result.status === 404 ? 404 : 503});
    const record = await result.json() as {fields?: Record<string, {stringValue?: string; integerValue?: string}>};
    const contentType = record.fields?.contentType?.stringValue ?? '';
    const data = record.fields?.data?.stringValue ?? '';
    if (!IMAGE_TYPES.includes(contentType) || !data || data.length > 819200) return new Response('Invalid image', {status: 502});
    const decoded = atob(data);
    if (decoded.length > MAX_IMAGE_BYTES || decoded.length !== Number(record.fields?.size?.integerValue)) return new Response('Invalid image', {status: 502});
    return new Response(Uint8Array.from(decoded, character => character.charCodeAt(0)), {headers: {
      'Content-Type': contentType, 'Content-Length': String(decoded.length),
      'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=3600',
    }});
  } catch { return new Response('Image unavailable', {status: 503}); }
}
