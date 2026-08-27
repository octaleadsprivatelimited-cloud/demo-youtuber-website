import { adminSections } from './admin-sections';

type AdminNavigationItem = {
  href: string;
  label: string;
  collection?: string;
  dashboard?: boolean;
};
function section(key: string, dashboard = false): AdminNavigationItem {
  const item = adminSections[key];
  return { href: '/admin/' + key, label: item.label, collection: item.collection, dashboard };
}

export const adminNavigationGroups: { id: string; label: string; items: AdminNavigationItem[] }[] = [
  {
    id: 'homepage', label: 'Homepage & promotions',
    items: [section('hero-slides', true), section('partners', true), section('homepage'), { href:'/admin/promotions', label:'Promotions' }],
  },
  {
    id: 'catalog', label: 'Tractor catalog',
    items: [section('tractors', true), section('brands', true), section('equipment'), section('dealers', true)],
  },
  {
    id: 'content', label: 'Articles & reviews',
    items: [section('articles', true), section('videos'), section('expert-reviews'), section('reviews', true), section('categories')],
  },
  {
    id: 'enquiries', label: 'Enquiries & audience',
    items: [{ href: '/admin/leads', label: 'Lead CRM', collection: 'leads', dashboard: true }, section('contact-messages')],
  },
  {
    id: 'administration', label: 'Site administration',
    items: [{ href: '/admin/analytics', label: 'Analytics' }, section('seo'), { href: '/admin/users', label: 'Users', collection: 'users', dashboard: true }, section('settings')],
  },
];

export const adminDashboardItems = adminNavigationGroups
  .flatMap(group => group.items)
  .filter((item): item is AdminNavigationItem & { collection: string } => Boolean(item.dashboard && item.collection));
