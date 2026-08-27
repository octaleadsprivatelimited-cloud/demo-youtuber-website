'use client';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { getAdminCounts } from '@/services/admin';
import { adminDashboardItems } from '@/config/admin-navigation';

export default function AdminPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  useEffect(() => {
    getAdminCounts(adminDashboardItems.map(item => item.collection)).then(setCounts)
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Unable to load dashboard.'));
  }, []);
  return <AdminShell>
    <header className="admin-heading"><div><p>OPERATIONS</p><h1>Dashboard</h1><span>Homepage content first, followed by the catalog, articles, and enquiries.</span></div><a className="cta-primary" href="/admin/hero-slides">Manage hero slides</a></header>
    {error && <div className="admin-error">{error}</div>}
    <div className="admin-dashboard-grid">{adminDashboardItems.map(item => <a href={item.href} key={item.collection}>
      <span>{item.label}</span><strong>{counts[item.collection] ?? '—'}</strong><small>Manage {item.label.toLowerCase()} →</small>
    </a>)}</div>
    <section className="admin-panel admin-quick"><h2>Quick actions</h2><p>Manage homepage images and partner logos, then update your catalog and editorial content.</p>
      <div><a href="/admin/hero-slides">Manage hero slides</a><a href="/admin/partners">Update partner logos</a><a href="/admin/tractors">Add a tractor</a><a href="/admin/articles">Create an article</a><a href="/admin/leads">Review enquiries</a></div>
    </section>
  </AdminShell>;
}
