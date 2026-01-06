import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyApiKey } from "@/lib/auth";
import { getLeadAnalytics, updateLeadStatus } from "@/lib/leads";
import {
  UpdateLeadSchema,
  assertBodyConstraints,
  escapeRegex,
} from "@/lib/validators";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { rateLimit } from "@/lib/rateLimit";

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

export async function GET(req: NextRequest) {
  const rl = await rateLimit(req, "auth");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: corsHeaders }
    );
  }
  // Get leads for authenticated admin
  let adminId: string | null = null;

  // Check for cookie-based auth (admin panel)
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

  // Check for API key auth (external requests)
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
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const leads = db.collection("leads");

    // Get URL parameters for pagination and filtering
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const searchRaw = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const analytics = url.searchParams.get("analytics") === "true";

    // If analytics requested, return analytics data
    if (analytics) {
      const analyticsData = await getLeadAnalytics(adminId);
      return NextResponse.json(
        { analytics: analyticsData },
        { headers: corsHeaders }
      );
    }

    // Build query to find leads for this admin
    const query: Record<string, unknown> = { adminId };

    const safeSearch = searchRaw ? searchRaw.slice(0, 128) : "";
    if (safeSearch) {
      query.$or = [
        { email: { $regex: escapeRegex(safeSearch), $options: "i" } },
        { requirements: { $regex: escapeRegex(safeSearch), $options: "i" } },
        { firstMessage: { $regex: escapeRegex(safeSearch), $options: "i" } },
        { notes: { $regex: escapeRegex(safeSearch), $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    // Get leads with pagination
    const leadsResult = await leads
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    // Get total count (unique emails)
    const total = (await leads.distinct("email", query)).length;

    // Format leads for response
    const formattedLeads = leadsResult.map((lead) => ({
      id: lead._id.toString(),
      email: lead.email,
      requirements: lead.requirements,
      status: lead.status,
      source: lead.source,
      firstMessage: lead.firstMessage,
      firstContact: lead.firstContact,
      lastContact: lead.lastContact,
      conversationCount: lead.conversationCount,
      sessionIds: lead.sessionIds || [lead.sessionId],
      tags: lead.tags || [],
      notes: lead.notes || "",
      value: lead.value,
      priority: lead.priority || "medium",
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    }));

    return NextResponse.json(
      {
        leads: formattedLeads,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(req: NextRequest) {
  const rl = await rateLimit(req, "auth");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: corsHeaders }
    );
  }
  // Update lead status, notes, value, tags
  let adminId: string | null = null;

  // Check authentication (same as GET)
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
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const body = await req.json();
    assertBodyConstraints(body);
    const parsed = UpdateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400, headers: corsHeaders }
      );
    }
    const { leadId, status, notes, value, tags } = parsed.data;

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const success = await updateLeadStatus(
      adminId,
      leadId,
      status,
      notes,
      value,
      tags
    );

    if (success) {
      return NextResponse.json(
        { success: true, message: "Lead updated successfully" },
        { headers: corsHeaders }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to update lead" },
        { status: 404, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const rl = await rateLimit(req, "auth");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: corsHeaders }
    );
  }
  // Delete a lead
  let adminId: string | null = null;

  // Check authentication (same as GET)
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
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const db = await getDb();
    const leads = db.collection("leads");

    // Delete lead (ensure admin can only delete their own leads)
    const result = await leads.deleteOne({
      _id: new ObjectId(leadId),
      adminId,
    });

    if (result.deletedCount > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Lead deleted successfully",
        },
        { headers: corsHeaders }
      );
    } else {
      return NextResponse.json(
        {
          error: "Lead not found or access denied",
        },
        { status: 404, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500, headers: corsHeaders }
    );
  }
}
