import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { querySimilarChunks } from "@/lib/chroma";
import { getDb } from "@/lib/mongo";
import { getChunksByPageUrl } from "@/lib/chroma";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { chunkText } from "@/lib/chunkText";
import { addChunks } from "@/lib/chroma";
import { verifyApiKey } from "@/lib/auth";
import { createOrUpdateLead } from "@/lib/leads";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// Helper to extract text from URL with redirect handling (same as sitemap route)
async function extractTextFromUrl(
  url: string,
  depth: number = 0
): Promise<string> {
  // Prevent infinite redirect loops
  if (depth > 5) {
    console.log(`[OnDemandCrawl] Max redirect depth reached for ${url}`);
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
        `[OnDemandCrawl] Following meta redirect from ${url} to ${redirectUrl}`
      );

      // Handle relative URLs by converting to absolute
      if (!redirectUrl.startsWith("http")) {
        try {
          const baseUrl = new URL(url);
          redirectUrl = new URL(redirectUrl, baseUrl.origin).href;
          console.log(
            `[OnDemandCrawl] Converted relative URL to absolute: ${redirectUrl}`
          );
        } catch (urlError) {
          console.log(
            `[OnDemandCrawl] Failed to convert relative URL: ${redirectUrl}`,
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
      `[OnDemandCrawl] Warning: Very short content for ${url} (${
        text.length
      } chars): ${text.substring(0, 100)}`
    );
  }

  return text;
}

// Helper to count tokens using a simple estimation (4 chars per token)
function countTokens(text: string) {
  return Math.ceil(text.length / 4);
}

// Helper to split text into ~n-token chunks
async function splitTextIntoTokenChunks(text: string, chunkSize: number) {
  const words = text.split(" ");
  const chunks = [];
  let currentChunk = [];
  let currentTokenCount = 0;
  for (const word of words) {
    const wordTokenCount = countTokens(word);
    if (currentTokenCount + wordTokenCount > chunkSize) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [];
      currentTokenCount = 0;
    }
    currentChunk.push(word);
    currentTokenCount += wordTokenCount;
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }
  return chunks;
}

// Types for chat messages and mainText-like objects
type ChatMessage = {
  role: "user" | "assistant";
  content:
    | string
    | { mainText: string; buttons?: string[]; emailPrompt?: string };
  [key: string]: unknown;
};

type MainTextLike = string | { mainText: string };

