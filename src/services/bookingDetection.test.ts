/**
 * Test script for Booking Detection API
 *
 * This tests the booking detection service to ensure it works correctly
 * before integrating it into the main chat system.
 */

import {
  detectBookingIntent,
  generateBookingResponse,
  enhanceChatWithBookingDetection,
} from "./bookingDetection";

/**
 * Test cases for booking intent detection
 */
const testCases = [
  // Strong booking intent
  {
    message: "I'd like to schedule a demo",
    expected: { hasIntent: true, confidence: ">= 80", type: "demo" },
  },
  {
    message: "Can we book a call to discuss this?",
    expected: { hasIntent: true, confidence: ">= 70", type: "call" },
  },
  {
    message: "I want to schedule a consultation",
    expected: { hasIntent: true, confidence: ">= 80", type: "consultation" },
  },
  {
    message: "I need help setting this up, can someone help me?",
    expected: { hasIntent: true, confidence: ">= 60", type: "support" },
  },

  // Moderate booking intent
  {
    message: "I'd like to learn more about your services",
    expected: { hasIntent: true, confidence: "50-80", type: "call" },
  },
  {
    message: "Can someone walk me through this?",
    expected: { hasIntent: true, confidence: "50-70", type: "support" },
  },

  // No booking intent
  {
    message: "What features do you have?",
    expected: { hasIntent: false, confidence: "< 50" },
  },
  {
    message: "How much does this cost?",
    expected: { hasIntent: false, confidence: "< 50" },
  },
  {
    message: "Tell me about your company",
    expected: { hasIntent: false, confidence: "< 50" },
  },
];

/**
 * Run booking detection tests
 */
export async function testBookingDetection(): Promise<{
  passed: boolean;
  results: any[];
}> {
  const results = [];
  let allPassed = true;

  // console.log("🔍 Testing Booking Detection Service...\n");

  for (const testCase of testCases) {
    try {
      // console.log(`Testing: "${testCase.message}"`);

      const result = await detectBookingIntent(testCase.message);

      // Check if intent detection matches expectation
      const intentMatch =
        result.hasBookingIntent === testCase.expected.hasIntent;

      // Check confidence level
      let confidenceMatch = false;
      if (testCase.expected.confidence === "< 50") {
        confidenceMatch = result.confidence < 50;
      } else if (testCase.expected.confidence === ">= 70") {
        confidenceMatch = result.confidence >= 70;
      } else if (testCase.expected.confidence === ">= 80") {
        confidenceMatch = result.confidence >= 80;
      } else if (testCase.expected.confidence === "50-80") {
        confidenceMatch = result.confidence >= 50 && result.confidence <= 80;
      } else if (testCase.expected.confidence === "50-70") {
        confidenceMatch = result.confidence >= 50 && result.confidence <= 70;
      }

      // Check booking type if intent detected
      let typeMatch = true;
      if (result.hasBookingIntent && testCase.expected.type) {
        typeMatch = result.bookingType === testCase.expected.type;
      }

      const testPassed = intentMatch && confidenceMatch && typeMatch;
      if (!testPassed) allPassed = false;

      const status = testPassed ? "✅" : "❌";
      // console.log(
      //   `${status} Intent: ${result.hasBookingIntent}, Confidence: ${result.confidence}%, Type: ${result.bookingType}`
      // );

      if (result.reasoning) {
        // console.log(`   Reasoning: ${result.reasoning}`);
      }

      results.push({
        message: testCase.message,
        expected: testCase.expected,
        actual: {
          hasIntent: result.hasBookingIntent,
          confidence: result.confidence,
          type: result.bookingType,
        },
        passed: testPassed,
      });
    } catch (error) {
      allPassed = false;
      // console.log(`❌ Error testing "${testCase.message}":`, error);
      results.push({
        message: testCase.message,
        expected: testCase.expected,
        actual: {
          error: error instanceof Error ? error.message : String(error),
        },
        passed: false,
      });
    }

    // console.log(""); // Empty line for readability
  }

  return { passed: allPassed, results };
}

/**
 * Test booking response generation
 */
