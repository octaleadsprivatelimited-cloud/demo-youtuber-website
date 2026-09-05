
import { LocalizedElement } from '@/components/LocalizedElement';
import type { Metadata } from 'next';
import { InfoPage } from '@/components/InfoPage';

export const metadata: Metadata = {
  title: 'Cookie Policy | RJ Tractor Techs',
  description:
    'Learn how RJ Tractor Techs uses browser storage and analytics data in this tractor research website.',
  alternates: {
    canonical: '/cookie-policy',
  },
};

export default function Page() {
  return (
    <InfoPage
      settingKey='cookie-policy'
      eyebrow='LEGAL'
      title='Cookie policy'
      intro='How browser storage and measurement tools support the website.'
    >
      <LocalizedElement as="p">
        The website may use essential browser storage for sign-in and
        preferences, plus Firebase Analytics when configured. Analytics helps
        understand page usage without changing public content.
      </LocalizedElement>
    </InfoPage>
  );
}
