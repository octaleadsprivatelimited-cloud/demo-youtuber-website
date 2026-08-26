import { logEvent } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import { initializeAnalytics } from '@/lib/firebase/client';

export type AnalyticsEvent='page_view'|'tractor_view'|'search'|'comparison'|'favourite'|'video_click'|'youtube_click'|'lead_submission'|'dealer_phone_click'|'whatsapp_click'|'article_view'|'emi_calculation';
const recordEvent = logEvent as unknown as (analytics: Analytics, name: string, parameters?: Record<string, unknown>) => void;
export async function trackEvent(name:AnalyticsEvent,parameters:Record<string,string|number|boolean|undefined>={}){try{const analytics=await initializeAnalytics();if(analytics)recordEvent(analytics,name,Object.fromEntries(Object.entries(parameters).filter(([,value])=>value!==undefined)));}catch{/* Analytics must never block the user journey. */}}
