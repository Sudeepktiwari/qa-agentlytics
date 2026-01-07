import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyApiKey } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { escapeRegex } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";
import { checkLeadLimit } from "@/lib/leads";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const db = await getDb();
    const chats = db.collection("chats");

    // Get URL parameters for pagination and filtering
    const url = new URL(req.url);
    const pageRaw = url.searchParams.get("page") || "1";
    const pageSizeRaw = url.searchParams.get("pageSize") || "10";
    const sortByRaw = url.searchParams.get("sortBy") || "createdAt";
    const sortOrderRaw = url.searchParams.get("sortOrder") || "desc";
    const searchRaw = url.searchParams.get("search") || "";

    const page = Math.min(Math.max(parseInt(pageRaw), 1), 1000);
    const pageSize = Math.min(Math.max(parseInt(pageSizeRaw), 1), 100);
    const allowedSortBy = new Set([
      "createdAt",
      "lastSeen",
      "email",
      "messageCount",
    ]);
    const sortBy = allowedSortBy.has(sortByRaw) ? sortByRaw : "createdAt";
    const sortOrder = sortOrderRaw === "asc" ? 1 : -1;
    const safeSearch = searchRaw ? searchRaw.slice(0, 128) : "";

    // Build query to find leads (messages with email addresses)
    const query: Record<string, unknown> = {
      adminId,
      email: { $exists: true, $ne: null, $not: { $eq: "" } },
    };

    if (safeSearch) {
      query.$or = [
        { email: { $regex: escapeRegex(safeSearch), $options: "i" } },
        { content: { $regex: escapeRegex(safeSearch), $options: "i" } },
      ];
    }

    // Aggregate to get unique leads with their latest conversation
    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: "$email",
          latestMessage: { $last: "$$ROOT" },
          firstSeen: { $min: "$createdAt" },
          lastSeen: { $max: "$createdAt" },
          messageCount: { $sum: 1 },
          sessionId: { $last: "$sessionId" },
          requirements: { $last: "$requirements" },
        },
      },
      {
        $project: {
          email: "$_id",
          firstSeen: 1,
          lastSeen: 1,
          messageCount: 1,
          sessionId: 1,
          requirements: 1,
          latestContent: "$latestMessage.content",
          latestRole: "$latestMessage.role",
        },
      },
      { $sort: { [sortBy === "email" ? "email" : sortBy]: sortOrder } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
      {
        $lookup: {
          from: "customer_profiles",
          let: { leadEmail: "$email" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$email", "$$leadEmail"] },
                    { $eq: ["$adminId", adminId] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                confidenceScore: "$profileMeta.confidenceScore",
                bantScore: "$bant.score",
                buyingReadiness: "$intelligenceProfile.buyingReadiness",
              },
            },
          ],
          as: "profileData",
        },
      },
      {
        $unwind: {
          path: "$profileData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          confidenceScore: "$profileData.confidenceScore",
          bantScore: "$profileData.bantScore",
          buyingReadiness: "$profileData.buyingReadiness",
        },
      },
      {
        $project: {
          profileData: 0,
        },
      },
    ];

    const leads = await chats.aggregate(pipeline).toArray();

    // Get total count for pagination
    const totalPipeline = [
      { $match: query },
      { $group: { _id: "$email" } },
      { $count: "total" },
    ];

    const totalResult = await chats.aggregate(totalPipeline).toArray();
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Determine which emails are visible under the plan limit
    const { limit } = await checkLeadLimit(adminId);
    let visibleEmailsSet: Set<string> = new Set();
    if (typeof limit === "number" && limit > 0) {
      const visibleEmails = await chats
        .aggregate([
          { $match: query },
          {
            $group: {
              _id: "$email",
              firstSeen: { $min: "$createdAt" },
            },
          },
          { $sort: { firstSeen: 1 } },
          { $limit: limit },
          { $project: { _id: 0, email: "$_id" } },
        ])
        .toArray();
      visibleEmails.forEach((e: any) => {
        if (e && e.email) visibleEmailsSet.add(String(e.email));
      });
    }

    // Attach visibilityRestricted flag for admin-side masking
    const leadsWithVisibility = leads.map((l: any) => ({
      ...l,
      visibilityRestricted: !visibleEmailsSet.has(String(l.email || "")),
    }));

    return NextResponse.json({
      leads: leadsWithVisibility,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const rl = await rateLimit(req, "auth");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  // Delete a lead (all messages for a specific email)
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
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const db = await getDb();
    const chats = db.collection("chats");

    // Delete all messages for this email and admin
    const result = await chats.deleteMany({
      adminId,
      email,
    });

    return NextResponse.json({
      deleted: result.deletedCount,
      message: `Deleted ${result.deletedCount} messages for ${email}`,
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
