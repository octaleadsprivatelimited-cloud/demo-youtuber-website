# Security review — 21 September 2026

## Completed

- Opened the app at http://localhost:3000 and verified the unauthenticated admin gate and owner login instructions.
- Retained exact verified Google owner authorization for rakeshpatel0944@gmail.com across client access checks, Firestore rules, and callable functions. Other role claims cannot grant admin access.
- Fixed comparison takeover: updates must belong to both the existing and incoming owner. Corrected owner reads and deletes.
- Restored owner settings/SEO writes and owner account inspection; unpublished configuration is no longer public. Account mutations remain server-only.
- Restricted public contact/newsletter workflow fields, timestamps and payload sizes, and blocked forged lead user IDs.
- Fixed the admin Firestore connection check to use the same Firebase configuration as the app.
- Added security headers to Next.js, fixed the lint command, and updated vulnerable application and development dependencies. Both npm and pnpm application lockfiles are updated.
- Deployed tested Firestore rules to rj-tractor-techs successfully. Website code and Functions have not been redeployed.

## Validation

Production build, TypeScript, Functions compilation, 45 unit tests, 26 integration tests, 8 language tests, and 4 Firestore emulator test groups passed. ESLint has no errors and six existing warnings. The website dependency audit reports zero vulnerabilities. Browser error log was empty during homepage/admin/login checks.

## Remaining limitations

- Real Google OAuth login and authenticated admin CRUD still require the owner to sign in; emulator tests use synthetic authentication tokens.
- Functions lockfile updates remove two qs advisories. One moderate transitive uuid@9 advisory remains in Firebase Admin's Google Cloud dependencies. Avoid forcing an untested major dependency override; a compatible upstream update is still needed. The affected advisory concerns buffer handling in UUID v3/v5/v6; this application does not call those APIs directly.
- Public form rules validate content but do not provide rate limiting or CAPTCHA. A separate App Check/rate-limiting rollout would address automated spam.
- This is a targeted review, not a guarantee that every possible vulnerability or application bug has been eliminated.
