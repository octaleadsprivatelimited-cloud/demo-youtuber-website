'use client';

import { LanguageProvider } from '@/components/LanguageProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { DynamicSeo } from '@/components/DynamicSeo';

export function Providers({ children }: { children: React.ReactNode }) {
  return <LanguageProvider><AuthProvider><AnalyticsTracker /><DynamicSeo/>{children}</AuthProvider></LanguageProvider>;
}
