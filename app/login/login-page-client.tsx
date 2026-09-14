'use client';
import { LocalizedElement } from '@/components/LocalizedElement';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';

export default function LoginPage() {
  const { configured, user, loading, signInGoogle, logOut } = useAuth();
  const access = useAdmin();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function login() {
    setBusy(true); setError('');
    try { await signInGoogle(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in with Google. Please try again.'); }
    finally { setBusy(false); }
  }
  return <PublicShell><main className="auth-page">
    <section><LocalizedElement as="p">EDITORIAL ADMINISTRATION</LocalizedElement>
      <LocalizedElement as="h1">Admin panel sign in.</LocalizedElement>
      <LocalizedElement as="span">Sign in with the site owner’s Google account to manage website content.</LocalizedElement></section>
    <div className="auth-card">
      {!configured && <SetupNotice message="Connect Firebase and enable Google sign-in to access the admin panel." />}
      {loading || (user && access.loading) ? <p role="status">Checking admin access…</p> : user ? <>
        <p>{user.email}</p>
        {access.isAdmin || access.isEditor ? <a href={access.isAdmin ? '/admin' : '/admin/expert-reviews'}>Open admin panel →</a> : <p role="alert">This Google account does not have admin access. Contact the site owner or use an authorized account.</p>}
        <button type="button" onClick={() => logOut().catch(() => setError('Unable to sign out. Please try again.'))}>Sign out</button>
      </> : <button type="button" className="google-button" disabled={!configured || busy} onClick={login}>{busy ? 'Signing in…' : 'Continue with Google'}</button>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  </main></PublicShell>;
}
