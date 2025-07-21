import { Pinecone } from "@pinecone-database/pinecone";
import { getDb } from "./mongo";

// Pinecone environment variables must be set:
// - PINECONE_API_KEY (your Pinecone API key)
// - PINECONE_CONTROLLER_HOST (your Pinecone environment's controller host, e.g., https://controller.us-east1-gcp.pinecone.io)
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_KEY!,
});
const index = pinecone.index(process.env.PINECONE_INDEX!);

console.log("[DEBUG] PINECONE_INDEX:", process.env.PINECONE_INDEX);

// Helper to build Pinecone vector objects
function buildVectors(
  chunks: string[],
  embeddings: number[][],
  metadata: { filename: string; chunkIndex: number; adminId: string }[]
) {
  return chunks.map((chunk, i) => ({
    id: `${metadata[i].filename}-${metadata[i].chunkIndex}-${metadata[i].adminId}`,
    values: embeddings[i],
    metadata: { ...metadata[i], chunk },
  }));
}

export async function addChunks(
  chunks: string[],
  embeddings: number[][],
  metadata: { filename: string; chunkIndex: number; adminId: string }[]
) {
  const vectors = buildVectors(chunks, embeddings, metadata);
  console.log(
    "[Crawl] Upserting vector IDs:",
    vectors.map((v) => v.id)
  );
  const upsertResponse = await index.upsert(vectors);
  console.log("[Crawl] Pinecone upsert response:", upsertResponse);
  // Track in MongoDB
  const db = await getDb();
  const pineconeVectors = db.collection("pinecone_vectors");
  const docs = vectors.map((v, i) => ({
    vectorId: v.id,
    filename: metadata[i].filename,
    adminId: metadata[i].adminId,
    chunkIndex: metadata[i].chunkIndex,
    createdAt: new Date(),
  }));
  if (docs.length > 0) {
    await pineconeVectors.insertMany(docs);
  }
}

export async function querySimilarChunks(
  questionEmbedding: number[],
  topK = 5,
  adminId?: string
) {
  const result = await index.query({
    vector: questionEmbedding,
    topK,
    includeMetadata: true,
    filter: adminId ? { adminId } : undefined, // restrict search to current admin
  });
  // Filter by adminId if provided
  type PineconeMatch = { metadata?: { adminId?: string; chunk?: string } };
  let matches: PineconeMatch[] = result.matches || [];
  // No need to filter by adminId here, as Pinecone already does it
  // Return the chunk text
  return matches.map((m: PineconeMatch) => m.metadata?.chunk || "");
}

export async function listDocuments(adminId?: string) {
  const db = await getDb();
  const pineconeVectors = db.collection("pinecone_vectors");
  const match = adminId ? { adminId } : {};
  const docs = await pineconeVectors
    .aggregate([
      { $match: match },
      { $group: { _id: "$filename", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])
    .toArray();
  return docs.map((d) => ({ filename: d._id, count: d.count }));
}

export async function deleteDocument(filename: string, adminId?: string) {
  const db = await getDb();
  const pineconeVectors = db.collection("pinecone_vectors");
  const match = adminId ? { filename, adminId } : { filename };
  const ids = await pineconeVectors
    .find(match)
    .project({ vectorId: 1, _id: 0 })
    .toArray();
  const vectorIds = ids.map((d) => (d as { vectorId: string }).vectorId);
  if (vectorIds.length > 0) {
    await index.deleteMany(vectorIds);
  }
  await pineconeVectors.deleteMany(match);
}

export async function deleteChunksByFilename(
  _filename: string,
  _adminId?: string
) {
  void _filename;
  void _adminId;
  // Not implemented: see note above. You need to track IDs for each filename to delete.
}

export async function deleteChunksByUrl(_url: string, _adminId?: string) {
  void _url;
  void _adminId;
  // Not implemented: see note above. You need to track IDs for each URL to delete.
}

export async function getChunksByPageUrl(adminId: string, pageUrl: string) {
  const db = await getDb();
  const pineconeVectors = db.collection("pinecone_vectors");
  // Find all vector IDs for this adminId and pageUrl (filename)
  const ids = await pineconeVectors
    .find({ adminId, filename: pageUrl })
    .project({ vectorId: 1, _id: 0 })
    .toArray();
  const vectorIds = ids.map((d) => (d as { vectorId: string }).vectorId);
  console.log("[DEBUG] Vector IDs to fetch:", vectorIds);
  if (vectorIds.length === 0) return [];
  // Query Pinecone for these vectors
  const result = await index.fetch(vectorIds);
  console.log("[DEBUG] Pinecone fetch result:", result);
  // Return the chunk text from metadata (use result.records)
  return Object.values(result.records || {}).map(
    (v: { metadata?: { chunk?: string } }) => v.metadata?.chunk || ""
  );
}
