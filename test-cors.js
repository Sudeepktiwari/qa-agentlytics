// CORS Test Script - Run this in browser console
async function testCORSHeaders() {
  console.log("🔧 Testing CORS headers for all API endpoints...");
  console.log("");

  const baseUrl = "https://sample-chatbot-nine.vercel.app";
  const endpoints = [
    "/api/chat",
    "/api/widget",
    "/api/track-nudge",
    "/api/leads",
  ];

  for (const endpoint of endpoints) {
    console.log(`🌐 Testing ${endpoint}...`);

    try {
      // Test OPTIONS preflight request
      const optionsResponse = await fetch(`${baseUrl}${endpoint}`, {
        method: "OPTIONS",
        headers: {
          Origin: "https://www.advancelytics.com",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type, x-api-key",
        },
      });

      console.log(`  ✅ OPTIONS ${endpoint}: ${optionsResponse.status}`);
      console.log(`  📋 CORS Headers:`, {
        "Access-Control-Allow-Origin": optionsResponse.headers.get(
          "Access-Control-Allow-Origin"
        ),
        "Access-Control-Allow-Methods": optionsResponse.headers.get(
          "Access-Control-Allow-Methods"
        ),
        "Access-Control-Allow-Headers": optionsResponse.headers.get(
          "Access-Control-Allow-Headers"
        ),
      });

      if (endpoint === "/api/chat") {
        // Test actual POST request for chat
        const postResponse = await fetch(`${baseUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key":
              "ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345",
          },
          body: JSON.stringify({
            sessionId: "cors-test-" + Date.now(),
            pageUrl: "https://www.advancelytics.com/",
            proactive: true,
          }),
        });

        console.log(`  ✅ POST ${endpoint}: ${postResponse.status}`);
        console.log(`  📋 Response CORS Headers:`, {
          "Access-Control-Allow-Origin": postResponse.headers.get(
            "Access-Control-Allow-Origin"
          ),
        });
      }
    } catch (error) {
      console.log(`  ❌ Error testing ${endpoint}:`, error.message);
    }

    console.log("");
  }

  console.log("🎯 CORS testing complete!");
}

// Run the test
testCORSHeaders();
