import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyApiKey } from "@/lib/auth";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import { z } from "zod";
import { assertBodyConstraints } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Cookie",
  "Access-Control-Max-Age": "86400",
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Smart update trigger detection
function shouldUpdateProfile(
  messageCount: number,
  conversation: string[],
  timeInSession: number,
  pageTransitions: string[],
  lastUpdateTrigger: string,
  lastUpdateTime: Date,
): { shouldUpdate: boolean; trigger: string } {
  const latestMessage = conversation[conversation.length - 1] || "";
  const timeSinceLastUpdate = Date.now() - lastUpdateTime.getTime();

  // Primary triggers (always update)
  if (detectEmailInMessage(latestMessage)) {
    return { shouldUpdate: true, trigger: "email_detection" };
  }

  if (messageCount % 3 === 0 && messageCount > 0) {
    return { shouldUpdate: true, trigger: "periodic_update" };
  }

  if (detectBudgetMention(latestMessage)) {
    return { shouldUpdate: true, trigger: "budget_mention" };
  }

  if (detectTechnicalTerms(latestMessage)) {
    return { shouldUpdate: true, trigger: "technical_discussion" };
  }

  if (detectCompanySize(latestMessage)) {
    return { shouldUpdate: true, trigger: "company_sizing" };
  }

  if (detectDecisionLanguage(latestMessage)) {
    return { shouldUpdate: true, trigger: "decision_authority" };
  }

  // Active conversation catchup
  if (messageCount > 2 && timeSinceLastUpdate > 60000) {
    // 1 min
    return { shouldUpdate: true, trigger: "active_conversation_catchup" };
  }

  // Secondary triggers (conditional)
  if (
    pageTransitions.length >= 3 &&
    lastUpdateTrigger !== "page_transition" &&
    timeSinceLastUpdate > 120000
  ) {
    // 2 minutes
    return { shouldUpdate: true, trigger: "page_transition" };
  }

  if (
    timeInSession > 900 &&
    lastUpdateTrigger !== "extended_session" &&
    timeSinceLastUpdate > 300000
  ) {
    // 15+ minutes, 5 min gap
    return { shouldUpdate: true, trigger: "extended_session" };
  }

  if (detectIntentShift(conversation)) {
    return { shouldUpdate: true, trigger: "intent_shift" };
  }

  // Contextual triggers (smart timing)
  if (
    detectFeatureRequest(latestMessage) &&
    messageCount > 10 &&
    timeSinceLastUpdate > 180000
  ) {
    // 3 minutes
    return { shouldUpdate: true, trigger: "feature_inquiry" };
  }

  if (detectContactRequest(latestMessage)) {
    return { shouldUpdate: true, trigger: "contact_request" };
  }

  if (
    detectIntegrationQuestions(latestMessage) &&
    lastUpdateTrigger !== "technical_discussion"
  ) {
    return { shouldUpdate: true, trigger: "integration_discussion" };
  }

  return { shouldUpdate: false, trigger: "" };
}

// Detection helper functions
function detectEmailInMessage(message: string): boolean {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  return emailRegex.test(message);
}

function detectBudgetMention(message: string): boolean {
  const budgetKeywords =
    /\b(budget|cost|price|pricing|expensive|cheap|affordable|\$[\d,]+|investment|spend|financial|plan|plans|billing|subscription|quote|rates|fees)\b/i;
  return budgetKeywords.test(message);
}

function detectTechnicalTerms(message: string): boolean {
  const techKeywords =
    /\b(api|integration|webhook|database|authentication|sso|saml|oauth|rest|graphql|sdk|framework|deployment|cloud|aws|azure|docker|kubernetes)\b/i;
  return techKeywords.test(message);
}

function detectCompanySize(message: string): boolean {
  const sizeKeywords =
    /\b(team|company|employees|staff|startup|enterprise|corporation|small business|freelancer|agency|department|organization)\b/i;
  return sizeKeywords.test(message);
}

