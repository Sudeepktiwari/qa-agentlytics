const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

async function checkChatbotDb() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully");

    // Check the chatbot_db database instead of sample-chatbot
    const db = client.db("chatbot_db");

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\nFound ${collections.length} collections in chatbot_db:`);

    for (const collection of collections) {
      console.log(`\n=== ${collection.name.toUpperCase()} COLLECTION ===`);
      const count = await db.collection(collection.name).countDocuments();
      console.log(`Document count: ${count}`);

      if (count > 0) {
        // Get a sample document to see the structure
        const sampleDoc = await db.collection(collection.name).findOne({});
        console.log("Sample document structure:");
        console.log("Keys:", Object.keys(sampleDoc));

        // Check for summary-related fields
        const summaryFields = Object.keys(sampleDoc).filter(
          (key) =>
            key.toLowerCase().includes("summary") ||
            key.toLowerCase().includes("content") ||
            key.toLowerCase().includes("text") ||
            key.toLowerCase().includes("url") ||
            key.toLowerCase().includes("structured")
        );

        if (summaryFields.length > 0) {
          console.log("Relevant fields:", summaryFields);
          summaryFields.forEach((field) => {
            const value = sampleDoc[field];
            if (typeof value === "string") {
              console.log(
                `${field}: ${
                  value.length > 100 ? value.substring(0, 100) + "..." : value
                }`
              );
            } else if (typeof value === "object" && value !== null) {
              console.log(
                `${field}: [Object with keys: ${Object.keys(value).join(", ")}]`
              );
            } else {
              console.log(`${field}: ${value}`);
            }
          });
        }

        // Show all documents if collection is small
        if (count <= 10) {
          console.log("\nAll documents:");
          const allDocs = await db
            .collection(collection.name)
            .find({})
            .toArray();
          allDocs.forEach((doc, index) => {
            console.log(`\nDocument ${index + 1}:`);
            if (doc.url) console.log(`URL: ${doc.url}`);
            if (doc.summary)
              console.log(`Has summary: ${doc.summary.length} chars`);
            if (doc.structuredSummary)
              console.log(
                `Has structured summary: ${Object.keys(
                  doc.structuredSummary
                ).join(", ")}`
              );
            if (doc.text) console.log(`Has text: ${doc.text.length} chars`);
            console.log(`Created: ${doc.createdAt || doc._id.getTimestamp()}`);
          });
        } else {
          // For larger collections, show summary info
          console.log("\nSummary of documents:");
          const docsWithSummary = await db
            .collection(collection.name)
            .find({ summary: { $exists: true } })
            .toArray();
          const docsWithStructuredSummary = await db
            .collection(collection.name)
            .find({ structuredSummary: { $exists: true } })
            .toArray();
          console.log(`Documents with summary: ${docsWithSummary.length}`);
          console.log(
            `Documents with structured summary: ${docsWithStructuredSummary.length}`
          );

          if (docsWithSummary.length > 0) {
            console.log("\nURLs with summaries:");
            docsWithSummary.slice(0, 5).forEach((doc) => {
              console.log(`- ${doc.url || doc._id}`);
            });
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

checkChatbotDb();
