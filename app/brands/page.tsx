import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import BrandPage from './brands-page-client';

const pageMetadata: Metadata = {
  title: 'Brands | RJ Tractor Techs',
  description: 'Browse manufacturers and open detailed profiles for published tractor brands.',
  alternates: { canonical: '/brands' },
};
export async function generateMetadata() { return withSeoOverride('/brands', pageMetadata); }

export default function BrandsPage() {
  return <BrandPage />;
}
