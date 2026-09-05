import type { Metadata } from 'next';
import EquipmentPageClient from './equipment-page-client';

export const metadata: Metadata = {
  title: 'Farm Equipment | RJ Tractor Techs',
  description: 'Browse implements and machinery categories with details for farmers planning a full tractor setup.',
  alternates: {
    canonical: '/equipment',
  },
};

export default function EquipmentPage() {
  return <EquipmentPageClient />;
}
