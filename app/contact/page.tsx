import type { Metadata } from 'next';
import ContactPage from './contact-page-client';

export const metadata: Metadata = {
  title: 'Contact Us | RJ Tractor Techs',
  description: 'Get in touch with RJ Tractor Techs for tractor details, corrections, partnerships and research support.',
  alternates: { canonical: '/contact' },
};

export default function Page() {
  return <ContactPage />;
}
