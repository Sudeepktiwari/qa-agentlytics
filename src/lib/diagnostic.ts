import OpenAI from "openai";
import { getDb } from "./mongo";
import { querySimilarChunks } from "./chroma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateDiagnosticAnswerText(
  label: string,
  workflow: string,
  context: string,
  businessName?: string,
): Promise<string> {
  try {
    const prompt = `
SYSTEM:
You are an expert consultant engaging with a potential client. They just selected an option, and you need to provide a diagnostic insight that demonstrates value.
Write your response as a professional, direct message to the user. Use "you" and "your".

RULES:
- Tone: Professional, consultative, value-driven.
- Follow the correct template based on the workflow:
  - validation_path → Validate their strong position. Suggest how they can leverage this stability to scale or optimize further using the platform. Focus on "what's next" for growth.
  - optimization_workflow → Acknowledge the process friction. Explain the specific business impact (e.g., lost revenue, efficiency gaps). Clearly state how the platform automates or resolves this.
  - diagnostic_education → Address the visibility gap. Explain why knowing this data is critical for decision-making. Explain how the platform provides this specific intelligence.
  - sales_alert → Address the high-stakes nature of the problem. Explain the cost of inaction. Briefly explain how the platform mitigates this risk immediately.
- If "businessName" is provided, use it instead of "our platform", "this system", or generic terms where appropriate.

CONTEXT:
${context}

INPUT:
label: ${label}
workflow: ${workflow}
businessName: ${businessName || "Not provided"}

OUTPUT:
Return a JSON object with:
- "diagnostic_answer": The diagnostic text (2-3 sentences).`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const data = JSON.parse(content);
    const answer =
      typeof data.diagnostic_answer === "string" ? data.diagnostic_answer : "";
    return answer;
  } catch {
    return "";
  }
}

async function generateDiagnosticOptionsList(
  label: string,
  workflow: string,
  context: string,
  diagnosticAnswer: string,
  businessName?: string,
): Promise<string[]> {
  if (!diagnosticAnswer) return [];
  try {
    const prompt = `
SYSTEM:
You are designing follow-up options for a diagnostic answer. Each option should represent a concrete solution, benefit, or capability derived from the answer.

RULES:
- Generate 3-4 short, value-driven options (max 5 words each).
- Options must map to specific outcomes, levers, or capabilities mentioned in the diagnostic answer or context.
- Do not use generic CTAs like "Book Call", "View Case Study", "Contact Sales".

CONTEXT:
${context}

INPUT:
label: ${label}
workflow: ${workflow}
diagnostic_answer: ${diagnosticAnswer}
businessName: ${businessName || "Not provided"}

OUTPUT:
Return a JSON object with:
- "diagnostic_options": array of 3-4 strings (options).`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const data = JSON.parse(content);
    const options = Array.isArray(data.diagnostic_options)
      ? data.diagnostic_options
      : [];
    return options.filter((o: any) => typeof o === "string" && o.trim().length);
  } catch {
    return [];
  }
}

