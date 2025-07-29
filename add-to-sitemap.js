// Quick sitemap management script
async function addPageToSitemap() {
  const API_KEY =
    "ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345";
  const BASE_URL = "https://sample-chatbot-nine.vercel.app";

  const pagesToAdd = [
    "https://www.advancelytics.com/",
    "https://www.advancelytics.com/features",
    "https://www.advancelytics.com/how-it-works",
    "https://www.advancelytics.com/solutions",
  ];

  console.log("📝 Adding pages to sitemap...");

  for (const pageUrl of pagesToAdd) {
    try {
      console.log(`Adding: ${pageUrl}`);

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
        console.log(`✅ Added: ${pageUrl}`, result);
      } else {
        console.log(`❌ Failed to add: ${pageUrl}`, response.status);
        const errorText = await response.text();
        console.log("Error:", errorText);
      }
    } catch (error) {
      console.log(`❌ Error adding ${pageUrl}:`, error.message);
    }
  }

  console.log("✅ Sitemap update complete!");
}

// Uncomment to run:
// addPageToSitemap();
