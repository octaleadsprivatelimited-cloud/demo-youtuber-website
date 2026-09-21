import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import VideosPageClient from './videos-page-client';

const pageMetadata: Metadata = {
  title: 'Videos | RJ Tractor Techs',
  description: 'Watch model explainers and tractor videos published from the RJ Tractor Techs channel.',
  alternates: { canonical: '/videos' },
};
export async function generateMetadata() { return withSeoOverride('/videos', pageMetadata); }

export default function VideosPage() {
  return <VideosPageClient />;
}
