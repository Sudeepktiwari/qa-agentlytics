import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const [scheme, token] = authHeader.split(" ");

    if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const sitemapUrlRaw = body?.sitemapUrl || body?.websiteUrl;

    if (typeof sitemapUrlRaw !== "string" || !sitemapUrlRaw.trim()) {
      return NextResponse.json(
        { error: "Missing sitemapUrl or websiteUrl" },
        { status: 400 }
      );
    }

    const sitemapUrl = sitemapUrlRaw.trim();
    const internalUrl = new URL("/api/sitemap", req.nextUrl.origin).toString();

    const resp = await fetch(internalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_token=${token}`,
      },
      body: JSON.stringify({ sitemapUrl }),
    });

    let data: any = null;
    try {
      data = await resp.json();
    } catch {
      data = null;
    }

    return NextResponse.json(
      data ?? { error: "Invalid response from crawl service" },
      { status: resp.status }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

