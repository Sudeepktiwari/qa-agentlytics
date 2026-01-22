import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyAdminAccessFromCookie } from "@/lib/auth";

interface BantQuestion {
  id: string;
  question: string;
  options: string[];
  active: boolean;
}

interface BantConfiguration {
  adminId: string;
  budget: BantQuestion[];
  authority: BantQuestion[];
  need: BantQuestion[];
  timeline: BantQuestion[];
  updatedAt: Date;
}

// Default BANT questions if none exist
const DEFAULT_BANT_CONFIG = {
  budget: [
    {
      id: "default_budget_1",
      question: "What is your approximate budget for this project?",
      options: ["Under $500/mo", "$500–$2k/mo", "$2k–$10k/mo", "$10k+"],
      active: true,
    },
  ],
  authority: [
    {
      id: "default_authority_1",
      question: "Are you the decision maker for this purchase?",
      options: [
        "Yes, I'm the decision maker",
        "No, I need approval",
        "I'm researching for my team",
      ],
      active: true,
    },
  ],
  need: [
    {
      id: "default_need_1",
      question: "What is your primary goal or challenge?",
      options: [
        "Increase efficiency",
        "Reduce costs",
        "Scale operations",
        "Better compliance",
      ],
      active: true,
    },
  ],
  timeline: [
    {
      id: "default_timeline_1",
      question: "When are you looking to get started?",
      options: [
        "Immediately",
        "Within 1 month",
        "1-3 months",
        "Just exploring",
      ],
      active: true,
    },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const authResult = verifyAdminAccessFromCookie(request);
    if (!authResult.isValid || !authResult.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const collection = db.collection("bant_configurations");

    let config = await collection.findOne({ adminId: authResult.adminId });

    if (!config) {
      // Create default config if not exists
      const newConfig = {
        adminId: authResult.adminId,
        ...DEFAULT_BANT_CONFIG,
        updatedAt: new Date(),
      };
      await collection.insertOne(newConfig);
      config = newConfig as any;
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Error fetching BANT config:", error);
    return NextResponse.json(
      { error: "Failed to fetch BANT configuration" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = verifyAdminAccessFromCookie(request);
    if (!authResult.isValid || !authResult.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { budget, authority, need, timeline } = body;

    if (!budget || !authority || !need || !timeline) {
      return NextResponse.json(
        { error: "Missing required BANT categories" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const collection = db.collection("bant_configurations");

    const updateResult = await collection.updateOne(
      { adminId: authResult.adminId },
      {
        $set: {
          budget,
          authority,
          need,
          timeline,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({
      success: true,
      message: "BANT configuration saved successfully",
    });
  } catch (error) {
    console.error("Error saving BANT config:", error);
    return NextResponse.json(
      { error: "Failed to save BANT configuration" },
      { status: 500 },
    );
  }
}
