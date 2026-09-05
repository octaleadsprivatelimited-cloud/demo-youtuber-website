'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { isLocalDemo, auth } from '@/lib/firebase/client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';

export default function LoginPage() {
  const localPreview = isLocalDemo && !auth;
  const { configured, user, signInEmail, signInGoogle, logOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signInEmail(email, password);
      window.location.href = '/admin';
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell>
      <main className="auth-page">
        <section>
          <LocalizedElement as="p">EDITORIAL ADMINISTRATION</LocalizedElement>
          <LocalizedElement as="h1">Admin panel sign in.</LocalizedElement>
          <LocalizedElement as="span">Authorized team members can manage tractors, reviews, videos and website content.</LocalizedElement>
        </section>
        {!configured ? (
          <SetupNotice message="Add the Firebase project variables and enable Email/Password or Google sign-in in Firebase Authentication." />
        ) : user ? (
          <LocalizedElement as="div" className="auth-card">
            <LocalizedElement as="h2">You&apos;re signed in</LocalizedElement>
            <LocalizedElement as="p">{localPreview ? 'You are using the local preview account. Real sign-in will be available when account access is connected.' : user.email}</LocalizedElement>
            <LocalizedElement as="a" href="/admin">Open admin panel →</LocalizedElement>
            <LocalizedElement as="button" onClick={logOut} disabled={localPreview}>Sign out</LocalizedElement>
          </LocalizedElement>
        ) : (
          <LocalizedElement as="div" className="auth-card">
            <LocalizedElement as="button" className="google-button" onClick={() => signInGoogle().catch((reason) => setError(reason.message))}>
              G&nbsp; Continue with Google
            </LocalizedElement>
            <LocalizedElement as="div" className="or">
              <LocalizedElement as="span">or use email</LocalizedElement>
            </LocalizedElement>
            <form onSubmit={submit}>
              <LocalizedElement as="label">
                Email address
                <LocalizedElement as="input"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </LocalizedElement>
              <LocalizedElement as="label">
                Password
                <LocalizedElement as="input"
                  type="password"
                  autoComplete="current-password"
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </LocalizedElement>
              {error && <LocalizedElement as="p" className="form-error">{error}</LocalizedElement>}
              <LocalizedElement as="button" disabled={busy}>{busy ? 'Please wait…' : 'Sign in →'}</LocalizedElement>
            </form>
          </LocalizedElement>
        )}
      </main>
    </PublicShell>
  );
}
