## Issue
- Current per-section refinement maps a single lead and single sales question, overriding earlier normalization. Stored structuredSummary shows only one of each per section.

## Fix Strategy
- Generate arrays of two questions per type in refinement AND enforce counts after mapping.

## Changes
1. Update per-section refinement generator
- Return arrays:
  - leadQuestions: [2 items], each with 2–4 options, normalized tags and deterministic workflow (ask_sales_question|validation_path|education_path)
  - salesQuestions: [2 items], each with 2–4 options and complete optionFlows (diagnostic_answer, follow_up question + cause options, loop_closure)
- Keep controlled taxonomy (problem/readiness/risk/cause tags) and workflows enum.
- If the model produces fewer than 2 items for either type, synthesize the missing one using deterministic templates driven by section_summary/keywords.

2. Mapping to storage
- Replace section mapping to consume arrays:
  - sec.leadQuestions = leadArr.slice(0, 2)
  - sec.salesQuestions = salesArr.slice(0, 2)
- For each question:
  - Enforce options length between 2 and 4 (trim/pad safely)
  - Normalize tags to snake_case and restrict to allowed taxonomy
  - For sales question, ensure optionFlows exist for all options; synthesize empty flows if missing (to be filled later)

3. Post-map normalization (final guard)
- After refinement mapping, run normalization to guarantee:
  - Exactly 2 lead + 2 sales per section
  - Options length 2–4 for every question
  - Deterministic workflow routing via tag rules

4. Prompts alignment
- Confirm crawl and manual prompts explicitly require 2 lead + 2 sales per section with 2–4 options, and complete sales option flows.

5. Logging & diagnostics
- Add logs per section indicating:
  - Generated counts for lead/sales
  - Options count per question
  - Any synthesized questions/options/flows

6. Verification
- Re-crawl:
  - https://calendly.com/blog/growth-and-productivity
  - https://calendly.com/blog/scheduling
- Validate that each section now contains exactly 2 lead and 2 sales questions, each with 2–4 options, and sales optionFlows present for each option.

## Scope
- sitemap/route.ts: refinement to arrays, mapping enforcement, final normalization call
- crawled-pages/route.ts: parity enforcement

## Rollout
- Implement changes, run lint/tests, re-crawl sample URLs, compare stored structuredSummary to confirm counts/options/flows.
