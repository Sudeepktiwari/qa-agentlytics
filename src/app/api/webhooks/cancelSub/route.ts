import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { handleSubscriptionCancellation } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const logPrefix = `[Razorpay Cancel Webhook ${Date.now()}]`;
  console.log(`${logPrefix} Received request`);

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Use the main webhook secret, or fallback to a specific one if you configure a separate secret
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
    console.log(`${logPrefix} Event: ${event.event}`);

    if (event.event === "subscription.cancelled") {
      await handleSubscriptionCancellation(event.payload);
      return NextResponse.json({ success: true });
    }

    // Return 200 for other events to acknowledge receipt
    return NextResponse.json({ message: "Event ignored" });
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
