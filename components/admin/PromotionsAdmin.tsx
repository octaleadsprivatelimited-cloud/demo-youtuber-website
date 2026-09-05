'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { useState } from 'react';
import { AdminCrud } from './AdminCrud';
import { adminSections } from '@/config/admin-sections';
export function PromotionsAdmin({ initialType = 'banners' }: { initialType?: 'banners' | 'advertisements' }) {
  const [type, setType] = useState(initialType);
  return <><LocalizedElement as="div" className="cms-promotion-tabs" role="group" aria-label="Promotion type">
    <LocalizedElement as="button" type="button" aria-pressed={type === 'banners'} onClick={() => setType('banners')}>Campaign banners</LocalizedElement>
    <LocalizedElement as="button" type="button" aria-pressed={type === 'advertisements'} onClick={() => setType('advertisements')}>Sponsored advertisements</LocalizedElement>
  </LocalizedElement><AdminCrud key={type} section={{ ...adminSections[type], label: 'Promotions' }}/></>;
}


