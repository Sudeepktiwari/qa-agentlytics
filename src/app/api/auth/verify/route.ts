import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  console.log("🔍 Auth verify - Token present:", !!token);
  console.log("🔍 Auth verify - Token value:", token ? "***" + token.slice(-10) : "none");
  
  if (!token) {
    console.log("❌ Auth verify - No token found in cookies");
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    console.log("✅ Auth verify - Token valid for user:", payload.email);
    return NextResponse.json({
      email: payload.email,
      adminId: payload.adminId,
    });
  } catch (error) {
    console.log("❌ Auth verify - Token verification failed:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
