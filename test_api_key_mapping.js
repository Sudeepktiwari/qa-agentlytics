// Test API Key to AdminId mapping
// Run this in Node.js to check if your API key is properly configured

const API_KEY =
  "ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345";
const CHAT_API_URL = "https://sample-chatbot-nine.vercel.app/api/chat";

async function testApiKeyMapping() {
  console.log("Testing API Key to AdminId mapping...");
  console.log("API Key:", API_KEY);

  try {
    const response = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        sessionId: "test-session-" + Date.now(),
        pageUrl: "https://www.advancelytics.com/features",
        proactive: true,
        question: undefined,
      }),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const result = await response.json();
    console.log("Response body:", JSON.stringify(result, null, 2));

    if (result.answer) {
      console.log("✅ Success! Proactive message received:");
      console.log(result.answer);
    } else {
      console.log("❌ No proactive message received");
      console.log("This might indicate:");
      console.log("1. API key not mapped to adminId");
      console.log("2. Page URL not in sitemap");
      console.log("3. Page not crawled yet");
    }
  } catch (error) {
    console.error("❌ Error testing API:", error.message);
  }
}

// For browser testing
if (typeof window !== "undefined") {
  window.testApiKeyMapping = testApiKeyMapping;
  console.log("Run testApiKeyMapping() in browser console");
} else {
  // For Node.js testing
  testApiKeyMapping();
}

module.exports = { testApiKeyMapping };
