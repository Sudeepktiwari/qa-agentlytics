import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
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
Content: ${websiteContent.slice(0, 10).join("\n---\n")}

Extract and return a JSON object with this structure:
{
  "websiteUrl": "${websiteUrl}",
  "targetAudiences": [
    {
      "id": "unique_id",
      "name": "Persona Name",
      "type": "small_business|enterprise|startup|freelancer|agency",
      "industries": ["industry1", "industry2"],
      "companySize": "1-10|11-50|51-200|200+",
      "painPoints": ["pain point 1", "pain point 2"],
      "preferredFeatures": ["feature1", "feature2"],
      "buyingPatterns": ["pattern1", "pattern2"],
      "budget": "under_500|500_2000|2000_10000|10000_plus",
      "technicalLevel": "beginner|intermediate|advanced",
      "urgency": "low|medium|high",
      "decisionMaker": true|false
    }
  ],
  "industryFocus": ["primary industries served"],
  "useCaseExamples": ["use case 1", "use case 2"],
  "competitorMentions": ["competitor1", "competitor2"],
  "pricingStrategy": "freemium|subscription|one_time|custom"
}

Guidelines:
- Create 2-4 distinct personas based on the content
- Be specific about pain points and preferred features
- Identify clear buying patterns and budget ranges
- Look for mentions of company sizes, industries, and use cases
- Extract actual competitor names mentioned
- Determine pricing strategy from pricing pages or content
- Each persona should be distinct and actionable for messaging
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a customer persona analyst. Extract detailed, actionable customer personas from website content. Always return valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const extracted = JSON.parse(completion.choices[0].message.content || "{}");

    // Add timestamps and IDs to personas
    extracted.targetAudiences = extracted.targetAudiences.map(
      (persona: any, index: number) => ({
        ...persona,
        id: persona.id || `persona_${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    return extracted;
  } catch (error) {
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
      // Auto-extract personas from crawled content
      if (!websiteUrl) {
        return NextResponse.json(
          { error: "Website URL required for auto-extraction" },
          { status: 400 }
        );
      }

      // Get crawled content for this admin
      const crawledPages = db.collection("crawled_pages");
      const pages = await crawledPages
        .find({ adminId })
        .limit(20) // Limit to prevent token overflow
        .toArray();

      const websiteContent = pages
        .map((page) => page.text || "")
        .filter(Boolean);

      if (websiteContent.length === 0) {
        return NextResponse.json(
          {
            error: "No crawled content found. Please crawl your website first.",
          },
          { status: 400 }
        );
      }

      const extracted = await extractPersonasFromContent(
        websiteContent,
        websiteUrl
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
