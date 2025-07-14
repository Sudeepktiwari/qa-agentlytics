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
  let chunks = [];
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
                  content: "Summarize this content for a sales assistant.",
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
        const summaryPrompt = `Summarize the following page content for a sales prospect in 2-3 sentences, focusing on pricing and value. Then ask a relevant, engaging question to start the conversation.\n\nContent:\n${summaryContext}`;
        const summaryResp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful sales assistant." },
            { role: "user", content: summaryPrompt },
          ],
        });
        pageSummary = summaryResp.choices[0].message.content || "";
        const proactiveMsg = `Welcome! You're viewing: ${pageUrl}\n\n${pageSummary}`;
        return NextResponse.json({ answer: proactiveMsg });
      } else if (followup) {
        // For follow-up, only use previous chat messages to reduce token usage
        // Get previous chat messages for this session
        const previousChats = await chats
          .find({ sessionId })
          .sort({ createdAt: 1 })
          .toArray();
        const previousQnA = previousChats
          .filter((msg: any) => msg.role === "assistant" || msg.role === "user")
          .map(
            (msg: any) =>
              `${msg.role === "user" ? "User" : "Bot"}: ${msg.content}`
          )
          .join("\n");
        const prevQuestions = previousChats
          .filter((msg: any) => msg.role === "assistant")
          .map((msg: any) => msg.content);
        const followupPrompt = `Here is the previous conversation:\n${previousQnA}\n\nBased on this, ask a new, relevant follow-up question to further engage the user. Do not repeat any of these previous questions: ${prevQuestions.join(
          " | "
        )}`;
        const followupResp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful sales assistant." },
            { role: "user", content: followupPrompt },
          ],
        });
        const followupMsg = followupResp.choices[0].message.content || "";
        return NextResponse.json({ answer: followupMsg });
      }
    }
    // Fallback if no context
    if (proactive) {
      const proactiveMsg = `Welcome! You're viewing: ${pageUrl}\n\n${pageSummary}`;
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

  // If no context, refer to sales team and ask for contact
  if (!context.trim() && !pageContext.trim()) {
    return NextResponse.json({
      answer:
        "I'm not sure about that. I'll refer your question to our sales team. Could you please share your email or phone number so we can follow up?",
    });
  }

  // Chat completion with sales-pitch system prompt
  const systemPrompt = isGreeting
    ? `You are a helpful sales bot for a company. Always respond to greetings with a friendly, enthusiastic sales pitch about the company, its products, and pricing, using ONLY the context below. If you don't have enough info, encourage the user to upload more documents or sitemaps.\n\nPage Context:\n${pageContext}\n\nGeneral Context:\n${context}`
    : `You are a helpful sales bot for a company. Always answer in a persuasive, sales-oriented style, using ONLY the context below. If you don't have enough info, encourage the user to upload more documents or sitemaps.\n\nPage Context:\n${pageContext}\n\nGeneral Context:\n${context}`;

  const chatResp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: question,
      },
    ],
  });
  const answer = chatResp.choices[0].message.content;

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

  return NextResponse.json({ answer });
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
