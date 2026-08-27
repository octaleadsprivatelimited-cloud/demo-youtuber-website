# Admin workflow

The shared content editor handles hero slides, partners, and other configured content sections. Upload an image, wait for its preview, then save the record. Use **Edit** to replace a slide; **Add slide** adds another item to the rotation. Display order starts at 1. Removing an image retains a blank slide with the configured background colour; deleting a record removes that slide.

## Local development

Without Firebase credentials, the development server uses local D1 and R2 bindings for records and images. Data lives in the project's ignored Wrangler state directory. Do not delete that state if you need to keep local content.

Existing browser records are imported once per collection. Their original browser values remain as a backup. An initialized empty collection is never automatically re-seeded.

The local APIs are restricted to development and loopback hostnames. Mutations reject cross-origin requests. They are not a hosted authentication system.

## Production

Production continues to require the existing Firebase configuration and administrator access rules. Local D1/R2 preview data and images are not automatically copied into Firebase. Migrate required records and uploads before publishing; local API routes deliberately reject production requests.

## Verification

- Type check: `pnpm exec tsc --noEmit --incremental false`
- Build: `pnpm build`
- Unit tests: `node --test tests/admin-records.test.mjs`
- With localhost running: `node --test tests/local-cms.test.mjs`

The API tests use isolated QA collection names and small test uploads. Browser verification covered upload, save, replacement in an already-open homepage, clearing an image, removing the temporary slide, and mobile editor/navigation alignment.
