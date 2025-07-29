// Advanced debugging script - run this in browser console
async function debugProactiveFlow() {
  console.log("🔍 Advanced Proactive Message Debugging");
  console.log("=".repeat(50));

  const API_KEY =
    "ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345";
  const PAGE_URL = "https://www.advancelytics.com/";
  const BASE_URL = "https://sample-chatbot-nine.vercel.app";

  console.log("📋 Configuration:");
  console.log("API Key:", API_KEY);
  console.log("Page URL:", PAGE_URL);
  console.log("Base URL:", BASE_URL);
  console.log("");

  // Step 1: Check sitemap for the page
  console.log("🗺️ Step 1: Checking sitemap for page URL");
  try {
    const sitemapResponse = await fetch(`${BASE_URL}/api/sitemap`, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
      },
    });

    if (sitemapResponse.ok) {
      const sitemapData = await sitemapResponse.json();
      console.log(
        "📊 Sitemap response received. URLs found:",
        sitemapData.urls?.length || 0
      );

      // Check if our page URL is in the sitemap
      const pageInSitemap = sitemapData.urls?.find(
        (url) =>
          url.url === PAGE_URL ||
          url.url === PAGE_URL.replace(/\/$/, "") ||
          url.url === PAGE_URL + "/"
      );

      if (pageInSitemap) {
        console.log("✅ Page found in sitemap:", pageInSitemap);
        console.log("📋 Page details:");
        console.log("  - URL:", pageInSitemap.url);
        console.log("  - Crawled:", pageInSitemap.crawled);
        console.log("  - Added:", pageInSitemap.addedAt);
        console.log("  - Admin ID:", pageInSitemap.adminId);

        if (!pageInSitemap.crawled) {
          console.log("⚠️ Page is in sitemap but NOT CRAWLED yet!");
          console.log("💡 This is likely why you're getting generic messages");
        }
      } else {
        console.log("❌ Page NOT found in sitemap!");
        console.log("💡 This is why you're getting generic messages");
        console.log(
          "🔧 Solution: Add the page to your sitemap via admin panel"
        );

        // Show available URLs for reference
        if (sitemapData.urls?.length > 0) {
          console.log("📝 Available URLs in sitemap:");
          sitemapData.urls.slice(0, 5).forEach((url, i) => {
            console.log(`  ${i + 1}. ${url.url} (crawled: ${url.crawled})`);
          });
          if (sitemapData.urls.length > 5) {
            console.log(`  ... and ${sitemapData.urls.length - 5} more`);
          }
        }
      }
    } else {
      console.log("❌ Sitemap request failed:", sitemapResponse.status);
      const errorText = await sitemapResponse.text();
      console.log("Error details:", errorText);
    }
  } catch (error) {
    console.log("❌ Sitemap test error:", error.message);
  }
  console.log("");

  // Step 2: Test the proactive API directly with verbose logging
  console.log("🤖 Step 2: Testing proactive API directly");
  try {
    const proactiveResponse = await fetch(`${BASE_URL}/api/chat`, {
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
    });

    if (proactiveResponse.ok) {
      const proactiveData = await proactiveResponse.json();
      console.log("📦 Proactive API response:", proactiveData);

      if (proactiveData.answer) {
        const message = proactiveData.answer;
        console.log("📝 Full message:");
        console.log(message);
        console.log("");

        // Check if it's the generic fallback
        if (
          message.includes(
            "I'm here to help you learn more about the products and services available"
          )
        ) {
          console.log("❌ This is the GENERIC fallback message!");
          console.log("");
          console.log("🔧 Root causes (in order of likelihood):");
          console.log(
            "1. 🚫 API key not properly mapped to adminId in users collection"
          );
          console.log("2. 🗺️ Page URL not in sitemap_urls collection");
          console.log("3. 📄 Page in sitemap but not crawled yet");
          console.log("4. 📝 Page crawled but no meaningful content found");
          console.log("");
          console.log("💡 Immediate solutions:");
          console.log("A. Go to your admin panel (/admin)");
          console.log("B. Verify your account is properly set up");
          console.log("C. Add pages to sitemap manually");
          console.log("D. Trigger crawling for all pages");
        } else {
          console.log("✅ This appears to be a contextual message!");
        }
      } else {
        console.log("❌ No answer in proactive response");
      }
    } else {
      console.log("❌ Proactive API request failed:", proactiveResponse.status);
      const errorText = await proactiveResponse.text();
      console.log("Error details:", errorText);
    }
  } catch (error) {
    console.log("❌ Proactive API test error:", error.message);
  }
  console.log("");

  // Step 3: Quick fix - try to add page to sitemap
  console.log("� Step 3: Attempting to add page to sitemap");
  try {
    const addResponse = await fetch(`${BASE_URL}/api/sitemap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        url: PAGE_URL,
        crawl: true, // Try to trigger immediate crawling
      }),
    });

    if (addResponse.ok) {
      const addResult = await addResponse.json();
      console.log("✅ Successfully added page to sitemap:", addResult);
      console.log("🔄 Wait 30 seconds then refresh your page to test");
    } else {
      console.log("❌ Failed to add page to sitemap:", addResponse.status);
      const errorText = await addResponse.text();
      console.log("Error details:", errorText);
    }
  } catch (error) {
    console.log("❌ Error adding page to sitemap:", error.message);
  }
  console.log("");

  console.log("🎯 Summary:");
  console.log("If you're still getting generic messages after running this:");
  console.log("1. Your API key may not be properly configured");
  console.log("2. Contact your admin to verify the setup");
  console.log("3. Manually add pages via the admin panel UI");
}

// Run the comprehensive debug
debugProactiveFlow();
