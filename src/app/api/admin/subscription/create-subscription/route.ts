import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { CREDIT_ADDONS, LEAD_ADDONS } from "@/config/pricing";

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

    // Construct Add-ons Array
    // Note: We need the Razorpay Item ID for the credit add-on.
    // If you haven't created it in Razorpay dashboard yet, this part will fail or need a dummy ID.
    // For now, we assume the env var is set or we skip if not present (but log warning).

    // SIMPLIFIED APPROACH:
    // Dynamic add-ons in Razorpay Subscriptions often require pre-created Item IDs.
    // If we have one:
    let subscriptionPayload: any = {
      plan_id: planId,
      total_count,
      quantity,
      customer_notify: 1,
      notes: {
        planId: internalPlanId, // Store internal ID for webhook
        addonQuantity: addonQuantity, // Credit Add-on
        leadAddonQuantity: leadAddonQuantity, // Lead Add-on
      },
    };

    const addons = [];

    if (addonQuantity > 0 && CREDIT_ADDONS.RAZORPAY_ADDON_ITEM_ID) {
      addons.push({
        item: {
          id: CREDIT_ADDONS.RAZORPAY_ADDON_ITEM_ID,
        },
        quantity: addonQuantity,
      });
    } else if (addonQuantity > 0) {
      console.warn(
        "Add-on quantity requested but no RAZORPAY_ADDON_ITEM_ID configured."
      );
    }

    if (leadAddonQuantity > 0 && LEAD_ADDONS.RAZORPAY_ADDON_ITEM_ID) {
      addons.push({
        item: {
          id: LEAD_ADDONS.RAZORPAY_ADDON_ITEM_ID,
        },
        quantity: leadAddonQuantity,
      });
    } else if (leadAddonQuantity > 0) {
      console.warn(
        "Lead Add-on quantity requested but no RAZORPAY_ADDON_LEADS_ID configured."
      );
    }

    if (addons.length > 0) {
      subscriptionPayload.addons = addons;
    }

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
