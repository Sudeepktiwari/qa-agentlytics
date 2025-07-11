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
              const embeddings = embedResp.data.map((d: any) => d.embedding);
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
        const summaryPrompt = `Summarize the following page content for a sales prospect in 2-3 sentences, focusing on pricing and value. Then ask a relevant, engaging question to start the conversation.\n\nContent:\n${pageChunks
          .slice(0, 3)
          .join("\n---\n")}`;
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
        // Generate a follow-up question based on the same context, avoiding repeats
        const prevQ =
          previousQuestions.length > 0
            ? `\nDo not repeat any of these questions: ${previousQuestions.join(
                " | "
              )}`
            : "";
        const followupPrompt = `Based on the following page content, ask a new, relevant follow-up question to further engage a sales prospect.${prevQ}\n\nContent:\n${pageChunks
          .slice(0, 3)
          .join("\n---\n")}`;
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

  // Fallback sales pitch if no context
  const fallbackPitch =
    "Hello! I'm your dedicated sales assistant. To provide the best information about our company, products, and pricing, please upload your company documents or add your website sitemap in the admin panel. I'm here to help you grow your business!";

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
