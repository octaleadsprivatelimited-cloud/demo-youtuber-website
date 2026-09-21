const productionOrigin = 'https://www.rjtractortechs.com';
export function siteOrigin(value = process.env.NEXT_PUBLIC_SITE_URL): string {
  try {
    const url = new URL(value?.trim() || productionOrigin);
    if (!['http:', 'https:'].includes(url.protocol) || ['localhost','127.0.0.1','[::1]'].includes(url.hostname)) return productionOrigin;
    return url.origin;
  } catch { return productionOrigin; }
}
