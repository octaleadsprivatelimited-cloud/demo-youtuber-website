// Public Firebase web configuration. Access is enforced by Firestore rules and Auth.
// Keep the browser and media route on the same project when deployment env values are absent.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCRblx7WlHVL0oPRDsqrV28inki-OVqUp0',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'rj-tractor-techs.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'rj-tractor-techs',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '298855002995',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:298855002995:web:f22ae75e6e8481743a8b06',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-QF0JTYYSLH',
};
