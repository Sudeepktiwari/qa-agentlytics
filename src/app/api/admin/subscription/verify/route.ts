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
      razorpay_signature,
      email,
      planId,
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

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
        status: "active",
        createdAt: new Date(),
      });

      // Update user subscription status (optional, depending on your user model)
      await db.collection("users").updateOne(
        { email },
        {
          $set: {
            subscriptionPlan: planId,
            subscriptionStatus: "active",
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Payment verified and subscription activated",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
