import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  const logPrefix = `[CancelAPI ${Date.now()}]`;
  try {
    const auth = verifyAdminAccessFromCookie(req);
    if (!auth || !auth.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    
    // Find active subscription for this admin
    // We look for the most recent active subscription
    const subRecord = await db.collection("subscriptions").findOne({
        adminId: auth.adminId,
        status: "active" 
    });
    
    const subscriptionId = subRecord?.subscriptionId;

    if (!subscriptionId) {
        console.warn(`${logPrefix} No active subscription found for admin: ${auth.adminId}`);
        return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Initialize Razorpay
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Cancel the subscription in Razorpay
    // The second argument 'false' means cancel immediately (not at end of cycle)
    // Adjust to 'true' if you want to cancel at the end of the billing cycle
    await instance.subscriptions.cancel(subscriptionId, false);

    console.log(`${logPrefix} Cancelled subscription ${subscriptionId} for admin ${auth.adminId}`);

    // The webhook will handle the DB update, but we can return success now.
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
