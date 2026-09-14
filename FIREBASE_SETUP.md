# Firebase setup

The app uses Firebase Authentication, Cloud Firestore, Firestore image documents, and Firebase Analytics in development and production. Local demo authentication and the legacy local CMS API are disabled. Existing local files have not been deleted or migrated.

## Connect the project

1. Register a Firebase web app and copy `.env.example` to `.env.local`. Populate the Firebase web configuration values (Storage bucket is not needed). These are web app identifiers, not a service account private key. Leave the optional App Check key empty unless reCAPTCHA App Check is configured.
2. Enable Google in Authentication → Sign-in method. Disable Email/Password and any other providers if this project is dedicated to this site. Add `localhost` to Authentication → Settings → Authorized domains and add the production domain when deploying.
3. Create Cloud Firestore. Deploy this repository's rules and indexes using `firebase deploy --only firestore --project YOUR_PROJECT_ID`. Do not use permissive test-mode rules.
4. Sign in at `/login` using `rakeshpatel0944@gmail.com`. Only this verified Google account receives Super Admin access. No `admins/UID` document is required; existing admin profiles cannot grant anyone else access.
5. Build and deploy the callable functions for user management: run `npm run build` inside `functions`, then `firebase deploy --only functions --project YOUR_PROJECT_ID`. These require a Google-authenticated caller and the verified owner email. YouTube sync additionally requires its existing YouTube configuration.
6. Restart `npm run dev:local` after changing environment values. Verify authorized sign-in, rejection of an unapproved Google account, Firestore CRUD, and Firestore image uploads.

The owner email is enforced in Firestore rules and callable functions; role changes cannot grant another account staff access. Firebase web configuration is saved locally. Provider activation, rules deployment, and live OAuth validation must be completed against the configured project. Existing local content requires a separately reviewed migration; it is not automatically uploaded to Firebase.

Google sign-in reference: https://firebase.google.com/docs/auth/web/google-signin

## Firestore-only image uploads

Images are stored in separate `media` documents as base64, with a 600 KiB raw file limit. The app serves them through `/api/media/ID`. Publish `firestore.rules`, including the media section. Deploy `firestore.indexes.json` to disable indexing for the media data field (or add a single-field exemption for collection group `media`, field `data`, with all indexes disabled in the console). No Firebase Storage setup or Storage rules are required. Existing external image URLs remain unchanged; no previous media has been migrated automatically. Google sign-in still uses Firebase Authentication.
