'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/services/analytics';

export function AnalyticsTracker(){useEffect(()=>{const record=()=>trackEvent('page_view',{page_path:window.location.pathname});record();window.addEventListener('popstate',record);return()=>window.removeEventListener('popstate',record);},[]);return null;}

