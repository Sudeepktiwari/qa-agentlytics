import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import Razorpay from "razorpay";

const SA_JWT_SECRET = process.env.SA_JWT_SECRET || "sa_dev_secret";

function verifySa(request: NextRequest) {
  const token = request.cookies.get("sa_token")?.value || "";
  try {
    const payload = jwt.verify(token, SA_JWT_SECRET) as {
      role: string;
      email: string;
    };
    if (payload.role === "sa") return true;
    return false;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifySa(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const adminId = typeof body.adminId === "string" ? body.adminId.trim() : "";

    if (!adminId) {
      return NextResponse.json({ error: "adminId required" }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.collection("users").findOne({ _id: new ObjectId(adminId) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Cancel Subscription if active and not free
    // Find active subscription
    const sub = await db.collection("subscriptions").findOne({
      adminId: adminId,
      status: "active",
      planKey: { $ne: "free" }
    });

    if (sub && sub.subscriptionId) {
      try {
        const instance = new Razorpay({
          key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        
        // Cancel immediately
        await instance.subscriptions.cancel(sub.subscriptionId, false);
        console.log(`[SA Discontinue] Cancelled Razorpay sub ${sub.subscriptionId}`);

        // Update subscription status in DB immediately
        await db.collection("subscriptions").updateOne(
            { _id: sub._id },
            { 
                $set: { 
                    status: "cancelled", 
                    cancelledAt: new Date(),
                    razorpayStatus: "cancelled" 
                } 
            }
        );
      } catch (err: any) {
        console.error("[SA Discontinue] Razorpay cancel failed:", err);
        return NextResponse.json({ error: "Failed to cancel Razorpay subscription: " + err.message }, { status: 500 });
      }
    }

    // 2. Rename Email
    const currentEmail = user.email;
    if (!currentEmail.startsWith("DIS_")) {
        const newEmail = `DIS_${currentEmail}`;
        await db.collection("users").updateOne(
            { _id: new ObjectId(adminId) },
            { 
                $set: { 
                    email: newEmail,
                    subscriptionStatus: "cancelled",
                    subscriptionPlan: "free" 
                } 
            }
        );
        
        // Also update email in subscriptions to maintain consistency
        await db.collection("subscriptions").updateMany(
            { adminId: adminId },
            { $set: { email: newEmail } }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[SA Discontinue] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
