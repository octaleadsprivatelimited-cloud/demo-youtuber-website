import TractorDetailClient from './tractor-detail-client';
import {SeoJsonLd} from '@/components/SeoJsonLd';
import {breadcrumbs,detailMetadata,titleFromSlug} from '@/utils/seo';

export async function generateMetadata({params}:{params:Promise<{brand:string;model:string}>}){const {brand,model}=await params;const name=`${titleFromSlug(brand)} ${titleFromSlug(model)}`;return detailMetadata(name,`Explore ${name} specifications, price, features, reviews and comparison information.`,`/tractor/${brand}/${model}`);}

export default async function TractorDetailPage({ params }: { params: Promise<{ brand: string; model: string }> }) {
  const { brand, model } = await params;
  return <><SeoJsonLd data={breadcrumbs([{name:'Home',path:'/'},{name:'Tractors',path:'/tractors'},{name:titleFromSlug(model),path:`/tractor/${brand}/${model}`}])}/><TractorDetailClient brandSlug={brand} modelSlug={model} /></>;
}
