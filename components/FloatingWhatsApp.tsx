'use client';

import { usePathname } from 'next/navigation';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import './floating-whatsapp.css';

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  const raw = (settings.whatsapp || '').trim();
  const number = raw.replace(/[+\s().-]/g, '');
  if (/^\/(admin|account|login)(\/|$)/.test(pathname) || !/^[1-9]\d{7,14}$/.test(number)) return null;

  return <a className="floating-whatsapp" href={`https://wa.me/${number}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" title="Chat with us on WhatsApp">
    {/* Official, unmodified digital glyph from Meta's WhatsApp Brand Resource Center. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/icons/whatsapp.svg" width={34} height={34} alt="" />
  </a>;
}
