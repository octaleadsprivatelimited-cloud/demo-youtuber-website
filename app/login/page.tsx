'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';

export default function LoginPage() {
  const { configured, user, signInEmail, registerEmail, signInGoogle, logOut } = useAuth();
  const [mode, setMode] = useState<'signin'|'register'>('signin');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { if (mode === 'signin') await signInEmail(email,password); else await registerEmail(email,password); window.location.href='/account'; }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Authentication failed.'); }
    finally { setBusy(false); }
  }
  return <PublicShell><main className="auth-page"><section><p>RJ TRACTOR TECHS ACCOUNT</p><h1>Save tractors and keep your research together.</h1><span>Sign in to manage favourites, submitted reviews and enquiries.</span></section>{!configured ? <SetupNotice message="Add the Firebase project variables and enable Email/Password or Google sign-in in Firebase Authentication." /> : user ? <div className="auth-card"><h2>You&apos;re signed in</h2><p>{user.email}</p><a href="/account">Open my account →</a><button onClick={logOut}>Sign out</button></div> : <div className="auth-card"><div className="auth-tabs"><button className={mode==='signin'?'active':''} onClick={() => setMode('signin')}>Sign in</button><button className={mode==='register'?'active':''} onClick={() => setMode('register')}>Create account</button></div><button className="google-button" onClick={() => signInGoogle().catch(reason => setError(reason.message))}>G&nbsp; Continue with Google</button><div className="or"><span>or use email</span></div><form onSubmit={submit}><label>Email address<input type="email" required value={email} onChange={event => setEmail(event.target.value)} /></label><label>Password<input type="password" minLength={6} required value={password} onChange={event => setPassword(event.target.value)} /></label>{error && <p className="form-error">{error}</p>}<button disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in →' : 'Create account →'}</button></form></div>}</main></PublicShell>;
}

