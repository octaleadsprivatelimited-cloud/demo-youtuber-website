import EquipmentDetailClient from './equipment-detail-client';
export default async function EquipmentPage({params}:{params:Promise<{category:string;slug:string}>}){const value=await params;return <EquipmentDetailClient categorySlug={value.category} slug={value.slug}/>;}

