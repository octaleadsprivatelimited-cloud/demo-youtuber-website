import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import EquipmentPageClient from './equipment-page-client';

const pageMetadata: Metadata = {
  title: 'Farm Equipment | RJ Tractor Techs',
  description: 'Browse implements and machinery categories with details for farmers planning a full tractor setup.',
  alternates: {
    canonical: '/equipment',
  },
};
export async function generateMetadata() { return withSeoOverride('/equipment', pageMetadata); }

export default function EquipmentPage() {
  return <EquipmentPageClient />;
}
