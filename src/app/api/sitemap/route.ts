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

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const MAX_PAGES = 20;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

async function extractTextFromUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch page: ${url}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let adminId = "";
  let email = "";
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    email = payload.email;
    adminId = payload.adminId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { sitemapUrl } = await req.json();
  if (!sitemapUrl)
    return NextResponse.json({ error: "Missing sitemapUrl" }, { status: 400 });

  let urls: string[] = [];
  try {
    urls = await parseSitemap(sitemapUrl);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to parse sitemap" },
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
  const crawledUrls = new Set(crawledDocs.map((doc) => doc.url));

  // Select the next batch of uncrawled URLs (up to MAX_PAGES)
  const uncrawledUrls = urls
    .filter((url) => !crawledUrls.has(url))
    .slice(0, MAX_PAGES);

  const results: { url: string; text: string }[] = [];
  let totalChunks = 0;
  for (const url of uncrawledUrls) {
    try {
      const text = await extractTextFromUrl(url);
      results.push({ url, text });
      await pages.insertOne({
        adminId,
        email,
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
      // Chunk and embed for ChromaDB
      const chunks = chunkText(text);
      if (chunks.length > 0) {
        const embedResp = await openai.embeddings.create({
          input: chunks,
          model: "text-embedding-3-small",
        });
        const embeddings = embedResp.data.map((d: any) => d.embedding);
        const metadata = chunks.map((_, i) => ({
          filename: url,
          adminId,
          url,
          chunkIndex: i,
        }));
        await addChunks(chunks, embeddings, metadata);
        totalChunks += chunks.length;
      }
    } catch {
      // Skip failed pages
    }
  }

  return NextResponse.json({
    crawled: results.length,
    totalChunks,
    pages: results.map((r) => r.url),
    batchDone: uncrawledUrls.length,
    batchRemaining: urls.length - crawledUrls.size - uncrawledUrls.length,
    totalRemaining: urls.length - crawledUrls.size - uncrawledUrls.length,
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
  let email = "";
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    email = payload.email;
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
  let email = "";
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    email = payload.email;
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
