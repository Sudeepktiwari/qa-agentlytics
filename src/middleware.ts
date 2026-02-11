import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken"; // Unused in middleware, removed to prevent Edge Runtime issues

const RATE_LIMIT = 100; // requests
const WINDOW_MS = 60 * 1000; // 1 minute
const ipCounters = new Map<string, { count: number; start: number }>();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/")) return NextResponse.next();

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  let entry = ipCounters.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    entry = { count: 1, start: now };
  } else {
    entry.count++;
  }
  ipCounters.set(ip, entry);
  if (entry.count > RATE_LIMIT) {
    return new NextResponse("Rate limit exceeded", { status: 429 });
  }

  // Auth checks are now handled in individual route handlers to avoid Edge Runtime issues with jsonwebtoken
  // and to support cookie-based auth consistently.

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
