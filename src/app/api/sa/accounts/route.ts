import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import jwt from "jsonwebtoken";

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