async function generateDiagnosticOptionDetailsList(
  label: string,
  workflow: string,
  context: string,
  diagnosticAnswer: string,
  options: string[],
  businessName?: string,
): Promise<{ label: string; answer: string }[]> {
  if (!diagnosticAnswer || !options || options.length === 0) return [];
  try {
    const prompt = `
SYSTEM:
You are writing mechanism-driven "Recommended Actions" explanations 
for a proactive AI system used by businesses.

PRIMARY GOAL:
Rewrite each recommended action in an authority-style narrative format.

Each explanation MUST:

1) Start with a positioning contrast 
   (e.g., "The system does not wait...", "Traditional tools react, this system...")
2) Explain what behavioral signals are continuously monitored 
   (pricing dwell, comparison loops, scroll hesitation, exit intent, repeat FAQ visits, etc.)
3) Describe how thresholds or readiness modeling determine activation
4) Explain what type of contextual intervention is automatically triggered
5) End with a clear business outcome tied to conversion stability or lead capture

WRITING RULES:
Use short paragraphs (not bullets)
8–14 lines per option
Professional, authoritative tone
No hype words
Use the business name "${businessName || "the platform"}" naturally when explaining mechanisms.
Focus on automation and behavioral modeling
Avoid generic phrases like "boost growth" without explaining mechanism

CONTEXT:
${context}

INPUT:
label: ${label}
workflow: ${workflow}
diagnostic_answer: ${diagnosticAnswer}
diagnostic_options: ${JSON.stringify(options)}
businessName: ${businessName || "Not provided"}

OUTPUT:
Return a JSON object with:
"diagnostic_option_details": array of objects, one per option, each with:
  - "label": the exact option string
  - "answer": the full narrative explanation
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const data = JSON.parse(content);
    const raw = Array.isArray(data.diagnostic_option_details)
      ? data.diagnostic_option_details
      : [];
    const details = raw
      .map((item: any) => {
        if (!item || typeof item !== "object") return null;
        const optLabel = typeof item.label === "string" ? item.label : "";
        const ans = typeof item.answer === "string" ? item.answer : "";
        if (!optLabel || !ans) return null;
        return { label: optLabel, answer: ans };
      })
      .filter((v: any) => v !== null);
    return details;
  } catch {
    return [];
  }
}

export async function autoGenerateDiagnosticAnswers(
  adminId: string,
  filterUrl?: string,
) {
  console.log(
    `[Diagnostic] Starting post-crawl generation for ${adminId}${
      filterUrl ? ` (URL: ${filterUrl})` : ""
    }...`,
  );
  try {
    const db = await getDb();
    const summariesCollection = db.collection("structured_summaries");

    // 1. Fetch summaries (filter by URL if provided)
    const query: any = { adminId };
    if (filterUrl) {
      query.url = filterUrl;
    }
    const summaries = await summariesCollection.find(query).toArray();
    if (!summaries.length) {
      console.log(
        `[Diagnostic] No structured summaries found for ${adminId}${
          filterUrl ? ` matching ${filterUrl}` : ""
        }`,
      );
      return;
    }

    // 2. Collect all options
    let businessName: string | undefined;
    const allOptionsMap = new Map<
      string,
      { label: string; workflow: string }
    >();
    summaries.forEach((s) => {
      if (!businessName && s.structuredSummary?.businessName) {
        businessName = s.structuredSummary.businessName;
      }
      s.structuredSummary?.sections?.forEach((sec: any) => {
        [...(sec.leadQuestions || []), ...(sec.salesQuestions || [])].forEach(
          (q: any) => {
            q.options?.forEach((o: any) => {
              if (o.label && o.workflow) {
                const key = `${o.label}::${o.workflow}`;
                // Only add to processing list if not already processed in this run
                if (!allOptionsMap.has(key)) {
                  allOptionsMap.set(key, {
                    label: o.label,
                    workflow: o.workflow,
                  });
                }
              }
            });
          },
        );
      });
    });

    const uniqueOptions = Array.from(allOptionsMap.values());
    console.log(
      `[Diagnostic] Found ${uniqueOptions.length} unique options to process for ${adminId}.`,
    );

    // 3. Process with concurrency (Batch of 5)
    const results = new Map<
      string,
      {
        answer: string;
        options: string[];
        optionDetails?: { label: string; answer: string }[];
      }
    >();

    const processOption = async (opt: { label: string; workflow: string }) => {
      try {
        // A. Get Embedding for the option label to find relevant content
        const embResp = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: opt.label,
          dimensions: 1024,
        });
        const vector = embResp.data[0].embedding;

        // B. Get Context from vector DB
        const chunks = await querySimilarChunks(vector, 3, adminId);
        const contextText = chunks.map((c) => c.text).join("\n---\n");

        // C. Generate Answer using strict template
        const result = await generateSingleDiagnosticAnswer(
          opt.label,
          opt.workflow,
          contextText,
          businessName,
        );

        if (!result.options || result.options.length === 0) {
          console.warn(
            `[Diagnostic] Warning: No options generated for ${opt.label}. Leaving diagnostic_options empty.`,
          );
        }

        results.set(`${opt.label}::${opt.workflow}`, result);
      } catch (e) {
        console.error(`Error processing option ${opt.label}:`, e);
      }
    };

    // Run in batches
    const BATCH_SIZE = 5;
    for (let i = 0; i < uniqueOptions.length; i += BATCH_SIZE) {
      const batch = uniqueOptions.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(processOption));
      console.log(
        `[Diagnostic] Processed ${Math.min(i + BATCH_SIZE, uniqueOptions.length)}/${uniqueOptions.length}`,
      );
    }

    // 4. Update Database
    let updatedCount = 0;
    for (const summary of summaries) {
      let modified = false;
      const sections = summary.structuredSummary?.sections;
      if (!sections) continue;

      sections.forEach((sec: any) => {
        [...(sec.leadQuestions || []), ...(sec.salesQuestions || [])].forEach(
          (q: any) => {
            q.options?.forEach((o: any) => {
              const key = `${o.label}::${o.workflow}`;
              if (results.has(key)) {
                const res = results.get(key);
                if (res) {
                  // Always update if we have a result
                  o.diagnostic_answer = res.answer;
                  o.diagnostic_options = res.options;
                  if (res.optionDetails && res.optionDetails.length > 0) {
                    o.diagnostic_option_details = res.optionDetails;
                  }
                  modified = true;
                }
              }
            });
          },
        );
      });

      if (modified) {
        await summariesCollection.updateOne(
          { _id: summary._id },
          {
            $set: {
              "structuredSummary.sections": sections,
              diagnosticGeneratedAt: new Date(),
            },
          },
        );
        updatedCount++;
      }
    }
    console.log(
      `[Diagnostic] Completed updates for ${updatedCount} summaries.`,
    );
  } catch (err) {
    console.error("[Diagnostic] Critical error in post-crawl generation:", err);
  }
}

export async function generateSingleDiagnosticAnswer(
  label: string,
  workflow: string,
  context: string,
  businessName?: string,
): Promise<{
  answer: string;
  options: string[];
  optionDetails?: { label: string; answer: string }[];
}> {
  try {
    const diagnosticAnswer = await generateDiagnosticAnswerText(
      label,
      workflow,
      context,
      businessName,
    );
    if (!diagnosticAnswer) {
      return { answer: "", options: [] };
    }

    const options = await generateDiagnosticOptionsList(
      label,
      workflow,
      context,
      diagnosticAnswer,
      businessName,
    );

    const optionDetails = await generateDiagnosticOptionDetailsList(
      label,
      workflow,
      context,
      diagnosticAnswer,
      options,
      businessName,
    );

    return {
      answer: diagnosticAnswer,
      options,
      optionDetails,
    };
  } catch (e) {
    console.error("Error generating single diagnostic answer:", e);
    return { answer: "", options: [] };
  }
}
