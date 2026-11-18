---
name: building-pet-care-store
description: Use when planning, building, or updating a direct-to-consumer pet-care storefront with product details, bilingual copy, reviews, bundles, policy pages, or checkout links.
---

# Building a Pet-Care Store

Turn supplied brand, packaging, and policy materials into a navigable storefront while keeping commercial claims and launch data traceable to their source.

## Product information

- Treat the caller's brief, supplied documents, confirmed packaging text, and existing site as distinct sources. Product claims belong on the site only when a source supports them.
- Keep unknowns out of customer-facing copy: do not invent ingredients, health or safety assurances, application surfaces, dosage, frequency, net contents, regulatory status, origin stories, or social links. Omit an unconfirmed detail or use neutral label-directed guidance where useful.
- Check that referenced replacement images and videos actually exist before changing paths. Reuse supplied assets when requested; never treat an example filename as an asset.
- Keep each real product in a central bilingual record with a stable slug, names, tagline, highlights, confirmed specifications, usage, notes, media, currency, nullable price, nullable comparison price, and nullable buy URL. Render every price and purchase control from that record. Missing price means a pending-price state; missing buy URL means a disabled control.

## Reviews and bundles

- Keep customer reviews as a separate dataset with product attribution, rating, language-specific text, author, pet details, optional photos, and date. An empty dataset renders an empty state with no average or count. Never invent testimonials or fill missing review fields.
- Define bundles by product slugs, then resolve product names and images from the catalog. Keep bundle price and checkout URL nullable and use the same price and purchase behavior as products.

## Pages and localization

- Use a direct, refreshable route for every real product and policy page. Share catalog cards, purchase controls, review rendering, language switching, and the site footer where the existing architecture allows.
- Preserve the site's existing media loading and playback behavior. Use root-relative assets on nested static routes. Make unknown routes return 404 instead of showing the homepage.
- Keep Chinese and English policy text paired and preserve caller-supplied bracket placeholders verbatim. Do not fill legal, shipping, refund, or support details without confirmed values.
- For mobile product pages, place media before the details, make purchase controls reachable at the viewport bottom, account for safe-area insets, and verify there is no horizontal overflow.

## Verify before publishing

- Build and run the site's full existing test suite. Test direct-route loads and refreshes, missing slugs, both languages, unset and configured purchase states, empty reviews, bundle membership, preserved policy placeholders, and narrow mobile viewports.
- Check that all page image and video URLs resolve, no browser errors occur, and reduced-motion behavior still works.
- Verify the intended production hostname, not just the Git branch. Multiple hosting projects may serve different commits; a push updates only projects connected to that branch. After a publish, open the exact hostname and a deep product route.
- When the requested hostname conflicts with deployment configuration or live results, report both observations and confirm which hostname is canonical before changing site mappings, names, DNS, or TLS. Never delete a live site or change its domain based only on a project document.
- If the hosting account or deploy credential is unavailable, stop hosting mutations, identify which hostname remains unchanged, and give the exact manual step required. Do not claim a GitHub push updated an unverified host.
