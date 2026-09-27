import TractorDetailClient from './tractor-detail-client';
import { SeoJsonLd } from '@/components/SeoJsonLd';
import { breadcrumbs, detailMetadata, titleFromSlug } from '@/utils/seo';
import { productSeoRecord, productMetadata, productSeoDetails } from '@/lib/product-seo';

type Params = { params: Promise<{brand:string;model:string}> };
export async function generateMetadata({params}:Params) {
  const {brand,model}=await params;
  const path=`/tractor/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`;
  const row=await productSeoRecord('tractors',path);
  if(row) return productMetadata(row,path);
  return {...await detailMetadata(titleFromSlug(model),'Tractor information is unavailable.',path),robots:{index:false,follow:true}};
}
export default async function TractorDetailPage({params}:Params) {
  const {brand,model}=await params;
  const path=`/tractor/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`;
  const row=await productSeoRecord('tractors',path);
  const name=row?productSeoDetails(row).name:titleFromSlug(model);
  return <><SeoJsonLd data={breadcrumbs([{name:'Home',path:'/'},{name:'Tractors',path:'/tractors'},{name,path}])}/><TractorDetailClient brandSlug={brand} modelSlug={model}/></>;
}
