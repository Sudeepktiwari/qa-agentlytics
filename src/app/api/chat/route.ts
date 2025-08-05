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

// Helper to detect industry/vertical from page URL and content
function detectVertical(pageUrl: string, pageContent: string = ""): string {
  const url = pageUrl.toLowerCase();
  const content = pageContent.toLowerCase();

  console.log(`[VERTICAL DEBUG] Analyzing pageUrl: ${pageUrl}`);
  console.log(`[VERTICAL DEBUG] Content length: ${pageContent.length} chars`);
  console.log(
    `[VERTICAL DEBUG] Content preview: ${content.substring(0, 200)}...`
  );

  // URL-based detection
  if (url.includes("/consulting") || url.includes("/consultant")) {
    console.log(`[VERTICAL DEBUG] Detected 'consulting' from URL: ${pageUrl}`);
    return "consulting";
  }
  if (
    url.includes("/legal") ||
    url.includes("/law") ||
    url.includes("/attorney")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'legal' from URL: ${pageUrl}`);
    return "legal";
  }
  if (
    url.includes("/accounting") ||
    url.includes("/finance") ||
    url.includes("/bookkeeping")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'accounting' from URL: ${pageUrl}`);
    return "accounting";
  }
  if (
    url.includes("/staffing") ||
    url.includes("/recruiting") ||
    url.includes("/hr")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'staffing' from URL: ${pageUrl}`);
    return "staffing";
  }
  if (
    url.includes("/healthcare") ||
    url.includes("/medical") ||
    url.includes("/clinic")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'healthcare' from URL: ${pageUrl}`);
    return "healthcare";
  }
  if (
    url.includes("/education") ||
    url.includes("/school") ||
    url.includes("/university")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'education' from URL: ${pageUrl}`);
    return "education";
  }
  if (
    url.includes("/real-estate") ||
    url.includes("/realty") ||
    url.includes("/property")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'real_estate' from URL: ${pageUrl}`);
    return "real_estate";
  }
  if (
    url.includes("/technology") ||
    url.includes("/software") ||
    url.includes("/saas")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'technology' from URL: ${pageUrl}`);
    return "technology";
  }
  if (
    url.includes("/retail") ||
    url.includes("/ecommerce") ||
    url.includes("/store")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'retail' from URL: ${pageUrl}`);
    return "retail";
  }

  // Content-based detection (basic keyword matching)
  if (content.includes("consultation") || content.includes("advisory")) {
    console.log(`[VERTICAL DEBUG] Detected 'consulting' from content keywords`);
    return "consulting";
  }
  if (
    content.includes("legal") ||
    content.includes("litigation") ||
    content.includes("attorney")
  ) {
    console.log(
      `[VERTICAL DEBUG] Detected 'legal' from content keywords: legal=${content.includes(
        "legal"
      )}, litigation=${content.includes(
        "litigation"
      )}, attorney=${content.includes("attorney")}`
    );
    return "legal";
  }
  if (
    content.includes("accounting") ||
    content.includes("bookkeeping") ||
    content.includes("tax")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'accounting' from content keywords`);
    return "accounting";
  }
  if (
    content.includes("recruiting") ||
    content.includes("staffing") ||
    content.includes("candidates")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'staffing' from content keywords`);
    return "staffing";
  }
  if (
    content.includes("patients") ||
    content.includes("medical") ||
    content.includes("healthcare")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'healthcare' from content keywords`);
    return "healthcare";
  }

  console.log(`[VERTICAL DEBUG] No vertical detected, returning 'general'`);
  return "general";
}

// Helper to generate vertical-specific messaging
function getVerticalMessage(
  vertical: string,
  productName: string = "our platform"
): {
  message: string;
  buttons: string[];
} {
  const verticalMessages: Record<
    string,
    { message: string; buttons: string[] }
  > = {
    consulting: {
      message: `Consulting teams use ${productName} to eliminate back‑and‑forth scheduling, increase billable hours, and onboard clients faster.`,
      buttons: ["Law Firms", "Accounting", "Staffing", "General Consulting"],
    },
    legal: {
      message: `Law firms eliminate manual scheduling so attorneys can focus on cases, reduce no‑shows, and automate intake—leading to higher billable hours.`,
      buttons: ["Case Studies", "Law Demo", "ROI Calculator"],
    },
    accounting: {
      message: `Accounting firms save hours on coordination using intake forms and automated reminders. Focus on client work, take on more clients efficiently.`,
      buttons: ["Accounting Demo", "ROI Data", "Integration Options"],
    },
    staffing: {
      message: `Staffing teams streamline candidate calls, interviews, and coordination with round‑robin scheduling and reduced coordination loops.`,
      buttons: ["ATS Integrations", "Staffing Demo", "Success Stories"],
    },
    healthcare: {
      message: `Healthcare practices reduce no-shows by 60% with automated reminders and streamlined patient scheduling workflows.`,
      buttons: ["Healthcare Demo", "HIPAA Compliance", "Patient Stories"],
    },
    technology: {
      message: `Tech teams eliminate scheduling friction for demos, onboarding, and support calls. Integrate with your existing tools seamlessly.`,
      buttons: ["Tech Integrations", "API Demo", "Developer Docs"],
    },
    general: {
      message: `Teams across industries use ${productName} to eliminate scheduling friction and boost productivity. See how it works for your field.`,
      buttons: ["Explore Industries", "Quick Demo", "Success Stories"],
    },
  };

  return verticalMessages[vertical] || verticalMessages.general;
}

// Helper to generate conversion-oriented buttons based on vertical and visitor status
function getConversionButtons(
  vertical: string,
  isReturningVisitor: boolean = false
): string[] {
  const conversionButtons: Record<
    string,
    { new: string[]; returning: string[] }
  > = {
    consulting: {
      new: ["Book Demo", "See ROI", "Law Firm Case Study"],
      returning: ["Schedule Call", "Pricing Details", "Implementation"],
    },
    legal: {
      new: ["Legal Demo", "Case Studies", "ROI Calculator"],
      returning: ["Book Consultation", "Security Overview", "Get Quote"],
    },
    accounting: {
      new: ["Accounting Demo", "ROI Data", "Free Trial"],
      returning: ["Schedule Setup", "Pricing Call", "Implementation"],
    },
    staffing: {
      new: ["Staffing Demo", "ATS Integration", "Success Stories"],
      returning: ["Book Demo", "Integration Call", "Custom Quote"],
    },
    healthcare: {
      new: ["Healthcare Demo", "HIPAA Overview", "Patient Stories"],
      returning: ["Compliance Call", "Implementation", "Get Quote"],
    },
    technology: {
      new: ["Tech Demo", "API Docs", "Integration Guide"],
      returning: ["Developer Call", "Custom Setup", "Enterprise Demo"],
    },
    general: {
      new: ["Book Demo", "Quick Tour", "Success Stories"],
      returning: ["Schedule Call", "Get Quote", "Implementation"],
    },
  };

  const buttons = conversionButtons[vertical] || conversionButtons.general;
  return isReturningVisitor ? buttons.returning : buttons.new;
}

// Helper to track SDR events for analytics
async function trackSDREvent(
  eventType: string,
  sessionId: string,
  email?: string,
  vertical?: string,
  pageUrl?: string,
  adminId?: string
) {
  try {
    const db = await getDb();
    const events = db.collection("sdr_events");

    await events.insertOne({
      eventType,
      sessionId,
      email: email || null,
      vertical: vertical || null,
      pageUrl: pageUrl || null,
      adminId: adminId || null,
      timestamp: new Date(),
    });

    console.log(
      `[SDR Analytics] Tracked event: ${eventType} for session ${sessionId}`
    );
  } catch (error) {
    console.error("[SDR Analytics] Failed to track event:", error);
    // Don't break the flow if analytics fails
  }
}

// Detect user persona from conversation history and page behavior
async function detectUserPersona(
  sessionId: string,
  messages: any[],
  pageUrl: string,
  adminId: string
): Promise<any | null> {
  try {
    const db = await getDb();
    const personas = db.collection("customer_personas");

    // Get admin's persona data
    const personaData = await personas.findOne({ adminId });
    if (!personaData || !personaData.targetAudiences) {
      return null;
    }

    // Analyze conversation for persona signals
    const conversationText = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const signals = {
      // Company size indicators
      mentionsTeam: /team|staff|employees|colleagues/i.test(conversationText),
      mentionsEnterprise:
        /enterprise|corporation|department|organization/i.test(
          conversationText
        ),
      mentionsSmallBiz: /small business|startup|freelance|solo/i.test(
        conversationText
      ),

      // Budget sensitivity
      asksPricing: /cost|price|budget|affordable|expensive|cheap/i.test(
        conversationText
      ),
      mentionsBudget: /\$|budget|cost|price|expensive|affordable/i.test(
        conversationText
      ),

      // Technical level
      asksTechnical: /api|integration|webhook|sso|technical|developer/i.test(
        conversationText
      ),
      mentionsIntegration: /integrate|connection|sync|api|plugin/i.test(
        conversationText
      ),

      // Urgency level
      urgentWords: /urgent|asap|immediately|quickly|soon|deadline/i.test(
        conversationText
      ),
      exploratory: /wondering|curious|exploring|looking into|considering/i.test(
        conversationText
      ),

      // Decision making
      decisionLanguage: /decide|decision|choose|purchase|buy|implement/i.test(
        conversationText
      ),
      exploringLanguage: /learn|understand|know more|information|details/i.test(
        conversationText
      ),

      // Page behavior
      onPricingPage: pageUrl.toLowerCase().includes("pricing"),
      onEnterprisePage: pageUrl.toLowerCase().includes("enterprise"),
      onContactPage: pageUrl.toLowerCase().includes("contact"),
    };

    // Score each persona against detected signals
    let bestMatch = null;
    let bestScore = 0;

    for (const persona of personaData.targetAudiences) {
      let score = 0;

      // Company size matching
      if (
        persona.companySize === "1-10" &&
        (signals.mentionsSmallBiz || !signals.mentionsTeam)
      )
        score += 2;
      if (
        persona.companySize === "11-50" &&
        signals.mentionsTeam &&
        !signals.mentionsEnterprise
      )
        score += 2;
      if (persona.companySize === "200+" && signals.mentionsEnterprise)
        score += 3;

      // Technical level matching
      if (persona.technicalLevel === "advanced" && signals.asksTechnical)
        score += 2;
      if (persona.technicalLevel === "beginner" && !signals.asksTechnical)
        score += 1;

      // Budget matching
      if (persona.budget === "under_500" && signals.asksPricing) score += 1;
      if (persona.budget === "10000_plus" && signals.onEnterprisePage)
        score += 2;

      // Urgency matching
      if (persona.urgency === "high" && signals.urgentWords) score += 2;
      if (persona.urgency === "low" && signals.exploratory) score += 1;

      // Decision maker matching
      if (persona.decisionMaker && signals.decisionLanguage) score += 2;
      if (!persona.decisionMaker && signals.exploringLanguage) score += 1;

      // Page context matching
      if (signals.onPricingPage && persona.budget) score += 1;
      if (signals.onEnterprisePage && persona.type === "enterprise") score += 2;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = persona;
      }
    }

    // Only return persona if we have a reasonable confidence level
    if (bestScore >= 3) {
      console.log(
        `[Persona] Detected persona: ${bestMatch.name} (score: ${bestScore})`
      );
      return bestMatch;
    }

    console.log(
      `[Persona] No strong persona match found (best score: ${bestScore})`
    );
    return null;
  } catch (error) {
    console.error("[Persona] Error detecting user persona:", error);
    return null;
  }
}

// Generate persona-specific followup message
async function generatePersonaBasedFollowup(
  detectedPersona: any,
  pageContext: string,
  currentPage: string,
  conversationHistory: string,
  followupCount: number
): Promise<any> {
  try {
    const systemPrompt = `
You are a sales assistant specialized in understanding different customer segments. Generate a followup message that resonates with this specific customer type without using personal names.

Customer Segment Profile:
- Segment: ${detectedPersona.type} (${detectedPersona.companySize} company)
- Industries: ${detectedPersona.industries.join(", ")}
- Key Pain Points: ${detectedPersona.painPoints.join(", ")}
- Preferred Features: ${detectedPersona.preferredFeatures.join(", ")}
- Budget Range: ${detectedPersona.budget}
- Technical Level: ${detectedPersona.technicalLevel}
- Urgency: ${detectedPersona.urgency}
- Decision Maker: ${detectedPersona.decisionMaker ? "Yes" : "No"}

Current Context:
- Page: ${currentPage}
- Followup #: ${followupCount + 1}
- Page Content: ${pageContext.slice(0, 500)}
- Conversation: ${conversationHistory.slice(-500)}

Generate your response in JSON format:
{
  "mainText": "<Segment-specific message under 30 words that addresses their pain points using situational language, NOT personal names>",
  "buttons": ["<3 buttons specific to what this customer segment actually needs>"],
  "emailPrompt": "<ONLY include this if followupCount >= 2 AND user hasn't provided email yet. Otherwise leave empty string.>"
}

IMPORTANT GUIDELINES:
- NEVER use personal names like "Hi John" or "Hello Sarah"
- Use situational language like "Running a startup?", "Managing a team?", "Looking for enterprise features?"
- Reference their likely situation, not a specific person
- Address pain points relevant to their company size/type
- Speak in their preferred technical level
- Focus on business context, not personal identity

LEAD PROGRESSION RULES:
- Followup #1 (followupCount=0): Give contextual question with 3 option buttons, NO email ask
- Followup #2 (followupCount=1): More specific micro-conversion nudge with 3 buttons, NO email ask  
- Followup #3 (followupCount=2): ONLY NOW ask for email if user hasn't provided it
- Keep emailPrompt empty for first 2 followups
- Match the user's current stage in the lead generation flow
- Reference their specific pain points and preferred features
- Use language appropriate for their technical level
- Consider their budget range and company size
- Match their urgency level and decision-making authority
- Be specific to their industry context if relevant
- Avoid generic messaging - make it persona-specific
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: "Generate the persona-specific followup message.",
        },
      ],
      temperature: 0.7,
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  } catch (error) {
    console.error("[Persona] Error generating persona-based followup:", error);
    return null;
  }
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

