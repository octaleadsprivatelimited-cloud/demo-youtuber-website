# Website administration

Sign in at http://localhost:3000/login with the verified Google account `rakeshpatel0944@gmail.com`. Open `/admin`. Other accounts cannot administer the site.

## 1. Hero images and slider

1. Open **Homepage & promotions → Hero slides → Add slide**.
2. Enter an internal slide name. Upload an image; wait for its preview before saving. JPG, PNG, WebP and GIF are supported and large images are compressed.
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
- **Equipment / Dealers:** edit the fields shown in the public directory and detail pages.
- **Articles / Categories:** maintain news, guides, category assignments, images and content.
- **Editorial reviews:** link a published tractor and complete the publication requirements. Incomplete work can remain a draft.
- **Videos:** save a YouTube URL or ID, thumbnail and description. Published videos are used on the homepage; if none are published the existing channel feed remains the fallback.

## 5. Website identity and SEO

**Website configuration → Settings** supports website name, logo, social links, email, phone, footer text and legal/about content. Select **logo** to get the image uploader. Use one record per setting and publish it. Changing the setting key clears its old value to avoid carrying incompatible content over.

**SEO** manages route paths, titles, descriptions and social images. These overrides currently update browser metadata after load; server-rendered crawler/social metadata remains a separate improvement.

## 6. Enquiries

Use **Lead CRM** for enquiry details, status, notes and assignments. **Contact inbox** contains contact-form messages. **Subscribers** exposes archived subscriber records; the public newsletter signup remains disabled.

## Verification performed

TypeScript, production build, 46 unit tests and 27 integration tests pass. Tests cover hero save/edit/publish/archive/delete, cleared image/copy fields, safe links, homepage ordering, content relationships, media encoding and legacy endpoint lockdown. Live authenticated admin UI and real Firebase uploads still require the owner's Google sign-in; no live test content has been created.
