import type { NextResponse } from "next/server";
import { POST as ChatPOST, OPTIONS as ChatOPTIONS } from "../chat/route";

export async function OPTIONS(req: Request) {
  if (typeof ChatOPTIONS === "function") {
    // Delegate to chat route OPTIONS for consistent CORS
    return (ChatOPTIONS as any)(req);
  }
  return new Response(null, { status: 200 });
}

export async function POST(req: Request) {
  const headers = new Headers(req.headers);
  if (!headers.get("x-widget-mode") && !headers.get("X-Widget-Mode")) {
    headers.set("X-Widget-Mode", "onboarding_only");
  }
  const bodyText = await req.text();
  const forwarded = new Request(req.url.replace(/\/onboarding-chat\b/, "/chat"), {
    method: req.method,
    headers,
    body: bodyText,
  });
  return (ChatPOST as any)(forwarded);
}