export async function testBookingResponseGeneration(): Promise<{
  passed: boolean;
  results: any[];
}> {
  const results = [];
  let allPassed = true;

  // console.log("💬 Testing Booking Response Generation...\n");

  const testCases = [
    {
      intent: {
        hasBookingIntent: true,
        confidence: 85,
        bookingType: "demo" as const,
        suggestedResponse: null,
      },
      message: "I'd like to schedule a demo",
    },
    {
      intent: {
        hasBookingIntent: true,
        confidence: 75,
        bookingType: "call" as const,
        suggestedResponse: null,
      },
      message: "Can we talk about this?",
    },
  ];

  for (const testCase of testCases) {
    try {
      // console.log(`Testing response for: "${testCase.message}"`);

      const response = await generateBookingResponse(
        testCase.intent,
        testCase.message,
      );

      // Validate response structure
      const hasReply =
        typeof response.reply === "string" && response.reply.length > 0;
      const hasValidBookingType =
        response.bookingType === testCase.intent.bookingType;
      const hasCalendarFlag = response.showBookingCalendar === true;

      const testPassed = hasReply && hasValidBookingType && hasCalendarFlag;
      if (!testPassed) allPassed = false;

      const status = testPassed ? "✅" : "❌";
      // console.log(`${status} Response generated successfully`);
      // console.log(`   Reply: "${response.reply}"`);
      // console.log(`   Show Calendar: ${response.showBookingCalendar}`);
      // console.log(`   Booking Type: ${response.bookingType}`);

      results.push({
        message: testCase.message,
        intent: testCase.intent,
        response,
        passed: testPassed,
      });
    } catch (error) {
      allPassed = false;
      // console.log(
      //   `❌ Error generating response for "${testCase.message}":`,
      //   error
      // );
      results.push({
        message: testCase.message,
        intent: testCase.intent,
        response: {
          error: error instanceof Error ? error.message : String(error),
        },
        passed: false,
      });
    }

    // console.log(""); // Empty line for readability
  }

  return { passed: allPassed, results };
}

/**
 * Test enhanced chat processing
 */
export async function testEnhancedChatProcessing(): Promise<{
  passed: boolean;
  results: any[];
}> {
  const results = [];
  let allPassed = true;

  // console.log("🚀 Testing Enhanced Chat Processing...\n");

  const testMessages = [
    "I'd like to book a demo",
    "What are your pricing options?",
    "Can someone help me get started?",
    "Tell me more about your features",
  ];

  for (const message of testMessages) {
    try {
      // console.log(`Testing enhanced processing for: "${message}"`);

      const result = await enhanceChatWithBookingDetection(message, [
        "Hello!",
        "I'm interested in your product",
      ]);

      // Validate result structure
      const hasChatResponse =
        result.chatResponse && typeof result.chatResponse.reply === "string";
      const hasBookingIntent =
        typeof result.bookingIntent.hasBookingIntent === "boolean";
      const hasBookingFlow = typeof result.isBookingFlow === "boolean";

      const testPassed = hasChatResponse && hasBookingIntent && hasBookingFlow;
      if (!testPassed) allPassed = false;

      const status = testPassed ? "✅" : "❌";
      // console.log(`${status} Enhanced processing completed`);
      // console.log(`   Is Booking Flow: ${result.isBookingFlow}`);
      // console.log(`   Intent Confidence: ${result.bookingIntent.confidence}%`);
      // console.log(`   Reply: "${result.chatResponse.reply}"`);

      results.push({
        message,
        result,
        passed: testPassed,
      });
    } catch (error) {
      allPassed = false;
      // console.log(`❌ Error in enhanced processing for "${message}":`, error);
      results.push({
        message,
        result: {
          error: error instanceof Error ? error.message : String(error),
        },
        passed: false,
      });
    }

    // console.log(""); // Empty line for readability
  }

  return { passed: allPassed, results };
}

/**
 * Run all booking detection tests
 */
export async function runAllBookingTests(): Promise<{
  allPassed: boolean;
  results: {
    detection: any;
    responseGeneration: any;
    enhancedProcessing: any;
  };
  summary: string;
}> {
  // console.log("🧪 Running Booking Detection Test Suite...\n");

  const detectionResults = await testBookingDetection();
  const responseResults = await testBookingResponseGeneration();
  const enhancedResults = await testEnhancedChatProcessing();

  const allPassed =
    detectionResults.passed && responseResults.passed && enhancedResults.passed;

  const results = {
    detection: detectionResults,
    responseGeneration: responseResults,
    enhancedProcessing: enhancedResults,
  };

  const totalTests =
    detectionResults.results.length +
    responseResults.results.length +
    enhancedResults.results.length;
  const passedTests =
    results.detection.results.filter((r) => r.passed).length +
    results.responseGeneration.results.filter((r) => r.passed).length +
    results.enhancedProcessing.results.filter((r) => r.passed).length;

  const summary = `
  Booking Detection Tests Summary:
  --------------------------------
  Detection Logic: ${detectionResults.passed ? "✅ PASSED" : "❌ FAILED"}
  Response Generation: ${responseResults.passed ? "✅ PASSED" : "❌ FAILED"}
  Enhanced Processing: ${enhancedResults.passed ? "✅ PASSED" : "❌ FAILED"}
  `;

  // console.log("\n" + "=".repeat(50));
  // console.log(summary);
  // console.log("=".repeat(50) + "\n");

  return {
    allPassed,
    results,
    summary,
  };
}
