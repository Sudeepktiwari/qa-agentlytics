import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // Dynamic imports for large dependencies
  const formidable = (await import("formidable")).default;
  const fs = await import("fs");
  const { extractText } = await import("../src/lib/extractText");
  const { chunkText } = await import("../src/lib/chunkText");
  const { addChunks } = await import("../src/lib/chroma");
  const OpenAI = (await import("openai")).default;
  const jwt = (await import("jsonwebtoken")).default;

  const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Extract adminId from JWT
  const token =
    req.cookies?.auth_token ||
    req.headers.cookie
      ?.split("; ")
      .find((c: string) => c.startsWith("auth_token="))
      ?.split("=")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  let adminId = "";
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    adminId = payload.adminId;
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const form = formidable({ multiples: false });
  const buffers: Buffer[] = [];
  let fileInfo: any = null;

  await new Promise<void>((resolve, reject) => {
    form.parse(req, (err: Error | null, fields: any, files: any) => {
      if (err) return reject(err);
      let file = files.file as any;
      if (!file) return reject("No file uploaded");
      if (Array.isArray(file)) file = file[0];
      if (
        !file ||
        typeof file !== "object" ||
        Array.isArray(file) ||
        typeof file.filepath !== "string"
      ) {
        return reject("Invalid file");
      }
      fileInfo = file;
      const stream = fs.createReadStream(file.filepath);
      stream.on("data", (chunk: any) => {
        if (Buffer.isBuffer(chunk)) buffers.push(chunk);
      });
      stream.on("end", resolve);
      stream.on("error", reject);
    });
  });

  if (!fileInfo) {
    res.status(400).json({ error: "File info missing after upload" });
    return;
  }

  const fileBuffer = Buffer.concat(
    buffers.filter((b): b is Buffer => Buffer.isBuffer(b))
  );
  const mimetype = (fileInfo as any).mimetype || "";
  const filename = (fileInfo as any).originalFilename || "";
  if (!filename) {
    res.status(400).json({ error: "Filename missing" });
    return;
  }
  const text = await extractText(fileBuffer, mimetype);
  const chunks = chunkText(text);

  // Batch embedding for all chunks
  const embedResp = await openai.embeddings.create({
    input: chunks,
    model: "text-embedding-3-small", dimensions: 1024,
  });
  const embeddings = embedResp.data.map(
    (d: { embedding: number[] }) => d.embedding
  );

  // Store in Pinecone (vector database)
  const metadata = chunks.map((_, i) => ({ filename, adminId, chunkIndex: i }));
  await addChunks(chunks, embeddings, metadata);

  res.status(200).json({ success: true, chunks: chunks.length, filename });
}
