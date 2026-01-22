import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface BantQuestion {
  id: string;
  question: string;
  options: string[];
  active: boolean;
}

export interface BantConfig {
  adminId: string;
  budget: BantQuestion[];
  authority: BantQuestion[];
  need: BantQuestion[];
  timeline: BantQuestion[];
  updatedAt: Date;
}

export async function generateBantFromContent(
  adminId: string,
  content: string
): Promise<BantConfig> {
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
        content: `Analyze this website data and generate BANT questions:\n\n${content}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const responseContent = completion.choices[0].message.content;
  if (!responseContent) {
    throw new Error("Empty response from OpenAI");
  }

  const generatedData = JSON.parse(responseContent);

  // Helper to format questions with IDs and active status
  const formatQuestions = (questions: any[], prefix: string) => {
    return questions.map((q: any) => ({
      id: `${prefix}_${Math.random().toString(36).substring(2, 10)}`,
      question: q.question,
      options: q.options,
      active: true,
    }));
  };

  return {
    adminId,
    budget: formatQuestions(generatedData.budget || [], "gen_budget"),
    authority: formatQuestions(generatedData.authority || [], "gen_auth"),
    need: formatQuestions(generatedData.need || [], "gen_need"),
    timeline: formatQuestions(generatedData.timeline || [], "gen_time"),
    updatedAt: new Date(),
  };
}