function detectDecisionLanguage(message: string): boolean {
  const decisionKeywords =
    /\b(decide|decision|approve|buy|purchase|implement|choose|select|evaluate|need approval|check with team|let me think)\b/i;
  return decisionKeywords.test(message);
}

function detectIntentShift(conversation: string[]): boolean {
  if (conversation.length < 6) return false;

  const recent = conversation.slice(-3).join(" ");
  const earlier = conversation.slice(-6, -3).join(" ");

  const researchKeywords =
    /\b(learn|understand|explore|research|information|tell me about)\b/i;
  const buyingKeywords =
    /\b(price|cost|buy|purchase|sign up|get started|demo|trial)\b/i;

  return researchKeywords.test(earlier) && buyingKeywords.test(recent);
}

function detectFeatureRequest(message: string): boolean {
  const featureKeywords =
    /\b(feature|functionality|can it|does it|support|capability|able to|possible to)\b/i;
  return featureKeywords.test(message);
}

function detectContactRequest(message: string): boolean {
  const contactKeywords =
    /\b(call|phone|talk to|speak with|contact|demo|meeting|schedule|sales|support|book|booking)\b/i;
  return contactKeywords.test(message);
}

function detectIntegrationQuestions(message: string): boolean {
  const integrationKeywords =
    /\b(integrate|connect|sync|import|export|plugin|extension|third-party|works with)\b/i;
  return integrationKeywords.test(message);
}

// Calculate profile confidence score
function calculateConfidenceScore(profile: any): number {
  let score = 0;
  let maxScore = 0;

  // Basic information (20%)
  maxScore += 20;
  if (profile.email) score += 10;
  if (profile.totalSessions > 1) score += 5;
  if (profile.engagementProfile?.timeOnSite > 300) score += 5;

  // Company profile (25%)
  maxScore += 25;
  if (profile.companyProfile?.size) score += 8;
  if (profile.companyProfile?.industry) score += 8;
  if (profile.companyProfile?.techStack?.length > 0) score += 5;
  if (profile.companyProfile?.currentTools?.length > 0) score += 4;

  // Behavior profile (20%)
  maxScore += 20;
  if (profile.behaviorProfile?.technicalLevel) score += 5;
  if (profile.behaviorProfile?.decisionMaker !== null) score += 5;
  if (profile.behaviorProfile?.researchPhase) score += 5;
  if (profile.behaviorProfile?.urgency) score += 5;

  // Requirements profile (25%)
  maxScore += 25;
  if (profile.requirementsProfile?.primaryUseCase) score += 8;
  if (profile.requirementsProfile?.specificFeatures?.length > 0) score += 7;
  if (profile.requirementsProfile?.budgetRange) score += 5;
  if (profile.requirementsProfile?.timeline) score += 5;

  // Engagement profile (10%)
  maxScore += 10;
  if (profile.engagementProfile?.questionsAsked > 3) score += 3;
  if (profile.engagementProfile?.pagesVisited?.length > 2) score += 4;
  if (profile.engagementProfile?.conversionSignals?.length > 0) score += 3;

  return Math.min(Math.round((score / maxScore) * 100) / 100, 1);
}