// Add a simple intent detection function
function detectIntent({
  question,
  pageUrl,
}: {
  question?: string;
  pageUrl?: string;
}): string {
  const lowerQ = (question || "").toLowerCase();
  const lowerUrl = (pageUrl || "").toLowerCase();

  // Analytics and technology services intents
  if (
    lowerQ.includes("features") ||
    lowerQ.includes("feature") ||
    lowerUrl.includes("features")
  ) {
    return "exploring features";
  }
  if (
    lowerQ.includes("how") ||
    lowerQ.includes("works") ||
    lowerUrl.includes("how-it-works")
  ) {
    return "understanding how it works";
  }
  if (
    lowerQ.includes("solutions") ||
    lowerQ.includes("solution") ||
    lowerUrl.includes("solutions")
  ) {
    return "exploring solutions";
  }
  if (
    lowerQ.includes("pricing") ||
    lowerQ.includes("price") ||
    lowerUrl.includes("pricing")
  ) {
    return "pricing information";
  }
  if (
    lowerQ.includes("demo") ||
    lowerQ.includes("demonstration") ||
    lowerUrl.includes("demo")
  ) {
    return "requesting a demo";
  }
  if (
    lowerQ.includes("analytics") ||
    lowerQ.includes("data") ||
    lowerUrl.includes("analytics")
  ) {
    return "data analytics solutions";
  }
  if (
    lowerQ.includes("contact") ||
    lowerQ.includes("get started") ||
    lowerUrl.includes("contact")
  ) {
    return "getting started";
  }
  // Add more as needed for your specific business
  return "exploring services";
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    question,
    sessionId,
    pageUrl,
    proactive,
    adminId: adminIdFromBody,
    followup,
    hasBeenGreeted = false,
    proactiveMessageCount = 0,
    visitedPages = [],
  } = body;

  if ((!question && !proactive && !followup) || !sessionId)
    return NextResponse.json(
      {
        error:
          "No question, proactive, or followup flag, or no sessionId provided",
      },
      { status: 400, headers: corsHeaders }
    );

  // Check for API key authentication (for external widget usage)
  const apiKey = req.headers.get("x-api-key");
  let apiAuth = null;
  if (apiKey) {
    apiAuth = await verifyApiKey(apiKey);
    console.log("[DEBUG] apiAuth result:", apiAuth);
    if (!apiAuth) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401, headers: corsHeaders }
      );
    }
  }

  // Email detection regex
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  let detectedEmail: string | null = null;
  if (question && emailRegex.test(question.trim())) {
    detectedEmail = question.trim();
  }

  // Save to MongoDB
  const db = await getDb();
  const chats = db.collection("chats");
  const now = new Date();

  // Get adminId if available (prioritize API key auth, then request body, then previous chat)
  let adminId: string | null = null;
  if (apiAuth) {
    // Use adminId from API key authentication (highest priority)
    adminId = apiAuth.adminId;
    console.log(`[DEBUG] Using adminId from API key: ${adminId}`);
  } else if (adminIdFromBody) {
    adminId = adminIdFromBody;
    console.log(`[DEBUG] Using adminId from request body: ${adminId}`);
  } else {
    const lastMsg = await chats.findOne({
      sessionId,
      adminId: { $exists: true },
    });
    if (lastMsg && lastMsg.adminId) {
      adminId = lastMsg.adminId;
      console.log(`[DEBUG] Using adminId from previous chat: ${adminId}`);
    }
  }

  // If email detected, update all previous messages in this session with email and adminId
  if (detectedEmail) {
    const updateData: {
      email: string;
      adminId?: string;
      requirements?: string;
    } = {
      email: detectedEmail,
    };
    if (adminId) {
      updateData.adminId = adminId;
    }

    // Extract customer requirements using AI
    let extractedRequirements: string | null = null;
    let conversationHistory: {
      role: string;
      content: string;
      createdAt: Date;
    }[] = [];

    try {
      const historyDocs = await chats
        .find({ sessionId })
        .sort({ createdAt: 1 })
        .toArray();

      conversationHistory = historyDocs.map((doc) => ({
        role: doc.role as string,
        content: doc.content as string,
        createdAt: doc.createdAt as Date,
      }));

      const conversation = conversationHistory
        .map(
          (msg) =>
            `${msg.role === "user" ? "Customer" : "Assistant"}: ${msg.content}`
        )
        .join("\n");

      if (conversation.length > 50) {
        // Only analyze if there's meaningful conversation
        const requirementsPrompt = `Analyze this customer conversation and extract their key requirements, needs, or interests in 2-3 bullet points. Be specific and business-focused. If no clear requirements are mentioned, respond with "General inquiry".

Conversation:
${conversation}

Customer: ${question}

Extract key requirements (2-3 bullet points max, be concise):`;

        const requirementsResp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 150,
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content:
                "You are an expert at analyzing customer conversations to extract business requirements. Focus on specific needs, use cases, budget constraints, timeline requirements, technical specifications, or business goals. Be concise and actionable.",
            },
            { role: "user", content: requirementsPrompt },
          ],
        });

        extractedRequirements =
          requirementsResp.choices[0].message.content?.trim() || null;
        if (
          extractedRequirements &&
          extractedRequirements !== "General inquiry"
        ) {
          updateData.requirements = extractedRequirements;
          console.log(
            `[LeadGen] Extracted requirements for ${detectedEmail}: ${extractedRequirements}`
          );
        }
      }
    } catch (error) {
      console.error("[LeadGen] Error extracting requirements:", error);
      // Continue without requirements if AI analysis fails
    }

    // Update chat messages with email and adminId
    await chats.updateMany({ sessionId }, { $set: updateData });

    // Create or update lead in separate collection
    if (adminId) {
      try {
        const firstMessage =
          conversationHistory.length > 0
            ? conversationHistory[0].content
            : question || "";

        await createOrUpdateLead(
          adminId,
          detectedEmail,
          sessionId,
          extractedRequirements,
          pageUrl || undefined,
          firstMessage
        );

        console.log(
          `[LeadGen] Created/updated lead record for ${detectedEmail} with adminId: ${adminId}`
        );
      } catch (error) {
        console.error("[LeadGen] Error creating lead record:", error);
        // Continue even if lead creation fails
      }
    }

    // Log for verification
    console.log(
      `[LeadGen] Stored email for session ${sessionId}: ${detectedEmail} with adminId: ${adminId}`
    );
  }
  // Optionally, you could extract adminId from a cookie/JWT if you want admin-specific context

  // Proactive page-aware message
  if ((proactive || followup) && pageUrl) {
    console.log(
      `[DEBUG] Proactive request - pageUrl: ${pageUrl}, adminId: ${adminId}, proactive: ${proactive}, followup: ${followup}`
    );

    let pageChunks: string[] = [];
    if (adminId) {
      console.log(
        `[DEBUG] AdminId found: ${adminId}, checking sitemap for pageUrl: ${pageUrl}`
      );
      // Check if pageUrl is in sitemap_urls and if it's crawled
      const sitemapUrls = db.collection("sitemap_urls");
      const sitemapEntry = await sitemapUrls.findOne({ adminId, url: pageUrl });
      // LOG: adminId, pageUrl, sitemapEntry
      console.log(
        "[Proactive] adminId:",
        adminId,
        "pageUrl:",
        pageUrl,
        "sitemapEntry:",
        sitemapEntry
      );

      if (!sitemapEntry) {
        console.log(
          `[DEBUG] No sitemap entry found for pageUrl: ${pageUrl} with adminId: ${adminId}`
        );
        console.log(
          `[DEBUG] This means the page is not in your sitemap. Add it via admin panel.`
        );
      } else if (!sitemapEntry.crawled) {
        console.log(
          `[DEBUG] Sitemap entry found but page not crawled yet. Will crawl now.`
        );
      } else {
        console.log(`[DEBUG] Page found and crawled. Getting chunks...`);
      }
      if (sitemapEntry && !sitemapEntry.crawled) {
        // Crawl the page on demand with redirect handling
        try {
          console.log(`[OnDemandCrawl] Starting to crawl: ${pageUrl}`);
          const text = await extractTextFromUrl(pageUrl);
          console.log(
            `[OnDemandCrawl] Extracted text for ${pageUrl}: ${
              text.length
            } chars, first 100: ${text.slice(0, 100)}`
          );

          // Store in crawled_pages
          await db.collection("crawled_pages").insertOne({
            adminId,
            url: pageUrl,
            text,
            filename: pageUrl,
            createdAt: new Date(),
          });
          // Mark as crawled in sitemap_urls
          await sitemapUrls.updateOne(
            { adminId, url: pageUrl },
            { $set: { crawled: true, crawledAt: new Date() } }
          );
          // Chunk and embed for ChromaDB
          const chunks = chunkText(text);
          if (chunks.length > 0) {
            const embedResp = await openai.embeddings.create({
              input: chunks,
              model: "text-embedding-3-small",
            });
            const embeddings = embedResp.data.map(
              (d: { embedding: number[] }) => d.embedding
            );
            const metadata = chunks.map((_, i) => ({
              filename: pageUrl,
              adminId,
              url: pageUrl,
              chunkIndex: i,
            }));
            await addChunks(chunks, embeddings, metadata);
            pageChunks = chunks;
            console.log(
              `[OnDemandCrawl] Successfully processed ${pageUrl}: ${chunks.length} chunks`
            );
          } else {
            console.log(
              `[OnDemandCrawl] No chunks created for ${pageUrl} - content may be too short or empty`
            );
          }
        } catch (err) {
          console.error(`[OnDemandCrawl] Failed for ${pageUrl}:`, err);
          // If crawl fails, fallback to no info
        }
      } else if (sitemapEntry && sitemapEntry.crawled) {
        pageChunks = await getChunksByPageUrl(adminId, pageUrl);
        // LOG: pageChunks result
        console.log("[Proactive] getChunksByPageUrl result:", pageChunks);
      }
    } else {
      // LOG: No adminId found for session
      console.log("[Proactive] No adminId found for sessionId:", sessionId);
      console.log(
        "[DEBUG] This means your API key is not properly mapped to an adminId"
      );
      console.log(
        "[DEBUG] Check that your API key exists in the users collection"
      );
    }
    let pageSummary = "(No specific information found for this page.)";
    if (pageChunks.length > 0) {
      if (proactive) {
        // Summarize the page content and ask a relevant question
        let summaryContext = pageChunks.slice(0, 3).join("\n---\n");
        const fullPageText = pageChunks.join(" ");
        const tokenCount = countTokens(fullPageText);
        console.log(`[Proactive] Page content token count: ${tokenCount}`);
        if (tokenCount > 20000) {
          // Split into 5k-token chunks and summarize each
          const chunkSize = 5000;
          const textChunks = await splitTextIntoTokenChunks(
            fullPageText,
            chunkSize
          );
          console.log(
            `[Proactive] Splitting into ${textChunks.length} chunks of ~${chunkSize} tokens each`
          );
          const summaries = [];
          for (let i = 0; i < textChunks.length; i++) {
            const chunk = textChunks[i];
            console.log(
              `[Proactive] Summarizing chunk ${i + 1}/${textChunks.length}`
            );
            const summaryResp = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `You are a proactive assistant. Your goal is to help users plan or organize their next steps. Create engaging, emoji-enhanced messages with proper formatting. MANDATORY: Use emojis strategically with double line breaks \\n\\n after them. Break content into digestible sections with proper spacing. Always use **bold** for important keywords and features.`,
                },
                { role: "user", content: chunk },
              ],
            });
            summaries.push(summaryResp.choices[0].message.content || "");
          }
          summaryContext = summaries.join("\n");
          console.log(
            `[Proactive] Combined summary length: ${summaryContext.length} chars`
          );
        }
        const detectedIntent = detectIntent({ pageUrl });
        console.log(
          `[DEBUG] Detected intent for pageUrl "${pageUrl}": "${detectedIntent}"`
        );
        console.log(
          `[DEBUG] Conversation state: hasBeenGreeted=${hasBeenGreeted}, proactiveCount=${proactiveMessageCount}, visitedPages=${visitedPages.length}`
        );

        let summaryPrompt;

        if (!hasBeenGreeted) {
          // First time greeting - let AI create natural varied openings
          summaryPrompt = `The user is viewing: ${pageUrl}. Their likely intent is: ${detectedIntent}.

Create a natural, engaging proactive greeting message. Be welcoming and specific to what they're viewing.

Requirements:
- Create a natural, varied opening - NEVER start with "I see you're..." or similar repetitive phrases
- Use creative, eye-catching openings like "Welcome to...", "Exploring...", "Looking for...", "Perfect timing!", "Great choice!", etc.
- Be specific to the detected intent and page content
- Include 2-3 relevant features from the page content with **bold keywords**
- MANDATORY FORMATTING: Use double line breaks \\n\\n after emojis and before bullet points
- Format: 'Creative opening! 🚀\\n\\nHere's what stands out:\\n\\n• **Bold keyword**: Feature 1\\n\\n• **Bold keyword**: Feature 2\\n\\n• **Bold keyword**: Feature 3'
- End with an engaging question about their specific needs
- Always use **bold** for important keywords and features
- Keep it conversational and engaging

Content to reference:\n${summaryContext}`;
        } else {
          // Follow-up proactive message - more contextual and varied
          const isRevisit = visitedPages.some((page: string) =>
            pageUrl.includes(page)
          );

          summaryPrompt = `The user has already been greeted and is now viewing: ${pageUrl}. 
This is proactive message #${proactiveMessageCount + 1}. They have visited ${
            visitedPages.length
          } pages before.
Their likely intent is: ${detectedIntent}.
${
  isRevisit
    ? "They have visited a similar page before."
    : "This appears to be a new page for them."
}

Create a natural, contextual follow-up message. Avoid repetitive greetings since they've already been welcomed.

Requirements:
- Create a creative, engaging opening - AVOID "I see you're...", "Looks like...", or similar repetitive phrases
- Use varied openings like "Perfect!", "Great choice!", "Smart move!", "This is exciting!", "You're in the right place!", etc.
- Be contextual to what they're currently viewing
- Reference relevant features with **bold keywords** 
- MANDATORY FORMATTING: Use double line breaks \\n\\n after emojis and before bullet points
- Format: 'Creative opening! 🎯\\n\\nHere's what makes this special:\\n\\n• **Bold feature**: Description\\n\\n• **Bold benefit**: Value prop\\n\\n• **Bold advantage**: Key point'
- Sound helpful and natural, not robotic
- Always use **bold** for important keywords, features, and benefits
- End with a specific question about their current interest
- Keep it concise and informative

Content to reference:\n${summaryContext}`;
        }
        const summaryResp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a proactive assistant. Create engaging, professional messages with emojis and proper formatting. Follow the exact format provided in the user prompt. Focus on being warm, informative, and encouraging engagement. 

