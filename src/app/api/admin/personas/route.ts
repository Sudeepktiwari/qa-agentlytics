import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import jwt from "jsonwebtoken";
import OpenAI from "openai";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Customer persona interfaces
interface CustomerPersona {
  id: string;
  name: string;
  type: string; // "small_business", "enterprise", "startup", etc.
  industries: string[];
  companySize: string; // "1-10", "11-50", "51-200", "200+"
  painPoints: string[];
  preferredFeatures: string[];
  buyingPatterns: string[];
  budget: string;
  technicalLevel: string; // "beginner", "intermediate", "advanced"
  urgency: string; // "low", "medium", "high"
  decisionMaker: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PersonaData {
  adminId: string;
  websiteUrl: string;
  targetAudiences: CustomerPersona[];
  industryFocus: string[];
  useCaseExamples: string[];
  competitorMentions: string[];
  pricingStrategy: string;
  extractedAt: Date;
  updatedAt: Date;
}

function getAdminIdFromRequest(req: NextRequest): string | undefined {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return undefined;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    return payload.adminId;
  } catch {
    return undefined;
  }
}

// Extract customer personas from website content
async function extractPersonasFromContent(
  websiteContent: string[],
  websiteUrl: string
): Promise<Omit<PersonaData, "adminId" | "extractedAt" | "updatedAt">> {
  const prompt = `
Analyze this website content and extract detailed customer persona data. Focus on identifying who the target customers are, their characteristics, and buying patterns.

Website URL: ${websiteUrl}
Number of content pieces: ${websiteContent.length}

Content: ${websiteContent.slice(0, 15).join("\n---CONTENT PIECE---\n")}

Based on this content, extract and return a JSON object with this structure:
{
  "websiteUrl": "${websiteUrl}",
  "targetAudiences": [
    {
      "id": "unique_id",
      "name": "Persona Name (e.g., 'Small Business Owner', 'Enterprise IT Director')",
      "type": "small_business|enterprise|startup|freelancer|agency",
      "industries": ["industry1", "industry2"],
      "companySize": "1-10|11-50|51-200|200+",
      "painPoints": ["specific pain point 1", "specific pain point 2"],
      "preferredFeatures": ["feature1", "feature2"],
      "buyingPatterns": ["pattern1", "pattern2"],
      "budget": "under_500|500_2000|2000_10000|10000_plus",
      "technicalLevel": "beginner|intermediate|advanced",
      "urgency": "low|medium|high",
      "decisionMaker": true|false
    }
  ],
  "industryFocus": ["primary industries this website serves"],
  "useCaseExamples": ["concrete use case 1", "concrete use case 2"],
  "competitorMentions": ["competitor1", "competitor2"],
  "pricingStrategy": "freemium|subscription|one_time|custom|unknown"
}

Guidelines:
- Create 2-4 distinct personas based on the content
- Be very specific about pain points (not generic)
- Look for actual industry mentions, company sizes mentioned
- Extract real use cases described in the content
- Identify actual competitor names if mentioned
- Determine pricing strategy from pricing pages or content
- Each persona should be distinct and actionable for messaging
- If uncertain about any field, use reasonable defaults
- Focus on personas that would actually visit this website

Return only the JSON object, no other text.`;

  try {
    console.log("Calling OpenAI for persona extraction...");
    console.log("Content pieces:", websiteContent.length);
    console.log("Website URL:", websiteUrl);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a customer persona analyst. Extract detailed, actionable customer personas from website content. Always return valid JSON with realistic, specific personas.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    console.log("OpenAI response received, parsing...");
    const extracted = JSON.parse(completion.choices[0].message.content || "{}");

    console.log("Parsed extraction result:", {
      targetAudiences: extracted.targetAudiences?.length || 0,
      industryFocus: extracted.industryFocus?.length || 0,
      useCaseExamples: extracted.useCaseExamples?.length || 0,
    });

    // Validate and ensure we have a proper structure
    if (
      !extracted.targetAudiences ||
      !Array.isArray(extracted.targetAudiences)
    ) {
      console.error("Invalid persona extraction result:", extracted);
      return {
        websiteUrl,
        targetAudiences: [],
        industryFocus: extracted.industryFocus || [],
        useCaseExamples: extracted.useCaseExamples || [],
        competitorMentions: extracted.competitorMentions || [],
        pricingStrategy: extracted.pricingStrategy || "unknown",
      };
    }

    // Add timestamps and IDs to personas
    extracted.targetAudiences = extracted.targetAudiences.map(
      (persona: any, index: number) => ({
        ...persona,
        id: persona.id || `persona_${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    console.log(
      `Successfully extracted ${extracted.targetAudiences.length} personas for ${websiteUrl}`
    );

    return extracted;
  } catch (error: any) {
    console.error("Error extracting personas:", error);
    // Return default structure if extraction fails
    return {
      websiteUrl,
      targetAudiences: [],
      industryFocus: [],
      useCaseExamples: [],
      competitorMentions: [],
      pricingStrategy: "unknown",
    };
  }
}

// GET: Fetch personas for admin
export async function GET(req: NextRequest) {
  const adminId = getAdminIdFromRequest(req);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const personas = db.collection("customer_personas");

    const personaData = await personas.findOne({ adminId });

    return NextResponse.json({
      success: true,
      personas: personaData || null,
    });
  } catch (error) {
    console.error("Error fetching personas:", error);
    return NextResponse.json(
      { error: "Failed to fetch personas" },
      { status: 500 }
    );
  }
}

// POST: Create or update personas manually or trigger auto-extraction
export async function POST(req: NextRequest) {
  const adminId = getAdminIdFromRequest(req);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, websiteUrl, personaData } = body;

    const db = await getDb();
    const personas = db.collection("customer_personas");

    if (action === "auto_extract") {
      console.log("=== PERSONA AUTO-EXTRACTION START ===");
      console.log("Admin ID:", adminId);

      // Auto-extract personas from crawled content and Pinecone

      // First, try to get the admin's domain from previous crawling
      const crawledPages = db.collection("crawled_pages");
      const samplePage = await crawledPages.findOne({ adminId });
      console.log("Sample crawled page found:", !!samplePage);

      let targetWebsiteUrl = websiteUrl;
      if (!targetWebsiteUrl && samplePage?.url) {
        // Extract domain from crawled page URL
        try {
          const url = new URL(samplePage.url);
          targetWebsiteUrl = `${url.protocol}//${url.hostname}`;
          console.log("Auto-detected website URL:", targetWebsiteUrl);
        } catch (e) {
          console.error("Error extracting domain from crawled page:", e);
        }
      }

      if (!targetWebsiteUrl) {
        console.log("No website URL found - returning error");
        return NextResponse.json(
          {
            error:
              "No website URL found. Please provide a website URL or crawl your website first.",
          },
          { status: 400 }
        );
      }

      // Get crawled content for this admin
      const pages = await crawledPages
        .find({ adminId })
        .limit(30) // Get more content for better persona extraction
        .sort({ created_at: -1 }) // Get most recent content first
        .toArray();

      console.log(`Found ${pages.length} crawled pages for admin ${adminId}`);

      const crawledContent = pages
        .map((page) => ({
          url: page.url,
          title: page.title || "",
          text: page.text || "",
          metadata: page.metadata || {},
        }))
        .filter((item) => item.text.length > 0);

      console.log(
        `${crawledContent.length} pages have content after filtering`
      );

      // Combine all content sources
      const allContent = crawledContent.map(
        (item) =>
          `URL: ${item.url}\nTitle: ${item.title}\nContent: ${item.text}`
      );

      if (allContent.length === 0) {
        console.log("No content found for extraction - returning error");
        return NextResponse.json(
          {
            error:
              "No content found for persona extraction. Please crawl your website first using the sitemap feature.",
          },
          { status: 400 }
        );
      }

      console.log(
        `Extracting personas from ${allContent.length} crawled pages for ${targetWebsiteUrl}`
      );

      const extracted = await extractPersonasFromContent(
        allContent,
        targetWebsiteUrl
      );

      const personaDocument: PersonaData = {
        adminId,
        ...extracted,
        extractedAt: new Date(),
        updatedAt: new Date(),
      };

      await personas.replaceOne({ adminId }, personaDocument, { upsert: true });

      return NextResponse.json({
        success: true,
        personas: personaDocument,
        message: `Successfully extracted ${extracted.targetAudiences.length} personas`,
      });
    } else if (action === "manual_save") {
      // Manually save persona data
      if (!personaData) {
        return NextResponse.json(
          { error: "Persona data required" },
          { status: 400 }
        );
      }

      const personaDocument: PersonaData = {
        adminId,
        ...personaData,
        extractedAt: new Date(),
        updatedAt: new Date(),
      };

      await personas.replaceOne({ adminId }, personaDocument, { upsert: true });

      return NextResponse.json({
        success: true,
        personas: personaDocument,
        message: "Personas saved successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'auto_extract' or 'manual_save'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing personas:", error);
    return NextResponse.json(
      { error: "Failed to process personas" },
      { status: 500 }
    );
  }
}

// DELETE: Delete personas
export async function DELETE(req: NextRequest) {
  const adminId = getAdminIdFromRequest(req);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const personas = db.collection("customer_personas");

    await personas.deleteOne({ adminId });

    return NextResponse.json({
      success: true,
      message: "Personas deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting personas:", error);
    return NextResponse.json(
      { error: "Failed to delete personas" },
      { status: 500 }
    );
  }
}
