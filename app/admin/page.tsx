'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

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
    <header className="admin-heading"><LocalizedElement as="div"><LocalizedElement as="p">OPERATIONS</LocalizedElement><LocalizedElement as="h1">Dashboard</LocalizedElement><LocalizedElement as="span">Homepage content first, followed by the catalog, articles, and enquiries.</LocalizedElement></LocalizedElement><LocalizedElement as="a" className="cta-primary" href="/admin/hero-slides">Manage hero slides</LocalizedElement></header>
    {error && <LocalizedElement as="div" className="admin-error">{error}</LocalizedElement>}
    <LocalizedElement as="div" className="admin-dashboard-grid">{adminDashboardItems.map(item => <LocalizedElement as="a" href={item.href} key={item.collection}>
      <LocalizedElement as="span">{item.label}</LocalizedElement><LocalizedElement as="strong">{counts[item.collection] ?? '—'}</LocalizedElement><LocalizedElement as="small">Manage {item.label.toLowerCase()} →</LocalizedElement>
    </LocalizedElement>)}</LocalizedElement>
    <section className="admin-panel admin-quick"><LocalizedElement as="h2">Quick actions</LocalizedElement><LocalizedElement as="p">Manage homepage images and partner logos, then update your catalog and editorial content.</LocalizedElement>
      <LocalizedElement as="div"><LocalizedElement as="a" href="/admin/hero-slides">Manage hero slides</LocalizedElement><LocalizedElement as="a" href="/admin/partners">Update partner logos</LocalizedElement><LocalizedElement as="a" href="/admin/tractors">Add a tractor</LocalizedElement><LocalizedElement as="a" href="/admin/articles">Create an article</LocalizedElement><LocalizedElement as="a" href="/admin/leads">Review enquiries</LocalizedElement></LocalizedElement>
    </section>
  </AdminShell>;
}
