import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyApiKey } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { assertBodyConstraints } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";
import { updateCustomerProfile, computeBant } from "@/lib/customer-profile";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Cookie",
  "Access-Control-Max-Age": "86400",
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Get customer profile
export async function GET(req: NextRequest) {
  const rl = await rateLimit(req, "auth");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: corsHeaders },
    );
  }
  let adminId: string | null = null;

  // Check authentication
  const token = req.cookies.get("auth_token")?.value;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        email: string;
        adminId: string;
      };
      adminId = payload.adminId;
    } catch {
      // Continue to check API key
    }
  }

  if (!adminId) {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      const apiAuth = await verifyApiKey(apiKey);
      if (apiAuth) {
        adminId = apiAuth.adminId;
      }
    }
  }

  if (!adminId) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: corsHeaders },
    );
  }

  try {
    const url = new URL(req.url);
    const sessionIdRaw = url.searchParams.get("sessionId");
    const emailRaw = url.searchParams.get("email");
    const getAllProfiles = url.searchParams.get("all") === "true";

    const sessionId =
      sessionIdRaw && sessionIdRaw.length <= 128 ? sessionIdRaw : null;
    const email = emailRaw && emailRaw.length <= 256 ? emailRaw : null;

    if (!sessionId && !email && !getAllProfiles) {
      return NextResponse.json(
        { error: "sessionId, email, or all=true required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const db = await getDb();
    const profiles = db.collection("customer_profiles");

    if (getAllProfiles) {
      // Fetch all profiles for this admin
      const allProfiles = await profiles
        .find({ adminId })
        .sort({ lastContact: -1 })
        .toArray();

      return NextResponse.json(
        { profiles: allProfiles },
        { headers: corsHeaders },
      );
    }

    const query: Record<string, unknown> = { adminId };
    if (sessionId) query.sessionIds = sessionId;
    if (email) query.email = email;

    const profile = await profiles.findOne(query);

    if (profile && !profile.bant) {
      (profile as any).bant = computeBant(profile);
    }

    return NextResponse.json(
      { profile: profile || null },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500, headers: corsHeaders },
    );
  }
}

// Create or update customer profile
export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "auth");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: corsHeaders },
    );
  }
  let adminId: string | null = null;

  // Check authentication
  const token = req.cookies.get("auth_token")?.value;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        email: string;
        adminId: string;
      };
      adminId = payload.adminId;
    } catch {
      // Continue to check API key
    }
  }

  if (!adminId) {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      const apiAuth = await verifyApiKey(apiKey);
      if (apiAuth) {
        adminId = apiAuth.adminId;
      }
    }
  }

  if (!adminId) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: corsHeaders },
    );
  }

  try {
    const body = await req.json();
    assertBodyConstraints(body, { maxBytes: 128 * 1024, maxDepth: 8 });

    const ConversationMessageSchema = z
      .object({
        role: z.string().min(1).max(32),
        content: z.string().min(1).max(5000),
      })
      .strict();

    const BodySchema = z
      .object({
        sessionId: z.string().min(1).max(128),
        email: z.string().email().max(256).optional(),
        conversation: z
          .union([
            z.string().max(20000),
            z.array(ConversationMessageSchema).max(200),
          ])
          .optional(),
        messageCount: z.number().int().min(0).max(10000).optional(),
        timeInSession: z
          .number()
          .int()
          .min(0)
          .max(24 * 60 * 60)
          .optional(),
        pageTransitions: z
          .array(z.string().min(1).max(2048))
          .max(500)
          .optional(),
        pageUrl: z.string().url().max(2048).optional(),
        trigger: z.string().optional(),
      })
      .strict();

    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400, headers: corsHeaders },
      );
    }

    const {
      sessionId,
      email,
      conversation,
      messageCount,
      timeInSession,
      pageTransitions,
      pageUrl,
      trigger,
    } = parsed.data;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // Use centralized profile update logic
    const result = await updateCustomerProfile({
      adminId,
      sessionId,
      email,
      conversation,
      messageCount,
      timeInSession,
      pageTransitions,
      pageUrl,
      trigger,
    });

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    console.error("Error updating customer profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500, headers: corsHeaders },
    );
  }
}
