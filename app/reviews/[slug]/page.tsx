import ReviewDetailClient from './review-detail-client';

export default async function ReviewDetailPage({params}:{params:Promise<{slug:string}>}) {
  return <ReviewDetailClient slug={(await params).slug}/>;
}

