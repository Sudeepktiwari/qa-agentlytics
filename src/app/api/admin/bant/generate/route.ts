import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import { generateBantFromContent } from "@/lib/bant-generation";

export async function POST(request: NextRequest) {
  try {
    const authResult = verifyAdminAccessFromCookie(request);
    if (!authResult.isValid || !authResult.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adminId } = authResult;
    const db = await getDb();

    // Fetch crawled pages to understand the business
    const crawledPagesCollection = db.collection("crawled_pages");
    const pages = await crawledPagesCollection
      .find({ adminId })
      .sort({ created_at: -1 })
      .limit(10) // Use top 10 most recent pages to get a good idea of the business
      .toArray();

    if (!pages || pages.length === 0) {
      return NextResponse.json(
        {
          error:
            "No crawled website data found. Please crawl your website first.",
        },
        { status: 400 },
      );
    }

    // Prepare context from crawled pages
    const context = pages
      .map(
        (p) =>
          `URL: ${p.url}\nTitle: ${p.title}\nContent Summary: ${p.text.substring(0, 500)}...`,
      )
      .join("\n\n");

    const newConfig = await generateBantFromContent(adminId, context);

    // Note: We are NOT saving to DB here, just returning the generated config
    // The user must explicitly save it in the UI.

    return NextResponse.json({ config: newConfig });
  } catch (error) {
    console.error("Error generating BANT questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 },
    );
  }
}
