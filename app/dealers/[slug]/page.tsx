import type { Metadata } from 'next';
import { titleFromSlug } from '@/utils/seo';
import DealerDetailClient from './dealer-detail-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = titleFromSlug(slug);
  return {
    title: `${name} Dealer | RJ Tractor Techs`,
    description: `Find contact details and profile information for ${name}, including location and available services.`,
    alternates: { canonical: `/dealers/${slug}` },
  };
}

export default async function DealerPage({ params }: { params: Promise<{ slug: string }> }) {
  return <DealerDetailClient slug={(await params).slug} />;
}
