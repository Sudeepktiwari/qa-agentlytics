// Debug script to check MongoDB collections and document data
const { MongoClient } = require("mongodb");

async function debugDocuments() {
  const uri = "mongodb+srv://root:root@cluster0.gd39s3j.mongodb.net/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("\n=== Available Collections ===");
    collections.forEach((col) => console.log(`- ${col.name}`));

    // Check pinecone_vectors collection
    console.log("\n=== Pinecone Vectors Collection ===");
    const pineconeVectors = db.collection("pinecone_vectors");
    const totalVectors = await pineconeVectors.countDocuments();
    console.log(`Total vectors: ${totalVectors}`);

    if (totalVectors > 0) {
      console.log("\n=== Sample Documents ===");
      const sampleDocs = await pineconeVectors.find().limit(5).toArray();
      sampleDocs.forEach((doc, i) => {
        console.log(`Document ${i + 1}:`);
        console.log(`  - vectorId: ${doc.vectorId}`);
        console.log(`  - filename: ${doc.filename}`);
        console.log(`  - adminId: ${doc.adminId}`);
        console.log(`  - chunkIndex: ${doc.chunkIndex}`);
        console.log(`  - createdAt: ${doc.createdAt}`);
        console.log("");
      });

      // Group by filename (like the listDocuments function)
      console.log("\n=== Document Summary (all adminIds) ===");
      const docSummary = await pineconeVectors
        .aggregate([
          { $group: { _id: "$filename", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      let urlCount = 0;
      let fileCount = 0;

      docSummary.forEach((doc) => {
        const isUrl =
          doc._id &&
          (doc._id.startsWith("http://") || doc._id.startsWith("https://"));
        if (isUrl) {
          urlCount++;
        } else {
          fileCount++;
          console.log(`[DOC] ${doc._id}: ${doc.count} chunks`);
        }
      });

      console.log(
        `\nSummary: ${urlCount} URLs (crawled pages), ${fileCount} actual documents`
      );

      // Group by adminId
      console.log("\n=== AdminId Summary ===");
      const adminSummary = await pineconeVectors
        .aggregate([
          { $group: { _id: "$adminId", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      adminSummary.forEach((admin) => {
        console.log(`AdminId ${admin._id}: ${admin.count} chunks`);
      });
    }

    // Check users collection for adminIds
    console.log("\n=== Users Collection ===");
    const users = db.collection("users");
    const totalUsers = await users.countDocuments();
    console.log(`Total users: ${totalUsers}`);

    if (totalUsers > 0) {
      const sampleUsers = await users.find().limit(3).toArray();
      sampleUsers.forEach((user, i) => {
        console.log(`User ${i + 1}:`);
        console.log(`  - _id: ${user._id}`);
        console.log(`  - email: ${user.email}`);
        console.log(`  - adminId: ${user.adminId}`);
        console.log("");
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

debugDocuments();
