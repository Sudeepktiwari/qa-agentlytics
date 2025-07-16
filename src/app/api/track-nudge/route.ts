import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // You can store this in a DB or analytics service; for now, just log it
  console.log("[Nudge Analytics] Button click event:", body);
  return NextResponse.json({ status: "ok" });
}
