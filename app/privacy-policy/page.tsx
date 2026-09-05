
import { LocalizedElement } from '@/components/LocalizedElement';
import type { Metadata } from 'next';
import { InfoPage } from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | RJ Tractor Techs',
  description:
    'Learn how user information submitted through the website is stored, used and protected.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function Page() {
  return (
    <InfoPage
      settingKey='privacy-policy'
      eyebrow='LEGAL'
      title='Privacy policy'
      intro='How information submitted to RJ Tractor Techs is handled.'
    >
      <LocalizedElement as="p">
        Information submitted through account, review, newsletter and enquiry forms
        is used to provide the requested service and operate the platform.
        Configure and publish the final business-specific policy from Admin →
        Settings before launch.
      </LocalizedElement>
      <LocalizedElement as="h2">Your choices</LocalizedElement>
      <LocalizedElement as="p">
        You may request access, correction or deletion of personal information using
        the published contact details.
      </LocalizedElement>
    </InfoPage>
  );
}
