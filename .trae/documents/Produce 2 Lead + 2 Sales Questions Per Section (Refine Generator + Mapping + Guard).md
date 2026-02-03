## Root Cause
- The per-section refinement currently returns a single "lead" and single "sales" object, so mapping replaces arrays with one item and overrides earlier normalization. 

## Changes
1. Refine Generator → Arrays
- Update refineSectionQuestions to output:
  - leadQuestions: [ { question, options[2–4], tags[2], workflow }, x2 ]
  - salesQuestions: [ { question, options[2–4], tags[2], workflow, optionFlows per option }, x2 ]
- Keep controlled taxonomy (problem/readiness/risk/cause) and workflows enum; synthesize second items if the model returns fewer than 2.

2. Mapping to Storage
- In primary and fallback mapping, consume arrays:
  - sec.leadQuestions = leadQuestions.slice(0, 2)
  - sec.salesQuestions = salesQuestions.slice(0, 2)
- For each question:
  - Enforce options length 2–4 (trim/pad), normalize tags to snake_case
  - For sales, ensure optionFlows exist for each option (synthesize empty flows when missing)

3. Post-Map Guard
- After refinement mapping, run normalization to guarantee:
  - Exactly 2 lead + 2 sales per section
  - Options length 2–4
  - Deterministic workflow routing from tags

4. Prompts Alignment
- Ensure crawl/retry/manual prompts explicitly require 2 lead + 2 sales per section, options 2–4, and full sales optionFlows.

5. Logging
- Add per-section logs (counts generated, synthesized question/flows), so issues are visible.

## Files to Update
- sitemap/route.ts: refineSectionQuestions schema and prompt; mapping blocks in primary and fallback; post-map normalization call
- crawled-pages/route.ts: parity normalization

## Verification
- Re-crawl the Calendly pages you provided
- Confirm structuredSummary.sections[*] has 2 lead and 2 sales questions, each with 2–4 options and complete optionFlows.

## Rollout
- Implement, lint/test, re-crawl, validate counts in DB