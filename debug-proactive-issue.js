// Copy and paste this into your browser console to debug the issue

async function debugProactiveIssue() {
  console.log("🔍 Debugging proactive message issue...");
  console.log("");

  const API_KEY =
    "ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345";
  const PAGE_URL = "https://www.advancelytics.com/";

  console.log("📋 Test Configuration:");
  console.log("API Key:", API_KEY);
  console.log("Page URL:", PAGE_URL);
  console.log("");

  try {
    console.log("🚀 Making proactive API request...");

    const response = await fetch(
      "https://sample-chatbot-nine.vercel.app/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          sessionId: "debug-session-" + Date.now(),
          pageUrl: PAGE_URL,
          proactive: true,
          adminId: "default",
        }),
      }
    );

    console.log("📡 Response Status:", response.status);

    if (!response.ok) {
      console.error("❌ API request failed with status:", response.status);
      return;
    }

    const result = await response.json();
    console.log("📦 Full API Response:", result);
    console.log("");

    if (result.answer) {
      console.log("✅ Proactive message received:");
      console.log(result.answer);
      console.log("");

      // Check if it's the generic fallback message
      if (
        result.answer.includes(
          "I'm here to help you learn more about the products and services available"
        )
      ) {
        console.log("⚠️  This is the GENERIC fallback message!");
        console.log("");
        console.log("🔧 Possible issues:");
        console.log("1. Your API key is not mapped to an adminId");
        console.log("2. The page URL is not in your sitemap");
        console.log("3. The page exists in sitemap but is not crawled");
        console.log("");
        console.log("✅ Solutions:");
        console.log(
          "1. Check your admin panel to ensure your API key is properly configured"
        );
        console.log(
          "2. Add https://www.advancelytics.com/ to your sitemap via admin panel"
        );
        console.log(
          '3. Ensure the page is marked as "crawled" in your sitemap'
        );
      } else {
        console.log("✅ This appears to be a contextual message!");
      }
    } else {
      console.log("❌ No proactive message in response");
      console.log("Response keys:", Object.keys(result));
    }
  } catch (error) {
    console.error("💥 Error testing API:", error);
  }

  console.log("");
  console.log("🎯 Next steps:");
  console.log(
    "1. Check the browser console logs on your website for the new debug messages"
  );
  console.log("2. Look for messages starting with [DEBUG]");
  console.log("3. Check your admin panel sitemap settings");
}

// Run the debug
debugProactiveIssue();
