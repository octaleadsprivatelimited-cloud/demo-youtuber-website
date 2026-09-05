import type { Metadata } from 'next';
import DealersPageContent from './dealers-page-client';

export const metadata: Metadata = {
  title: 'Dealers Directory | RJ Tractor Techs',
  description: 'Search and filter the verified dealer directory by brand, city, district and state.',
  alternates: {
    canonical: '/dealers',
  },
};

export default function DealersPage() {
  return <DealersPageContent />;
}
