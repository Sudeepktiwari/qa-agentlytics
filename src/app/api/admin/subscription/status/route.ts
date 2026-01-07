import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import { checkLeadLimit } from "@/lib/leads";
import { checkCreditLimit } from "@/lib/credits";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(req, "auth");
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }
    const auth = verifyAdminAccessFromCookie(req);
    if (!auth || !auth.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [leadStatus, creditStatus] = await Promise.all([
      checkLeadLimit(auth.adminId),
      checkCreditLimit(auth.adminId),
    ]);

    const { limitReached, currentLeads, limit, plan: leadPlan } = leadStatus;

    const { creditsUsed, limit: creditLimit } = creditStatus;

    // Use the plan from leadStatus or creditStatus (should be consistent)
    const plan = leadPlan;

    return NextResponse.json({
      plan,
      usage: {
        leads: currentLeads,
        leadsLimit: limit,
        limitReached,
        credits: creditsUsed,
        creditsLimit: creditLimit,
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
