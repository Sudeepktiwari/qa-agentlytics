import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SA_JWT_SECRET = process.env.SA_JWT_SECRET || "sa_dev_secret";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }
    const db = await getDb();
    const admin = await db.collection("admins").findOne({ email });
    if (!admin || typeof admin.password !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, admin.password as string);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = jwt.sign({ email, role: "sa" }, SA_JWT_SECRET, { expiresIn: "12h" });
    const res = NextResponse.json({ success: true });
    res.cookies.set("sa_token", token, { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
