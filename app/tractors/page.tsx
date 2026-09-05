import type { Metadata } from 'next';
import TractorsPageClient from './tractors-page-client';

export const metadata: Metadata = {
  title: 'Tractors | RJ Tractor Techs',
  description:
    'Search the published tractor catalog, apply filters and open model details for specs, pricing and comparisons.',
  alternates: { canonical: '/tractors' },
};

export default function TractorsPage() {
  return <TractorsPageClient />;
}
