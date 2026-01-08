import { NextResponse } from "next/server";
import crypto from "crypto";
import { MongoClient } from "mongodb";
import { resetMonthlyCredits } from "@/lib/credits";
import { PRICING, CREDIT_ADDONS, LEAD_ADDONS } from "@/config/pricing";

const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri);

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (secret) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(text)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("[Webhook] Invalid signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
    }

    const payload = JSON.parse(text);
    const event = payload.event;

    if (event === "subscription.charged") {
      const subscriptionEntity = payload.payload.subscription.entity;
      const subscriptionId = subscriptionEntity.id;
      const notes = subscriptionEntity.notes || {};

      // Determine Plan
      // Mapping Razorpay Plan ID back to our internal plan key is needed if not stored in notes.
      // Ideally, we store 'planKey' in notes during creation.
      // Fallback: Check user's current plan in DB.

      await client.connect();
      const db = client.db("sample-chatbot");
      const user = await db.collection("users").findOne({ subscriptionId });

      if (user) {
        const adminId = user._id.toString();

        // Calculate Total Credits
        // 1. Base Plan Credits
        const userPlanId = (user.subscriptionPlan ||
          "free") as keyof typeof PRICING;
        const baseCredits = PRICING[userPlanId]?.creditsPerMonth || 0;

        // 2. Add-on Credits
        let addonCredits = 0;
        let extraLeads = 0;

        // Method A: From Notes (Simplest for now)
        if (notes.addonQuantity) {
          const qty = parseInt(notes.addonQuantity, 10);
          if (!isNaN(qty)) {
            addonCredits = qty * CREDIT_ADDONS.UNIT_CREDITS;
          }
        }

        if (notes.leadAddonQuantity) {
          const qty = parseInt(notes.leadAddonQuantity, 10);
          if (!isNaN(qty)) {
            extraLeads = qty * LEAD_ADDONS.UNIT_LEADS;
          }
        }

        // Method B: Check active add-ons in payload (Better if Razorpay sends it)
        // if (subscriptionEntity.addons) { ... }

        const totalCredits = baseCredits + addonCredits;

        const now = new Date();
        const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
        const creditsUnits = notes.addonQuantity
          ? parseInt(notes.addonQuantity, 10)
          : 0;
        const leadsUnits = notes.leadAddonQuantity
          ? parseInt(notes.leadAddonQuantity, 10)
          : 0;

        await db.collection("subscriptions").updateOne(
          { subscriptionId },
          {
            $set: {
              adminId,
              email: user.email,
              planKey: userPlanId,
              status: "active",
              type: "subscription",
              cycleMonthKey: monthKey,
              lastRenewedAt: new Date(),
              addons: { creditsUnits, leadsUnits },
              limits: {
                creditMonthlyLimit: totalCredits,
                leadExtraLeads: extraLeads,
                leadTotalLimit:
                  (PRICING[userPlanId]?.totalLeads || 0) + extraLeads,
              },
              usage: {
                creditsUsed: 0,
                leadsUsed:
                  (
                    await db.collection("leads").distinct("email", { adminId })
                  ).length || 0,
              },
            },
          },
          { upsert: true }
        );

        await db
          .collection("users")
          .updateOne({ _id: user._id }, { $set: { extraLeads: extraLeads } });

        await resetMonthlyCredits(adminId, totalCredits);

        console.log(
          `[Webhook] Subscription charged for ${adminId}. Reset limit to ${totalCredits}, Extra Leads: ${extraLeads}`
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  } finally {
    await client.close();
  }
}
