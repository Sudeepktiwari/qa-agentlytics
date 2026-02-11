import { config } from "dotenv";
import { resolve } from "path";
// Load environment variables from .env.local
config({ path: resolve(__dirname, "../.env.local") });

import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  // Configuration from user request
  const apiKey = "ak_2e9c1dad1951fc62ba4151d4dfe800417421c0d6c68af8082a0beb8d827ef798";
  const targetUrl = "https://qa-agentlytics.vercel.app/";

  console.log("---------------------------------------------------");
  console.log("🔍 Verifying Data for URL:", targetUrl);
  console.log("🔑 API Key:", apiKey.substring(0, 10) + "...");
  console.log("---------------------------------------------------");

  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    // Using 'test' db as seen in src/lib/mongo.ts
    const db = client.db("test");

    // 1. Resolve Admin ID from API Key
    const users = db.collection("users");
    const user = await users.findOne({ apiKey });

    if (!user) {
      console.error("❌ API Key NOT FOUND in 'users' collection.");
      return;
    }

    const adminId = user.adminId || user._id.toString();
    console.log(`✅ API Key Valid. Admin ID: ${adminId}`);

    // 2. Check Sitemap URLs (sitemap_urls)
    // Normalize URL: remove trailing slash for consistent matching
    const normalizedUrl = targetUrl.replace(/\/$/, "");
    const regex = new RegExp(`^${normalizedUrl}/?$`, "i"); // Case-insensitive, optional trailing slash

    const sitemapUrls = db.collection("sitemap_urls");
    const sitemapEntry = await sitemapUrls.findOne({
      adminId,
      url: { $regex: regex },
    });

    if (sitemapEntry) {
      console.log(`✅ FOUND in 'sitemap_urls':`);
      console.log(`   - URL: ${sitemapEntry.url}`);
      console.log(`   - Status: ${sitemapEntry.status || "N/A"}`);
      console.log(`   - Crawled: ${sitemapEntry.crawled}`);
    } else {
      console.log(`❌ NOT FOUND in 'sitemap_urls'.`);
    }

    // 3. Check Crawled Pages (crawled_pages)
    const crawledPages = db.collection("crawled_pages");
    const crawledEntry = await crawledPages.findOne({
      adminId,
      url: { $regex: regex },
    });

    if (crawledEntry) {
      console.log(`✅ FOUND in 'crawled_pages':`);
      console.log(`   - URL: ${crawledEntry.url}`);
      console.log(`   - Title: ${crawledEntry.title}`);
      console.log(
        `   - Content Length: ${crawledEntry.content?.length || 0} characters`,
      );
      if (crawledEntry.content && crawledEntry.content.length > 50) {
        console.log(
          `   - Content Preview: ${crawledEntry.content.substring(0, 50)}...`,
        );
      } else {
        console.log(`   ⚠️ Content is empty or very short.`);
      }
    } else {
      console.log(`❌ NOT FOUND in 'crawled_pages'.`);
    }

    // 4. Check Pinecone Vectors (pinecone_vectors)
    // The system uses 'filename' to store the URL in this collection
    const pineconeVectors = db.collection("pinecone_vectors");
    const vectorEntries = await pineconeVectors
      .find({
        adminId,
        filename: { $regex: regex },
      })
      .project({ vectorId: 1 })
      .toArray();

    if (vectorEntries.length > 0) {
      console.log(
        `✅ FOUND ${vectorEntries.length} chunks in 'pinecone_vectors'.`,
      );
    } else {
      console.log(`❌ NOT FOUND in 'pinecone_vectors' (No chunks stored).`);
    }

    // 5. DEBUG: List ALL pages for this Admin ID to check for mismatches
    console.log("\n---------------------------------------------------");
    console.log("🕵️ DEBUG: Listing ALL crawled pages for this Admin ID:");
    const allPages = await crawledPages
      .find({ adminId })
      .project({ url: 1 })
      .toArray();
    if (allPages.length > 0) {
      allPages.forEach((p) => console.log(`   - ${p.url}`));
    } else {
      console.log("   (No pages found for this Admin ID)");
    }
    console.log("---------------------------------------------------");
  } catch (error) {
    console.error("❌ Error during verification:", error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
