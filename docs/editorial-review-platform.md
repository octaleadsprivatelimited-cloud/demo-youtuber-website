# Editorial tractor review platform

## Local workflow

Start the app with `npm run dev`, then visit:

- `/admin/tractors`: create the tractor record first.
- `/admin/expert-reviews`: create a draft, select its tractor, and write the review.
- `/reviews`: search published reviews by keyword or tractor and sort by date or score.
- `/tractor/<brand>/<model>`: see reviews associated with that tractor.

A review starts as a draft. Publishing requires a published tractor, title, author, summary, at least 100 characters of review text, verdict, assessment method, and a finite score from 0 to 10. Pros, cons, cover images and sponsorship disclosures are supported. Archiving or returning to draft removes a review from public subscriptions. Title changes retain the original slug. Concurrent edits are rejected instead of silently overwriting another editor's work.

Only the editorial team publishes reviews. Public owner-review submission is disabled. Old owner records remain stored, but are not displayed in the tractor review experience. Customer accounts retain favourites, comparisons and enquiries.

## Persistence and access

Without Firebase configuration, development uses the existing project-local D1 content store and R2 media store. Content survives reloads and separate browser sessions. This local workspace intentionally uses a demo administrator; it does not verify real identities. The local API rejects production requests and cross-origin requests.

Configured environments use Firebase Authentication, Firestore and Storage. Firestore rules restrict review writes to active Editor, Admin and Super Admin memberships. Editors can read the tractor catalog for linking and manage editorial reviews, but cannot edit catalog content or access user management. Editor image uploads are confined to `admin/expertReviews/`. Public queries select `published` reviews only. Firestore validates published review fields and tractor visibility independently of the browser.

The existing role-management callable creates an active editorial membership while leaving administrator claims false. Disabling the user deactivates that membership. Admins manage editors; only Super Admins manage other administrator accounts.

## Production setup (not performed)

1. Select a Firebase project and configure the public web-app values listed in `.env.example`. Use the real website URL for `NEXT_PUBLIC_SITE_URL`. Set these values in the hosting build environment as well as the local environment when testing Firebase mode.
2. Enable your chosen sign-in providers in Firebase Authentication and add the live domain to authorized domains.
3. Create Firestore and Storage. From a trusted Firebase console or Admin SDK session, bootstrap the first administrator with `admins/<auth-uid>` containing `role: "Super Admin"` and `active: true`. Never bootstrap membership from a public client.
4. Use Node 22 for Firebase Functions and install/build the functions package. Deploy `firestore.rules`, `firestore.indexes.json`, `storage.rules` and functions with the Firebase CLI and an explicit project ID. Use the Users administration screen to assign Editor memberships.
5. Run Firebase emulator authorization tests before deploying the rules. Verify anonymous draft reads fail, customer writes fail, editors can publish valid reviews and cannot edit tractors, inactive editors cannot write, and invalid published records are rejected.
6. Configure backup retention and monitoring in the chosen Firebase project. Keep backups of local `.wrangler/state` before deleting or moving the workspace; this directory contains local records and media.
7. Build and deploy the website separately after backend verification. Local CMS endpoints are development-only and cannot serve as the live backend.

## Verification

- `npm run test:unit`: normalization, editorial publication validation, role-handler contracts and homepage regression tests.
- `npm run test:integration`: start localhost first; exercises isolated records through the real local D1 API, including draft → publish → edit → archive, stable URLs, conflict detection, content visibility, media persistence and existing catalog flows. Test collections are cleared after use.
- `npm run typecheck`, `npm run build`, and `npm --prefix functions run build` validate compilation.

The local tests use isolated fixture collections, not customer content. They do not establish that deployed Firebase rules work. Firebase emulator authorization checks require Java and are still a production verification step; this machine currently has no Java runtime. No Firebase project was provisioned or deployed during this local implementation.
