## Problem
- First and second sections repeat across pages (e.g., “Untitled Section”, “The State of Meetings 2024”), indicating global site chrome/promo blocks are being captured as sections and empty headings are creating "Untitled Section".

## Root Causes
- Extractor includes header/nav/footer and banners into the text stream
- Section builder accepts empty headings → defaults to "Untitled Section"
- Global promo content (e.g., recurring site banner) is not filtered and appears as a real section
- Fallback builder splits on headings without validating content density/uniqueness

## Fix Plan
1. Content Extraction Hardening
- Target main content containers only: prefer <main>, <article>, [role="main"], and known content wrappers
- Exclude common chrome: header, nav, footer, aside, cookie banners, newsletter modals, and off-canvas menus
- Strip low-signal blocks (login/signup/CTA clusters) and dedupe repeated phrases

2. Section Detection & Labeling
- Build sections only from headings inside main content: h1–h4
- If a heading is empty, infer a title from the first meaningful sentence or bold/strong text in the block
- Add content-density threshold: drop sections whose body is mostly nav/cta keywords or < 120 chars after noise stripping
- De-duplicate sections: hash the body; skip identical bodies within a page
- Suppress known global promo headings (e.g., "The State of Meetings 2024") unless page_type looks like a report page

3. Fallback Structured Summary Builder
- Use the hardened section list; never create "Untitled Section"—always infer a title
- Enforce per-section uniqueness and minimum content, discarding noise sections

4. Normalization & Counts (unchanged rules kept)
- Guarantee 2 lead + 2 sales questions per section; if the generator returns fewer, synthesize the missing one from the section summary
- Enforce options length: 2–4; trim/add accordingly
- Keep tag normalization and deterministic workflow routing

5. Logging & Diagnostics
- Add debug logs indicating which blocks were excluded (header/nav/footer, promo) and which sections were dropped (low content/duplicate/promo)
- Include a "section_origin" flag (main/promo/derived) for audit

6. Verification
- Re-crawl two sample pages:
  - https://calendly.com/blog/growth-and-productivity
  - https://calendly.com/blog/scheduling
- Confirm first two sections now reflect real page content and titles, and promo/global header blocks are excluded
- Spot-check option counts (2–4) and question counts (2 per type) per section

## Files to Update
- sitemap/route.ts: extractor and section builder; fallback builder; logs
- crawled-pages/route.ts: parity in normalization and enforcement

## Rollout
- Implement extractor changes → run lint → re-crawl sample → review structuredSummary.sections
- If domain-specific noise persists, add a small, configurable suppression list per domain