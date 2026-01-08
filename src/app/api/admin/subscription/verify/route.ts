import { NextResponse } from "next/server";
import crypto from "crypto";
import { MongoClient } from "mongodb";
import { resetMonthlyCredits } from "@/lib/credits";
import { PRICING, CREDIT_ADDONS, LEAD_ADDONS } from "@/config/pricing";

const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri);

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      email,
      planId,
      addonQuantity,
      leadAddonQuantity,
    } = await req.json();

    let body = "";
    if (razorpay_subscription_id) {
      // Subscription verification: payment_id + "|" + subscription_id
      body = razorpay_payment_id + "|" + razorpay_subscription_id;
    } else {
      // Order verification: order_id + "|" + payment_id
      body = razorpay_order_id + "|" + razorpay_payment_id;
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await client.connect();
      const db = client.db("sample-chatbot");

      // Defer subscription record creation until limits are computed

      // Find user to get ID and update
      const user = await db
        .collection("users")
        .findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });

      if (user) {
        // Calculate extra leads
        let extraLeads = 0;
        if (leadAddonQuantity && typeof leadAddonQuantity === "number") {
          extraLeads = leadAddonQuantity * LEAD_ADDONS.UNIT_LEADS;
        }

        // Update user subscription status
        const updateResult = await db.collection("users").updateOne(
          { _id: user._id },
          {
            $set: {
              subscriptionPlan: planId,
              subscriptionStatus: "active",
              subscriptionId: razorpay_subscription_id,
              extraLeads: extraLeads,
            },
          }
        );

        // Calculate total credits (Plan Base + Add-ons)
        const plan = PRICING[planId as keyof typeof PRICING] || PRICING.free;
        let totalCredits = plan.creditsPerMonth;
        if (addonQuantity && typeof addonQuantity === "number") {
          totalCredits += addonQuantity * CREDIT_ADDONS.UNIT_CREDITS;
        }

        const now = new Date();
        const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

        // Compute current lifetime leads used (unique emails)
        const currentLeads =
          (
            await db
              .collection("leads")
              .distinct("email", { adminId: user._id.toString() })
          ).length || 0;

        await db.collection("subscriptions").insertOne({
          adminId: user._id.toString(),
          email,
          planKey: planId,
          subscriptionId: razorpay_subscription_id,
          status: "active",
          type: razorpay_subscription_id ? "subscription" : "one-time",
          razorpay_order_id,
          razorpay_payment_id,
          createdAt: new Date(),
          cycleMonthKey: monthKey,
          addons: {
            creditsUnits: addonQuantity || 0,
            leadsUnits: leadAddonQuantity || 0,
          },
          limits: {
            creditMonthlyLimit: totalCredits,
            leadExtraLeads: extraLeads,
            leadTotalLimit: (plan.totalLeads || 0) + extraLeads,
          },
          usage: {
            creditsUsed: 0,
            leadsUsed: currentLeads,
          },
        });

        await resetMonthlyCredits(user._id.toString(), totalCredits);

        console.log(
          `[Subscription Verify] Updated user ${email} to plan ${planId} with limit ${totalCredits} and extra leads ${extraLeads}. Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`
        );
      } else {
        console.warn(`[Subscription Verify] User not found for email ${email}`);
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified and subscription activated",
      });
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  } finally {
    await client.close();
  }
}
