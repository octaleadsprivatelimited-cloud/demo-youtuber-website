'use client';

import { useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

const links = [
  ['Home', '/'], ['Tractors', '/tractors'], ['Brands', '/brands'], ['Reviews', '/reviews'],
  ['Compare', '/compare'], ['Prices', '/tractor-price'], ['Equipment', '/equipment'],
  ['Agriculture', '/articles'], ['Videos', '/videos'], ['Dealers', '/dealers'],
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return <>
    <div className="topbar"><p>India&apos;s independent tractor research &amp; farming media platform</p><a href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">Watch on YouTube ↗</a></div>
    <header className="site-header">
      <a className="brand" href="/"><span className="brand-mark">RJ</span><span className="brand-copy"><strong>Tractor Techs</strong><small>Reviews · Specs · Farming</small></span></a>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
      <div className="header-actions"><a className="round-action" href="/tractors" aria-label="Search">⌕</a><a className="round-action desktop-only" href={user ? '/account' : '/login'} aria-label={user ? 'Account' : 'Sign in'}>{user ? '●' : '♙'}</a><button aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button></div>
    </header>
    {open && <nav className="mobile-nav" aria-label="Mobile navigation">{links.map(([label, href]) => <a key={href} href={href}>{label}<span>→</span></a>)}<a href={user ? '/account' : '/login'}>{user ? 'My account' : 'Sign in'}<span>→</span></a></nav>}
  </>;
}

export function SiteFooter() {
  return <footer><div className="footer-main"><div className="footer-brand"><a className="brand" href="/"><span className="brand-mark">RJ</span><span className="brand-copy"><strong>Tractor Techs</strong><small>Reviews · Specs · Farming</small></span></a><p>Independent tractor information and practical farming knowledge, made easier to explore.</p></div><div><h4>Research</h4>{links.slice(1,6).map(([label,href]) => <a key={href} href={href}>{label}</a>)}</div><div><h4>Learn</h4>{links.slice(6).map(([label,href]) => <a key={href} href={href}>{label}</a>)}</div><div><h4>Company</h4>{[['About','/about'],['Contact','/contact'],['Privacy','/privacy-policy'],['Terms','/terms-and-conditions']].map(([label,href]) => <a key={href} href={href}>{label}</a>)}</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} RJ Tractor Techs.</span><a href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">Subscribe on YouTube ↗</a></div></footer>;
}

export function PublicShell({ children }: { children: ReactNode }) {
  return <><SiteHeader />{children}<SiteFooter /></>;
}

