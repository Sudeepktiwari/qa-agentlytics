import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { PRICING } from "@/config/pricing";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const {
      planId,
      internalPlanId, // The friendly ID (growth, scale)
      total_count = 120,
      quantity = 1,
      addonQuantity = 0,
      leadAddonQuantity = 0,
    } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const plan = PRICING[internalPlanId as keyof typeof PRICING];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Construct Add-ons Array
    // Note: We need the Razorpay Item ID for the credit add-on.
    // If you haven't created it in Razorpay dashboard yet, this part will fail or need a dummy ID.
    // For now, we assume the env var is set or we skip if not present (but log warning).

    // SIMPLIFIED APPROACH:
    // We use separate Plan IDs for each variant, so we do NOT attach add-ons here.
    // The price is determined by the plan_id itself.
    // We pass the units in 'notes' so the webhook knows how much to credit.
    let subscriptionPayload: any = {
      plan_id: planId,
      total_count,
      quantity,
      customer_notify: 1,
      notes: {
        planId: internalPlanId, // Store internal ID for webhook
        addonQuantity: addonQuantity, // Credit Add-on Units
        leadAddonQuantity: leadAddonQuantity, // Lead Add-on Units
      },
    };

    // REMOVED: Add-ons logic (user requested separate subscriptions)
    /*
    const addons = [];
    const creditAddonId = plan.addons?.credits?.razorpayItemId;
    ...
    if (addons.length > 0) {
      subscriptionPayload.addons = addons;
    }
    */

    const subscription = await razorpay.subscriptions.create(
      subscriptionPayload
    );

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error creating Razorpay subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
