import TractorDetailClient from './tractor-detail-client';

export default async function TractorDetailPage({ params }: { params: Promise<{ brand: string; model: string }> }) {
  const { brand, model } = await params;
  return <TractorDetailClient brandSlug={brand} modelSlug={model} />;
}

