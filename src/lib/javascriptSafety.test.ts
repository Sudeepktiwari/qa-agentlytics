/**
 * Test for JavaScript Safety Utilities
 * 
 * This tests all the safety utilities to ensure they work correctly
 * before we integrate them into the widget system.
 */

import { 
  JavaScriptSafetyUtils, 
  ResponseValidator, 
  FeatureFlags,
  type SafeChatResponse,
  type BookingType 
} from './javascriptSafety';

/**
 * Test the JavaScriptSafetyUtils class
 */
export function testJavaScriptSafetyUtils(): { passed: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Test 1: Basic escaping
    const result1 = JavaScriptSafetyUtils.escapeForJavaScript("Hello 'world' with \"quotes\"");
    const expected1 = "Hello \\'world\\' with \\\"quotes\\\"";
    if (result1 !== expected1) {
      errors.push(`Escaping test failed. Expected: ${expected1}, Got: ${result1}`);
    }

    // Test 2: Special characters
    const result2 = JavaScriptSafetyUtils.escapeForJavaScript("Line 1\nLine 2\tTabbed");
    const expected2 = "Line 1\\nLine 2\\tTabbed";
    if (result2 !== expected2) {
      errors.push(`Special chars test failed. Expected: ${expected2}, Got: ${result2}`);
    }

    // Test 3: Empty and null handling
    const result3 = JavaScriptSafetyUtils.escapeForJavaScript("");
    if (result3 !== "") {
      errors.push(`Empty string test failed. Expected: "", Got: ${result3}`);
    }

    // Test 4: Validation - safe string
    const safe = JavaScriptSafetyUtils.validateJavaScriptString("Hello world");
    if (!safe) {
      errors.push("Safe string validation failed");
    }

    // Test 5: Validation - dangerous string
    const dangerous = JavaScriptSafetyUtils.validateJavaScriptString("${alert('xss')}");
    if (dangerous) {
      errors.push("Dangerous string validation should have failed");
    }

    // Test 6: Sanitization
    const result6 = JavaScriptSafetyUtils.sanitizeString("<script>alert('xss')</script>", 20);
    if (result6.includes("<script>") || result6.includes("</script>")) {
      errors.push(`Sanitization failed. Got: ${result6}`);
    }

    // Test 7: Safe JS Object creation
    const obj = { name: "John's \"Company\"", age: 30, active: true };
    const result7 = JavaScriptSafetyUtils.createSafeJSObject(obj);
    const parsed = JSON.parse(result7);
    if (parsed.name !== "John\\'s \\\"Company\\\"" || parsed.age !== 30 || parsed.active !== true) {
      errors.push(`Safe JS object creation failed. Got: ${result7}`);
    }

  } catch (error) {
    errors.push(`Unexpected error in JavaScriptSafetyUtils tests: ${error}`);
  }

  return { passed: errors.length === 0, errors };
}

/**
 * Test the ResponseValidator class
 */
