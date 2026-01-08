import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { PRICING, CREDIT_ADDONS, LEAD_ADDONS } from "@/config/pricing";
import { resetMonthlyCredits } from "@/lib/credits";

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

export async function GET(request: NextRequest) {
  try {
    if (!verifySa(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = await getDb();
    const users = await db
      .collection("users")
      .find({})
      .project({ email: 1, apiKey: 1 })
      .toArray();
    const blocks = db.collection("blocks");
    const accounts = [];
    for (const u of users) {
      const idStr = String((u as any)._id);
      const apiKey = (u as any).apiKey || null;
      const adminBlocked = await blocks.findOne({
        type: "adminId",
        value: idStr,
        blocked: true,
      });
      const apiKeyBlocked = apiKey
        ? await blocks.findOne({ type: "apiKey", value: apiKey, blocked: true })
        : null;
      accounts.push({
        id: idStr,
        email: (u as any).email || "",
        apiKey: apiKey,
        blockedAdmin: Boolean(adminBlocked),
        blockedApiKey: Boolean(apiKeyBlocked),
      });
    }
    return NextResponse.json({ accounts });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!verifySa(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";
    const adminId = typeof body.adminId === "string" ? body.adminId : "";
    const apiKey = typeof body.apiKey === "string" ? body.apiKey : "";
    if (!["block", "unblock"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    if (!adminId && !apiKey) {
      return NextResponse.json(
        { error: "adminId or apiKey required" },
        { status: 400 }
      );
    }
    const db = await getDb();
    const blocks = db.collection("blocks");
    const updates: Array<{ type: "adminId" | "apiKey"; value: string }> = [];
    if (adminId) updates.push({ type: "adminId", value: adminId });
    if (apiKey) updates.push({ type: "apiKey", value: apiKey });
    for (const u of updates) {
      if (action === "block") {
        await blocks.updateOne(
          { type: u.type, value: u.value },
          {
            $set: {
              type: u.type,
              value: u.value,
              blocked: true,
              updatedAt: new Date(),
              createdAt: new Date(),
              reason: "manual_block",
            },
          },
          { upsert: true }
        );
      } else {
        await blocks.deleteOne({ type: u.type, value: u.value, blocked: true });
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifySa(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const adminIdInput =
      typeof body.adminId === "string" ? body.adminId.trim() : "";
    const emailInput = typeof body.email === "string" ? body.email.trim() : "";
    if (!adminIdInput && !emailInput) {
      return NextResponse.json(
        { error: "adminId or email required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Find user by adminId or email
    let user = null as any;
    if (adminIdInput) {
      if (ObjectId.isValid(adminIdInput)) {
        user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(adminIdInput) });
      } else {
        // Fallback: apiKey match
        user = await db.collection("users").findOne({ apiKey: adminIdInput });
      }
    }
    if (!user && emailInput) {
      user = await db
        .collection("users")
        .findOne({ email: { $regex: `^${emailInput}$`, $options: "i" } });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const adminId = String(user._id);
    const email = user.email || emailInput || "";

    // Prevent overwriting active paid subscriptions
    const existingPaid = await db
      .collection("subscriptions")
      .find({ adminId })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray()
      .then((arr) => arr[0]);

    if (
      existingPaid &&
      existingPaid.planKey !== "free" &&
      existingPaid.status === "active"
    ) {
      return NextResponse.json(
        { error: "User has an active non-free subscription" },
        { status: 400 }
      );
    }

    const freePlan = PRICING.free;
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

    // Compute current lifetime leads used (unique emails)
    const currentLeads =
      (await db.collection("leads").distinct("email", { adminId })).length || 0;

    await db.collection("subscriptions").updateOne(
      { adminId, cycleMonthKey: monthKey },
      {
        $set: {
          adminId,
          email,
          planKey: "free",
          status: "active",
          type: "subscription",
          createdAt: new Date(),
          cycleMonthKey: monthKey,
          addons: { creditsUnits: 0, leadsUnits: 0 },
          limits: {
            creditMonthlyLimit: freePlan.creditsPerMonth,
            leadExtraLeads: 0,
            leadTotalLimit: freePlan.totalLeads,
          },
          usage: {
            creditsUsed: 0,
            leadsUsed: currentLeads,
          },
        },
      },
      { upsert: true }
    );

    // Update user flags cautiously (do not overwrite non-free statuses)
    await db.collection("users").updateOne(
      { _id: new ObjectId(adminId) },
      {
        $set: {
          subscriptionPlan: "free",
          subscriptionStatus: "active",
        },
      }
    );

    return NextResponse.json({
      success: true,
      adminId,
      plan: "free",
      limits: {
        creditsPerMonth: freePlan.creditsPerMonth,
        totalLeads: freePlan.totalLeads,
      },
    });
  } catch (error) {
    console.error("[SA] Seed free subscription error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!verifySa(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const adminIdInput =
      typeof body.adminId === "string" ? body.adminId.trim() : "";
    const emailInput = typeof body.email === "string" ? body.email.trim() : "";
    const planKeyInput =
      typeof body.planKey === "string" ? body.planKey.trim() : "";
    const creditsUnits =
      typeof body.creditsUnits === "number" && body.creditsUnits >= 0
        ? body.creditsUnits
        : 0;
    const leadsUnits =
      typeof body.leadsUnits === "number" && body.leadsUnits >= 0
        ? body.leadsUnits
        : 0;

    if (!planKeyInput || !(planKeyInput in PRICING)) {
      return NextResponse.json({ error: "Invalid planKey" }, { status: 400 });
    }
    if (!adminIdInput && !emailInput) {
      return NextResponse.json(
        { error: "adminId or email required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Find user
    let user = null as any;
    if (adminIdInput) {
      if (ObjectId.isValid(adminIdInput)) {
        user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(adminIdInput) });
      } else {
        user = await db.collection("users").findOne({ apiKey: adminIdInput });
      }
    }
    if (!user && emailInput) {
      user = await db
        .collection("users")
        .findOne({ email: { $regex: `^${emailInput}$`, $options: "i" } });
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const adminId = String(user._id);
    const email = user.email || emailInput || "";

    const plan = PRICING[planKeyInput as keyof typeof PRICING];
    const addonCredits = creditsUnits * CREDIT_ADDONS.UNIT_CREDITS;
    const extraLeads = leadsUnits * LEAD_ADDONS.UNIT_LEADS;
    const totalCredits = plan.creditsPerMonth + addonCredits;
    const leadTotalLimit = plan.totalLeads + extraLeads;

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

    const currentLeads =
      (await db.collection("leads").distinct("email", { adminId })).length || 0;

    await db.collection("subscriptions").updateOne(
      { adminId, cycleMonthKey: monthKey },
      {
        $set: {
          adminId,
          email,
          planKey: planKeyInput,
          status: "active",
          type: "subscription",
          createdAt: new Date(),
          cycleMonthKey: monthKey,
          addons: { creditsUnits, leadsUnits },
          limits: {
            creditMonthlyLimit: totalCredits,
            leadExtraLeads: extraLeads,
            leadTotalLimit,
          },
          usage: {
            creditsUsed: 0,
            leadsUsed: currentLeads,
          },
        },
      },
      { upsert: true }
    );

    await db.collection("users").updateOne(
      { _id: new ObjectId(adminId) },
      {
        $set: {
          subscriptionPlan: planKeyInput,
          subscriptionStatus: "active",
          extraLeads: extraLeads,
        },
      }
    );

    await resetMonthlyCredits(adminId, totalCredits);

    return NextResponse.json({
      success: true,
      adminId,
      plan: planKeyInput,
      addons: { creditsUnits, leadsUnits },
      limits: { creditsPerMonth: totalCredits, totalLeads: leadTotalLimit },
    });
  } catch (error) {
    console.error("[SA] Change plan error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
