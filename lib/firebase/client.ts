import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

import { firebaseConfig } from './config';

// Firebase is the backend in every environment; never grant demo admin access.
export const isLocalDemo = false;
export const hasFirebaseCredentials = [firebaseConfig.apiKey, firebaseConfig.authDomain, firebaseConfig.projectId, firebaseConfig.messagingSenderId, firebaseConfig.appId].every(Boolean);
export const isFirebaseConfigured = hasFirebaseCredentials;
export const firebaseApp = hasFirebaseCredentials ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

if (firebaseApp && typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY) {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}

export async function initializeAnalytics() {
  return firebaseApp && await isSupported() ? getAnalytics(firebaseApp) : null;
}
