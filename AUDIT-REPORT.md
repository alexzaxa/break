# Website readiness audit — 24 August 2026

1. Privacy policy: added `privacy.html`.
2. Terms page: added `terms.html`.
3. Clear CTA: retained menu, directions and telephone CTAs; added contact inquiry CTA.
4. FAQ: added accessible FAQ page with FAQPage structured data.
5. robots.txt: verified and linked to the sitemap.
6. sitemap.xml: updated with every indexable page.
7. Custom 404: retained and changed to `noindex,follow`.
8. Alt text: verified all content images have descriptive Greek alternatives.
9. Analytics: consent-gated integration hook added; connect a provider to the `xylino:analytics-consent` event before launch if analytics are required.
10. Meta titles: unique titles are present on every indexable page.
11. Meta descriptions: unique descriptions are present on every indexable page.
12. Social share: Open Graph and X metadata use the existing 1200×630 cover.
13. Favicon: ICO, PNG and Apple Touch icons retained; web manifest added.
14. Canonical URLs: verified and added to new pages.
15. Cookie consent: opt-in banner, persistent choice and settings control added. The Google map is blocked before consent.
16. Mobile version: existing responsive navigation/layout retained; legal, form and cookie components made responsive.
17. Accessibility: skip links, focus styles, labels, live validation status, keyboard controls and reduced-motion behavior present.
18. Forms: added required-field validation and privacy acceptance. The static form opens the visitor's email client; no personal data is stored on the website.
19. Broken links: internal targets and local assets checked by the included audit.
20. Performance: WebP images, explicit image dimensions, lazy loading below the fold, deferred JavaScript and long-lived asset caching are enabled.

Before publishing, confirm the legal text with the business owner, add the correct recipient email to the form if desired, and validate the live production headers because `_headers` support depends on the host.
