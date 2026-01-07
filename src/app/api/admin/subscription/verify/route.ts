import { NextResponse } from "next/server";
import crypto from "crypto";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri);

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      email,
      planId,
    } = await req.json();

    let body = "";
    if (razorpay_subscription_id) {
      // Subscription verification: payment_id + "|" + subscription_id
      body = razorpay_payment_id + "|" + razorpay_subscription_id;
    } else {
      // Order verification: order_id + "|" + payment_id
      body = razorpay_order_id + "|" + razorpay_payment_id;
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await client.connect();
      const db = client.db("sample-chatbot");

      // Save subscription details
      await db.collection("subscriptions").insertOne({
        email,
        planId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_subscription_id,
        status: "active",
        type: razorpay_subscription_id ? "subscription" : "one-time",
        createdAt: new Date(),
      });

      // Update user subscription status
      const updateResult = await db.collection("users").updateOne(
        { email: { $regex: new RegExp(`^${email}$`, "i") } },
        {
          $set: {
            subscriptionPlan: planId,
            subscriptionStatus: "active",
            subscriptionId: razorpay_subscription_id,
          },
        }
      );

      console.log(
        `[Subscription Verify] Updated user ${email} to plan ${planId}. Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`
      );

      return NextResponse.json({
        success: true,
        message: "Payment verified and subscription activated",
      });
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  } finally {
    await client.close();
  }
}
