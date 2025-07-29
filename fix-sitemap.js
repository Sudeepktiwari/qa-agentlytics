// Quick fix script to add pages to sitemap with correct adminId
// Run this in browser console after the widget fixes are deployed

async function addPagesToSitemap() {
  console.log("🔧 Adding Advancelytics pages to sitemap...");

  const API_KEY =
    "ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345";
  const BASE_URL = "https://sample-chatbot-nine.vercel.app";

  const pagesToAdd = [
    "https://www.advancelytics.com/",
    "https://www.advancelytics.com/features",
    "https://www.advancelytics.com/how-it-works",
    "https://www.advancelytics.com/solutions",
  ];

  for (const pageUrl of pagesToAdd) {
    try {
      console.log(`📄 Adding: ${pageUrl}`);

      const response = await fetch(`${BASE_URL}/api/sitemap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          url: pageUrl,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Successfully added: ${pageUrl}`);
        console.log("   Result:", result);
      } else {
        console.log(`❌ Failed to add: ${pageUrl}`);
        console.log("   Status:", response.status);
        const errorText = await response.text();
        console.log("   Error:", errorText);
      }
    } catch (error) {
      console.log(`❌ Error adding ${pageUrl}:`, error.message);
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("");
  console.log("✅ Sitemap update complete!");
  console.log("🔄 Now refresh your website to test contextual messages");
}

// Run the fix
addPagesToSitemap();
