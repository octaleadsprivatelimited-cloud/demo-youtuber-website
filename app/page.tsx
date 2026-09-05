import type { Metadata } from 'next';
import HomePage from '@/app/page-client';

export const metadata: Metadata = {
  title: 'RJ Tractor Techs | Tractor Reviews, Specs & Farming Information',
  description:
    'Explore tractor specifications, prices, expert reviews, comparisons, new launches and practical farming information.',
  alternates: {
    canonical: '/',
  },
};

export default function Page() {
  return <HomePage />;
}
