const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

async function checkCrawledUrls() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("chatbot_db");

    console.log("=== CHECKING SITEMAP_URLS FOR CRAWLED CONTENT ===\n");

    // Check sitemap_urls collection
    const totalUrls = await db.collection("sitemap_urls").countDocuments();
    console.log(`Total URLs in sitemap: ${totalUrls}`);

    const crawledUrls = await db
      .collection("sitemap_urls")
      .find({ crawled: true })
      .toArray();
    console.log(`URLs marked as crawled: ${crawledUrls.length}`);

    if (crawledUrls.length > 0) {
      console.log("\nCrawled URLs:");
      crawledUrls.slice(0, 10).forEach((url, index) => {
        console.log(
          `${index + 1}. ${url.url} (crawled: ${url.crawled}, added: ${
            url.addedAt
          })`
        );
      });
    }

    // Check for any URLs with additional fields that might indicate content
    const sampleUrl = await db.collection("sitemap_urls").findOne({});
    console.log("\nSample URL document structure:");
    console.log("Keys:", Object.keys(sampleUrl));
    console.log("Sample URL:", sampleUrl.url);
    console.log("Crawled status:", sampleUrl.crawled);

    // Look for any documents with more fields
    const urlsWithMoreFields = await db
      .collection("sitemap_urls")
      .find({})
      .limit(10)
      .toArray();
    const fieldsPerDoc = urlsWithMoreFields.map(
      (doc) => Object.keys(doc).length
    );
    const maxFields = Math.max(...fieldsPerDoc);

    if (maxFields > 5) {
      console.log(
        "\nSome documents have additional fields. Looking for the most complete one..."
      );
      const completeDoc = urlsWithMoreFields.find(
        (doc) => Object.keys(doc).length === maxFields
      );
      console.log("Most complete document:", completeDoc);
    }

    // Check what adminId is being used
    const adminIds = await db.collection("sitemap_urls").distinct("adminId");
    console.log("\nAdminIds in sitemap_urls:", adminIds);

    // Check users collection for adminId reference
    const users = await db.collection("users").find({}).toArray();
    console.log("\nUsers in database:");
    users.forEach((user) => {
      console.log(`- ${user.email} (ID: ${user._id})`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkCrawledUrls();
