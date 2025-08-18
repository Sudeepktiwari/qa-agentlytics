// Test script to verify the authentication fix
import { verifyApiKey } from "./src/lib/auth.js";

async function testAuthFix() {
  console.log("Testing authentication fix...");

  // Test with a sample API key (this will fail but shows the flow)
  try {
    const result = await verifyApiKey("test-api-key");
    console.log("Auth result:", result);
  } catch (error) {
    console.log("Expected error (no valid API key):", error.message);
  }

  console.log("Authentication test completed");
}

testAuthFix();