// AI-powered profile analysis
async function analyzeProfileSection(
  sectionType: string,
  conversationContent: string,
  existingProfile: any,
): Promise<any> {
  const prompts = {
    company: `Analyze this conversation to extract company/business information:

Conversation:
${conversationContent}

Extract and return JSON:
{
  "size": "solo|small_business|startup|mid_market|enterprise",
  "industry": "specific industry if explicitly mentioned by the customer",
  "revenue": "under_100k|100k_1m|1m_10m|10m_plus|unknown",
  "techStack": ["mentioned technologies"],
  "currentTools": ["existing tools/software mentioned"]
}

CRITICAL: For "industry" field, ONLY include a value if the customer has explicitly stated their business type, industry, or profession (e.g., "I'm a lawyer", "We're a dental practice", "Our restaurant"). Do NOT infer or assume industry from page content, context clues, or general conversation. Use "unknown" if the customer has not explicitly stated their business type.`,

    behavior: `Analyze this conversation to assess behavioral patterns:

Conversation:
${conversationContent}

Extract and return JSON:
{
  "technicalLevel": "low|medium|high|expert",
  "decisionMaker": true|false,
  "researchPhase": "awareness|research|evaluation|decision",
  "urgency": "low|medium|high|urgent",
  "communicationStyle": "analytical|direct|relationship_focused"
}

Base assessment on language used, questions asked, and expressed needs.`,

    requirements: `Analyze this conversation to extract business requirements:

Conversation:
${conversationContent}

Extract and return JSON:
{
  "primaryUseCase": "main use case if clearly stated",
  "specificFeatures": ["specific features mentioned"],
  "integrationNeeds": ["systems they want to integrate with"],
  "budgetRange": "under_500|500_2k|2k_10k|10k_plus|unknown",
  "timeline": "asap|this_month|next_quarter|exploring|unknown",
  "scalingNeeds": ["future scaling requirements"]
}

Focus on specific requirements and constraints mentioned.`,

    intelligence: `Analyze this conversation to generate intelligence insights:

Conversation:
${conversationContent}

Current profile context:
${JSON.stringify(existingProfile, null, 2)}

Extract and return JSON:
{
  "buyingReadiness": "low|medium|high|very_high",
  "conversionProbability": 0.0-1.0,
  "topicsDiscussed": ["list of 3-5 main topics discussed (use canonical terms like 'pricing', 'features', 'security', 'integrations')"],
  "recommendedNextSteps": ["specific recommended actions"],
  "riskFactors": ["potential obstacles or concerns"],
  "strengths": ["positive signals and opportunities"]
}

Provide actionable insights based on conversation patterns and profile data.`,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert customer intelligence analyst. Analyze conversations to extract ${sectionType} insights. Always return valid JSON. Be conservative - only include information that's clearly supported by the conversation. NEVER assume or infer business types, industries, or professions unless explicitly stated by the customer.`,
        },
        {
          role: "user",
          content: prompts[sectionType as keyof typeof prompts],
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const result = completion.choices[0].message.content?.trim();
    if (!result) return null;

    // Extract JSON from markdown code blocks if present
    let jsonContent = result;

    // Check if the result is wrapped in markdown code blocks
    const codeBlockMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonContent = codeBlockMatch[1].trim();
    }

    // Remove any remaining markdown formatting
    jsonContent = jsonContent
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, "");

    try {
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error(
        `[CustomerProfiling] JSON parse error for ${sectionType}:`,
        {
          error: parseError,
          originalResult: result,
          cleanedContent: jsonContent,
        },
      );
      return null;
    }
  } catch (error) {
    console.error(`[CustomerProfiling] Error analyzing ${sectionType}:`, error);
    return null;
  }
}

