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
You are analyzing a website to extract customer personas. Based on the content below, create 2-4 specific customer personas.

IMPORTANT: You must return ONLY a valid JSON object, no other text before or after.

Website URL: ${websiteUrl}
Number of content pieces: ${websiteContent.length}

Content: ${websiteContent.slice(0, 15).join("\n---CONTENT PIECE---\n")}

Return this exact JSON structure:
{
  "websiteUrl": "${websiteUrl}",
  "targetAudiences": [
    {
      "id": "persona_1",
      "name": "Customer Segment Name (e.g., 'Small Business Owner', 'Enterprise IT Director', 'SaaS Startup Founder')",
      "type": "small_business",
      "industries": ["technology"],
      "companySize": "1-10",
      "painPoints": ["specific pain point"],
      "preferredFeatures": ["feature1"],
      "buyingPatterns": ["pattern1"],
      "budget": "under_500",
      "technicalLevel": "beginner",
      "urgency": "medium",
      "decisionMaker": true
    }
  ],
  "industryFocus": ["primary industry"],
  "useCaseExamples": ["use case 1"],
  "competitorMentions": [],
  "pricingStrategy": "subscription"
}

IMPORTANT GUIDELINES:
- "name" field should be a customer segment/role (e.g., "Small Business Owner", "Enterprise Decision Maker")
- NEVER use personal names like "John", "Sarah", "Mike" - these are business segments, not individuals
- Focus on business roles, company types, and professional contexts
- Create personas that represent customer archetypes/segments for targeting
- These will be used for messaging personalization based on business context, not personal identity

Create realistic personas based on the actual content. Even if content is limited, create at least 1-2 basic personas.`;

  try {
    console.log("Calling OpenAI for persona extraction...");
    console.log("Content pieces:", websiteContent.length);
    console.log("Website URL:", websiteUrl);
    console.log(
      "Sample content preview:",
      websiteContent[0]?.substring(0, 200) + "..."
    );

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

    console.log("OpenAI response received:");
    console.log("Raw response:", completion.choices[0].message.content);
    console.log(
      "Response length:",
      completion.choices[0].message.content?.length
    );

    let extracted;
    try {
      extracted = JSON.parse(completion.choices[0].message.content || "{}");
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      console.error("Raw response was:", completion.choices[0].message.content);
      throw new Error("Invalid JSON response from OpenAI");
    }

    console.log("Parsed extraction result:");
    console.log("Full parsed object:", JSON.stringify(extracted, null, 2));

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

      // Debug: Show sample content
      if (crawledContent.length > 0) {
        console.log("Sample crawled content:");
        console.log("First page URL:", crawledContent[0]?.url);
        console.log("First page title:", crawledContent[0]?.title);
        console.log(
          "First page content length:",
          crawledContent[0]?.text?.length
        );
        console.log(
          "First page preview:",
          crawledContent[0]?.text?.substring(0, 300) + "..."
        );
      }

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
