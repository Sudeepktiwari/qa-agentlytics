## Scope
- Adopt the provided master prompt to generate Lead and Sales questions with option objects (label, tags, workflow) per section.
- Produce exactly 2 Lead and 2 Sales questions per section, each with 2–4 options, using the master prompt as the single source of truth.
- Apply in crawl and manual generation flows; validate option objects and allowed workflows.

## Section Typing
- Classify sections into Hero | Availability | ROI | Security based on section_name and extracted keywords.
- Pass the section type into the generator context to ensure intent-specific questions.

## Generation Strategy
- Implement per-section generator that:
  1) Calls the master prompt once to produce a lead+sales pair
  2) Produces a second, complementary pair deterministically:
     - For Lead: change axis within the same intent (e.g., Hero → coordination vs availability; Availability → rules vs multi-calendar; ROI → outcome dimension; Security → posture vs requirement)
     - For Sales: move from maturity to operational cause (or vice-versa) within the same intent
  3) Ensures options are 2–4, mutually exclusive, and each option is an object {label, tags[], workflow}
- If the second pair cannot be produced by the model, synthesize via deterministic templates tied to section type and keywords.

## Prompt Integration
- Use the master prompt verbatim as the base; for the second pair, add a minimal “variant directive” in preface (e.g., “Generate an alternative question within the same intent, distinct from the previous”).
- Keep outputs strictly to the JSON schema:
  {
    lead: { question: string, options: [{label, tags[], workflow}...] },
    sales: { question: string, options: [{label, tags[], workflow}...] }
  }

## Mapping & Storage
- Store options as objects under each question (no question-level tags).
- Enforce allowed workflows: optimization_workflow | validation_path | education_path | diagnostic_education | sales_alert | role_clarification.
- Normalize tags to snake_case; validate tag types (cause | readiness | risk).
- Ensure 2 Lead + 2 Sales per section, options 2–4 per question.

## Validation & Guards
- After mapping, run a final normalization pass:
  - If options <2, pad with safe deterministic options; if >4, trim.
  - Validate option objects and allowed workflow enum; remove/replace invalid entries.
  - Deduplicate options by label within a question.

## Touch Points
- sitemap/route.ts: per-section generator, section typing, mapping, enforcement.
- crawled-pages/route.ts: manual generation parity and normalization.

## Logging
- Log per section: type, counts generated (lead/sales), options per question, synthesized items, and any workflow/tag corrections.

## Verification
- Re-crawl sample pages and inspect structuredSummary.sections:
  - Each section has 2 Lead + 2 Sales; each question has 2–4 option objects with allowed workflows and valid tags.
- Spot-check Hero/Availability/ROI/Security sections for intent alignment and mutual exclusivity of options.

## Rollout
- Implement changes, lint, run validation on samples, and adjust templates if any intent misalignments occur.