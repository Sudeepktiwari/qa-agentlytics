// Quick API test - run this in browser console
async function testProactiveResponse() {
  try {
    console.log("Testing proactive API response...");

    const response = await fetch(
      "https://sample-chatbot-nine.vercel.app/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key":
            "ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345",
        },
        body: JSON.stringify({
          sessionId: "test-" + Date.now(),
          pageUrl: "https://www.advancelytics.com/",
          proactive: true,
          adminId: "default",
        }),
      }
    );

    console.log("Response status:", response.status);
    const result = await response.json();
    console.log("API Response:", result);

    if (result.answer) {
      console.log("✅ Proactive message received:");
      console.log(result.answer);
      return result.answer;
    } else {
      console.log("❌ No proactive message in response");
      console.log("Full response:", result);
      return null;
    }
  } catch (error) {
    console.error("API test failed:", error);
    return null;
  }
}

// Run the test
testProactiveResponse();
