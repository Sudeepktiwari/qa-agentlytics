import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { querySimilarChunks } from "@/lib/chroma";
import { parseCurlRegistrationSpec, redactHeadersForLog, extractBodyKeysFromCurl } from "@/lib/curl";
import { verifyAdminAccessFromCookie } from "@/lib/auth";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-admin-id, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const adminVerification = await verifyAdminAccessFromCookie(request);
    if (!adminVerification.isValid || !adminVerification.adminId) {
      return NextResponse.json(
        { success: false, error: adminVerification.error || "Authentication failed" },
        { status: 401, headers: corsHeaders }
      );
    }
    const adminId = adminVerification.adminId;

    const { prompt, namespace = "docs", topK = 5 } = await request.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing 'prompt'" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Embed the prompt
    const embedResp = await openai.embeddings.create({
      input: [prompt.trim()],
      model: "text-embedding-3-small", dimensions: 1024,
    });
    const promptEmbedding = embedResp.data[0].embedding;

    // Retrieve topK chunks scoped to admin
    const similar = await querySimilarChunks(promptEmbedding, Number(topK) || 5, adminId);
    const chunks = similar.map((s) => s.text);
    const context = chunks.join("\n---\n");

    // Compose instructions: return ONLY a cURL command
    const systemPrompt = `You are an API expert. Based on the provided context (documentation snippets), generate a single, correct cURL command that fulfills the user's request.\n\nRules:\n- Return ONLY the cURL command (no markdown, no explanations).\n- Include method, URL, headers, and body as required.\n- Prefer JSON and include Content-Type header.\n- If auth is mentioned in context, include the appropriate header.\n- If endpoint requires fields, include them in the JSON body.`;

    const userPrompt = `Request: ${prompt}\n\nNamespace: ${namespace}\n\nContext:\n${context}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content || "";
    // Extract first line starting with 'curl' for robustness
    const curlMatch = raw.match(/\bcurl\b[\s\S]*$/);
    const curl = (curlMatch ? curlMatch[0] : raw).trim();

    try {
      const p = parseCurlRegistrationSpec(curl);
      const bodyKeys = extractBodyKeysFromCurl(curl);
      const parsed = {
        method: p.method,
        url: p.url,
        contentType: p.contentType,
        headersRedacted: redactHeadersForLog(p.headers),
        bodyKeys,
      };
      return NextResponse.json(
        { curl, hits: chunks.length, success: true, parsed },
        { status: 200, headers: corsHeaders }
      );
    } catch {
      return NextResponse.json(
        { curl, hits: chunks.length, success: true },
        { status: 200, headers: corsHeaders }
      );
    }
  } catch (error: any) {
    console.error("❌ /api/generate error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}