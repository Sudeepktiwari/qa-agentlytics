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
import puppeteer from "puppeteer";

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

async function extractLinksUsingBrowser(pageUrl: string): Promise<string[]> {
  console.log(`[JSCrawl] Starting JavaScript-enabled crawl for: ${pageUrl}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Set a reasonable viewport and user agent
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigate to the page with timeout
    console.log(`[JSCrawl] Loading page: ${pageUrl}`);
    await page.goto(pageUrl, {
      waitUntil: "networkidle2", // Wait until network is mostly idle
      timeout: 30000,
    });

    // Wait a bit more for any dynamic content to load
    console.log(`[JSCrawl] Waiting for dynamic content to load...`);
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Increased wait time

    // Check if page has loaded properly
    const pageTitle = await page.title();
    console.log(`[JSCrawl] Page loaded with title: ${pageTitle}`);

    // Extract all links from the rendered page
    const links = await page.evaluate((currentUrl) => {
      const linkElements = document.querySelectorAll("a[href]");
      const foundLinks = new Set<string>();

      console.log(
        `[JSCrawl-Browser] Found ${linkElements.length} link elements on page`
      );

      // Add the current page
      foundLinks.add(currentUrl);

      linkElements.forEach((element, index) => {
        const href = element.getAttribute("href");
        if (href) {
          try {
            // Convert relative URLs to absolute
            const absoluteUrl = new URL(href, currentUrl).href;
            const linkUrl = new URL(absoluteUrl);
            const pageUrlObj = new URL(currentUrl);

            // Only include same-domain HTTP/HTTPS URLs
            if (
              linkUrl.protocol.startsWith("http") &&
              linkUrl.hostname === pageUrlObj.hostname
            ) {
              // Clean up the URL
              let cleanUrl = absoluteUrl.split("#")[0];

              // Remove tracking parameters
              const url = new URL(cleanUrl);
              const paramsToRemove = [
                "utm_source",
                "utm_medium",
                "utm_campaign",
                "utm_term",
                "utm_content",
                "ref",
                "source",
              ];
              paramsToRemove.forEach((param) => url.searchParams.delete(param));
              cleanUrl = url.toString();

              // Skip file extensions we can't crawl
              const extension = cleanUrl.split(".").pop()?.toLowerCase();
              const skipExtensions = [
                "pdf",
                "doc",
                "docx",
                "jpg",
                "jpeg",
                "png",
                "gif",
                "svg",
                "mp4",
                "mp3",
                "css",
                "js",
                "ico",
              ];

              const hasSkipExtension =
                extension && skipExtensions.includes(extension);

              // Skip common non-content URLs
              const skipPatterns = [
                "/wp-admin/",
                "/admin/",
                "/login",
                "/register/",
                "/contact",
                "/privacy",
                "/terms",
                "mailto:",
                "tel:",
              ];
              const hasSkipPattern = skipPatterns.some((pattern) =>
                cleanUrl.includes(pattern)
              );

              if (
                !hasSkipExtension &&
                !hasSkipPattern &&
                cleanUrl !== currentUrl
              ) {
                foundLinks.add(cleanUrl);

                // Log blog-related links as we find them
                if (
                  cleanUrl.includes("/blog") ||
                  cleanUrl.includes("/post") ||
                  cleanUrl.includes("/article")
                ) {
                  console.log(
                    `[JSCrawl-Browser] Found blog link ${
                      index + 1
                    }: ${cleanUrl}`
                  );
                }
              }
            }
          } catch {
            // Skip invalid URLs
            console.log("[JSCrawl-Browser] Skipping invalid URL:", href);
          }
        }
      });

      const allLinks = Array.from(foundLinks);
      const blogLinks = allLinks.filter(
        (url) =>
          url.includes("/blog") ||
          url.includes("/post") ||
          url.includes("/article")
      );

      console.log(
        `[JSCrawl-Browser] Total links extracted: ${allLinks.length}`
      );
      console.log(`[JSCrawl-Browser] Blog-related links: ${blogLinks.length}`);

      return allLinks;
    }, pageUrl);

    console.log(
      `[JSCrawl] Found ${links.length} links with JavaScript rendering`
    );

    // Log blog-related URLs specifically
    const blogUrls = links.filter(
      (url) =>
        url.includes("/blog") ||
        url.includes("/post") ||
        url.includes("/article")
    );
    console.log(
      `[JSCrawl] Blog-related URLs found: ${blogUrls.length}`,
      blogUrls
    );

    return links;
  } catch (error) {
    console.error(`[JSCrawl] Error during JavaScript crawling:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function extractLinksFromPage(pageUrl: string): Promise<string[]> {
  const res = await fetch(pageUrl);
  if (!res.ok) throw new Error(`Failed to fetch page: ${pageUrl}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const links = new Set<string>();

  // Add the original page itself
  links.add(pageUrl);

  // Extract all links from the page with more comprehensive selectors
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
          // Remove fragments and query parameters for cleaner URLs
          let cleanUrl = absoluteUrl.split("#")[0];
          // Remove common tracking parameters but keep important query params
          const url = new URL(cleanUrl);
          const paramsToRemove = [
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_term",
            "utm_content",
            "ref",
            "source",
          ];
          paramsToRemove.forEach((param) => url.searchParams.delete(param));
          cleanUrl = url.toString();

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
            "css",
            "js",
            "ico",
            "woff",
            "woff2",
            "ttf",
            "eot",
          ];

          // Skip URLs that end with file extensions we can't crawl
          const hasSkipExtension =
            extension && skipExtensions.includes(extension);

          // Skip common non-content URLs
          const skipPatterns = [
            "/wp-admin/",
            "/admin/",
            "/login",
            "/register",
            "/contact",
            "/privacy",
            "/terms",
            "/sitemap",
            "mailto:",
            "tel:",
            "#",
          ];

          const hasSkipPattern = skipPatterns.some((pattern) =>
            cleanUrl.includes(pattern)
          );

          if (!hasSkipExtension && !hasSkipPattern && cleanUrl !== pageUrl) {
            links.add(cleanUrl);
            console.log(`[LinkExtract] Found link: ${cleanUrl}`);
          }
        }
      } catch {
        // Skip invalid URLs
        console.log(`[LinkExtract] Skipping invalid URL: ${href}`);
      }
    }
  });

  // Also look for common blog/article patterns in URLs
  const blogPatterns = ["/blog/", "/post/", "/article/", "/news/"];
  const pageLinks = Array.from(links);

  console.log(
    `[LinkExtract] Total links found on ${pageUrl}: ${pageLinks.length}`
  );
  console.log(
    `[LinkExtract] Blog-like URLs found:`,
    pageLinks.filter((url) =>
      blogPatterns.some((pattern) => url.includes(pattern))
    )
  );

  return pageLinks;
}

async function discoverUrls(
  inputUrl: string
): Promise<{ urls: string[]; type: "sitemap" | "webpage" | "javascript" }> {
  console.log(`[Discovery] Starting discovery for: ${inputUrl}`);

  // First, try to parse as sitemap
  try {
    const urls = await parseSitemap(inputUrl);
    if (urls.length > 0) {
      console.log(`[Discovery] Found ${urls.length} URLs in sitemap`);
      console.log(`[Discovery] Sample URLs:`, urls.slice(0, 5));
      return { urls, type: "sitemap" };
    }
  } catch (error) {
    console.log(`[Discovery] Not a valid sitemap, trying as webpage: ${error}`);
  }

  // If sitemap parsing fails, try regular HTML crawling first
  try {
    const urls = await extractLinksFromPage(inputUrl);
    console.log(
      `[Discovery] Found ${urls.length} URLs by crawling webpage links`
    );

    // Show breakdown by URL patterns
    const blogUrls = urls.filter((url) => url.includes("/blog"));
    const postUrls = urls.filter((url) => url.includes("/post"));
    const articleUrls = urls.filter((url) => url.includes("/article"));

    console.log(`[Discovery] Blog URLs (${blogUrls.length}):`, blogUrls);
    console.log(`[Discovery] Post URLs (${postUrls.length}):`, postUrls);
    console.log(
      `[Discovery] Article URLs (${articleUrls.length}):`,
      articleUrls
    );

    // Check if we found meaningful content or if we should try JavaScript rendering
    const contentUrls = blogUrls.length + postUrls.length + articleUrls.length;
    const totalUrls = urls.length;

    // If the page seems to be a blog/content page but we found very few content URLs,
    // or if the page content seems minimal, try JavaScript rendering
    const isLikelyContentPage =
      inputUrl.includes("/blog") ||
      inputUrl.includes("/post") ||
      inputUrl.includes("/article");
    const hasMinimalContent = totalUrls <= 10; // Very few links found
    const hasMinimalBlogContent = contentUrls <= 3; // Very few blog/post/article URLs found

    // Enhanced logic: trigger JS rendering if it's a likely content page AND either:
    // 1. We found very few total links, OR
    // 2. We found very few blog-specific content URLs (even if total links is high)
    // 3. OR it's specifically a "/blogs" page (common pattern for blog listing pages)
    const isBlogListingPage =
      inputUrl.includes("/blogs") && !inputUrl.includes("/blogs/");

    if (
      isLikelyContentPage &&
      (hasMinimalContent ||
        hasMinimalBlogContent ||
        contentUrls === 0 ||
        isBlogListingPage)
    ) {
      console.log(
        `[Discovery] Detected potential JavaScript-rendered content page. ` +
          `Total URLs: ${totalUrls}, Content URLs: ${contentUrls}, Is blog listing: ${isBlogListingPage}. Trying JS crawling...`
      );

      try {
        const jsUrls = await extractLinksUsingBrowser(inputUrl);
        const jsBlogUrls = jsUrls.filter((url: string) =>
          url.includes("/blog")
        );
        const jsPostUrls = jsUrls.filter((url: string) =>
          url.includes("/post")
        );
        const jsArticleUrls = jsUrls.filter((url: string) =>
          url.includes("/article")
        );
        const jsContentUrls =
          jsBlogUrls.length + jsPostUrls.length + jsArticleUrls.length;

        // If JavaScript rendering found more content URLs, use those results
        if (jsUrls.length > totalUrls || jsContentUrls > contentUrls) {
          console.log(
            `[Discovery] JavaScript rendering found more content! Using JS results.`
          );
          console.log(
            `[Discovery] JS Blog URLs (${jsBlogUrls.length}):`,
            jsBlogUrls
          );
          console.log(
            `[Discovery] JS Post URLs (${jsPostUrls.length}):`,
            jsPostUrls
          );
          console.log(
            `[Discovery] JS Article URLs (${jsArticleUrls.length}):`,
            jsArticleUrls
          );
          return { urls: jsUrls, type: "javascript" };
        }
      } catch (jsError) {
        console.log(
          `[Discovery] JavaScript crawling failed, falling back to regular results:`,
          jsError
        );
      }
    }

    console.log(`[Discovery] All discovered URLs:`, urls);
    return { urls, type: "webpage" };
  } catch (error) {
    console.log(`[Discovery] Error during webpage link extraction:`, error);
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

  // Try regular extraction first
  try {
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

    // If the text is too short and this looks like a dynamic page, try JavaScript extraction
    if (
      text.length < 200 &&
      (url.includes("/blog") ||
        url.includes("/post") ||
        url.includes("/article"))
    ) {
      console.log(
        `[Crawl] Content seems minimal (${text.length} chars), trying JavaScript extraction...`
      );
      try {
        const jsText = await extractTextUsingBrowser(url);
        if (jsText.length > text.length) {
          console.log(
            `[Crawl] JavaScript extraction found more content (${jsText.length} vs ${text.length} chars)`
          );
          return jsText;
        }
      } catch (jsError) {
        console.log(
          `[Crawl] JavaScript extraction failed, using regular content:`,
          jsError
        );
      }
    }

    // If the text is too short (likely a redirect page), log it
    if (text.length < 100) {
      console.log(
        `[Crawl] Warning: Very short content for ${url} (${
          text.length
        } chars): ${text.substring(0, 100)}`
      );
    }

    return text;
  } catch (error) {
    console.log(
      `[Crawl] Regular extraction failed for ${url}, trying JavaScript extraction:`,
      error
    );
    // If regular extraction fails completely, try JavaScript as fallback
    try {
      return await extractTextUsingBrowser(url);
    } catch (jsError) {
      console.error(
        `[Crawl] Both regular and JavaScript extraction failed for ${url}:`,
        jsError
      );
      throw error; // Throw the original error
    }
  }
}

async function extractTextUsingBrowser(url: string): Promise<string> {
  console.log(`[JSExtract] Starting JavaScript text extraction for: ${url}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigate and wait for content to load
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for dynamic content
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Extract text content from the rendered page
    const text = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll("script, style, noscript");
      scripts.forEach((el) => el.remove());

      // Get the main content text
      const bodyText = document.body?.innerText || "";

      // Clean up whitespace
      return bodyText.replace(/\s+/g, " ").trim();
    });

    console.log(
      `[JSExtract] Extracted ${text.length} characters with JS rendering`
    );

    return text;
  } catch (error) {
    console.error(
      `[JSExtract] Error during JavaScript text extraction:`,
      error
    );
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
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
  let discoveryType: "sitemap" | "webpage" | "javascript" = "sitemap";
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

  // Store all sitemap URLs for this admin with the specific sitemapUrl context
  const now = new Date();
  const sitemapUrlDocs = urls.map((url) => ({
    adminId,
    url,
    sitemapUrl, // This ensures each sitemap submission is tracked separately
    addedAt: now,
    crawled: false,
    discoveryType, // Track how this URL was discovered
  }));
  if (sitemapUrlDocs.length > 0) {
    for (const doc of sitemapUrlDocs) {
      await sitemapUrls.updateOne(
        { adminId: doc.adminId, url: doc.url, sitemapUrl: doc.sitemapUrl }, // Include sitemapUrl in the query
        { $setOnInsert: doc },
        { upsert: true }
      );
    }
  }

  // Find already crawled URLs for this specific admin/sitemapUrl combination
  const crawledDocs = await sitemapUrls
    .find({ adminId, sitemapUrl, crawled: true }) // This now only looks at URLs from this specific sitemap submission
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
        { adminId, url: doc.url, sitemapUrl }, // Include sitemapUrl in the query
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
      // Mark as crawled in sitemap_urls with specific sitemapUrl context
      await sitemapUrls.updateOne(
        { adminId, url, sitemapUrl }, // Include sitemapUrl to ensure proper tracking
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
        { adminId, url, sitemapUrl }, // Include sitemapUrl for proper tracking
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
      .project({
        _id: 0,
        url: 1,
        crawled: 1,
        crawledAt: 1,
        sitemapUrl: 1,
        discoveryType: 1,
      })
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
