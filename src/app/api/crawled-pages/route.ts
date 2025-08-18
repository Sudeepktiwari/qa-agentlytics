import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { verifyApiKey } from "@/lib/auth";
import jwt from "jsonwebtoken";

const client = new MongoClient(process.env.MONGODB_URI!);
const pc = new Pinecone({ apiKey: process.env.PINECONE_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// GET - List all crawled pages with summary status
export async function GET(request: NextRequest) {
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
    await client.close();
  }
}

// POST - Generate structured summary for existing page (on-demand)
export async function POST(request: NextRequest) {
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

    await client.connect();
    const db = client.db("test");
    const collection = db.collection("crawled_pages");

    // Check if structured summary already exists
    const existingPage = await collection.findOne({ adminId, url });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (existingPage.structuredSummary) {
      return NextResponse.json({
        success: true,
        summary: existingPage.structuredSummary,
        cached: true,
      });
    }

    // Get content from the page record itself (it should have 'text' field)
    let pageContent = existingPage.text; // Use the stored text content

    if (!pageContent || pageContent.length < 50) {
      return NextResponse.json(
        { error: "Page content is too short to analyze" },
        { status: 400 }
      );
    }

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

    const summaryText = summaryResponse.choices[0]?.message?.content;

    if (!summaryText) {
      return NextResponse.json(
        { error: "Failed to generate summary" },
        { status: 500 }
      );
    }

    let structuredSummary;
    try {
      structuredSummary = JSON.parse(summaryText);
    } catch (parseError) {
      console.error("Failed to parse summary JSON:", summaryText);
      return NextResponse.json(
        { error: "Invalid summary format generated" },
        { status: 500 }
      );
    }

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

    return NextResponse.json({
      success: true,
      summary: structuredSummary,
      cached: false,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// DELETE - Remove specific page
export async function DELETE(request: NextRequest) {
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
        const vectorIds = vectors.map((v) => v.vectorId);
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
    await client.close();
  }
}
