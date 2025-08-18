// Quick test to check MongoDB crawled_pages collection
import { MongoClient } from "mongodb";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

async function checkCrawledPages() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not found in environment variables");
    return;
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("crawled_pages");

    console.log("Checking crawled_pages collection...");

    // Get total count
    const totalCount = await collection.countDocuments();
    console.log("Total crawled pages:", totalCount);

    // Get sample data
    const samplePages = await collection.find({}).limit(5).toArray();
    console.log("Sample pages:");
    samplePages.forEach((page) => {
      console.log("- URL:", page.url);
      console.log("  AdminId:", page.adminId);
      console.log("  Created:", page.createdAt);
      console.log("  Has Summary:", !!page.structuredSummary);
      console.log("");
    });

    // Check for specific adminId patterns
    const adminIds = await collection.distinct("adminId");
    console.log("Found adminIds:", adminIds);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

// Check if running from command line
if (process.argv[1].includes("check-crawled-pages.js")) {
  checkCrawledPages();
}
