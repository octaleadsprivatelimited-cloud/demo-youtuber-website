import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import DealersPageContent from './dealers-page-client';

const pageMetadata: Metadata = {
  title: 'Dealers Directory | RJ Tractor Techs',
  description: 'Search and filter the verified dealer directory by brand, city, district and state.',
  alternates: {
    canonical: '/dealers',
  },
};
export async function generateMetadata() { return withSeoOverride('/dealers', pageMetadata); }

export default function DealersPage() {
  return <DealersPageContent />;
}
