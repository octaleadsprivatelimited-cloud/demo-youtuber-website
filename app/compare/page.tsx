import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import CompareContentPage from './compare-page-client';

const pageMetadata: Metadata = {
  title: 'Compare Tractors | RJ Tractor Techs',
  description:
    'Build a side-by-side tractor comparison by power, drivetrain and specifications across published models.',
  alternates: {
    canonical: '/compare',
  },
};
export async function generateMetadata() { return withSeoOverride('/compare', pageMetadata); }

export default function ComparePage() {
  return <CompareContentPage />;
}
