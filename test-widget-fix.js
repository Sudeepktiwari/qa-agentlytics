// Test script to verify widget sends requests without hardcoded adminId
// This script simulates what the widget should do now

console.log("🧪 Testing Widget API Calls...");

const API_KEY =
  "ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345";
const BASE_URL = "https://sample-chatbot-nine.vercel.app";

async function testProactiveRequest() {
  console.log("📝 Testing proactive request (should work)...");

  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        sessionId: "test-session-" + Date.now(),
        pageUrl: "https://www.advancelytics.com/",
        proactive: true,
        // No adminId in body - API should extract from API key
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Proactive request successful!");
      console.log("📄 Response:", result);
      return true;
    } else {
      console.log("❌ Proactive request failed");
      console.log("   Status:", response.status);
      const errorText = await response.text();
      console.log("   Error:", errorText);
      return false;
    }
  } catch (error) {
    console.log("❌ Error in proactive request:", error.message);
    return false;
  }
}

async function testChatRequest() {
  console.log("💬 Testing regular chat request (should work)...");

  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        question: "Hello, what services do you offer?",
        sessionId: "test-session-" + Date.now(),
        pageUrl: "https://www.advancelytics.com/",
        // No adminId in body - API should extract from API key
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Chat request successful!");
      console.log("📄 Response:", result);
      return true;
    } else {
      console.log("❌ Chat request failed");
      console.log("   Status:", response.status);
      const errorText = await response.text();
      console.log("   Error:", errorText);
      return false;
    }
  } catch (error) {
    console.log("❌ Error in chat request:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🔧 Testing widget API calls without hardcoded adminId...");
  console.log("");

  const proactiveResult = await testProactiveRequest();
  console.log("");

  const chatResult = await testChatRequest();
  console.log("");

  if (proactiveResult && chatResult) {
    console.log("🎉 All tests passed! Widget should work correctly now.");
    console.log("🔄 Deploy the changes and test on your website.");
  } else {
    console.log("❌ Some tests failed. Check the errors above.");
  }
}

// Run the tests
runTests();
