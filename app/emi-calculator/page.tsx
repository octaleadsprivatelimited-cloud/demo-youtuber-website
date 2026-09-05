import type { Metadata } from 'next';
import EmiCalculatorPage from './emi-calculator-page-client';

export const metadata: Metadata = {
  title: 'EMI Calculator | RJ Tractor Techs',
  description:
    'Estimate tractor EMI for shortlisted models and explore loan assumptions before you visit a dealer.',
  alternates: { canonical: '/emi-calculator' },
};

export default function Page() {
  return <EmiCalculatorPage />;
}
