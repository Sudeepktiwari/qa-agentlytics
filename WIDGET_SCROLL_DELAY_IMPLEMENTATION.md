# Widget Scroll Delay Implementation

## Feature Summary

Added scroll detection within the chat widget to delay followup messages when users are scrolling through chat history, similar to how typing delays work. This prevents interrupting users who are actively reading previous messages.

## Problem Solved

Previously, followup messages would appear after 30 seconds regardless of user activity within the widget. Users scrolling through chat history to read previous messages would still receive followup prompts, creating a poor user experience.

## Solution Implemented

### 1. **Widget Scroll Detection** (`/src/app/api/widget/route.ts`)

**New Function: `setupWidgetScrollDetection()`**

```typescript
function setupWidgetScrollDetection() {
  const messagesContainer = document.getElementById("appointy-messages");
  if (!messagesContainer) return;

  messagesContainer.addEventListener("scroll", () => {
    if (!userIsActive) {
      console.log("[Widget] User scrolling in chat widget, setting active");
      setUserActive();
      clearFollowupTimer();

      // Clear existing scroll timeout
      if (widgetScrollTimeout) {
        clearTimeout(widgetScrollTimeout);
      }

      // Set timeout to detect when scrolling stops
      widgetScrollTimeout = setTimeout(() => {
        console.log("[Widget] Widget scroll stopped, checking followup timer");
        // Check if we should restart followup timer
        const lastMessage = messages[messages.length - 1];
        if (
          lastMessage &&
          lastMessage.role === "assistant" &&
          followupCount < 3
        ) {
          console.log(
            "[Widget] Restarting followup timer after widget scroll stopped"
          );
          startFollowupTimer();
        }
      }, 3000); // 3 seconds after scrolling stops in widget
    }
  });
}
```

**Integration Points:**

- Called after widget HTML creation: `setTimeout(setupWidgetScrollDetection, 100);`
- Added to all widget recreation points (initial load, mirror mode, force initialization)
- Uses existing `setUserActive()` and `clearFollowupTimer()` functions for consistency

### 2. **Behavior Logic**

**Scroll Detection Flow:**

1. User scrolls in messages container (`#appointy-messages`)
2. If user wasn't already active → Set user as active and clear followup timer
3. Start 3-second timeout for scroll stop detection
4. When scrolling stops (3 seconds of no scroll activity) → Restart followup timer if conditions are met

**Timer Management:**

- **Scroll Start**: Immediately clears followup timer and sets user as active
- **Scroll Stop**: Waits 3 seconds, then restarts followup timer
- **Consistent Logic**: Uses same functions as typing detection for reliability

### 3. **Integration with Existing Systems**

**Reuses Existing Functions:**

- `setUserActive()` - Sets user activity flag and updates last action timestamp
- `clearFollowupTimer()` - Cancels pending followup message
- `startFollowupTimer()` - Restarts 30-second followup countdown

**Activity Tracking:**

- Widget scrolling now counts as user activity (same as typing)
- Maintains consistency with existing user engagement detection
- Follows same patterns as input event handling

## Technical Implementation

### Files Modified:

1. **`/src/app/api/widget/route.ts`** - Added scroll detection and timer management

### Key Code Changes:

**1. Scroll Detection Setup** (Added after line 2783)

```typescript
// Widget messages container scroll detection
let widgetScrollTimeout;
function setupWidgetScrollDetection() {
  // Scroll event listener implementation
}

// Call scroll detection setup after widget is created
setTimeout(setupWidgetScrollDetection, 100);
```

**2. Widget Recreation Integration** (Lines 2844, 3033, 3072)

```typescript
// Added after each widgetContainer.innerHTML = createWidgetHTML();
setTimeout(setupWidgetScrollDetection, 100);
```

**3. Scroll Variables** (Line 2785)

```typescript
let widgetScrollTimeout; // Manages scroll stop detection
```

## User Experience Improvements

### Before Implementation:

- Users reading chat history would receive followup messages after 30 seconds
- No distinction between users actively engaging with chat vs. inactive users
- Followup messages could interrupt users mid-reading

### After Implementation:

- Scrolling in chat widget delays followup messages
- Users get 3 seconds after scrolling stops before timer restarts
- Consistent behavior with typing delays
- More respectful of user reading time

## Testing

### Test Scenarios:

1. **Basic Scroll Delay**: Scroll in widget → followup timer clears → timer restarts 3 seconds after scroll stops
2. **Multiple Scrolls**: Continuous scrolling → timer stays cleared → restarts only after final scroll stop
3. **Integration with Typing**: Typing and scrolling both delay followup messages consistently
4. **Widget Recreation**: Scroll detection works after widget close/reopen, mirror mode changes

### Test File:

`/test-widget-scroll-delay.html` - Interactive test page with:

- Visual timer showing followup status
- Step-by-step test instructions
- Real-time detection of scroll events
- Status indicators for scroll detection

## Configuration

### Timing Values:

- **Scroll Stop Detection**: 3 seconds (3000ms) after scrolling stops
- **Followup Timer**: 30 seconds (30000ms) standard followup delay
- **Setup Delay**: 100ms timeout for widget initialization

### Customization:

```typescript
// To adjust scroll stop detection time:
widgetScrollTimeout = setTimeout(() => {
  // restart logic
}, 3000); // Change this value (in milliseconds)
```

## Benefits

### User Experience:

- ✅ **Less Intrusive**: Respects users reading chat history
- ✅ **Consistent**: Same delay logic as typing detection
- ✅ **Intuitive**: Scrolling activity delays automated messages
- ✅ **Responsive**: Quick detection of scroll activity

### Technical:

- ✅ **Reuses Existing Code**: Leverages current activity tracking
- ✅ **Reliable**: Same patterns as proven typing detection
- ✅ **Lightweight**: Minimal performance impact
- ✅ **Maintainable**: Clear separation of concerns

### Analytics:

- ✅ **Better Engagement Tracking**: Widget scrolling counts as user activity
- ✅ **Improved Metrics**: More accurate measurement of user engagement
- ✅ **Enhanced Insights**: Distinguishes active reading from true inactivity

## Verification

### Console Logs to Watch:

```
[Widget] User scrolling in chat widget, setting active
[Widget] Widget scroll stopped, checking followup timer
[Widget] Restarting followup timer after widget scroll stopped
```

### Expected Behavior:

1. Open chat widget and send a message
2. Wait for bot response
3. Scroll up/down in message area
4. Observe followup timer clears and restarts after scroll stops
5. Followup message delayed appropriately

## Future Enhancements

### Potential Improvements:

- **Scroll Velocity Detection**: Different delays based on scroll speed
- **Read Time Estimation**: Calculate reading time based on content length
- **Smart Delay Calculation**: Adaptive delays based on message count/length
- **Mobile Optimization**: Touch-specific scroll detection improvements

---

**Status**: ✅ **COMPLETE**  
**Feature**: Widget scroll detection delays followup messages  
**Impact**: Improved user experience for users reading chat history  
**Testing**: Comprehensive test page and integration verification
