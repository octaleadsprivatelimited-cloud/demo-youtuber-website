# Website administration

Sign in at http://localhost:3000/login with the verified Google account `rakeshpatel0944@gmail.com`. Open `/admin`. Other accounts cannot administer the site.

## 1. Hero images and slider

1. Open **Homepage & promotions → Hero slides → Add slide**.
2. Enter an internal slide name. Upload an image; wait for its preview before saving. JPG, PNG, WebP and GIF are supported. Files must be strictly under 1 MB (1,000,000 bytes); larger files are rejected before upload. Accepted images above 600 KiB are compressed for Firestore.
3. Set display order, background colour, headline, description and image accessibility description. Choose **Fill and crop** or **Show complete image**, then the image focus.
4. Set the duration to 3–30 seconds. Enter both text and a link for each optional button. Links can be local paths such as `/tractors` or full HTTPS URLs.
5. Select **Draft** to keep it private or **Published** to show it. Save, then use **Preview homepage**.
6. Add more published slides to enable automatic rotation and slide controls. Visitors can pause the carousel; reduced-motion preferences disable automatic rotation.
7. Reopen **Edit** to replace an image, reorder a slide or change its copy. Removing an image shows only the saved background. Archiving hides a slide without deleting it. Deleting removes it permanently after the confirmation dialog.

## 2. Homepage sections

Open **Homepage**. Add or edit a record for a section using its Section dropdown. Set the title, order and Visible checkbox, then publish. One configuration record is allowed per section. Explicit display orders control the actual page order; sections without a record retain defaults. To hide a default section, publish its configuration with **Visible** unchecked. Archiving the configuration restores the default; it does not hide the section.

## 3. Brand logos and promotions

**Brands** controls the brand directory and scrolling partner logos. Upload a logo, set order and publish. **Promotions** contains separate campaign-banner and sponsored-advertisement tabs. Upload the creative and configure its destination, then publish. Enable the Promotions homepage section if hidden.

## 4. Catalog and editorial content

- **Tractors:** choose a brand, model, image, prices and specifications; CSV imports can be previewed before applying. Popular/latest/upcoming flags control the relevant homepage tabs. Drafts and archived models stay private.
- **Equipment / Dealers:** edit the fields shown in the public directory and detail pages. Dealer controls include logo upload, email, WhatsApp, postal code and services (one per line).
- **Articles / Categories:** maintain news, guides, category assignments, images and content.
- **Editorial reviews:** link a published tractor and complete the publication requirements. Incomplete work can remain a draft.
- **Videos:** save a YouTube URL or ID, thumbnail and description. Published videos are used on the homepage; if none are published the existing channel feed remains the fallback.

## 5. Website identity and SEO

**Website configuration → Settings** supports website name, logo, social links, email, phone, footer text and legal/about content. Select **logo** to get the image uploader. Use one record per setting and publish it. Changing the setting key clears its old value to avoid carrying incompatible content over.

**SEO** manages route paths, titles, descriptions and social images. These overrides currently update browser metadata after load; server-rendered crawler/social metadata remains a separate improvement.

## 6. Enquiries

Use **Lead CRM** for enquiry details, status, notes and assignments. **Contact inbox** contains contact-form messages. **Subscribers** exposes archived subscriber records; the public newsletter signup remains disabled.

## Verification performed

TypeScript, production build, 47 unit tests, 27 integration tests and 5 Firestore emulator tests pass. Tests cover hero save/edit/publish/archive/delete, cleared image/copy fields, safe links, homepage ordering, content relationships, media encoding and legacy endpoint lockdown. The emulator tests also execute the real Firebase service paths for module CRUD, draft/published/archived visibility, image upload/replacement/removal and image delivery through the API route, plus inbox and lead updates. Live authenticated browser verification still requires the owner's Google sign-in; no production test content has been created.

## Video editing, tractor videos and dealer logos

Open **Content → YouTube videos** (`/admin/videos`). Expand **Channel videos available to edit**, copy a video to drafts, then edit its title, thumbnail, description and publication status in the library below. Use **Published library only** to control exactly which videos appear, including an empty section after archiving all videos. The fallback option displays the channel feed when the published library is empty. Homepage controls set the video section title, position and visibility.

Each tractor has an optional **Product YouTube video URL or ID** field. Paste a YouTube watch, short or share URL. Leave it empty (or clear it later) to hide the product video entirely.

In **Dealers**, upload a **Dealer logo / homepage image**, set its homepage logo order and publish the dealer. Enable **Our dealers** in homepage controls; each logo links to its dealer page. Uploads must remain below 1 MB.

Promotion destinations accept full HTTP/HTTPS URLs, bare domains (converted to HTTPS), or website paths beginning with `/`. A promotion without a destination does not redirect visitors to a default page.

## Permanent deletion

**Delete** permanently removes the record and any uploaded images that no other CMS record references. Removing or replacing an image takes effect when you **Save**; the old unused upload is deleted in the same transaction. Draft and archived records count as references, so shared images are preserved until their final reference is removed. Failed transactions leave the existing record and its images intact.

Selected images stay in the browser until Save. Cancelling a form does not upload them. Deleted image URLs return 404; new image responses are not cached. Copies already downloaded or cached before this change cannot be recalled.

Deleting a video removes its database record and switches video display to **Published library only**, preventing channel-feed fallback from restoring the deleted video. External YouTube videos and externally hosted images belong to their hosting service; deleting their links here does not delete the originals there. This change applies to deletions and edits made through the updated admin panel, not direct Firebase-console edits or a retrospective purge of old orphan uploads.

## SEO and sitemap

Set `NEXT_PUBLIC_SITE_URL=https://www.rjtractortechs.com` in production. Empty, invalid or localhost values fall back to this production origin. `/sitemap.xml` includes public static pages and published CMS detail records; it refreshes on a five-minute revalidation interval and uses saved timestamps for content modification dates. Drafts and private/search pages are excluded. `/robots.txt` points to the absolute sitemap and permits uploaded images while blocking private areas.

Published SEO records supply server-rendered title, description and social-image overrides on static public pages and tractor/article/video/review detail pages. Admin, account and login routes have no-index protection. After deployment, submit `https://www.rjtractortechs.com/sitemap.xml` to Google Search Console and inspect representative URLs; indexing remains Google's decision.

### Homepage video slider

Open **Homepage & promotions → Homepage videos** (`/admin/videos`). When the site is using the channel feed, its current videos are shown with thumbnails and **Edit this video** buttons. **Make current videos editable** saves the feed selection to the library; clicking **Edit this video** also preserves the current selection and opens that video's editor directly. Imports never overwrite existing edits or archived records.

Use **New record** for another YouTube link. Edit the title, thumbnail, URL/ID, **Show in homepage video slider**, **Homepage display order** (lowest first), and publication status. The slider shows the first ten eligible published videos. Turning off homepage visibility keeps the video in the video library. Saving any video switches the site to the managed library, so the automatic feed cannot override the selection. Changing a video URL clears its old automatic YouTube thumbnail; custom uploaded thumbnails remain until explicitly removed or replaced.
