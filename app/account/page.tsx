'use client';

import {isLocalDemo,auth} from '@/lib/firebase/client';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { useAuth } from '@/hooks/useAuth';

export default function AccountPage() {
  const localPreview=isLocalDemo&&!auth;
  const { user, loading, configured, logOut } = useAuth();
  return <PublicShell><main className="account-page"><div className="page-hero"><p>MY ACCOUNT</p><h1>Your tractor research</h1><span>Return to saved models, read your submitted reviews and send an enquiry.</span></div>{!configured ? <SetupNotice /> : loading ? <div className="detail-loading">Loading your account…</div> : !user ? <div className="empty-state"><h3>Sign in to view your account.</h3><a href="/login">Sign in →</a></div> : <section className="account-panel"><aside><div className="avatar">{(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}</div><strong>{user.displayName ?? 'RJ Tractor Techs member'}</strong><span>{user.email}</span><nav><a className="active" href="/account">Overview</a><a href="/account/favourites">Favourites</a><a href="/account/reviews">My reviews</a><a href="/account/enquiries">Enquiries</a></nav><button onClick={logOut} disabled={localPreview}>{localPreview?'Local preview account':'Sign out'}</button></aside><div><p>ACCOUNT OVERVIEW</p><h2>Welcome back.</h2><div className="account-cards"><a href="/account/favourites"><strong>♡</strong><span>Saved tractors</span><small>View favourites →</small></a><a href="/compare"><strong>⇄</strong><span>Compare tractors</span><small>Start comparing →</small></a><a href="/tractors"><strong>⌕</strong><span>Continue research</span><small>Browse tractors →</small></a><a href="/account/reviews"><strong>☆</strong><span>My reviews</span><small>View submissions →</small></a><a href="/account/enquiries"><strong>↗</strong><span>Send an enquiry</span><small>Ask a question →</small></a></div></div></section>}</main></PublicShell>;
}

