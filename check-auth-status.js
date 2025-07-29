// Debug script to check your current login status and API key
// Run this in browser console on your admin panel

console.log("🔍 Checking current authentication status...");

async function checkAuthStatus() {
  try {
    // Check current login status
    console.log("📋 Checking current session...");

    const authResponse = await fetch("/api/auth", {
      method: "GET",
      credentials: "include",
    });

    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log("✅ Current session:", authData);
      console.log(`   Email: ${authData.email}`);
      console.log(`   AdminId: ${authData.adminId}`);

      // Check current API key
      console.log("");
      console.log("🔑 Checking current API key...");

      const apiKeyResponse = await fetch("/api/auth/api-key", {
        method: "GET",
        credentials: "include",
      });

      if (apiKeyResponse.ok) {
        const apiKeyData = await apiKeyResponse.json();
        console.log("✅ API key info:", apiKeyData);
        console.log(`   API Key: ${apiKeyData.apiKey || "None"}`);
        console.log(`   AdminId: ${apiKeyData.adminId}`);
        console.log(`   Created: ${apiKeyData.apiKeyCreated || "Never"}`);

        // Check if adminIds match
        if (authData.adminId === apiKeyData.adminId) {
          console.log("");
          console.log("✅ AdminIds match! API key is correctly associated.");

          if (apiKeyData.apiKey) {
            console.log("🎯 Your widget should use this API key:");
            console.log(`   ${apiKeyData.apiKey}`);
          } else {
            console.log("⚠️  No API key found. Generate one first.");
          }
        } else {
          console.log("");
          console.log("❌ AdminId mismatch detected!");
          console.log(`   Session adminId: ${authData.adminId}`);
          console.log(`   API Key adminId: ${apiKeyData.adminId}`);
        }
      } else {
        console.log("❌ Failed to get API key info");
        const error = await apiKeyResponse.text();
        console.log("   Error:", error);
      }
    } else {
      console.log("❌ Not logged in or session expired");
      const error = await authResponse.text();
      console.log("   Error:", error);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

// Run the check
checkAuthStatus();
