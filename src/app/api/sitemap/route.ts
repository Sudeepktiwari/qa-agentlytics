import { NextRequest, NextResponse } from "next/server";
import { getDb, getAdminSettingsCollection } from "@/lib/mongo";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { chunkText } from "@/lib/chunkText";
import {
  addChunks,
  deleteChunksByFilename,
  deleteChunksByUrl,
} from "@/lib/chroma";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const MAX_PAGES = 20;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_KEY!,
});
const index = pinecone.index(process.env.PINECONE_INDEX!);

async function parseSitemap(sitemapUrl: string): Promise<string[]> {
  const res = await fetch(sitemapUrl);
  if (!res.ok) throw new Error("Failed to fetch sitemap");
  const xml = await res.text();
  const urls: string[] = [];
  const matches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
  for (const match of matches) {
    urls.push(match[1]);
  }
  return urls;
}

async function extractLinksFromPage(pageUrl: string): Promise<string[]> {
  const res = await fetch(pageUrl);
  if (!res.ok) throw new Error(`Failed to fetch page: ${pageUrl}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const links = new Set<string>();

  // Add the original page itself
  links.add(pageUrl);

  // Extract all links from the page
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (href) {
      try {
        // Convert relative URLs to absolute
        const absoluteUrl = new URL(href, pageUrl).href;

        // Only include HTTP/HTTPS URLs from the same domain
        const pageUrlObj = new URL(pageUrl);
        const linkUrlObj = new URL(absoluteUrl);

        if (
          linkUrlObj.protocol.startsWith("http") &&
          linkUrlObj.hostname === pageUrlObj.hostname
        ) {
          // Remove fragments and common file extensions we can't crawl
          const cleanUrl = absoluteUrl.split("#")[0];
          const extension = cleanUrl.split(".").pop()?.toLowerCase();
          const skipExtensions = [
            "pdf",
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
            "zip",
            "rar",
            "exe",
            "dmg",
            "jpg",
            "jpeg",
            "png",
            "gif",
            "svg",
            "mp4",
            "mp3",
            "avi",
            "mov",
          ];

          if (!extension || !skipExtensions.includes(extension)) {
            links.add(cleanUrl);
          }
        }
      } catch {
        // Skip invalid URLs
        console.log(`[LinkExtract] Skipping invalid URL: ${href}`);
      }
    }
  });

  return Array.from(links);
}

async function discoverUrls(
  inputUrl: string
): Promise<{ urls: string[]; type: "sitemap" | "webpage" }> {
  // First, try to parse as sitemap
  try {
    const urls = await parseSitemap(inputUrl);
    if (urls.length > 0) {
      console.log(`[Discovery] Found ${urls.length} URLs in sitemap`);
      return { urls, type: "sitemap" };
    }
  } catch (error) {
    console.log(`[Discovery] Not a valid sitemap, trying as webpage: ${error}`);
  }

  // If sitemap parsing fails, extract links from the page
  try {
    const urls = await extractLinksFromPage(inputUrl);
    console.log(
      `[Discovery] Found ${urls.length} URLs by crawling webpage links`
    );
    return { urls, type: "webpage" };
  } catch (error) {
    throw new Error(`Failed to discover URLs from ${inputUrl}: ${error}`);
  }
}

async function extractTextFromUrl(
  url: string,
  depth: number = 0
): Promise<string> {
  // Prevent infinite redirect loops
  if (depth > 5) {
    console.log(`[Crawl] Max redirect depth reached for ${url}`);
    throw new Error(`Too many redirects for ${url}`);
  }

  const res = await fetch(url, { follow: 20 }); // Follow up to 20 HTTP redirects
  if (!res.ok) throw new Error(`Failed to fetch page: ${url}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Check for HTML meta redirects
  const metaRefresh = $('meta[http-equiv="refresh"]').attr("content");
  if (metaRefresh) {
    const match = metaRefresh.match(/url=(.+)$/i);
    if (match) {
      let redirectUrl = match[1].trim();
      console.log(
        `[Crawl] Following meta redirect from ${url} to ${redirectUrl}`
      );

      // Handle relative URLs by converting to absolute
      if (!redirectUrl.startsWith("http")) {
        try {
          const baseUrl = new URL(url);
          redirectUrl = new URL(redirectUrl, baseUrl.origin).href;
          console.log(
            `[Crawl] Converted relative URL to absolute: ${redirectUrl}`
          );
        } catch (urlError) {
          console.log(
            `[Crawl] Failed to convert relative URL: ${redirectUrl}`,
            urlError
          );
          // If URL conversion fails, proceed with original content
        }
      }

      // Recursively fetch the redirect URL (with a simple depth limit)
      if (redirectUrl.startsWith("http")) {
        return extractTextFromUrl(redirectUrl, depth + 1);
      }
    }
  }

  $("script, style, noscript").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();

  // If the text is too short (likely a redirect page), log it
  if (text.length < 100) {
    console.log(
      `[Crawl] Warning: Very short content for ${url} (${
        text.length
      } chars): ${text.substring(0, 100)}`
    );
  }

  return text;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let adminId = "";
  try {
    const payload = jwt.verify(token!, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    adminId = payload.adminId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { sitemapUrl } = await req.json();
  if (!sitemapUrl)
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });

  let urls: string[] = [];
  let discoveryType: "sitemap" | "webpage" = "sitemap";
  try {
    const result = await discoverUrls(sitemapUrl);
    urls = result.urls;
    discoveryType = result.type;
    console.log(`[Crawl] Discovered ${urls.length} URLs via ${discoveryType}`);
  } catch (error) {
    console.error(`[Crawl] Discovery failed:`, error);
    return NextResponse.json(
      { error: `Failed to discover URLs from the provided link: ${error}` },
      { status: 400 }
    );
  }

  const db = await getDb();
  const pages = db.collection("crawled_pages");
  const sitemapUrls = db.collection("sitemap_urls");
  const adminSettings = await getAdminSettingsCollection();

  // Store the last submitted sitemapUrl for this admin
  await adminSettings.updateOne(
    { adminId },
    { $set: { lastSitemapUrl: sitemapUrl } },
    { upsert: true }
  );

  // Store all sitemap URLs for this admin (if not already present)
  const now = new Date();
  const sitemapUrlDocs = urls.map((url) => ({
    adminId,
    url,
    sitemapUrl,
    addedAt: now,
    crawled: false,
  }));
  if (sitemapUrlDocs.length > 0) {
    for (const doc of sitemapUrlDocs) {
      await sitemapUrls.updateOne(
        { adminId: doc.adminId, url: doc.url },
        { $setOnInsert: doc },
        { upsert: true }
      );
    }
  }

  // Find already crawled URLs for this admin/sitemap
  const crawledDocs = await sitemapUrls
    .find({ adminId, sitemapUrl, crawled: true })
    .toArray();

  // Also check for pages that were marked as crawled but have no chunks in Pinecone
  // This can happen if they were redirect pages or had errors during processing
  const pineconeVectors = db.collection("pinecone_vectors");
  const problematicUrls: string[] = [];

  console.log(
    `[Crawl] Checking ${crawledDocs.length} crawled URLs for missing vectors`
  );
  for (const doc of crawledDocs) {
    // Check if vectors exist in Pinecone by trying to fetch them
    const vectorIds = await pineconeVectors
      .find({ adminId, filename: doc.url })
      .project({ vectorId: 1, _id: 0 })
      .toArray();

    if (vectorIds.length === 0) {
      console.log(`[Crawl] URL ${doc.url} has no MongoDB vector records`);
      problematicUrls.push(doc.url);
    } else {
      // Check if the vectors actually exist in Pinecone
      try {
        const vectorIdList = vectorIds.map(
          (v) => (v as { vectorId: string }).vectorId
        );
        const result = await index.fetch(vectorIdList);
        const foundVectors = Object.keys(result.records || {}).length;
        console.log(
          `[Crawl] URL ${doc.url} has ${vectorIds.length} MongoDB records, ${foundVectors} Pinecone vectors`
        );

        if (foundVectors === 0) {
          console.log(
            `[Crawl] URL ${doc.url} has MongoDB records but no Pinecone vectors - will re-crawl`
          );
          problematicUrls.push(doc.url);
        }
      } catch (pineconeError) {
        console.log(
          `[Crawl] Error checking Pinecone for ${doc.url}:`,
          pineconeError
        );
        problematicUrls.push(doc.url);
      }
    }

    if (problematicUrls.includes(doc.url)) {
      // Reset the crawled status so it can be re-crawled
      await sitemapUrls.updateOne(
        { adminId, url: doc.url },
        {
          $unset: { crawled: 1, crawledAt: 1 },
          $set: { recrawlReason: "no_pinecone_vectors", recrawlAt: new Date() },
        }
      );
    }
  }

  // Recalculate crawled URLs after reset
  const updatedCrawledDocs = await sitemapUrls
    .find({ adminId, sitemapUrl, crawled: true })
    .toArray();
  const updatedCrawledUrls = new Set(updatedCrawledDocs.map((doc) => doc.url));

  // Select the next batch of uncrawled URLs (up to MAX_PAGES)
  const uncrawledUrls = urls
    .filter((url) => !updatedCrawledUrls.has(url))
    .slice(0, MAX_PAGES);

  console.log(
    `[Crawl] Found ${problematicUrls.length} problematic URLs to re-crawl`
  );
  console.log(`[Crawl] Will crawl ${uncrawledUrls.length} URLs in this batch`);

  const results: { url: string; text: string }[] = [];
  let totalChunks = 0;
  for (const url of uncrawledUrls) {
    try {
      console.log(`[Crawl] Starting to crawl: ${url}`);
      const text = await extractTextFromUrl(url);
      console.log(
        `[Crawl] Extracted text for ${url}: ${
          text.length
        } chars, first 100: ${text.slice(0, 100)}`
      );
      results.push({ url, text });
      await pages.insertOne({
        adminId,
        url,
        text,
        filename: url,
        createdAt: new Date(),
      });
      // Mark as crawled in sitemap_urls
      await sitemapUrls.updateOne(
        { adminId, url },
        { $set: { crawled: true, crawledAt: new Date() } }
      );
      // Chunk and embed for Pinecone
      const chunks = chunkText(text);
      console.log(`[Crawl] Chunks for ${url}:`, chunks.length);
      if (chunks.length > 0) {
        const embedResp = await openai.embeddings.create({
          input: chunks,
          model: "text-embedding-3-small",
        });
        const embeddings = embedResp.data.map(
          (d: { embedding: number[] }) => d.embedding
        );
        const metadata = chunks.map((_, i) => ({
          filename: url,
          adminId,
          url,
          chunkIndex: i,
        }));
        console.log(
          `[Crawl] Upserting to Pinecone:`,
          embeddings.length,
          metadata.length
        );
        await addChunks(chunks, embeddings, metadata);
        totalChunks += chunks.length;
        console.log(
          `[Crawl] Successfully processed ${url}: ${chunks.length} chunks`
        );
      } else {
        console.log(
          `[Crawl] No chunks created for ${url} - content may be too short or empty`
        );
      }
    } catch (err) {
      console.error(`[Crawl] Failed for ${url}:`, err);
      // Mark as failed in sitemap_urls (but don't set crawled to true)
      await sitemapUrls.updateOne(
        { adminId, url },
        {
          $set: {
            failedAt: new Date(),
            error: err instanceof Error ? err.message : String(err),
          },
        }
      );
    }
  }

  return NextResponse.json({
    crawled: results.length,
    totalChunks,
    pages: results.map((r) => r.url),
    batchDone: results.length, // Number of pages successfully crawled in this batch
    batchRemaining: urls.length - updatedCrawledUrls.size - results.length, // Total remaining pages
    totalRemaining: urls.length - updatedCrawledUrls.size - results.length,
    recrawledPages: problematicUrls.length, // Show how many pages were reset for re-crawling
  });
}

export async function GET(req: NextRequest) {
  // If ?settings=1, return admin settings (last submitted sitemapUrl)
  if (req.nextUrl.searchParams.get("settings") === "1") {
    const token = req.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let adminId = "";
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        email: string;
        adminId: string;
      };
      adminId = payload.adminId;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const adminSettings = await getAdminSettingsCollection();
    const settings = await adminSettings.findOne({ adminId });
    return NextResponse.json({ settings });
  }
  // If ?urls=1, return all sitemap URLs for the current admin
  if (req.nextUrl.searchParams.get("urls") === "1") {
    const token = req.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let adminId = "";
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        email: string;
        adminId: string;
      };
      adminId = payload.adminId;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const db = await getDb();
    const sitemapUrls = db.collection("sitemap_urls");
    const urls = await sitemapUrls
      .find({ adminId })
      .project({ _id: 0, url: 1, crawled: 1, crawledAt: 1 })
      .toArray();
    return NextResponse.json({ urls });
  }
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let adminId = "";
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    adminId = payload.adminId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Pagination params
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(
    req.nextUrl.searchParams.get("pageSize") || "10",
    10
  );

  const db = await getDb();
  const pages = db.collection("crawled_pages");

  // Aggregate by sitemap (group by sitemapUrl/filename)
  const pipeline = [
    { $match: { adminId } },
    {
      $group: {
        _id: "$filename",
        count: { $sum: 1 },
        firstCrawled: { $min: "$createdAt" },
        urls: { $addToSet: "$url" },
      },
    },
    { $sort: { firstCrawled: -1 } },
    { $skip: (page - 1) * pageSize },
    { $limit: pageSize },
  ];
  const sitemaps = await pages.aggregate(pipeline).toArray();
  const total = await pages.distinct("filename", { adminId });

  return NextResponse.json({
    sitemaps: sitemaps.map((s) => ({
      sitemapUrl: s._id,
      count: s.count,
      firstCrawled: s.firstCrawled,
      urls: s.urls,
    })),
    total: total.length,
    page,
    pageSize,
  });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let adminId = "";
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    adminId = payload.adminId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { sitemapUrl, url } = await req.json();
  if (!sitemapUrl && !url)
    return NextResponse.json(
      { error: "Missing sitemapUrl or url" },
      { status: 400 }
    );

  const db = await getDb();
  const pages = db.collection("crawled_pages");

  let deleteCount = 0;
  if (sitemapUrl) {
    // Delete all pages for this sitemap
    const result = await pages.deleteMany({ adminId, filename: sitemapUrl });
    deleteCount = result.deletedCount || 0;
    await deleteChunksByFilename(sitemapUrl, adminId);
  } else if (url) {
    // Delete a single page
    const result = await pages.deleteMany({ adminId, url });
    deleteCount = result.deletedCount || 0;
    await deleteChunksByUrl(url, adminId);
  }

  return NextResponse.json({ success: true, deleted: deleteCount });
}
