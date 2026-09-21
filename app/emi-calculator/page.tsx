import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import EmiCalculatorPage from './emi-calculator-page-client';

const pageMetadata: Metadata = {
  title: 'EMI Calculator | RJ Tractor Techs',
  description:
    'Estimate tractor EMI for shortlisted models and explore loan assumptions before you visit a dealer.',
  alternates: { canonical: '/emi-calculator' },
};
export async function generateMetadata() { return withSeoOverride('/emi-calculator', pageMetadata); }

export default function Page() {
  return <EmiCalculatorPage />;
}
