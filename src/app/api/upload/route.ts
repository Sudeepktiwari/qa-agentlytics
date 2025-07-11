import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import { extractText } from "@/lib/extractText";
import { chunkText } from "@/lib/chunkText";
import { addChunks } from "@/lib/chroma";
import OpenAI from "openai";
import jwt from "jsonwebtoken";

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
  let fileInfo: any = null;

  await new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err);
      const file = files.file;
      if (!file) return reject("No file uploaded");
      fileInfo = file;
      const stream = fs.createReadStream(file.filepath);
      stream.on("data", (chunk) => buffers.push(chunk));
      stream.on("end", resolve);
      stream.on("error", reject);
    });
  });

  const fileBuffer = Buffer.concat(buffers);
  const mimetype = fileInfo.mimetype;
  const filename = fileInfo.originalFilename;
  const text = await extractText(fileBuffer, mimetype);
  const chunks = chunkText(text);

  // Batch embedding for all chunks
  const embedResp = await openai.embeddings.create({
    input: chunks,
    model: "text-embedding-3-small",
  });
  const embeddings = embedResp.data.map((d: any) => d.embedding);

  // Store in ChromaDB
  const metadata = chunks.map((_, i) => ({ filename, adminId, chunkIndex: i }));
  await addChunks(chunks, embeddings, metadata);

  return NextResponse.json({ success: true, chunks: chunks.length, filename });
}
