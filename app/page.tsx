import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import HomePage from '@/app/page-client';

const pageMetadata: Metadata = {
  title: 'RJ Tractor Techs | Tractor Reviews, Specs & Farming Information',
  description:
    'Explore tractor specifications, prices, expert reviews, comparisons, new launches and practical farming information.',
  alternates: {
    canonical: '/',
  },
};
export async function generateMetadata() { return withSeoOverride('/', pageMetadata); }

export default function Page() {
  return <HomePage />;
}