MANDATORY FORMATTING RULES:
1. NEVER start with "I see you're..." - be creative and varied
2. Use eye-catching openings like "Welcome!", "Perfect timing!", "Great choice!", "This is exciting!"
3. Always add double line breaks \\n\\n after emojis before continuing text
4. Use bullet points with • symbol for features/benefits
5. Add double line breaks \\n\\n after each bullet point for spacing
6. Always use **bold** for important keywords, features, and benefits
7. Format: 'Creative opening! 🚀\\n\\nHere's what stands out:\\n\\n• **Bold keyword**: Description\\n\\n• **Bold feature**: Benefit\\n\\n• **Bold advantage**: Value'
8. End with engaging, specific questions
9. Be creative and avoid robotic repetition`,
            },
            { role: "user", content: summaryPrompt },
          ],
        });
        pageSummary = summaryResp.choices[0].message.content || "";
        const proactiveMsg = pageSummary;

        // Determine bot mode for proactive message
        let userEmail: string | null = null;
        const lastEmailMsg = await chats.findOne(
          { sessionId, email: { $exists: true } },
          { sort: { createdAt: -1 } }
        );
        if (lastEmailMsg && lastEmailMsg.email) userEmail = lastEmailMsg.email;
        const botMode = userEmail ? "sales" : "lead_generation";

        console.log("[Chat API] Proactive response:", {
          botMode,
          userEmail: userEmail || null,
          hasProactiveMsg: !!proactiveMsg,
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json(
          {
            answer: proactiveMsg,
            botMode,
            userEmail: userEmail || null,
          },
          { headers: corsHeaders }
        );
      } else if (followup) {
        // For follow-up, use the same JSON-output system prompt as main chat
        const previousChats = await chats
          .find({ sessionId })
          .sort({ createdAt: 1 })
          .toArray();
        const previousQnA = previousChats
          .filter(
            (msg) =>
              (msg as unknown as ChatMessage).role === "assistant" ||
              (msg as unknown as ChatMessage).role === "user"
          )
          .map((msg) => {
            const m = msg as unknown as ChatMessage;
            return `${m.role === "user" ? "User" : "Bot"}: ${m.content}`;
          })
          .join("\n");
        const prevQuestions = previousChats
          .filter((msg) => (msg as unknown as ChatMessage).role === "assistant")
          .map((msg) => (msg as unknown as ChatMessage).content);
        const lastFewQuestions = prevQuestions.slice(-3);

        // Helper functions needed for followup processing
        function getText(val: MainTextLike): string {
          if (typeof val === "string") return val;
          if (val && typeof val === "object" && "mainText" in val)
            return val.mainText || "";
          return "";
        }

        function isTooSimilar(
          newQ: MainTextLike,
          prevQs: MainTextLike[]
        ): boolean {
          const newText = getText(newQ);
          if (!newText || newText.length < 10) return true; // Skip very short responses
          const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
          const normalizedNew = norm(newText);

          return prevQs.some((q: MainTextLike) => {
            const prevText = getText(q);
            if (!prevText) return false;
            const normalizedPrev = norm(prevText);

            // Only consider it similar if there's significant overlap (>70% of the shorter text)
            const overlapThreshold = 0.7;
            const minLength = Math.min(
              normalizedNew.length,
              normalizedPrev.length
            );

            if (
              normalizedNew.includes(normalizedPrev) &&
              normalizedPrev.length > minLength * overlapThreshold
            ) {
              return true;
            }
            if (
              normalizedPrev.includes(normalizedNew) &&
              normalizedNew.length > minLength * overlapThreshold
            ) {
              return true;
            }

            return false;
          });
        }

        // Detect intent from last user message or pageUrl
        const detectedIntent = detectIntent({ question, pageUrl });
        // Use followupCount from request body to determine follow-up stage
        const followupCount =
          typeof body.followupCount === "number" ? body.followupCount : 0;

        // Check if user already has email (sales mode)
        const lastEmailMsg = await chats.findOne(
          { sessionId, email: { $exists: true } },
          { sort: { createdAt: -1 } }
        );
        const userHasEmail = lastEmailMsg && lastEmailMsg.email;

        let followupSystemPrompt = "";
        let followupUserPrompt = "";
        if (followupCount === 0) {
          // First follow-up: context-aware nudge with buttons, tip is optional
          followupSystemPrompt = `
