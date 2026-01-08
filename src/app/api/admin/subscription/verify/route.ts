import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import { MongoClient, ObjectId } from "mongodb";
import { processSubscriptionUpdate } from "@/lib/subscription";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

export async function POST(req: NextRequest) {
  const logPrefix = `[Subscription Verify ${Date.now()}]`;
  console.log(`${logPrefix} Request received`);

  try {
    const bodyText = await req.text(); // Read text first for debugging
    console.log(`${logPrefix} Raw Body:`, bodyText);

    let bodyData;
    try {
      bodyData = JSON.parse(bodyText);
    } catch (e) {
      console.error(`${logPrefix} JSON Parse Error:`, e);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      email,
      planId,
      razorpay_plan_id,
      addonQuantity,
      leadAddonQuantity,
    } = bodyData;

    console.log(`${logPrefix} Extracted Data:`, {
      email,
      planId,
      razorpay_plan_id,
      razorpay_subscription_id,
      razorpay_payment_id,
    });

    let verificationBody = "";
    if (razorpay_subscription_id) {
      // Subscription verification: payment_id + "|" + subscription_id
      verificationBody = razorpay_payment_id + "|" + razorpay_subscription_id;
    } else {
      // Order verification: order_id + "|" + payment_id
      verificationBody = razorpay_order_id + "|" + razorpay_payment_id;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!secret) {
      console.error(`${logPrefix} Missing RAZORPAY_KEY_SECRET`);
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(verificationBody.toString())
      .digest("hex");

    console.log(
      `${logPrefix} Sig Check: Expected=${expectedSignature}, Received=${razorpay_signature}`
    );

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

      console.log(`${logPrefix} Auth Admin ID: ${authAdminId}`);

      // Escape regex special characters to prevent errors with emails containing +, ., etc.
      const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      };

      let user = null;
      if (email) {
        user = await db.collection("users").findOne({
          email: {
            $regex: new RegExp(`^${escapeRegExp(email.trim())}$`, "i"),
          },
        });
      }

      if (!user && authAdminId) {
        user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(authAdminId) });
      }

      console.log(`${logPrefix} User Found:`, user ? user._id : "NO");

      if (user) {
        // Use shared logic to update subscription
        console.log(`${logPrefix} Calling processSubscriptionUpdate...`);
        const result = await processSubscriptionUpdate({
          adminId: user._id.toString(),
          email: user.email || email,
          planId,
          razorpay_subscription_id,
          razorpay_plan_id,
          razorpay_order_id,
          razorpay_payment_id,
          addonQuantity: Number(addonQuantity) || 0,
          leadAddonQuantity: Number(leadAddonQuantity) || 0,
        });

        console.log(`${logPrefix} processSubscriptionUpdate Result:`, result);
        return NextResponse.json(result);
      } else {
        console.warn(
          `${logPrefix} User not found (email: ${email}, adminId: ${authAdminId})`
        );
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else {
      console.error(`${logPrefix} Invalid Signature`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error(`${logPrefix} Error verifying payment:`, error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  } finally {
    await client.close();
  }
}
