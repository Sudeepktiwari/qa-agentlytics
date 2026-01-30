import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import { rateLimit } from "@/lib/rateLimit";
import { PRICING } from "@/config/pricing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(req, "auth");
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
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

    // Self-healing: Calculate real lead count if usage is 0 or missing
    let currentLeads = subscription?.usage?.leadsUsed || 0;

    // Check actual leads in database to fix desynchronized counts
    const realLeadsCount = await db
      .collection("leads")
      .countDocuments({ adminId: auth.adminId });
    let calculatedLeads = realLeadsCount;

    // Fallback to chats if leads collection is empty but chats exist (legacy data)
    if (calculatedLeads === 0) {
      const chatLeads = await db
        .collection("chats")
        .distinct("email", { adminId: auth.adminId });
      calculatedLeads = chatLeads.filter((e: any) => e && e !== "").length;
    }

    // If stored count is 0 but we have actual leads, update the subscription and use calculated value
    if (currentLeads === 0 && calculatedLeads > 0 && subscription?._id) {
      await db
        .collection("subscriptions")
        .updateOne(
          { _id: subscription._id },
          { $set: { "usage.leadsUsed": calculatedLeads } },
        );
      currentLeads = calculatedLeads;
    } else if (calculatedLeads > currentLeads && subscription?._id) {
      // Also fix if calculated is greater than stored (missed increments)
      await db
        .collection("subscriptions")
        .updateOne(
          { _id: subscription._id },
          { $set: { "usage.leadsUsed": calculatedLeads } },
        );
      currentLeads = calculatedLeads;
    }

    const planKey = subscription?.planKey || "free";
    const planConfig = PRICING[planKey as keyof typeof PRICING] || PRICING.free;
    let leadsLimit = subscription?.limits?.leadTotalLimit || 0;

    // Self-healing: Fix limit if it's 0 (corrupted) but plan implies a limit
    if (leadsLimit === 0 && planConfig.totalLeads > 0 && subscription?._id) {
      // Calculate correct limit based on plan + addons
      const addons = subscription?.addons || { leadsUnits: 0 };
      const baseLimit = planConfig.totalLeads;
      const addonLimit =
        (addons.leadsUnits || 0) * (planConfig.addons?.leads?.amount || 0);
      const correctedLimit = baseLimit + addonLimit;

      await db
        .collection("subscriptions")
        .updateOne(
          { _id: subscription._id },
          { $set: { "limits.leadTotalLimit": correctedLimit } },
        );
      leadsLimit = correctedLimit;
    }

    let creditLimit = subscription?.limits?.creditMonthlyLimit || 0;
    let creditsUsed = subscription?.usage?.creditsUsed || 0;

    // Self-healing: Fix Credit Limit if 0
    if (
      creditLimit === 0 &&
      planConfig.creditsPerMonth > 0 &&
      subscription?._id
    ) {
      const addons = subscription?.addons || { creditsUnits: 0 };
      const baseLimit = planConfig.creditsPerMonth;
      const addonLimit =
        (addons.creditsUnits || 0) * (planConfig.addons?.credits?.amount || 0);
      const correctedLimit = baseLimit + addonLimit;

      await db
        .collection("subscriptions")
        .updateOne(
          { _id: subscription._id },
          { $set: { "limits.creditMonthlyLimit": correctedLimit } },
        );
      creditLimit = correctedLimit;
    }

    // Self-healing: Fix Credit Usage (Estimate) if 0 but messages exist
    if (creditsUsed === 0 && subscription?._id) {
      // Count assistant messages for this admin in current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const messageCount = await db.collection("chats").countDocuments({
        adminId: auth.adminId,
        role: "assistant",
        createdAt: { $gte: startOfMonth },
      });

      if (messageCount > 0) {
        // Estimate: 1 credit per message (minimum charge) as a safe lower bound
        const estimatedCredits = messageCount * 1;

        await db
          .collection("subscriptions")
          .updateOne(
            { _id: subscription._id },
            { $set: { "usage.creditsUsed": estimatedCredits } },
          );
        creditsUsed = estimatedCredits;
      }
    }

    const limitReached = leadsLimit > 0 ? currentLeads >= leadsLimit : false;
    const addons = subscription?.addons || { creditsUnits: 0, leadsUnits: 0 };

    return NextResponse.json({
      plan: planKey,
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
      { status: 500 },
    );
  }
}
