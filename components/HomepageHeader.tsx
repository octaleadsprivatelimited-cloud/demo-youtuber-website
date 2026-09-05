'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LanguageButton } from './LanguageProvider';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const navigation = [['Reviews', '/reviews'], ['New tractors', '/new-tractors'], ['Used tractors', '/tractors?condition=used'], ['Brands', '/brands'], ['Farm equipment', '/equipment'], ['Compare', '/compare'], ['EMI calculator', '/emi-calculator'], ['Showrooms', '/dealers'], ['News & updates', '/news'], ['Videos', '/videos']];
export function HomepageHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const settings = useSiteSettings();
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);
  return <header className="ref-home-header">
    <LocalizedElement as="div" className="ref-home-header-inner">
      <LocalizedElement as="a" className="ref-home-brand" href="/" aria-label={settings.websiteName || 'RJ Tractor Techs'}>
        {settings.logo ? <LocalizedElement as="img" src={settings.logo} alt="" className="ref-home-brand-image"/> : <LocalizedElement as="span" className="ref-home-brand-mark">RJ</LocalizedElement>}
        <LocalizedElement as="strong">{(settings.websiteName || 'RJ Tractor Techs').replace(/^RJ\s+/, '')}</LocalizedElement>
      </LocalizedElement>
      <LocalizedElement as="div" className="ref-home-collaborate"><LocalizedElement as="a" href="/contact">Collaborate</LocalizedElement></LocalizedElement>
      <nav className="ref-home-navigation" aria-label="Main navigation">{navigation.map(([label, href]) => <LocalizedElement as="a" href={href} key={href}>{label}</LocalizedElement>)}</nav>
      <LocalizedElement as="div" className="ref-home-header-actions">
        <LanguageButton/>
        <LocalizedElement as="a" className="ref-home-header-primary" href="/tractors">Explore tractors</LocalizedElement>
        <LocalizedElement as="button" ref={toggle} className="ref-home-menu-toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="homepage-mobile-menu" onClick={() => setOpen(value => !value)}><LocalizedElement as="img" src={'/icons/tabler/' + (open ? 'x' : 'menu-2') + '.svg'} alt="" width={23} height={23}/></LocalizedElement>
      </LocalizedElement>
    </LocalizedElement>
    <AnimatePresence>
      {open && <motion.nav
        key="mobile-navigation"
        id="homepage-mobile-menu"
        className="ref-home-mobile-navigation"
        aria-label="Mobile navigation"
        initial={{ opacity: 0, y: reduceMotion ? 0 : -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 30 }}
      >{[...navigation, ['Articles', '/articles']].map(([label, href]) => <LocalizedElement as="a" key={href} href={href} onClick={() => setOpen(false)}>{label}<LocalizedElement as="img" src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></LocalizedElement>)}</motion.nav>}
    </AnimatePresence>
  </header>;
}
