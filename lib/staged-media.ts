import { encodeFirestoreImage } from './firestore-media';
type ImageData = Awaited<ReturnType<typeof encodeFirestoreImage>>;
const pending = new Map<string, ImageData>();
export async function stageAdminImage(file: File) {
  const data = await encodeFirestoreImage(file);
  const url = URL.createObjectURL(new Blob([Uint8Array.from(atob(data.data), c => c.charCodeAt(0))], {type:data.contentType}));
  pending.set(url, data);
  return url;
}
export function stagedImage(url: string) { return pending.get(url); }
export function releaseStagedImage(url: string) {
  if (pending.delete(url)) URL.revokeObjectURL(url);
}
export function mediaIds(value: unknown): Set<string> {
  const found = new Set<string>();
  function visit(item: unknown) {
    if (typeof item === 'string') {
      for (const match of item.matchAll(/\/api\/media\/([a-zA-Z0-9]{20})(?![a-zA-Z0-9])/g)) found.add(match[1]);
    } else if (Array.isArray(item)) item.forEach(visit);
    else if (item && typeof item === 'object') Object.values(item).forEach(visit);
  }
  visit(value); return found;
}
