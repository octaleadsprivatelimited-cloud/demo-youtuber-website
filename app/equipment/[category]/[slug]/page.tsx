import type { Metadata } from 'next';
import { titleFromSlug } from '@/utils/seo';
import EquipmentDetailClient from './equipment-detail-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const categoryName = titleFromSlug(category);
  const itemName = titleFromSlug(slug);
  return {
    title: `${itemName} | ${categoryName} Equipment | RJ Tractor Techs`,
    description: `View published details, specifications and price range for ${itemName}.`,
    alternates: {
      canonical: `/equipment/${category}/${slug}`,
    },
  };
}

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const value = await params;
  return <EquipmentDetailClient categorySlug={value.category} slug={value.slug} />;
}
