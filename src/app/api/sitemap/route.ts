import { NextRequest, NextResponse } from "next/server";
import { getDb, getAdminSettingsCollection } from "@/lib/mongo";
import {
  verifyApiKey,
  verifyAdminToken,
  verifyAdminTokenFromCookie,
} from "@/lib/auth";
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
const MAX_PAGES = 6;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_KEY!,
});
const index = pinecone.index(process.env.PINECONE_INDEX!);

// Helper to check if domains are the same, ignoring www.
function isSameDomain(host1: string, host2: string): boolean {
  const h1 = host1.replace(/^www\./, "").toLowerCase();
  const h2 = host2.replace(/^www\./, "").toLowerCase();
  return h1 === h2 || h1.endsWith("." + h2) || h2.endsWith("." + h1);
}

function normalizeStructuredSummary(raw: any) {
  if (!raw || typeof raw !== "object") return raw;
  const result: any = { ...raw };
  if (!Array.isArray(result.sections)) {
    if (result.sections && typeof result.sections === "object") {
      result.sections = [result.sections];
    } else {
      result.sections = [];
    }
  }
  result.sections = result.sections.map((section: any) => {
    const s: any = { ...section };
    if (s.leadQuestions && !Array.isArray(s.leadQuestions)) {
      s.leadQuestions = [s.leadQuestions];
    }
    if (!Array.isArray(s.leadQuestions)) {
      const arr: any[] = [];
      if (s.leadQuestion) {
        arr.push({
          question: s.leadQuestion,
          options: Array.isArray(s.leadOptions) ? s.leadOptions : [],
          tags: Array.isArray(s.leadTags) ? s.leadTags : [],
          workflow:
            typeof s.leadWorkflow === "string" ? s.leadWorkflow : "legacy",
        });
      }
      s.leadQuestions = arr;
    } else {
      s.leadQuestions = s.leadQuestions.map((q: any) => {
        const optsRaw = Array.isArray(q?.options) ? q.options : [];
        const options = optsRaw.map((o: any) => {
          if (o && typeof o === "object" && typeof o.label === "string") {
            return {
              label: String(o.label),
              tags: Array.isArray(o.tags)
                ? o.tags.map((t: any) => snakeTag(String(t)))
                : [],
              workflow:
                typeof o.workflow === "string" ? o.workflow : "education_path",
            };
          }
          const label = String(o || "");
          return {
            label,
            tags: [],
            workflow: "education_path",
          };
        });
        return {
          question: q && q.question ? q.question : "",
          options,
          tags: [], // question-level tags suppressed per spec
          workflow:
            typeof q?.workflow === "string" ? q.workflow : "validation_path",
        };
      });
    }
    if (s.salesQuestions && !Array.isArray(s.salesQuestions)) {
      s.salesQuestions = [s.salesQuestions];
    }
    if (!Array.isArray(s.salesQuestions)) {
      const arr: any[] = [];
      if (s.salesQuestion) {
        arr.push({
          question: s.salesQuestion,
          options: Array.isArray(s.salesOptions) ? s.salesOptions : [],
          tags: Array.isArray(s.salesTags) ? s.salesTags : [],
          workflow:
            typeof s.salesWorkflow === "string"
              ? s.salesWorkflow
              : "diagnostic_response",
        });
      }
      s.salesQuestions = arr;
    } else {
      s.salesQuestions = s.salesQuestions.map((q: any) => {
        const optsRaw = Array.isArray(q?.options) ? q.options : [];
        const options = optsRaw.map((o: any) => {
          if (o && typeof o === "object" && typeof o.label === "string") {
            return {
              label: String(o.label),
              tags: Array.isArray(o.tags)
                ? o.tags.map((t: any) => snakeTag(String(t)))
                : [],
              workflow:
                typeof o.workflow === "string"
                  ? o.workflow
                  : "optimization_workflow",
            };
          }
          const label = String(o || "");
          return {
            label,
            tags: [],
            workflow: "optimization_workflow",
          };
        });
        return {
          question: q && q.question ? q.question : "",
          options,
          tags: [], // question-level tags suppressed per spec
          workflow: "diagnostic_education",
        };
      });
    }
    const baseTitle =
      typeof s.sectionName === "string" && s.sectionName.trim().length > 0
        ? s.sectionName.trim()
        : "this section";
    const summarySnippet =
      typeof s.sectionSummary === "string" && s.sectionSummary.trim().length > 0
        ? s.sectionSummary.trim()
        : "";
    while (s.leadQuestions.length < 2) {
      const idx = s.leadQuestions.length;
      s.leadQuestions.push({
        question:
          idx === 0
            ? `Which best describes your interest in ${baseTitle}?`
            : summarySnippet
              ? `What are you hoping to improve related to ${baseTitle}?`
              : `What are you hoping to improve in ${baseTitle}?`,
        options: [
          {
            label: "Exploring options",
            tags: ["unknown_state"],
            workflow: "education_path",
          },
          {
            label: "Evaluating solutions",
            tags: ["semi_structured"],
            workflow: "optimization_workflow",
          },
        ],
        tags: [],
        workflow: "ask_sales_question",
      });
    }
    while (s.salesQuestions.length < 2) {
      const idx = s.salesQuestions.length;
      s.salesQuestions.push({
        question:
          idx === 0
            ? `How urgent is it for you to improve ${baseTitle}?`
            : `What stage are you at in deciding about ${baseTitle}?`,
        options: [
          {
            label: "Immediate need",
            tags: ["high_governance"],
            workflow: "optimization_workflow",
          },
          {
            label: "Researching",
            tags: ["unknown_state"],
            workflow: "education_path",
          },
        ],
        tags: [],
        workflow: "diagnostic_education",
      });
    }
    // Enforce exactly 2 questions and options 2–4 with object structure
    s.leadQuestions = s.leadQuestions.slice(0, 2).map((q: any) => {
      let opts = Array.isArray(q.options) ? q.options : [];
      // normalize each option to object
      opts = opts.map((o: any) =>
        typeof o === "object" && typeof o.label === "string"
          ? {
              label: String(o.label),
              tags: Array.isArray(o.tags)
                ? o.tags.map((t: any) => snakeTag(String(t)))
                : [],
              workflow:
                typeof o.workflow === "string" ? o.workflow : "education_path",
            }
          : { label: String(o || ""), tags: [], workflow: "education_path" },
      );
      if (opts.length < 2) {
        while (opts.length < 2) {
          opts.push({
            label: `Option ${opts.length + 1}`,
            tags: [],
            workflow: "education_path",
          });
        }
      }
      if (opts.length > 4) opts = opts.slice(0, 4);
      return { ...q, options: opts, tags: [] };
    });
    s.salesQuestions = s.salesQuestions.slice(0, 2).map((q: any) => {
      let opts = Array.isArray(q.options) ? q.options : [];
      opts = opts.map((o: any) =>
        typeof o === "object" && typeof o.label === "string"
          ? {
              label: String(o.label),
              tags: Array.isArray(o.tags)
                ? o.tags.map((t: any) => snakeTag(String(t)))
                : [],
              workflow:
                typeof o.workflow === "string"
                  ? o.workflow
                  : "optimization_workflow",
            }
          : {
              label: String(o || ""),
              tags: [],
              workflow: "optimization_workflow",
            },
      );
      if (opts.length < 2) {
        while (opts.length < 2) {
          opts.push({
            label: `Option ${opts.length + 1}`,
            tags: [],
            workflow: "optimization_workflow",
          });
        }
      }
      if (opts.length > 4) opts = opts.slice(0, 4);
      return { ...q, options: opts, tags: [] };
    });
    return s;
  });
  return result;
}

function buildFallbackStructuredSummaryFromText(text: string) {
  if (!text || typeof text !== "string") return null;
  const sections: any[] = [];
  const sectionRegex =
    /\[SECTION\s+(\d+)\]\s*([^\n]*)\n?([\s\S]*?)(?=(\[SECTION\s+\d+\])|$)/g;
  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(text)) !== null) {
    const index = match[1];
    const title = (match[2] || "").trim() || `Section ${index}`;
    const body = (match[3] || "").trim();
    const summary =
      body.length > 400 ? body.slice(0, 400) + "..." : body || title;
    sections.push({
      sectionName: title,
      sectionSummary: summary,
      leadQuestions: [],
      salesQuestions: [],
      scripts: {
        diagnosticAnswer: "",
        followUpQuestion: "",
        followUpOptions: [],
        featureMappingAnswer: "",
        loopClosure: "",
      },
    });
  }
  if (sections.length === 0) {
    const snippet =
      text.length > 400 ? text.slice(0, 400) + "..." : text.trim();
    sections.push({
      sectionName: "Main Content",
      sectionSummary: snippet,
      leadQuestions: [],
      salesQuestions: [],
      scripts: {
        diagnosticAnswer: "",
        followUpQuestion: "",
        followUpOptions: [],
        featureMappingAnswer: "",
        loopClosure: "",
      },
    });
  }
  return {
    pageType: "blog",
    businessVertical: "other",
    primaryFeatures: [],
    painPointsAddressed: [],
    solutions: [],
    targetCustomers: [],
    businessOutcomes: [],
    competitiveAdvantages: [],
    industryTerms: [],
    pricePoints: [],
    integrations: [],
    useCases: [],
    callsToAction: [],
    trustSignals: [],
    sections,
  };
}

