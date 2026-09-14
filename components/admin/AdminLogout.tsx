'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
export function AdminLogout() {
  const { logOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    setBusy(true); setError('');
    try { await logOut(); window.location.replace('/login'); }
    catch { setError('Unable to log out. Please try again.'); setBusy(false); }
  }
  return <div className="admin-logout"><button type="button" disabled={busy} onClick={logout}>{busy ? 'Logging out…' : 'Log out'}</button>{error && <p role="alert">{error}</p>}</div>;
}
