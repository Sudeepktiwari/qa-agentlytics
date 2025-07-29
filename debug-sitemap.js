// Debug script to check sitemap entries for Advancelytics
// Run this in browser console to see what's actually in your sitemap

console.log("🔍 Debugging sitemap entries for Advancelytics...");

const API_KEY =
  "ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345";
const BASE_URL = "https://sample-chatbot-nine.vercel.app";
const TARGET_PAGE = "https://www.advancelytics.com/";

async function debugSitemap() {
  console.log("📋 Checking sitemap debug info...");

  try {
    // Use the new debug endpoint
    const response = await fetch(
      `${BASE_URL}/api/sitemap?debug=1&url=${encodeURIComponent(TARGET_PAGE)}`,
      {
        method: "GET",
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Debug response:", result);
      console.log("");
      console.log("� Summary:");
      console.log(`   AdminId: ${result.adminId}`);
      console.log(`   Total sitemap entries: ${result.totalEntries}`);
      console.log("");

      if (result.specificUrlCheck) {
        console.log("🎯 Specific URL check:");
        console.log(`   Checking: ${result.specificUrlCheck.url}`);
        console.log(`   Found: ${result.specificUrlCheck.found}`);
        if (result.specificUrlCheck.entry) {
          console.log(`   Entry details:`, result.specificUrlCheck.entry);
        }
        console.log("");
      }

      console.log("📄 All sitemap entries:");
      result.entries.forEach((entry, index) => {
        console.log(
          `   ${index + 1}. ${entry.url} (crawled: ${entry.crawled})`
        );
      });

      if (result.totalEntries === 0) {
        console.log(
          "❌ No sitemap entries found! You need to add pages to your sitemap."
        );
        console.log("💡 Run the fix-sitemap.js script to add pages.");
      } else if (!result.specificUrlCheck?.found) {
        console.log(`❌ Target page "${TARGET_PAGE}" not found in sitemap!`);
        console.log("� Possible solutions:");
        console.log(
          "1. Check URL variations (with/without trailing slash, www, etc.)"
        );
        console.log("2. Add the page manually via admin panel");
        console.log("3. Run the fix-sitemap.js script");
      } else {
        console.log("✅ Target page found in sitemap!");
        if (!result.specificUrlCheck.entry.crawled) {
          console.log(
            "⚠️  Page is in sitemap but not crawled yet. It should crawl automatically on next request."
          );
        }
      }
    } else {
      console.log("❌ Debug request failed:");
      console.log("   Status:", response.status);
      const errorText = await response.text();
      console.log("   Error:", errorText);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

// Run the debug
debugSitemap();
