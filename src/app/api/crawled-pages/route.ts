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

    // Check if structured summary already exists
    console.log("[API] Looking for existing page:", { adminId, url });
    const existingPage = await collection.findOne({ adminId, url });

    if (!existingPage) {
      console.log("[API] Page not found in crawled_pages collection");

      // Check if the URL exists in pinecone_vectors (meaning it was crawled but not in crawled_pages)
      const vectorCollection = db.collection("pinecone_vectors");
      const vectorChunks = await vectorCollection.find({
        adminId,
        filename: url,
      }).toArray();

      if (vectorChunks.length === 0) {
        console.log("[API] URL not found in pinecone_vectors either");
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }

      console.log(
        "[API] URL found in pinecone_vectors but not in crawled_pages"
      );
      console.log("[API] Found", vectorChunks.length, "vector chunks, attempting to reconstruct content");
      
      // Try to reconstruct content from vector chunks
      const reconstructedContent = vectorChunks
        .map(chunk => chunk.text || chunk.content || '')
        .filter(text => text.length > 0)
        .join('\n\n');
      
      if (reconstructedContent.length < 100) {
        console.log("[API] Reconstructed content too short:", reconstructedContent.length);
        return NextResponse.json({ 
          error: "Insufficient content available for summary generation" 
        }, { status: 400 });
      }
      
      console.log("[API] Successfully reconstructed content, length:", reconstructedContent.length);
      
      // Generate summary from reconstructed content
      console.log("[API] Calling OpenAI to generate summary from reconstructed content...");
      const summaryResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert web page analyzer. Analyze the provided web page content and extract key business information. Return ONLY a valid JSON object with the specified structure. Do not include any markdown formatting or additional text.",
          },
          {
            role: "user",
            content: `Analyze this web page content and extract key information:

${reconstructedContent}

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
        max_tokens: 800,
        temperature: 0.3,
      });

      console.log("[API] OpenAI response received for reconstructed content");
      const summaryText = summaryResponse.choices[0]?.message?.content;

      if (!summaryText) {
        console.log("[API] No summary text returned from OpenAI");
        return NextResponse.json(
          { error: "Failed to generate summary" },
          { status: 500 }
        );
      }

      let structuredSummary;
      try {
        structuredSummary = JSON.parse(summaryText);
        console.log("[API] Summary parsed successfully from reconstructed content");
      } catch {
        console.error("Failed to parse summary JSON:", summaryText);
        return NextResponse.json(
          { error: "Invalid summary format generated" },
          { status: 500 }
        );
      }

      // Create a new entry in crawled_pages with the reconstructed content and summary
      console.log("[API] Creating new crawled_pages entry from vector chunks...");
      await collection.insertOne({
        adminId,
        url,
        text: reconstructedContent,
        structuredSummary,
        summaryGeneratedAt: new Date(),
        createdAt: new Date(),
        reconstructedFromVectors: true
      });

      console.log("[API] Summary generation completed successfully from vector chunks");
      return NextResponse.json({
        success: true,
        summary: structuredSummary,
        cached: false,
        reconstructedFromVectors: true
      });
    }

    console.log(
      "[API] Found existing page, has summary:",
      !!existingPage.structuredSummary
    );

    // If regenerate is true, skip the existing summary check
    if (existingPage.structuredSummary && !regenerate) {
      console.log("[API] Returning cached summary");
      return NextResponse.json({
        success: true,
        summary: existingPage.structuredSummary,
        cached: true,
      });
    }

    // Get content from the page record itself (it should have 'text' field)
    const pageContent = existingPage.text; // Use the stored text content
    console.log("[API] Page content length:", pageContent?.length || 0);

    if (!pageContent || pageContent.length < 50) {
      console.log("[API] Page content too short or missing");
      return NextResponse.json(
        { error: "Page content is too short to analyze" },
        { status: 400 }
      );
    }

    console.log("[API] Calling OpenAI to generate summary...");
    // Generate structured summary using GPT-4o-mini
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

${pageContent}

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
      max_tokens: 800,
      temperature: 0.3,
    });

    console.log("[API] OpenAI response received");
    const summaryText = summaryResponse.choices[0]?.message?.content;
    console.log("[API] Summary text length:", summaryText?.length || 0);

    if (!summaryText) {
      console.log("[API] No summary text returned from OpenAI");
      return NextResponse.json(
        { error: "Failed to generate summary" },
        { status: 500 }
      );
    }

    console.log("[API] Parsing summary JSON...");
    let structuredSummary;
    try {
      structuredSummary = JSON.parse(summaryText);
      console.log("[API] Summary parsed successfully");
    } catch {
      console.error("Failed to parse summary JSON:", summaryText);
      return NextResponse.json(
        { error: "Invalid summary format generated" },
        { status: 500 }
      );
    }

    console.log("[API] Updating MongoDB with structured summary...");
    // Store structured summary in MongoDB
    await collection.updateOne(
      { adminId, url },
      {
        $set: {
          structuredSummary,
          summaryGeneratedAt: new Date(),
        },
      }
    );

    console.log("[API] Summary generation completed successfully");
    return NextResponse.json({
      success: true,
      summary: structuredSummary,
      cached: false,
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