export function testResponseValidator(): { passed: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Test 1: Valid response
    const response1 = {
      reply: "Hello! I can help you book a meeting.",
      showBookingCalendar: true,
      bookingType: "demo",
      calendarHtml: "<div>Calendar</div>"
    };
    
    const result1 = ResponseValidator.validateAndSanitize(response1);
    if (!result1.reply.includes("Hello")) {
      errors.push("Valid response validation failed");
    }

    // Test 2: Dangerous reply
    const response2 = {
      reply: "${alert('xss')}",
      showBookingCalendar: true
    };
    
    const result2 = ResponseValidator.validateAndSanitize(response2);
    if (result2.reply.includes("${") || result2.reply.includes("alert")) {
      errors.push(`Dangerous reply should have been sanitized. Got: ${result2.reply}`);
    }

    // Test 3: Invalid booking type
    const response3 = {
      reply: "Hello",
      bookingType: "invalid-type"
    };
    
    const result3 = ResponseValidator.validateAndSanitize(response3);
    if (result3.bookingType !== null) {
      errors.push("Invalid booking type should be null");
    }

    // Test 4: Valid booking types
    const validTypes: BookingType[] = ['demo', 'call', 'consultation', 'support'];
    for (const type of validTypes) {
      const validated = ResponseValidator.validateBookingType(type);
      if (validated !== type) {
        errors.push(`Valid booking type ${type} failed validation`);
      }
    }

    // Test 5: Dangerous HTML
    const dangerousHtml = '<script>alert("xss")</script><div>Content</div>';
    const sanitizedHtml = ResponseValidator.sanitizeHtml(dangerousHtml);
    if (sanitizedHtml !== undefined) {
      errors.push("Dangerous HTML should have been rejected");
    }

    // Test 6: Safe HTML
    const safeHtml = '<div class="calendar"><p>Select a date</p></div>';
    const validatedHtml = ResponseValidator.sanitizeHtml(safeHtml);
    if (validatedHtml !== safeHtml) {
      errors.push("Safe HTML should have been accepted");
    }

  } catch (error) {
    errors.push(`Unexpected error in ResponseValidator tests: ${error}`);
  }

  return { passed: errors.length === 0, errors };
}

/**
 * Test feature flags
 */
export function testFeatureFlags(): { passed: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Test that feature flags return boolean values
    const flags = FeatureFlags.getAllFlags();
    
    for (const [key, value] of Object.entries(flags)) {
      if (typeof value !== 'boolean') {
        errors.push(`Feature flag ${key} should be boolean, got ${typeof value}`);
      }
    }

    // Test individual flag access
    const bookingDetection = FeatureFlags.isEnabled('BOOKING_DETECTION');
    if (typeof bookingDetection !== 'boolean') {
      errors.push("Feature flag access should return boolean");
    }

  } catch (error) {
    errors.push(`Unexpected error in FeatureFlags tests: ${error}`);
  }

  return { passed: errors.length === 0, errors };
}

/**
 * Run all tests
 */
export function runAllSafetyTests(): { 
  allPassed: boolean; 
  results: Record<string, { passed: boolean; errors: string[] }>;
  summary: string;
} {
  const results = {
    JavaScriptSafetyUtils: testJavaScriptSafetyUtils(),
    ResponseValidator: testResponseValidator(),
    FeatureFlags: testFeatureFlags()
  };

  const allPassed = Object.values(results).every(r => r.passed);
  
  const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors.length, 0);
  const summary = allPassed 
    ? "✅ All safety utility tests passed!"
    : `❌ ${totalErrors} test(s) failed. See details above.`;

  return { allPassed, results, summary };
}

/**
 * Demo function to show how these utilities would be used in widget generation
 */
export function demonstrateSafeWidgetGeneration(): string {
  // Simulate a response that might come from the AI
  const aiResponse = {
    reply: "Great! I can help you book a demo. Let's find a time that works for you.",
    showBookingCalendar: true,
    bookingType: "demo" as BookingType,
    calendarHtml: '<div class="booking-calendar"><h3>Select a Date</h3></div>'
  };

  // Validate and sanitize the response
  const safeResponse = ResponseValidator.validateAndSanitize(aiResponse);

  // Generate safe widget JavaScript
  const widgetJs = `
    // Safe widget update function
    function updateChatWidget() {
      var response = ${JavaScriptSafetyUtils.createSafeJSObject(safeResponse)};
      
      // Update the chat display safely
      var messageDiv = document.createElement('div');
      messageDiv.className = 'chat-message ai-message';
      messageDiv.textContent = "${safeResponse.reply}";
      
      document.getElementById('chat-messages').appendChild(messageDiv);
      
      // Show calendar if needed
      if (response.showBookingCalendar && response.calendarHtml) {
        var calendarDiv = document.getElementById('booking-calendar');
        if (calendarDiv) {
          calendarDiv.innerHTML = response.calendarHtml;
          calendarDiv.style.display = 'block';
        }
      }
    }
    
    // Call the update function
    updateChatWidget();
  `;

  return widgetJs;
}
