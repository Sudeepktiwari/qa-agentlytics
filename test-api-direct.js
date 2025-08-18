// Test API directly to debug the issue
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

async function testAPI() {
  const baseUrl = "http://localhost:3002";

  try {
    console.log("🔍 Testing authentication...");
    const authRes = await fetch(`${baseUrl}/api/auth/verify`);
    const authData = await authRes.json();
    console.log("Auth response:", authData);

    if (!authRes.ok) {
      console.log("❌ Not authenticated - need to login first");
      return;
    }

    console.log("\n🔍 Getting API key...");
    const apiKeyRes = await fetch(`${baseUrl}/api/auth/api-key`);
    const apiKeyData = await apiKeyRes.json();
    console.log("API Key response:", apiKeyData);

    if (!apiKeyRes.ok || !apiKeyData.apiKey) {
      console.log("❌ No API key - need to generate one");
      return;
    }

    console.log("\n🔍 Testing crawled pages API...");
    console.log("Using API key:", apiKeyData.apiKey);
    console.log("User adminId:", apiKeyData.adminId);

    const crawledRes = await fetch(`${baseUrl}/api/crawled-pages`, {
      headers: {
        "x-api-key": apiKeyData.apiKey,
      },
    });

    const crawledData = await crawledRes.json();
    console.log("Crawled pages response status:", crawledRes.status);
    console.log("Crawled pages response:", crawledData);

    if (crawledRes.ok) {
      console.log("✅ Success! Found", crawledData.pages?.length || 0, "pages");
    } else {
      console.log("❌ Error:", crawledData.error);
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

testAPI();
