const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

async function testConnectionAndSummaries() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB successfully");

    // Test the exact same connection your app uses
    const db = client.db("test");

    console.log("\n📊 TESTING YOUR APPLICATION'S DATABASE ACCESS:");

    // Test crawled_pages collection (what your app fetches)
    const crawledPages = await db
      .collection("crawled_pages")
      .find({})
      .toArray();
    console.log(`\n📚 Crawled Pages: ${crawledPages.length} total documents`);

    if (crawledPages.length > 0) {
      const pagesWithSummary = crawledPages.filter(
        (page) => page.structuredSummary
      );
      console.log(
        `✅ Pages with structured summaries: ${pagesWithSummary.length}`
      );

      console.log("\n🎯 Sample pages with summaries:");
      pagesWithSummary.slice(0, 3).forEach((page, index) => {
        console.log(`${index + 1}. ${page.url}`);
        console.log(`   AdminId: ${page.adminId}`);
        console.log(`   Created: ${page.createdAt}`);
        console.log(
          `   Summary categories: ${
            Object.keys(page.structuredSummary || {}).length
          } fields`
        );
        console.log("");
      });
    }

    // Test pinecone_vectors collection
    const vectorCount = await db
      .collection("pinecone_vectors")
      .countDocuments();
    console.log(`🔗 Pinecone Vectors: ${vectorCount} total documents`);

    // Test by adminId (what your API filters by)
    const uniqueAdminIds = await db
      .collection("crawled_pages")
      .distinct("adminId");
    console.log(
      `\n👥 Unique Admin IDs in crawled_pages: ${uniqueAdminIds.length}`
    );
    uniqueAdminIds.forEach((adminId) => {
      console.log(`   - ${adminId}`);
    });

    // Test what your API would return for each adminId
    for (const adminId of uniqueAdminIds.slice(0, 2)) {
      const userPages = await db
        .collection("crawled_pages")
        .find({ adminId })
        .sort({ createdAt: -1 })
        .toArray();

      const pagesWithStatus = userPages.map((page) => ({
        url: page.url,
        hasStructuredSummary: !!page.structuredSummary,
        createdAt: page.createdAt,
      }));

      console.log(`\n🔍 Pages for adminId ${adminId}:`);
      pagesWithStatus.forEach((page) => {
        console.log(
          `   ${page.hasStructuredSummary ? "✅" : "⚡"} ${page.url}`
        );
      });
    }

    console.log(
      "\n🎉 SUCCESS: Your application should now show existing summaries!"
    );
    console.log("💡 Next steps:");
    console.log("   1. Go to your admin panel");
    console.log('   2. Look for the "Crawled Pages Library" section');
    console.log('   3. You should see pages with "✅ Has Summary" status');
    console.log('   4. Click "👁️ View Summary" to see existing summaries');
    console.log('   5. Click "⚡ Generate Summary" on pages without summaries');
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

testConnectionAndSummaries();
