import { CloudClient } from "chromadb";

const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY!,
  tenant: process.env.CHROMA_TENANT!,
  database: process.env.CHROMA_DB!,
});
const COLLECTION_NAME = "documents";

export async function getCollection() {
  let collection;
  try {
    collection = await client.getCollection({ name: COLLECTION_NAME });
  } catch {
    collection = await client.createCollection({ name: COLLECTION_NAME });
  }
  return collection;
}

export async function addChunks(
  chunks: string[],
  embeddings: number[][],
  metadata: { filename: string; chunkIndex: number; adminId: string }[]
) {
  const collection = await getCollection();
  await collection.add({
    ids: chunks.map(
      (_, i) =>
        `${metadata[i].filename}-${metadata[i].chunkIndex}-${metadata[i].adminId}`
    ),
    documents: chunks,
    embeddings,
    metadatas: metadata,
  });
}

export async function querySimilarChunks(
  questionEmbedding: number[],
  topK = 5,
  adminId?: string
) {
  const collection = await getCollection();
  const results = await collection.query({
    queryEmbeddings: [questionEmbedding],
    nResults: topK * 2, // fetch more to filter by adminId
  });
  // Filter by adminId if provided
  let docs = results.documents[0];
  const metas: (Record<string, unknown> | null)[] = results.metadatas[0];
  if (adminId) {
    const filtered = metas
      .map((meta, i) => ({ meta, doc: docs[i] }))
      .filter((item) => item.meta && item.meta.adminId === adminId);
    docs = filtered.map((item) => item.doc).slice(0, topK);
  } else {
    docs = docs.slice(0, topK);
  }
  return docs;
}

export async function listDocuments() {
  const collection = await getCollection();
  const all = await collection.get();
  const docMap: Record<string, number> = {};
  all.metadatas.forEach((meta) => {
    if (meta && typeof meta.filename === "string") {
      docMap[meta.filename] = (docMap[meta.filename] || 0) + 1;
    }
  });
  return Object.entries(docMap).map(([filename, count]) => ({
    filename,
    count,
  }));
}

export async function deleteDocument(filename: string, adminId?: string) {
  const collection = await getCollection();
  const all = await collection.get();
  const idsToDelete = all.metadatas
    .map((meta, i) =>
      meta &&
      meta.filename === filename &&
      (!adminId || meta.adminId === adminId)
        ? all.ids[i]
        : null
    )
    .filter((id): id is string => Boolean(id));
  if (idsToDelete.length > 0) {
    await collection.delete({ ids: idsToDelete });
  }
}

export async function deleteChunksByFilename(
  filename: string,
  adminId?: string
) {
  const collection = await getCollection();
  const all = await collection.get();
  const idsToDelete = all.metadatas
    .map((meta, i) =>
      meta &&
      meta.filename === filename &&
      (!adminId || meta.adminId === adminId)
        ? all.ids[i]
        : null
    )
    .filter((id): id is string => Boolean(id));
  if (idsToDelete.length > 0) {
    await collection.delete({ ids: idsToDelete });
  }
}

export async function deleteChunksByUrl(url: string, adminId?: string) {
  const collection = await getCollection();
  const all = await collection.get();
  const idsToDelete = all.metadatas
    .map((meta, i) =>
      meta && meta.url === url && (!adminId || meta.adminId === adminId)
        ? all.ids[i]
        : null
    )
    .filter((id): id is string => Boolean(id));
  if (idsToDelete.length > 0) {
    await collection.delete({ ids: idsToDelete });
  }
}

export async function getChunksByPageUrl(adminId: string, pageUrl: string) {
  const collection = await getCollection();
  const all = await collection.get();
  // Normalize URLs: try both with and without trailing slash
  const urlVariants = [
    pageUrl,
    pageUrl.endsWith("/") ? pageUrl.slice(0, -1) : pageUrl + "/",
  ];
  const chunks = all.metadatas
    .map((meta, i) =>
      meta &&
      meta.adminId === adminId &&
      typeof meta.filename === "string" &&
      urlVariants.includes(meta.filename as string)
        ? all.documents[i]
        : null
    )
    .filter((chunk): chunk is string => Boolean(chunk));
  // If nothing found, try matching on meta.url as well
  if (chunks.length === 0) {
    return all.metadatas
      .map((meta, i) =>
        meta &&
        meta.adminId === adminId &&
        typeof meta.url === "string" &&
        urlVariants.includes(meta.url as string)
          ? all.documents[i]
          : null
      )
      .filter((chunk): chunk is string => Boolean(chunk));
  }
  return chunks;
}
