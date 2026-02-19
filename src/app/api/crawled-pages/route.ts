import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { verifyApiKey, verifyAdminTokenFromCookie } from "@/lib/auth";
import { z } from "zod";
import { assertBodyConstraints } from "@/lib/validators";
import { deleteChunksByUrl } from "@/lib/chroma";
import {
  enrichStructuredSummary,
  normalizeStructuredSummary,
} from "@/lib/diagnostic-generation";
import {
  parseSectionBlocks,
  mergeSmallSectionBlocks,
} from "@/lib/parsing";

const pc = new Pinecone({ apiKey: process.env.PINECONE_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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
      structuredSummary:
        byPageId.get(String(page._id))?.structuredSummary ||
        byUrl.get(String(page.url))?.structuredSummary,
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

    // Filter by workflow status if requested
    const workflowOnly =
      request.nextUrl.searchParams.get("workflowOnly") === "true";
    if (workflowOnly) {
      allPages = allPages.filter(
        (p) =>
          p.hasStructuredSummary &&
          p.structuredSummary &&
          Array.isArray(p.structuredSummary.sections) &&
          p.structuredSummary.sections.length > 0,
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
    // console.error removed
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
    // console.log removed

    // Verify API key
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      // console.log removed
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    // console.log removed
    const verification = await verifyApiKey(apiKey);
    if (!verification) {
      // console.log removed
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const adminId = verification.adminId;
    // console.log removed

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
    // console.log removed

    // console.log removed
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("crawled_pages");

    // Always use Pinecone chunk data for summary generation
    const vectorCollection = db.collection("pinecone_vectors");
    // console.log removed

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
    let reconstructedContent = vectorDocs
      .map((doc) => {
        const chunk = idToChunk[doc.vectorId];
        return typeof chunk === "string" ? chunk : "";
      })
      .filter((text) => typeof text === "string" && text.length > 0)
      .join("\n\n");

    // Check if we have the raw text in crawled_pages (which might preserve [SECTION] markers better)
    const existingPage = await collection.findOne({ adminId, url });
    if (existingPage && existingPage.text && existingPage.text.length > 50) {
      // console.log removed
      reconstructedContent = existingPage.text;
    }

    if (!reconstructedContent || reconstructedContent.length < 50) {
      return NextResponse.json(
        { error: "Insufficient content to generate summary" },
        { status: 400 },
      );
    }

    // Estimate token count (rough estimate: 1 token ≈ 4 characters)
    const estimatedTokens = Math.ceil(reconstructedContent.length / 4);
    const maxTokensForDirect = 30000; // Leave room for prompt + response (GPT-4o-mini limit ~128k)

    const rawBlocks = parseSectionBlocks(reconstructedContent);
    const blocks =
      rawBlocks.length > 0 ? mergeSmallSectionBlocks(rawBlocks) : rawBlocks;

    let structuredSummary;

    if (blocks.length > 0) {
      // console.log removed
      structuredSummary = await generateSummaryFromSections(blocks, adminId);
    } else {
      // console.log removed
      if (estimatedTokens <= maxTokensForDirect) {
        structuredSummary = await generateDirectSummary(
          reconstructedContent,
          adminId,
        );
      } else {
        // For chunked summary, pass the vectorDocs with chunk text from Pinecone
        const chunkObjs = vectorDocs.map((doc) => ({
          ...doc,
          text: idToChunk[doc.vectorId] || "",
        }));
        structuredSummary = await generateChunkedSummary(chunkObjs, adminId);
      }
    }

    if (!structuredSummary) {
      return NextResponse.json(
        { error: "Failed to generate summary" },
        { status: 500 },
      );
    }

    // Create a new summary object to ensure we are updating the one we save
    const finalStructuredSummary = { ...structuredSummary };

    // DEBUG: Log sectionContent presence before saving
    if (
      finalStructuredSummary.sections &&
      finalStructuredSummary.sections.length > 0
    ) {
      const firstSection = finalStructuredSummary.sections[0];
      // console.log removed
      if (!firstSection.sectionContent) {
        // console.warn removed
      }
    } else {
      // console.warn removed
    }

    if (
      finalStructuredSummary.sections &&
      Array.isArray(finalStructuredSummary.sections) &&
      reconstructedContent
    ) {
      // Fallback: If no markers and no content, store the whole content in the first section (Hero)
      if (
        finalStructuredSummary.sections.length > 0 &&
        !finalStructuredSummary.sections[0].sectionContent
      ) {
        finalStructuredSummary.sections[0].sectionContent =
          reconstructedContent;
      }
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
    // console.log removed

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
            structuredSummary: finalStructuredSummary,
            summaryGeneratedAt: new Date(),
          },
        },
        { upsert: true },
      );
    }

    return NextResponse.json({
      success: true,
      summary: finalStructuredSummary,
      cached: false,
      source: "pinecone_chunks",
    });
  } catch (error) {
    // console.error removed
    // console.error removed
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

    // Allow single url or array of urls
    const DeleteSchema = z
      .object({
        url: z.string().url().max(2048).optional(),
        urls: z.array(z.string().url().max(2048)).optional(),
      })
      .strict()
      .refine((data) => data.url || (data.urls && data.urls.length > 0), {
        message: "Either 'url' or 'urls' must be provided",
      });

    const parsedDelete = DeleteSchema.safeParse(body);
    if (!parsedDelete.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { url, urls } = parsedDelete.data;
    const targets = urls || (url ? [url] : []);

    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("crawled_pages");
    const sitemapUrls = db.collection("sitemap_urls");
    const structuredSummaries = db.collection("structured_summaries");

    let deletedCount = 0;
    const errors: string[] = [];

    // Process deletions
    await Promise.all(
      targets.map(async (targetUrl) => {
        try {
          // Delete from Pinecone and Mongo vector tracking FIRST
          await deleteChunksByUrl(targetUrl, adminId);

          // Delete from MongoDB
          const result = await collection.deleteOne({
            adminId,
            url: targetUrl,
          });

          // Always delete structured summary if it exists
          await structuredSummaries.deleteOne({ adminId, url: targetUrl });

          // Also try deleting from sitemap_urls if not in crawled_pages
          if (result.deletedCount === 0) {
            await sitemapUrls.deleteOne({ adminId, url: targetUrl });
          } else {
            deletedCount++;
          }
        } catch (err) {
          // console.error removed
          errors.push(
            `Failed to delete ${targetUrl}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }),
    );

    if (deletedCount === 0 && errors.length > 0) {
      return NextResponse.json(
        { error: "Failed to delete pages", details: errors },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    // console.error removed
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
async function generateDirectSummary(content: string, adminId?: string) {
  try {
    // console.log removed
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert web page analyzer. Your goal is to deconstruct a web page into its distinct logical sections (e.g., Hero, Features, Pricing, Testimonials, FAQ, Footer) and extract key business intelligence for EACH section.\n\nThe input text may contain [SECTION N] markers. If present, please respect these section boundaries and titles exactly.\n\nFor EACH section detected, generate:\n1. A Section Title (inferred from content).\n2. The Section Content (the verbatim text belonging to this section).\n3. EXACTLY TWO Lead Questions (Problem Recognition) with options mapping to customer states/risks.\n4. EXACTLY TWO Sales Questions (Diagnostic) with options mapping to root causes.\n5. For each Sales Question, generate a specific 'Option Flow' for EACH option, containing a Diagnostic Answer, Follow-Up Question, Feature Mapping, and Loop Closure.\n\nReturn ONLY a valid JSON object. Do not include markdown.",
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
      "sectionContent": "The full verbatim text content of this section",
      "startSubstring": "The first 30 characters of this section's text (must match verbatim)",
      "endSubstring": "The last 30 characters of this section's text (must match verbatim)",
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
      max_tokens: 10000,
    });

    const summaryContent = summaryResponse.choices[0]?.message?.content;
    if (!summaryContent) {
      // console.log removed
      return null;
    }

    const parsed = JSON.parse(summaryContent);
    const normalized = normalizeStructuredSummary(parsed);

    // console.log removed

    const rawBlocks = parseSectionBlocks(content);
    const blocks =
      rawBlocks.length > 0 ? mergeSmallSectionBlocks(rawBlocks) : rawBlocks;

    // First pass: try to use startSubstring/endSubstring locators from AI
    if (normalized.sections && Array.isArray(normalized.sections)) {
      normalized.sections.forEach((sec: any) => {
        if (!sec.sectionContent && sec.startSubstring && sec.endSubstring) {
          const startIdx = content.indexOf(sec.startSubstring);
          if (startIdx !== -1) {
            const endIdx = content.indexOf(sec.endSubstring, startIdx);
            if (endIdx !== -1) {
              sec.sectionContent = content.substring(
                startIdx,
                endIdx + sec.endSubstring.length,
              );
            }
          }
        }
      });
    }

    if (
      blocks.length > 0 &&
      normalized.sections &&
      Array.isArray(normalized.sections)
    ) {
      // Try to map blocks to sections 1:1 if counts match, otherwise just store what we can
      normalized.sections.forEach((sec: any, idx: number) => {
        if (blocks[idx]) {
          sec.sectionContent = blocks[idx].body;
        }
      });
    } else if (
      normalized.sections &&
      Array.isArray(normalized.sections) &&
      content
    ) {
      // Fallback: If no markers, store the whole content in the first section (Hero) or distribute?
      // Better to leave it empty or store full content in the first section as fallback
      if (
        normalized.sections.length > 0 &&
        !normalized.sections[0].sectionContent
      ) {
        // Only force inject if content length is reasonable (< 100k chars) to avoid bloat
        if (content.length < 100000) {
          normalized.sections[0].sectionContent = content;
        }
      } else if (normalized.sections.length > 0) {
        // Ensure ALL sections have content - if missing, try to infer from summary or fallback
        normalized.sections.forEach((sec: any) => {
          if (!sec.sectionContent) {
            sec.sectionContent = sec.sectionSummary || "Content not available";
          }
        });
      }
    }

    return await enrichStructuredSummary(normalized, content, adminId);
  } catch (error) {
    // console.error removed
    return null;
  }
}

// Helper function for new flow: generate summary from pre-parsed blocks
async function generateSummaryFromSections(blocks: any[], adminId?: string) {
  try {
    console.log(
      `[API] Generating summary from ${blocks.length} pre-parsed sections...`,
    );

    // 1. Generate Page Metadata (Type, Vertical, etc)
    // We can use the titles and the first few sections to guess this
    const metadataPrompt = `Analyze these section titles and the first section content to determine the page type and business vertical.
    
    Sections:
    ${blocks.map((b, i) => `${i + 1}. ${b.title}`).join("\n")}
    
    First Section Content:
    ${blocks[0]?.body?.substring(0, 1000) || ""}
    
    Return a JSON object with:
    {
      "pageType": "homepage|pricing|features|about|contact|blog|product|service",
      "businessVertical": "fitness|healthcare|legal|restaurant|saas|ecommerce|consulting|other",
      "primaryFeatures": ["feature1", "feature2"],
      "painPointsAddressed": ["pain1", "pain2"],
      "solutions": ["solution1", "solution2"],
      "targetCustomers": ["target1", "target2"]
    }`;

    const metadataResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert web page analyzer. Return ONLY valid JSON.",
        },
        { role: "user", content: metadataPrompt },
      ],
      temperature: 0.3,
    });

    let metadata = {};
    try {
      metadata = JSON.parse(
        metadataResponse.choices[0]?.message?.content || "{}",
      );
    } catch (e) {
      // console.error removed
    }

    // 2. Generate details for EACH section (Parallel with concurrency limit)
    const sections = [];
    const concurrency = 5;

    for (let i = 0; i < blocks.length; i += concurrency) {
      const batch = blocks.slice(i, i + concurrency);
      // console.log removed

      const batchPromises = batch.map(async (block) => {
        const prompt = `Analyze this specific website section and generate lead/sales questions.
        
        Section Title: "${block.title}"
        Section Content:
        "${block.body.substring(0, 8000)}" 
        
        Return a JSON object with:
        {
          "sectionSummary": "Brief summary of this section",
          "leadQuestions": [
            { "question": "Problem Recognition Question", "options": ["Opt1", "Opt2"], "tags": ["tag1", "tag2"], "workflow": "legacy" },
            { "question": "Problem Recognition Question 2", "options": ["Opt1", "Opt2"], "tags": ["tag1", "tag2"], "workflow": "legacy" }
          ],
          "salesQuestions": [
             { "question": "Diagnostic Question", "options": ["Opt1", "Opt2"], "tags": ["tag1", "tag2"], "workflow": "diagnostic_response" },
             { "question": "Diagnostic Question 2", "options": ["Opt1", "Opt2"], "tags": ["tag1", "tag2"], "workflow": "diagnostic_response" }
          ]
        }
        
        REQUIREMENTS:
        - EXACTLY 2 Lead Questions and 2 Sales Questions.
        - Questions must be relevant to THIS section's content.
        `;

        try {
          const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert sales strategist. Return ONLY valid JSON.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
          });

          const data = JSON.parse(res.choices[0]?.message?.content || "{}");
          return {
            sectionName: block.title,
            sectionContent: block.body, // EXPLICITLY SET HERE
            sectionSummary: data.sectionSummary || "No summary available",
            leadQuestions: data.leadQuestions || [],
            salesQuestions: data.salesQuestions || [],
          };
        } catch (err) {
          console.error(
            `[API] Failed to process section '${block.title}'`,
            err,
          );
          // Return basic fallback
          return {
            sectionName: block.title,
            sectionContent: block.body,
            sectionSummary: "Analysis failed",
            leadQuestions: [],
            salesQuestions: [],
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      sections.push(...batchResults);
    }

    // 3. Assemble final object
    const finalSummary = {
      ...metadata,
      sections,
    };

    // 4. Enrich/Normalize
    const normalized = normalizeStructuredSummary(finalSummary);
    return await enrichStructuredSummary(
      normalized,
      blocks.map((b) => b.body).join("\n\n"),
      adminId,
    );
  } catch (error) {
    // console.error removed
    return null;
  }
}

// Helper function for chunked summary generation (large content)
async function generateChunkedSummary(chunks: any[], adminId?: string) {
  try {
    // console.log removed

    // Step 1: Generate individual summaries for chunks (process in batches of 5)
    const chunkSummaries = [];
    const batchSize = 5;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      // console.log removed

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

          return {
            index: i + index,
            summary: response.choices[0]?.message?.content || "",
          };
        } catch (error) {
          console.error(`[API] Failed to process chunk ${i + index}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      chunkSummaries.push(...batchResults.filter((item) => item !== null));

      // Small delay between batches to avoid rate limits
      if (i + batchSize < chunks.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // console.log removed

    if (chunkSummaries.length === 0) {
      // console.log removed
      return null;
    }

    // Step 2: Combine all chunk summaries into final structured summary
    // We include chunk indices to allow mapping back to original text
    const combinedSummary = chunkSummaries
      .map((c: any) => `[CHUNK ${c.index}]: ${c.summary}`)
      .join("\n\n");
    // console.log removed

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
      "chunkIndices": [0, 1],
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
1. Identify ALL distinct sections in the combined content.
2. For EACH section, specify which [CHUNK N] indices belong to it in the 'chunkIndices' array.
3. Generate EXACTLY 2 distinct lead questions and 2 distinct sales questions per section.
4. Ensure questions are relevant to the specific content of that section.
`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const finalContent = finalResponse.choices[0]?.message?.content;
    if (!finalContent) {
      // console.log removed
      return null;
    }

    const parsed = JSON.parse(finalContent);
    const normalized = normalizeStructuredSummary(parsed);

    // Ensure sectionContent is populated for chunked summaries
    if (normalized.sections && Array.isArray(normalized.sections)) {
      normalized.sections.forEach((sec: any) => {
        // Use chunkIndices to reconstruct section content from original chunks
        if (Array.isArray(sec.chunkIndices) && sec.chunkIndices.length > 0) {
          const contentParts = sec.chunkIndices
            .map((idx: any) => {
              const chunkIndex = Number(idx);
              if (
                !isNaN(chunkIndex) &&
                chunks[chunkIndex] &&
                chunks[chunkIndex].text
              ) {
                return chunks[chunkIndex].text;
              }
              return "";
            })
            .filter((t: string) => t.length > 0);

          if (contentParts.length > 0) {
            sec.sectionContent = contentParts.join("\n\n");
          }
        }

        if (!sec.sectionContent) {
          // Fallback: use summary as content if raw text is missing
          // This prevents "undefined" content which breaks matching
          sec.sectionContent = sec.sectionSummary || "Content not available";
        }
      });
    }

    return await enrichStructuredSummary(normalized, combinedSummary, adminId);
  } catch (error) {
    // console.error removed
    return null;
  }
}
