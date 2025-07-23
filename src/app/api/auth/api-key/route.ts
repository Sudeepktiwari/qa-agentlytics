import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getUsersCollection } from "@/lib/mongo";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function POST(req: NextRequest) {
  // Generate or regenerate API key for authenticated user
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };

    const users = await getUsersCollection();

    // Generate a new API key
    const apiKey = `ak_${crypto.randomBytes(32).toString("hex")}`;

    // Store API key in user document
    await users.updateOne(
      { email: payload.email },
      {
        $set: {
          apiKey,
          apiKeyCreated: new Date(),
        },
      }
    );

    return NextResponse.json({
      apiKey,
      adminId: payload.adminId,
      email: payload.email,
    });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function GET(req: NextRequest) {
  // Get current API key for authenticated user
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };

    const users = await getUsersCollection();
    const user = await users.findOne({ email: payload.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      apiKey: user.apiKey || null,
      apiKeyCreated: user.apiKeyCreated || null,
      adminId: payload.adminId,
      email: payload.email,
    });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
