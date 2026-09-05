
import { LocalizedElement } from '@/components/LocalizedElement';
import type { Metadata } from 'next';
import { InfoPage } from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Terms and Conditions | RJ Tractor Techs',
  description:
    'Read the platform terms for using RJ Tractor Techs and how to use published tractor research content.',
  alternates: {
    canonical: '/terms-and-conditions',
  },
};

export default function Page() {
  return (
    <InfoPage
      settingKey='terms-and-conditions'
      eyebrow='LEGAL'
      title='Terms and conditions'
      intro='Terms for using the RJ Tractor Techs research platform.'
    >
      <LocalizedElement as="p">
        Content is provided for general information and research. Verify specifications,
        availability and final pricing with the manufacturer or an authorized dealer
        before making a purchase decision.
      </LocalizedElement>
      <LocalizedElement as="p">
        Do not misuse the website, attempt unauthorized access or submit unlawful
        content.
      </LocalizedElement>
    </InfoPage>
  );
}
