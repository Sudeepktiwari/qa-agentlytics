import { NextResponse } from "next/server";
import crypto from "crypto";
import { MongoClient } from "mongodb";
import { resetMonthlyCredits } from "@/lib/credits";
import { PRICING, CREDIT_ADDONS } from "@/config/pricing";

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
        // Check 'quantity' of the add-on item in the subscription entity if available
        // OR rely on 'notes.addonQuantity' if we stored it there (simple but less robust if changed later)
        // Robust way: iterate over subscriptionEntity.addons if present

        let addonCredits = 0;

        // Method A: From Notes (Simplest for now)
        if (notes.addonQuantity) {
          const qty = parseInt(notes.addonQuantity, 10);
          if (!isNaN(qty)) {
            addonCredits = qty * CREDIT_ADDONS.UNIT_CREDITS;
          }
        }

        // Method B: Check active add-ons in payload (Better if Razorpay sends it)
        // if (subscriptionEntity.addons) { ... }

        const totalCredits = baseCredits + addonCredits;

        // Reset credits and set the new limit for this month
        // We need to pass the 'totalCredits' to be stored as the limit for this month
        // effectively "resetting" usage to 0 and defining the new ceiling.

        await resetMonthlyCredits(adminId, totalCredits);

        console.log(
          `[Webhook] Subscription charged for ${adminId}. Reset limit to ${totalCredits}`
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
