# Bot Mode Indicator Feature

## Overview

The chatbot now displays a visual indicator showing whether it's operating in "Lead Generation Mode" or "Sales Mode". This helps developers and administrators debug response quality and understand the bot's current behavioral state.

## Visual Design

### Lead Generation Mode

- **Badge Color:** Purple background (`#f3e5f5`) with purple text (`#7b1fa2`)
- **Border:** Light purple (`#e1bee7`)
- **Text:** "LEAD MODE"
- **When Active:** Before user provides email address

### Sales Mode

- **Badge Color:** Blue background (`#e3f2fd`) with blue text (`#1976d2`)
- **Border:** Light blue (`#bbdefb`)
- **Text:** "SALES MODE • user@email.com"
- **When Active:** After user provides email address

## Technical Implementation

### Backend Changes

**File:** `src/app/api/chat/route.ts`

- Added `botMode` detection based on email presence
- Enhanced all response types with `botMode` and `userEmail` fields
- Covers: main responses, proactive messages, followup messages, fallback responses

### Frontend Changes

**File:** `src/app/components/Chatbot.tsx`

- Added state tracking for `currentBotMode` and `currentUserEmail`
- Updated all API response handlers to track mode changes
- Added visual indicator in chatbot header
- Enhanced TypeScript interfaces to support new fields

### Mode Detection Logic

```typescript
// In chat API route
const botMode = userEmail ? "sales" : "lead_generation";

// Response enhancement
return NextResponse.json({
  answer: response,
  botMode,
  userEmail: userEmail || null,
});
```

### State Management

```typescript
// In Chatbot component
const [currentBotMode, setCurrentBotMode] = useState<
  "sales" | "lead_generation"
>("lead_generation");
const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

// Update tracking on API responses
if (data.botMode) {
  setCurrentBotMode(data.botMode);
}
if (data.userEmail !== undefined) {
  setCurrentUserEmail(data.userEmail);
}
```

## Usage for Debugging

### Identifying Response Issues

1. **Lead Mode Issues:** Check responses when indicator shows "LEAD MODE"

   - Focus on qualification questions
   - Verify lead capture strategies
   - Check proactive messaging

2. **Sales Mode Issues:** Check responses when indicator shows "SALES MODE"
   - Review sales-focused responses
   - Verify personalization with email
   - Check follow-up sequences

### Testing Scenarios

1. **Mode Transition:** Provide email and verify indicator switches from purple "LEAD MODE" to blue "SALES MODE"
2. **Persistence:** Refresh page and verify mode persists if email was previously provided
3. **Multiple Sessions:** Test with different emails to verify proper mode switching

## Benefits

### For Developers

- **Real-time Mode Awareness:** Instantly see which behavioral mode is active
- **Debugging Context:** Understand response context when investigating issues
- **Testing Validation:** Verify mode transitions work correctly

### For Administrators

- **Response Quality Analysis:** Correlate response quality with bot mode
- **User Journey Tracking:** See progression from lead to sales mode
- **Troubleshooting:** Identify mode-specific response issues

## Implementation Files

### Modified Files

- `/src/app/api/chat/route.ts` - Backend mode detection and response enhancement
- `/src/app/components/Chatbot.tsx` - Frontend indicator and state management

### Test Files

- `/test-bot-mode-indicator.html` - Dedicated test page for mode indicator functionality

## Future Enhancements

### Potential Improvements

1. **Mode History:** Track mode transitions over time
2. **Custom Styling:** Allow theme customization for different deployments
3. **Extended Modes:** Support additional bot modes (support, consultation, etc.)
4. **Analytics Integration:** Log mode-specific metrics for analysis

### Configuration Options

```typescript
interface BotModeConfig {
  showIndicator: boolean;
  leadModeColor: string;
  salesModeColor: string;
  showUserEmail: boolean;
}
```

## Troubleshooting

### Common Issues

1. **Indicator Not Updating:** Check API response includes `botMode` field
2. **Wrong Mode Display:** Verify email detection logic in backend
3. **Styling Issues:** Check CSS specificity and container constraints

### Debug Steps

1. Check browser console for API response data
2. Verify state updates in React DevTools
3. Test email extraction logic with various input formats
4. Validate mode persistence across page refreshes
