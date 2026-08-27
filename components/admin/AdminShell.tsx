'use client';
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
  if (!demo && access.loading) return <div className="detail-loading">Checking admin access…</div>;
  if (!demo && !access.user) return <main className="admin-gate"><h1>Admin sign-in required</h1><Link href="/login">Sign in →</Link></main>;
  if (!demo && !access.isAdmin) return <main className="admin-gate"><h1>Access restricted</h1><p>Your account does not have an active administrator role.</p><Link href="/">Return to website</Link></main>;

  function navLink(href: string, label: string) {
    return <Link key={href} className={path === href ? 'active' : ''} href={href}
      aria-current={path === href ? 'page' : undefined} prefetch onClick={() => setMenuOpen(false)}>{label}</Link>;
  }
  return <main className={'crm-page admin-workspace ' + (menuOpen ? 'sidebar-open' : '')}>
    <button className="admin-mobile-toggle" type="button" aria-label={menuOpen ? 'Close admin navigation' : 'Open admin navigation'}
      aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '×' : '☰'}</button>
    {menuOpen && <button className="admin-nav-backdrop" type="button" aria-label="Close admin navigation" onClick={() => setMenuOpen(false)}/>}
    <aside className="crm-sidebar">
      <Link className="brand" href="/" onClick={() => setMenuOpen(false)}><span className="brand-mark">RJ</span><span className="brand-copy"><strong>Admin</strong><small>TRACTOR TECHS</small></span></Link>
      <nav id="admin-navigation" aria-label="Admin navigation">
        {navLink('/admin', 'Overview')}
        {adminNavigationGroups.map(group => <div className="admin-nav-group" key={group.id} role="group" aria-labelledby={'admin-nav-' + group.id}>
          <p className="admin-nav-label" id={'admin-nav-' + group.id}>{group.label}</p>
          {group.items.map(item => navLink(item.href, item.label))}
        </div>)}
        <div className="admin-nav-website">{navLink('/', 'View website ↗')}</div>
      </nav>
      <div><span>{demo ? 'Local preview' : 'Signed in as'}</span><strong>{demo ? 'Demo administrator' : access.user?.email}</strong><small>{demo ? 'Local development only' : access.role}</small></div>
    </aside>
    <section className="crm-main" key={path}>{demo && <div className="demo-bar">Local workspace · content and uploads are saved on this computer</div>}{children}</section>
  </main>;
}
