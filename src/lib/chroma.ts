import { Pinecone } from "@pinecone-database/pinecone";

// Pinecone environment variables must be set:
// - PINECONE_API_KEY (your Pinecone API key)
// - PINECONE_CONTROLLER_HOST (your Pinecone environment's controller host, e.g., https://controller.us-east1-gcp.pinecone.io)
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_KEY!,
});
const index = pinecone.Index(process.env.PINECONE_INDEX!);

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
  await index.upsert(vectors);
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
  });
  // Filter by adminId if provided
  type PineconeMatch = { metadata?: { adminId?: string; chunk?: string } };
  let matches: PineconeMatch[] = result.matches || [];
  if (adminId) {
    matches = matches.filter(
      (m: PineconeMatch) => m.metadata && m.metadata.adminId === adminId
    );
  }
  // Return the chunk text
  return matches.map((m: PineconeMatch) => m.metadata?.chunk || "");
}

export async function listDocuments() {
  // Pinecone does not support listing all vectors directly; you need to track filenames separately.
  // As a workaround, you can store a list in your DB, or use metadata filtering if available in your plan.
  // Here, we return an empty array and recommend tracking filenames elsewhere.
  return [];
}

export async function deleteDocument(filename: string, adminId?: string) {
  // Pinecone does not support metadata-based deletion directly; you must track IDs elsewhere.
  // If you track IDs, you can delete by ID. Otherwise, you need to fetch all IDs for the filename and delete them.
  // Not implemented here.
}

export async function deleteChunksByFilename(
  filename: string,
  adminId?: string
) {
  // Not implemented: see note above. You need to track IDs for each filename to delete.
}

export async function deleteChunksByUrl(url: string, adminId?: string) {
  // Not implemented: see note above. You need to track IDs for each URL to delete.
}

export async function getChunksByPageUrl(adminId: string, pageUrl: string) {
  // Pinecone does not support metadata-based queries in all plans. If available, use a metadata filter.
  // Otherwise, you need to track IDs for each pageUrl/adminId pair.
  // Not implemented here.
  return [];
}
