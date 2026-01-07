import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { PRICING } from "@/config/pricing";
import Razorpay from "razorpay";

// Credit costs in "credits" (1 credit = $0.01 retail)
// Input: $1.50/1M => 150 credits/1M => 0.00015/token
// Cached: $0.75/1M => 75 credits/1M => 0.000075/token
// Output: $6.00/1M => 600 credits/1M => 0.0006/token
export const CREDIT_COSTS = {
  INPUT_PER_TOKEN: 150 / 1_000_000,
  CACHED_PER_TOKEN: 75 / 1_000_000,
  OUTPUT_PER_TOKEN: 600 / 1_000_000,
  MIN_CHARGE_PER_CALL: 1, // Minimum 1 credit ($0.01) per call
};

export interface TokenUsage {
  inputTokens: number;
  cachedTokens: number;
  outputTokens: number;
}

/**
 * Checks if the admin has reached their credit limit.
 * Returns the current usage and limit status.
 */
export async function checkCreditLimit(adminId: string): Promise<{
  limitReached: boolean;
  approachingLimit: boolean;
  creditsUsed: number;
  limit: number;
  plan: string;
}> {
  try {
    const db = await getDb();

    // 1. Get admin's plan
    const user = await db.collection("users").findOne({
      $or: [{ _id: new ObjectId(adminId) }, { apiKey: adminId }],
    });

    const planId = (user?.subscriptionPlan || "free") as keyof typeof PRICING;
    const plan = PRICING[planId] || PRICING.free;
    const limit = plan.creditsPerMonth;

    // 2. Get current month's usage
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`; // e.g. "2024-10"

    const usageDoc = await db.collection("credit_usage").findOne({
      adminId,
      monthKey,
    });

    const creditsUsed = usageDoc?.totalCredits || 0;

    return {
      limitReached: creditsUsed >= limit,
      approachingLimit: creditsUsed >= limit * 0.8,
      creditsUsed,
      limit,
      plan: planId,
    };
  } catch (error) {
    console.error("[Credits] Error checking credit limit:", error);
    // Fail safe: assume limit not reached to avoid blocking legitimate users on error
    return {
      limitReached: false,
      approachingLimit: false,
      creditsUsed: 0,
      limit: 500,
      plan: "error",
    };
  }
}

/**
 * Generates a payment link for immediate renewal/top-up.
 * Use this when the credit limit is reached.
 */
export async function generateRenewalLink(
  adminId: string,
  email: string
): Promise<string | null> {
  try {
    const db = await getDb();

    // Get current plan details
    let query: any = { apiKey: adminId };
    if (ObjectId.isValid(adminId)) {
      query = { $or: [{ _id: new ObjectId(adminId) }, { apiKey: adminId }] };
    }

    const user = await db.collection("users").findOne(query);

    const planId = (user?.subscriptionPlan || "free") as keyof typeof PRICING;
    const plan = PRICING[planId];

    if (!plan || plan.price === "$0") return null;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn("[Credits] Razorpay keys missing");
      return null;
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // Create a payment link for the plan amount
    // Note: We use the 'amount' from pricing (USD) and convert roughly to INR or use configured currency
    // For safety, we assume the plan.amount is in USD and convert to INR cents (x100)
    // A better approach is to fetch the live rate or store INR price
    const amountInINR = Math.round(plan.amount * 90 * 100);

    const paymentLink = await razorpay.paymentLink.create({
      amount: amountInINR,
      currency: "INR",
      accept_partial: false,
      description: `Credit Limit Renewal - ${plan.name} Plan`,
      customer: {
        email: email,
      },
      notify: {
        sms: false,
        email: true, // Razorpay will send the email if enabled
      },
      reminder_enable: true,
      notes: {
        adminId: adminId,
        type: "credit_renewal",
      },
      callback_url: "https://your-domain.com/admin/settings", // Should be env var
      callback_method: "get",
    });

    return paymentLink.short_url;
  } catch (error) {
    console.error("[Credits] Error generating renewal link:", error);
    return null;
  }
}

/**
 * Attempts to charge the user's card automatically.
 * NOTE: This requires a saved customer token (tokenization).
 * Since we likely only have a subscriptionId, we can't force an arbitrary charge easily.
 * Fallback: Generate a payment link.
 */
export async function attemptAutoRecharge(adminId: string): Promise<boolean> {
  try {
    const db = await getDb();
    let query: any = { apiKey: adminId };
    if (ObjectId.isValid(adminId)) {
      query = { $or: [{ _id: new ObjectId(adminId) }, { apiKey: adminId }] };
    }
    const user = await db.collection("users").findOne(query);

    if (!user?.email) return false;

    // 1. Try Auto-Charge (Not implemented - requires saved token)
    // const success = await chargeSavedCard(user.razorpayCustomerId, amount);
    // if (success) return resetMonthlyCredits(adminId);

    // 2. Fallback: Generate Link & Log
    const link = await generateRenewalLink(adminId, user.email);
    if (link) {
      console.log(
        `[Credits] Limit reached/approaching for ${adminId}. Payment Link generated: ${link}`
      );
      // TODO: Send this link via your email service
    }

    return false;
  } catch (error) {
    console.error("[Credits] Auto-recharge failed:", error);
    return false;
  }
}

/**
 * Resets the monthly credit usage for an admin.
 * Call this when a subscription is renewed or upgraded.
 */
export async function resetMonthlyCredits(adminId: string): Promise<boolean> {
  try {
    const db = await getDb();
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

    // Reset usage to 0 for the current month
    await db.collection("credit_usage").updateOne(
      { adminId, monthKey },
      {
        $set: { totalCredits: 0 },
      }
    );

    console.log(
      `[Credits] Reset credits for admin ${adminId} (month: ${monthKey})`
    );
    return true;
  } catch (error) {
    console.error("[Credits] Error resetting credits:", error);
    return false;
  }
}

/**
 * Deducts credits based on token usage.
 * Updates the monthly usage counter.
 */
export async function deductCredits(
  adminId: string,
  usage: TokenUsage
): Promise<{ success: boolean; cost: number; newBalance: number }> {
  try {
    const db = await getDb();

    // Calculate cost
    let cost =
      usage.inputTokens * CREDIT_COSTS.INPUT_PER_TOKEN +
      usage.cachedTokens * CREDIT_COSTS.CACHED_PER_TOKEN +
      usage.outputTokens * CREDIT_COSTS.OUTPUT_PER_TOKEN;

    // Enforce minimum charge
    if (cost < CREDIT_COSTS.MIN_CHARGE_PER_CALL) {
      cost = CREDIT_COSTS.MIN_CHARGE_PER_CALL;
    }

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`; // e.g. "2024-10"

    // Upsert usage document
    const result = await db.collection("credit_usage").findOneAndUpdate(
      { adminId, monthKey },
      {
        $inc: { totalCredits: cost, requestCount: 1 },
        $setOnInsert: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    const newBalance = result?.totalCredits || cost;

    return {
      success: true,
      cost,
      newBalance,
    };
  } catch (error) {
    console.error("[Credits] Error deducting credits:", error);
    return { success: false, cost: 0, newBalance: 0 };
  }
}
