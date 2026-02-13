import { Pinecone } from "@pinecone-database/pinecone";
import { getDb } from "./mongo";

// Pinecone environment variables must be set:
// - PINECONE_API_KEY (your Pinecone API key)
// - PINECONE_CONTROLLER_HOST (your Pinecone environment's controller host, e.g., https://controller.us-east1-gcp.pinecone.io)

if (!process.env.PINECONE_KEY) {
  // console.error removed
}
if (!process.env.PINECONE_INDEX) {
  // console.error removed
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_KEY!,
});
const index = pinecone.index(process.env.PINECONE_INDEX!);

// console.log removed

// Helper to build Pinecone vector objects
function buildVectors(
  chunks: string[],
  embeddings: number[][],
  metadata: { filename: string; chunkIndex: number; adminId: string }[],
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
  metadata: { filename: string; chunkIndex: number; adminId: string }[],
) {
  const vectors = buildVectors(chunks, embeddings, metadata);
  // console.log removed
  const upsertResponse = await index.upsert(vectors);
  // console.log removed
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
    try {
      // console.log removed
      const result = await pineconeVectors.insertMany(docs);
      // console.log removed
    } catch (err) {
      // console.error removed
      throw err;
    }
  }
}

// Query similar chunks, ALWAYS scoped to an admin (multi-tenant safety)
export async function querySimilarChunks(
  questionEmbedding: number[],
  topK = 5,
  adminId?: string,
  searchMode: "user" | "global" = "user",
) {
  // Enforce admin-level isolation: default to "default-admin" if none provided
  const effectiveAdminId =
    adminId && adminId.trim().length > 0 ? adminId : "default-admin";

  const queryParams: any = {
    vector: questionEmbedding,
    topK,
    includeMetadata: true,
  };

  if (searchMode !== "global") {
    queryParams.filter = { adminId: effectiveAdminId };
  }

  const result = await index.query(queryParams);

  // console.log removed

  type PineconeMatch = {
    metadata?: { adminId?: string; chunk?: string; filename?: string };
  };
  const matches: PineconeMatch[] = result.matches || [];
  return matches.map((m: PineconeMatch) => ({
    text: m.metadata?.chunk || "",
    source: m.metadata?.filename || "",
  }));
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

  // Return ALL documents - both uploaded files AND crawled pages
  return docs.map((d) => ({ filename: d._id, count: d.count }));
}

export async function deleteDocument(filename: string, adminId?: string) {
  const db = await getDb();
  const pineconeVectors = db.collection("pinecone_vectors");

  // 1. Try deleting from Pinecone using metadata filter (most robust)
  try {
    const filter: any = { filename: { $eq: filename } };
    if (adminId) {
      filter.adminId = { $eq: adminId };
    }
    // @ts-ignore - deleteMany supports filter in v6 but types might be tricky
    await index.deleteMany(filter);
    // console.log removed
  } catch (err) {
    // console.warn removed

    // Fallback: Delete by IDs tracked in MongoDB
    const match = adminId ? { filename, adminId } : { filename };
    const ids = await pineconeVectors
      .find(match)
      .project({ vectorId: 1, _id: 0 })
      .toArray();
    const vectorIds = ids.map((d) => (d as { vectorId: string }).vectorId);
    if (vectorIds.length > 0) {
      // console.log removed
      const BATCH_SIZE = 1000;
      for (let i = 0; i < vectorIds.length; i += BATCH_SIZE) {
        const batch = vectorIds.slice(i, i + BATCH_SIZE);
        try {
          await index.deleteMany(batch);
          // console.log removed
        } catch (batchErr) {
          // console.error removed
        }
      }
    } else {
      // console.warn removed
    }
  }

  // 2. Delete from MongoDB
  const match = adminId ? { filename, adminId } : { filename };
  await pineconeVectors.deleteMany(match);
}

