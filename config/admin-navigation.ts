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
    items: [section('hero-slides', true), section('homepage'), { href:'/admin/promotions', label:'Promotions' }],
  },
  {
    id: 'catalog', label: 'Tractor catalog',
    items: [section('tractors', true), section('brands', true), section('equipment'), section('dealers', true)],
  },
  {
    id: 'content', label: 'Articles & media',
    items: [section('expert-reviews', true), section('articles', true), section('videos', true), section('categories')],
  },
  {
    id: 'enquiries', label: 'Enquiries & audience',
    items: [{ href: '/admin/leads', label: 'Lead CRM', collection: 'leads', dashboard: true }, section('contact-messages'), section('subscribers')],
  },
];

adminNavigationGroups.push({id:'configuration',label:'Website configuration',items:[section('settings'),section('seo')]});

export const adminDashboardItems = adminNavigationGroups
  .flatMap(group => group.items)
  .filter((item): item is AdminNavigationItem & { collection: string } => Boolean(item.dashboard && item.collection));
