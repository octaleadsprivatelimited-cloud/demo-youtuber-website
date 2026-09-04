'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { HeaderSearch } from './HeaderSearch';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useAuth } from '@/hooks/useAuth';

const navigation = [['Reviews', '/reviews'], ['New tractors', '/new-tractors'], ['Used tractors', '/tractors?condition=used'], ['Brands', '/brands'], ['Farm equipment', '/equipment'], ['Compare', '/compare'], ['EMI calculator', '/emi-calculator'], ['Showrooms', '/dealers'], ['News & updates', '/news'], ['Videos', '/videos']];
export function HomepageHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const settings = useSiteSettings();
  const { user } = useAuth();
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);
  return <header className="ref-home-header">
    <div className="ref-home-header-inner">
      <a className="ref-home-brand" href="/" aria-label={settings.websiteName || 'RJ Tractor Techs'}>
        {settings.logo ? <img src={settings.logo} alt="" className="ref-home-brand-image"/> : <span className="ref-home-brand-mark">RJ</span>}
        <strong>{(settings.websiteName || 'RJ Tractor Techs').replace(/^RJ\s+/, '')}</strong>
      </a>
      <div className="ref-home-search"><HeaderSearch wide onOpen={() => setOpen(false)}/></div>
      <nav className="ref-home-navigation" aria-label="Main navigation">{navigation.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
      <div className="ref-home-header-actions">
        <a className="ref-home-header-primary" href="/tractors">Explore tractors</a>
        <a className="ref-home-account" href={user ? '/account' : '/login'}>{user ? 'My account' : 'Sign in'}</a>
        <button ref={toggle} className="ref-home-menu-toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="homepage-mobile-menu" onClick={() => setOpen(value => !value)}><img src={'/icons/tabler/' + (open ? 'x' : 'menu-2') + '.svg'} alt="" width={23} height={23}/></button>
      </div>
    </div>
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
      >{[...navigation, ['Articles', '/articles'], [user ? 'My account' : 'Sign in', user ? '/account' : '/login']].map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}<img src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></a>)}</motion.nav>}
    </AnimatePresence>
  </header>;
}