You are a helpful sales assistant. The user has not provided an email yet.

You will receive page and general context, the detected intent, and the previous conversation. Always generate your response in the following JSON format:
{
  "mainText": "<A single, creative, engaging nudge for the user. STRICT LIMITS: Maximum 30 words total. Be specific to page context and detected intent. Do NOT repeat previous questions. Keep it super concise and engaging with emojis. Format: 'Short intro\\n\\n• Point 1\\n\\n• Point 2' if needed.>",
  "buttons": ["<Generate exactly 3 buttons, each must be 3-4 words maximum. Make them actionable and context-specific. Examples: 'See Pricing', 'Get Demo', 'Learn More', 'Contact Sales'>"],
  "emailPrompt": ""
}
Context:
Page Context:
${pageChunks.slice(0, 3).join("\n---\n")}
General Context:
${pageChunks.join(" ")}
Detected Intent:
${detectedIntent}
Previous Conversation:
${previousQnA}
- Only use the above JSON format.
- Do not answer in any other way.
- Your mainText must be maximum 30 words. Be creative, engaging, and specific to page context. Do NOT repeat previous questions: ${lastFewQuestions
            .map((q) => `"${getText(q)}"`)
            .join(", ")}. Do NOT include a summary or multiple questions.
- Generate exactly 3 buttons, each 3-4 words maximum. Be relevant to user needs.
- Vary the nudge text for each follow-up.`;
          followupUserPrompt = `Create ONE nudge (max 30 words) to engage user. Use page context and intent. Do NOT repeat questions: ${lastFewQuestions
            .map((q) => `"${getText(q)}"`)
            .join(
              ", "
            )}. Generate exactly 3 buttons (3-4 words each). JSON format only.`;
        } else if (followupCount === 1) {
          // Second follow-up: micro-conversion nudge, tip is optional
          followupSystemPrompt = `
You are a helpful sales assistant. The user has not provided an email yet.

