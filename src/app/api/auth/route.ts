import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUsersCollection, getDb } from "@/lib/mongo";
import { PRICING } from "@/config/pricing";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function POST(req: NextRequest) {
  const { action, email, password } = await req.json();
  console.log("🔐 Auth POST - Action:", action, "Email:", email);

  if (!email || !password || !action) {
    console.log("❌ Auth POST - Missing fields");
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const users = await getUsersCollection();

  if (action === "register") {
    console.log("📝 Auth POST - Registering new user:", email);
    const existing = await users.findOne({ email });
    if (existing) {
      console.log("❌ Auth POST - User already exists:", email);
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }
    const hashed = await bcrypt.hash(password, 10);
    const userDoc = { email, password: hashed };
    const result = await users.insertOne(userDoc);
    const adminId = result.insertedId.toString();
    const token = jwt.sign({ email, adminId }, JWT_SECRET, { expiresIn: "1d" });
    await users.updateOne(
      { _id: result.insertedId },
      {
        $set: {
          token,
          subscriptionPlan: "free",
          subscriptionStatus: "active",
          extraLeads: 0,
        },
      }
    );

    // Initialize default subscription limits for Free plan
    try {
      const db = await getDb();
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      const freePlan = PRICING.free;
      await db.collection("subscriptions").insertOne({
        adminId,
        email,
        planKey: "free",
        status: "active",
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
          leadsUsed: 0,
        },
      });
    } catch (initErr) {
      console.error(
        "[Auth/Register] Failed to init free subscription defaults",
        initErr
      );
    }
    const res = NextResponse.json({ token, adminId });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    });
    console.log(
      "✅ Auth POST - User registered successfully:",
      email,
      "AdminID:",
      adminId
    );
    console.log(
      "🍪 Auth POST - Cookie set for token:",
      "***" + token.slice(-10)
    );
    return res;
  } else if (action === "login") {
    console.log("🔑 Auth POST - Logging in user:", email);
    const user = await users.findOne({ email });
    if (!user) {
      console.log("❌ Auth POST - User not found:", email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log("❌ Auth POST - Invalid password for:", email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const adminId = user._id.toString();
    const token = jwt.sign({ email, adminId }, JWT_SECRET, { expiresIn: "1d" });
    await users.updateOne({ email }, { $set: { token } });
    const res = NextResponse.json({ token, adminId });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    });
    console.log(
      "✅ Auth POST - User logged in successfully:",
      email,
      "AdminID:",
      adminId
    );
    console.log(
      "🍪 Auth POST - Cookie set for token:",
      "***" + token.slice(-10)
    );
    return res;
  } else {
    console.log("❌ Auth POST - Invalid action:", action);
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  // /api/auth/verify endpoint (GET: cookie-based)
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    return NextResponse.json({
      email: payload.email,
      adminId: payload.adminId,
    });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  // /api/auth/verify endpoint (PUT: token in body)
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    return NextResponse.json({
      email: payload.email,
      adminId: payload.adminId,
    });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
