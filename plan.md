# Plan: Show Lead-Option Diagnostic Answer Flow in Chat

## Goal
When a user clicks a Lead Question option (rendered as buttons in chat), the chatbot should display the stored diagnostic answer for that option (from `structured_summaries`) and render that diagnostic answer’s options as the next set of chat buttons.

## Current Behavior (Baseline)
- Backend returns a Lead Question as `{ mainText, buttons }`, where `buttons` are derived from `structuredSummary.sections[].leadQuestions[0].options`.
- Frontend renders `msg.buttons` as clickable buttons.
- Clicking a button currently just sends the button label as a normal user message to `/api/chat`, with no additional context tying the click back to the specific lead question message.

## Proposed Approach (Deterministic, No Session-State Dependency)
### 1) Include “button click context” in the request
- On button click, send the usual user message plus a structured payload that includes:
  - `clickedLabel`: the option label that was clicked
  - `parentMessage`: the assistant message that contained the buttons (at minimum: `content` and `buttons`)
  - Optional: `parentKind` = `"lead_question"` to disambiguate from other button types

Rationale:
- The frontend already knows which assistant message produced the button (it’s passed into `handleActionClick(action, msg)`).
- This lets the backend reliably locate the relevant lead question inside `structured_summaries` without relying on server-side session memory or fragile string heuristics.

### 2) Backend: add a “lead option diagnostic resolver”
Implement a resolver in `src/app/api/chat/route.ts` that runs early in the request flow:
- Trigger condition:
  - Request contains `buttonClickContext` (or similar field) AND `parentKind === "lead_question"` (or `parentMessage.content` matches a lead question).
- Resolution logic:
  1. Load the `structuredSummary` for `(adminId, pageUrl)` using the existing lookup helper.
  2. Find the lead question whose `question` matches `parentMessage.content` (normalize whitespace) and which has an option whose label matches `clickedLabel`.
  3. If found and the option object has:
     - `diagnostic_answer` (string), and
     - `diagnostic_options` (string[]),
     return an immediate JSON response:
     - `mainText`: `diagnostic_answer`
     - `buttons`: `diagnostic_options` (sanitized and filtered)
     - `emailPrompt`: `""`
     - Optional metadata: `diagnostic: true`, `source: "structured_summary"`
  4. If not found, fall back to the existing normal chat response path (LLM / existing follow-up logic).

Notes:
- `structuredSummary` options may be either strings or objects. Only object options can carry `diagnostic_answer`/`diagnostic_options`.
- Use existing label normalization (same mapping used for `buttons`) so matching is consistent (`string` option equals label; object option uses `.label`).

### 3) Frontend: pass click context to `/api/chat`
Update `src/app/components/Chatbot.tsx`:
- Extend the `Message` type locally (frontend-only) to optionally store:
  - `kind?: "lead_question" | "generic" | ...` (minimal), OR
  - compute `kind` at click time by checking if the message came from a lead-question request.
- In `handleActionClick(action, msg)`, call `sendMessage` with a second optional argument or internal flag to include:
  - `buttonClickContext: { clickedLabel: action, parentMessage: { content: msg.content, buttons: msg.buttons } , parentKind: msg.kind ?? "generic" }`
- Ensure the normal text “user message bubble” still appears as today (user clicked option shows as user text).

### 4) Rendering: show the diagnostic answer as a normal assistant message
- No new UI components required:
  - The backend returns `{ mainText, buttons }`, which `parseBotResponse` and the existing message rendering already support.
- The diagnostic answer’s `buttons` show as the next clickable options.

## Edge Cases & Handling
- Option exists but missing `diagnostic_answer`: fallback to normal chat generation (or show a short safe fallback message).
- Option exists but `diagnostic_options` is empty: show diagnostic answer with no buttons (or provide 2-3 default CTAs).
- Multiple sections contain same lead question text: prefer the match where the option label also matches; if still ambiguous, pick the first match.
- Sanitization: reuse existing frontend `sanitizeButtonLabel` and backend-side trimming to avoid `[object Object]` labels.

## Acceptance Criteria
- Clicking a Lead Question option immediately results in an assistant message containing the stored diagnostic answer text.
- The assistant message includes buttons equal to that option’s diagnostic options (2+ when available).
- Non-lead buttons (or free-typed user text) continue to behave exactly as before.
- If the structured diagnostic payload cannot be resolved, the chat falls back gracefully to the existing AI response.

## Verification Plan
- Add/extend a minimal backend unit/integration test (or a dev-only script) that:
  - Mocks a `structuredSummary` with a lead question option carrying `diagnostic_answer` and `diagnostic_options`.
  - Sends a `/api/chat` request with `buttonClickContext` and verifies the response body returns the diagnostic answer and buttons.
- Manual check in UI:
  - Trigger a lead question (via proactive/follow-up).
  - Click an option and confirm the diagnostic answer + next options render in chat.