// Compute BANT score and stage
function computeBant(profile: any) {
  const budgetRange = profile?.requirementsProfile?.budgetRange || "";
  const timeline = profile?.requirementsProfile?.timeline || "";
  const decisionMaker = profile?.behaviorProfile?.decisionMaker;
  const hasNeed = Boolean(
    (profile?.requirementsProfile?.primaryUseCase &&
      profile.requirementsProfile.primaryUseCase.length > 0) ||
    (profile?.requirementsProfile?.specificFeatures &&
      profile.requirementsProfile.specificFeatures.length > 0),
  );

  let score = 0;
  let completeness = 0;

  const budgetKnown = Boolean(budgetRange && budgetRange !== "unknown");
  const authorityKnown = decisionMaker !== undefined;
  const timelineKnown = Boolean(timeline && timeline !== "unknown");
  const needKnown = hasNeed;

  const basePerSignal = 20;
  if (budgetKnown) {
    score += basePerSignal;
    switch (String(budgetRange)) {
      case "under_500":
        score += 2;
        break;
      case "500_2k":
        score += 3;
        break;
      case "2k_10k":
        score += 4;
        break;
      case "10k_plus":
        score += 5;
        break;
    }
    completeness += 1;
  }
  if (authorityKnown) {
    score += basePerSignal;
    if (decisionMaker === true) score += 5;
    completeness += 1;
  }
  if (needKnown) {
    score += basePerSignal;
    const featuresCount = Array.isArray(
      profile?.requirementsProfile?.specificFeatures,
    )
      ? profile.requirementsProfile.specificFeatures.length
      : 0;
    score += featuresCount >= 2 ? 3 : 2;
    completeness += 1;
  }
  if (timelineKnown) {
    score += basePerSignal;
    switch (String(timeline)) {
      case "asap":
      case "this_month":
        score += 5;
        break;
      case "next_quarter":
        score += 3;
        break;
      case "exploring":
        score += 1;
        break;
    }
    completeness += 1;
  }

  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const completenessRatio = Math.min(1, Math.max(0, completeness / 4));

  let stage = "intro";
  if (timelineKnown) stage = "timeline";
  else if (needKnown) stage = "need";
  else if (authorityKnown) stage = "authority";
  else if (budgetKnown) stage = "budget";

  return {
    budgetRange: budgetKnown ? budgetRange : "unknown",
    authorityDecisionMaker:
      authorityKnown && typeof decisionMaker === "boolean"
        ? decisionMaker
        : null,
    needSummary: profile?.requirementsProfile?.primaryUseCase || null,
    timeline: timelineKnown ? timeline : "unknown",
    score: normalizedScore,
    completeness: completenessRatio,
    stage,
  };
}

