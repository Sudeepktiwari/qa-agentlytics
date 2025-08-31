#!/usr/bin/env node

/**
 * Test runner for Booking Detection API
 *
 * This tests the booking detection service to ensure it's working
 * correctly before enabling the feature flag.
 */

// Load environment variables from .env.local
import dotenv from "dotenv";
import path from "path";

// Load .env.local file
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { runAllBookingTests } from "./src/services/bookingDetection.test.js";

console.log("🔍 Testing Booking Detection API...\n");

// Enable the feature flag for testing
process.env.ENABLE_BOOKING_DETECTION = "true";

// Run all tests
runAllBookingTests()
  .then((testResults) => {
    if (testResults.allPassed) {
      console.log("\n🎉 All booking detection tests passed!");
      console.log("\n✨ Ready to proceed to Step 3: Calendar Component API");
      console.log("\n📋 Next steps:");
      console.log(
        "1. Enable booking detection: Set ENABLE_BOOKING_DETECTION=true in .env.local"
      );
      console.log(
        "2. Test the API endpoint: GET /api/booking-detection?action=test"
      );
      console.log("3. Integrate with chat system");
      process.exit(0);
    } else {
      console.log("\n⚠️  Some tests failed. Please review the results above.");
      console.log("\n🔧 Debug information:");

      // Show detailed results for failed tests
      const failedTests = [];

      testResults.results.detection.results.forEach((test) => {
        if (!test.passed) failedTests.push(`Detection: ${test.message}`);
      });

      testResults.results.responseGeneration.results.forEach((test) => {
        if (!test.passed) failedTests.push(`Response: ${test.message}`);
      });

      testResults.results.enhancedProcessing.results.forEach((test) => {
        if (!test.passed) failedTests.push(`Enhanced: ${test.message}`);
      });

      failedTests.forEach((test) => console.log(`   ❌ ${test}`));

      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n💥 Test execution failed:", error);
    console.log("\n🔧 This might be due to:");
    console.log("1. Missing OpenAI API key");
    console.log("2. Network connectivity issues");
    console.log("3. Import/export problems");
    console.log("\n💡 Make sure OPENAI_API_KEY is set in your .env.local file");
    process.exit(1);
  });
