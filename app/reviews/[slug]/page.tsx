import { detailMetadata, titleFromSlug } from '@/utils/seo';
import ReviewDetailClient from './review-detail-client';

export default async function ReviewDetailPage({params}:{params:Promise<{slug:string}>}) {
  return <ReviewDetailClient slug={(await params).slug}/>;
}


export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  return detailMetadata(titleFromSlug(slug), 'Read the editorial verdict, score, strengths and limitations of this tractor.', '/reviews/'+slug);
}
