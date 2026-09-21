/** Resolve an intentional local path or an external web destination. */
export function websiteLink(input: unknown): string {
  if (typeof input !== 'string') return '';
  const value = input.trim();
  if (!value || /[\\\s\u0000-\u001f]/.test(value)) return '';
  if (/^\/(?!\/)/.test(value)) return value;
  const candidate = /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]|$)/i.test(value) ? 'https://' + value : value;
  try {
    const url = new URL(candidate);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

export function youtubeVideoId(input: unknown): string {
  const value = String(input ?? '').trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  try {
    const url = new URL(websiteLink(value));
    if (!['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(url.hostname)) return '';
    const parts = url.pathname.split('/').filter(Boolean);
    const id = url.hostname === 'youtu.be' ? parts[0] : url.pathname === '/watch' ? url.searchParams.get('v') : ['shorts','embed','live'].includes(parts[0]) ? parts[1] : '';
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : '';
  } catch { return ''; }
}
