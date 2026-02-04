import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { verifyApiKey, verifyAdminTokenFromCookie } from "@/lib/auth";
import { z } from "zod";
import { assertBodyConstraints } from "@/lib/validators";
import { deleteChunksByUrl } from "@/lib/chroma";

const pc = new Pinecone({ apiKey: process.env.PINECONE_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function normalizeStructuredSummary(raw: any) {
  if (!raw || typeof raw !== "object") return raw;
  const result: any = { ...raw };
  if (!Array.isArray(result.sections)) {
    if (result.sections && typeof result.sections === "object") {
      result.sections = [result.sections];
    } else {
      result.sections = [];
    }
  }
  result.sections = result.sections.map((section: any) => {
    const s: any = { ...section };
    if (s.leadQuestions && !Array.isArray(s.leadQuestions)) {
      s.leadQuestions = [s.leadQuestions];
    }
    if (!Array.isArray(s.leadQuestions)) {
      const arr: any[] = [];
      if (s.leadQuestion) {
        arr.push({
          question: s.leadQuestion,
          options: Array.isArray(s.leadOptions) ? s.leadOptions : [],
          tags: Array.isArray(s.leadTags) ? s.leadTags : [],
          workflow:
            typeof s.leadWorkflow === "string" ? s.leadWorkflow : "legacy",
        });
      }
      s.leadQuestions = arr;
    } else {
      s.leadQuestions = s.leadQuestions.map((q: any) => {
        const optsRaw = Array.isArray(q?.options) ? q.options : [];
        const options = optsRaw.map((o: any) => {
          if (o && typeof o === "object" && typeof o.label === "string") {
            return {
              label: String(o.label),
              tags: Array.isArray(o.tags)
                ? o.tags.map((t: any) =>
                    String(t)
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, ""),
                  )
                : [],
              workflow:
                typeof o.workflow === "string" ? o.workflow : "education_path",
            };
          }
          const label = String(o || "");
          return { label, tags: [], workflow: "education_path" };
        });
        return {
          question: q && q.question ? q.question : "",
          options,
          tags: [],
          workflow:
            typeof q?.workflow === "string" ? q.workflow : "validation_path",
        };
      });
    }
    if (s.salesQuestions && !Array.isArray(s.salesQuestions)) {
      s.salesQuestions = [s.salesQuestions];
    }
    if (!Array.isArray(s.salesQuestions)) {
      const arr: any[] = [];
      if (s.salesQuestion) {
        arr.push({
          question: s.salesQuestion,
          options: Array.isArray(s.salesOptions) ? s.salesOptions : [],
          tags: Array.isArray(s.salesTags) ? s.salesTags : [],
          workflow:
            typeof s.salesWorkflow === "string"
              ? s.salesWorkflow
              : "diagnostic_response",
        });
      }
      s.salesQuestions = arr;
    } else {
      s.salesQuestions = s.salesQuestions.map((q: any) => {
        const optsRaw = Array.isArray(q?.options) ? q.options : [];
        const options = optsRaw.map((o: any) => {
          if (o && typeof o === "object" && typeof o.label === "string") {
            return {
              label: String(o.label),
              tags: Array.isArray(o.tags)
                ? o.tags.map((t: any) =>
                    String(t)
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, ""),
                  )
                : [],
              workflow:
                typeof o.workflow === "string"
                  ? o.workflow
                  : "optimization_workflow",
            };
          }
          const label = String(o || "");
          return { label, tags: [], workflow: "optimization_workflow" };
        });
        return {
          question: q && q.question ? q.question : "",
          options,
          tags: [],
          workflow: "diagnostic_education",
        };
      });
    }
    const baseTitle =
      typeof s.sectionName === "string" && s.sectionName.trim().length > 0
        ? s.sectionName.trim()
        : "this section";
    const summarySnippet =
      typeof s.sectionSummary === "string" && s.sectionSummary.trim().length > 0
        ? s.sectionSummary.trim()
        : "";
    while (s.leadQuestions.length < 2) {
      const idx = s.leadQuestions.length;
      s.leadQuestions.push({
        question:
          idx === 0
            ? `Which best describes your interest in ${baseTitle}?`
            : summarySnippet
              ? `What are you hoping to improve related to ${baseTitle}?`
              : `What are you hoping to improve in ${baseTitle}?`,
        options:
          idx === 0
            ? ["Just exploring", "Actively evaluating", "Ready to get started"]
            : ["Learn more", "Compare options", "Talk to sales"],
        tags: [baseTitle.toLowerCase()],
        workflow: "ask_sales_question",
      });
    }
    while (s.salesQuestions.length < 2) {
      const idx = s.salesQuestions.length;
      s.salesQuestions.push({
        question:
          idx === 0
            ? `How urgent is it for you to improve ${baseTitle}?`
            : `What stage are you at in deciding about ${baseTitle}?`,
        options:
          idx === 0
            ? ["In the next month", "In 1-3 months", "Just researching"]
            : ["Just researching", "Shortlisting options", "Ready to decide"],
        tags: [baseTitle.toLowerCase(), "sales"],
        workflow: "diagnostic_response",
        optionFlows: [],
      });
    }
    s.leadQuestions = s.leadQuestions.slice(0, 2).map((q: any) => {
      let opts = Array.isArray(q.options) ? q.options : [];
      if (opts.length < 2) {
        while (opts.length < 2) {
          opts.push({
            label: `Option ${opts.length + 1}`,
            tags: [],
            workflow: "education_path",
          });
        }
      }
      if (opts.length > 4) opts = opts.slice(0, 4);
      return { ...q, options: opts, tags: [] };
    });
    s.salesQuestions = s.salesQuestions.slice(0, 2).map((q: any) => {
      let opts = Array.isArray(q.options) ? q.options : [];
      if (opts.length < 2) {
        while (opts.length < 2) {
          opts.push({
            label: `Option ${opts.length + 1}`,
            tags: [],
            workflow: "optimization_workflow",
          });
        }
      }
      if (opts.length > 4) opts = opts.slice(0, 4);
      return { ...q, options: opts, tags: [] };
    });
    return s;
  });
  return result;
}

