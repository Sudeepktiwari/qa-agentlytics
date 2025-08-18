const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

async function debugDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("test");

    console.log("=== DEBUGGING DATABASE ===");

    // Check pinecone_vectors collection
    const vectorCollection = db.collection("pinecone_vectors");
    const vectorCount = await vectorCollection.countDocuments();
    console.log(`\nTotal documents in pinecone_vectors: ${vectorCount}`);

    if (vectorCount > 0) {
      // Get all unique adminIds
      const adminIds = await vectorCollection.distinct("adminId");
      console.log(`Unique adminIds in pinecone_vectors:`, adminIds);

      // Get sample documents
      const sampleVectors = await vectorCollection.find({}).limit(5).toArray();
      console.log(
        `\nSample vector documents:`,
        sampleVectors.map((doc) => ({
          adminId: doc.adminId,
          filename: doc.filename,
          chunkIndex: doc.chunkIndex,
          textLength: doc.text?.length || 0,
        }))
      );
    }

    // Check crawled_pages collection
    const crawledCollection = db.collection("crawled_pages");
    const crawledCount = await crawledCollection.countDocuments();
    console.log(`\nTotal documents in crawled_pages: ${crawledCount}`);

    if (crawledCount > 0) {
      // Get all unique adminIds
      const crawledAdminIds = await crawledCollection.distinct("adminId");
      console.log(`Unique adminIds in crawled_pages:`, crawledAdminIds);

      // Get sample documents
      const sampleCrawled = await crawledCollection.find({}).limit(5).toArray();
      console.log(
        `\nSample crawled_pages documents:`,
        sampleCrawled.map((doc) => ({
          adminId: doc.adminId,
          url: doc.url,
          hasStructuredSummary: !!doc.structuredSummary,
          createdAt: doc.createdAt,
        }))
      );
    }

    // Check for the specific admin ID from the logs
    const specificAdminId = "yaju21@gmail.com";
    console.log(`\n=== DATA FOR ADMIN: ${specificAdminId} ===`);

    const userVectors = await vectorCollection
      .find({ adminId: specificAdminId })
      .toArray();
    console.log(`Vectors for ${specificAdminId}:`, userVectors.length);
    if (userVectors.length > 0) {
      console.log(
        "Sample filenames:",
        userVectors.slice(0, 3).map((v) => v.filename)
      );
    }

    const userCrawled = await crawledCollection
      .find({ adminId: specificAdminId })
      .toArray();
    console.log(`Crawled pages for ${specificAdminId}:`, userCrawled.length);
    if (userCrawled.length > 0) {
      console.log(
        "Sample URLs:",
        userCrawled.map((c) => c.url)
      );
    }

    // Check if data exists under different adminId formats
    console.log(`\n=== CHECKING DIFFERENT ADMINID FORMATS ===`);
    const allAdminIds = await vectorCollection.distinct("adminId");
    const relatedIds = allAdminIds.filter(
      (id) =>
        id.includes("yaju21") || id.includes("gmail") || id.includes("appointy")
    );
    console.log("Related adminIds found:", relatedIds);

    // Check users collection to understand the adminId mapping
    console.log(`\n=== USERS COLLECTION ANALYSIS ===`);
    const usersCollection = db.collection("users");
    const allUsers = await usersCollection.find({}).toArray();
    console.log(
      "All users:",
      allUsers.map((user) => ({
        _id: user._id,
        email: user.email,
        adminId: user.adminId,
        hasApiKey: !!user.apiKey,
      }))
    );

    // Look for user with email yaju21@gmail.com
    const targetUser = await usersCollection.findOne({
      email: "yaju21@gmail.com",
    });
    if (targetUser) {
      console.log("\nTarget user found:", {
        _id: targetUser._id,
        email: targetUser.email,
        adminId: targetUser.adminId,
        hasApiKey: !!targetUser.apiKey,
      });
    } else {
      console.log("\nNo user found with email yaju21@gmail.com");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

debugDatabase();
