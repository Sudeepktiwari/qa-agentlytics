import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { querySimilarChunks } from "@/lib/chroma";
import { getDb } from "@/lib/mongo";
import { getChunksByPageUrl } from "@/lib/chroma";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { chunkText } from "@/lib/chunkText";
import { addChunks } from "@/lib/chroma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  if (
    lowerQ.includes("couple") ||
    lowerQ.includes("romance") ||
    lowerUrl.includes("couple")
  ) {
    return "couple massage";
  }
  if (
    lowerQ.includes("pricing") ||
    lowerQ.includes("price") ||
    lowerUrl.includes("pricing")
  ) {
    return "pricing";
  }
  if (
    lowerQ.includes("demo") ||
    lowerQ.includes("feature demo") ||
    lowerUrl.includes("demo")
  ) {
    return "feature demo";
  }
  if (
    lowerQ.includes("discovery call") ||
    lowerUrl.includes("discovery-call")
  ) {
    return "discovery call";
  }
  if (lowerQ.includes("quote") || lowerUrl.includes("quote")) {
    return "quote";
  }
  // Add more as needed
  return "general";
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
    previousQuestions = [],
  } = body;
  if ((!question && !proactive && !followup) || !sessionId)
    return NextResponse.json(
      {
        error:
          "No question, proactive, or followup flag, or no sessionId provided",
      },
      { status: 400 }
    );

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

  // If email detected, update all previous messages in this session
  if (detectedEmail) {
    await chats.updateMany({ sessionId }, { $set: { email: detectedEmail } });
    // Log for verification
    console.log(
      `[LeadGen] Stored email for session ${sessionId}: ${detectedEmail}`
    );
  }

  // Get adminId if available (from request or previous chat with admin, or null for public)
  let adminId: string | null = null;
  if (adminIdFromBody) {
    adminId = adminIdFromBody;
  } else {
    const lastMsg = await chats.findOne({
      sessionId,
      adminId: { $exists: true },
    });
    if (lastMsg && lastMsg.adminId) adminId = lastMsg.adminId;
  }
  // Optionally, you could extract adminId from a cookie/JWT if you want admin-specific context

  // Proactive page-aware message
  if ((proactive || followup) && pageUrl) {
    let pageChunks: string[] = [];
    if (adminId) {
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
      if (sitemapEntry && !sitemapEntry.crawled) {
        // Crawl the page on demand
        try {
          const res = await fetch(pageUrl);
          if (res.ok) {
            const html = await res.text();
            const $ = cheerio.load(html);
            $("script, style, noscript").remove();
            const text = $("body").text().replace(/\s+/g, " ").trim();
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
            }
          }
        } catch {
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
                  content: `You are a proactive assistant for Appointy. Your goal is to help users plan or organize their next steps. Create engaging, emoji-enhanced messages with proper formatting. Use emojis strategically and break content into digestible sections with proper spacing.`,
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
        const summaryPrompt = `The user is viewing: ${pageUrl}. Their likely intent is: ${detectedIntent}.

Create a proactive greeting message following this exact format and style:

👋 Hello there! Looks like you're exploring Appointy's [specific feature/solution] — designed to simplify how you [specific benefit based on detected intent].

With features like [list 2-3 key features], Appointy helps you focus on [main outcome] — without the admin burden.

> I'd love to learn more about what you're planning!
What type of [relevant context] are you organizing, or what challenges are you hoping to solve with [relevant area]?

Requirements:
- Start with 👋 Hello there!
- Use em dashes (—) for better flow
- Include specific Appointy features relevant to the page content
- Use a quote block (>) for the transition
- End with an open-ended question about their needs
- Keep it conversational and engaging

Content to reference:\n${summaryContext}`;
        const summaryResp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a proactive assistant for Appointy. Create engaging, professional messages with emojis and proper formatting. Follow the exact format provided in the user prompt. Focus on being warm, informative, and encouraging engagement.`,
            },
            { role: "user", content: summaryPrompt },
          ],
        });
        pageSummary = summaryResp.choices[0].message.content || "";
        const proactiveMsg = pageSummary;
        return NextResponse.json({ answer: proactiveMsg });
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
        // Detect intent from last user message or pageUrl
        const detectedIntent = detectIntent({ question, pageUrl });
        // Use followupCount from request body to determine follow-up stage
        const followupCount =
          typeof body.followupCount === "number" ? body.followupCount : 0;
        let followupSystemPrompt = "";
        let followupUserPrompt = "";
        if (followupCount === 0) {
          // First follow-up: context-aware nudge with buttons, tip is optional
          followupSystemPrompt = `
You are a helpful sales assistant for Appointy. The user has not provided an email yet.

You will receive page and general context, the detected intent, and the previous conversation. If you think a tip would be helpful for the user, you may include it anywhere in your response, starting with '💡 Assistant Tip:'. Only include a tip if it is genuinely useful or relevant to the user's context or question. Otherwise, respond normally. Always generate your response in the following JSON format:
{
  "mainText": "<A single, creative, engaging, and highly specific nudge for the user, based on the page context, detected intent, and their last action. Reference details from the page context, detected intent, or last action if possible. Do NOT ask a generic or repetitive question. Do NOT repeat or rephrase any of the last few questions. Do NOT include a summary or multiple questions. Vary the nudge text for each follow-up.>",
  "buttons": ["<2-4 actionable, context-aware options for the user to choose from, based on the nudge, detected intent, and page context. Make them relevant to the user's needs or the page content. Do not use generic options.>"],
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
- Your mainText must be a single, creative, engaging, and highly specific nudge that references the page context, detected intent, or last action if possible. Do NOT repeat or rephrase any of these previous questions: ${lastFewQuestions
            .map((q) => `"${getText(q)}"`)
            .join(", ")}. Do NOT include a summary or multiple questions.
- For the 'buttons' array, generate 2-4 actionable, context-aware options for the user to choose from, based on the nudge, detected intent, and page context. Make them relevant to the user's needs or the page content. Do not use generic options.
- Vary the nudge text for each follow-up.
- If you think a tip would be helpful, you may include it anywhere in your response, starting with '💡 Assistant Tip:'. Only include a tip if it is genuinely useful or relevant to the user's context or question.`;
          followupUserPrompt = `Ask only one, creative, engaging, and highly specific nudge to further engage the user. Use the page context, detected intent, and last action below to make your nudge relevant and interesting. Do NOT ask a generic or repetitive question. Do NOT repeat or rephrase any of these previous questions: ${lastFewQuestions
            .map((q) => `"${getText(q)}"`)
            .join(
              ", "
            )}. Do NOT include a summary or multiple questions. For the 'buttons' array, generate 2-4 actionable, context-aware options for the user to choose from, based on the nudge, detected intent, and page context. Make them relevant to the user's needs or the page content. Do not use generic options. Prefix the nudge with '💡 Assistant Tip:'. Vary the nudge text for each follow-up. Only output the JSON format as instructed.`;
        } else if (followupCount === 1) {
          // Second follow-up: micro-conversion nudge, tip is optional
          followupSystemPrompt = `
You are a helpful sales assistant for Appointy. The user has not provided an email yet.

You will receive page and general context, the detected intent, and the previous conversation. If you think a tip would be helpful for the user, you may include it anywhere in your response, starting with '💡 Assistant Tip:'. Only include a tip if it is genuinely useful or relevant to the user's context or question. Otherwise, respond normally. Always generate your response in the following JSON format:
{
  "mainText": "<A micro-conversion nudge—a small, low-friction ask (e.g., 'Want to save this setup guide to your email?' or 'Should I show how others customize their services?'), based on the user's last action, detected intent, page context, or detected intent. Do NOT ask for a discovery call or email directly. Vary the nudge text for each follow-up.>",
  "buttons": ["<2-4 actionable, context-aware options for the user to choose from, based on the nudge, detected intent, and page context. Make them relevant to the user's needs or the page content. Do not use generic options.>"],
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
- Your mainText must be a micro-conversion nudge, referencing the user's last action, detected intent, page context, or detected intent. Do NOT ask for a discovery call or email directly. Vary the nudge text for each follow-up.
- If you think a tip would be helpful, you may include it anywhere in your response, starting with '💡 Assistant Tip:'. Only include a tip if it is genuinely useful or relevant to the user's context or question.`;
          followupUserPrompt = `Ask a micro-conversion nudge—a small, low-friction ask (e.g., 'Want to save this setup guide to your email?' or 'Should I show how others customize their services?'), based on the user's last action, detected intent, page context, or detected intent. Do NOT ask for a discovery call or email directly. Vary the nudge text for each follow-up. Prefix the nudge with '💡 Assistant Tip:'. Only output the JSON format as instructed.`;
        } else if (followupCount === 2) {
          // Third follow-up: ask for email, tip is optional
          followupSystemPrompt = `
You are a helpful sales assistant for Appointy. The user has not provided an email yet.

You will receive page and general context, the detected intent, and the previous conversation. If you think a tip would be helpful for the user, you may include it anywhere in your response, starting with '💡 Assistant Tip:'. Only include a tip if it is genuinely useful or relevant to the user's context or question. Otherwise, respond normally. Always generate your response in the following JSON format:
{
  "mainText": "<A friendly, direct request for the user's email, explaining why you need it to send them personalized setup instructions, a demo, or other page-relevant action. Reference the page context or detected intent if possible. Do NOT ask another qualifying question.>",
  "buttons": [],
  "emailPrompt": "Please enter your email so I can send you the exact steps, demo, or connect you to support for this page!"
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
- Your mainText must be a friendly, direct request for the user's email, referencing the page context or detected intent if possible. Do NOT ask another qualifying question or repeat previous questions.
- If you think a tip would be helpful, you may include it anywhere in your response, starting with '💡 Assistant Tip:'. Only include a tip if it is genuinely useful or relevant to the user's context or question.`;
          followupUserPrompt = `Ask the user for their email in a friendly, direct way, explaining why you need it to send them setup instructions, a demo, or connect them to support for this page. Reference the page context or detected intent if possible. Do NOT ask another qualifying question. Do NOT include any buttons. Only output the JSON format as instructed.`;
        } else if (followupCount === 3) {
          // Final nudge for abandoners: offer to email a summary, tip is optional
          followupSystemPrompt = `
You are a helpful sales assistant for Appointy. The user has not provided an email yet and has not responded to several nudges.

You will receive page and general context, the detected intent, and the previous conversation. If you think a tip would be helpful for the user, you may include it anywhere in your response, starting with '💡 Assistant Tip:'. Only include a tip if it is genuinely useful or relevant to the user's context or question. Otherwise, respond normally. Always generate your response in the following JSON format:
{
  "mainText": "<Looks like you stepped away. I’ve saved all your options—want a summary emailed to you? Summarize the user's last few actions or options in a friendly way.>",
  "buttons": ["Yes, email me a summary", "No, thanks"],
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
- Your mainText must summarize the user's last few actions or options and offer to email a summary.
- If you think a tip would be helpful, you may include it anywhere in your response, starting with '💡 Assistant Tip:'. Only include a tip if it is genuinely useful or relevant to the user's context or question.`;
          followupUserPrompt = `Offer to email the user a summary of their options, summarizing their last few actions or options in a friendly way. Prefix the nudge with '💡 Assistant Tip:'. Only output the JSON format as instructed.`;
        } else {
          // No more follow-ups after 4
          return NextResponse.json({});
        }
        // Helper to check if a question is too similar to previous ones
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
          if (!newText) return true;
          const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
          return prevQs.some((q: MainTextLike) => {
            const prevText = getText(q);
            return (
              norm(newText).includes(norm(prevText)) ||
              norm(prevText).includes(norm(newText))
            );
          });
        }
        let followupMsg = "";
        let parsed = null;
        for (let attempt = 0; attempt < 2; attempt++) {
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
          return NextResponse.json({});
        }
        return NextResponse.json(parsed);
      }
    }
    // Fallback if no context
    if (proactive) {
      const proactiveMsg = `👋 Hello there! Looks like you're exploring Appointy's scheduling and appointment management platform — designed to simplify how you manage bookings, clients, and business operations.

With features like automated scheduling, client management, payment processing, and calendar integrations, Appointy helps you focus on growing your business — without the admin burden.

> I'd love to learn more about what you're planning!
What type of business are you looking to streamline, or what scheduling challenges are you hoping to solve?`;
      return NextResponse.json({ answer: proactiveMsg });
    } else if (followup) {
      return NextResponse.json({
        answer:
          "Is there anything specific you'd like to know about our offerings?",
      });
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

  // Detect greetings
  const greetings = [
    "hi",
    "hello",
    "hey",
    "how are you",
    "good morning",
    "good afternoon",
    "good evening",
  ];
  const isGreeting =
    question && greetings.some((g) => question.toLowerCase().includes(g));

  // Detect if user is identified (has provided email)
  let userEmail: string | null = null;
  const lastEmailMsg = await chats.findOne(
    { sessionId, email: { $exists: true } },
    { sort: { createdAt: -1 } }
  );
  if (lastEmailMsg && lastEmailMsg.email) userEmail = lastEmailMsg.email;

  // Detect if the user message matches any previous assistant message's buttons
  let isButtonAction = false;
  let lastButtonLabel = "";
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
      isButtonAction = lastAssistantWithButtons.content.buttons.some(
        (b: string) => b.toLowerCase() === question.trim().toLowerCase()
      );
      if (isButtonAction) lastButtonLabel = question.trim();
    }
  }

  // If no context, refer to sales team and ask for contact
  if (!context.trim() && !pageContext.trim()) {
    return NextResponse.json({
      answer:
        "I'm not sure about that. I'll refer your question to our sales team. Could you please share your email or phone number so we can follow up?",
    });
  }

  // Chat completion with sales-pitch system prompt
  let systemPrompt = "";
  let userPrompt = question;
  if (userEmail) {
    systemPrompt = isGreeting
      ? `You are a helpful sales bot for a company. Always respond to greetings with a friendly, enthusiastic sales pitch about the company, its products, and pricing, using ONLY the context below. If you don't have enough info, encourage the user to upload more documents or sitemaps.\n\nPage Context:\n${pageContext}\n\nGeneral Context:\n${context}\n\nIf you think a tip would be helpful for the user, you may include it anywhere in your response, starting with '💡 Assistant Tip:'. Only include a tip if it is genuinely useful or relevant to the user's context or question. Otherwise, respond normally.`
      : `You are a helpful sales bot for a company. Always answer in a persuasive, sales-oriented style, using ONLY the context below. If you don't have enough info, encourage the user to upload more documents or sitemaps.\n\nPage Context:\n${pageContext}\n\nGeneral Context:\n${context}\n\nIf you think a tip would be helpful for the user, you may include it anywhere in your response, starting with '💡 Assistant Tip:'. Only include a tip if it is genuinely useful or relevant to the user's context or question. Otherwise, respond normally.`;
  } else {
    systemPrompt = `You are a helpful sales assistant for Appointy. The user has not provided an email yet.\n\nYou will receive page and general context. If you think a tip would be helpful for the user, you may include it anywhere in your response, starting with '💡 Assistant Tip:'. Only include a tip if it is genuinely useful or relevant to the user's context or question. Otherwise, respond normally. Always generate your response in the following JSON format:\n\n{\n  "mainText": "<A dynamic, page-aware summary or answer, using the context below.>",\n  "buttons": ["Send Setup Guide", "Share My Website Type", "Talk to Support"],\n  "emailPrompt": "Still here? I can send exact steps based on your platform. Want me to email it to you?"\n}\n\nContext:\nPage Context:\n${pageContext}\n\nGeneral Context:\n${context}`;
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

  // Save user and assistant message, including email if detected or already present
  let emailToStore = detectedEmail;
  if (!emailToStore) {
    // Check if session already has an email
    const lastMsg = await chats.findOne({
      sessionId,
      email: { $exists: true },
    });
    if (lastMsg && lastMsg.email) emailToStore = lastMsg.email;
  }
  await chats.insertMany([
    {
      sessionId,
      role: "user",
      content: question,
      createdAt: now,
      ...(emailToStore ? { email: emailToStore } : {}),
    },
    {
      sessionId,
      role: "assistant",
      content: answer,
      createdAt: new Date(now.getTime() + 1),
      ...(emailToStore ? { email: emailToStore } : {}),
    },
  ]);

  return NextResponse.json(parsed);
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ history: [] });
  const db = await getDb();
  const chats = db.collection("chats");
  const history = await chats
    .find({ sessionId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
  return NextResponse.json({ history: history.reverse() });
}
