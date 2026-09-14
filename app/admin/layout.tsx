'use client';
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminLogout } from '@/components/admin/AdminLogout';
import { SetupNotice } from '@/components/SetupNotice';
import './admin-repair.css';

// Gate the route itself: page effects must not run before authentication restores.
export default function AdminLayout({children}: {children: ReactNode}) {
  const access = useAdmin();
  const [attempt, setAttempt] = useState(0);
  const [check, setCheck] = useState<{uid: string; error: string | null} | null>(null);
  const uid = access.user?.uid;
  useEffect(() => {
    let cancelled = false;
    setCheck(null);
    if (access.loading || !access.isAdmin || !uid) return;
    async function verify() {
      try {
        const user = auth?.currentUser;
        if (!user || user.uid !== uid || !db) throw new Error('Please sign in again.');
        const token = await user.getIdToken();
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/tractors?pageSize=1`, {headers:{Authorization:'Bearer '+token}, signal:AbortSignal.timeout(20000)});
        if (!response.ok) throw Object.assign(new Error('Firestore access failed'), {code:response.status === 403 ? 'permission-denied' : 'unavailable'});
        if (!cancelled) setCheck({uid: user.uid, error: null});
      } catch (error) {
        const code = (error as {code?: string}).code;
        const message = code === 'permission-denied' || code === 'firestore/permission-denied'
          ? 'Firestore is denying this owner account. Publish the latest Firestore rules for rj-tractor-techs, including the owner email check, then retry.'
          : 'Unable to connect to Firestore. Check your connection and retry.';
        if (!cancelled) setCheck({uid: uid!, error: message});
      }
    }
    void verify();
    return () => { cancelled = true; };
  }, [uid, access.loading, access.isAdmin, attempt]);
  if (!isFirebaseConfigured) return <main className="admin-gate"><SetupNotice /></main>;
  if (access.loading) return <main className="admin-gate" role="status">Checking admin access…</main>;
  if (!access.user) return <main className="admin-gate"><h1>Admin sign-in required</h1><Link href="/login">Sign in with Google</Link></main>;
  if (!access.isAdmin) return <main className="admin-gate"><h1>Access restricted</h1><p>This Google account is not authorized to access the admin panel.</p><AdminLogout /></main>;
  if (!check || check.uid !== uid) return <main className="admin-gate"><p role="status">Connecting to Firestore…</p><AdminLogout /></main>;
  if (check.error) return <main className="admin-gate"><h1>Database access unavailable</h1><p role="alert">{check.error}</p><p>Signed in as {access.user.email}</p><button type="button" onClick={() => {setCheck(null); setAttempt(value => value + 1);}}>Retry connection</button><AdminLogout /></main>;
  return children;
}
