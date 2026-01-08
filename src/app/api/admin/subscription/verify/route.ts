import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import { MongoClient, ObjectId } from "mongodb";
import { processSubscriptionUpdate } from "@/lib/subscription";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      email,
      planId,
      addonQuantity,
      leadAddonQuantity,
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

      // Resolve admin via cookie as primary, email as fallback
      let authAdminId: string | null = null;
      try {
        const auth = verifyAdminAccessFromCookie(req);
        if (auth.isValid && auth.adminId) authAdminId = auth.adminId;
      } catch {}

      console.log(
        `[Subscription Verify] Processing for Email: ${email}, AuthAdminId: ${authAdminId}`
      );

      let user =
        (email &&
          (await db
            .collection("users")
            .findOne({
              email: { $regex: new RegExp(`^${email.trim()}$`, "i") },
            }))) ||
        (authAdminId &&
          (await db
            .collection("users")
            .findOne({ _id: new ObjectId(authAdminId) })));

      if (user) {
        // Use shared logic to update subscription
        const result = await processSubscriptionUpdate({
          adminId: user._id.toString(),
          email: user.email || email,
          planId,
          razorpay_subscription_id,
          razorpay_order_id,
          razorpay_payment_id,
          addonQuantity: Number(addonQuantity) || 0,
          leadAddonQuantity: Number(leadAddonQuantity) || 0,
        });

        return NextResponse.json(result);
      } else {
        console.warn(
          `[Subscription Verify] User not found (email: ${email}, adminId: ${authAdminId})`
        );
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
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
