import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const authResult = verifyAdminAccessFromCookie(request);
    if (!authResult.isValid || !authResult.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adminId } = authResult;
    const db = await getDb();

    // Fetch crawled pages to understand the business
    const crawledPagesCollection = db.collection("crawled_pages");
    const pages = await crawledPagesCollection
      .find({ adminId })
      .sort({ created_at: -1 })
      .limit(10) // Use top 10 most recent pages to get a good idea of the business
      .toArray();

    if (!pages || pages.length === 0) {
      return NextResponse.json(
        {
          error:
            "No crawled website data found. Please crawl your website first.",
        },
        { status: 400 },
      );
    }

    // Prepare context from crawled pages
    const context = pages
      .map(
        (p) =>
          `URL: ${p.url}\nTitle: ${p.title}\nContent Summary: ${p.text.substring(0, 500)}...`,
      )
      .join("\n\n");

    const systemPrompt = `
      You are an expert sales qualification specialist. 
      Your task is to generate BANT (Budget, Authority, Need, Timeline) qualification questions 
      customized for a specific business based on their website content.
      
      The questions should be professional, relevant to the business domain, and designed to qualify leads effectively.
      
      Output must be a valid JSON object with the following structure:
      {
        "budget": [ { "question": "...", "options": ["..."] } ],
        "authority": [ { "question": "...", "options": ["..."] } ],
        "need": [ { "question": "...", "options": ["..."] } ],
        "timeline": [ { "question": "...", "options": ["..."] } ]
      }
      
      Each category should have 1-2 high-quality questions.
      Options should be specific ranges or clear choices (3-5 options per question).
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze this website data and generate BANT questions:\n\n${context}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const generatedData = JSON.parse(content);

    // Helper to format questions with IDs and active status
    const formatQuestions = (questions: any[], prefix: string) => {
      return questions.map((q: any) => ({
        id: `${prefix}_${Math.random().toString(36).substring(2, 10)}`,
        question: q.question,
        options: q.options,
        active: true,
      }));
    };

    const newConfig = {
      adminId,
      budget: formatQuestions(generatedData.budget || [], "gen_budget"),
      authority: formatQuestions(generatedData.authority || [], "gen_auth"),
      need: formatQuestions(generatedData.need || [], "gen_need"),
      timeline: formatQuestions(generatedData.timeline || [], "gen_time"),
      updatedAt: new Date(),
    };

    // Note: We are NOT saving to DB here, just returning the generated config
    // The user must explicitly save it in the UI.

    return NextResponse.json({ config: newConfig });
  } catch (error) {
    console.error("Error generating BANT questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 },
    );
  }
}
