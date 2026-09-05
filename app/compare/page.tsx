import type { Metadata } from 'next';
import CompareContentPage from './compare-page-client';

export const metadata: Metadata = {
  title: 'Compare Tractors | RJ Tractor Techs',
  description:
    'Build a side-by-side tractor comparison by power, drivetrain and specifications across published models.',
  alternates: {
    canonical: '/compare',
  },
};

export default function ComparePage() {
  return <CompareContentPage />;
}
