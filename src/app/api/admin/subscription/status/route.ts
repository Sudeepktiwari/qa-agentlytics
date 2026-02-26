import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import { rateLimit } from "@/lib/rateLimit";
import { PRICING } from "@/config/pricing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const reqId = `SUB-${Date.now()}`;
    console.log(`[${reqId}] Subscription status GET`);
    const rl = await rateLimit(req, "auth");
    if (!rl.allowed) {
      console.warn(`[${reqId}] Rate limit exceeded`);
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }
    const auth = verifyAdminAccessFromCookie(req);
    if (!auth || !auth.adminId) {
      console.warn(`[${reqId}] Unauthorized`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[${reqId}] Connecting to DB`);
    const dbStart = Date.now();
    const db = await getDb();
    console.log(`[${reqId}] DB connected in ${Date.now() - dbStart}ms`);
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

    // Read current cycle subscription record
    const subQueryStart = Date.now();
    const subs = await db.collection("subscriptions").findOne({
      adminId: auth.adminId,
      cycleMonthKey: monthKey,
    });
    console.log(
      `[${reqId}] Current cycle record found=${!!subs} in ${
        Date.now() - subQueryStart
      }ms`,
    );

    // Fallback to most recent subscription if current cycle missing
    const fallbackStart = Date.now();
    const subscription =
      subs ||
      (await db
        .collection("subscriptions")
        .find({ adminId: auth.adminId })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray()
        .then((arr) => arr[0]));
    if (!subs) {
      console.log(
        `[${reqId}] Fallback subscription query took ${
          Date.now() - fallbackStart
        }ms`,
      );
    }
    console.log(
      `[${reqId}] Subscription`,
      JSON.stringify({ planKey: subscription?.planKey || "free" }),
    );

    // Self-healing: Calculate real lead count if usage is 0 or missing
    let currentLeads = subscription?.usage?.leadsUsed || 0;

    // Check actual leads in database to fix desynchronized counts
    const leadsCountStart = Date.now();
    const realLeadsCount = await db
      .collection("leads")
      .countDocuments({ adminId: auth.adminId });
    console.log(
      `[${reqId}] Leads count query took ${Date.now() - leadsCountStart}ms`,
    );
    let calculatedLeads = realLeadsCount;
    console.log(
      `[${reqId}] Leads`,
      JSON.stringify({ stored: currentLeads, actual: calculatedLeads }),
    );

    // Fallback to chats if leads collection is empty but chats exist (legacy data)
    if (calculatedLeads === 0) {
      const chatsFallbackStart = Date.now();
      const chatLeads = await db
        .collection("chats")
        .distinct("email", { adminId: auth.adminId });
      calculatedLeads = chatLeads.filter((e: any) => e && e !== "").length;
      console.log(
        `[${reqId}] Legacy chats fallback took ${
          Date.now() - chatsFallbackStart
        }ms`,
        JSON.stringify({ chatLeads: calculatedLeads }),
      );
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
      console.log(`[${reqId}] Fixed leadsUsed`, calculatedLeads);
    } else if (calculatedLeads > currentLeads && subscription?._id) {
      // Also fix if calculated is greater than stored (missed increments)
      await db
        .collection("subscriptions")
        .updateOne(
          { _id: subscription._id },
          { $set: { "usage.leadsUsed": calculatedLeads } },
        );
      currentLeads = calculatedLeads;
      console.log(`[${reqId}] Increased leadsUsed`, calculatedLeads);
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
      console.log(`[${reqId}] Fixed leadTotalLimit`, leadsLimit);
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
      console.log(`[${reqId}] Fixed creditMonthlyLimit`, creditLimit);
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
        console.log(`[${reqId}] Estimated creditsUsed`, creditsUsed);
      }
    }

    const limitReached = leadsLimit > 0 ? currentLeads >= leadsLimit : false;
    const addons = subscription?.addons || { creditsUnits: 0, leadsUnits: 0 };

    const responsePayload = {
      plan: planKey,
      addons,
      usage: {
        leads: currentLeads,
        leadsLimit: leadsLimit,
        limitReached,
        credits: creditsUsed,
        creditsLimit: creditLimit,
      },
    };
    console.log(`[${reqId}] Response`, JSON.stringify(responsePayload));
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("[SubscriptionStatus] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
