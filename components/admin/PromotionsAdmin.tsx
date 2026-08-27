'use client';
import { useState } from 'react';
import { AdminCrud } from './AdminCrud';
import { adminSections } from '@/config/admin-sections';
export function PromotionsAdmin({ initialType = 'banners' }: { initialType?: 'banners' | 'advertisements' }) {
  const [type, setType] = useState(initialType);
  return <><div className="cms-promotion-tabs" role="group" aria-label="Promotion type">
    <button type="button" aria-pressed={type === 'banners'} onClick={() => setType('banners')}>Campaign banners</button>
    <button type="button" aria-pressed={type === 'advertisements'} onClick={() => setType('advertisements')}>Sponsored advertisements</button>
  </div><AdminCrud key={type} section={{ ...adminSections[type], label: 'Promotions' }}/></>;
}


