# KikiBuddy store pages implementation plan

**Goal:** Implement the supplied product detail, review, bundle and policy specification using the two supplied bilingual copy documents.

**Architecture:** Keep the native HTML/CSS/JavaScript site. Put real catalog, bundles, reviews and policies in ES modules; share purchase controls, reviews, cards and footer rendering. Extract the existing media controller without changing its playback rules. Generate nine static deep pages at build time and serve those same known routes in development.

**Tech stack:** Node 22+, native ES modules, Node test runner, Playwright/Chrome.

**Sources:** User's `Codex提示词-详情页与评价套装模块.md`, `真实产品详情页文案.md`, and `政策页与品牌故事文案.md`.

## Constraints

- Five real products; preserve eight concept products without fake detail links.
- Nullable CNY prices, compare-at prices and purchase URLs; data controls every real product and bundle price/button.
- Use existing posters/MP4s; optional WebM only when the asset exists.
- Omit unconfirmed product facts, doses/frequencies, odor application area and flea claims. Preserve policy bracket placeholders exactly. Do not publish fictional brand origins.
- Real review data starts empty. Show averages/counts only with genuine data; fixtures live only in tests.
- Preserve homepage video loading/playback, reduced-motion and Save-Data rules.
- Both languages, accessible review photo dialog, mobile video-first layout and bottom purchase controls.

## Task 1 — Catalog, shared commerce UI and deep routes

Files: `src/data/products.js`, `src/data/bundles.js`, `src/data/reviews.js`, `src/data/policies.js`, `src/store-ui.js`, `src/media.js`, `src/pages.js`, `scripts/pages.mjs`, build and preview scripts, `tests/store.test.mjs`.

- [ ] Add browser tests for five direct routes, persisted language, nullable/configured purchase states, all four policy routes and unknown-route 404s. Run against current build and observe missing features.
- [ ] Encode confirmed product copy/translations and specs. Parse exact policy paragraph lists from source. Keep review list empty.
- [ ] Extract existing media functions; add shared purchase, price, card, review, footer and header rendering.
- [ ] Render product structure and policy body; generate actual `product/<slug>/index.html` and `policies/<slug>/index.html`. Extend dev serving only for known routes; keep path validation and ranges intact.
- [ ] Verify direct loads and internal assets in source and deployed roots, including trailing slash refreshes.

## Task 2 — Homepage integration and reviews

Files: `src/main.js`, `src/index.html`, `src/store-ui.js`, `src/styles.css`, store tests.

- [ ] Test home feature/card navigation, bundle order/items, empty reviews, filtered/sorted real-shaped fixture reviews, half stars and three-photo dialog keyboard behavior.
- [ ] Replace duplicated real product copy with catalog adapter; use common price/purchase rendering and real detail links. Preserve concept display and video counts.
- [ ] Insert two bundle cards between featured and collection. Reuse review rendering on home and detail. Replace fake social email links with policy links and visible support email.
- [ ] Style new sections to match black/bronze typography; use root-relative assets on deep pages. Keep mobile purchase controls clear of footer and safe-area inset.
- [ ] Expand local font subsets for new text, keeping licenses and the existing three font families.

## Task 3 — Verification and delivery

- [ ] Run `npm run build` and `$env:KIKI_BROWSER_CHANNEL='chrome'; npm test` including store tests.
- [ ] Capture and inspect desktop/mobile product and policy screenshots in both languages; check no horizontal overflow or browser errors and detail video pause/resume.
- [ ] Review diff, update README configuration instructions, commit and push the requested site changes using existing GitHub remote. No force push.

Execution is in this session and in the existing project folder on a feature branch, so the user can continue opening the same folder in Code.
