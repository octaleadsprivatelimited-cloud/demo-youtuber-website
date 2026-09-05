'use client';
import { LanguageButton } from '@/components/LanguageProvider';
import { LocalizedElement } from '@/components/LocalizedElement';

import '@/app/admin/admin-repair.css';
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured, isLocalDemo, db } from '@/lib/firebase/client';
import { adminNavigationGroups } from '@/config/admin-navigation';

export function AdminShell({ children }: { children: ReactNode }) {
  const access = useAdmin();
  const currentPath = usePathname();
  const path=['/admin/banners','/admin/advertisements'].includes(currentPath)?'/admin/promotions':currentPath;
  const [menuOpen, setMenuOpen] = useState(false);
  const demo = isLocalDemo && !db;
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  if (!demo && !isFirebaseConfigured) return <main className="crm-page"><SetupNotice/></main>;
  if (!demo && access.loading) return <LocalizedElement as="div" className="detail-loading">Checking admin access…</LocalizedElement>;
  if (!demo && !access.user) return <main className="admin-gate"><LocalizedElement as="h1">Admin sign-in required</LocalizedElement><Link href="/login">Sign in →</Link></main>;
  if (!demo && !access.isAdmin && !(access.isEditor && path === '/admin/expert-reviews')) return <main className="admin-gate"><LocalizedElement as="h1">Access restricted</LocalizedElement><LocalizedElement as="p">This section is restricted to administrators. Editorial team members can manage reviews.</LocalizedElement><Link href="/admin/expert-reviews">Editorial reviews</Link><Link href="/">Return to website</Link></main>;

  function navLink(href: string, label: string) {
    return <Link key={href} className={path === href ? 'active' : ''} href={href}
      aria-current={path === href ? 'page' : undefined} prefetch onClick={() => setMenuOpen(false)}><LocalizedElement as="span">{label}</LocalizedElement></Link>;
  }
  return <main className={'crm-page admin-workspace ' + (menuOpen ? 'sidebar-open' : '')}>
    <LocalizedElement as="button" className="admin-mobile-toggle" type="button" aria-label={menuOpen ? 'Close admin navigation' : 'Open admin navigation'}
      aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '×' : '☰'}</LocalizedElement>
    {menuOpen && <LocalizedElement as="button" className="admin-nav-backdrop" type="button" aria-label="Close admin navigation" onClick={() => setMenuOpen(false)}/>}
    <aside className="crm-sidebar">
      <LanguageButton/>
      <Link className="brand" href="/" onClick={() => setMenuOpen(false)}><LocalizedElement as="span" className="brand-mark">RJ</LocalizedElement><LocalizedElement as="span" className="brand-copy"><LocalizedElement as="strong">Admin</LocalizedElement><LocalizedElement as="small">TRACTOR TECHS</LocalizedElement></LocalizedElement></Link>
      <nav id="admin-navigation" aria-label="Admin navigation">
        {!access.isEditor && navLink('/admin', 'Overview')}
        {adminNavigationGroups.filter(group => !access.isEditor || group.id === 'content').map(group => <LocalizedElement as="div" className="admin-nav-group" key={group.id} role="group" aria-labelledby={'admin-nav-' + group.id}>
          <LocalizedElement as="p" className="admin-nav-label" id={'admin-nav-' + group.id}>{group.label}</LocalizedElement>
          {group.items.filter(item => !access.isEditor || item.href === '/admin/expert-reviews').map(item => navLink(item.href, item.label))}
        </LocalizedElement>)}
        <LocalizedElement as="div" className="admin-nav-website">{navLink('/', 'View website ↗')}</LocalizedElement>
      </nav>
      <LocalizedElement as="div"><LocalizedElement as="span">{demo ? 'Local preview' : 'Signed in as'}</LocalizedElement><LocalizedElement as="strong">{demo ? 'Demo administrator' : access.user?.email}</LocalizedElement><LocalizedElement as="small">{demo ? 'Local development only' : access.role}</LocalizedElement></LocalizedElement>
    </aside>
    <section className="crm-main" key={path}>{demo && <LocalizedElement as="div" className="demo-bar">Local workspace · content and uploads are saved on this computer</LocalizedElement>}{children}</section>
  </main>;
}
