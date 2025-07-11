import { NextRequest, NextResponse } from "next/server";
import formidable, { Fields, Files, File } from "formidable";
import fs from "fs";
import { extractText } from "@/lib/extractText";
import { chunkText } from "@/lib/chunkText";
import { addChunks } from "@/lib/chroma";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
import type { IncomingMessage } from "http";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  // Extract adminId from JWT
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let adminId = "";
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    adminId = payload.adminId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const form = formidable({ multiples: false });
  const buffers: Buffer[] = [];
  let fileInfo: File | null = null;

  await new Promise<void>((resolve, reject) => {
    const nodeReq = (req as unknown as { req: IncomingMessage }).req;
    form.parse(nodeReq, (err: Error | null, fields: Fields, files: Files) => {
      if (err) return reject(err);
      let file = files.file as unknown;
      if (!file) return reject("No file uploaded");
      // If multiple: false, file is File; if true, file is File[]
      if (Array.isArray(file)) file = file[0];
      if (
        !file ||
        typeof file !== "object" ||
        Array.isArray(file) ||
        typeof (file as File).filepath !== "string"
      ) {
        return reject("Invalid file");
      }
      fileInfo = file as File;
      const stream = fs.createReadStream(fileInfo.filepath);
      stream.on("data", (chunk) => {
        if (Buffer.isBuffer(chunk)) buffers.push(chunk);
      });
      stream.on("end", resolve);
      stream.on("error", reject);
    });
  });

  if (!fileInfo) {
    return NextResponse.json(
      { error: "File info missing after upload" },
      { status: 400 }
    );
  }

  const fileBuffer = Buffer.concat(
    buffers.filter((b): b is Buffer => Buffer.isBuffer(b))
  );
  const mimetype = (fileInfo as File).mimetype || "";
  const filename = (fileInfo as File).originalFilename || "";
  if (!filename) {
    return NextResponse.json({ error: "Filename missing" }, { status: 400 });
  }
  const text = await extractText(fileBuffer, mimetype);
  const chunks = chunkText(text);

  // Batch embedding for all chunks
  const embedResp = await openai.embeddings.create({
    input: chunks,
    model: "text-embedding-3-small",
  });
  const embeddings = embedResp.data.map(
    (d: { embedding: number[] }) => d.embedding
  );

  // Store in ChromaDB
  const metadata = chunks.map((_, i) => ({ filename, adminId, chunkIndex: i }));
  await addChunks(chunks, embeddings, metadata);

  return NextResponse.json({ success: true, chunks: chunks.length, filename });
}
