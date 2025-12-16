import { NextRequest, NextResponse } from "next/server";
import { getDb, getAdminSettingsCollection } from "@/lib/mongo";
import { verifyApiKey } from "@/lib/auth";
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
const MAX_PAGES = 10; // Reduced for timeout protection
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_KEY!,
});
const index = pinecone.index(process.env.PINECONE_INDEX!);

// Auto-extract personas after crawling is complete
async function extractPersonasForAdmin(adminId: string, websiteUrl: string) {
  try {
    const db = await getDb();
    const crawledPages = db.collection("crawled_pages");
    const personas = db.collection("customer_personas");

    // Get crawled content for this admin
    const pages = await crawledPages
      .find({ adminId })
      .limit(20) // Limit to prevent token overflow
      .toArray();

    const websiteContent = pages.map((page) => page.text || "").filter(Boolean);

    if (websiteContent.length === 0) {
      console.log(`[Persona] No content found for adminId: ${adminId}`);
      return;
    }

    const prompt = `
Analyze this website content and extract detailed customer persona data. Focus on identifying who the target customers are, their characteristics, and buying patterns.

Website URL: ${websiteUrl}
Content: ${websiteContent.slice(0, 10).join("\n---\n")}

Extract and return a JSON object with this structure:
{
  "websiteUrl": "${websiteUrl}",
  "targetAudiences": [
    {
      "id": "unique_id",
      "name": "Persona Name",
      "type": "small_business|enterprise|startup|freelancer|agency",
      "industries": ["general"],
      "companySize": "1-10|11-50|51-200|200+",
      "painPoints": ["pain point 1", "pain point 2"],
      "preferredFeatures": ["feature1", "feature2"],
      "buyingPatterns": ["pattern1", "pattern2"],
      "budget": "under_500|500_2000|2000_10000|10000_plus",
      "technicalLevel": "beginner|intermediate|advanced",
      "urgency": "low|medium|high",
      "decisionMaker": true|false
    }
  ],
  "industryFocus": ["primary industries served"],
  "useCaseExamples": ["use case 1", "use case 2"],
  "competitorMentions": ["competitor1", "competitor2"],
  "pricingStrategy": "freemium|subscription|one_time|custom"
}

Guidelines:
- Create 2-4 distinct personas based on the content
- Be specific about pain points and preferred features
- Identify clear buying patterns and budget ranges
- Look for mentions of company sizes and use cases
- For "industries" field, use ["general"] unless the website is clearly industry-specific (e.g., a dental practice website). Do NOT assume specific industries from generic business content.
- Extract actual competitor names mentioned
- Determine pricing strategy from pricing pages or content
- Each persona should be distinct and actionable for messaging
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a customer persona analyst. Extract detailed, actionable customer personas from website content. Always return valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const extracted = JSON.parse(completion.choices[0].message.content || "{}");

    // Add timestamps and IDs to personas
    extracted.targetAudiences = extracted.targetAudiences.map(
      (persona: any, index: number) => ({
        ...persona,
        id: persona.id || `persona_${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    const personaDocument = {
      adminId,
      ...extracted,
      extractedAt: new Date(),
      updatedAt: new Date(),
    };

    await personas.replaceOne({ adminId }, personaDocument, { upsert: true });

    console.log(
      `[Persona] Successfully extracted ${extracted.targetAudiences.length} personas for adminId: ${adminId}`
    );
  } catch (error) {
    console.error(
      `[Persona] Error extracting personas for adminId ${adminId}:`,
      error
    );
    throw error;
  }
}

async function parseSitemap(sitemapUrl: string): Promise<string[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(sitemapUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error("Failed to fetch sitemap");
    const xml = await res.text();

    console.log(`[Sitemap] XML size: ${xml.length} characters`);

    const urls: string[] = [];
    const matches = xml.matchAll(/<loc>(.*?)<\/loc>/g);

    let matchCount = 0;
    for (const match of matches) {
      urls.push(match[1]);
      matchCount++;

      // Add protection against extremely large sitemaps
      if (matchCount % 1000 === 0) {
        console.log(`[Sitemap] Processed ${matchCount} URLs from sitemap...`);
      }

      // Limit sitemap size to prevent memory issues
      if (matchCount > 5000) {
        console.log(
          `[Sitemap] Limiting sitemap to first 5000 URLs to prevent timeout`
        );
        break;
      }
    }

    console.log(`[Sitemap] Total URLs extracted: ${urls.length}`);
    return urls;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Sitemap fetch timed out after 30 seconds");
    }
    throw error;
  }
}

