import { MongoClient, ObjectId } from "mongodb";
import { PRICING, CREDIT_ADDONS, LEAD_ADDONS } from "@/config/pricing";
import { getDb } from "@/lib/mongo";

interface SubscriptionUpdateParams {
  adminId: string;
  email: string;
  planId: string;
  razorpay_subscription_id?: string;
  razorpay_plan_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  addonQuantity?: number;
  leadAddonQuantity?: number;
}

/**
 * Process a subscription update (used by verify route and webhooks)
 */
export async function processSubscriptionUpdate({
  adminId,
  email,
  planId,
  razorpay_subscription_id,
  razorpay_plan_id,
  razorpay_order_id,
  razorpay_payment_id,
  addonQuantity = 0,
  leadAddonQuantity = 0,
}: SubscriptionUpdateParams) {
  const logPrefix = `[ProcessSubscription ${Date.now()}]`;
  console.log(
    `${logPrefix} Starting update for Admin: ${adminId}, Email: ${email}`
  );

  try {
    const db = await getDb();

    // 1. Validate Plan
    const plan = PRICING[planId as keyof typeof PRICING] || PRICING.free;
    const validatedPlanId = plan.id;
    console.log(
      `${logPrefix} Validated Plan: ${validatedPlanId} (Requested: ${planId})`
    );

    // 2. Calculate Limits
    // Use plan-specific add-on values
    const creditUnit = plan.addons?.credits?.amount || 0;
    const leadUnit = plan.addons?.leads?.amount || 0;

    let extraLeads = 0;
    if (leadAddonQuantity > 0) {
      extraLeads = leadAddonQuantity * leadUnit;
    }

    let totalCredits = plan.creditsPerMonth;
    if (addonQuantity > 0) {
      totalCredits += addonQuantity * creditUnit;
    }

    console.log(
      `${logPrefix} Limits Calculated: Credits=${totalCredits}, ExtraLeads=${extraLeads}, TotalLeads=${
        (plan.totalLeads || 0) + extraLeads
      }`
    );

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

    // 3. Get Current Usage (to preserve leads used)
    const currentLeads =
      (await db.collection("leads").distinct("email", { adminId: adminId }))
        .length || 0;

    console.log(`${logPrefix} Current Leads Usage: ${currentLeads}`);

    // 4. Update/Create Subscription for Current Month
    // We use updateOne with upsert to ensure we don't create duplicates for the same month
    const updateResult = await db.collection("subscriptions").updateOne(
      {
        adminId: adminId,
        cycleMonthKey: monthKey,
      },
      {
        $set: {
          email: email,
          planKey: validatedPlanId,
          subscriptionId: razorpay_subscription_id,
          razorpayPlanId: razorpay_plan_id, // Store the specific Razorpay Plan ID (variant)
          status: "active",
          razorpay_order_id,
          razorpay_payment_id,
          addons: {
            creditsUnits: addonQuantity,
            leadsUnits: leadAddonQuantity,
          },
          limits: {
            creditMonthlyLimit: totalCredits,
            leadExtraLeads: extraLeads,
            leadTotalLimit: (plan.totalLeads || 0) + extraLeads,
          },
          usage: {
            creditsUsed: 0, // Reset credits on new payment/plan change
            leadsUsed: currentLeads,
          },
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(
      `${logPrefix} Subscription Update Result:`,
      JSON.stringify(updateResult)
    );

    // 5. Update User Profile (Legacy/Redundant but good for quick lookups)
    const userUpdateResult = await db.collection("users").updateOne(
      { _id: new ObjectId(adminId) },
      {
        $set: {
          subscriptionPlan: validatedPlanId,
          subscriptionStatus: "active",
          subscriptionId: razorpay_subscription_id,
          extraLeads: extraLeads,
        },
      }
    );

    console.log(
      `${logPrefix} User Update Result:`,
      JSON.stringify(userUpdateResult)
    );

    console.log(
      `${logPrefix} SUCCESS for ${email} (Admin: ${adminId}). Plan: ${validatedPlanId}, RazorpayPlan: ${razorpay_plan_id}`
    );

    return {
      success: true,
      plan: validatedPlanId,
      limits: {
        creditsLimit: totalCredits,
        leadsLimit: (plan.totalLeads || 0) + extraLeads,
      },
    };
  } catch (error) {
    console.error(`${logPrefix} Error processing update:`, error);
    throw error;
  }
}