// Get customer profile
export async function GET(req: NextRequest) {
  const rl = await rateLimit(req, "auth");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: corsHeaders },
    );
  }
  let adminId: string | null = null;

  // Check authentication
  const token = req.cookies.get("auth_token")?.value;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        email: string;
        adminId: string;
      };
      adminId = payload.adminId;
    } catch {
      // Continue to check API key
    }
  }

  if (!adminId) {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      const apiAuth = await verifyApiKey(apiKey);
      if (apiAuth) {
        adminId = apiAuth.adminId;
      }
    }
  }

  if (!adminId) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: corsHeaders },
    );
  }

  try {
    const url = new URL(req.url);
    const sessionIdRaw = url.searchParams.get("sessionId");
    const emailRaw = url.searchParams.get("email");
    const getAllProfiles = url.searchParams.get("all") === "true";

    const sessionId =
      sessionIdRaw && sessionIdRaw.length <= 128 ? sessionIdRaw : null;
    const email = emailRaw && emailRaw.length <= 256 ? emailRaw : null;

    if (!sessionId && !email && !getAllProfiles) {
      return NextResponse.json(
        { error: "sessionId, email, or all=true required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const db = await getDb();
    const profiles = db.collection("customer_profiles");

    if (getAllProfiles) {
      // Fetch all profiles for this admin
      const allProfiles = await profiles
        .find({ adminId })
        .sort({ lastContact: -1 })
        .toArray();

      return NextResponse.json(
        { profiles: allProfiles },
        { headers: corsHeaders },
      );
    }

    const query: Record<string, unknown> = { adminId };
    if (sessionId) query.sessionIds = sessionId;
    if (email) query.email = email;

    const profile = await profiles.findOne(query);

    if (profile && !profile.bant) {
      (profile as any).bant = computeBant(profile);
    }

    return NextResponse.json(
      { profile: profile || null },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500, headers: corsHeaders },
    );
  }
}

// Create or update customer profile
export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "auth");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: corsHeaders },
    );
  }
  let adminId: string | null = null;

  // Check authentication
  const token = req.cookies.get("auth_token")?.value;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        email: string;
        adminId: string;
      };
      adminId = payload.adminId;
    } catch {
      // Continue to check API key
    }
  }

  if (!adminId) {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      const apiAuth = await verifyApiKey(apiKey);
      if (apiAuth) {
        adminId = apiAuth.adminId;
      }
    }
  }

  if (!adminId) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: corsHeaders },
    );
  }

  try {
    const body = await req.json();
    assertBodyConstraints(body, { maxBytes: 128 * 1024, maxDepth: 8 });

    const ConversationMessageSchema = z
      .object({
        role: z.string().min(1).max(32),
        content: z.string().min(1).max(5000),
      })
      .strict();

    const BodySchema = z
      .object({
        sessionId: z.string().min(1).max(128),
        email: z.string().email().max(256).optional(),
        conversation: z
          .union([
            z.string().max(20000),
            z.array(ConversationMessageSchema).max(200),
          ])
          .optional(),
        messageCount: z.number().int().min(0).max(10000).optional(),
        timeInSession: z
          .number()
          .int()
          .min(0)
          .max(24 * 60 * 60)
          .optional(),
        pageTransitions: z
          .array(z.string().min(1).max(2048))
          .max(500)
          .optional(),
        pageUrl: z.string().url().max(2048).optional(),
        trigger: z
          .enum([
            "email_detection",
            "periodic_update",
            "budget_mention",
            "technical_discussion",
            "company_sizing",
            "decision_authority",
            "page_transition",
            "extended_session",
            "intent_shift",
            "feature_inquiry",
            "contact_request",
            "integration_discussion",
            "bant_complete",
          ])
          .optional(),
      })
      .strict();

    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400, headers: corsHeaders },
      );
    }

    const {
      sessionId,
      email,
      conversation,
      messageCount,
      timeInSession,
      pageTransitions,
      pageUrl,
      trigger,
    } = parsed.data;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const db = await getDb();
    const profiles = db.collection("customer_profiles");
    const chats = db.collection("chats");
    const conversations = db.collection("conversations");

    // Get existing profile
    let existingProfile = await profiles.findOne({
      adminId,
      sessionIds: sessionId,
    });

    // If no existing profile and we have an email, check by email
    if (!existingProfile && email) {
      existingProfile = await profiles.findOne({
        adminId,
        email,
      });
    }

    const now = new Date();
    const conversationContent = Array.isArray(conversation)
      ? conversation.map((msg) => `${msg.role}: ${msg.content}`).join("\n")
      : conversation || "";

    // Resolve email from provided param, existing profile, or latest chat message
    let resolvedEmail: string | null = email || null;
    if (!resolvedEmail) {
      // Try latest chat containing an email for this session
      const lastEmailMsg = await chats.findOne(
        { sessionId, email: { $exists: true } },
        { sort: { createdAt: -1 } },
      );
      if (lastEmailMsg && typeof lastEmailMsg.email === "string") {
        resolvedEmail = lastEmailMsg.email;
      } else if (existingProfile && typeof existingProfile.email === "string") {
        resolvedEmail = existingProfile.email;
      }
    }

    // Resolve display name from conversation profile data if available
    let resolvedName: string | null = null;
    try {
      const convo = await conversations.findOne({ sessionId });
      if (
        convo &&
        typeof convo.userName === "string" &&
        convo.userName.trim()
      ) {
        resolvedName = convo.userName.trim();
      }
    } catch {}

    // Determine if we should update
    const lastUpdateTime = existingProfile?.profileMeta?.lastUpdated
      ? new Date(existingProfile.profileMeta.lastUpdated)
      : new Date(0);

    const updateDecision = shouldUpdateProfile(
      messageCount || 0,
      Array.isArray(conversation)
        ? conversation.map((msg) => msg.content)
        : [conversation || ""],
      timeInSession || 0,
      pageTransitions || [],
      existingProfile?.profileMeta?.lastUpdateTrigger || "",
      lastUpdateTime,
    );

    const shouldUpdate = trigger || updateDecision.shouldUpdate;
    const updateTrigger = trigger || updateDecision.trigger;

    if (!shouldUpdate && existingProfile) {
      return NextResponse.json(
        {
          profile: existingProfile,
          updated: false,
          reason: "No update trigger met",
        },
        { headers: corsHeaders },
      );
    }

    // Analyze profile sections based on trigger
    let updates: Record<string, unknown> = {};

    if (updateTrigger === "email_detection" || !existingProfile) {
      // Comprehensive analysis for new profiles or email detection
      const [
        companyAnalysis,
        behaviorAnalysis,
        requirementsAnalysis,
        intelligenceAnalysis,
      ] = await Promise.all([
        analyzeProfileSection("company", conversationContent, existingProfile),
        analyzeProfileSection("behavior", conversationContent, existingProfile),
        analyzeProfileSection(
          "requirements",
          conversationContent,
          existingProfile,
        ),
        analyzeProfileSection(
          "intelligence",
          conversationContent,
          existingProfile,
        ),
      ]);

      updates = {
        companyProfile: companyAnalysis || {},
        behaviorProfile: behaviorAnalysis || {},
        requirementsProfile: requirementsAnalysis || {},
        intelligenceProfile: intelligenceAnalysis || {},
      };
    } else {
      // Targeted updates based on trigger
      switch (updateTrigger) {
        case "budget_mention":
          updates.requirementsProfile = await analyzeProfileSection(
            "requirements",
            conversationContent,
            existingProfile,
          );
          // Also update intelligence for topics discussed
          updates.intelligenceProfile = await analyzeProfileSection(
            "intelligence",
            conversationContent,
            existingProfile,
          );
          break;
        case "technical_discussion":
        case "integration_discussion":
          updates.companyProfile = await analyzeProfileSection(
            "company",
            conversationContent,
            existingProfile,
          );
          updates.behaviorProfile = await analyzeProfileSection(
            "behavior",
            conversationContent,
            existingProfile,
          );
          // Also update intelligence for topics discussed
          updates.intelligenceProfile = await analyzeProfileSection(
            "intelligence",
            conversationContent,
            existingProfile,
          );
          break;
        case "periodic_update":
        case "extended_session":
        case "contact_request":
        case "bant_complete":
          updates.intelligenceProfile = await analyzeProfileSection(
            "intelligence",
            conversationContent,
            existingProfile,
          );
          break;
        default:
          // Lightweight behavior and requirements update
          const [behaviorAnalysis, requirementsAnalysis] = await Promise.all([
            analyzeProfileSection(
              "behavior",
              conversationContent,
              existingProfile,
            ),
            analyzeProfileSection(
              "requirements",
              conversationContent,
              existingProfile,
            ),
          ]);
          updates.behaviorProfile = behaviorAnalysis;
          updates.requirementsProfile = requirementsAnalysis;
      }
    }

    // Build updated profile
    const baseProfile = existingProfile || {
      adminId,
      sessionIds: [sessionId],
      firstContact: now.toISOString(),
      totalSessions: 1,
      name: null,
      email: null,
      companyProfile: {},
      behaviorProfile: {},
      requirementsProfile: {},
      engagementProfile: {
        questionsAsked: 0,
        pagesVisited: [],
        timeOnSite: 0,
        returnVisits: 0,
        conversionSignals: [],
        objections: [],
      },
      intelligenceProfile: {},
      profileMeta: {
        confidenceScore: 0,
        lastUpdated: now.toISOString(),
        updateTriggers: [],
        totalUpdates: 0,
        nextScheduledUpdate: "conversation_end",
      },
    };

    // Merge updates with existing profile
    const companyUpdates =
      updates.companyProfile && typeof updates.companyProfile === "object"
        ? (updates.companyProfile as Record<string, unknown>)
        : {};
    const behaviorUpdates =
      updates.behaviorProfile && typeof updates.behaviorProfile === "object"
        ? (updates.behaviorProfile as Record<string, unknown>)
        : {};
    const requirementsUpdates =
      updates.requirementsProfile &&
      typeof updates.requirementsProfile === "object"
        ? (updates.requirementsProfile as Record<string, unknown>)
        : {};
    const intelligenceUpdates =
      updates.intelligenceProfile &&
      typeof updates.intelligenceProfile === "object"
        ? (updates.intelligenceProfile as Record<string, unknown>)
        : {};

    const updatedProfile = {
      ...baseProfile,
      name: resolvedName || (baseProfile as any).name,
      email: resolvedEmail || (baseProfile as any).email,
      lastContact: now.toISOString(),
      sessionIds: [...new Set([...(baseProfile.sessionIds || []), sessionId])],
      companyProfile: {
        ...baseProfile.companyProfile,
        ...companyUpdates,
      },
      behaviorProfile: {
        ...baseProfile.behaviorProfile,
        ...behaviorUpdates,
      },
      requirementsProfile: {
        ...baseProfile.requirementsProfile,
        ...requirementsUpdates,
      },
      engagementProfile: {
        ...baseProfile.engagementProfile,
        questionsAsked:
          messageCount || baseProfile.engagementProfile.questionsAsked,
        pagesVisited: pageUrl
          ? [
              ...new Set([
                ...(baseProfile.engagementProfile.pagesVisited || []),
                pageUrl,
              ]),
            ]
          : baseProfile.engagementProfile.pagesVisited,
        timeOnSite: timeInSession || baseProfile.engagementProfile.timeOnSite,
        returnVisits: existingProfile
          ? baseProfile.engagementProfile.returnVisits + 1
          : 1,
      },
      intelligenceProfile: {
        ...baseProfile.intelligenceProfile,
        ...intelligenceUpdates,
      },
      profileMeta: {
        confidenceScore: calculateConfidenceScore({
          ...baseProfile,
          companyProfile: {
            ...baseProfile.companyProfile,
            ...companyUpdates,
          },
          behaviorProfile: {
            ...baseProfile.behaviorProfile,
            ...behaviorUpdates,
          },
          requirementsProfile: {
            ...baseProfile.requirementsProfile,
            ...requirementsUpdates,
          },
          engagementProfile: baseProfile.engagementProfile,
        }),
        lastUpdated: now.toISOString(),
        lastUpdateTrigger: updateTrigger,
        updateTriggers: [
          ...(baseProfile.profileMeta.updateTriggers || []),
          updateTrigger,
        ],
        totalUpdates: (baseProfile.profileMeta.totalUpdates || 0) + 1,
        nextScheduledUpdate: "conversation_end",
      },
    };

    const bant = computeBant(updatedProfile);
    (updatedProfile as any).bant = bant;

    // Save to database
    if (existingProfile) {
      await profiles.updateOne(
        { _id: existingProfile._id },
        { $set: updatedProfile },
      );
    } else {
      await profiles.insertOne(updatedProfile);
    }

    console.log(
      `[CustomerProfiling] Profile updated - Trigger: ${updateTrigger}, Confidence: ${updatedProfile.profileMeta.confidenceScore}`,
    );

    return NextResponse.json(
      {
        profile: updatedProfile,
        updated: true,
        trigger: updateTrigger,
        confidence: updatedProfile.profileMeta.confidenceScore,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error updating customer profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500, headers: corsHeaders },
    );
  }
}

// Delete customer profile
export async function DELETE(req: NextRequest) {
  const rl = await rateLimit(req, "auth");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: corsHeaders },
    );
  }
  let adminId: string | null = null;

  // Check authentication
  const token = req.cookies.get("auth_token")?.value;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        email: string;
        adminId: string;
      };
      adminId = payload.adminId;
    } catch {
      // Continue to check API key
    }
  }

  if (!adminId) {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      const apiAuth = await verifyApiKey(apiKey);
      if (apiAuth) {
        adminId = apiAuth.adminId;
      }
    }
  }

  if (!adminId) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: corsHeaders },
    );
  }

  try {
    const body = await req.json();
    assertBodyConstraints(body, { maxBytes: 64 * 1024, maxDepth: 4 });
    const DeleteSchema = z
      .object({
        profileId: z.string().min(1).max(64),
      })
      .strict();
    const parsed = DeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400, headers: corsHeaders },
      );
    }
    const { profileId } = parsed.data;

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const db = await getDb();
    const profiles = db.collection("customer_profiles");

    const result = await profiles.deleteOne({
      _id: new ObjectId(profileId),
      adminId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error deleting customer profile:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500, headers: corsHeaders },
    );
  }
}