You will receive page and general context, the detected intent, and the previous conversation. Always generate your response in the following JSON format:
{
  "mainText": "<A micro-conversion nudge—small, low-friction ask. STRICT LIMITS: Maximum 30 words total. Examples: 'Want this setup guide emailed?' or 'Should I show customization options?' Use casual, friendly tone. Be specific to their context.>",
  "buttons": ["<Generate exactly 3 buttons, each must be 3-4 words maximum. Make them actionable and context-specific. Examples: 'Yes Please', 'Show Options', 'Learn More'>"],
  "emailPrompt": ""
}
Context:
Page Context:
${pageChunks.slice(0, 3).join("\n---\n")}
General Context:
${pageChunks.join(" ")}
Detected Intent:
${detectedIntent}
Previous Conversation:
${previousQnA}
- Only use the above JSON format.
- Do not answer in any other way.
- Your mainText must be a micro-conversion nudge, referencing the user's last action, detected intent, page context, or detected intent. Do NOT ask for a discovery call or email directly. Vary the nudge text for each follow-up.`;
          followupUserPrompt = `Ask a micro-conversion nudge—a small, low-friction ask (e.g., 'Want to save this setup guide to your email?' or 'Should I show how others customize their services?'), based on the user's last action, detected intent, page context, or detected intent. Do NOT ask for a discovery call or email directly. Vary the nudge text for each follow-up. Only output the JSON format as instructed.`;
        } else if (followupCount === 2) {
          // Third follow-up: check if user already has email
          if (userHasEmail) {
            // User is in sales mode - provide value-added engagement instead of asking for email
            followupSystemPrompt = `
You are a helpful sales assistant. The user has already provided their email and is in sales mode.

You will receive page and general context, the detected intent, and the previous conversation. Always generate your response in the following JSON format:
{
  "mainText": "<Offer value-added help like scheduling a personalized demo, connecting to an expert, providing additional resources, or suggesting next steps based on their page context and detected intent. Be specific and actionable. KEEP SHORT: Use 1-2 sentences max with professional, confident tone.>",
  "buttons": ["<2-3 high-value options like 'Schedule a demo', 'Talk to specialist', 'Get custom quote', etc. based on page context>"],
  "emailPrompt": ""
}
Context:
Page Context:
${pageChunks.slice(0, 3).join("\n---\n")}
General Context:
${pageChunks.join(" ")}
Detected Intent:
${detectedIntent}
Previous Conversation:
${previousQnA}
- Only use the above JSON format.
- Do not answer in any other way.
- Your mainText must offer value-added help since the user is already a qualified lead with email provided.`;
            followupUserPrompt = `Offer value-added help like scheduling a demo, connecting to an expert, or suggesting next steps. The user has already provided their email so focus on high-value actions. Only output the JSON format as instructed.`;
          } else {
            // User hasn't provided email yet - ask for it
            followupSystemPrompt = `
You are a helpful sales assistant. The user has not provided an email yet.

You will receive page and general context, the detected intent, and the previous conversation. Always generate your response in the following JSON format:
{
  "mainText": "<A friendly, direct request for email. STRICT LIMITS: Maximum 30 words total. Explain briefly why you need it. Reference page context. Example: 'Quick! Want the setup guide emailed? Takes 2 seconds! 📧'>",
  "buttons": [],
  "emailPrompt": "<Create a contextual email prompt that relates to the specific page content and detected intent. Explain what specific information or help you'll send them based on what they're viewing.>"
}
Context:
Page Context:
${pageChunks.slice(0, 3).join("\n---\n")}
General Context:
${pageChunks.join(" ")}
Detected Intent:
${detectedIntent}
Previous Conversation:
${previousQnA}
- Only use the above JSON format.
- Do not answer in any other way.
- Your mainText must be a friendly, direct request for the user's email, referencing the page context or detected intent if possible. Do NOT ask another qualifying question or repeat previous questions.`;
            followupUserPrompt = `Ask the user for their email in a friendly, direct way, explaining why you need it to send them setup instructions, a demo, or connect them to support for this page. Reference the page context or detected intent if possible. Do NOT ask another qualifying question. Do NOT include any buttons. Only output the JSON format as instructed.`;
          }
        } else if (followupCount === 3) {
          // Final nudge: check if user already has email
          if (userHasEmail) {
            // User is in sales mode - provide a final high-value offer
            followupSystemPrompt = `You are a helpful sales assistant. The user has already provided their email and is in sales mode. Always generate your response in the following JSON format:
{
  "mainText": "<Final high-value offer. STRICT LIMITS: Maximum 30 words total. Make it compelling and time-sensitive. Examples: 'Exclusive early access available! Limited spots for priority onboarding. Ready to secure yours? 🚀'>",
  "buttons": ["<Generate exactly 3 buttons, each must be 3-4 words maximum. High-value options like 'Secure Access', 'Book Call', 'Get Started'>"],
  "emailPrompt": ""
}
Context: Page Context: ${pageChunks
              .slice(0, 3)
              .join("\\n---\\n")} General Context: ${pageChunks.join(
              " "
            )} Detected Intent: ${detectedIntent} Previous Conversation: ${previousQnA} - Only use the above JSON format. - Do not answer in any other way. - Your mainText must be a final high-value offer since the user is already qualified.`;
            followupUserPrompt = `Make a final high-value offer like exclusive access, priority support, or direct connection to decision maker. The user already provided email so focus on conversion. Only output the JSON format as instructed.`;
          } else {
            // User hasn't provided email yet - final summary offer
            followupSystemPrompt = `
You are a helpful sales assistant. The user has not provided an email yet and has not responded to several nudges.

You will receive page and general context, the detected intent, and the previous conversation. Always generate your response in the following JSON format:
{
  "mainText": "<Looks like you stepped away. I’ve saved all your options! Want a quick summary emailed? 📧 STRICT LIMITS: Maximum 30 words total. Be friendly.>",
  "buttons": ["Yes Email Me", "No Thanks", "Keep Browsing"],
  "emailPrompt": "If you'd like a summary or more help, I can email it to you."
}
Context:
Page Context:
${pageChunks.slice(0, 3).join("\n---\n")}
General Context:
${pageChunks.join(" ")}
Detected Intent:
${detectedIntent}
Previous Conversation:
${previousQnA}
- Only use the above JSON format.
- Do not answer in any other way.
- Your mainText must summarize the user's last few actions or options and offer to email a summary.`;
            followupUserPrompt = `Offer to email the user a summary of their options, summarizing their last few actions or options in a friendly way. Only output the JSON format as instructed.`;
          }
        } else {
          // No more follow-ups after 4
          console.log(
            `[Followup] No more followups after count 4 for session ${sessionId}`
          );
          return NextResponse.json({}, { headers: corsHeaders });
        }

        // Check if user has been recently active based on recent message timestamps
        const recentMessages = await chats
          .find({ sessionId })
          .sort({ createdAt: -1 })
          .limit(5)
          .toArray();

        const now = new Date();
        const recentUserActivity = recentMessages.some((msg) => {
          const msgTime = new Date(msg.createdAt);
          const timeDiff = now.getTime() - msgTime.getTime();
          return msg.role === "user" && timeDiff < 25000; // 25 seconds
        });

        if (recentUserActivity) {
          console.log(
            `[Followup] Skipping followup - user was active within last 25 seconds for session ${sessionId}`
          );
          return NextResponse.json({}, { headers: corsHeaders });
        }

        // Start followup generation with error handling
        console.log(
          `[Followup] Starting followup generation for session ${sessionId}, count: ${followupCount}`
        );
        let followupMsg = "";
        let parsed = null;

        try {
          for (let attempt = 0; attempt < 2; attempt++) {
            console.log(
              `[Followup] Attempt ${attempt + 1}/2 for session ${sessionId}`
            );
            const followupResp = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: followupSystemPrompt },
                { role: "user", content: followupUserPrompt },
              ],
            });
            followupMsg = followupResp.choices[0].message.content || "";
            try {
              parsed = JSON.parse(followupMsg || "");
            } catch {
              parsed = { mainText: followupMsg, buttons: [], emailPrompt: "" };
            }
            if (!isTooSimilar(parsed.mainText, lastFewQuestions)) break;
          }
          // If still too similar, skip sending a new follow-up
          if (isTooSimilar(parsed.mainText, lastFewQuestions)) {
            console.log(
              `[Followup] Skipping followup - too similar to previous questions for session ${sessionId}`
            );
            return NextResponse.json({}, { headers: corsHeaders });
          }

          console.log(
            `[Followup] Successfully generated followup for session ${sessionId}`
          );

          // Add bot mode to followup response
          let userEmail: string | null = null;
          const lastEmailMsg = await chats.findOne(
            { sessionId, email: { $exists: true } },
            { sort: { createdAt: -1 } }
          );
          if (lastEmailMsg && lastEmailMsg.email)
            userEmail = lastEmailMsg.email;
          const botMode = userEmail ? "sales" : "lead_generation";

          const followupWithMode = {
            ...parsed,
            botMode,
            userEmail: userEmail || null,
          };

          return NextResponse.json(followupWithMode, { headers: corsHeaders });
        } catch (error) {
          console.error(
            `[Followup] Error generating followup for session ${sessionId}:`,
            error
          );
          return NextResponse.json({}, { headers: corsHeaders });
        }
      }
    }
    // Fallback if no context
    console.log(
      `[DEBUG] Falling back to generic message. pageSummary: "${pageSummary}", pageChunks.length: ${pageChunks.length}`
    );
    if (proactive) {
      console.log(
        `[DEBUG] Returning generic proactive message - no page context found`
      );
      const welcomeMessages = [
        "I'm here to help you learn more about the products and services available.",
        "I can assist you with any questions about our offerings.",
        "I'm ready to help you explore what we have available.",
        "I can help you find exactly what you're looking for.",
        "I'm here to guide you through our available options.",
      ];
      const randomWelcome =
        welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      const proactiveMsg = `${randomWelcome}

I can help answer questions, provide information, and guide you through available options based on your specific needs.

What would you like to know more about? Feel free to ask me anything or let me know what you're looking to accomplish!`;

      // Determine bot mode for generic proactive message
      let userEmail: string | null = null;
      const lastEmailMsg = await chats.findOne(
        { sessionId, email: { $exists: true } },
        { sort: { createdAt: -1 } }
      );
      if (lastEmailMsg && lastEmailMsg.email) userEmail = lastEmailMsg.email;
      const botMode = userEmail ? "sales" : "lead_generation";

      return NextResponse.json(
        {
          answer: proactiveMsg,
          botMode,
          userEmail: userEmail || null,
        },
        { headers: corsHeaders }
      );
    } else if (followup) {
      console.log(
        `[Followup] Simple fallback followup for session ${sessionId}`
      );

      // Add bot mode to fallback followup
      let userEmail: string | null = null;
      const lastEmailMsg = await chats.findOne(
        { sessionId, email: { $exists: true } },
        { sort: { createdAt: -1 } }
      );
      if (lastEmailMsg && lastEmailMsg.email) userEmail = lastEmailMsg.email;
      const botMode = userEmail ? "sales" : "lead_generation";

      return NextResponse.json(
        {
          mainText:
            "Is there anything else you'd like to know about the available features?",
          buttons: ["Learn More Features", "Get Demo", "Contact Support"],
          emailPrompt: "",
          botMode,
          userEmail: userEmail || null,
        },
        { headers: corsHeaders }
      );
    }
  }

  // Handle followup without pageUrl (generic followup logic)
  if (followup && !pageUrl) {
    console.log(
      `[Followup] Processing followup without pageUrl for session ${sessionId}`
    );

    try {
      const followupCount =
        typeof body.followupCount === "number" ? body.followupCount : 0;

      if (followupCount < 3) {
        const genericFollowups = [
          "Is there anything else you'd like to know about the available features?",
          "Would you like to explore how this could help with your specific needs?",
          "Ready to see how this can streamline your business? Let me know what interests you most!",
        ];

        const message = genericFollowups[followupCount] || genericFollowups[0];
        console.log(
          `[Followup] Sending generic followup ${followupCount} for session ${sessionId}`
        );

        // Add bot mode to generic followup
        let userEmail: string | null = null;
        const lastEmailMsg = await chats.findOne(
          { sessionId, email: { $exists: true } },
          { sort: { createdAt: -1 } }
        );
        if (lastEmailMsg && lastEmailMsg.email) userEmail = lastEmailMsg.email;
        const botMode = userEmail ? "sales" : "lead_generation";

        return NextResponse.json(
          {
            mainText: message,
            buttons: ["Learn More Features", "Get Demo", "Contact Support"],
            emailPrompt: "",
            botMode,
            userEmail: userEmail || null,
          },
          { headers: corsHeaders }
        );
      } else {
        console.log(
          `[Followup] No more generic followups for session ${sessionId}`
        );
        return NextResponse.json({}, { headers: corsHeaders });
      }
    } catch (error) {
      console.error(
        `[Followup] Error in generic followup for session ${sessionId}:`,
        error
      );
      return NextResponse.json({}, { headers: corsHeaders });
    }
  }

  // Embed the question
  const embedResp = await openai.embeddings.create({
    input: [question],
    model: "text-embedding-3-small",
  });
  const questionEmbedding = embedResp.data[0].embedding;

  // Retrieve relevant chunks (global context for now, or filter by adminId if needed)
  const topChunks = await querySimilarChunks(
    questionEmbedding,
    5,
    adminId || undefined
  );
  const context = topChunks.join("\n---\n");

  // Also get page-specific context if available
  let pageContext = "";
  if (adminId && pageUrl) {
    const pageChunks = await getChunksByPageUrl(adminId, pageUrl);
    if (pageChunks.length > 0) {
      pageContext = pageChunks.slice(0, 3).join("\n---\n");
    }
  }

  // Detect if user is identified (has provided email)
  let userEmail: string | null = null;
  const lastEmailMsg = await chats.findOne(
    { sessionId, email: { $exists: true } },
    { sort: { createdAt: -1 } }
  );
  if (lastEmailMsg && lastEmailMsg.email) userEmail = lastEmailMsg.email;

  // If we detected an email in the current message, the user is now identified
  if (detectedEmail) {
    userEmail = detectedEmail;
    console.log(`[DEBUG] User provided email in current message: ${userEmail}`);
  }

  // Detect if the user message matches any previous assistant message's buttons
  // (currently unused but kept for future functionality)
  // let isButtonAction = false;
  if (question) {
    // Find the last assistant message with buttons
    const lastAssistantWithButtons = await chats.findOne(
      {
        sessionId,
        role: "assistant",
        "content.buttons.0": { $exists: true },
      },
      { sort: { createdAt: -1 } }
    );
    if (
      lastAssistantWithButtons &&
      lastAssistantWithButtons.content &&
      Array.isArray(lastAssistantWithButtons.content.buttons)
    ) {
      // isButtonAction = lastAssistantWithButtons.content.buttons.some(
      //   (b: string) => b.toLowerCase() === question.trim().toLowerCase()
      // );
    }
  }

  // If no context, refer to sales team and ask for contact
  if (!context.trim() && !pageContext.trim()) {
    return NextResponse.json(
      {
        answer:
          "I'm not sure about that. I'll refer your question to our sales team. Could you please share your email or phone number so we can follow up?",
      },
      { headers: corsHeaders }
    );
  }

  // Detect specific user intents for special handling
  const lowerQuestion = (question || "").toLowerCase();
  const isTalkToSupport =
    lowerQuestion.includes("talk to support") ||
    lowerQuestion.includes("contact support");
  const isEmailRequest =
    lowerQuestion.includes("email") &&
    (lowerQuestion.includes("send") || lowerQuestion.includes("share"));

  // Chat completion with sales-pitch system prompt
  let systemPrompt = "";
  const userPrompt = question;
  if (userEmail) {
    console.log(
      `[DEBUG] User has email: ${userEmail} - Switching to SALES mode`
    );
    systemPrompt = `You are a helpful sales assistant for a company. The user has provided their email (${userEmail}) and is now a qualified lead. Focus on sales, product benefits, pricing, and closing deals. Always generate your response in the following JSON format:

{
  "mainText": "<Provide sales-focused, persuasive responses about products/services, pricing, benefits, case studies, or next steps. Be enthusiastic and focus on value proposition. Use the context below to provide specific information. MANDATORY FORMATTING RULES: \n1. NEVER write long paragraphs - they are hard to read in chat\n2. Start with 1-2 short sentences (max 20 words each)\n3. Add double line break \\n\\n after intro\n4. Use bullet points with • symbol for ANY list of 2+ benefits/features\n5. Add TWO line breaks \\n\\n after each bullet point for better spacing\n6. Example format: 'Great question! Here's what makes us special:\\n\\n• Benefit 1\\n\\n• Benefit 2\\n\\n• Benefit 3'\n7. Use emojis sparingly for emphasis\n8. Never use long sentences in paragraphs - break them into bullets>",
  "buttons": ["<Generate 2-4 sales-oriented action buttons like 'Get Pricing', 'Schedule Demo', 'View Case Studies', 'Speak with Sales Rep', 'Compare Plans', etc. Make them action-oriented and sales-focused.>"],
  "emailPrompt": ""
}

Context:
Page Context:
${pageContext}

General Context:
${context}

IMPORTANT: This user is qualified (has provided email). Focus on sales, conversion, and closing. Generate sales-oriented buttons that move them towards purchase decisions. No need to ask for email again. ABSOLUTELY NO LONG PARAGRAPHS - USE BULLET POINTS WITH DOUBLE LINE BREAKS FOR SPACING.`;
  } else {
    // Special handling for different types of requests
    if (isTalkToSupport) {
      systemPrompt = `You are a helpful support assistant. The user wants to talk to support. Provide a helpful, specific support response based on the context and their needs. Always generate your response in the following JSON format:

{
  "mainText": "<A helpful, specific support response that addresses their likely needs based on the context. Be warm and professional. Provide specific next steps or information about how to get help. MANDATORY FORMATTING RULES: \n1. NEVER write long paragraphs - they are hard to read in chat\n2. Start with 1-2 short sentences (max 20 words each)\n3. Add double line break \\n\\n after intro\n4. Use bullet points with • symbol for ANY steps or multiple items\n5. Add TWO line breaks \\n\\n after each bullet point for better spacing\n6. Example format: 'I'm here to help!\\n\\n• Step 1\\n\\n• Step 2\\n\\n• Step 3'\n7. Use emojis sparingly for clarity\n8. Never use long sentences in paragraphs - break them into bullets>",
  "buttons": ["<Generate 2-3 relevant support-related actions like 'Schedule Support Call', 'Check Help Center', 'Report Technical Issue', etc. Make them specific to their context.>"],
  "emailPrompt": ""
}

Context:
Page Context:
${pageContext}

General Context:
${context}

IMPORTANT: Focus on being helpful and supportive. Don't ask for email unless it's specifically needed for support. Generate contextual support-related buttons. ABSOLUTELY NO LONG PARAGRAPHS - USE BULLET POINTS WITH DOUBLE LINE BREAKS FOR SPACING.`;
    } else if (isEmailRequest) {
      systemPrompt = `You are a helpful sales assistant. The user is asking about email or wanting something sent to their email. Always generate your response in the following JSON format:

{
  "mainText": "<Acknowledge their email request and explain what you can send them. Be specific about what information or resources you'll provide. MANDATORY FORMATTING: Use 1-2 short sentences maximum. Be direct and clear about what they'll receive. NO BULLET POINTS needed for simple email acknowledgments.>",
  "buttons": [],
  "emailPrompt": "<Create a contextual email prompt specific to what they requested. Be clear about what exactly you'll send them based on their request.>"
}

Context:
Page Context:
${pageContext}

General Context:
${context}

IMPORTANT: Don't provide other action buttons when user is requesting email. Focus on the email collection. KEEP RESPONSE BRIEF AND FOCUSED.`;
    } else {
      systemPrompt = `You are a helpful sales assistant. The user has not provided an email yet.\n\nYou will receive page and general context. Always generate your response in the following JSON format:\n\n{\n  "mainText": "<A dynamic, page-aware summary or answer, using the context below. MANDATORY FORMATTING RULES: \n1. NEVER write long paragraphs - they are hard to read in chat\n2. Start with 1-2 short sentences (max 20 words each)\n3. Add double line break \\n\\n after intro\n4. Use bullet points with • symbol for ANY list of 2+ items\n5. Add TWO line breaks \\n\\n after each bullet point for better spacing\n6. Example format: 'Short intro!\\n\\n• First benefit\\n\\n• Second benefit\\n\\n• Third benefit'\n7. Use emojis sparingly for emphasis\n8. Never use long sentences in paragraphs - break them into bullets>",\n  "buttons": ["<Generate 2-4 contextually relevant action buttons based on the user's question and the content you provided. These should be specific to their query and help them take the next logical step. For example, if they ask about hosting, buttons could be 'Learn About Security', 'Compare Plans', 'Contact Hosting Team'. Make buttons actionable and relevant to the specific topic discussed.>"],\n  "emailPrompt": "<Create a contextual email prompt that relates to the specific topic discussed, offering to send more detailed information about that topic specifically.>"\n}\n\nContext:\nPage Context:\n${pageContext}\n\nGeneral Context:\n${context}\n\nIMPORTANT: Generate buttons and email prompt that are directly related to the user's specific question and your answer. Do not use generic buttons. Make them actionable and relevant to the conversation topic. ABSOLUTELY NO LONG PARAGRAPHS - USE BULLET POINTS WITH DOUBLE LINE BREAKS FOR SPACING.`;
    }
  }

  const chatResp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });
  const answer = chatResp.choices[0].message.content;

  // Try to parse the answer as JSON
  let parsed = null;
  try {
    parsed = JSON.parse(answer || "");
  } catch {
    // fallback: treat as plain text
    parsed = { mainText: answer, buttons: [], emailPrompt: "" };
  }

  // Save user and assistant message, including email and requirements if detected or already present
  let emailToStore = detectedEmail;
  let requirementsToStore = null;
  if (!emailToStore) {
    // Check if session already has an email
    const lastMsg = await chats.findOne({
      sessionId,
      email: { $exists: true },
    });
    if (lastMsg && lastMsg.email) {
      emailToStore = lastMsg.email;
      requirementsToStore = lastMsg.requirements || null;
    }
  } else {
    // If we just detected an email, check if we also extracted requirements
    const updatedMsg = await chats.findOne({
      sessionId,
      requirements: { $exists: true },
    });
    if (updatedMsg && updatedMsg.requirements) {
      requirementsToStore = updatedMsg.requirements;
    }
  }

  await chats.insertMany([
    {
      sessionId,
      role: "user",
      content: question,
      createdAt: now,
      ...(emailToStore ? { email: emailToStore } : {}),
      ...(requirementsToStore ? { requirements: requirementsToStore } : {}),
      ...(adminId ? { adminId } : {}),
    },
    {
      sessionId,
      role: "assistant",
      content: answer,
      createdAt: new Date(now.getTime() + 1),
      ...(emailToStore ? { email: emailToStore } : {}),
      ...(requirementsToStore ? { requirements: requirementsToStore } : {}),
      ...(adminId ? { adminId } : {}),
    },
  ]);

  // Add bot mode information to the response
  const botMode = userEmail ? "sales" : "lead_generation";
  const responseWithMode = {
    ...parsed,
    botMode,
    userEmail: userEmail || null, // Include for debugging
  };

  console.log("[Chat API] Main response:", {
    botMode,
    userEmail: userEmail || null,
    hasResponse: !!parsed.mainText,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(responseWithMode, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId)
    return NextResponse.json({ history: [] }, { headers: corsHeaders });
  const db = await getDb();
  const chats = db.collection("chats");
  const history = await chats
    .find({ sessionId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
  return NextResponse.json(
    { history: history.reverse() },
    { headers: corsHeaders }
  );
}

export async function DELETE(req: NextRequest) {
  try {
    const { sessionId, clearHistory } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (clearHistory) {
      const db = await getDb();
      const chats = db.collection("chats");

      // Delete all chat history for this session
      const result = await chats.deleteMany({ sessionId });

      console.log(
        `[Chat] Cleared ${result.deletedCount} messages for session ${sessionId}`
      );

      return NextResponse.json(
        {
          success: true,
          deletedCount: result.deletedCount,
          message: "Chat history cleared successfully",
        },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[Chat] Error clearing chat history:", error);
    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500, headers: corsHeaders }
    );
  }
}
