import { getDb } from "../src/lib/mongo";

async function main() {
  const db = await getDb();
  const pages = db.collection("crawled_pages");
  const pineconeVectors = db.collection("pinecone_vectors");

  // Aggregate all unique (filename, adminId) pairs and their chunk counts
  const docs = await pages
    .aggregate([
      {
        $group: {
          _id: { filename: "$filename", adminId: "$adminId" },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  let totalInserted = 0;
  for (const doc of docs) {
    const { filename, adminId } = doc._id as {
      filename: string;
      adminId: string;
    };
    const chunkCount: number = doc.count;
    const bulk = [];
    for (let i = 0; i < chunkCount; i++) {
      const vectorId = `${filename}-${i}-${adminId}`;
      bulk.push({
        updateOne: {
          filter: { vectorId },
          update: {
            $set: {
              vectorId,
              filename,
              adminId,
              chunkIndex: i,
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      });
    }
    if (bulk.length > 0) {
      const result = await pineconeVectors.bulkWrite(bulk);
      totalInserted +=
        (result.upsertedCount || 0) + (result.modifiedCount || 0);
      console.log(`Backfilled: ${filename} (${chunkCount} chunks)`);
    }
  }
  console.log(
    `Backfill complete! Total records upserted/modified: ${totalInserted}`
  );
  process.exit();
}

main().catch((err) => {
  console.error("Backfill error:", err);
  process.exit(1);
});
