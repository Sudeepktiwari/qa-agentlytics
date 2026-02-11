// const fetch = require('node-fetch'); // Native fetch is available in Node 18+

const API_URL = "http://localhost:3000/api/chat";
const API_KEY =
  "ak_2e9c1dad1951fc62ba4151d4dfe800417421c0d6c68af8082a0beb8d827ef798";
const PAGE_URL = "https://agentlytics.advancelytics.com/";

async function testFollowup(count, context = null) {
  console.log(`\n--- Testing Followup Count: ${count} ---`);

  const payload = {
    sessionId: `test-session-${Date.now()}`,
    pageUrl: PAGE_URL,
    followup: true,
    followupCount: count,
    // Add triggerLeadQuestion + context to simulate behavior
    triggerLeadQuestion: count <= 1,
    contextualPageContext:
      context ||
      "Meet the AI Salesperson Who Never Sleeps Turns visitors into customers 24/7.", // Simulate Hero Section context
    previousQuestions: [], // Empty for test
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Status: OK");
      console.log("Main Text:", data.mainText);
      console.log("Buttons:", data.buttons);
      console.log("Email Prompt:", data.emailPrompt);

      // Verification logic
      if (count <= 1) {
        if (data.buttons && data.buttons.length > 0) {
          console.log("✅ PASS: Lead Question generated with buttons.");
        } else {
          console.log("❌ FAIL: No buttons generated for Lead Question.");
        }
      } else if (count === 2) {
        if (!data.buttons || data.buttons.length === 0) {
          console.log("✅ PASS: Chat Closure generated with NO buttons.");
        } else {
          console.log(
            "❌ FAIL: Buttons generated for Chat Closure (should be empty).",
          );
        }
      }
    } else {
      console.error("Error:", data);
    }
  } catch (error) {
    console.error("Request Failed:", error.message);
  }
}

async function runTests() {
  // Test Followup 0 (Lead Q1)
  await testFollowup(0);

  // Test Followup 1 (Lead Q2)
  await testFollowup(1);

  // Test Followup 2 (Closure)
  await testFollowup(2);
}

runTests();
