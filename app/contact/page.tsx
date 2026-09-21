import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import ContactPage from './contact-page-client';

const pageMetadata: Metadata = {
  title: 'Contact Us | RJ Tractor Techs',
  description: 'Get in touch with RJ Tractor Techs for tractor details, corrections, partnerships and research support.',
  alternates: { canonical: '/contact' },
};
export async function generateMetadata() { return withSeoOverride('/contact', pageMetadata); }

export default function Page() {
  return <ContactPage />;
}
