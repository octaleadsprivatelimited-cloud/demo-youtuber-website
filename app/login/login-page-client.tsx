'use client';
import { LocalizedElement } from '@/components/LocalizedElement';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export default function LoginPage() {
  const { configured, user, loading, signInGoogle, logOut } = useAuth();
  const access = useAdmin();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // If a non-admin signs in, immediately revoke session so no public user data is retained
  useEffect(() => {
    if (user && !access.loading && !access.isAdmin && !access.isEditor) {
      setError('Access restricted: Only the verified site owner can sign in. No user data is stored.');
      void logOut();
    }
  }, [user, access.loading, access.isAdmin, access.isEditor, logOut]);

  async function login() {
    setBusy(true); setError('');
    try {
      await signInGoogle();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in with Google. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell>
      <main className="auth-page admin-auth-page">
        <section>
          <LocalizedElement as="p">ADMINISTRATION ACCESS</LocalizedElement>
          <LocalizedElement as="h1">Admin Sign In</LocalizedElement>
          <LocalizedElement as="span">
            Authentication is restricted solely to the verified site owner. Public user registration and accounts are disabled.
          </LocalizedElement>
        </section>
        <div className="auth-card google-auth-card">
          {!configured && <SetupNotice message="Connect Firebase and enable Google sign-in to access the admin panel." />}
          {loading || (user && access.loading) ? (
            <div className="auth-status-loading" role="status">
              <span className="auth-spinner" aria-hidden="true" />
              Verifying owner access…
            </div>
          ) : user && (access.isAdmin || access.isEditor) ? (
            <div className="auth-success-box">
              <div className="auth-badge-owner">Verified Owner</div>
              <p className="auth-user-email">{user.email}</p>
              <a className="auth-admin-link" href={access.isAdmin ? '/admin' : '/admin/expert-reviews'}>
                Open Admin Dashboard →
              </a>
              <button type="button" className="auth-signout-button" onClick={() => logOut().catch(() => setError('Unable to sign out.'))}>
                Sign out
              </button>
            </div>
          ) : (
            <div className="auth-signin-action">
              <button
                type="button"
                className="google-tap-login-btn"
                disabled={!configured || busy}
                onClick={login}
                aria-label="Tap to sign in with Google"
              >
                <GoogleIcon />
                <span>{busy ? 'Connecting…' : 'Tap to sign in with Google'}</span>
              </button>
              <p className="auth-restricted-notice">
                🔒 Protected System · Single-Sign-On via Google · No passwords required
              </p>
            </div>
          )}
          {error && <p className="form-error auth-error-alert" role="alert">{error}</p>}
        </div>
      </main>
    </PublicShell>
  );
}