function parseSectionBlocks(text: string) {
  const blocks: { title: string; body: string }[] = [];
  const regex =
    /\[SECTION\s+(\d+)\]\s*([^\n]*)\n?([\s\S]*?)(?=(\[SECTION\s+\d+\])|$)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const title = (m[2] || "").trim();
    const body = (m[3] || "").trim();
    blocks.push({ title, body });
  }
  return blocks;
}

function snakeTag(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

function classifySectionType(
  sectionName: string,
  sectionSummary: string,
  sectionText: string,
) {
  const blob = `${sectionName} ${sectionSummary} ${sectionText}`.toLowerCase();
  if (
    /availability|buffer|working hours|multi[-\s]?calendar|slot|rule/i.test(
      blob,
    )
  )
    return "availability";
  if (/secure|security|compliance|admin|governance|privacy|audit/i.test(blob))
    return "security";
  if (
    /roi|return on investment|increase|decrease|bookings|errors|time-to-hire|speed|cycle|customers reached/i.test(
      blob,
    )
  )
    return "roi";
  return "hero";
}

function isGenericLead(sectionName: string, q: any) {
  const base = (sectionName || "").toLowerCase();
  const opts = Array.isArray(q?.options)
    ? q.options.map((o: any) => String(o))
    : [];
  const def =
    opts.length === 3 &&
    opts[0] === "Just exploring" &&
    opts[1] === "Actively evaluating" &&
    opts[2] === "Ready to get started";
  const phr = String(q?.question || "").toLowerCase();
  return def && phr.includes("which best describes your interest");
}

function isGenericSales(sectionName: string, q: any) {
  const opts = Array.isArray(q?.options)
    ? q.options.map((o: any) => String(o))
    : [];
  const def =
    opts.length === 3 &&
    opts[0] === "In the next month" &&
    opts[1] === "In 1-3 months" &&
    opts[2] === "Just researching";
  const flows = Array.isArray(q?.optionFlows) ? q.optionFlows : [];
  return def && flows.length === 0;
}

const TAGS_PROBLEM = [
  "manual_scheduling",
  "scheduling_gap",
  "onboarding_delay",
  "onboarding_dropoff",
  "pipeline_leakage",
  "inconsistent_process",
  "handoff_friction",
  "visibility_gap",
  "no_show_risk",
  "late_engagement",
  "stakeholder_coordination",
  "capacity_constraint",
];
const TAGS_READINESS = [
  "validated_flow",
  "optimization_ready",
  "awareness_missing",
  "unknown_state",
  "low_friction",
  "high_friction",
];
const TAGS_RISK = ["low_risk", "conversion_risk", "high_risk", "critical_risk"];
const CAUSE_TAGS = [
  "email_back_and_forth",
  "availability_conflicts",
  "ownership_confusion",
  "stakeholder_delay",
  "no_next_step",
  "calendar_mismatch",
  "reminder_missing",
];
const WORKFLOWS = [
  "ask_sales_question",
  "validation_path",
  "education_path",
  "optimization_workflow",
  "diagnostic_education",
  "sales_alert",
  "role_clarification",
];
const FEATURE_REGISTRY = [
  "scheduling_links",
  "real_time_availability",
  "routing_rules",
  "group_scheduling",
  "event_type_templates",
  "recurring_scheduling",
  "calendar_sync",
  "automated_reminders",
  "booking_pages",
  "embedded_booking",
  "scheduling_analytics",
];

function extractKeywordsFromText(t: string) {
  const words = (t || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);
}

async function refineSectionQuestions(
  openaiClient: any,
  pageUrl: string,
  pageType: string,
  sectionId: string,
  sectionName: string,
  sectionText: string,
  sectionSummary: string,
  sectionType: "hero" | "availability" | "roi" | "security",
  variant: boolean,
) {
  try {
    const keywords = extractKeywordsFromText(sectionText);
    const resp = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 900,
      messages: [
        {
          role: "system",
          content:
            "You are generating deterministic conversation configuration for a diagnostic sales assistant. Do not pitch, sell, or use CTAs. Keep writing concise and factual. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Generate Lead and Sales questions with options for the given section.
Follow these rules exactly:

1) Question Requirements
- Lead must match section intent:
  - Hero → scheduling friction
  - Availability → availability rules & constraints
  - ROI → desired business outcome
  - Security → compliance & data governance
- Sales must be the next logical diagnostic step for the same intent.

2) Option Requirements
Each option must be an object:
{ "label": "", "tags": [], "workflow": "" }

3) Tag Rules
- Tags per option only; snake_case
- Allowed tag types: cause-based, readiness-based, risk-based

4) Workflow Rules (one per option):
- optimization_workflow, validation_path, education_path, diagnostic_education, sales_alert, role_clarification

Workflow decision logic:
- Problem → diagnostic_education
- Desired outcome → optimization_workflow
- Advanced user → validation_path
- Confusion → education_path
- Security/compliance risk → sales_alert
- Wrong persona → role_clarification

5) Final Output JSON ONLY:
{
  "lead": { "question": "", "options": [] },
  "sales": { "question": "", "options": [] }
}

