'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { DynamicSeo } from '@/components/DynamicSeo';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider><AnalyticsTracker /><DynamicSeo/>{children}</AuthProvider>;
}
