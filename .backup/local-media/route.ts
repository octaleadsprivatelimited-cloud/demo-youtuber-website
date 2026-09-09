import { localJson, localMedia, requireLocalRequest } from '@/lib/local-cms-server';
export async function POST(request: Request) {
  try { requireLocalRequest(request); } catch { return localJson({ error: 'Unavailable' }, 403); }
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || !file.size || file.size > 8 * 1024 * 1024) return localJson({ error: 'Choose an image smaller than 8 MB.' }, 400);
    const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
    const extension = extensions[file.type];
    if (!extension) return localJson({ error: 'Use a JPG, PNG, WebP, or GIF image.' }, 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const signature = file.type === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216
      : file.type === 'image/png' ? bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71
      : file.type === 'image/gif' ? String.fromCharCode(...bytes.slice(0, 3)) === 'GIF'
      : String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    if (!signature) return localJson({ error: 'The file is not a valid image.' }, 400);
    const key = crypto.randomUUID() + '.' + extension;
    await localMedia().put(key, bytes, { httpMetadata: { contentType: file.type } });
    return localJson({ url: '/api/local-media/' + key }, 201);
  } catch (error) { return localJson({ error: error instanceof Error ? error.message : 'Upload failed.' }, 500); }
}
