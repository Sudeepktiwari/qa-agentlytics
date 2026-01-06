import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import { checkLeadLimit } from "@/lib/leads";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(req, "auth");
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }
    const auth = await verifyAdminAccessFromCookie(req);
    if (!auth || !auth.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { limitReached, currentLeads, limit, plan } = await checkLeadLimit(
      auth.adminId
    );

    // In a real app, you might also fetch credits usage here
    // For now, we'll return a placeholder or calculate if available
    const credits = 0; // Placeholder

    return NextResponse.json({
      plan,
      usage: {
        leads: currentLeads,
        leadsLimit: limit,
        limitReached,
        credits,
      },
    });
  } catch (error) {
    console.error("[SubscriptionStatus] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
