const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

async function checkSummaries() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("sample-chatbot");

    console.log("=== CHECKING DOCUMENTS WITH SUMMARIES ===\n");

    // Check crawled_pages collection for documents with summaries
    console.log("1. CRAWLED_PAGES COLLECTION:");
    const crawledPages = await db
      .collection("crawled_pages")
      .find({})
      .toArray();
    console.log(`Total crawled pages: ${crawledPages.length}`);

    const pagesWithSummary = crawledPages.filter(
      (page) => page.summary || page.structuredSummary
    );
    console.log(`Pages with summary: ${pagesWithSummary.length}`);

    if (pagesWithSummary.length > 0) {
      console.log("\nPages with summaries:");
      pagesWithSummary.forEach((page, index) => {
        console.log(`${index + 1}. URL: ${page.url}`);
        console.log(`   Has summary: ${!!page.summary}`);
        console.log(`   Has structuredSummary: ${!!page.structuredSummary}`);
        if (page.summary) {
          console.log(`   Summary length: ${page.summary.length} characters`);
        }
        if (page.structuredSummary) {
          console.log(
            `   Structured summary keys: ${Object.keys(
              page.structuredSummary
            ).join(", ")}`
          );
        }
        console.log(`   Created: ${page.createdAt}\n`);
      });
    }

    // Check pinecone_vectors collection
    console.log("\n2. PINECONE_VECTORS COLLECTION:");
    const vectors = await db
      .collection("pinecone_vectors")
      .find({})
      .limit(5)
      .toArray();
    console.log(
      `Total vectors: ${await db
        .collection("pinecone_vectors")
        .countDocuments()}`
    );

    if (vectors.length > 0) {
      console.log("\nSample vector structure:");
      const sampleVector = vectors[0];
      console.log(`Keys: ${Object.keys(sampleVector).join(", ")}`);
      console.log(`Has text: ${!!sampleVector.text}`);
      if (sampleVector.text) {
        console.log(`Text length: ${sampleVector.text.length} characters`);
        console.log(`Text preview: ${sampleVector.text.substring(0, 100)}...`);
      }
    }

    // Check for any other collections that might contain summaries
    console.log("\n3. ALL COLLECTIONS:");
    const collections = await db.listCollections().toArray();
    console.log("Available collections:");
    collections.forEach((col) => console.log(`- ${col.name}`));

    // Check if there are any documents with summary-related fields in other collections
    for (const collection of collections) {
      if (
        collection.name !== "crawled_pages" &&
        collection.name !== "pinecone_vectors"
      ) {
        const sampleDoc = await db.collection(collection.name).findOne({});
        if (sampleDoc) {
          const hasRelevantFields = Object.keys(sampleDoc).some(
            (key) =>
              key.toLowerCase().includes("summary") ||
              key.toLowerCase().includes("content") ||
              key.toLowerCase().includes("text")
          );
          if (hasRelevantFields) {
            console.log(
              `\n${collection.name} collection has relevant fields:`,
              Object.keys(sampleDoc)
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkSummaries();
