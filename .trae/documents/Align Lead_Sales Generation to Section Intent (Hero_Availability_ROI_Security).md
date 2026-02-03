## Goal
- Generate exactly 2 Lead + 2 Sales questions per section, each with 2–4 mutually exclusive option objects {label, tags[], workflow}
- Strictly follow your master prompt and section-specific intent (Hero, Availability, ROI, Security)

## Root Cause
- Current generator doesn’t classify section intent; generic filler and timeline questions slip in, misaligning with Availability/ROI/Security sections
- Normalization pads with generic text, not intent-aligned templates

## Fix Plan
### 1) Section Typing
- Implement classifySectionType(sectionName, summary, keywords):
  - Hero: words like “makes scheduling simple”, intro/benefit copy
  - Availability: “availability”, “rules”, “buffers”, “multi-calendar”
  - ROI: “increase”, “reduce”, “ROI”, metrics
  - Security: “security”, “compliance”, “admin”, “governance”
- Persist section_type for downstream use

### 2) Master Prompt Integration (Verbatim)
- Use your master prompt as the only source for Lead + Sales generation
- Pass section_type explicitly and section context (title/summary/keywords)
- Require options as objects with allowed workflows and tag types

### 3) Deterministic Variant for Second Lead/Sales
- Generate first pair via master prompt, then a complementary second pair by re-calling the prompt with a short “variant directive” tailored to the section_type:
  - Hero: friction axes → coordination vs slot-finding
  - Availability: rule complexity vs calendar conflicts
  - ROI: outcome axis → errors vs volume vs speed
  - Security: posture axis → basic vs formal vs admin/audit

### 4) Validation & Guards
- Enforce per-question options 2–4; dedupe by label
- Validate workflows against enum and tag types (cause/readiness/risk), normalize to snake_case
- Reject timeline/status questions in Availability/ROI/Security (e.g., “How urgent…”, “What stage…”) and synthesize aligned alternatives

### 5) Fallback Templates (Intent-Aligned)
- If model outputs fewer than 2 per type or invalid options, synthesize from per-type templates:
  - Availability Lead: “How controlled is your availability today?”
    - [ad_hoc, rule_based, multi_calendar]
  - ROI Lead: “Which outcome matters most right now?”
    - [reduce_errors, increase_bookings, move_faster]
  - Security Lead: “How important are security and compliance for scheduling data?”
    - [basic_needs, formal_requirements, admin_controls_audit]
  - Sales for each type with short, actionable options matching the intent

### 6) Mapping & Storage
- Store exactly 2 Lead + 2 Sales per section; options as objects; no question-level tags
- Log per section: type, counts, synthesized items, corrections

### 7) Verification
- Re-crawl https://calendly.com and confirm:
  - Section 1 (Hero): friction-focused Lead + maturity-focused Sales
  - Section 2 (Availability): availability rules/constraints
  - Section 3 (ROI): outcome-led questions
  - Section 4 (Security): compliance/admin/governance
- Ensure each question has 2–4 option objects; workflows/tags valid

### 8) Rollout
- Implement classification, prompt wiring, validation, templates
- Lint, run, re-crawl the sample pages and share the corrected questions+options JSON