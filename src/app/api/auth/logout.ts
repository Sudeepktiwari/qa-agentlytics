import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  // Try to extract user info from auth_token cookie
  const token = req.cookies.get("auth_token")?.value;
  let userInfo: { email?: string; adminId?: string } = {};
  if (token) {
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || "dev_secret"
      ) as { email?: string; adminId?: string };
      userInfo = { email: payload.email, adminId: payload.adminId };
    } catch {
      // Invalid token, ignore
    }
  }
  console.log("Logout request", {
    time: new Date().toISOString(),
    user: userInfo,
    ip: req.headers.get("x-forwarded-for") || "unknown",
  });
  const res = NextResponse.json({ success: true });
  res.cookies.set("auth_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
