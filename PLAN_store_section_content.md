# Plan: Store Crawled Page Text in Structured Summary Sections

## Objective
Ensure `sectionContent` is consistently populated in `structured_summaries` for every section. This enables the chatbot to perform accurate 5-point content overlap matching (exact content matching) in addition to semantic matching.

## Context
- **Current Issue**: `sectionContent` is used in `src/app/api/chat/route.ts` for scoring matches, but it may not be consistently populated across all summary generation paths (especially on-demand generation in `crawled-pages/route.ts`).
- **Goal**: Standardize the extraction of section text (using `[SECTION N]` markers) and ensure it is injected into the structured summary before storage.

## Execution Steps

### 1. Standardize Section Parsing Logic
- **Action**: Create a shared utility `src/lib/parsing.ts`.
- **Content**: Move `parseSectionBlocks` function from `src/app/api/sitemap/route.ts` to this new file.
- **Benefit**: Ensures both the crawler (`sitemap`) and the on-demand generator (`crawled-pages`) use identical logic to split text into sections.

### 2. Refactor `sitemap/route.ts`
- **Action**: Import `parseSectionBlocks` from `src/lib/parsing.ts`.
- **Verify**: Confirm `sectionContent` is already being injected (it appears to be, but using the shared utility ensures consistency).

### 3. Update `crawled-pages/route.ts`
- **Action**:
    - Import `parseSectionBlocks` from `src/lib/parsing.ts`.
    - In `generateDirectSummary` and `generateChunkedSummary` (if applicable), after receiving the JSON from OpenAI:
        - Parse the original `reconstructedContent` using `parseSectionBlocks`.
        - Map the parsed text blocks to the generated summary sections (by index or best match).
        - Inject `sectionContent` into each section of the structured summary.
    - **Crucial**: Update the OpenAI prompt in `crawled-pages/route.ts` to respect `[SECTION N]` markers if they exist in the text, ensuring the LLM generates sections that align with our text blocks.

### 4. Data Migration (Optional but Recommended)
- **Action**: Create a script to backfill `sectionContent` for existing summaries.
- **Logic**:
    - Iterate over all `structured_summaries`.
    - Fetch the corresponding `crawled_pages` entry.
    - Parse the `text` field using `parseSectionBlocks`.
    - Update the `structured_summary` sections with the parsed text.
    - Save back to MongoDB.

## Verification
- **Test**: Generate a summary for a page with `[SECTION]` markers.
- **Check**: Verify in MongoDB that `structured_summaries` entries have `sectionContent` field populated with raw text.
- **Chatbot**: Verify that the chatbot correctly retrieves this section when the user quotes a phrase from it (triggering the 5-point match).
