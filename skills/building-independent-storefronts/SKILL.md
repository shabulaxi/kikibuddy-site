---
name: building-independent-storefronts
description: Use when turning a brand website, product catalog, or visual concept into a direct-to-consumer online storefront, or when improving its product, checkout, localization, and launch experience.
---

# Building Independent Storefronts

Help a brand move from a brochure or visual concept to a usable direct-to-consumer storefront. Keep the existing stack and design language where they fit, and make important catalog and purchasing behavior traceable to explicit data.

## Understand the inputs

- Inspect the existing site, framework, routes, design system, responsive behavior, tests, and hosting setup before choosing an implementation.
- Read supplied brand briefs, product sheets, pricing, policies, and asset folders as distinct sources. Map each product and claim to its source and note missing or conflicting values.
- When several source files are involved, keep a concise working inventory mapping each catalog field and image to its source and marking unresolved inputs.
- Use supplied image and video files only after confirming their actual paths and filenames. A requested filename is not evidence that a file exists. Keep existing working assets until replacements are present and verified.
- Preserve the supplied brand voice and visual identity. Keep product names, claims, prices, policies, ingredients, measurements, and translations faithful to source materials; omit or flag unconfirmed facts rather than guessing.

## Build the shopping experience

- Structure product content in a catalog that drives product cards, collection views, product details, prices, availability, and calls to action. Avoid duplicating commercial values across templates.
- Make the buying action match the real integration: a configured checkout or purchase URL can be opened as intended; a missing price or destination stays clearly unavailable rather than looking purchasable. Never imply that a demo form, cart, payment, or email signup has a working backend when it does not.
- Add collection navigation and the detail, bundle, review, policy, about, or service pages requested for this store. Reuse components when their behavior is genuinely shared.
- Store genuine customer reviews separately from product copy. Empty review data shows a clear empty state without invented quotes, ratings, or summary statistics. Build bundles from catalog product identifiers so names and images stay in sync.
- Support each requested language across navigation, content, pricing, purchasing states, policies, accessibility labels, and errors. Keep language changes on the shopper's current page when practical.
- Keep policies grounded in supplied business terms. Preserve explicit placeholders and unresolved details; do not invent refund periods, shipping promises, legal entities, jurisdictions, or privacy practices.

## Check before launch

- Run the project's build and relevant tests. Cover direct route loads and refreshes, unknown pages, catalog links, price and purchase states, empty reviews, image URLs, and policy navigation.
- Inspect real browser renders at desktop and mobile sizes and in every supported language. Check readable content, keyboard focus, accessible image/dialog controls, media behavior, no broken assets, and no horizontal overflow.
- Before launch, resolve uncertainties that affect product claims, displayed terms, prices, images, or purchase actions, or show a truthful pending/unavailable state. Compare deployed product copy, pricing, and imagery against the supplied sources.
- Verify the exact production hostname and representative deep links after deployment; a successful commit or CI run alone does not prove the intended store is live. If multiple hosts differ, establish which one is canonical before changing domains or DNS. Report access or deployment limits accurately.
