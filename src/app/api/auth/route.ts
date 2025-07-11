import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUsersCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function POST(req: NextRequest) {
  const { action, email, password } = await req.json();
  if (!email || !password || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const users = await getUsersCollection();
  if (action === "register") {
    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }
    const hashed = await bcrypt.hash(password, 10);
    const userDoc = { email, password: hashed };
    const result = await users.insertOne(userDoc);
    const adminId = result.insertedId.toString();
    const token = jwt.sign({ email, adminId }, JWT_SECRET, { expiresIn: "7d" });
    await users.updateOne({ _id: result.insertedId }, { $set: { token } });
    const res = NextResponse.json({ token, adminId });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } else if (action === "login") {
    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const adminId = user._id.toString();
    const token = jwt.sign({ email, adminId }, JWT_SECRET, { expiresIn: "7d" });
    await users.updateOne({ email }, { $set: { token } });
    const res = NextResponse.json({ token, adminId });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } else {
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
  } catch (e) {
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
  } catch (e) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
