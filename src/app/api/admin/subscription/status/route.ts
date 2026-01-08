import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
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

    const db = await getDb();
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

    // Read current cycle subscription record
    const subs = await db.collection("subscriptions").findOne({
      adminId: auth.adminId,
      cycleMonthKey: monthKey,
    });

    // Fallback to most recent subscription if current cycle missing
    const subscription =
      subs ||
      (await db
        .collection("subscriptions")
        .find({ adminId: auth.adminId })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray()
        .then((arr) => arr[0]));

    const plan = subscription?.planKey || "free";
    const creditLimit = subscription?.limits?.creditMonthlyLimit || 0;
    const creditsUsed = subscription?.usage?.creditsUsed || 0;
    const leadsLimit = subscription?.limits?.leadTotalLimit || 0;
    const currentLeads = subscription?.usage?.leadsUsed || 0;
    const limitReached = leadsLimit > 0 ? currentLeads >= leadsLimit : false;
    const addons = subscription?.addons || { creditsUnits: 0, leadsUnits: 0 };

    return NextResponse.json({
      plan,
      addons,
      usage: {
        leads: currentLeads,
        leadsLimit: leadsLimit,
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
