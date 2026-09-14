'use client';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { isOwnerToken } from '@/lib/admin-identity';
export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [access, setAccess] = useState<{uid: string; role: string | null} | null>(null);
  useEffect(() => {
    let cancelled = false;
    setAccess(null);
    if (authLoading || !user) return;
    const currentUser = user;
    async function load() {
      let role: string | null = null;
      try {
        const token = await currentUser.getIdTokenResult();
        if (isOwnerToken(token)) role = 'Super Admin';
      } catch { /* Access fails closed when authorization cannot be checked. */ }
      if (!cancelled) setAccess({uid: currentUser.uid, role});
    }
    void load();
    return () => { cancelled = true; };
  }, [user, authLoading]);
  const resolved = !!user && access?.uid === user.uid;
  const role = resolved ? access.role : null;
  return {user, role, loading: authLoading || (!!user && !resolved), isEditor: role === 'Editor', isAdmin: role === 'Admin' || role === 'Super Admin'};
}
