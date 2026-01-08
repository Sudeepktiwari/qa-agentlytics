import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { processSubscriptionUpdate } from "@/lib/subscription";
import { getDb } from "@/lib/mongo";

export async function POST(req: NextRequest) {
  const logPrefix = `[Razorpay Subscription Webhook ${Date.now()}]`;
  console.log(`${logPrefix} Received request`);

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(`${logPrefix} RAZORPAY_WEBHOOK_SECRET is not set`);
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 }
      );
    }

    if (!signature) {
      console.error(`${logPrefix} Missing signature`);
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error(
        `${logPrefix} Invalid signature. Exp: ${expectedSignature}, Rec: ${signature}`
      );
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log(
      `${logPrefix} Event: ${event.event}`,
      JSON.stringify(event.payload)
    );

    const db = await getDb();

    // Handle Subscription Charged / Activated
    if (
      event.event === "subscription.charged" ||
      event.event === "subscription.activated"
    ) {
      const subscription = event.payload.subscription.entity;
      const payment = event.payload.payment?.entity;

      const razorpay_subscription_id = subscription.id;
      const razorpay_payment_id = payment?.id;
      const notes = subscription.notes || {};
      const planId = subscription.plan_id; // Razorpay Plan ID

      console.log(`${logPrefix} Processing Subscription:`, {
        razorpay_subscription_id,
        planId,
        notes,
      });

      // We need to map Razorpay Plan ID back to our internal Plan ID
      // Or rely on notes if we stored it there.
      // But typically we can find the user by subscription_id or email

      let user = await db.collection("users").findOne({
        $or: [
          { subscriptionId: razorpay_subscription_id },
          { email: payment?.email },
          { email: notes.email }, // If we stored email in notes
        ],
      });

      console.log(`${logPrefix} User Found:`, user ? user._id : "NO");

      if (!user) {
        console.error(
          `${logPrefix} User not found for subscription ${razorpay_subscription_id}`
        );
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Determine internal plan ID from Razorpay Plan ID
      // This is tricky if we don't have a direct mapping in code.
      // But we can check our PRICING config env vars.
      let internalPlanId = "free";
      if (planId === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_GROWTH)
        internalPlanId = "growth";
      else if (planId === process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE)
        internalPlanId = "scale";

      // If we can't find it, maybe fallback to user's current plan or "growth" default?
      // Better to trust the notes if available
      if (notes.planId) {
        internalPlanId = notes.planId;
      }

      // Also try to find variant ID from PRICING if possible, or iterate
      // But we already have the variant ID in 'planId' variable.

      const addonQuantity = Number(notes.addonQuantity) || 0;
      const leadAddonQuantity = Number(notes.leadAddonQuantity) || 0;

      console.log(`${logPrefix} Update Params:`, {
        internalPlanId,
        addonQuantity,
        leadAddonQuantity,
      });

      await processSubscriptionUpdate({
        adminId: user._id.toString(),
        email: user.email,
        planId: internalPlanId,
        razorpay_subscription_id,
        razorpay_plan_id: planId, // Pass the Razorpay Plan ID (variant)
        razorpay_payment_id,
        addonQuantity,
        leadAddonQuantity,
      });

      console.log(`${logPrefix} Update Success`);
    } else {
      console.log(`${logPrefix} Unhandled event type`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(`[Razorpay Webhook] Error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
