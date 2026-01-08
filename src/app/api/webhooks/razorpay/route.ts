import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { MongoClient, ObjectId } from "mongodb";
import { processSubscriptionUpdate } from "@/lib/subscription";
import { PRICING } from "@/config/pricing";

// Connect to MongoDB
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

let dbInstance: any = null;
async function getDb() {
  if (dbInstance) return dbInstance;
  if (!client.connect) {
    await client.connect();
  }
  dbInstance = client.db("sample-chatbot");
  return dbInstance;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[Webhook] RAZORPAY_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 }
      );
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log(`[Webhook] Received event: ${event.event}`);

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

      if (!user) {
        console.error(
          `[Webhook] User not found for subscription ${razorpay_subscription_id}`
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

      const addonQuantity = Number(notes.addonQuantity) || 0;
      const leadAddonQuantity = Number(notes.leadAddonQuantity) || 0;

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

      console.log(
        `[Webhook] Successfully processed subscription ${event.event}`
      );
    }
    // Handle Order Paid (One-time) if needed
    else if (event.event === "order.paid") {
      // Similar logic for one-time payments
      const order = event.payload.order.entity;
      const payment = event.payload.payment.entity;
      const notes = order.notes || {};

      const user = await db
        .collection("users")
        .findOne({ email: payment.email });
      if (user && notes.planId) {
        await processSubscriptionUpdate({
          adminId: user._id.toString(),
          email: user.email,
          planId: notes.planId,
          razorpay_order_id: order.id,
          razorpay_payment_id: payment.id,
          addonQuantity: Number(notes.addonQuantity) || 0,
          leadAddonQuantity: Number(notes.leadAddonQuantity) || 0,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
