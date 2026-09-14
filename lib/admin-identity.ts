export const ADMIN_EMAIL = 'rakeshpatel0944@gmail.com';
export function isOwnerToken(token: {signInProvider?: string | null; claims: Record<string, unknown>}) {
  return token.signInProvider === 'google.com'
    && token.claims.email_verified === true
    && token.claims.email === ADMIN_EMAIL;
}
