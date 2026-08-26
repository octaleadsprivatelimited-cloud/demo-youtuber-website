'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { isFavourite, toggleFavourite, type FavouriteRecord } from '@/services/phase-three';

export function FavouriteButton({ itemId, itemType, title, href, image, compact = false }: Omit<FavouriteRecord, 'id'|'userId'|'createdAt'> & { compact?: boolean }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (user && isFirebaseConfigured) isFavourite(user.uid,itemType,itemId).then(setSaved).catch(() => undefined); }, [user,itemId,itemType]);
  async function toggle() {
    if (!user) { window.location.href = '/login'; return; }
    setBusy(true);
    try { setSaved(await toggleFavourite({ userId:user.uid,itemId,itemType,title,href,image })); }
    finally { setBusy(false); }
  }
  return <button className={compact ? 'favourite-button compact' : 'favourite-button'} onClick={toggle} disabled={busy} aria-pressed={saved}>{saved ? '♥ Saved' : '♡ Favourite'}</button>;
}

