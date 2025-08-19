import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { verifyApiKey } from "@/lib/auth";

const pc = new Pinecone({ apiKey: process.env.PINECONE_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// GET - List all crawled pages with summary status
export async function GET(request: NextRequest) {
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

    client = new MongoClient(process.env.MONGODB_URI!);

    await client.connect();
    const db = client.db("test");
    const collection = db.collection("crawled_pages");

    const pages = await collection
      .find({ adminId })
      .sort({ createdAt: -1 })
      .toArray();

    // Add summary status flag
    const pagesWithStatus = pages.map((page) => ({
      ...page,
      hasStructuredSummary: !!page.structuredSummary,
    }));

    return NextResponse.json({
      success: true,
      pages: pagesWithStatus,
    });
  } catch (error) {
    console.error("Error fetching crawled pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
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

    const { url, regenerate } = await request.json();
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
      }
    );

    // First, let's see what URLs exist for this admin
    const allUrls = await vectorCollection.distinct("filename", { adminId });
    console.log(
      "[API] All URLs in pinecone_vectors for this admin:",
      allUrls.slice(0, 10)
    ); // Show first 10

    const vectorChunks = await vectorCollection
      .find({
        adminId,
        filename: url,
      })
      .toArray();

    if (!vectorChunks || vectorChunks.length === 0) {
      console.log("[API] URL not found in pinecone_vectors either");
      console.log(
        "[API] Exact search failed. Trying case-insensitive search..."
      );

      // Try case-insensitive search
      const caseInsensitiveChunks = await vectorCollection
        .find({
          adminId,
          filename: {
            $regex: new RegExp(
              `^${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i"
            ),
          },
        })
        .toArray();

      if (caseInsensitiveChunks && caseInsensitiveChunks.length > 0) {
        console.log(
          "[API] Found URL with case-insensitive search:",
          caseInsensitiveChunks[0].filename
        );
        console.log("[API] Original URL:", url);
        console.log("[API] Database URL:", caseInsensitiveChunks[0].filename);
      }

      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    console.log(
      `[API] URL found in pinecone_vectors with ${vectorChunks.length} chunks, reconstructing content...`
    );

    // Reconstruct content from chunks
    const reconstructedContent = vectorChunks
      .sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0)) // Sort by chunk index if available
      .map((chunk) => chunk.text || chunk.content || "")
      .filter((text) => text.length > 0)
      .join("\n\n");

    if (!reconstructedContent || reconstructedContent.length < 50) {
      console.log(
        "[API] Reconstructed content too short:",
        reconstructedContent.length
      );
      return NextResponse.json(
        { error: "Insufficient content in chunks to generate summary" },
        { status: 400 }
      );
    }

    console.log(
      "[API] Content reconstructed from chunks, length:",
      reconstructedContent.length
    );

    // Estimate token count (rough estimate: 1 token ≈ 4 characters)
    const estimatedTokens = Math.ceil(reconstructedContent.length / 4);
    const maxTokensForDirect = 30000; // Leave room for prompt + response (GPT-4o-mini limit ~128k)

    let structuredSummary;

    if (estimatedTokens <= maxTokensForDirect) {
      console.log(
        `[API] Using direct approach (${estimatedTokens} estimated tokens)`
      );
      structuredSummary = await generateDirectSummary(reconstructedContent);
    } else {
      console.log(
        `[API] Using chunked approach (${estimatedTokens} estimated tokens, ${vectorChunks.length} chunks)`
      );
      structuredSummary = await generateChunkedSummary(vectorChunks);
    }

    if (!structuredSummary) {
      return NextResponse.json(
        { error: "Failed to generate summary" },
        { status: 500 }
      );
    }

    // Update or insert the crawled_pages entry with the reconstructed content and summary
    const newPageEntry = {
      adminId,
      url,
      text: reconstructedContent,
      structuredSummary,
      summaryGeneratedAt: new Date(),
      createdAt: new Date(),
      source: "reconstructed_from_chunks",
    };

    // Upsert: update if exists, insert if not
    await collection.updateOne(
      { adminId, url },
      { $set: newPageEntry },
      { upsert: true }
    );
    console.log("[API] Upserted crawled_pages entry from chunks");

    return NextResponse.json({
      success: true,
      summary: structuredSummary,
      cached: false,
      source: "chunks",
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
      { status: 500 }
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
    const { url } = await request.json();

    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("crawled_pages");

    // Delete from MongoDB
    const result = await collection.deleteOne({ adminId, url });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Delete from Pinecone using the vector tracking collection
    try {
      const vectorCollection = db.collection("pinecone_vectors");
      const vectors = await vectorCollection
        .find({ adminId, filename: url })
        .toArray();

      if (vectors.length > 0) {
        const index = pc.index(process.env.PINECONE_INDEX!);
        const vectorIds = vectors.map((v: any) => v.vectorId);
        await index.deleteMany(vectorIds);

        // Remove vector tracking records
        await vectorCollection.deleteMany({ adminId, filename: url });
      }
    } catch (pineconeError) {
      console.error("Error deleting from Pinecone:", pineconeError);
      // Continue even if Pinecone deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
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
            "You are an expert web page analyzer. Analyze the provided web page content and extract key business information. Return ONLY a valid JSON object with the specified structure. Do not include any markdown formatting or additional text.",
        },
        {
          role: "user",
          content: `Analyze this web page content and extract key information:

${content}

Extract and return a JSON object with:
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
  "trustSignals": ["testimonial", "certification", "clientcount"]
}`,
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

    return JSON.parse(summaryContent);
  } catch (error) {
    console.error("[API] Direct summary generation failed:", error);
    return null;
  }
}

// Helper function for chunked summary generation (large content)
async function generateChunkedSummary(chunks: any[]) {
  try {
    console.log(
      `[API] Starting chunked summary generation for ${chunks.length} chunks...`
    );

    // Step 1: Generate individual summaries for chunks (process in batches of 5)
    const chunkSummaries = [];
    const batchSize = 5;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(
        `[API] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          chunks.length / batchSize
        )}`
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
      "[API] Generating final structured summary from chunk summaries..."
    );

    const finalResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert business analyst. Combine the provided chunk summaries into a comprehensive business intelligence summary. Return ONLY a valid JSON object.",
        },
        {
          role: "user",
          content: `Combine these chunk summaries into a comprehensive business analysis:

${combinedSummary}

Extract and return a JSON object with:
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
  "trustSignals": ["testimonial", "certification", "clientcount"]
}`,
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

    return JSON.parse(finalContent);
  } catch (error) {
    console.error("[API] Chunked summary generation failed:", error);
    return null;
  }
}
