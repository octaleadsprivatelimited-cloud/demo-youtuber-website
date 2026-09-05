import type { Metadata } from 'next';
import { titleFromSlug } from '@/utils/seo';
import EquipmentCategoryClient from './equipment-category-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const name = titleFromSlug(category);
  return {
    title: `${name} equipment | RJ Tractor Techs`,
    description: `Browse published ${name} equipment and related agricultural gear by model and brand.`,
    alternates: { canonical: `/equipment/${category}` },
  };
}

export default async function EquipmentCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  return <EquipmentCategoryClient categorySlug={(await params).category} />;
}
