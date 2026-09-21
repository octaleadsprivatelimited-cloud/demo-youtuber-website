import type { Metadata } from 'next';
import SearchPageClient from './search-page-client';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Search | RJ Tractor Techs',
  description: 'Search published tractors, brands, articles and other research content in one place.',
  alternates: { canonical: '/search' },
};

export default function SearchPage() {
  return <SearchPageClient />;
}
