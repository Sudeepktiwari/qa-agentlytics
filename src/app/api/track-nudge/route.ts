import { NextRequest, NextResponse } from "next/server";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // You can store this in a DB or analytics service; for now, just log it
  console.log("[Nudge Analytics] Button click event:", body);
  return NextResponse.json({ status: "ok" }, { headers: corsHeaders });
}
