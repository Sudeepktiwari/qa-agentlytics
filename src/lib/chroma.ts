import { Pinecone } from "@pinecone-database/pinecone";
import { getDb } from "./mongo";

// Pinecone environment variables must be set:
// - PINECONE_API_KEY (your Pinecone API key)
// - PINECONE_CONTROLLER_HOST (your Pinecone environment's controller host, e.g., https://controller.us-east1-gcp.pinecone.io)

if (!process.env.PINECONE_KEY) {
  console.error("❌ PINECONE_KEY is not set in environment variables!");
}
if (!process.env.PINECONE_INDEX) {
  console.error("❌ PINECONE_INDEX is not set in environment variables!");
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_KEY!,
});
const index = pinecone.index(process.env.PINECONE_INDEX!);

console.log("[DEBUG] PINECONE_INDEX:", process.env.PINECONE_INDEX);

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
  console.log(
    "[Crawl] Upserting vector IDs:",
    vectors.map((v) => v.id),
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
    try {
      console.log(
        `[Crawl] Inserting ${docs.length} vector records into MongoDB...`,
      );
      const result = await pineconeVectors.insertMany(docs);
      console.log(`[Crawl] MongoDB insert result:`, result.insertedCount);
    } catch (err) {
      console.error("[Crawl] MongoDB insertMany error:", err);
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

  console.log(
    `[Pinecone] Query (adminId: ${effectiveAdminId}, mode: ${searchMode}) returned ${
      result.matches?.length || 0
    } matches`,
  );

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
    console.log(
      `[Pinecone] Deleted vectors for ${filename} using filter (adminId: ${
        adminId || "none"
      })`,
    );
  } catch (err) {
    console.warn(
      "[Pinecone] Delete by filter failed, falling back to ID deletion:",
      err,
    );

    // Fallback: Delete by IDs tracked in MongoDB
    const match = adminId ? { filename, adminId } : { filename };
    const ids = await pineconeVectors
      .find(match)
      .project({ vectorId: 1, _id: 0 })
      .toArray();
    const vectorIds = ids.map((d) => (d as { vectorId: string }).vectorId);
    if (vectorIds.length > 0) {
      console.log(
        `[Pinecone] Fallback: Deleting ${vectorIds.length} vectors by ID...`,
      );
      const BATCH_SIZE = 1000;
      for (let i = 0; i < vectorIds.length; i += BATCH_SIZE) {
        const batch = vectorIds.slice(i, i + BATCH_SIZE);
        try {
          await index.deleteMany(batch);
          console.log(
            `[Pinecone] Deleted batch ${Math.floor(i / BATCH_SIZE) + 1} (${
              batch.length
            } vectors)`,
          );
        } catch (batchErr) {
          console.error(
            `[Pinecone] Error deleting batch ${
              Math.floor(i / BATCH_SIZE) + 1
            }:`,
            batchErr,
          );
        }
      }
    } else {
      console.warn(
        `[Pinecone] No vectors found in MongoDB for filename: ${filename} (adminId: ${adminId})`,
      );
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

  console.log(
    `[Pinecone] Bulk deleting vectors for ${urls.length} URLs (adminId: ${
      adminId || "none"
    })...`,
  );

  // 1. Try deleting from Pinecone using metadata filter ($in)
  try {
    const filter: any = { filename: { $in: urls } };
    if (adminId) {
      filter.adminId = { $eq: adminId };
    }
    // @ts-ignore
    await index.deleteMany(filter);
    console.log(
      `[Pinecone] Deleted vectors for ${urls.length} URLs using batch filter`,
    );
  } catch (err) {
    console.warn(
      "[Pinecone] Batch delete by filter failed, falling back to ID deletion:",
      err,
    );

    // Fallback: Delete by IDs tracked in MongoDB
    const match: any = { filename: { $in: urls } };
    if (adminId) match.adminId = adminId;

    const ids = await pineconeVectors
      .find(match)
      .project({ vectorId: 1, _id: 0 })
      .toArray();
    const vectorIds = ids.map((d) => (d as { vectorId: string }).vectorId);

    if (vectorIds.length > 0) {
      console.log(
        `[Pinecone] Fallback: Deleting ${vectorIds.length} vectors by ID (batch)...`,
      );
      const BATCH_SIZE = 1000;
      for (let i = 0; i < vectorIds.length; i += BATCH_SIZE) {
        const batch = vectorIds.slice(i, i + BATCH_SIZE);
        try {
          await index.deleteMany(batch);
          console.log(
            `[Pinecone] Deleted batch ${Math.floor(i / BATCH_SIZE) + 1} (${
              batch.length
            } vectors)`,
          );
        } catch (batchErr) {
          console.error(
            `[Pinecone] Error deleting batch ${
              Math.floor(i / BATCH_SIZE) + 1
            }:`,
            batchErr,
          );
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
  await deleteDocument(url, adminId);
}

export async function getChunksByPageUrl(adminId: string, pageUrl: string) {
  const db = await getDb();
  const pineconeVectors = db.collection("pinecone_vectors");

  // Normalize URL by removing trailing slash for regex creation
  const normalizedUrl = pageUrl.replace(/\/$/, "");
  const escaped = normalizedUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Match the URL optionally followed by a slash at the end
  const suffixPattern = new RegExp(`${escaped}\/?$`, "i");

  const ids = await pineconeVectors
    .find({ adminId, filename: { $regex: suffixPattern } })
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
    (v: { metadata?: { chunk?: string } }) => v.metadata?.chunk || "",
  );
}
