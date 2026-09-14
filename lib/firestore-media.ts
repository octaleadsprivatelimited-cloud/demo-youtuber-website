export const MAX_IMAGE_BYTES = 600 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export async function compressFirestoreImage(file: File): Promise<Blob> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Use a JPG, PNG, WebP, or GIF image.');
  if (!file.size) throw new Error('Choose a non-empty image.');
  if (file.size > 20 * 1024 * 1024) throw new Error('Choose an image smaller than 20 MB.');
  if (file.size <= MAX_IMAGE_BYTES) return file;
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error('This image could not be opened. Choose another image.'); });
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image compression is unavailable in this browser.');
    let scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    for (let step = 0; step < 10; step++) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.86, 0.72, 0.58]) {
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
        if (blob && blob.size > 0 && blob.size <= MAX_IMAGE_BYTES) return blob;
      }
      scale *= 0.75;
    }
    throw new Error('Unable to compress this image enough. Try a smaller image.');
  } finally { bitmap.close(); }
}

export async function encodeFirestoreImage(file: File) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Use a JPG, PNG, WebP, or GIF image.');
  const compressed = await compressFirestoreImage(file);
  const bytes = new Uint8Array(await compressed.arrayBuffer());
  const valid = compressed.type === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216
    : compressed.type === 'image/png' ? [137,80,78,71,13,10,26,10].every((value, index) => bytes[index] === value)
    : compressed.type === 'image/gif' ? ['GIF87a','GIF89a'].includes(String.fromCharCode(...bytes.slice(0,6)))
    : String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
  if (!valid) throw new Error('The file is not a valid image.');
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  return { data: btoa(binary), contentType: compressed.type, size: bytes.length };
}
