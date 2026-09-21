# Firebase setup

The app uses Firebase Authentication, Cloud Firestore, Firestore image documents, and Firebase Analytics in development and production. Local demo authentication and the legacy local CMS API are disabled. Existing local files have not been deleted or migrated.

## Connect the project

1. Register a Firebase web app and copy `.env.example` to `.env.local`. Populate the Firebase web configuration values (Storage bucket is not needed). These are web app identifiers, not a service account private key. Leave the optional App Check key empty unless reCAPTCHA App Check is configured.
2. Enable Google in Authentication → Sign-in method. Disable Email/Password and any other providers if this project is dedicated to this site. Add `localhost` to Authentication → Settings → Authorized domains and add the production domain when deploying.
3. Create Cloud Firestore. Deploy this repository's rules and indexes using `firebase deploy --only firestore --project YOUR_PROJECT_ID`. Do not use permissive test-mode rules.
4. Sign in at `/login` using `rakeshpatel0944@gmail.com`. Only this verified Google account receives Super Admin access. No `admins/UID` document is required; existing admin profiles cannot grant anyone else access.
5. Build and deploy the callable functions for user management: run `npm run build` inside `functions`, then `firebase deploy --only functions --project YOUR_PROJECT_ID`. These require a Google-authenticated caller and the verified owner email. YouTube sync additionally requires its existing YouTube configuration.
6. Restart `npm run dev` after changing environment values. Verify authorized sign-in, rejection of an unapproved Google account, Firestore CRUD, and Firestore image uploads.

The owner email is enforced in Firestore rules and callable functions; role changes cannot grant another account staff access. Firebase web configuration is saved locally. Provider activation, rules deployment, and live OAuth validation must be completed against the configured project. Existing local content requires a separately reviewed migration; it is not automatically uploaded to Firebase.

Google sign-in reference: https://firebase.google.com/docs/auth/web/google-signin

## Firestore-only image uploads

Images are stored in separate `media` documents as base64, with a 600 KiB stored image limit and a strict original upload limit below 1 MB (1,000,000 bytes). The app serves them through `/api/media/ID`. Publish `firestore.rules`, including the media section. Deploy `firestore.indexes.json` to disable indexing for the media data field (or add a single-field exemption for collection group `media`, field `data`, with all indexes disabled in the console). No Firebase Storage setup or Storage rules are required. Existing external image URLs remain unchanged; no previous media has been migrated automatically. Google sign-in still uses Firebase Authentication.

## Security regression checks

Run `npm run test:rules` with the Firebase CLI and Java 21 installed. This uses the isolated `demo-rj-security` project on port 8185 and never writes test data to the live database. It covers owner-only catalog/configuration access, draft privacy, comparison ownership, account privacy, and public form validation.

The September 2026 security fix deploys owner-only Firestore rules to `rj-tractor-techs`. Only the verified Google session for `rakeshpatel0944@gmail.com` can administer content. Role claims and `admins` documents cannot grant another account access. Settings and SEO are public only when published. Public forms remain anonymous and need a separate rate-limiting/App Check rollout if spam prevention is required.

Local checks: `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run test:language`, `npm run test:rules`, and `npm run build`. Run `npm run test:integration` while localhost:3000 is running. A real Google owner sign-in must still be verified interactively; emulator tokens do not prove the OAuth flow.
