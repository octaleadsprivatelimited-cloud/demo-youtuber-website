import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import TractorsPageClient from './tractors-page-client';

const pageMetadata: Metadata = {
  title: 'Tractors | RJ Tractor Techs',
  description:
    'Search the published tractor catalog, apply filters and open model details for specs, pricing and comparisons.',
  alternates: { canonical: '/tractors' },
};
export async function generateMetadata() { return withSeoOverride('/tractors', pageMetadata); }

export default function TractorsPage() {
  return <TractorsPageClient />;
}
