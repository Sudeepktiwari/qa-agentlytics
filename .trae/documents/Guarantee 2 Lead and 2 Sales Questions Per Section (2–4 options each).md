## Scope
- Enforce exactly 2 lead and 2 sales questions for every section on every page
- Ensure each question has 2–4 contextual options
- Generate deterministic tags/workflows per option and complete diagnostic scripts (answer, follow-up, loop closure) for sales options

## Files to Update
- Sitemap crawl generation: [route.ts](file:///Users/appointy/Desktop/CodeRepos/qa-agentlytics/src/app/api/sitemap/route.ts)
- Manual/On-demand generation: [route.ts](file:///Users/appointy/Desktop/CodeRepos/qa-agentlytics/src/app/api/crawled-pages/route.ts)

## Implementation Steps
1. Prompt Requirements (both endpoints)
- Update system/user prompts to require:
  - Exactly 2 lead and 2 sales questions per section
  - Each question’s options length: 2–4
  - Option-level tags from a controlled taxonomy and deterministic workflow mapping rules
- Include per-section context (page_url, page_type, section_id, heading, extracted keywords)

2. Section Refinement Generator
- Expand refineSectionQuestions to output arrays:
  - leadQuestions[2], salesQuestions[2]
  - Each question options: [{ label, tags[], workflow }] with 2–4 entries
  - Sales option flows: diagnostic_answer, follow_up(question+options with cause tags), loop_closure
- Pass controlled vocabularies:
  - Problem/readiness/risk tags, cause tags, workflows enum, feature registry (for later mapping)
- Keywords extractor: keep and use to guide contextual generation

3. Mapping to Storage Structure
- Lead:
  - Map to leadQuestions[0..1] with options (enforce 2–4), aggregate tags to question-level and keep option-level tags/workflow in a new field leadOptionRoutes (per option)
- Sales:
  - Map to salesQuestions[0..1] with options (2–4)
  - For each option, store optionFlows: diagnosticAnswer, followUpQuestion, followUpOptions (cause options), loopClosure
  - Persist option-level tags/workflow alongside optionFlows for deterministic routing

4. Normalization & Validation
- Enforce counts:
  - If fewer than 2 lead/sales: synthesize additional contextual question using section summary
  - If more than 2: take the most contextual 2
- Enforce options length:
  - If <2: synthesize to 2; if >4: trim to 4
- Tag normalization:
  - snake_case; restrict to allowed taxonomy; 2-tag minimum per option (problem/readiness + risk/readiness)
- Workflow assignment:
  - Apply rules based on tags (ask_sales_question, validation_path, education_path, optimization_workflow, diagnostic_education, sales_alert, role_clarification)

5. Fallback Consistency
- When primary structured summary fails:
  - Build sections from [SECTION N] blocks
  - Run refinement generator to produce 2 lead & 2 sales questions with scripts
  - Apply normalization/validation rules identically

6. Manual Generation Parity
- Mirror the same prompt, refinement, mapping, and validation in the on-demand API so regenerated pages follow the same rules

7. Tests & Verification
- Unit tests for:
  - Option length enforcement (2–4)
  - Tag normalization and workflow routing
  - Count enforcement (2 lead + 2 sales)
- Integration check:
  - Re-crawl a sample page and verify MongoDB document shows per-section leadQuestions[2], salesQuestions[2], and populated optionFlows per sales option

## Compatibility & Migration
- Maintain backward compatibility:
  - Accept existing string options; normalize into structured option objects when missing
  - Existing records unchanged; new crawls get enriched structure

## Rollout
- Implement changes
- Run lint/tests
- Re-crawl a target page for validation
- Monitor logs for parse/validation messages

## Confirmation
- Once approved, I will implement the above, run a validation crawl, and share the resulting document fields for review.