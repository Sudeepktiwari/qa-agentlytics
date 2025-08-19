const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

async function checkAllData() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully");

    const db = client.db("sample-chatbot");

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\nFound ${collections.length} collections:`);

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
            key.toLowerCase().includes("url")
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
        if (count <= 5) {
          console.log("\nAll documents:");
          const allDocs = await db
            .collection(collection.name)
            .find({})
            .toArray();
          allDocs.forEach((doc, index) => {
            console.log(`Document ${index + 1}:`, JSON.stringify(doc, null, 2));
          });
        }
      }
    }

    // Check if there are any databases with different names
    const admin = db.admin();
    const dbList = await admin.listDatabases();
    console.log("\n=== ALL DATABASES ===");
    dbList.databases.forEach((database) => {
      console.log(`- ${database.name} (${database.sizeOnDisk} bytes)`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkAllData();
