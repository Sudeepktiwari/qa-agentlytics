import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { CREDIT_ADDONS } from "@/config/pricing";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const { planId, total_count = 120, quantity = 1, addonQuantity = 0 } = await req.json();

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
    
    const addons = [];
    if (addonQuantity > 0 && CREDIT_ADDONS.RAZORPAY_ADDON_ITEM_ID) {
      addons.push({
        item: {
          name: "Extra Credits Pack",
          amount: CREDIT_ADDONS.UNIT_PRICE_USD * 100, // in paise (if INR) or cents. 
          // CAUTION: Razorpay 'amount' is usually in the smallest currency unit.
          // If your plan is USD, ensure this matches.
          // Ideally, use an 'item_id' instead of inline definition if possible for subscriptions.
          // For subscriptions, 'addons' usually expects an array of { item: { ... } } or just item_id references.
          // Standard Razorpay Subscriptions API for addons:
          // "addons": [{ "item": { "name": "...", "amount": ... } }]
        },
        // However, the cleanest way is to use a pre-created 'plan_id' or 'item_id' for the add-on
        // but Razorpay Subscriptions create payload structure is specific.
        // Let's use the 'notes' to track it if we can't dynamically add items easily without an Item ID.
        // Or better: Use the 'addons' parameter properly.
      });
    }

    // SIMPLIFIED APPROACH:
    // Dynamic add-ons in Razorpay Subscriptions often require pre-created Item IDs.
    // If we have one:
    let subscriptionPayload: any = {
      plan_id: planId,
      total_count,
      quantity,
      customer_notify: 1,
      notes: {
        addonQuantity: addonQuantity, // Store in notes for webhook processing fallback
      }
    };

    if (addonQuantity > 0 && CREDIT_ADDONS.RAZORPAY_ADDON_ITEM_ID) {
       subscriptionPayload.addons = [
         {
           item: {
             id: CREDIT_ADDONS.RAZORPAY_ADDON_ITEM_ID, // Pre-created Item ID
             // If we just want to set quantity:
           },
           quantity: addonQuantity
         }
       ];
    } else if (addonQuantity > 0) {
      console.warn("Add-on quantity requested but no RAZORPAY_ADDON_ITEM_ID configured.");
    }

    const subscription = await razorpay.subscriptions.create(subscriptionPayload);

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error creating Razorpay subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
