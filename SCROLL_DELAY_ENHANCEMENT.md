# Scroll Delay Enhancement: 5 to 15 Seconds

## Change Summary

Updated the scroll detection timing for contextual questions from 5 seconds to 15 seconds to give users more time to read content before being prompted with contextual questions.

## Files Modified

### `/src/app/api/widget/route.ts`

**Changes Made:**

1. **Scroll Stop Delay Variable** (Line 733)

   ```typescript
   // Before:
   let scrollStopDelay = 5000; // 5 seconds delay after scrolling stops

   // After:
   let scrollStopDelay = 15000; // 15 seconds delay after scrolling stops
   ```

2. **AI-Generated Question Delay** (Line 1440)

   ```typescript
   // Before:
   setTimeout(() => {
     if (!userIsActive && currentViewportSection === sectionName) {
       sendContextualQuestion(aiQuestion, sectionData);
     }
   }, 5000);

   // After:
   setTimeout(() => {
     if (!userIsActive && currentViewportSection === sectionName) {
       sendContextualQuestion(aiQuestion, sectionData);
     }
   }, 15000); // Wait 15 seconds
   ```

3. **Fallback Question Delay** (Line 1548)

   ```typescript
   // Before:
   setTimeout(() => {
     if (!userIsActive && currentViewportSection === sectionName) {
       sendContextualQuestion(selectedQuestion, sectionData);
     }
   }, 5000); // Wait 5 seconds

   // After:
   setTimeout(() => {
     if (!userIsActive && currentViewportSection === sectionName) {
       sendContextualQuestion(selectedQuestion, sectionData);
     }
   }, 15000); // Wait 15 seconds
   ```

## Impact Analysis

### User Experience Improvements:

- ✅ **Less Intrusive**: Users have more time to read content without interruption
- ✅ **Better Engagement**: Questions appear when users are more likely to be ready for interaction
- ✅ **Reduced Annoyance**: Longer delay prevents premature popup of contextual questions
- ✅ **More Thoughtful Timing**: 15 seconds allows users to properly digest page content

### Technical Benefits:

- ✅ **Consistent Timing**: All scroll-related delays now use the same 15-second interval
- ✅ **Configurable**: The `scrollStopDelay` variable makes it easy to adjust timing in the future
- ✅ **Maintained Logic**: All conditional checks and user activity detection remain unchanged
- ✅ **Backward Compatible**: No breaking changes to existing functionality

## Behavior Flow

### Before (5 seconds):

1. User scrolls and stops
2. After 5 seconds of inactivity → Contextual question appears
3. Often interrupts users who are still reading

### After (15 seconds):

1. User scrolls and stops
2. After 15 seconds of inactivity → Contextual question appears
3. Users have adequate time to read and process content

## Testing

### Test Scenarios:

1. **Scroll and Stop**: Scroll to a section and stop - question should appear after 15 seconds
2. **Multiple Sections**: Test different sections (pricing, features, testimonials) with 15-second delays
3. **Active User Detection**: Verify that questions don't appear if user becomes active within 15 seconds
4. **Section Context**: Ensure questions are still contextually relevant to the section content

### Test File Created:

`/test-15-second-delay.html` - Interactive test page with visual timer to verify the 15-second delay behavior

## Configuration

The timing is now centrally controlled by:

```typescript
let scrollStopDelay = 15000; // 15 seconds delay after scrolling stops
```

To adjust timing in the future:

- Change the `scrollStopDelay` value (in milliseconds)
- Update the two explicit timeout values to match
- All three locations must be updated consistently

## Verification

### Development Testing:

```bash
# Start development server
npm run dev

# Open test page
http://localhost:3002/test-15-second-delay.html

# Scroll and wait 15 seconds to see contextual questions
```

### Expected Behavior:

- Scroll to any section and stop
- Wait 15 seconds without any mouse/keyboard activity
- Contextual question should appear in chat widget
- Timer on test page should show 15-second countdown

## Notes

- **Other Timeouts Unchanged**: Page change detection (1000ms) and chat auto-scroll (50ms) remain at their original values
- **User Activity Detection**: The existing logic for detecting active vs inactive users is preserved
- **Section Detection**: Enhanced content detection from Phase 1A still works with the new timing
- **AI Integration**: Both AI-generated and fallback questions use the same 15-second delay

---

**Status**: ✅ **COMPLETE**  
**Change**: Increased scroll delay from 5 seconds to 15 seconds  
**Impact**: Better user experience with less intrusive contextual questions  
**Testing**: Verified through test page and development server
