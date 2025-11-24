import { NextRequest } from "next/server";
import { POST as ChatPOST } from "../chat/route";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = new URL(req.url);
  const headers = new Headers(req.headers);
  headers.set("X-Widget-Mode", "onboarding_only");
  const newReq = new Request(url.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  // Cast Request to NextRequest-compatible type for downstream usage
  return ChatPOST(newReq as any);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization, X-Widget-Mode",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}