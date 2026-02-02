import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUsersCollection, getDb } from "@/lib/mongo";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { PRICING } from "@/config/pricing";
import { sendVerificationEmail } from "@/lib/maileroo";
import { validateEmailWithZeruh } from "@/lib/zeruh";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password } = body;
    console.log(
      `🔐 [Auth API] POST Request received. Action: ${action}, Email: ${email}`,
    );

    if (!email || !password || !action) {
      console.log("❌ [Auth API] Missing fields");
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Move DB connection AFTER validation for "register" action
    // const users = await getUsersCollection(); <--- REMOVED

    if (action === "register") {
      console.log("📝 [Auth API] Starting registration flow for:", email);

      // Validate email with Zeruh BEFORE connecting to DB
      console.log("🕵️ [Auth API] Validating email with Zeruh...");
      const validation = await validateEmailWithZeruh(email);
      console.log("🕵️ [Auth API] Zeruh validation result:", validation);

      if (!validation.valid) {
        console.log("❌ [Auth API] Zeruh validation failed:", validation.error);
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Now connect to DB
      const users = await getUsersCollection();
      const existing = await users.findOne({ email });
      if (existing) {
        console.log("❌ Auth POST - User already exists:", email);
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 },
        );
      }
      const hashed = await bcrypt.hash(password, 10);
      const apiKey = `ak_${crypto.randomBytes(32).toString("hex")}`;

      // Generate verification token
      const verificationToken = crypto.randomUUID();
      const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 mins

      const userDoc = {
        email,
        password: hashed,
        apiKey,
        apiKeyCreated: new Date(),
        emailVerified: false,
        verificationToken,
        verificationTokenExpires,
        subscriptionPlan: "free",
        subscriptionStatus: "active",
        extraLeads: 0,
      };

      const result = await users.insertOne(userDoc);
      const adminId = result.insertedId.toString();

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
          initErr,
        );
      }

      // Send verification email
      try {
        await sendVerificationEmail({ email }, verificationToken);
      } catch (emailErr) {
        console.error("❌ Failed to send verification email:", emailErr);
        // We still proceed but user might need to resend
      }

      // Do NOT log in automatically. Require verification.
      return NextResponse.json({
        success: true,
        message:
          "Registration successful. Please check your email to verify your account.",
      });
    } else if (action === "login") {
      console.log("🔑 Auth POST - Logging in user:", email);
      const users = await getUsersCollection();
      const user = await users.findOne({ email });
      if (!user) {
        console.log("❌ Auth POST - User not found:", email);
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        console.log("❌ Auth POST - Invalid password for:", email);
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      }

      // Check email verification
      /*
      if (user.emailVerified !== true) {
        if (user.emailVerified === false) {
          console.log("❌ Auth POST - Email not verified:", email);
          return NextResponse.json(
            { error: "Email not verified. Please check your inbox." },
            { status: 403 },
          );
        }
      }
      */

      const adminId = user._id.toString();

      const token = jwt.sign({ email, adminId }, JWT_SECRET, {
        expiresIn: "1d",
      });

      let apiKey = user.apiKey as string | undefined;
      if (!apiKey) {
        apiKey = `ak_${crypto.randomBytes(32).toString("hex")}`;
        await users.updateOne(
          { _id: user._id },
          {
            $set: {
              apiKey,
              apiKeyCreated: new Date(),
            },
          },
        );
      }

      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            token,
          },
        },
      );

      const res = NextResponse.json({ token, adminId, apiKey });
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
        adminId,
      );
      console.log(
        "🍪 Auth POST - Cookie set for token:",
        "***" + token.slice(-10),
      );
      return res;
    } else {
      console.log("❌ Auth POST - Invalid action:", action);
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("❌ [Auth API] Exception:", error);
    return NextResponse.json(
      { error: "Internal Server Error: " + error.message },
      { status: 500 },
    );
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
    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(payload.adminId) });

    const res = NextResponse.json({
      email: payload.email,
      adminId: payload.adminId,
      apiKey: user?.apiKey,
    });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return res;
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
    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(payload.adminId) });

    const res = NextResponse.json({
      email: payload.email,
      adminId: payload.adminId,
      apiKey: user?.apiKey,
    });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