Context:
page_url: ${pageUrl}
page_type: ${pageType}
section_id: ${sectionId}
section_heading: ${sectionName}
section_summary: ${sectionSummary}
section_type: ${sectionType}
keywords_in_section: ${JSON.stringify(keywords)}
${variant ? "variant_directive: Generate an alternative question within the same intent, distinct from the previous." : ""}
`,
        },
      ],
    });
    const txt = resp.choices[0]?.message?.content || "";
    const data = JSON.parse(txt);
    return data;
  } catch {
    return null;
  }
}

// Auto-extract personas after crawling is complete
import { generateBantFromContent } from "@/lib/bant-generation";

async function autoGenerateBantConfig(adminId: string) {
  try {
    const db = await getDb();
    const crawledPages = db.collection("crawled_pages");

    // Get crawled content for this admin
    const pages = await crawledPages
      .find({ adminId })
      .sort({ created_at: -1 }) // Get most recent pages
      .limit(10)
      .toArray();

    if (pages.length === 0) {
      console.log(`[BANT] No content found for adminId: ${adminId}`);
      return;
    }

    const context = pages
      .map(
        (p) =>
          `URL: ${p.url}\nTitle: ${p.title}\nContent Summary: ${p.text.substring(0, 500)}...`,
      )
      .join("\n\n");

    const newConfig = await generateBantFromContent(adminId, context);

    // Save to DB
    const bantCollection = db.collection("bant_configurations");
    await bantCollection.updateOne(
      { adminId },
      { $set: newConfig },
      { upsert: true },
    );
    console.log(`[BANT] Auto-generated global BANT config for ${adminId}`);
  } catch (error) {
    console.error("[BANT] Auto-generation failed:", error);
  }
}

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
      "decisionMaker": true|false,
      "bantQuestions": {
        "budget": [
          { "question": "What is your expected monthly budget?", "options": ["Under $500", "$500-$2k", "$2k-$5k", "$5k+"] }
        ],
        "authority": [
          { "question": "Are you the final decision maker?", "options": ["Yes, I decide", "I need approval", "I'm researching"] }
        ],
        "need": [
          { "question": "What is your biggest challenge right now?", "options": ["High costs", "Low efficiency", "Compliance", "Other"] }
        ],
        "timeline": [
          { "question": "When are you looking to implement this?", "options": ["Immediately", "1-3 months", "3-6 months", "Just looking"] }
        ]
      }
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
- For "bantQuestions", generate 2-3 specific, relevant qualification questions for EACH category (Budget, Authority, Need, Timeline).
  - For EACH question, provide 3-4 "options" that the user can click as quick replies.
  - Budget questions should match their likely financial scale.
  - Authority questions should respect their role.
  - Need questions should probe their specific pain points.
  - Timeline questions should relate to their urgency level.
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
      }),
    );

    const personaDocument = {
      adminId,
      ...extracted,
      extractedAt: new Date(),
      updatedAt: new Date(),
    };

    await personas.replaceOne({ adminId }, personaDocument, { upsert: true });

    console.log(
      `[Persona] Successfully extracted ${extracted.targetAudiences.length} personas for adminId: ${adminId}`,
    );
  } catch (error) {
    console.error(
      `[Persona] Error extracting personas for adminId ${adminId}:`,
      error,
    );
    throw error;
  }
}

async function parseSitemap(
  sitemapUrl: string,
  depth: number = 0,
): Promise<string[]> {
  if (depth > 3) {
    console.log(`[Sitemap] Max recursion depth reached for ${sitemapUrl}`);
    return [];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(sitemapUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error("Failed to fetch sitemap");
    const xml = await res.text();

    console.log(`[Sitemap] XML size: ${xml.length} characters`);

    const $ = cheerio.load(xml, { xmlMode: true });
    const urls: string[] = [];

    // Check for sitemap index (recursive)
    const childSitemaps = $("sitemap > loc");
    if (childSitemaps.length > 0) {
      console.log(
        `[Sitemap] Found sitemap index with ${childSitemaps.length} sitemaps at ${sitemapUrl}`,
      );
      const sitemapUrls: string[] = [];
      childSitemaps.each((_, el) => {
        const loc = $(el).text().trim();
        if (loc) sitemapUrls.push(loc);
      });

      // Process sub-sitemaps sequentially to avoid overwhelming
      for (const url of sitemapUrls) {
        try {
          const nestedUrls = await parseSitemap(url, depth + 1);
          urls.push(...nestedUrls);
        } catch (err) {
          console.error(`[Sitemap] Failed to parse sub-sitemap ${url}:`, err);
        }
      }
    }

    // Check for standard URL set
    const pageLocs = $("url > loc");
    if (pageLocs.length > 0) {
      console.log(
        `[Sitemap] Found ${pageLocs.length} page URLs at ${sitemapUrl}`,
      );
      pageLocs.each((_, el) => {
        const loc = $(el).text().trim();
        if (loc) urls.push(loc);
      });
    }

    // Fallback: If specific tags not found, try generic regex as last resort
    // (This helps with malformed XML or unusual namespaces)
    if (urls.length === 0) {
      console.log(
        `[Sitemap] No strict structure found, trying generic regex for ${sitemapUrl}`,
      );
      const matches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
      for (const match of matches) {
        urls.push(match[1].trim());
      }
    }

    console.log(
      `[Sitemap] Total URLs extracted from ${sitemapUrl}: ${urls.length}`,
    );
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
    const res = await fetch(`${origin}/robots.txt`, {
      signal: controller.signal,
    });
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
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
            document.querySelectorAll("a[href]"),
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
        },
      );

      console.log(
        `[JSCrawl] Scroll attempt ${
          scrollAttempts + 1
        }: Found ${currentLinkCount} total links, ${currentContentCount} content links`,
      );

      // If no new links were loaded after scrolling, try a few more times
      if (scrollAttempts > 2 && currentLinkCount === previousLinkCount) {
        console.log(
          `[JSCrawl] No new content loaded, trying 2 more attempts...`,
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
            `[JSCrawl] Still no new content, stopping infinite scroll`,
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
      `[JSCrawl] Finished scrolling after ${scrollAttempts} attempts`,
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
        document.querySelectorAll("a[href]"),
      ).filter((el) => {
        const href = el.getAttribute("href");
        return href && contentPatterns.some((pattern) => pattern.test(href));
      }).length;

      return { totalLinks: allLinks, contentLinks };
    });

    console.log(
      `[JSCrawl] Final counts after infinite scroll: ${finalCounts.totalLinks} total links, ${finalCounts.contentLinks} content links`,
    );

    // Extract all links from the rendered page with enhanced deduplication
    const links = await page.evaluate((currentUrl) => {
      const linkElements = document.querySelectorAll("a[href]");
      const foundLinks = new Set<string>();
      const processedHrefs = new Set<string>(); // Track processed hrefs to avoid duplicates

      console.log(
        `[JSCrawl-Browser] Found ${linkElements.length} link elements on page`,
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
              isSameDomain(linkUrl.hostname, pageUrlObj.hostname)
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
                cleanUrl.includes(pattern),
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
                  pattern.test(cleanUrl),
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
                    `[JSCrawl-Browser] Found ${linkType} link: ${cleanUrl}`,
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
        contentPatterns.some((cp) => cp.pattern.test(url)),
      );

      console.log(
        `[JSCrawl-Browser] Total unique links extracted: ${allLinks.length}`,
      );
      console.log(
        `[JSCrawl-Browser] Content-related links: ${contentLinks.length}`,
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
      `[JSCrawl] Found ${links.length} links with JavaScript rendering`,
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
      `[LinkExtract] Response for ${pageUrl}: ${res.status} ${res.statusText}`,
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch page: ${pageUrl} (Status: ${res.status} ${res.statusText})`,
      );
    }

    // Use final URL after redirects for base resolution
    const finalUrl = res.url;
    console.log(`[LinkExtract] Final URL after redirects: ${finalUrl}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    const links = new Set<string>();

    // Add the original page itself (and the final URL if different)
    links.add(pageUrl);
    if (finalUrl !== pageUrl) {
      links.add(finalUrl);
    }

    // Extract all links from the page with more comprehensive selectors
    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");
      if (href) {
        try {
          // Convert relative URLs to absolute using final URL
          const absoluteUrl = new URL(href, finalUrl).href;

          // Only include HTTP/HTTPS URLs from the same domain
          const pageUrlObj = new URL(finalUrl);
          const linkUrlObj = new URL(absoluteUrl);

          if (
            linkUrlObj.protocol.startsWith("http") &&
            isSameDomain(linkUrlObj.hostname, pageUrlObj.hostname)
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
              cleanUrl.includes(pattern),
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
      `[LinkExtract] Total links found on ${pageUrl}: ${pageLinks.length}`,
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
      0,
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
  totalUrls: number,
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
    pattern.test(inputUrl),
  );

  // Check if URL contains any content-related keywords
  const hasContentKeywords =
    urlAnalysis.detectedPatterns.length > 0 ||
    /\/(blog|post|article|slide|news|help|guide|tutorial|doc|support|resource|case-stud|faq)/i.test(
      inputUrl,
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
      hasMinimalLinks,
    ),
  };
}

function calculateConfidence(
  isListingPage: boolean,
  hasContentKeywords: boolean,
  hasMinimalContent: boolean,
  hasZeroContent: boolean,
  hasMinimalLinks: boolean,
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
  inputUrl: string,
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
              `[Discovery] Found ${urls.length} URLs via candidate sitemap: ${candidate}`,
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
      `[Discovery] Found ${urls.length} URLs by crawling webpage links`,
    );

    // Intelligent content detection - analyze URL patterns dynamically
    const urlAnalysis = analyzeUrlPatterns(urls, inputUrl);

    console.log(`[Discovery] URL Analysis:`, urlAnalysis);
    console.log(
      `[Discovery] Potential content URLs found: ${urlAnalysis.contentUrls.length}`,
    );
    console.log(
      `[Discovery] Content patterns detected:`,
      urlAnalysis.detectedPatterns,
    );

    const totalUrls = urls.length;
    const contentUrls = urlAnalysis.contentUrls.length;

    // Intelligent detection: check if this looks like a dynamic content page
    const isDynamicContentPage = detectDynamicContentPage(
      inputUrl,
      urlAnalysis,
      totalUrls,
    );

    console.log(
      `[Discovery] Dynamic content page detection:`,
      isDynamicContentPage,
    );

    if (isDynamicContentPage.shouldUseJavaScript) {
      console.log(
        `[Discovery] Detected dynamic content page (confidence: ${isDynamicContentPage.confidence.toFixed(
          2,
        )}). ` +
          `Reasons: ${Object.entries(isDynamicContentPage.reasons)
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(", ")}. Trying JS crawling...`,
      );

      try {
        const jsUrls = await extractLinksUsingBrowser(inputUrl);
        const jsUrlAnalysis = analyzeUrlPatterns(jsUrls, inputUrl);
        const jsContentUrls = jsUrlAnalysis.contentUrls.length;

        console.log(`[Discovery] JS Analysis:`, jsUrlAnalysis);

        // If JavaScript rendering found more content URLs, use those results
        if (jsUrls.length > totalUrls || jsContentUrls > contentUrls) {
          console.log(
            `[Discovery] JavaScript rendering found more content! Using JS results.`,
          );
          console.log(
            `[Discovery] Content patterns found:`,
            jsUrlAnalysis.detectedPatterns
              .map((p) => `${p.name}: ${p.count}`)
              .join(", "),
          );

          // Ensure no duplicates in the final result
          const uniqueJsUrls = Array.from(new Set(jsUrls));
          console.log(
            `[Discovery] Final unique URLs: ${uniqueJsUrls.length} (removed ${
              jsUrls.length - uniqueJsUrls.length
            } duplicates)`,
          );

          return { urls: uniqueJsUrls, type: "javascript" };
        }
      } catch (jsError) {
        console.log(
          `[Discovery] JavaScript crawling failed, falling back to regular results:`,
          jsError,
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
        } duplicate URLs from webpage results`,
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
  depth: number = 0,
): Promise<string> {
  // Prevent infinite redirect loops
  if (depth > 5) {
    console.log(`[Crawl] Max redirect depth reached for ${url}`);
    throw new Error(`Too many redirects for ${url}`);
  }

  // Check if this is a slide page - force JavaScript rendering
  if (url.includes("/slide")) {
    console.log(
      `[Crawl] Detected slide page, forcing JavaScript extraction: ${url}`,
    );
    try {
      const jsText = await extractTextUsingBrowser(url);
      console.log(
        `[Crawl] JavaScript extraction for slide page returned ${jsText.length} chars`,
      );
      if (jsText.length > 100) {
        return jsText;
      }
      console.log(
        `[Crawl] JavaScript extraction returned minimal content, trying regular extraction as fallback`,
      );
    } catch (jsError) {
      console.log(
        `[Crawl] JavaScript extraction failed for slide page, trying regular extraction:`,
        jsError,
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
      `[ExtractText] Fetch completed in ${fetchEnd - fetchStart}ms for: ${url}`,
    );
    console.log(
      `[ExtractText] Response status: ${res.status} ${res.statusText}`,
    );
    console.log(
      `[ExtractText] Response headers: ${JSON.stringify(
        Object.fromEntries(res.headers.entries()),
      )}`,
    );

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(
        `Failed to fetch page: ${url} (Status: ${res.status} ${res.statusText})`,
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
          `[Crawl] Following meta redirect from ${url} to ${redirectUrl}`,
        );

        // Handle relative URLs by converting to absolute
        if (!redirectUrl.startsWith("http")) {
          try {
            const baseUrl = new URL(url);
            redirectUrl = new URL(redirectUrl, baseUrl.origin).href;
            console.log(
              `[Crawl] Converted relative URL to absolute: ${redirectUrl}`,
            );
          } catch (urlError) {
            console.log(
              `[Crawl] Failed to convert relative URL: ${redirectUrl}`,
              urlError,
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
    $(
      "header, nav, footer, aside, .site-header, .site-footer, .navbar, .global-nav, .global-header, .cookie-banner, .newsletter, .modal, .offcanvas",
    ).remove();

    const NOISE_PATTERNS = [
      /log\s*in/i,
      /sign\s*up/i,
      /get\s*a\s*demo/i,
      /talk\s*to\s*sales/i,
      /pricing/i,
      /help\s*center/i,
      /resource\s*center/i,
      /developer\s*tools/i,
      /become\s*a\s*partner/i,
      /careers/i,
    ];
    const isNoiseText = (t: string) => NOISE_PATTERNS.some((re) => re.test(t));
    const normalize = (t: string) => t.replace(/\s+/g, " ").trim();

    const scope =
      $("main, [role='main']").length > 0
        ? $("main, [role='main']")
        : $("article").length > 0
          ? $("article")
          : $("body");

    const sections: string[] = [];
    let currentTitle = "";
    let currentContent: string[] = [];
    let sectionCount = 0;
    const seenBodies = new Set<string>();

    const pushSection = () => {
      const rawBody = normalize(currentContent.join(" "));
      const body = rawBody
        .split(" ")
        .filter((w) => w.length > 0)
        .join(" ");
      if (!body || body.length < 60) {
        currentTitle = "";
        currentContent = [];
        return;
      }
      // Only filter noise if text is relatively short (less than 300 chars)
      // This prevents dropping long valid sections that just happen to contain a "Sign up" button
      if (body.length < 300 && isNoiseText(body)) {
        currentTitle = "";
        currentContent = [];
        return;
      }
      // Infer title if missing
      let title = normalize(currentTitle);
      if (!title) {
        title = body.split(".")[0].split(" ").slice(0, 8).join(" ");
      }
      // Suppress global promo banners commonly reused
      if (
        /the state of meetings 2024/i.test(title) &&
        !/report|state/i.test(url)
      ) {
        currentTitle = "";
        currentContent = [];
        return;
      }
      const key = (title + "::" + body.slice(0, 300)).toLowerCase();
      if (seenBodies.has(key)) {
        currentTitle = "";
        currentContent = [];
        return;
      }
      seenBodies.add(key);
      sectionCount += 1;
      sections.push(`[SECTION ${sectionCount}] ${title}\n${body}`);
      currentTitle = "";
      currentContent = [];
    };

    scope.find("h1, h2, h3, h4, p, li").each((_, el) => {
      const tagName = (el as any).tagName
        ? (el as any).tagName.toLowerCase()
        : "";
      const elText = normalize($(el).text());
      if (!elText) return;

      if (/^h[1-4]$/.test(tagName)) {
        if (currentTitle || currentContent.length) pushSection();
        currentTitle = elText;
        currentContent = [];
      } else {
        currentContent.push(elText);
      }
    });
    if (currentTitle || currentContent.length) pushSection();

    const text =
      sections.length > 0
        ? sections.join("\n\n")
        : scope.text().replace(/\s+/g, " ").trim();

    console.log(
      `[ExtractText] SUCCESS - Extracted ${text.length} chars from ${url}`,
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
        `[Crawl] Content seems minimal (${text.length} chars) or slide page with little content, trying JavaScript extraction...`,
      );
      try {
        const jsText = await extractTextUsingBrowser(url);
        if (jsText.length > text.length) {
          console.log(
            `[Crawl] JavaScript extraction found more content (${jsText.length} vs ${text.length} chars)`,
          );
          return jsText;
        }
      } catch (jsError) {
        console.log(
          `[Crawl] JavaScript extraction failed, using regular content:`,
          jsError,
        );
      }
    }

    // If the text is too short (likely a redirect page), log it
    if (text.length < 100) {
      console.log(
        `[Crawl] Warning: Very short content for ${url} (${
          text.length
        } chars): ${text.substring(0, 100)}`,
      );
    }

    return text;
  } catch (error) {
    console.log(
      `[Crawl] Regular extraction failed for ${url}, trying JavaScript extraction:`,
      error,
    );
    // If regular extraction fails completely, try JavaScript as fallback
    try {
      return await extractTextUsingBrowser(url);
    } catch (jsError) {
      console.error(
        `[Crawl] Both regular and JavaScript extraction failed for ${url}:`,
        jsError,
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
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    // Navigate and wait for content to load
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for dynamic content - longer wait for slides
    const waitTime = url.includes("/slide") ? 5000 : 3000;
    console.log(
      `[JSExtract] Waiting ${waitTime}ms for dynamic content to load...`,
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // For slide pages, try scrolling to load more content
    if (url.includes("/slide")) {
      console.log(
        `[JSExtract] Slide page detected, attempting scroll to load content...`,
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
      `[JSExtract] Extracted ${text.length} characters with JS rendering`,
    );

    return text;
  } catch (error) {
    console.error(
      `[JSExtract] Error during JavaScript text extraction:`,
      error,
    );
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function POST(req: NextRequest) {
  // Clone the request to read body without consuming it for processBatch
  const clone = req.clone();
  let body;
  try {
    body = await clone.json();
  } catch (e) {
    return processBatch(req);
  }

  // Get Admin ID (needed for stop action and background loop)
  let adminId: string | null = null;
  const cookieAuth = verifyAdminTokenFromCookie(req);
  if (cookieAuth) {
    adminId = cookieAuth.adminId;
  } else {
    const headerAuth = verifyAdminToken(req);
    if (headerAuth) {
      adminId = headerAuth.adminId;
    }
  }
  // Fallback to API key if needed
  if (!adminId) {
    const apiKey =
      req.headers.get("x-api-key") ||
      req.headers.get("X-API-Key") ||
      req.headers.get("api-key") ||
      req.headers.get("Api-Key");
    if (apiKey) {
      const apiAuth = await verifyApiKey(apiKey);
      if (apiAuth) adminId = apiAuth.adminId;
    }
  }

  // Handle Stop Action
  if (body.action === "stop") {
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = await getDb();
    const crawlStates = db.collection("crawl_states");
    await crawlStates.updateOne(
      { adminId },
      { $set: { status: "stopped", updatedAt: new Date() } },
      { upsert: true },
    );
    console.log(`[Sitemap] Stop signal received for admin ${adminId}`);
    return NextResponse.json({ message: "Stop signal received" });
  }

  if (!body.background) {
    return processBatch(req);
  }

  const cookieToken = req.cookies.get("auth_token")?.value;
  let token = cookieToken;
  if (!token) {
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");
    if (authHeader) {
      const match = authHeader.match(/Bearer\s+(.+)/i);
      token = match ? match[1] : authHeader;
    }
  }

  const sitemapUrl = body.sitemapUrl;
  if (!sitemapUrl) {
    return NextResponse.json({ error: "Missing sitemapUrl" }, { status: 400 });
  }

  const internalUrl = new URL("/api/sitemap", req.nextUrl.origin).toString();

  // Start background crawl process (Fire and Forget)
  (async () => {
    try {
      console.log("[BackgroundCrawl] Starting background crawl process...");

      // Set status to running
      if (adminId) {
        const db = await getDb();
        await db
          .collection("crawl_states")
          .updateOne(
            { adminId },
            { $set: { status: "running", updatedAt: new Date() } },
            { upsert: true },
          );
      }

      let hasMore = true;
      let batchCount = 0;
      const MAX_BATCHES = 50; // Safety limit: ~300 pages

      while (hasMore && batchCount < MAX_BATCHES) {
        // Check for stop signal
        if (adminId) {
          const db = await getDb();
          const state = await db
            .collection("crawl_states")
            .findOne({ adminId });
          if (state?.status === "stopped") {
            console.log(
              `[BackgroundCrawl] Stop signal detected for admin ${adminId}. Aborting.`,
            );
            break;
          }
        }

        console.log(`[BackgroundCrawl] Processing batch ${batchCount + 1}...`);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Cookie"] = `auth_token=${token}`;
          headers["Authorization"] = `Bearer ${token}`;
        }

        const resp = await fetch(internalUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({ sitemapUrl, background: false }),
        });

        if (!resp.ok) {
          console.error(
            `[BackgroundCrawl] Batch ${batchCount + 1} failed: ${resp.status} ${
              resp.statusText
            }`,
          );
          break;
        }

        let data: any = null;
        try {
          data = await resp.json();
        } catch (e) {
          console.error(`[BackgroundCrawl] Failed to parse JSON response`, e);
          break;
        }

        hasMore = data?.hasMorePages || false;
        batchCount++;

        if (hasMore) {
          // Small delay to prevent overwhelming the server
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
      console.log(
        `[BackgroundCrawl] Process completed after ${batchCount} batches`,
      );
    } catch (err) {
      console.error("[BackgroundCrawl] Background process error:", err);
    }
  })();

  return NextResponse.json(
    {
      message: "Crawl started in background",
      status: "started",
      details:
        "Pages are being crawled in the background. They will appear in the dashboard as they are processed.",
    },
    { status: 200 },
  );
}

async function processBatch(req: NextRequest) {
  const startTime = Date.now();
  const MAX_EXECUTION_TIME = 270000; // 270 seconds (30 seconds buffer before Vercel timeout)

  console.log(`[Sitemap] POST request received at ${new Date().toISOString()}`);
  console.log(
    `[Sitemap] Request headers:`,
    Object.fromEntries(req.headers.entries()),
  );

  let adminId: string | null = null;

  const cookieToken = req.cookies.get("auth_token")?.value;
  let token = cookieToken;
  if (!token) {
    console.log(`[Sitemap] No auth cookie, checking Authorization header...`);
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");
    if (authHeader) {
      const match = authHeader.match(/Bearer\s+(.+)/i);
      token = match ? match[1] : authHeader;
    }
  }

  if (token) {
    console.log(`[Sitemap] Auth token found, verifying...`);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        email: string;
        adminId: string;
      };
      adminId = payload.adminId;
      console.log(`[Sitemap] Auth successful for adminId (JWT): ${adminId}`);
    } catch (authError) {
      console.log(`[Sitemap] JWT auth failed:`, authError);
    }
  } else {
    console.log(`[Sitemap] No JWT token provided (cookie or header)`);
  }

  if (!adminId) {
    const apiKey =
      req.headers.get("x-api-key") ||
      req.headers.get("X-API-Key") ||
      req.headers.get("api-key") ||
      req.headers.get("Api-Key");
    if (apiKey) {
      console.log(`[Sitemap] Trying API key authentication...`);
      const apiAuth = await verifyApiKey(apiKey);
      if (apiAuth) {
        adminId = apiAuth.adminId;
        console.log(
          `[Sitemap] Auth successful for adminId (API key): ${adminId}`,
        );
      } else {
        console.log(`[Sitemap] API key authentication failed`);
      }
    }
  }

  if (!adminId) {
    console.log(`[Sitemap] No valid authentication found`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(`[Sitemap] Parsing request body...`);
  const body = await req.json();
  console.log(`[Sitemap] Request body:`, JSON.stringify(body, null, 2));

  const { sitemapUrl, retryUrl } = body;

  if (retryUrl) {
    console.log(`[Retry] Retrying crawl for: ${retryUrl}`);
    const db = await getDb();
    const sitemapUrls = db.collection("sitemap_urls");
    const pages = db.collection("crawled_pages");
    const pineconeVectors = db.collection("pinecone_vectors");

    // Find the failed entry to get context (sitemapUrl)
    const failedEntry = await sitemapUrls.findOne({ adminId, url: retryUrl });
    if (!failedEntry) {
      return NextResponse.json(
        { error: "URL not found in history" },
        { status: 404 },
      );
    }

    const sitemapUrlContext = failedEntry.sitemapUrl;

    // Reset status
    await sitemapUrls.updateOne(
      { _id: failedEntry._id },
      {
        $unset: { failedAt: 1, error: 1 },
        $set: { recrawlAt: new Date(), recrawlReason: "user_retry" },
      },
    );

    try {
      console.log(`[Retry] Extracting text from: ${retryUrl}`);
      const text = await extractTextFromUrl(retryUrl);

      // Generate basic summary
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

      // Generate structured summary
      let structuredSummary: any = null;
      if (text && text.trim().length > 0) {
        try {
          console.log(
            `[Retry] Generating structured summary for ${retryUrl}...`,
          );
          const structuredSummaryResponse =
            await openai.chat.completions.create({
              model: "gpt-4o-mini",
              response_format: { type: "json_object" },
              messages: [
                {
                  role: "system",
                  content:
                    "You are an expert web page analyzer. Your goal is to deconstruct a web page into its distinct logical sections based on the provided [SECTION N] markers and extract key business intelligence for EACH section.\n\nFor EACH section detected, generate:\n1. A Section Title (inferred from content).\n2. EXACTLY TWO Lead Questions (Problem Recognition) with options mapping to customer states/risks.\n3. EXACTLY TWO Sales Questions (Diagnostic) with options mapping to root causes.\n4. For each Sales Question, generate a specific 'Option Flow' for EACH option, containing a Diagnostic Answer, Follow-Up Question, Feature Mapping, and Loop Closure.\n\nReturn ONLY a valid JSON object. Do not include markdown.",
                },
                {
                  role: "user",
                  content: `Analyze this web page content:

${text}

Extract and return a JSON object with this exact structure:
{
  "pageType": "homepage|pricing|features|about|contact|blog|product|service",
  "businessVertical": "fitness|healthcare|legal|restaurant|saas|ecommerce|consulting|other",
  "sections": [
    {
      "sectionName": "Inferred Title (e.g., Onboarding Momentum, Renewals)",
      "sectionSummary": "Brief summary",
      "leadQuestions": [
        {
          "question": "Problem Recognition Question (e.g., What usually happens after...?)",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "tags": ["tag_for_opt1", "tag_for_opt2", "tag_for_opt3", "tag_for_opt4"],
          "workflow": "ask_sales_question|educational_insight|validation"
        },
        {
          "question": "Second state-recognition question",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "tags": ["tag_for_optA", "tag_for_optB", "tag_for_optC", "tag_for_optD"],
          "workflow": "ask_sales_question|educational_insight|validation"
        }
      ],
      "salesQuestions": [
        {
          "question": "Diagnostic Question (e.g., What prevents...?)",
          "options": ["Cause 1", "Cause 2", "Cause 3", "Cause 4"],
          "tags": ["cause_tag_1", "cause_tag_2", "cause_tag_3", "cause_tag_4"],
          "workflow": "diagnostic_response",
          "optionFlows": [
            {
              "forOption": "Cause 1",
              "diagnosticAnswer": "Empathic reflection and validation of the problem.",
              "followUpQuestion": "Specific follow-up to narrow down context.",
              "featureMappingAnswer": "Explanation of ONE specific feature that solves this cause.",
              "loopClosure": "Summary statement closing the loop."
            }
          ]
        },
        {
          "question": "Second diagnostic question",
          "options": ["Cause A", "Cause B", "Cause C", "Cause D"],
          "tags": ["cause_tag_a", "cause_tag_b", "cause_tag_c", "cause_tag_d"],
          "workflow": "diagnostic_response",
          "optionFlows": [
            {
              "forOption": "Cause A",
              "diagnosticAnswer": "Empathic reflection for cause A.",
              "followUpQuestion": "Follow-up for cause A.",
              "featureMappingAnswer": "Feature mapping for cause A.",
              "loopClosure": "Closing loop."
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANT REQUIREMENTS:
1. Use the [SECTION N] markers to delineate sections.
2. Generate EXACTLY TWO Lead Questions and EXACTLY TWO Sales Questions per section.
3. Ensure Lead Questions focus on identifying the user's current state or problem awareness.
4. Ensure Sales Questions focus on diagnosing the specific root cause of that problem.
5. The 'optionFlows' array MUST have an entry for every option in each Sales Question.
6. Tags should be snake_case (e.g., 'onboarding_delay').
`,
                },
              ],
              max_tokens: 800,
              temperature: 0.3,
            });

          const structuredText =
            structuredSummaryResponse.choices[0]?.message?.content;
          if (structuredText) {
            try {
              const parsed = JSON.parse(structuredText);
              structuredSummary = normalizeStructuredSummary(parsed);
            } catch (parseError) {
              console.error(
                `[Retry] Failed to parse structured summary JSON:`,
                parseError,
              );
            }
          }
          if (!structuredSummary && text && text.trim().length > 0) {
            const fallback = buildFallbackStructuredSummaryFromText(text);
            if (fallback) {
              structuredSummary = normalizeStructuredSummary(fallback);
              console.log(
                `[Retry] Using fallback structured summary for ${retryUrl}`,
              );
            }
          }
        } catch (summaryError) {
          console.error(
            `[Retry] Error generating structured summary:`,
            summaryError,
          );
        }
      }

      // Store page data
      const pageData: any = {
        adminId,
        url: retryUrl,
        text,
        summary: basicSummary,
        filename: retryUrl,
        createdAt: new Date(),
      };

      if (structuredSummary) {
        pageData.structuredSummary = structuredSummary;
        pageData.summaryGeneratedAt = new Date();
      }

      await pages.insertOne(pageData);

      // Mark as crawled
      await sitemapUrls.updateOne(
        { adminId, url: retryUrl, sitemapUrl: sitemapUrlContext },
        { $set: { crawled: true, crawledAt: new Date() } },
      );

      // Chunk and embed
      let chunks = chunkText(text);
      if (chunks.length === 0 && text.length > 10) {
        chunks = [text.trim()];
      }

      if (chunks.length > 0) {
        console.log(
          `[Retry] Creating embeddings for ${chunks.length} chunks...`,
        );
        try {
          const embeddings = await Promise.all(
            chunks.map(async (chunk) => {
              const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
              });
              return response.data[0].embedding;
            }),
          );

          const vectors = chunks.map((chunk, i) => ({
            id: `${retryUrl}-${i}`,
            values: embeddings[i],
            metadata: {
              url: retryUrl,
              text: chunk,
              chunkIndex: i,
              adminId,
              sitemapUrl: sitemapUrlContext,
              createdAt: new Date().toISOString(),
            },
          }));

          await index.upsert(vectors);

          // Backup vectors to MongoDB
          await pineconeVectors.deleteMany({ adminId, filename: retryUrl });
          const vectorDocs = vectors.map((v) => ({
            adminId,
            vectorId: v.id,
            filename: retryUrl,
            sitemapUrl: sitemapUrlContext,
            createdAt: new Date(),
          }));
          if (vectorDocs.length > 0) {
            await pineconeVectors.insertMany(vectorDocs);
          }
        } catch (embedError) {
          console.error(`[Retry] Error generating embeddings:`, embedError);
        }
      }

      return NextResponse.json({
        message: "Retry successful",
        url: retryUrl,
        crawled: true,
      });
    } catch (err) {
      console.error(`[Retry] Failed:`, err);
      // Mark as failed
      await sitemapUrls.updateOne(
        { _id: failedEntry._id },
        {
          $set: {
            failedAt: new Date(),
            error: err instanceof Error ? err.message : String(err),
          },
        },
      );
      return NextResponse.json(
        { error: err instanceof Error ? err.message : String(err) },
        { status: 500 },
      );
    }
  }

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
      // Clean and filter discovered URLs to the requested locale (reduces batch size)
      const cleanedUrls = urls.map((u) => u.trim().replace(/,$/, ""));
      if (discoveryType === "sitemap") {
        try {
          const u = new URL(normalizedUrl);
          const localeMatch = u.pathname.match(/\/hc\/(\w[\w-]*)/);
          const locale = localeMatch ? localeMatch[1] : null;
          const originHost = u.hostname;
          const filtered = cleanedUrls.filter((link) => {
            try {
              const lu = new URL(link);
              const sameHost = isSameDomain(lu.hostname, originHost);
              const sameLocale =
                !locale || lu.pathname.includes(`/hc/${locale}`);
              return sameHost && sameLocale;
            } catch {
              return false;
            }
          });
          urls = Array.from(new Set(filtered));
        } catch {
          urls = Array.from(new Set(cleanedUrls));
        }
      } else {
        urls = Array.from(new Set(cleanedUrls));
      }
      console.log(
        `[Crawl] Discovery SUCCESS - Found ${urls.length} URLs via ${discoveryType}`,
      );
      console.log(`[Crawl] First 5 URLs: ${urls.slice(0, 5).join(", ")}`);
    } catch (error) {
      console.error(`[Crawl] Discovery FAILED for ${normalizedUrl}:`, error);
      return NextResponse.json(
        { error: `Failed to discover URLs from the provided link: ${error}` },
        { status: 400 },
      );
    }

    console.log(`[Crawl] Connecting to database...`);
    const db = await getDb();

    // Reset crawl state to ensure we don't hit a stale stop signal
    const crawlStates = db.collection("crawl_states");
    await crawlStates.updateOne(
      { adminId },
      { $set: { status: "running", updatedAt: new Date() } },
      { upsert: true },
    );

    const pages = db.collection("crawled_pages");
    const sitemapUrls = db.collection("sitemap_urls");
    const adminSettings = await getAdminSettingsCollection();

    // Store the last submitted sitemapUrl for this admin
    await adminSettings.updateOne(
      { adminId },
      { $set: { lastSitemapUrl: sitemapUrl } },
      { upsert: true },
    );

    // Store all sitemap URLs for this admin with the specific sitemapUrl context
    const now = new Date();

    // Ensure no duplicate URLs before creating docs
    const uniqueUrls = Array.from(new Set(urls));
    if (uniqueUrls.length !== urls.length) {
      console.log(
        `[Crawl] Removed ${
          urls.length - uniqueUrls.length
        } duplicate URLs before storage`,
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
      const ops = sitemapUrlDocs.map((doc) => ({
        updateOne: {
          filter: {
            adminId: doc.adminId,
            url: doc.url,
            sitemapUrl: doc.sitemapUrl,
          },
          update: { $setOnInsert: doc },
          upsert: true,
        },
      }));
      const CHUNK = 500;
      for (let i = 0; i < ops.length; i += CHUNK) {
        const chunk = ops.slice(i, i + CHUNK);
        await sitemapUrls.bulkWrite(chunk, { ordered: false });
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
      `[Crawl] Checking ${crawledDocs.length} crawled URLs for missing vectors`,
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
            (v) => (v as { vectorId: string }).vectorId,
          );
          const result = await index.fetch(vectorIdList);
          const foundVectors = Object.keys(result.records || {}).length;
          console.log(
            `[Crawl] URL ${doc.url} has ${vectorIds.length} MongoDB records, ${foundVectors} Pinecone vectors`,
          );

          if (foundVectors === 0) {
            console.log(
              `[Crawl] URL ${doc.url} has MongoDB records but no Pinecone vectors - will re-crawl`,
            );
            problematicUrls.push(doc.url);
          }
        } catch (pineconeError) {
          console.log(
            `[Crawl] Error checking Pinecone for ${doc.url}:`,
            pineconeError,
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
          },
        );
      }
    }

    const results: { url: string; text: string }[] = [];
    const failedUrls: { url: string; error: string }[] = [];
    let totalChunks = 0;
    let crawlCount = 0;
    let timeoutReached = false;
    let updatedCrawledUrls = new Set<string>();
    const processedInSession = new Set<string>();

    while (true) {
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        console.log(
          `[Timeout] Total execution time limit reached before next batch.`,
        );
        timeoutReached = true;
        break;
      }

      // 1. Fetch pages already crawled FOR THIS SITEMAP
      const updatedCrawledDocs = await sitemapUrls
        .find({ adminId, crawled: true })
        .project({ url: 1, _id: 0 })
        .toArray();
      const sitemapCrawledSet = new Set(
        updatedCrawledDocs.map((doc: any) => doc.url),
      );

      // 2. Fetch pages crawled GLOBALLY for this admin (to avoid re-crawling content)
      const existingPagesDocs = await pages
        .find({ adminId })
        .project({ url: 1, _id: 0 })
        .toArray();
      const globalCrawledSet = new Set(
        existingPagesDocs.map((doc: any) => doc.url),
      );

      // 3. Remove problematic URLs from global set to force re-crawl
      problematicUrls.forEach((url) => globalCrawledSet.delete(url));

      // 4. Identify URLs that need processing (either crawl or status update)
      // We do NOT filter out globalCrawledSet here, because we want to iterate over them
      // and update their status in the sitemapUrls collection without re-fetching.
      const uncrawledUrls = urls
        .filter(
          (url) => !sitemapCrawledSet.has(url) && !processedInSession.has(url),
        )
        .slice(0, MAX_PAGES);

      if (uncrawledUrls.length === 0) {
        console.log(`[Crawl] No more URLs to crawl.`);
        break;
      }

      console.log(
        `[Crawl] Found ${problematicUrls.length} problematic URLs to re-crawl`,
      );
      console.log(
        `[Crawl] Will crawl ${uncrawledUrls.length} URLs in this batch`,
      );
      console.log(
        `[Crawl] URLs to crawl: ${uncrawledUrls.slice(0, 3).join(", ")}${
          uncrawledUrls.length > 3 ? "..." : ""
        }`,
      );

      for (const url of uncrawledUrls) {
        // Fast-Track: If already crawled globally, skip fetch but update sitemap status
        if (globalCrawledSet.has(url)) {
          console.log(
            `[Crawl] Skipping fetch for ${url} - already exists in global pages`,
          );
          await sitemapUrls.updateOne(
            { adminId, url, sitemapUrl },
            { $set: { crawled: true, crawledAt: new Date() } },
          );
          processedInSession.add(url);
          continue;
        }

        // Check for stop signal
        if (adminId) {
          const db = await getDb();
          const state = await db
            .collection("crawl_states")
            .findOne({ adminId });
          if (state?.status === "stopped") {
            console.log(
              `[ProcessBatch] Stop signal detected for admin ${adminId}. Aborting batch.`,
            );
            break;
          }
        }

        // Check if we're approaching the timeout limit
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        if (elapsedTime > MAX_EXECUTION_TIME) {
          console.log(
            `[Timeout] Execution time limit reached (${elapsedTime}ms > ${MAX_EXECUTION_TIME}ms)`,
          );
          console.log(
            `[Timeout] Processed ${crawlCount}/${uncrawledUrls.length} URLs before timeout`,
          );
          timeoutReached = true;
          break;
        }

        // Also check if we're close to timeout and have processed some URLs
        if (elapsedTime > MAX_EXECUTION_TIME - 30000 && crawlCount > 0) {
          console.log(
            `[Timeout] Approaching timeout limit with 30s buffer (${elapsedTime}ms)`,
          );
          console.log(
            `[Timeout] Stopping early after ${crawlCount}/${uncrawledUrls.length} URLs`,
          );
          timeoutReached = true;
          break;
        }

        crawlCount++;
        try {
          console.log(
            `[Crawl] [${crawlCount}/${uncrawledUrls.length}] Starting to crawl: ${url} (elapsed: ${elapsedTime}ms)`,
          );
          const crawlStartTime = Date.now();

          const text = await extractTextFromUrl(url);
          const endTime = Date.now();

          console.log(
            `[Crawl] [${crawlCount}/${
              uncrawledUrls.length
            }] SUCCESS - Extracted ${text.length} chars in ${
              endTime - crawlStartTime
            }ms from ${url}`,
          );
          console.log(`[Crawl] First 100 chars: ${text.slice(0, 100)}`);

          // Debug: Log if text is too short
          if (text.length < 50) {
            console.log(
              `[Crawl] WARNING: Very short content for ${url}:`,
              text,
            );
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
          let structuredSummary: any = null;
          if (text && text.trim().length > 0) {
            try {
              console.log(
                `[Crawl] Generating structured summary for ${url}...`,
              );
              const structuredSummaryResponse =
                await openai.chat.completions.create({
                  model: "gpt-4o-mini",
                  response_format: { type: "json_object" },
                  messages: [
                    {
                      role: "system",
                      content:
                        "You are an expert web page analyzer. Your goal is to deconstruct a web page into its distinct logical sections based on the provided [SECTION N] markers and extract key business intelligence for EACH section.\n\nFor EACH section detected, generate:\n1. A Section Title (inferred from content).\n2. EXACTLY ONE Lead Question (Problem Recognition) with options mapping to customer states/risks.\n3. EXACTLY ONE Sales Question (Diagnostic) with options mapping to root causes.\n4. For the Sales Question, generate a specific 'Option Flow' for EACH option, containing a Diagnostic Answer, Follow-Up Question, Feature Mapping, and Loop Closure.\n\nReturn ONLY a valid JSON object. Do not include markdown.",
                    },
                    {
                      role: "user",
                      content: `Analyze this web page content:

${text}

Extract and return a JSON object with this exact structure:
{
  "pageType": "homepage|pricing|features|about|contact|blog|product|service",
  "businessVertical": "fitness|healthcare|legal|restaurant|saas|ecommerce|consulting|other",
  "sections": [
    {
      "sectionName": "Inferred Title (e.g., Onboarding Momentum, Renewals)",
      "sectionSummary": "Brief summary",
      "leadQuestions": [
        {
          "question": "Problem Recognition Question (e.g., What usually happens after...?)",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "tags": ["tag_for_opt1", "tag_for_opt2", "tag_for_opt3", "tag_for_opt4"],
          "workflow": "ask_sales_question|educational_insight|validation"
        }
      ],
      "salesQuestions": [
        {
          "question": "Diagnostic Question (e.g., What prevents...?)",
          "options": ["Cause 1", "Cause 2", "Cause 3", "Cause 4"],
          "tags": ["cause_tag_1", "cause_tag_2", "cause_tag_3", "cause_tag_4"],
          "workflow": "diagnostic_response",
          "optionFlows": [
            {
              "forOption": "Cause 1",
              "diagnosticAnswer": "Empathic reflection and validation of the problem.",
              "followUpQuestion": "Specific follow-up to narrow down context.",
              "featureMappingAnswer": "Explanation of ONE specific feature that solves this cause.",
              "loopClosure": "Summary statement closing the loop."
            },
            {
              "forOption": "Cause 2",
              "diagnosticAnswer": "...",
              "followUpQuestion": "...",
              "featureMappingAnswer": "...",
              "loopClosure": "..."
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANT REQUIREMENTS:
1. Use the [SECTION N] markers to delineate sections.
2. Ensure Lead Questions focus on identifying the user's current state or problem awareness.
3. Ensure Sales Questions focus on diagnosing the specific root cause of that problem.
4. The 'optionFlows' array MUST have an entry for every option in the Sales Question.
5. Tags should be snake_case (e.g., 'onboarding_delay').
`,
                    },
                  ],
                  max_tokens: 800,
                  temperature: 0.3,
                });

              const structuredText =
                structuredSummaryResponse.choices[0]?.message?.content;
              if (structuredText) {
                try {
                  const parsed = JSON.parse(structuredText);
                  structuredSummary = normalizeStructuredSummary(parsed);
                  try {
                    const blocks = parseSectionBlocks(text);
                    if (Array.isArray(structuredSummary?.sections)) {
                      structuredSummary.sections = await Promise.all(
                        structuredSummary.sections.map(
                          async (sec: any, idx: number) => {
                            const name = String(
                              sec?.sectionName || `Section ${idx + 1}`,
                            );
                            const summary = String(sec?.sectionSummary || "");
                            const block = blocks.find(
                              (b) =>
                                b.title &&
                                name &&
                                b.title.toLowerCase() === name.toLowerCase(),
                            ) ||
                              blocks[idx] || { title: name, body: summary };
                            const lead = Array.isArray(sec.leadQuestions)
                              ? sec.leadQuestions[0]
                              : null;
                            const sales = Array.isArray(sec.salesQuestions)
                              ? sec.salesQuestions[0]
                              : null;
                            const sectionType = classifySectionType(
                              name,
                              summary,
                              String(block.body || ""),
                            );
                            // Always generate two variants (base + alternative)
                            const basePair = await refineSectionQuestions(
                              openai,
                              url,
                              String(structuredSummary?.pageType || "other"),
                              String(idx + 1),
                              name,
                              String(block.body || ""),
                              summary,
                              sectionType,
                              false,
                            );
                            const altPair = await refineSectionQuestions(
                              openai,
                              url,
                              String(structuredSummary?.pageType || "other"),
                              String(idx + 1),
                              name,
                              String(block.body || ""),
                              summary,
                              sectionType,
                              true,
                            );
                            const pairs = [basePair, altPair].filter(
                              (p) => p && typeof p === "object",
                            );
                            if (pairs.length > 0) {
                              // Map lead questions
                              sec.leadQuestions = pairs
                                .map((p) => p.lead)
                                .slice(0, 2)
                                .map((lq: any) => {
                                  let opts = Array.isArray(lq?.options)
                                    ? lq.options.map((o: any) =>
                                        String(o?.label || ""),
                                      )
                                    : [];
                                  if (opts.length < 2)
                                    opts = ["Option 1", "Option 2"];
                                  if (opts.length > 4) opts = opts.slice(0, 4);
                                  const tags = Array.isArray(lq?.options)
                                    ? Array.from(
                                        new Set(
                                          lq.options
                                            .flatMap((o: any) =>
                                              Array.isArray(o?.tags)
                                                ? o.tags
                                                : [],
                                            )
                                            .map((t: any) =>
                                              snakeTag(String(t)),
                                            ),
                                        ),
                                      )
                                    : [];
                                  return {
                                    question: String(lq?.question || ""),
                                    options: opts,
                                    tags,
                                    workflow:
                                      typeof lq?.workflow === "string"
                                        ? lq.workflow
                                        : "ask_sales_question",
                                  };
                                });
                              // Map sales questions
                              sec.salesQuestions = pairs
                                .map((p) => p.sales)
                                .slice(0, 2)
                                .map((sq: any) => {
                                  let opts = Array.isArray(sq?.options)
                                    ? sq.options.map((o: any) =>
                                        String(o?.label || ""),
                                      )
                                    : [];
                                  if (opts.length < 2)
                                    opts = ["Option 1", "Option 2"];
                                  if (opts.length > 4) opts = opts.slice(0, 4);
                                  const flowsRaw = Array.isArray(sq?.options)
                                    ? sq.options
                                    : [];
                                  const ensuredFlows = opts.map(
                                    (label: string) => {
                                      const match =
                                        flowsRaw.find(
                                          (o: any) =>
                                            String(o?.label || "") === label,
                                        ) || {};
                                      return {
                                        forOption: label,
                                        diagnosticAnswer: "",
                                        followUpQuestion: "",
                                        followUpOptions: [],
                                        featureMappingAnswer: "",
                                        loopClosure: "",
                                      };
                                    },
                                  );
                                  const tags = Array.isArray(sq?.options)
                                    ? Array.from(
                                        new Set(
                                          sq.options
                                            .flatMap((o: any) =>
                                              Array.isArray(o?.tags)
                                                ? o.tags
                                                : [],
                                            )
                                            .map((t: any) =>
                                              snakeTag(String(t)),
                                            ),
                                        ),
                                      )
                                    : [];
                                  return {
                                    question: String(sq?.question || ""),
                                    options: opts,
                                    tags,
                                    workflow: "diagnostic_response",
                                    optionFlows: ensuredFlows,
                                  };
                                });
                            }
                            return sec;
                          },
                        ),
                      );
                    }
                    structuredSummary =
                      normalizeStructuredSummary(structuredSummary);
                  } catch {}
                  console.log(
                    `[Crawl] Structured summary generated successfully for ${url}`,
                  );
                } catch (parseError) {
                  console.error(
                    `[Crawl] Failed to parse structured summary JSON for ${url}:`,
                    parseError,
                  );
                }
              }
            } catch (summaryError) {
              console.error(
                `[Crawl] Error generating structured summary for ${url}:`,
                summaryError,
              );
            }
          }
          if (!structuredSummary && text && text.trim().length > 0) {
            const fallback = buildFallbackStructuredSummaryFromText(text);
            if (fallback) {
              structuredSummary = normalizeStructuredSummary(fallback);
              try {
                const blocks = parseSectionBlocks(text);
                if (Array.isArray(structuredSummary?.sections)) {
                  structuredSummary.sections = await Promise.all(
                    structuredSummary.sections.map(
                      async (sec: any, idx: number) => {
                        const name = String(
                          sec?.sectionName || `Section ${idx + 1}`,
                        );
                        const summary = String(sec?.sectionSummary || "");
                        const block = blocks.find(
                          (b) =>
                            b.title &&
                            name &&
                            b.title.toLowerCase() === name.toLowerCase(),
                        ) ||
                          blocks[idx] || { title: name, body: summary };
                        const sectionType = classifySectionType(
                          name,
                          summary,
                          String(block.body || ""),
                        );
                        const basePair = await refineSectionQuestions(
                          openai,
                          url,
                          String(structuredSummary?.pageType || "other"),
                          String(idx + 1),
                          name,
                          String(block.body || ""),
                          summary,
                          sectionType,
                          false,
                        );
                        const altPair = await refineSectionQuestions(
                          openai,
                          url,
                          String(structuredSummary?.pageType || "other"),
                          String(idx + 1),
                          name,
                          String(block.body || ""),
                          summary,
                          sectionType,
                          true,
                        );
                        const pairs = [basePair, altPair].filter(
                          (p) => p && typeof p === "object",
                        );
                        if (pairs.length > 0) {
                          // Lead
                          sec.leadQuestions = pairs
                            .map((p) => p.lead)
                            .slice(0, 2)
                            .map((lq: any) => {
                              let opts = Array.isArray(lq?.options)
                                ? lq.options
                                : [];
                              opts = opts.map((o: any) => ({
                                label: String(o?.label || ""),
                                tags: Array.isArray(o?.tags)
                                  ? o.tags.map((t: any) => snakeTag(String(t)))
                                  : [],
                                workflow:
                                  typeof o?.workflow === "string"
                                    ? o.workflow
                                    : "education_path",
                              }));
                              if (opts.length < 2) {
                                while (opts.length < 2) {
                                  opts.push({
                                    label: `Option ${opts.length + 1}`,
                                    tags: [],
                                    workflow: "education_path",
                                  });
                                }
                              }
                              if (opts.length > 4) opts = opts.slice(0, 4);
                              return {
                                question: String(lq?.question || ""),
                                options: opts,
                                tags: [],
                                workflow: "validation_path",
                              };
                            });
                          // Sales
                          sec.salesQuestions = pairs
                            .map((p) => p.sales)
                            .slice(0, 2)
                            .map((sq: any) => {
                              let opts = Array.isArray(sq?.options)
                                ? sq.options
                                : [];
                              opts = opts.map((o: any) => ({
                                label: String(o?.label || ""),
                                tags: Array.isArray(o?.tags)
                                  ? o.tags.map((t: any) => snakeTag(String(t)))
                                  : [],
                                workflow:
                                  typeof o?.workflow === "string"
                                    ? o.workflow
                                    : "optimization_workflow",
                              }));
                              if (opts.length < 2) {
                                while (opts.length < 2) {
                                  opts.push({
                                    label: `Option ${opts.length + 1}`,
                                    tags: [],
                                    workflow: "optimization_workflow",
                                  });
                                }
                              }
                              if (opts.length > 4) opts = opts.slice(0, 4);
                              return {
                                question: String(sq?.question || ""),
                                options: opts,
                                tags: [],
                                workflow: "diagnostic_education",
                              };
                            });
                        }
                        return sec;
                      },
                    ),
                  );
                }
              } catch {}
              console.log(
                `[Crawl] Using fallback structured summary for ${url}`,
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

          // Use upsert to prevent duplicate entries for the same URL
          await pages.updateOne(
            { adminId, url },
            { $set: pageData },
            { upsert: true },
          );
          console.log(
            `[Crawl] Page data stored successfully${
              structuredSummary ? " with structured summary" : ""
            }`,
          );

          // Mark as crawled in sitemap_urls with specific sitemapUrl context
          console.log(`[Crawl] Marking URL as crawled in sitemap_urls...`);
          await sitemapUrls.updateOne(
            { adminId, url, sitemapUrl }, // Include sitemapUrl to ensure proper tracking
            { $set: { crawled: true, crawledAt: new Date() } },
          );
          // Chunk and embed for Pinecone
          let chunks = chunkText(text);
          console.log(`[Crawl] Chunks for ${url}:`, chunks.length);

          // Debug: If no chunks created, log why and try to create a minimal chunk
          if (chunks.length === 0) {
            console.log(
              `[Crawl] DEBUG: No chunks created for ${url}. Text length: ${text.length}. Sample text:`,
              text.slice(0, 200),
            );

            // If we have some text but no chunks, create a minimal chunk
            if (text.length > 10) {
              console.log(
                `[Crawl] Creating minimal chunk for short content...`,
              );
              chunks = [text.trim()];
            }
          }

          if (chunks.length > 0) {
            console.log(
              `[Crawl] Creating embeddings for ${chunks.length} chunks...`,
            );
            try {
              const embedResp = await openai.embeddings.create({
                input: chunks,
                model: "text-embedding-3-small",
              });
              const embeddings = embedResp.data.map(
                (d: { embedding: number[] }) => d.embedding,
              );
              const metadata = chunks.map((chunk, i) => ({
                filename: url,
                adminId,
                url,
                chunkIndex: i,
              }));

              // Clean up old vectors for this URL before adding new ones
              console.log(`[Crawl] Cleaning up old vectors for ${url}...`);
              await deleteChunksByUrl(url, adminId);

              console.log(
                `[Crawl] Upserting ${embeddings.length} embeddings to Pinecone...`,
              );
              await addChunks(chunks, embeddings, metadata);
              totalChunks += chunks.length;
              console.log(
                `[Crawl] SUCCESS - Processed ${url}: ${chunks.length} chunks, ${totalChunks} total chunks so far`,
              );
            } catch (embeddingError) {
              console.error(
                `[Crawl] EMBEDDING ERROR for ${url}:`,
                embeddingError,
              );
              if (embeddingError instanceof Error) {
                console.error(`[Crawl] Stack trace:`, embeddingError.stack);
              }
            }
          } else {
            console.log(
              `[Crawl] WARNING - No chunks created for ${url}. Text length: ${
                text.length
              }, Content: ${text.slice(0, 200)}`,
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
            },
          );
          failedUrls.push({
            url,
            error: err instanceof Error ? err.message : String(err),
          });
        }
        processedInSession.add(url);
      }

      if (timeoutReached) {
        break;
      }

      if (adminId) {
        const db = await getDb();
        const state = await db.collection("crawl_states").findOne({ adminId });
        if (state?.status === "stopped") {
          console.log(`[Crawl] Stop signal detected between batches.`);
          break;
        }
      }
    }

    const totalElapsedTime = Date.now() - startTime;

    // Recalculate remaining based on DB truth
    const finalCrawledCount = await sitemapUrls.countDocuments({
      adminId,
      sitemapUrl,
      crawled: true,
    });
    const totalRemaining = Math.max(0, urls.length - finalCrawledCount);
    const hasMorePages = totalRemaining > 0;

    console.log(
      `[Crawl] BATCH COMPLETE - Successfully crawled ${results.length} pages in ${totalElapsedTime}ms`,
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
      failedPages: failedUrls,
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
        `[Persona] Triggering auto-extraction of customer personas...`,
      );
      try {
        await extractPersonasForAdmin(adminId, normalizedUrl);
        await autoGenerateBantConfig(adminId);
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
      JSON.stringify(errorResponse, null, 2),
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
        { status: 401 },
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
    10,
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
      { status: 400 },
    );

  const db = await getDb();
  const pages = db.collection("crawled_pages");

  let deleteCount = 0;
  if (sitemapUrl) {
    // Delete all pages for this sitemap
    // First find all pages to get their URLs for chunk deletion
    const pagesToDelete = await pages
      .find({ adminId, filename: sitemapUrl })
      .project({ url: 1 })
      .toArray();

    const result = await pages.deleteMany({ adminId, filename: sitemapUrl });
    deleteCount = result.deletedCount || 0;

    // Delete chunks for each page found
    for (const p of pagesToDelete) {
      if (p.url) {
        await deleteChunksByUrl(p.url, adminId);
      }
    }
    // Also try to delete by filename in case some were stored that way
    await deleteChunksByFilename(sitemapUrl, adminId);
  } else if (url) {
    // Delete a single page
    const result = await pages.deleteMany({ adminId, url });
    deleteCount = result.deletedCount || 0;
    await deleteChunksByUrl(url, adminId);
  }

  return NextResponse.json({ success: true, deleted: deleteCount });
}