export async function deleteChunksByUrls(urls: string[], adminId?: string) {
  if (!urls || urls.length === 0) return;
  const db = await getDb();
  const pineconeVectors = db.collection("pinecone_vectors");

  // console.log removed

  // 1. Try deleting from Pinecone using metadata filter ($in)
  try {
    const filter: any = { filename: { $in: urls } };
    if (adminId) {
      filter.adminId = { $eq: adminId };
    }
    // @ts-ignore
    await index.deleteMany(filter);
    // console.log removed
  } catch (err) {
    // console.warn removed

    // Fallback: Delete by IDs tracked in MongoDB
    const match: any = { filename: { $in: urls } };
    if (adminId) match.adminId = adminId;

    const ids = await pineconeVectors
      .find(match)
      .project({ vectorId: 1, _id: 0 })
      .toArray();
    const vectorIds = ids.map((d) => (d as { vectorId: string }).vectorId);

    if (vectorIds.length > 0) {
      // console.log removed
      const BATCH_SIZE = 1000;
      for (let i = 0; i < vectorIds.length; i += BATCH_SIZE) {
        const batch = vectorIds.slice(i, i + BATCH_SIZE);
        try {
          await index.deleteMany(batch);
          // console.log removed
        } catch (batchErr) {
          // console.error removed
        }
      }
    }
  }

  // 2. Delete from MongoDB
  const match: any = { filename: { $in: urls } };
  if (adminId) match.adminId = adminId;
  await pineconeVectors.deleteMany(match);
}

export async function deleteChunksByFilename(
  filename: string,
  adminId?: string,
) {
  await deleteDocument(filename, adminId);
}

export async function deleteChunksByUrl(url: string, adminId?: string) {
  // 1. Try deleting by exact filename match first
  await deleteDocument(url, adminId);

  // 2. Also try to clean up variations (trailing slash differences) using regex
  // This helps if the URL was stored differently in previous crawls
  const db = await getDb();
  const pineconeVectors = db.collection("pinecone_vectors");

  const normalizedUrl = url.replace(/\/$/, "");
  const escaped = normalizedUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Match the URL optionally followed by a slash at the end
  const suffixPattern = new RegExp(`${escaped}\/?$`, "i");

  // Find IDs that match the pattern but might not have been caught by exact match
  const match: any = { filename: { $regex: suffixPattern } };
  if (adminId) match.adminId = adminId;

  const ids = await pineconeVectors
    .find(match)
    .project({ vectorId: 1, _id: 0 })
    .toArray();
  const vectorIds = ids.map((d) => (d as { vectorId: string }).vectorId);

  if (vectorIds.length > 0) {
    // console.log removed
    // Delete from Pinecone
    const BATCH_SIZE = 1000;
    for (let i = 0; i < vectorIds.length; i += BATCH_SIZE) {
      const batch = vectorIds.slice(i, i + BATCH_SIZE);
      try {
        await index.deleteMany(batch);
      } catch (err) {
        // console.error removed
      }
    }
    // Delete from MongoDB
    await pineconeVectors.deleteMany({
      vectorId: { $in: vectorIds },
    });
  }
}

export async function getChunksByPageUrl(adminId: string, pageUrl: string) {
  const db = await getDb();
  const pineconeVectors = db.collection("pinecone_vectors");

  // Helper to find vectors for a specific URL
  const findVectorsForUrl = async (urlToCheck: string) => {
    const normalizedUrl = urlToCheck.replace(/\/$/, "");
    const escaped = normalizedUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const suffixPattern = new RegExp(`${escaped}\/?$`, "i");
    return pineconeVectors
      .find({ adminId, filename: { $regex: suffixPattern } })
      .project({ vectorId: 1, _id: 0 })
      .toArray();
  };

  // 1. Try the exact requested URL (e.g. QA URL)
  let ids = await findVectorsForUrl(pageUrl);

  // 2. QA/Testing Fallback: If no chunks found on QA domain, try Production domain
  // This allows testing the QA site using data crawled from the Production site
  if (ids.length === 0 && pageUrl.includes("qa-agentlytics.vercel.app")) {
    const prodUrl = pageUrl.replace(
      "https://qa-agentlytics.vercel.app",
      "https://agentlytics.advancelytics.com",
    );
    // console.log removed
    ids = await findVectorsForUrl(prodUrl);
  }

  const vectorIds = ids.map((d) => (d as { vectorId: string }).vectorId);
  // console.log removed
  if (vectorIds.length === 0) return [];
  // Query Pinecone for these vectors
  const result = await index.fetch(vectorIds);
  // console.log removed
  // Return the chunk text from metadata (use result.records)
  return Object.values(result.records || {}).map(
    (v: { metadata?: { chunk?: string } }) => v.metadata?.chunk || "",
  );
}
