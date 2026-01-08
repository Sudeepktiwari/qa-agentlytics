import { NextResponse } from "next/server";
import crypto from "crypto";
import { MongoClient, ObjectId } from "mongodb";
import { processSubscriptionUpdate } from "@/lib/subscription";
import { PRICING } from "@/config/pricing";
import { getDb } from "@/lib/mongo";

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
      const razorpay_plan_id = subscriptionEntity.plan_id;
      const notes = subscriptionEntity.notes || {};
      const razorpay_payment_id = payload.payload.payment?.entity?.id;

      const db = await getDb();

      // Robust User Lookup:
      // 1. Try resolving via adminId from notes (immutable ID)
      // 2. Fallback to subscriptionId lookup (legacy)
      let user = null;
      let adminId = notes.adminId;

      if (adminId) {
        try {
          user = await db
            .collection("users")
            .findOne({ _id: new ObjectId(adminId) });
        } catch (e) {
          console.warn("[Webhook] Invalid adminId in notes:", adminId);
        }
      }

      if (!user) {
        user = await db.collection("users").findOne({ subscriptionId });
      }

      if (user) {
        adminId = user._id.toString();

        const planKey = (notes.planId ||
          user.subscriptionPlan ||
          "free") as keyof typeof PRICING;

        const addonQuantity = notes.addonQuantity
          ? parseInt(notes.addonQuantity, 10)
          : 0;
        const leadAddonQuantity = notes.leadAddonQuantity
          ? parseInt(notes.leadAddonQuantity, 10)
          : 0;

        // Use shared logic to update subscription
        // This ensures consistency with verify route and handles upsert/history correctly
        // And tracks subscription by adminId as requested
        await processSubscriptionUpdate({
          adminId,
          email: user.email,
          planId: planKey,
          razorpay_subscription_id: subscriptionId,
          razorpay_plan_id,
          razorpay_payment_id,
          addonQuantity,
          leadAddonQuantity,
        });

        return NextResponse.json({ status: "ok" });
      } else {
        console.warn(
          `[Webhook] User not found for subscription: ${subscriptionId}`
        );
        return NextResponse.json({ status: "ignored" });
      }
    }

    return NextResponse.json({ status: "ignored" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