// Add a comprehensive intent detection function
function detectIntent({
  question,
  pageUrl,
}: {
  question?: string;
  pageUrl?: string;
}): string {
  const lowerQ = (question || "").toLowerCase();
  const lowerUrl = (pageUrl || "").toLowerCase();

  // Page-based intent detection (prioritized)
  if (lowerUrl.includes("pricing") || lowerUrl.includes("plans")) {
    return "comparing pricing options";
  }
  if (lowerUrl.includes("features") || lowerUrl.includes("capabilities")) {
    return "exploring features";
  }
  if (lowerUrl.includes("about") || lowerUrl.includes("company")) {
    return "learning about the company";
  }
  if (lowerUrl.includes("contact") || lowerUrl.includes("get-started")) {
    return "ready to get started";
  }
  if (lowerUrl.includes("demo") || lowerUrl.includes("trial")) {
    return "requesting a demo";
  }
  if (lowerUrl.includes("services") || lowerUrl.includes("solutions")) {
    return "exploring services";
  }
  if (lowerUrl.includes("support") || lowerUrl.includes("help")) {
    return "seeking support";
  }
  if (lowerUrl.includes("blog") || lowerUrl.includes("resources")) {
    return "researching information";
  }
  if (lowerUrl.includes("team") || lowerUrl.includes("leadership")) {
    return "learning about the team";
  }
  if (lowerUrl.includes("careers") || lowerUrl.includes("jobs")) {
    return "exploring career opportunities";
  }

  // Question-based intent detection (fallback)
  if (lowerQ.includes("how") || lowerQ.includes("works")) {
    return "understanding how it works";
  }
  if (lowerQ.includes("pricing") || lowerQ.includes("cost")) {
    return "pricing information";
  }
  if (lowerQ.includes("demo") || lowerQ.includes("demonstration")) {
    return "requesting a demo";
  }
  if (lowerQ.includes("features") || lowerQ.includes("capabilities")) {
    return "exploring features";
  }
  if (lowerQ.includes("contact") || lowerQ.includes("talk")) {
    return "wanting to connect";
  }

  // Default based on common page patterns
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

        // Gather context for lead enrichment
        let pageContext = {};

        // Try to detect intent and vertical for current context
        if (pageUrl) {
          try {
            const detectedIntent = detectIntent({ question, pageUrl });
            let detectedVertical = "general";
            let pageContent = "";

            // Get page content if available for better vertical detection
            if (adminId) {
              const pageChunks = await getChunksByPageUrl(adminId, pageUrl);
              if (pageChunks.length > 0) {
                pageContent = pageChunks.slice(0, 3).join("\n");
                detectedVertical = detectVertical(pageUrl, pageContent);
              }
            }

            // Get visited pages from session
            const sessionMessages = await chats.find({ sessionId }).toArray();
            const visitedPages = [
              ...new Set(
                sessionMessages
                  .map((m) => m.pageUrl)
                  .filter((url) => url && url !== pageUrl)
              ),
            ];

            // Extract any questions asked and user responses
            const proactiveQuestions = sessionMessages
              .filter(
                (m) =>
                  m.role === "assistant" && m.content && m.content.includes("?")
              )
              .map((m) => m.content);

            const userResponses = sessionMessages
              .filter((m) => m.role === "user")
              .map((m) => m.content);

            pageContext = {
              pageContent: pageContent.substring(0, 500), // Limit size
              detectedIntent,
              detectedVertical,
              proactiveQuestions: proactiveQuestions.slice(-3), // Last 3 questions
              userResponses: userResponses.slice(-5), // Last 5 responses
              visitedPages: visitedPages.slice(-10), // Last 10 unique pages
            };

            console.log(
              `[LeadGen] Enhanced context: intent=${detectedIntent}, vertical=${detectedVertical}, pages=${visitedPages.length}`
            );
          } catch (contextError) {
            console.error("[LeadGen] Error gathering context:", contextError);
            // Continue with basic context
          }
        }

        await createOrUpdateLead(
          adminId,
          detectedEmail,
          sessionId,
          extractedRequirements,
          pageUrl || undefined,
          firstMessage,
          pageContext
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

    // Track email capture event
    await trackSDREvent(
      "email_captured",
      sessionId,
      detectedEmail,
      undefined,
      pageUrl || undefined,
      adminId || undefined
    );

    // Immediate SDR-style activation message after email detection
    const companyName = "Your Company"; // TODO: Make this dynamic from admin settings
    const productName = "our platform"; // TODO: Make this dynamic from admin settings

    const activationMessage = {
      mainText: `Hi! I'm ${companyName}'s friendly assistant. I'm here to show how ${productName} can boost your productivity and streamline your workflow.`,
      buttons: ["Explore Solutions", "See Use Cases", "Book Quick Demo"],
      emailPrompt: "",
      botMode: "sales",
      userEmail: detectedEmail,
    };

    // Store the activation message immediately
    await chats.insertOne({
      sessionId,
      role: "assistant",
      content: activationMessage.mainText,
      buttons: activationMessage.buttons,
      emailPrompt: activationMessage.emailPrompt,
      botMode: activationMessage.botMode,
      userEmail: detectedEmail,
      email: detectedEmail,
      adminId,
      createdAt: now,
      apiKey,
      pageUrl,
    });

    // Return activation message immediately (this becomes the bot's response to the email)
    return NextResponse.json(activationMessage, { headers: corsHeaders });
  }

  // ===== INTELLIGENT CUSTOMER PROFILING =====
  // Strategic profile updates - not on every message, but on smart triggers
  if (adminId && sessionId) {
    try {
      // Get conversation history for profiling analysis
      const historyDocs = await chats
        .find({ sessionId })
        .sort({ createdAt: 1 })
        .toArray();

      const conversationForProfiling = historyDocs.map((doc) => ({
        role: doc.role as string,
        content: doc.content as string,
        createdAt: doc.createdAt as Date,
      }));

      // Add current message to conversation
      if (question) {
        conversationForProfiling.push({
          role: "user",
          content: question,
          createdAt: now,
        });
      }

      const messageCount = conversationForProfiling.length;
      const timeInSession = visitedPages?.length ? visitedPages.length * 60 : 0; // Rough estimate
      const pageTransitions = visitedPages || [];

      // Call customer profiling API to determine if update is needed
      const profileResponse = await fetch(
        `${req.nextUrl.origin}/api/customer-profiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey || "",
          },
          body: JSON.stringify({
            sessionId,
            email: detectedEmail,
            conversation: conversationForProfiling,
            messageCount,
            timeInSession,
            pageTransitions,
            pageUrl,
            trigger: detectedEmail ? "email_detection" : undefined,
          }),
        }
      );

      if (profileResponse.ok) {
        const profileResult = (await profileResponse.json()) as any;
        if (profileResult.updated) {
          console.log(
            `[CustomerProfiling] Profile updated via ${profileResult.trigger} - Confidence: ${profileResult.confidence}`
          );

          // Store profile data for potential use in response generation
          if (profileResult.profile?.intelligenceProfile?.buyingReadiness) {
            console.log(
              `[CustomerProfiling] Buying readiness: ${profileResult.profile.intelligenceProfile.buyingReadiness}`
            );
          }
        }
      } else {
        console.log(
          "[CustomerProfiling] Profile update request failed:",
          profileResponse.status
        );
      }
    } catch (error) {
      console.error(
        "[CustomerProfiling] Error in profile update process:",
        error
      );
      // Continue with normal chat flow - profiling failures shouldn't break the conversation
    }
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
        const detectedVertical = detectVertical(pageUrl, summaryContext);
        const verticalInfo = getVerticalMessage(detectedVertical);

        console.log(
          `[DEBUG] Detected intent for pageUrl "${pageUrl}": "${detectedIntent}"`
        );
        console.log(`[DEBUG] Detected vertical: "${detectedVertical}"`);
        console.log(
          `[DEBUG] Conversation state: hasBeenGreeted=${hasBeenGreeted}, proactiveCount=${proactiveMessageCount}, visitedPages=${visitedPages.length}`
        );

        // Track vertical detection if it's not 'general'
        if (detectedVertical !== "general") {
          await trackSDREvent(
            "vertical_detected",
            sessionId,
            undefined,
            detectedVertical,
            pageUrl || undefined,
            adminId || undefined
          );
        }

        let summaryPrompt;

        if (!hasBeenGreeted) {
          // Check if user already has email (sales mode activation) or preserved SDR status
          const existingEmail = await chats.findOne(
            { sessionId, email: { $exists: true } },
            { sort: { createdAt: -1 } }
          );

          if (existingEmail && existingEmail.email) {
            // User has email - use SDR activation with vertical messaging
            const companyName = "Your Company"; // TODO: Make dynamic
            const productName = "our platform"; // TODO: Make dynamic

            // Enhanced SDR message based on page navigation patterns
            const isReturningVisitor = existingEmail.preservedStatus;
            const conversionButtons = getConversionButtons(
              detectedVertical,
              isReturningVisitor
            );

            const sdrMessage = {
              mainText: isReturningVisitor
                ? `Welcome back! Let's continue exploring how ${productName} can help. ${verticalInfo.message}`
                : `Hi! I'm ${companyName}'s friendly assistant. ${verticalInfo.message}`,
              buttons: conversionButtons,
            };

            // Store the SDR continuation message
            await chats.insertOne({
              sessionId,
              role: "assistant",
              content: sdrMessage.mainText,
              buttons: sdrMessage.buttons,
              botMode: "sales",
              userEmail: existingEmail.email,
              email: existingEmail.email,
              adminId: existingEmail.adminId,
              createdAt: new Date(),
              pageUrl,
              sdrContinuation: true,
            });

            return NextResponse.json(
              {
                answer: sdrMessage.mainText,
                buttons: sdrMessage.buttons,
                botMode: "sales",
                userEmail: existingEmail.email,
              },
              { headers: corsHeaders }
            );
          }

          // First time greeting - create intelligent, page-specific messages
          summaryPrompt = `CONTEXT ANALYSIS:
Page URL: ${pageUrl}
User Intent: ${detectedIntent}
Industry Detected: ${detectedVertical}
Page Content Preview: ${summaryContext.substring(0, 800)}...

TASK: Create an intelligent proactive message that demonstrates understanding of this specific page and asks a contextual question to understand the user's needs.

ANALYSIS REQUIRED:
1. What is this page actually about? (features, pricing, use cases, etc.)
2. What would someone visiting this page likely be trying to accomplish?
3. What questions would help understand their specific needs or situation?
4. What are the most relevant next actions available on this page?

Generate response in JSON format:
{
  "mainText": "<Context-aware message (under 30 words) that shows you understand what they're viewing and asks a specific question about their needs/situation>",
  "buttons": ["<3-4 specific actions based on actual page content>"]
}

EXAMPLE APPROACH:
Instead of: "Hi! How can I help?"
Create: "I see you're exploring [specific feature/page]. Are you looking to solve [specific problem] or are you in the [situation] phase?"

MAINTEXT REQUIREMENTS:
- Reference the actual page content or purpose
- Ask a specific question that helps understand their situation, needs, or goals
- Be conversational and natural (like a knowledgeable consultant would ask)
- Under 30 words total
- End with a question that reveals their intent/needs
- Show understanding of what they're viewing

BUTTONS REQUIREMENTS:
- Based on actual functionality/content available on this page
- Help them accomplish what they likely came to do
- Be specific and actionable (not generic categories)
- Match what a user would naturally want to do next on this specific page

${
  detectedVertical !== "general"
    ? `Industry Context: This appears to be a ${detectedVertical} business, so tailor the question and options accordingly.`
    : ""
}`;
        } else {
          // Follow-up proactive message - deeper context analysis
          const isRevisit = visitedPages.some((page: string) =>
            pageUrl.includes(page)
          );

          summaryPrompt = `FOLLOW-UP CONTEXT ANALYSIS:
Current Page: ${pageUrl}
User Journey: Message #${proactiveMessageCount + 1}, visited ${
            visitedPages.length
          } pages
Page Content: ${summaryContext.substring(0, 600)}...
Revisiting Similar Page: ${isRevisit}

TASK: Create an intelligent follow-up that builds on their browsing behavior and asks a deeper question about their specific needs or decision process.

BEHAVIORAL ANALYSIS:
1. They've been exploring for a while - what might they be comparing or deciding between?
2. Based on this specific page content, what stage of evaluation/decision are they in?
3. What specific concern or question would help them move forward?
4. What obstacles or uncertainties might they have at this point?

Generate response in JSON format:
{
  "mainText": "<Context-aware follow-up (under 25 words) that acknowledges their exploration and asks about specific needs/concerns>",
  "buttons": ["<3 specific actions relevant to their current evaluation stage>"]
}

FOLLOW-UP APPROACH:
Instead of: "Need help with anything?"
Create: "I see you're comparing [feature/option]. What's most important for your [specific situation]?" or "Since you're exploring [specific area], are you trying to [specific goal] or [alternative goal]?"

MAINTEXT REQUIREMENTS:
- Acknowledge they've been exploring (no repetitive greetings)
- Reference the specific page/content they're viewing
- Ask about their decision criteria, priorities, or specific concerns
- Under 25 words total
- Show progression in the conversation (building on their journey)
- Ask questions that reveal decision factors or obstacles

BUTTONS REQUIREMENTS:
- Match their current evaluation stage (comparing, learning details, etc.)
- Provide specific resources or actions that help with decision-making
- Based on actual page content and functionality
- Help them get answers to likely concerns at this stage`;
        }
        const summaryResp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an intelligent sales consultant that creates personalized, context-aware messages. Your expertise is understanding what users are viewing and asking the right questions to uncover their specific needs and decision criteria.

CORE INTELLIGENCE:
1. CONTENT ANALYSIS: Deeply understand what's on the page (features, benefits, use cases, pricing, etc.)
2. USER PSYCHOLOGY: Consider what someone viewing this content is trying to accomplish
3. NEEDS DISCOVERY: Ask questions that reveal their situation, priorities, and decision factors
4. CONTEXTUAL RELEVANCE: Reference specific elements they can actually see and interact with

CONVERSATION PRINCIPLES:
- Act like a knowledgeable consultant who's reviewed their current page
- Ask questions that sales professionals would ask to understand needs
- Show you understand their current context and exploration process
- Help them identify what matters most for their specific situation
- Guide toward meaningful next steps based on their actual needs

QUESTION STRATEGY:
- Ask about their current situation or challenges
- Understand their decision criteria or priorities
- Identify their timeline or urgency
- Uncover what's most important to them
- Help them compare or evaluate options

RESPONSE FORMAT:
- Always return valid JSON with "mainText" and "buttons"
- Keep responses conversational and consultative
- Reference actual page content when relevant
- Ask questions that lead to meaningful lead qualification
- Provide buttons that help them get specific answers or take relevant actions
- NEVER use personal names (no "Hi John", "Hello Sarah", etc.)
- Use situational language instead ("Running a startup?", "Managing a team?")

LEAD QUALIFICATION FOCUS:
- Company size or role (when relevant to the page content)
- Specific use cases or challenges they're trying to solve
- Decision timeline and process
- Budget considerations (when contextually appropriate)
- Technical requirements or preferences
- Current solutions or alternatives they're considering

MESSAGING APPROACH:
- Use business/situational context, not personal identity
- Address their likely role or company stage
- Reference their business challenges, not personal details
- Focus on what they're trying to accomplish professionally

CORE PRINCIPLES:
1. Analyze the actual page content to understand what's available
2. Create messages that feel natural and conversational
3. Avoid repetitive patterns or formulaic responses
4. Be specific to the actual content, not generic page types
5. Generate buttons based on real functionality or information available
6. Keep responses short but meaningful
7. Sound like a helpful human, not a script

RESPONSE FORMAT:
- Always return valid JSON with "mainText" and "buttons" fields
- Keep mainText under 30 words for greetings, 25 for follow-ups
- Generate 3-4 buttons that are 2-3 words each
- Base everything on the actual page content provided
- Be genuinely helpful based on what the user can actually do

AVOID:
- Hardcoded examples or patterns
- Generic "Learn More" type buttons unless specific
- Repetitive greeting styles
- Formulaic responses
- Long feature lists or bullet points
- Overly enthusiastic or salesy tone

Focus on being genuinely useful based on what the user is actually viewing.`,
            },
            { role: "user", content: summaryPrompt },
          ],
        });
        pageSummary = summaryResp.choices[0].message.content || "";

        // Parse the JSON response from the AI
        let proactiveResponse;
        try {
          proactiveResponse = JSON.parse(pageSummary);
        } catch (error) {
          // Dynamic fallback based on page content
          console.log(
            "[Proactive] Failed to parse JSON, creating dynamic fallback"
          );

          // Extract key info from page context for fallback
          const contextKeywords = summaryContext.toLowerCase();
          let fallbackMessage =
            "How can I help you with what you're looking for?";
          let fallbackButtons = ["Get Help", "Ask Questions", "Learn More"];

          // Create contextual fallback based on actual content
          if (
            contextKeywords.includes("pricing") ||
            contextKeywords.includes("plan")
          ) {
            fallbackMessage = "Questions about our options?";
            fallbackButtons = ["See Plans", "Get Quote", "Ask Questions"];
          } else if (
            contextKeywords.includes("demo") ||
            contextKeywords.includes("trial")
          ) {
            fallbackMessage = "Ready to try it out?";
            fallbackButtons = ["Start Demo", "Book Call", "Learn More"];
          } else if (
            contextKeywords.includes("contact") ||
            contextKeywords.includes("support")
          ) {
            fallbackMessage = "Need assistance?";
            fallbackButtons = ["Get Help", "Contact Us", "Ask Questions"];
          }

          proactiveResponse = {
            mainText: fallbackMessage,
            buttons: fallbackButtons,
          };
        }

        const proactiveMsg = proactiveResponse.mainText;
        const buttons = proactiveResponse.buttons || [];

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
            buttons: buttons,
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

        // Try persona-based followup first
        console.log(
          `[Persona] Attempting persona detection for followup ${followupCount}`
        );
        const detectedPersona = await detectUserPersona(
          sessionId,
          previousChats,
          pageUrl,
          adminId || ""
        );

        let personaFollowup = null;
        if (detectedPersona && pageChunks.length > 0) {
          console.log(
            `[Persona] Generating persona-based followup for: ${detectedPersona.name}`
          );
          personaFollowup = await generatePersonaBasedFollowup(
            detectedPersona,
            pageChunks.slice(0, 3).join("\n---\n"),
            pageUrl,
            previousQnA,
            followupCount
          );
        }

        let followupSystemPrompt = "";
        let followupUserPrompt = "";

        // Use persona-based followup if available, otherwise fall back to generic
        if (personaFollowup && personaFollowup.mainText) {
          console.log(
            `[Persona] Using persona-based followup for ${detectedPersona.name}`
          );

          let userEmail: string | null = null;
          if (lastEmailMsg && lastEmailMsg.email)
            userEmail = lastEmailMsg.email;
          const botMode = userEmail ? "sales" : "lead_generation";

          // Respect lead progression - only ask for email on 3rd followup
          const shouldAskForEmail =
            followupCount >= 2 && !userEmail && personaFollowup.emailPrompt;

          const followupWithMode = {
            ...personaFollowup,
            emailPrompt: shouldAskForEmail ? personaFollowup.emailPrompt : "",
            botMode,
            userEmail: userEmail || null,
          };

          return NextResponse.json(followupWithMode, { headers: corsHeaders });
        }

        // Fall back to generic followup logic
        console.log(
          `[Persona] No persona detected or persona followup failed, using generic followup`
        );

        if (followupCount === 0) {
          // First follow-up: context-aware nudge with buttons, tip is optional
          followupSystemPrompt = `
You are a helpful sales assistant. The user has not provided an email yet.

You will receive page and general context, the detected intent, and the previous conversation. Always generate your response in the following JSON format:
{
  "mainText": "<A single, creative, engaging nudge for the user. STRICT LIMITS: Maximum 30 words total. Be specific to page context and detected intent. Do NOT repeat previous questions. Keep it super concise and engaging.>",
  "buttons": ["<Generate exactly 3 buttons, each must be 3-4 words maximum. Make them actionable and specific to the actual page content and user needs.>"],
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
- Generate exactly 3 buttons, each 3-4 words maximum. Base them on actual page content and user needs.
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
  "mainText": "<A micro-conversion nudge—small, low-friction ask. STRICT LIMITS: Maximum 30 words total. Use casual, friendly tone. Be specific to their context and what they're actually viewing.>",
  "buttons": ["<Generate exactly 3 buttons, each must be 3-4 words maximum. Make them actionable and specific to the actual page content.>"],
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
- Your mainText must be a micro-conversion nudge, referencing the user's last action, detected intent, page context, or actual page content. Do NOT ask for a discovery call or email directly. Vary the nudge text for each follow-up.`;
          followupUserPrompt = `Ask a micro-conversion nudge—a small, low-friction ask (e.g., 'Want to save this setup guide to your email?' or 'Should I show how others customize their services?'), based on the user's last action, detected intent, page context, or detected intent. Do NOT ask for a discovery call or email directly. Vary the nudge text for each follow-up. Only output the JSON format as instructed.`;
        } else if (followupCount === 2) {
          // Third follow-up: check if user already has email
          if (userHasEmail) {
            // User is in sales mode - aggressive SDR-style conversion focus
            followupSystemPrompt = `
You are a confident sales assistant. The user has already provided their email and is a qualified lead in sales mode.

You will receive page and general context, the detected intent, and the previous conversation. Always generate your response in the following JSON format:
{
  "mainText": "<Direct, value-focused message. Reference specific ROI, time savings, or competitive advantage. Be consultative but assertive. Maximum 30 words. Use numbers/statistics when possible.>",
  "buttons": ["<2-3 high-conversion actions like 'Book 15-min Demo', 'Get Custom Quote', 'Talk to Specialist', 'See ROI Calculator'>"],
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

SDR Guidelines:
- Reference specific business outcomes (save X hours, increase Y%, reduce Z cost)
- Create urgency with limited-time value
- Use consultative language ("Based on what you're viewing...")
- Be confident about the solution fit
- Focus on next concrete step in sales process
- Only use the above JSON format.`;
            followupUserPrompt = `Create an SDR-style value proposition with specific benefits. The user has email so focus on conversion. Reference ROI, time savings, or competitive advantage. Be assertive but consultative. Only output the JSON format as instructed.`;
          } else {
            // User hasn't provided email yet - ask for it
            followupSystemPrompt = `
You are a helpful sales assistant. The user has not provided an email yet.

You will receive page and general context, the detected intent, and the previous conversation. Always generate your response in the following JSON format:
{
  "mainText": "<A friendly, direct request for email. STRICT LIMITS: Maximum 30 words total. Explain briefly why you need it based on what they're viewing. Reference actual page content.>",
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
- Your mainText must be a friendly, direct request for the user's email, referencing the actual page context or detected intent. Do NOT ask another qualifying question or repeat previous questions.`;
            followupUserPrompt = `Ask the user for their email in a friendly, direct way, explaining why you need it to send them setup instructions, a demo, or connect them to support for this page. Reference the page context or detected intent if possible. Do NOT ask another qualifying question. Do NOT include any buttons. Only output the JSON format as instructed.`;
          }
        } else if (followupCount === 3) {
          // Final nudge: aggressive conversion attempt for sales mode
          if (userHasEmail) {
            // User is in sales mode - final high-pressure but helpful conversion push
            followupSystemPrompt = `You are a confident sales assistant. The user has already provided their email and is a qualified lead. This is your final conversion attempt.

Always generate your response in the following JSON format:
{
  "mainText": "<Final conversion push. Create urgency with specific value proposition. Reference what they've viewed and time-sensitive opportunity. Maximum 30 words. Be direct but helpful.>",
  "buttons": ["<Generate exactly 3 conversion-focused buttons like 'Book Call Now', 'Get Quote Today', 'Priority Demo'>"],
  "emailPrompt": ""
}

Context: 
Page Context: ${pageChunks.slice(0, 3).join("\\n---\\n")} 
General Context: ${pageChunks.join(" ")} 
Detected Intent: ${detectedIntent} 
Previous Conversation: ${previousQnA} 

Final Conversion Guidelines:
- Create time-sensitive urgency ("limited spots", "this week only", "priority access")
- Reference their specific viewing behavior
- Offer exclusive value (priority support, custom setup, direct expert access)
- Use scarcity psychology appropriately
- Be confident about solution fit based on their engagement
- Focus on immediate next step that moves them to purchase/demo
- Only use the above JSON format.`;
            followupUserPrompt = `Make a final conversion push with urgency and exclusive value. User has email so this is pure sales conversion. Reference their page viewing and create time-sensitive opportunity. Only output the JSON format as instructed.`;
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
- Your mainText must summarize the user's journey and offer to email a summary. Be natural and avoid formulaic language.`;
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

      // Generate dynamic generic message based on URL patterns
      const urlLower = pageUrl.toLowerCase();
      let contextualMessage =
        "I'm here to help you find what you're looking for.";

      if (urlLower.includes("pricing") || urlLower.includes("plan")) {
        contextualMessage =
          "I can help you understand the available options and pricing.";
      } else if (urlLower.includes("feature") || urlLower.includes("product")) {
        contextualMessage =
          "I can explain how our features work and help you get started.";
      } else if (urlLower.includes("contact") || urlLower.includes("about")) {
        contextualMessage =
          "I'm here to help you connect with our team or learn more.";
      } else if (urlLower.includes("demo") || urlLower.includes("trial")) {
        contextualMessage =
          "I can help you try our platform or schedule a demonstration.";
      } else if (urlLower.includes("support") || urlLower.includes("help")) {
        contextualMessage =
          "I'm here to provide support and answer your questions.";
      }

      const proactiveMsg = `${contextualMessage}

What specific information are you looking for? I'm here to help guide you through the available options and answer any questions you might have.`;

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
        // Generate contextual followup based on URL or previous conversation
        const urlLower = pageUrl?.toLowerCase() || "";
        let contextualMessage = "Is there anything else you'd like to explore?";

        if (urlLower.includes("pricing") || urlLower.includes("plan")) {
          contextualMessage =
            "Would you like to discuss pricing options or compare different plans?";
        } else if (
          urlLower.includes("feature") ||
          urlLower.includes("product")
        ) {
          contextualMessage =
            "Interested in seeing how these features could work for your needs?";
        } else if (urlLower.includes("demo") || urlLower.includes("trial")) {
          contextualMessage = "Ready to experience the platform firsthand?";
        } else if (urlLower.includes("contact") || urlLower.includes("about")) {
          contextualMessage =
            "Would you like to connect with our team or learn more about our approach?";
        }

        console.log(
          `[Followup] Sending contextual followup ${followupCount} for session ${sessionId}`
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
            mainText: contextualMessage,
            buttons: ["Learn More", "Get Help", "Contact Us"],
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

      // First, check if user has email (to preserve SDR status)
      const emailMessage = await chats.findOne(
        { sessionId, email: { $exists: true } },
        { sort: { createdAt: -1 } }
      );

      // Delete all chat history for this session
      const result = await chats.deleteMany({ sessionId });

      console.log(
        `[Chat] Cleared ${result.deletedCount} messages for session ${sessionId}`
      );

      // If user had email, preserve their SDR status for cross-page activation
      let preservedEmailStatus = null;
      if (emailMessage && emailMessage.email) {
        preservedEmailStatus = {
          email: emailMessage.email,
          botMode: emailMessage.botMode || "sales",
          userEmail: emailMessage.email,
          adminId: emailMessage.adminId,
        };

        console.log(
          `[Chat] Preserving SDR status for ${emailMessage.email} across page navigation`
        );

        // Store a minimal record to maintain SDR status
        await chats.insertOne({
          sessionId,
          role: "system",
          content: "SDR_STATUS_PRESERVED",
          email: emailMessage.email,
          botMode: emailMessage.botMode || "sales",
          userEmail: emailMessage.email,
          adminId: emailMessage.adminId,
          createdAt: new Date(),
          preservedStatus: true,
        });
      }

      return NextResponse.json(
        {
          success: true,
          deletedCount: result.deletedCount,
          message: "Chat history cleared successfully",
          preservedEmailStatus,
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
