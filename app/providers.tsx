'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider><AnalyticsTracker />{children}</AuthProvider>;
}
