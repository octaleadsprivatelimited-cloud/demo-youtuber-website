import type { Metadata } from 'next';
import LoginPageClient from './login-page-client';

export const metadata: Metadata = {
  title: 'Admin Login | RJ Tractor Techs',
  description: 'Authorized editorial team sign-in for the RJ Tractor Techs administration panel.',
  alternates: { canonical: '/login' },
};

export default function Page() {
  return <LoginPageClient />;
}
