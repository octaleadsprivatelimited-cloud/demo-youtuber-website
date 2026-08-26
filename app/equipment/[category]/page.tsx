import EquipmentCategoryClient from './equipment-category-client';
export default async function EquipmentCategoryPage({params}:{params:Promise<{category:string}>}){return <EquipmentCategoryClient categorySlug={(await params).category}/>;}

