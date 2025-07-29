require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function addSampleUrls() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("chatbot_db");
    const sitemapUrls = db.collection("sitemap_urls");

    // The adminId from the user _id in the database
    const adminId = "68889fe2db8d3ad534b6f7b0";

    const urls = [
      "http://localhost:3001/",
      "http://localhost:3001/services",
      "http://localhost:3001/pricing",
      "http://localhost:3001/about",
      "http://localhost:3001/contact",
    ];

    for (const url of urls) {
      await sitemapUrls.updateOne(
        { adminId, url },
        {
          $set: {
            adminId,
            url,
            crawled: false,
            addedAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log(`Added URL: ${url}`);
    }

    console.log("All URLs added successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

addSampleUrls();
