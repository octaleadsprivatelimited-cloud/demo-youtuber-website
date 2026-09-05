import type { Metadata } from 'next';
import BrandPage from './brands-page-client';

export const metadata: Metadata = {
  title: 'Brands | RJ Tractor Techs',
  description: 'Browse manufacturers and open detailed profiles for published tractor brands.',
  alternates: { canonical: '/brands' },
};

export default function BrandsPage() {
  return <BrandPage />;
}