async function discoverSitemapCandidates(inputUrl: string): Promise<string[]> {
  const candidates = new Set<string>();
  let origin = "";
  try {
    const u = new URL(inputUrl);
    origin = `${u.protocol}//${u.hostname}`;
  } catch {
    return [];
  }
  candidates.add(`${origin}/sitemap.xml`);
  candidates.add(`${origin}/sitemap_index.xml`);
  candidates.add(`${origin}/hc/sitemap.xml`);
  candidates.add(`${origin}/help/sitemap.xml`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`${origin}/robots.txt`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const text = await res.text();
      const lines = text.split("\n");
      for (const line of lines) {
        const m = line.match(/sitemap:\s*(\S+)/i);
        if (m && m[1]) {
          try {
            const sUrl = new URL(m[1], origin).href;
            candidates.add(sUrl);
          } catch {}
        }
      }
    }
  } catch {}
  return Array.from(candidates);
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
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Initial wait

    // Check if page has loaded properly
    const pageTitle = await page.title();
    console.log(`[JSCrawl] Page loaded with title: ${pageTitle}`);

    // Handle infinite scrolling by scrolling down multiple times
    console.log(`[JSCrawl] Handling infinite scrolling...`);
    let previousLinkCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 15; // Increased attempts for more thorough scrolling

    while (scrollAttempts < maxScrollAttempts) {
      // Get current link count and content-specific count
      const { currentLinkCount, currentContentCount } = await page.evaluate(
        () => {
          const allLinks = document.querySelectorAll("a[href]").length;

          // Intelligent content detection in browser
          const contentPatterns = [
            /\/blog\//i,
            /\/post\//i,
            /\/article\//i,
            /\/slide\//i,
            /\/news\//i,
            /\/help\//i,
            /\/guide\//i,
            /\/tutorial\//i,
            /\/docs?\//i,
            /\/support\//i,
            /\/resource\//i,
            /\/case-stud/i,
            /\/faq\//i,
          ];

          const contentLinks = Array.from(
            document.querySelectorAll("a[href]")
          ).filter((el) => {
            const href = el.getAttribute("href");
            return (
              href && contentPatterns.some((pattern) => pattern.test(href))
            );
          }).length;

          return {
            currentLinkCount: allLinks,
            currentContentCount: contentLinks,
          };
        }
      );

      console.log(
        `[JSCrawl] Scroll attempt ${
          scrollAttempts + 1
        }: Found ${currentLinkCount} total links, ${currentContentCount} content links`
      );

      // If no new links were loaded after scrolling, try a few more times
      if (scrollAttempts > 2 && currentLinkCount === previousLinkCount) {
        console.log(
          `[JSCrawl] No new content loaded, trying 2 more attempts...`
        );
        // Try scrolling more aggressively
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight + 1000);
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const { finalLinkCount } = await page.evaluate(() => {
          return {
            finalLinkCount: document.querySelectorAll("a[href]").length,
          };
        });

        if (finalLinkCount === currentLinkCount) {
          console.log(
            `[JSCrawl] Still no new content, stopping infinite scroll`
          );
          break;
        }
      }

      previousLinkCount = currentLinkCount;

      // Scroll to bottom of page with multiple strategies
      await page.evaluate(() => {
        // Strategy 1: Scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);

        // Strategy 2: Also try scrolling the document element
        if (
          document.documentElement.scrollHeight > document.body.scrollHeight
        ) {
          window.scrollTo(0, document.documentElement.scrollHeight);
        }

        // Strategy 3: Smooth scroll to trigger lazy loading
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });

        // Strategy 4: Trigger scroll events that might activate infinite scroll
        window.dispatchEvent(new Event("scroll"));
        document.dispatchEvent(new Event("scroll"));
      });

      // Wait for new content to load with progressive waiting
      console.log(`[JSCrawl] Waiting for new content after scroll...`);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Initial wait

      // Check if there are loading indicators and wait longer if needed
      const hasLoadingIndicators = await page.evaluate(() => {
        const loadingSelectors = [
          '[class*="loading"]',
          '[class*="spinner"]',
          '[class*="loader"]',
          ".loading",
          ".spinner",
          ".loader",
        ];

        return loadingSelectors.some((selector) => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).some((el) => {
            const htmlEl = el as HTMLElement;
            return htmlEl.offsetHeight > 0 && htmlEl.offsetWidth > 0; // Element is visible
          });
        });
      });

      if (hasLoadingIndicators) {
        console.log(`[JSCrawl] Loading indicators detected, waiting longer...`);
        await new Promise((resolve) => setTimeout(resolve, 4000));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      scrollAttempts++;
    }

    console.log(
      `[JSCrawl] Finished scrolling after ${scrollAttempts} attempts`
    );

    // Get final counts after all scrolling
    const finalCounts = await page.evaluate(() => {
      const allLinks = document.querySelectorAll("a[href]").length;

      // Use the same intelligent content detection
      const contentPatterns = [
        /\/blog\//i,
        /\/post\//i,
        /\/article\//i,
        /\/slide\//i,
        /\/news\//i,
        /\/help\//i,
        /\/guide\//i,
        /\/tutorial\//i,
        /\/docs?\//i,
        /\/support\//i,
        /\/resource\//i,
        /\/case-stud/i,
        /\/faq\//i,
      ];

      const contentLinks = Array.from(
        document.querySelectorAll("a[href]")
      ).filter((el) => {
        const href = el.getAttribute("href");
        return href && contentPatterns.some((pattern) => pattern.test(href));
      }).length;

      return { totalLinks: allLinks, contentLinks };
    });

    console.log(
      `[JSCrawl] Final counts after infinite scroll: ${finalCounts.totalLinks} total links, ${finalCounts.contentLinks} content links`
    );

    // Extract all links from the rendered page with enhanced deduplication
    const links = await page.evaluate((currentUrl) => {
      const linkElements = document.querySelectorAll("a[href]");
      const foundLinks = new Set<string>();
      const processedHrefs = new Set<string>(); // Track processed hrefs to avoid duplicates

      console.log(
        `[JSCrawl-Browser] Found ${linkElements.length} link elements on page`
      );

      // Add the current page
      foundLinks.add(currentUrl);

      linkElements.forEach((element, index) => {
        const href = element.getAttribute("href");
        if (href && !processedHrefs.has(href)) {
          // Skip if we've already processed this href
          processedHrefs.add(href);

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
                cleanUrl !== currentUrl &&
                !foundLinks.has(cleanUrl) // Additional check to prevent duplicates
              ) {
                foundLinks.add(cleanUrl);

                // Log content-related links as we find them (but only first few to avoid spam)
                const contentPatterns = [
                  /\/blog\//i,
                  /\/post\//i,
                  /\/article\//i,
                  /\/slide\//i,
                  /\/news\//i,
                  /\/help\//i,
                  /\/guide\//i,
                  /\/tutorial\//i,
                  /\/docs?\//i,
                  /\/support\//i,
                  /\/resource\//i,
                  /\/case-stud/i,
                  /\/faq\//i,
                ];

                const matchedPattern = contentPatterns.find((pattern) =>
                  pattern.test(cleanUrl)
                );
                if (matchedPattern && index < 20) {
                  // Only log first 20 content links to avoid spam
                  const linkType = cleanUrl.includes("/slide")
                    ? "slide"
                    : cleanUrl.includes("/blog")
                    ? "blog"
                    : cleanUrl.includes("/post")
                    ? "post"
                    : cleanUrl.includes("/article")
                    ? "article"
                    : cleanUrl.includes("/help")
                    ? "help"
                    : cleanUrl.includes("/guide")
                    ? "guide"
                    : cleanUrl.includes("/news")
                    ? "news"
                    : cleanUrl.includes("/tutorial")
                    ? "tutorial"
                    : cleanUrl.includes("/docs")
                    ? "docs"
                    : cleanUrl.includes("/support")
                    ? "support"
                    : cleanUrl.includes("/resource")
                    ? "resource"
                    : cleanUrl.includes("/case-stud")
                    ? "case-study"
                    : cleanUrl.includes("/faq")
                    ? "faq"
                    : "content";
                  console.log(
                    `[JSCrawl-Browser] Found ${linkType} link: ${cleanUrl}`
                  );
                }
              }
            }
          } catch {
            // Skip invalid URLs
            if (index < 10) {
              // Only log first 10 invalid URLs to avoid spam
              console.log("[JSCrawl-Browser] Skipping invalid URL:", href);
            }
          }
        }
      });

      const allLinks = Array.from(foundLinks);

      // Use intelligent content detection for final summary
      const contentPatterns = [
        { pattern: /\/blog\//i, name: "blog" },
        { pattern: /\/post\//i, name: "post" },
        { pattern: /\/article\//i, name: "article" },
        { pattern: /\/slide\//i, name: "slide" },
        { pattern: /\/news\//i, name: "news" },
        { pattern: /\/help\//i, name: "help" },
        { pattern: /\/guide\//i, name: "guide" },
        { pattern: /\/tutorial\//i, name: "tutorial" },
        { pattern: /\/docs?\//i, name: "docs" },
        { pattern: /\/support\//i, name: "support" },
        { pattern: /\/resource\//i, name: "resource" },
        { pattern: /\/case-stud/i, name: "case-study" },
        { pattern: /\/faq\//i, name: "faq" },
      ];

      const contentLinks = allLinks.filter((url) =>
        contentPatterns.some((cp) => cp.pattern.test(url))
      );

      console.log(
        `[JSCrawl-Browser] Total unique links extracted: ${allLinks.length}`
      );
      console.log(
        `[JSCrawl-Browser] Content-related links: ${contentLinks.length}`
      );

      // Break down by content type
      const contentBreakdown: Record<string, number> = {};
      contentPatterns.forEach(({ pattern, name }) => {
        const count = allLinks.filter((url) => pattern.test(url)).length;
        if (count > 0) {
          contentBreakdown[name] = count;
        }
      });

      if (Object.keys(contentBreakdown).length > 0) {
        console.log(`[JSCrawl-Browser] Content breakdown:`, contentBreakdown);
      }

      return allLinks;
    }, pageUrl);

    console.log(
      `[JSCrawl] Found ${links.length} links with JavaScript rendering`
    );

    // Use intelligent content analysis for final summary
    const finalAnalysis = analyzeUrlPatterns(links, pageUrl);
    console.log(`[JSCrawl] Final content analysis:`, {
      totalContentUrls: finalAnalysis.contentUrls.length,
      patterns: finalAnalysis.detectedPatterns
        .map((p) => `${p.name}: ${p.count}`)
        .join(", "),
      contentScore: finalAnalysis.totalContentScore.toFixed(1),
    });

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
  try {
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
    });

    console.log(
      `[LinkExtract] Response for ${pageUrl}: ${res.status} ${res.statusText}`
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch page: ${pageUrl} (Status: ${res.status} ${res.statusText})`
      );
    }

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

    const pageLinks = Array.from(links);

    console.log(
      `[LinkExtract] Total links found on ${pageUrl}: ${pageLinks.length}`
    );

    const intelligentAnalysis = analyzeUrlPatterns(pageLinks, pageUrl);
    console.log(`[LinkExtract] Intelligent content analysis:`, {
      contentUrls: intelligentAnalysis.contentUrls.length,
      patterns: intelligentAnalysis.detectedPatterns
        .map((p) => `${p.name}: ${p.count}`)
        .join(", "),
    });

    return pageLinks;
  } catch (error) {
    console.log(`[LinkExtract] Error fetching ${pageUrl}:`, error);
    throw error;
  }
}

// Intelligent URL pattern analysis
function analyzeUrlPatterns(urls: string[], inputUrl: string) {
  // Common content patterns to look for (dynamically extensible)
  const knownContentPatterns = [
    { pattern: /\/blog\//i, name: "blog", weight: 1.0 },
    { pattern: /\/post\//i, name: "post", weight: 1.0 },
    { pattern: /\/article\//i, name: "article", weight: 1.0 },
    { pattern: /\/slide\//i, name: "slide", weight: 1.0 },
    { pattern: /\/news\//i, name: "news", weight: 0.9 },
    { pattern: /\/help\//i, name: "help", weight: 0.8 },
    { pattern: /\/guide\//i, name: "guide", weight: 0.8 },
    { pattern: /\/tutorial\//i, name: "tutorial", weight: 0.8 },
    { pattern: /\/docs\//i, name: "docs", weight: 0.7 },
    { pattern: /\/support\//i, name: "support", weight: 0.7 },
    { pattern: /\/faq\//i, name: "faq", weight: 0.6 },
    { pattern: /\/case-stud/i, name: "case-study", weight: 0.8 },
    { pattern: /\/resource\//i, name: "resource", weight: 0.7 },
  ];

  const detectedPatterns: Array<{
    name: string;
    count: number;
    weight: number;
    urls: string[];
  }> = [];
  const contentUrls: string[] = [];
  const patternMap = new Map<string, string[]>();

  // Analyze each URL against known patterns
  urls.forEach((url) => {
    knownContentPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(url)) {
        if (!patternMap.has(name)) {
          patternMap.set(name, []);
        }
        patternMap.get(name)!.push(url);
        if (!contentUrls.includes(url)) {
          contentUrls.push(url);
        }
      }
    });
  });

  // Build detected patterns summary
  patternMap.forEach((urls, name) => {
    const patternInfo = knownContentPatterns.find((p) => p.name === name);
    if (patternInfo) {
      detectedPatterns.push({
        name,
        count: urls.length,
        weight: patternInfo.weight,
        urls: urls.slice(0, 5), // Sample URLs
      });
    }
  });

  // Sort by relevance (count * weight)
  detectedPatterns.sort((a, b) => b.count * b.weight - a.count * a.weight);

  // Detect URL path depth patterns (for dynamic content detection)
  const pathAnalysis = analyzePathDepth(urls, inputUrl);

  return {
    contentUrls,
    detectedPatterns,
    pathAnalysis,
    totalContentScore: detectedPatterns.reduce(
      (sum, p) => sum + p.count * p.weight,
      0
    ),
  };
}

function analyzePathDepth(urls: string[], inputUrl: string) {
  try {
    const inputPath = new URL(inputUrl).pathname;
    const inputDepth = inputPath
      .split("/")
      .filter((segment) => segment.length > 0).length;

    const pathDepths = urls.map((url) => {
      try {
        const path = new URL(url).pathname;
        return path.split("/").filter((segment) => segment.length > 0).length;
      } catch {
        return 0;
      }
    });

    const avgDepth =
      pathDepths.reduce((sum, depth) => sum + depth, 0) / pathDepths.length;
    const maxDepth = Math.max(...pathDepths);
    const minDepth = Math.min(...pathDepths.filter((d) => d > 0));

    return {
      inputDepth,
      avgDepth,
      maxDepth,
      minDepth,
      hasDeepPaths: maxDepth > inputDepth + 1, // URLs go deeper than the listing page
      depthVariation: maxDepth - minDepth,
    };
  } catch {
    return {
      inputDepth: 0,
      avgDepth: 0,
      maxDepth: 0,
      minDepth: 0,
      hasDeepPaths: false,
      depthVariation: 0,
    };
  }
}

interface UrlAnalysis {
  contentUrls: string[];
  detectedPatterns: Array<{
    name: string;
    count: number;
    weight: number;
    urls: string[];
  }>;
  pathAnalysis: {
    hasDeepPaths: boolean;
  };
}

function detectDynamicContentPage(
  inputUrl: string,
  urlAnalysis: UrlAnalysis,
  totalUrls: number
) {
  const hasMinimalLinks = totalUrls <= 10;
  const hasMinimalContent = urlAnalysis.contentUrls.length <= 3;
  const hasZeroContent = urlAnalysis.contentUrls.length === 0;

  // Check if URL looks like a listing page (plural form or common listing patterns)
  const listingPatterns = [
    /\/blogs?\/?$/i,
    /\/posts?\/?$/i,
    /\/articles?\/?$/i,
    /\/slides?\/?$/i,
    /\/news\/?$/i,
    /\/help\/?$/i,
    /\/guides?\/?$/i,
    /\/tutorials?\/?$/i,
    /\/docs?\/?$/i,
    /\/support\/?$/i,
    /\/resources?\/?$/i,
    /\/case-studies?\/?$/i,
    /\/faqs?\/?$/i,
  ];

  const isListingPage = listingPatterns.some((pattern) =>
    pattern.test(inputUrl)
  );

  // Check if URL contains any content-related keywords
  const hasContentKeywords =
    urlAnalysis.detectedPatterns.length > 0 ||
    /\/(blog|post|article|slide|news|help|guide|tutorial|doc|support|resource|case-stud|faq)/i.test(
      inputUrl
    );

  // Determine if this looks like a dynamic content page
  const shouldUseJavaScript =
    // Case 1: It's clearly a listing page
    isListingPage ||
    // Case 2: Has content keywords but found very few/no content URLs (likely dynamic)
    (hasContentKeywords && (hasMinimalContent || hasZeroContent)) ||
    // Case 3: Very few total links found (might be dynamic loading)
    (hasContentKeywords && hasMinimalLinks) ||
    // Case 4: URL suggests content but we found no deeper paths (might load dynamically)
    (hasContentKeywords && !urlAnalysis.pathAnalysis.hasDeepPaths);

  return {
    shouldUseJavaScript,
    reasons: {
      isListingPage,
      hasContentKeywords,
      hasMinimalLinks,
      hasMinimalContent,
      hasZeroContent,
      lacksDeepPaths:
        hasContentKeywords && !urlAnalysis.pathAnalysis.hasDeepPaths,
    },
    confidence: calculateConfidence(
      isListingPage,
      hasContentKeywords,
      hasMinimalContent,
      hasZeroContent,
      hasMinimalLinks
    ),
  };
}

function calculateConfidence(
  isListingPage: boolean,
  hasContentKeywords: boolean,
  hasMinimalContent: boolean,
  hasZeroContent: boolean,
  hasMinimalLinks: boolean
): number {
  let confidence = 0;

  if (isListingPage) confidence += 0.4; // Strong indicator
  if (hasContentKeywords) confidence += 0.2;
  if (hasZeroContent && hasContentKeywords) confidence += 0.3; // Very likely dynamic
  if (hasMinimalContent && hasContentKeywords) confidence += 0.2;
  if (hasMinimalLinks && hasContentKeywords) confidence += 0.1;

  return Math.min(confidence, 1.0); // Cap at 1.0
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

  // Try common sitemap candidates from robots.txt and known paths
  try {
    const candidates = await discoverSitemapCandidates(inputUrl);
    if (candidates.length > 0) {
      console.log(`[Discovery] Trying ${candidates.length} sitemap candidates`);
      for (const candidate of candidates) {
        try {
          const urls = await parseSitemap(candidate);
          if (urls.length > 0) {
            console.log(
              `[Discovery] Found ${urls.length} URLs via candidate sitemap: ${candidate}`
            );
            return { urls, type: "sitemap" };
          }
        } catch {}
      }
    }
  } catch {}

  // If sitemap parsing fails, try regular HTML crawling first
  try {
    const urls = await extractLinksFromPage(inputUrl);
    console.log(
      `[Discovery] Found ${urls.length} URLs by crawling webpage links`
    );

    // Intelligent content detection - analyze URL patterns dynamically
    const urlAnalysis = analyzeUrlPatterns(urls, inputUrl);

    console.log(`[Discovery] URL Analysis:`, urlAnalysis);
    console.log(
      `[Discovery] Potential content URLs found: ${urlAnalysis.contentUrls.length}`
    );
    console.log(
      `[Discovery] Content patterns detected:`,
      urlAnalysis.detectedPatterns
    );

    const totalUrls = urls.length;
    const contentUrls = urlAnalysis.contentUrls.length;

    // Intelligent detection: check if this looks like a dynamic content page
    const isDynamicContentPage = detectDynamicContentPage(
      inputUrl,
      urlAnalysis,
      totalUrls
    );

    console.log(
      `[Discovery] Dynamic content page detection:`,
      isDynamicContentPage
    );

    if (isDynamicContentPage.shouldUseJavaScript) {
      console.log(
        `[Discovery] Detected dynamic content page (confidence: ${isDynamicContentPage.confidence.toFixed(
          2
        )}). ` +
          `Reasons: ${Object.entries(isDynamicContentPage.reasons)
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(", ")}. Trying JS crawling...`
      );

      try {
        const jsUrls = await extractLinksUsingBrowser(inputUrl);
        const jsUrlAnalysis = analyzeUrlPatterns(jsUrls, inputUrl);
        const jsContentUrls = jsUrlAnalysis.contentUrls.length;

        console.log(`[Discovery] JS Analysis:`, jsUrlAnalysis);

        // If JavaScript rendering found more content URLs, use those results
        if (jsUrls.length > totalUrls || jsContentUrls > contentUrls) {
          console.log(
            `[Discovery] JavaScript rendering found more content! Using JS results.`
          );
          console.log(
            `[Discovery] Content patterns found:`,
            jsUrlAnalysis.detectedPatterns
              .map((p) => `${p.name}: ${p.count}`)
              .join(", ")
          );

          // Ensure no duplicates in the final result
          const uniqueJsUrls = Array.from(new Set(jsUrls));
          console.log(
            `[Discovery] Final unique URLs: ${uniqueJsUrls.length} (removed ${
              jsUrls.length - uniqueJsUrls.length
            } duplicates)`
          );

          return { urls: uniqueJsUrls, type: "javascript" };
        }
      } catch (jsError) {
        console.log(
          `[Discovery] JavaScript crawling failed, falling back to regular results:`,
          jsError
        );
      }
    }

    console.log(`[Discovery] All discovered URLs:`, urls);

    // Ensure no duplicates in regular webpage results either
    const uniqueUrls = Array.from(new Set(urls));
    if (uniqueUrls.length !== urls.length) {
      console.log(
        `[Discovery] Removed ${
          urls.length - uniqueUrls.length
        } duplicate URLs from webpage results`
      );
    }

    return { urls: uniqueUrls, type: "webpage" };
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

  // Check if this is a slide page - force JavaScript rendering
  if (url.includes("/slide")) {
    console.log(
      `[Crawl] Detected slide page, forcing JavaScript extraction: ${url}`
    );
    try {
      const jsText = await extractTextUsingBrowser(url);
      console.log(
        `[Crawl] JavaScript extraction for slide page returned ${jsText.length} chars`
      );
      if (jsText.length > 100) {
        return jsText;
      }
      console.log(
        `[Crawl] JavaScript extraction returned minimal content, trying regular extraction as fallback`
      );
    } catch (jsError) {
      console.log(
        `[Crawl] JavaScript extraction failed for slide page, trying regular extraction:`,
        jsError
      );
    }
  }

  // Try regular extraction first
  try {
    console.log(`[ExtractText] Starting fetch for: ${url}`);

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      console.log(`[ExtractText] TIMEOUT - Aborting request for: ${url}`);
    }, 30000); // 30 second timeout

    const fetchStart = Date.now();
    const res = await fetch(url, {
      follow: 20, // Follow up to 20 HTTP redirects
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
      },
    });
    const fetchEnd = Date.now();

    clearTimeout(timeout);
    console.log(
      `[ExtractText] Fetch completed in ${fetchEnd - fetchStart}ms for: ${url}`
    );
    console.log(
      `[ExtractText] Response status: ${res.status} ${res.statusText}`
    );
    console.log(
      `[ExtractText] Response headers: ${JSON.stringify(
        Object.fromEntries(res.headers.entries())
      )}`
    );

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(
        `Failed to fetch page: ${url} (Status: ${res.status} ${res.statusText})`
      );
    }

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
          console.log(`[ExtractText] Following redirect to: ${redirectUrl}`);
          return extractTextFromUrl(redirectUrl, depth + 1);
        }
      }
    }

    console.log(`[ExtractText] Parsing HTML content...`);
    $("script, style, noscript").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim();

    console.log(
      `[ExtractText] SUCCESS - Extracted ${text.length} chars from ${url}`
    );
    console.log(`[ExtractText] Text preview: ${text.slice(0, 200)}...`);

    // If the text is too short and this looks like a dynamic content page, try JavaScript extraction
    const contentPatterns = [
      /\/blog\//i,
      /\/post\//i,
      /\/article\//i,
      /\/slide\//i,
      /\/news\//i,
      /\/help\//i,
      /\/guide\//i,
      /\/tutorial\//i,
      /\/docs?\//i,
      /\/support\//i,
      /\/resource\//i,
      /\/case-stud/i,
      /\/faq\//i,
    ];

    const isContentPage = contentPatterns.some((pattern) => pattern.test(url));

    // For slide pages, be more aggressive about using JavaScript rendering
    const isSlidePageWithMinimalContent =
      url.includes("/slide") && text.length < 500;

    if ((text.length < 200 && isContentPage) || isSlidePageWithMinimalContent) {
      console.log(
        `[Crawl] Content seems minimal (${text.length} chars) or slide page with little content, trying JavaScript extraction...`
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

    // Wait for dynamic content - longer wait for slides
    const waitTime = url.includes("/slide") ? 5000 : 3000;
    console.log(
      `[JSExtract] Waiting ${waitTime}ms for dynamic content to load...`
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // For slide pages, try scrolling to load more content
    if (url.includes("/slide")) {
      console.log(
        `[JSExtract] Slide page detected, attempting scroll to load content...`
      );
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
        // Try to trigger any lazy loading
        window.dispatchEvent(new Event("scroll"));
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Extract text content from the rendered page
    const text = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll("script, style, noscript");
      scripts.forEach((el) => el.remove());

      // For slide pages, try to get content from common slide containers
      const slideSelectors = [
        ".slide-content",
        ".presentation-content",
        ".slide-container",
        '[class*="slide"]',
        ".content",
        "main",
        "article",
      ];

      let slideText = "";
      for (const selector of slideSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          const elementText = el.textContent || "";
          if (elementText.length > slideText.length) {
            slideText = elementText;
          }
        });
      }

      // Get the main content text (fallback to body if slide-specific content not found)
      const bodyText = document.body?.innerText || "";
      const finalText = slideText.length > 100 ? slideText : bodyText;

      // Clean up whitespace
      return finalText.replace(/\s+/g, " ").trim();
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
  const startTime = Date.now();
  const MAX_EXECUTION_TIME = 270000; // 270 seconds (30 seconds buffer before Vercel timeout)

  console.log(`[Sitemap] POST request received at ${new Date().toISOString()}`);
  console.log(
    `[Sitemap] Request headers:`,
    Object.fromEntries(req.headers.entries())
  );

  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    console.log(`[Sitemap] No auth token provided`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(`[Sitemap] Auth token found, verifying...`);
  let adminId = "";
  try {
    const payload = jwt.verify(token!, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    adminId = payload.adminId;
    console.log(`[Sitemap] Auth successful for adminId: ${adminId}`);
  } catch (authError) {
    console.log(`[Sitemap] Auth failed:`, authError);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  console.log(`[Sitemap] Parsing request body...`);
  const body = await req.json();
  console.log(`[Sitemap] Request body:`, JSON.stringify(body, null, 2));

  const { sitemapUrl } = body;
  if (!sitemapUrl) {
    console.log(`[Sitemap] No sitemapUrl provided in request body`);
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  console.log(`[Sitemap] Starting sitemap processing for URL: ${sitemapUrl}`);
  try {
    // Normalize URL to ensure HTTPS and proper format
    let normalizedUrl = sitemapUrl.trim();

    // Add protocol if missing
    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    // Convert HTTP to HTTPS for better compatibility
    if (normalizedUrl.startsWith("http://")) {
      normalizedUrl = normalizedUrl.replace("http://", "https://");
    }

    console.log(`[Crawl] Original URL: ${sitemapUrl}`);
    console.log(`[Crawl] Normalized URL: ${normalizedUrl}`);

    let urls: string[] = [];
    let discoveryType: "sitemap" | "webpage" | "javascript" = "sitemap";
    try {
      console.log(`[Crawl] Starting URL discovery for: ${normalizedUrl}`);
      const result = await discoverUrls(normalizedUrl);
      urls = result.urls;
      discoveryType = result.type;
      console.log(
        `[Crawl] Discovery SUCCESS - Found ${urls.length} URLs via ${discoveryType}`
      );
      console.log(`[Crawl] First 5 URLs: ${urls.slice(0, 5).join(", ")}`);
    } catch (error) {
      console.error(`[Crawl] Discovery FAILED for ${normalizedUrl}:`, error);
      return NextResponse.json(
        { error: `Failed to discover URLs from the provided link: ${error}` },
        { status: 400 }
      );
    }

    console.log(`[Crawl] Connecting to database...`);
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

    // Ensure no duplicate URLs before creating docs
    const uniqueUrls = Array.from(new Set(urls));
    if (uniqueUrls.length !== urls.length) {
      console.log(
        `[Crawl] Removed ${
          urls.length - uniqueUrls.length
        } duplicate URLs before storage`
      );
    }

    const sitemapUrlDocs = uniqueUrls.map((url) => ({
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
            $set: {
              recrawlReason: "no_pinecone_vectors",
              recrawlAt: new Date(),
            },
          }
        );
      }
    }

    // Recalculate crawled URLs after reset
    const updatedCrawledDocs = await sitemapUrls
      .find({ adminId, sitemapUrl, crawled: true })
      .toArray();
    const updatedCrawledUrls = new Set(
      updatedCrawledDocs.map((doc) => doc.url)
    );

    // Select the next batch of uncrawled URLs (up to MAX_PAGES)
    const uncrawledUrls = urls
      .filter((url) => !updatedCrawledUrls.has(url))
      .slice(0, MAX_PAGES);

    console.log(
      `[Crawl] Found ${problematicUrls.length} problematic URLs to re-crawl`
    );
    console.log(
      `[Crawl] Will crawl ${uncrawledUrls.length} URLs in this batch`
    );
    console.log(
      `[Crawl] URLs to crawl: ${uncrawledUrls.slice(0, 3).join(", ")}${
        uncrawledUrls.length > 3 ? "..." : ""
      }`
    );

    const results: { url: string; text: string }[] = [];
    let totalChunks = 0;
    let crawlCount = 0;
    let timeoutReached = false;

    for (const url of uncrawledUrls) {
      // Check if we're approaching the timeout limit
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;

      if (elapsedTime > MAX_EXECUTION_TIME) {
        console.log(
          `[Timeout] Execution time limit reached (${elapsedTime}ms > ${MAX_EXECUTION_TIME}ms)`
        );
        console.log(
          `[Timeout] Processed ${crawlCount}/${uncrawledUrls.length} URLs before timeout`
        );
        timeoutReached = true;
        break;
      }

      // Also check if we're close to timeout and have processed some URLs
      if (elapsedTime > MAX_EXECUTION_TIME - 30000 && crawlCount > 0) {
        console.log(
          `[Timeout] Approaching timeout limit with 30s buffer (${elapsedTime}ms)`
        );
        console.log(
          `[Timeout] Stopping early after ${crawlCount}/${uncrawledUrls.length} URLs`
        );
        timeoutReached = true;
        break;
      }

      crawlCount++;
      try {
        console.log(
          `[Crawl] [${crawlCount}/${uncrawledUrls.length}] Starting to crawl: ${url} (elapsed: ${elapsedTime}ms)`
        );
        const crawlStartTime = Date.now();

        const text = await extractTextFromUrl(url);
        const endTime = Date.now();

        console.log(
          `[Crawl] [${crawlCount}/${
            uncrawledUrls.length
          }] SUCCESS - Extracted ${text.length} chars in ${
            endTime - crawlStartTime
          }ms from ${url}`
        );
        console.log(`[Crawl] First 100 chars: ${text.slice(0, 100)}`);

        // Debug: Log if text is too short
        if (text.length < 50) {
          console.log(`[Crawl] WARNING: Very short content for ${url}:`, text);
        }

        console.log(`[Crawl] Storing page data in MongoDB...`);
        results.push({ url, text });

        // Generate basic summary (existing functionality)
        const basicSummaryResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that creates concise summaries of web page content. Focus on the main topics, key information, and important details.",
            },
            {
              role: "user",
              content: `Please create a concise summary of the following web page content:\n\n${text}`,
            },
          ],
          max_tokens: 300,
          temperature: 0.3,
        });
        const basicSummary =
          basicSummaryResponse.choices[0]?.message?.content ||
          "Summary not available";

        // Generate structured summary (NEW - automatic during crawling)
        let structuredSummary = null;
        if (text.length >= 100) {
          // Only generate if we have sufficient content
          try {
            console.log(`[Crawl] Generating structured summary for ${url}...`);
            const structuredSummaryResponse =
              await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are an expert web page analyzer. Analyze the provided web page content and extract key business information. Return ONLY a valid JSON object with the specified structure. Do not include any markdown formatting or additional text.",
                  },
                  {
                    role: "user",
                    content: `Analyze this web page content and extract key information:

${text}

Extract and return a JSON object with:
{
  "pageType": "homepage|pricing|features|about|contact|blog|product|service",
  "businessVertical": "fitness|healthcare|legal|restaurant|saas|ecommerce|consulting|other",
  "primaryFeatures": ["feature1", "feature2", "feature3"],
  "painPointsAddressed": ["pain1", "pain2", "pain3"],
  "solutions": ["solution1", "solution2", "solution3"],
  "targetCustomers": ["small business", "enterprise", "startups"],
  "businessOutcomes": ["outcome1", "outcome2"],
  "competitiveAdvantages": ["advantage1", "advantage2"],
  "industryTerms": ["term1", "term2", "term3"],
  "pricePoints": ["free", "$X/month", "enterprise"],
  "integrations": ["tool1", "tool2"],
  "useCases": ["usecase1", "usecase2"],
  "callsToAction": ["Get Started", "Book Demo"],
  "trustSignals": ["testimonial", "certification", "clientcount"]
}`,
                  },
                ],
                max_tokens: 800,
                temperature: 0.3,
              });

            const structuredText =
              structuredSummaryResponse.choices[0]?.message?.content;
            if (structuredText) {
              try {
                structuredSummary = JSON.parse(structuredText);
                console.log(
                  `[Crawl] Structured summary generated successfully for ${url}`
                );
              } catch (parseError) {
                console.error(
                  `[Crawl] Failed to parse structured summary JSON for ${url}:`,
                  parseError
                );
              }
            }
          } catch (summaryError) {
            console.error(
              `[Crawl] Error generating structured summary for ${url}:`,
              summaryError
            );
          }
        }

        // Store page data with both summaries
        const pageData: any = {
          adminId,
          url,
          text,
          summary: basicSummary,
          filename: url,
          createdAt: new Date(),
        };

        // Add structured summary if generated
        if (structuredSummary) {
          pageData.structuredSummary = structuredSummary;
          pageData.summaryGeneratedAt = new Date();
        }

        await pages.insertOne(pageData);
        console.log(
          `[Crawl] Page data stored successfully${
            structuredSummary ? " with structured summary" : ""
          }`
        );

        // Mark as crawled in sitemap_urls with specific sitemapUrl context
        console.log(`[Crawl] Marking URL as crawled in sitemap_urls...`);
        await sitemapUrls.updateOne(
          { adminId, url, sitemapUrl }, // Include sitemapUrl to ensure proper tracking
          { $set: { crawled: true, crawledAt: new Date() } }
        );
        // Chunk and embed for Pinecone
        let chunks = chunkText(text);
        console.log(`[Crawl] Chunks for ${url}:`, chunks.length);

        // Debug: If no chunks created, log why and try to create a minimal chunk
        if (chunks.length === 0) {
          console.log(
            `[Crawl] DEBUG: No chunks created for ${url}. Text length: ${text.length}. Sample text:`,
            text.slice(0, 200)
          );

          // If we have some text but no chunks, create a minimal chunk
          if (text.length > 10) {
            console.log(`[Crawl] Creating minimal chunk for short content...`);
            chunks = [text.trim()];
          }
        }

        if (chunks.length > 0) {
          console.log(
            `[Crawl] Creating embeddings for ${chunks.length} chunks...`
          );
          try {
            const embedResp = await openai.embeddings.create({
              input: chunks,
              model: "text-embedding-3-small",
            });
            const embeddings = embedResp.data.map(
              (d: { embedding: number[] }) => d.embedding
            );
            const metadata = chunks.map((chunk, i) => ({
              filename: url,
              adminId,
              url,
              chunkIndex: i,
            }));
            console.log(
              `[Crawl] Upserting ${embeddings.length} embeddings to Pinecone...`
            );
            await addChunks(chunks, embeddings, metadata);
            totalChunks += chunks.length;
            console.log(
              `[Crawl] SUCCESS - Processed ${url}: ${chunks.length} chunks, ${totalChunks} total chunks so far`
            );
          } catch (embeddingError) {
            console.error(
              `[Crawl] EMBEDDING ERROR for ${url}:`,
              embeddingError
            );
            if (embeddingError instanceof Error) {
              console.error(`[Crawl] Stack trace:`, embeddingError.stack);
            }
          }
        } else {
          console.log(
            `[Crawl] WARNING - No chunks created for ${url}. Text length: ${
              text.length
            }, Content: ${text.slice(0, 200)}`
          );
        }
      } catch (err) {
        console.error(`[Crawl] CRITICAL ERROR for URL ${url}:`, err);
        if (err instanceof Error) {
          console.error(`[Crawl] Error type: ${err.constructor.name}`);
          console.error(`[Crawl] Error message: ${err.message}`);
          console.error(`[Crawl] Stack trace:`, err.stack);
        }

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

    const totalElapsedTime = Date.now() - startTime;
    const totalRemaining =
      urls.length - updatedCrawledUrls.size - results.length;
    const hasMorePages = totalRemaining > 0;

    console.log(
      `[Crawl] BATCH COMPLETE - Successfully crawled ${results.length} pages in ${totalElapsedTime}ms`
    );
    console.log(`[Crawl] Total chunks created: ${totalChunks}`);
    console.log(`[Crawl] Remaining pages in sitemap: ${totalRemaining}`);

    if (timeoutReached) {
      console.log(`[Timeout] Batch stopped due to timeout protection`);
    }

    const response = {
      crawled: results.length,
      totalChunks,
      pages: results.map((r) => r.url),
      batchDone: results.length, // Number of pages successfully crawled in this batch
      batchRemaining: totalRemaining, // Total remaining pages
      totalRemaining: totalRemaining,
      recrawledPages: problematicUrls.length, // Show how many pages were reset for re-crawling
      timeoutReached, // Indicate if processing stopped due to timeout
      executionTime: totalElapsedTime,
      totalDiscovered: urls.length,
      hasMorePages, // Indicates if there are more pages to crawl
      sitemapUrl, // Include the sitemap URL for auto-continue
      message: timeoutReached
        ? `Processed ${results.length} pages before timeout. ${totalRemaining} pages remaining.`
        : hasMorePages
        ? `Successfully processed ${results.length} pages. ${totalRemaining} pages remaining - auto-continue available.`
        : `All ${urls.length} pages have been successfully processed!`,
    };

    // Auto-extract personas when crawling is complete
    if (!hasMorePages && results.length > 0) {
      console.log(
        `[Persona] Triggering auto-extraction of customer personas...`
      );
      try {
        await extractPersonasForAdmin(adminId, normalizedUrl);
        console.log(`[Persona] Auto-extraction completed successfully`);
      } catch (personaError) {
        console.error(`[Persona] Auto-extraction failed:`, personaError);
        // Don't fail the main response if persona extraction fails
      }
    }

    console.log(`[Crawl] Sending response:`, JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (error) {
    console.error("[Sitemap] CRITICAL ERROR during sitemap processing:", error);
    if (error instanceof Error) {
      console.error("[Sitemap] Error name:", error.name);
      console.error("[Sitemap] Error message:", error.message);
      console.error("[Sitemap] Error stack:", error.stack);
    }

    const errorResponse = {
      error:
        "An error occurred while processing the sitemap. Please try again.",
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };

    console.log(
      "[Sitemap] Sending error response:",
      JSON.stringify(errorResponse, null, 2)
    );
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // If ?debug=1 with API key, return sitemap debug info
  if (req.nextUrl.searchParams.get("debug") === "1") {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required for debug" },
        { status: 401 }
      );
    }

    const apiAuth = await verifyApiKey(apiKey);
    if (!apiAuth) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const adminId = apiAuth.adminId;
    const db = await getDb();
    const sitemapUrls = db.collection("sitemap_urls");

    // Get all sitemap entries for this admin
    const entries = await sitemapUrls.find({ adminId }).toArray();

    // Get specific page check if provided
    const checkUrl = req.nextUrl.searchParams.get("url");
    let specificEntry = null;
    if (checkUrl) {
      specificEntry = await sitemapUrls.findOne({ adminId, url: checkUrl });
    }

    return NextResponse.json({
      adminId,
      email: apiAuth.email,
      totalEntries: entries.length,
      entries: entries.map((e) => ({
        url: e.url,
        crawled: e.crawled,
        crawledAt: e.crawledAt,
      })),
      specificUrlCheck: checkUrl
        ? { url: checkUrl, found: !!specificEntry, entry: specificEntry }
        : null,
    });
  }

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
