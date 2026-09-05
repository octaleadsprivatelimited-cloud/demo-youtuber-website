
import { LocalizedElement } from '@/components/LocalizedElement';
import type { Metadata } from 'next';
import { InfoPage } from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Disclaimer | RJ Tractor Techs',
  description:
    'Understand how to interpret prices, specifications and editorial content published on RJ Tractor Techs.',
  alternates: {
    canonical: '/disclaimer',
  },
};

export default function Page() {
  return (
    <InfoPage
      settingKey='disclaimer'
      eyebrow='LEGAL'
      title='Disclaimer'
      intro='Important context for prices, specifications and editorial content.'
    >
      <LocalizedElement as="p">
        Tractor prices may vary by location, dealer, variant and applicable taxes.
        Expected launch information and specifications are clearly identified when
        unconfirmed.
      </LocalizedElement>
      <LocalizedElement as="p">
        RJ Tractor Techs is an information and media platform, not an ecommerce
        seller.
      </LocalizedElement>
    </InfoPage>
  );
}
