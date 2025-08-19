const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

async function checkTestDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully");

    // Check the test database where summaries are stored
    const db = client.db("test");

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\nFound ${collections.length} collections in test database:`);

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
            key.toLowerCase().includes("structured") ||
            key.toLowerCase().includes("chunk") ||
            key.toLowerCase().includes("vector")
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

        // Check for documents with summaries specifically
        if (collection.name === "crawled_pages") {
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
            docsWithSummary.slice(0, 10).forEach((doc, index) => {
              console.log(`${index + 1}. ${doc.url}`);
              console.log(
                `   Summary length: ${doc.summary.length} characters`
              );
              if (doc.structuredSummary) {
                console.log(
                  `   Structured summary keys: ${Object.keys(
                    doc.structuredSummary
                  ).join(", ")}`
                );
              }
              console.log(`   Created: ${doc.createdAt}\n`);
            });
          }
        }

        // Check for pinecone vectors
        if (collection.name === "pinecone_vectors") {
          console.log("\nPinecone vectors sample:");
          const vectorSample = await db.collection(collection.name).findOne({});
          console.log("Vector document keys:", Object.keys(vectorSample));
          if (vectorSample.text) {
            console.log(
              `Vector text length: ${vectorSample.text.length} characters`
            );
            console.log(
              `Vector text preview: ${vectorSample.text.substring(0, 200)}...`
            );
          }

          // Check unique URLs in vectors
          const uniqueUrls = await db
            .collection(collection.name)
            .distinct("filename");
          console.log(`Unique URLs with vectors: ${uniqueUrls.length}`);
          if (uniqueUrls.length > 0) {
            console.log("Sample URLs with vectors:");
            uniqueUrls.slice(0, 5).forEach((url) => console.log(`- ${url}`));
          }
        }

        // Show small collections completely
        if (count <= 5 && collection.name !== "pinecone_vectors") {
          console.log("\nAll documents:");
          const allDocs = await db
            .collection(collection.name)
            .find({})
            .toArray();
          allDocs.forEach((doc, index) => {
            console.log(
              `\nDocument ${index + 1}:`,
              JSON.stringify(doc, null, 2)
            );
          });
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkTestDatabase();
