export type Language = 'en' | 'te';
export const LANGUAGE_COOKIE = 'rj-language';
export const LANGUAGE_MAX_AGE = 30 * 24 * 60 * 60;
export function readLanguage(cookie: string): Language | null {
  const value = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(LANGUAGE_COOKIE + '='))?.split('=')[1];
  return value === 'en' || value === 'te' ? value : null;
}
export function languageCookie(language: Language) {
  return `${LANGUAGE_COOKIE}=${language}; Max-Age=${LANGUAGE_MAX_AGE}; Path=/; SameSite=Lax`;
}
