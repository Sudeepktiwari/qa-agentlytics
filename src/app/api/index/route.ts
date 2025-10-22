import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import * as cheerio from "cheerio";
import { chunkText } from "@/lib/chunkText";
import { addChunks } from "@/lib/chroma";
import { verifyAdminAccessFromCookie } from "@/lib/auth";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// CORS headers for cross-origin admin calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-admin-id, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function isGoogleDocsUrl(url: string): boolean {
  return /https?:\/\/docs\.google\.com\/document\/d\//i.test(url);
}

function toGoogleDocTextExport(url: string): string {
  // Transform /edit?usp=sharing to /export?format=txt
  const match = url.match(/https?:\/\/docs\.google\.com\/document\/d\/([^/]+)/i);
  if (!match) return url;
  const docId = match[1];
  return `https://docs.google.com/document/d/${docId}/export?format=txt`;
}

function extractSemanticText(html: string): string {
  const $ = cheerio.load(html);
  // Remove non-content elements
  $("script, style, noscript").remove();
  const mainText = $("main").text();
  const articleText = $("article").text();
  const bodyText = $("body").text();
  const combined = [mainText, articleText, bodyText].filter(Boolean).join("\n\n");
  return combined.replace(/\s+/g, " ").trim();
}

async function readInputText(url: string | null, file: File | null): Promise<{ text: string; source: string }> {
  if (url && url.trim().length > 0) {
    const effectiveUrl = isGoogleDocsUrl(url) ? toGoogleDocTextExport(url) : url;
    const resp = await fetch(effectiveUrl);
    if (!resp.ok) {
      throw new Error(`Failed to fetch URL: ${resp.status}`);
    }
    const contentType = resp.headers.get("content-type") || "";
    const raw = await resp.text();
    const text = /html/i.test(contentType) ? extractSemanticText(raw) : raw;
    return { text, source: url };
  }
  if (file) {
    const text = await file.text();
    return { text, source: file.name || "uploaded-file" };
  }
  throw new Error("No input provided");
}

export async function POST(request: NextRequest) {
  try {
    const adminVerification = await verifyAdminAccessFromCookie(request);
    if (!adminVerification.isValid || !adminVerification.adminId) {
      return NextResponse.json(
        { ok: false, error: adminVerification.error || "Authentication failed" },
        { status: 401, headers: corsHeaders }
      );
    }
    const adminId = adminVerification.adminId;

    const form = await request.formData();
    const url = (form.get("url") as string) || null;
    const file = (form.get("file") as File) || null;
    const namespace = ((form.get("namespace") as string) || "docs").trim();

    if ((!url || url.trim().length === 0) && !file) {
      return NextResponse.json(
        { ok: false, error: "Provide either a 'url' or a 'file'" },
        { status: 400, headers: corsHeaders }
      );
    }

    const { text, source } = await readInputText(url, file);
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "No text extracted from input" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Normalize and chunk text per spec
    const normalized = text.replace(/\s+/g, " ").trim();
    const chunksRaw = chunkText(normalized, 2000);
    const chunks = chunksRaw.slice(0, 12);

    // Embed chunks
    const embedResp = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunks,
    });
    const embeddings = embedResp.data.map((d) => d.embedding);

    // Upsert to Pinecone via chroma.ts helper; include namespace via filename prefix
    const filename = `${namespace}:${source}`;
    const metadata = chunks.map((_, i) => ({ filename, chunkIndex: i, adminId }));
    await addChunks(chunks, embeddings, metadata);

    return NextResponse.json(
      { ok: true, count: chunks.length, source: filename },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("❌ /api/index error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}