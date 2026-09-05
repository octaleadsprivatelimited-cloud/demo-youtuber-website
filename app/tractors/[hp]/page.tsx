import type { Metadata } from 'next';
import { titleFromSlug } from '@/utils/seo';
import HorsepowerPageClient from './horsepower-page-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hp: string }>;
}): Promise<Metadata> {
  const { hp } = await params;
  const range = titleFromSlug(hp).replace(/\s+/g, ' ');
  return {
    title: `${range} tractors | RJ Tractor Techs`,
    description: `Explore published tractors in the ${range} range and compare specifications, prices and configurations.`,
    alternates: {
      canonical: `/tractors/${hp}`,
    },
  };
}

export default async function HorsepowerPage({ params }: { params: Promise<{ hp: string }> }) {
  return <HorsepowerPageClient hpSlug={(await params).hp} />;
}
