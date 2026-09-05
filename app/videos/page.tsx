import type { Metadata } from 'next';
import VideosPageClient from './videos-page-client';

export const metadata: Metadata = {
  title: 'Videos | RJ Tractor Techs',
  description: 'Watch model explainers and tractor videos published from the RJ Tractor Techs channel.',
  alternates: { canonical: '/videos' },
};

export default function VideosPage() {
  return <VideosPageClient />;
}