// GET - List all crawled pages with summary status
export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    let adminId: string | null = null;

    // 1. Try API key
    const apiKey = request.headers.get("x-api-key");
    if (apiKey) {
      const verification = await verifyApiKey(apiKey);
      if (verification) {
        adminId = verification.adminId;
      }
    }

    // 2. Try Cookie if no API key or invalid
    if (!adminId) {
      const cookieAuth = verifyAdminTokenFromCookie(request);
      if (cookieAuth) {
        adminId = cookieAuth.adminId;
      }
    }

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    client = new MongoClient(process.env.MONGODB_URI!);

    await client.connect();
    const db = client.db("test");
    const collection = db.collection("crawled_pages");
    const sitemapUrls = db.collection("sitemap_urls");
    const structuredSummaries = db.collection("structured_summaries");

    const searchParam =
      request.nextUrl.searchParams.get("search")?.toLowerCase() || "";
    const pageParam = request.nextUrl.searchParams.get("page");
    const pageSizeParam = request.nextUrl.searchParams.get("pageSize");
    const page =
      pageParam && !Number.isNaN(parseInt(pageParam, 10))
        ? Math.max(parseInt(pageParam, 10), 1)
        : 1;
    const pageSize =
      pageSizeParam && !Number.isNaN(parseInt(pageSizeParam, 10))
        ? Math.max(parseInt(pageSizeParam, 10), 1)
        : 500;

    const [pages, failedDocs] = await Promise.all([
      collection.find({ adminId }).sort({ createdAt: -1 }).toArray(),
      sitemapUrls
        .find({ adminId, failedAt: { $exists: true } })
        .sort({ failedAt: -1 })
        .toArray(),
    ]);

    const summaries = await structuredSummaries
      .find({ adminId })
      .project({ pageId: 1, url: 1, structuredSummary: 1 })
      .toArray();
    const byPageId = new Map<string, any>();
    const byUrl = new Map<string, any>();
    for (const s of summaries) {
      if (s.pageId) byPageId.set(String(s.pageId), s);
      if (s.url) byUrl.set(String(s.url), s);
    }

    // Define a common interface for the merged pages
    interface MergedPage {
      _id: any;
      url: string;
      hasStructuredSummary: boolean;
      createdAt: Date | string;
      status: string;
      error?: string;
      structuredSummary?: any;
      summary?: string;
    }

    // Add summary status flag (consider either structured or basic summary)
    const pagesWithStatus: MergedPage[] = pages.map((page) => ({
      _id: page._id,
      url: page.url,
      hasStructuredSummary: !!(
        byPageId.get(String(page._id)) ||
        byUrl.get(String(page.url)) ||
        page.summary
      ),
      createdAt: page.createdAt,
      status: "success",
      structuredSummary: (
        byPageId.get(String(page._id)) ||
        byUrl.get(String(page.url)) ||
        {}
      ).structuredSummary,
      summary: page.summary,
    }));

    // Map failedDocs to match CrawledPage shape + error info
    const failedPages: MergedPage[] = failedDocs.map((doc) => ({
      _id: doc._id,
      url: doc.url,
      hasStructuredSummary: false,
      createdAt: doc.failedAt,
      error: doc.error,
      status: "failed",
    }));

    // Merge and sort by date descending
    let allPages = [...pagesWithStatus, ...failedPages].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (searchParam) {
      allPages = allPages.filter((p) =>
        (p.url || "").toLowerCase().includes(searchParam),
      );
    }

    const total = allPages.length;
    const startIndex = (page - 1) * pageSize;
    const pagedPages =
      startIndex >= 0 && startIndex < total
        ? allPages.slice(startIndex, startIndex + pageSize)
        : [];

    return NextResponse.json({
      success: true,
      pages: pagedPages,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching crawled pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 },
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// POST - Generate structured summary for existing page (on-demand)
export async function POST(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    console.log("[API] POST /api/crawled-pages - Starting request");

    // Verify API key
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      console.log("[API] No API key provided");
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    console.log("[API] Verifying API key...");
    const verification = await verifyApiKey(apiKey);
    if (!verification) {
      console.log("[API] API key verification failed");
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const adminId = verification.adminId;
    console.log("[API] API key verified for adminId:", adminId);

    const body = await request.json();
    assertBodyConstraints(body, { maxBytes: 256 * 1024, maxDepth: 10 });
    const Schema = z
      .object({
        url: z.string().url().max(2048),
        regenerate: z.boolean().optional(),
      })
      .strict();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { url, regenerate } = parsed.data;
    console.log("[API] Request data:", { url, regenerate });

    console.log("[API] Connecting to MongoDB...");
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("crawled_pages");

    // Always use Pinecone chunk data for summary generation
    const vectorCollection = db.collection("pinecone_vectors");
    console.log(
      "[API] Forcing use of pinecone_vectors for summary generation:",
      {
        adminId,
        filename: url,
      },
    );

    // Get all vector IDs for this URL and admin
    const vectorDocs = await vectorCollection
      .find({ adminId, filename: url })
      .sort({ chunkIndex: 1 })
      .toArray();

    if (!vectorDocs || vectorDocs.length === 0) {
      // Try case-insensitive search
      const caseInsensitiveDocs = await vectorCollection
        .find({
          adminId,
          filename: {
            $regex: new RegExp(
              `^${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i",
            ),
          },
        })
        .sort({ chunkIndex: 1 })
        .toArray();
      if (!caseInsensitiveDocs || caseInsensitiveDocs.length === 0) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }
      // Use the found docs
      vectorDocs.push(...caseInsensitiveDocs);
    }

    // Fetch chunk text from Pinecone using vector IDs
    const vectorIds = vectorDocs.map((doc) => doc.vectorId);
    if (!vectorIds.length) {
      return NextResponse.json(
        { error: "No chunk vectors found" },
        { status: 404 },
      );
    }
    const pineconeIndex = pc.index(process.env.PINECONE_INDEX!);
    const pineconeResult = await pineconeIndex.fetch(vectorIds);
    // Map vectorId to chunk text
    const idToChunk = Object.fromEntries(
      Object.entries(pineconeResult.records || {}).map(([id, rec]) => [
        id,
        rec.metadata?.chunk || "",
      ]),
    );
    // Reconstruct content from Pinecone chunk text
    const reconstructedContent = vectorDocs
      .map((doc) => {
        const chunk = idToChunk[doc.vectorId];
        return typeof chunk === "string" ? chunk : "";
      })
      .filter((text) => typeof text === "string" && text.length > 0)
      .join("\n\n");

    if (!reconstructedContent || reconstructedContent.length < 50) {
      return NextResponse.json(
        { error: "Insufficient content in chunks to generate summary" },
        { status: 400 },
      );
    }

    // Estimate token count (rough estimate: 1 token ≈ 4 characters)
    const estimatedTokens = Math.ceil(reconstructedContent.length / 4);
    const maxTokensForDirect = 30000; // Leave room for prompt + response (GPT-4o-mini limit ~128k)

    let structuredSummary;

    if (estimatedTokens <= maxTokensForDirect) {
      structuredSummary = await generateDirectSummary(reconstructedContent);
    } else {
      // For chunked summary, pass the vectorDocs with chunk text from Pinecone
      const chunkObjs = vectorDocs.map((doc) => ({
        ...doc,
        text: idToChunk[doc.vectorId] || "",
      }));
      structuredSummary = await generateChunkedSummary(chunkObjs);
    }

    if (!structuredSummary) {
      return NextResponse.json(
        { error: "Failed to generate summary" },
        { status: 500 },
      );
    }

    // Update or insert the crawled_pages entry with the reconstructed content and summary
    const newPageEntry = {
      adminId,
      url,
      text: reconstructedContent,
      createdAt: new Date(),
      source: "reconstructed_from_pinecone_chunks",
    };

    // Upsert: update if exists, insert if not
    await collection.updateOne(
      { adminId, url },
      { $set: newPageEntry },
      { upsert: true },
    );
    console.log("[API] Upserted crawled_pages entry from Pinecone chunks");

    const pageDoc = await collection.findOne({ adminId, url });
    if (pageDoc && pageDoc._id) {
      const structuredSummaries = db.collection("structured_summaries");
      await structuredSummaries.updateOne(
        { adminId, pageId: pageDoc._id },
        {
          $set: {
            adminId,
            pageId: pageDoc._id,
            url,
            structuredSummary,
            summaryGeneratedAt: new Date(),
          },
        },
        { upsert: true },
      );
    }

    return NextResponse.json({
      success: true,
      summary: structuredSummary,
      cached: false,
      source: "pinecone_chunks",
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Failed to generate summary",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// DELETE - Remove specific page
export async function DELETE(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    // Verify API key
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const verification = await verifyApiKey(apiKey);
    if (!verification) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const adminId = verification.adminId;
    const body = await request.json();
    assertBodyConstraints(body, { maxBytes: 64 * 1024, maxDepth: 6 });
    const DeleteSchema = z.object({ url: z.string().url().max(2048) }).strict();
    const parsedDelete = DeleteSchema.safeParse(body);
    if (!parsedDelete.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { url } = parsedDelete.data;

    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("crawled_pages");
    const sitemapUrls = db.collection("sitemap_urls");
    const structuredSummaries = db.collection("structured_summaries");

    // Delete from MongoDB
    const result = await collection.deleteOne({ adminId, url });

    // Always delete structured summary if it exists
    await structuredSummaries.deleteOne({ adminId, url });

    if (result.deletedCount === 0) {
      // Not found in crawled_pages — try deleting failed entry from sitemap_urls
      const failedDelete = await sitemapUrls.deleteOne({ adminId, url });
      if (failedDelete.deletedCount > 0) {
        return NextResponse.json({
          success: true,
          deletedFrom: "sitemap_urls",
        });
      }
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Delete from Pinecone and Mongo vector tracking using shared helper
    try {
      await deleteChunksByUrl(url, adminId);
    } catch (pineconeError) {
      console.error("Error deleting vectors:", pineconeError);
      // Continue even if Pinecone deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 },
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Helper function for direct summary generation (smaller content)
async function generateDirectSummary(content: string) {
  try {
    console.log("[API] Calling OpenAI for direct summary generation...");
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert web page analyzer. Your goal is to deconstruct a web page into its distinct logical sections (e.g., Hero, Features, Pricing, Testimonials, FAQ, Footer) and extract key business intelligence for EACH section.\n\nFor EACH section detected, generate:\n1. A Section Title (inferred from content).\n2. EXACTLY TWO Lead Questions (Problem Recognition) with options mapping to customer states/risks.\n3. EXACTLY TWO Sales Questions (Diagnostic) with options mapping to root causes.\n4. For each Sales Question, generate a specific 'Option Flow' for EACH option, containing a Diagnostic Answer, Follow-Up Question, Feature Mapping, and Loop Closure.\n\nReturn ONLY a valid JSON object. Do not include markdown.",
        },
        {
          role: "user",
          content: `Analyze this web page content:

${content}

Extract and return a JSON object with this exact structure:
{
  "pageType": "homepage|pricing|features|about|contact|blog|product|service",
  "businessVertical": "fitness|healthcare|legal|restaurant|saas|ecommerce|consulting|other",
  "sections": [
    {
      "sectionName": "Inferred Title (e.g., Onboarding Momentum, Renewals)",
      "sectionSummary": "Brief summary",
      "leadQuestions": [
        {
          "question": "Problem Recognition Question (e.g., What usually happens after...?)",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "tags": ["tag_for_opt1", "tag_for_opt2", "tag_for_opt3", "tag_for_opt4"],
          "workflow": "ask_sales_question|educational_insight|validation"
        },
        {
          "question": "Second state-recognition question",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "tags": ["tag_for_optA", "tag_for_optB", "tag_for_optC", "tag_for_optD"],
          "workflow": "ask_sales_question|educational_insight|validation"
        }
      ],
      "salesQuestions": [
        {
          "question": "Diagnostic Question (e.g., What prevents...?)",
          "options": ["Cause 1", "Cause 2", "Cause 3", "Cause 4"],
          "tags": ["cause_tag_1", "cause_tag_2", "cause_tag_3", "cause_tag_4"],
          "workflow": "diagnostic_response",
          "optionFlows": [
            {
              "forOption": "Cause 1",
              "diagnosticAnswer": "Empathic reflection and validation of the problem.",
              "followUpQuestion": "Specific follow-up to narrow down context.",
              "featureMappingAnswer": "Explanation of ONE specific feature that solves this cause.",
              "loopClosure": "Summary statement closing the loop."
            }
          ]
        },
        {
          "question": "Second diagnostic question",
          "options": ["Cause A", "Cause B", "Cause C", "Cause D"],
          "tags": ["cause_tag_a", "cause_tag_b", "cause_tag_c", "cause_tag_d"],
          "workflow": "diagnostic_response",
          "optionFlows": [
            {
              "forOption": "Cause A",
              "diagnosticAnswer": "Empathic reflection for cause A.",
              "followUpQuestion": "Follow-up for cause A.",
              "featureMappingAnswer": "Feature mapping for cause A.",
              "loopClosure": "Closing loop."
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANT REQUIREMENTS:
1. Identify ALL distinct sections on the page (at least 3-5 sections for a typical landing page). Do not collapse everything into one section.
2. Generate EXACTLY TWO Lead Questions and EXACTLY TWO Sales Questions per section.
3. Ensure Lead Questions focus on identifying the user's current state or problem awareness.
4. Ensure Sales Questions focus on diagnosing the specific root cause of that problem.
5. The 'optionFlows' array MUST have an entry for every option in each Sales Question.
6. Tags should be snake_case (e.g., 'onboarding_delay').
`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const summaryContent = summaryResponse.choices[0]?.message?.content;
    if (!summaryContent) {
      console.log("[API] OpenAI returned empty response");
      return null;
    }

    const parsed = JSON.parse(summaryContent);
    return normalizeStructuredSummary(parsed);
  } catch (error) {
    console.error("[API] Direct summary generation failed:", error);
    return null;
  }
}

// Helper function for chunked summary generation (large content)
async function generateChunkedSummary(chunks: any[]) {
  try {
    console.log(
      `[API] Starting chunked summary generation for ${chunks.length} chunks...`,
    );

    // Step 1: Generate individual summaries for chunks (process in batches of 5)
    const chunkSummaries = [];
    const batchSize = 5;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(
        `[API] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          chunks.length / batchSize,
        )}`,
      );

      const batchPromises = batch.map(async (chunk, index) => {
        const chunkContent = chunk.text || chunk.content || "";
        if (chunkContent.length < 50) return null;

        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "Extract key business information from this content chunk. Be concise but comprehensive. Return a brief summary of business-relevant information.",
              },
              {
                role: "user",
                content: `Analyze this content chunk and extract key business information:

${chunkContent}

Focus on: business features, pain points, solutions, target customers, pricing, integrations, use cases.`,
              },
            ],
            temperature: 0.3,
            max_tokens: 300,
          });

          return response.choices[0]?.message?.content || null;
        } catch (error) {
          console.error(`[API] Failed to process chunk ${i + index}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      chunkSummaries.push(...batchResults.filter(Boolean));

      // Small delay between batches to avoid rate limits
      if (i + batchSize < chunks.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`[API] Generated ${chunkSummaries.length} chunk summaries`);

    if (chunkSummaries.length === 0) {
      console.log("[API] No valid chunk summaries generated");
      return null;
    }

    // Step 2: Combine all chunk summaries into final structured summary
    const combinedSummary = chunkSummaries.join("\n\n");
    console.log(
      "[API] Generating final structured summary from chunk summaries...",
    );

    const finalResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert web page analyzer. Your goal is to deconstruct a web page into its distinct logical sections (e.g., Hero, Features, Pricing, Testimonials, FAQ, Footer) and extract key business intelligence for EACH section. Return ONLY a valid JSON object. Do not include markdown.",
        },
        {
          role: "user",
          content: `Combine these chunk summaries into a comprehensive business analysis:

${combinedSummary}

Extract and return a JSON object with this exact structure:
{
  "pageType": "homepage|pricing|features|about|contact|blog|product|service",
  "businessVertical": "fitness|healthcare|legal|restaurant|saas|ecommerce|consulting|other",
  "primaryFeatures": ["feature1", "feature2", "feature3"],
  "painPointsAddressed": ["pain1", "pain2", "pain3"],
  "solutions": ["solution1", "solution2", "solution3"],
  "targetCustomers": ["small business", "enterprise", "startups"],
  "businessOutcomes": ["outcome1", "outcome2"],
  "competitiveAdvantages": ["advantage1", "advantage2"],
  "industryTerms": ["term1", "term2", "term3"],
  "pricePoints": ["free", "$X/month", "enterprise"],
  "integrations": ["tool1", "tool2"],
  "useCases": ["usecase1", "usecase2"],
  "callsToAction": ["Get Started", "Book Demo"],
  "trustSignals": ["testimonial", "certification", "clientcount"],
  "sections": [
    {
      "sectionName": "Name of the section (e.g., Hero, Features, Testimonials, Pricing)",
      "sectionSummary": "Brief summary of this section's content",
      "leadQuestions": [
        {
          "question": "First lead qualification question specific to this section",
          "options": ["Option 1", "Option 2", "Option 3"],
          "tags": ["tag1", "tag2", "tag3"],
          "workflow": "ask_sales_question|educational_insight|stop"
        },
        {
          "question": "Second lead qualification question specific to this section",
          "options": ["Option A", "Option B", "Option C"],
          "tags": ["tagA", "tagB", "tagC"],
          "workflow": "ask_sales_question|educational_insight|stop"
        }
      ],
      "salesQuestions": [
        {
          "question": "First sales qualification question (high severity)",
          "options": ["Sales Opt 1", "Sales Opt 2"],
          "tags": ["sales_tag_1", "sales_tag_2"],
          "workflow": "diagnostic_response"
        },
        {
          "question": "Second sales qualification question",
          "options": ["Sales Opt A", "Sales Opt B"],
          "tags": ["sales_tag_A", "sales_tag_B"],
          "workflow": "diagnostic_response"
        }
      ],
      "scripts": {
         "diagnosticAnswer": "Script for diagnostic answer (Reflect, Explain, Validate)",
         "followUpQuestion": "Script for mandatory follow-up question",
         "followUpOptions": ["Option 1", "Option 2"],
         "featureMappingAnswer": "Script for feature mapping (Map to ONE feature only)",
         "loopClosure": "Script for loop closure (Summarize and Stop)"
       }
    }
  ]
}

IMPORTANT REQUIREMENTS:
1. Identify ALL distinct sections in the combined content (at least 3-5 sections for a typical landing page). Do not collapse everything into one section.
2. For EACH section, generate EXACTLY 2 distinct lead questions and 2 distinct sales questions.
3. Ensure questions are relevant to the specific content of that section.
`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const finalContent = finalResponse.choices[0]?.message?.content;
    if (!finalContent) {
      console.log("[API] Final summary generation failed");
      return null;
    }

    const parsed = JSON.parse(finalContent);
    return normalizeStructuredSummary(parsed);
  } catch (error) {
    console.error("[API] Chunked summary generation failed:", error);
    return null;
  }
}
