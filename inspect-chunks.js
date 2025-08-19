const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

async function inspectChunks() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("test");
    const vectorCollection = db.collection("pinecone_vectors");

    console.log("=== INSPECTING CHUNK DATA ===");

    // Get a sample chunk for the specific URL
    const sampleChunk = await vectorCollection.findOne({
      adminId: "683d367c34f91e34254f2914",
      filename: "https://www.appointy.com/termsofuse/",
    });

    if (sampleChunk) {
      console.log("\nFull chunk structure:");
      console.log(JSON.stringify(sampleChunk, null, 2));

      console.log("\nAll field names:");
      console.log(Object.keys(sampleChunk));

      console.log("\nField analysis:");
      Object.keys(sampleChunk).forEach((key) => {
        const value = sampleChunk[key];
        console.log(
          `${key}: ${typeof value} (length: ${value?.length || "N/A"})`
        );
      });
    } else {
      console.log("No chunk found for that URL");
    }

    // Also check a few other chunks to see if they have different structure
    console.log("\n=== CHECKING OTHER CHUNKS ===");
    const otherChunks = await vectorCollection
      .find({
        adminId: "683d367c34f91e34254f2914",
      })
      .limit(3)
      .toArray();

    otherChunks.forEach((chunk, index) => {
      console.log(`\nChunk ${index + 1} fields:`, Object.keys(chunk));
      console.log(`Filename: ${chunk.filename}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

inspectChunks();
