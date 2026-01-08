import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PRICING, CREDIT_ADDONS, LEAD_ADDONS } from "@/config/pricing";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

export async function POST(req: NextRequest) {
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

      // Resolve admin via cookie as primary, email as fallback
      let authAdminId: string | null = null;
      try {
        const auth = verifyAdminAccessFromCookie(req);
        if (auth.isValid && auth.adminId) authAdminId = auth.adminId;
      } catch {}

      let user =
        (email &&
          (await db
            .collection("users")
            .findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } }))) ||
        (authAdminId &&
          (await db
            .collection("users")
            .findOne({ _id: new ObjectId(authAdminId) })));

      if (user) {
        // Calculate extra leads
        let extraLeads = 0;
        if (leadAddonQuantity && typeof leadAddonQuantity === "number") {
          extraLeads = leadAddonQuantity * LEAD_ADDONS.UNIT_LEADS;
        }

        // Calculate total credits (Plan Base + Add-ons)
        const plan = PRICING[planId as keyof typeof PRICING] || PRICING.free;
        const validatedPlanId = plan.id;

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

        // Upsert subscription for the current month
        await db.collection("subscriptions").updateOne(
          {
            adminId: user._id.toString(),
            cycleMonthKey: monthKey,
          },
          {
            $set: {
              email: user.email || email,
              planKey: validatedPlanId,
              subscriptionId: razorpay_subscription_id,
              status: "active",
              type: razorpay_subscription_id ? "subscription" : "one-time",
              razorpay_order_id,
              razorpay_payment_id,
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
                creditsUsed: 0, // Reset credits on upgrade/new sub
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

        // Update user profile (legacy support)
        await db.collection("users").updateOne(
          { _id: user._id },
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
          `[Subscription Verify] Updated user ${email} to plan ${validatedPlanId} with limit ${totalCredits} and extra leads ${extraLeads}.`
        );
        return NextResponse.json({
          success: true,
          plan: validatedPlanId,
          limits: {
            creditsLimit: totalCredits,
            leadsLimit: (plan.totalLeads || 0) + extraLeads,
          },
        });
      } else {
        console.warn(
          `[Subscription Verify] User not found (email: ${email}, adminId: ${authAdminId})`
        );
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
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
