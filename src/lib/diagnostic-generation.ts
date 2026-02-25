import OpenAI from "openai";
import { querySimilarChunks } from "./chroma";
import { generateSingleDiagnosticAnswer } from "./diagnostic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function snakeTag(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

export async function generateOptionTags(optionTexts: string[]) {
  if (!optionTexts || optionTexts.length === 0) return {};
  const uniqueOptions = Array.from(
    new Set(optionTexts.filter((t) => t && t.trim().length > 0)),
  );
  if (uniqueOptions.length === 0) return {};

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content: `You are generating normalized tags for selectable options.
RULES:
- Each option must output 2 tags: a problem/readiness tag + a risk/readiness modifier.
- Use ONLY the allowed tag taxonomy below.
- Tags must be snake_case, stable, and normalized.
- If an option expresses no problem, it must express awareness/readiness.
- If neither is present, do not include it in the output.

TAXONOMY:
Primary (Problem/Readiness): manual_scheduling, scheduling_gap, onboarding_delay, onboarding_dropoff, pipeline_leakage, inconsistent_process, handoff_friction, visibility_gap, no_show_risk, late_engagement, stakeholder_coordination, capacity_constraint, validated_flow, optimization_ready, awareness_missing, unknown_state, low_friction
Secondary (Risk/Modifier): low_risk, conversion_risk, high_risk, critical_risk, validated_flow, optimization_ready, awareness_missing

INPUT: List of option texts.
OUTPUT: JSON object with "results" array containing objects with "label" and "tags".
Example:
{
  "results": [
    { "label": "Option Text", "tags": ["primary_tag", "modifier_tag"] }
  ]
}`,
          },
          {
            role: "user",
            content: JSON.stringify(uniqueOptions),
          },
        ],
      });

      const content = response.choices[0]?.message?.content || "{}";
      const data = JSON.parse(content);
      const map: Record<string, { label: string; tags: string[] }> = {};

      if (Array.isArray(data.results)) {
        data.results.forEach((item: any) => {
          if (
            item &&
            item.label &&
            Array.isArray(item.tags) &&
            item.tags.length === 2
          ) {
            map[item.label] = { label: item.label, tags: item.tags };
          }
        });
      }
      return map;
    } catch (error) {
      // console.error removed
      retries--;
      if (retries === 0) return {};
      // Exponential backoff: 1s, 2s, 4s...
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, 3 - retries)),
      );
    }
  }
  return {};
}

export async function generateDiagnosticAnswers(
  items: { label: string; workflow: string }[],
  contextText: string = "",
  adminId?: string,
  businessName?: string,
) {
  if (!items || items.length === 0) return {};

  const map: Record<
    string,
    {
      answer: string;
      options: string[];
      optionDetails?: { label: string; answer: string }[];
    }
  > = {};
  const CONCURRENCY = 5;

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (item) => {
        try {
          let fullContext = contextText;

          if (adminId) {
            const embResp = await openai.embeddings.create({
              model: "text-embedding-3-small",
              input: item.label,
              dimensions: 1024,
            });
            const vector = embResp.data[0].embedding;

            const chunks = await querySimilarChunks(vector, 3, adminId);
            const retrievedContext = chunks.map((c) => c.text).join("\n---\n");

            fullContext = contextText
              ? `SECTION CONTEXT:\n${contextText}\n\nKNOWLEDGE BASE:\n${retrievedContext}`
              : retrievedContext;
          }

          const result = await generateSingleDiagnosticAnswer(
            item.label,
            item.workflow,
            fullContext,
            businessName,
          );

          if (result && result.answer) {
            map[`${item.label}::${item.workflow}`] = result;
          }
        } catch {}
      }),
    );
  }

  return map;
}

export async function processQuestionsWithTags(
  questions: any[],
  contextText: string = "",
  adminId?: string,
  businessName?: string,
) {
  if (!questions || !questions.length) return questions;

  const allLabels: string[] = [];
  questions.forEach((q) => {
    if (q && Array.isArray(q.options)) {
      q.options.forEach((o: any) => {
        const label = typeof o === "string" ? o : o.label;
        if (label) allLabels.push(label);
      });
    }
  });
  if (allLabels.length === 0) return questions;

  const tagMap = await generateOptionTags(allLabels);

  const processedQuestions = await Promise.all(
    questions.map(async (q) => {
      let opts = Array.isArray(q.options) ? q.options : [];
      const originalOpts = [...opts];
      const invalid: string[] = [];

      let newOpts = opts
        .map((o: any) => {
          const label = typeof o === "string" ? o : o.label;
          const tagged = tagMap[label];
          if (!tagged) {
            invalid.push(label);
            return null;
          }
          const base = typeof o === "object" ? o : { label };
          return { ...base, label, tags: tagged.tags };
        })
        .filter((o: any) => o !== null);

      if (invalid.length) {
        try {
          const existingLabels = newOpts.map((o: any) => o.label);
          const resp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            temperature: 0.1,
            messages: [
              {
                role: "system",
                content:
                  "Rewrite options into valid stateful options using ONLY the allowed taxonomy. Each output must include a label and exactly two tags: primary (problem/readiness) and secondary (risk/modifier). Remove any that cannot be made valid. Do NOT generate options that are the same or semantically similar to the 'existingOptions' provided. Primary: manual_scheduling, scheduling_gap, onboarding_delay, onboarding_dropoff, pipeline_leakage, inconsistent_process, handoff_friction, visibility_gap, no_show_risk, late_engagement, stakeholder_coordination, capacity_constraint, validated_flow, optimization_ready, awareness_missing, unknown_state, low_friction. Secondary: low_risk, conversion_risk, high_risk, critical_risk, validated_flow, optimization_ready, awareness_missing.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  question: String(q?.question || ""),
                  invalidOptions: invalid,
                  existingOptions: existingLabels,
                }),
              },
            ],
          });
          const content = resp.choices[0]?.message?.content || "{}";
          const data = JSON.parse(content);
          const regenMap: Record<string, { label: string; tags: string[] }> =
            {};
          if (Array.isArray(data.results)) {
            data.results.forEach((item: any) => {
              if (
                item &&
                item.source &&
                item.label &&
                Array.isArray(item.tags) &&
                item.tags.length === 2
              ) {
                regenMap[item.source] = {
                  label: String(item.label),
                  tags: item.tags,
                };
              }
            });
          }
          invalid.forEach((source) => {
            const r = regenMap[source];
            if (r) newOpts.push({ label: r.label, tags: r.tags });
          });
        } catch {}
      }

      // Assign workflows using deterministic rules (Strictly mapped to 4 diagnostic templates)
      newOpts = newOpts.map((o: any) => {
        const tags = Array.isArray(o.tags) ? o.tags : [];
        let workflow = "diagnostic_education"; // Default to education/uncertainty

        // Check for specific tags to determine workflow
        // Priority 1: Critical Risks -> sales_alert
        if (
          tags.includes("critical_risk") ||
          tags.includes("pipeline_leakage") ||
          tags.includes("onboarding_dropoff") ||
          tags.includes("high_risk") ||
          tags.includes("conversion_risk")
        ) {
          workflow = "sales_alert";
        }
        // Priority 2: Friction points -> optimization_workflow
        else if (
          tags.includes("manual_scheduling") ||
          tags.includes("scheduling_gap") ||
          tags.includes("handoff_friction") ||
          tags.includes("capacity_constraint") ||
          tags.includes("stakeholder_coordination") ||
          tags.includes("inconsistent_process")
        ) {
          workflow = "optimization_workflow";
        }
        // Priority 3: Validated/Good states -> validation_path
        else if (
          tags.includes("validated_flow") ||
          tags.includes("low_friction") ||
          tags.includes("optimization_ready")
        ) {
          workflow = "validation_path";
        }
        // Priority 4: Education/Unknown (Default) -> diagnostic_education
        else if (
          tags.includes("awareness_missing") ||
          tags.includes("visibility_gap") ||
          tags.includes("unknown_state")
        ) {
          workflow = "diagnostic_education";
        }

        return { ...o, workflow };
      });

      if (newOpts.length < 2) {
        for (const orig of originalOpts) {
          if (newOpts.length >= 2) break;
          const label = typeof orig === "string" ? orig : orig.label;
          const exists = newOpts.find((n: any) => n.label === label);
          if (!exists) {
            const base = typeof orig === "object" ? orig : { label };
            newOpts.push({
              ...base,
              label,
              tags: ["unknown_state", "low_risk"],
              workflow: "diagnostic_education", // Fallback workflow
            });
          }
        }
      }

      if (newOpts.length > 4) newOpts = newOpts.slice(0, 4);

      return { ...q, options: newOpts };
    }),
  );

  // Collect all options to generate diagnostic answers in batch
  const allOptionsForDiagnostic: { label: string; workflow: string }[] = [];
  processedQuestions.forEach((q) => {
    if (q && Array.isArray(q.options)) {
      q.options.forEach((o: any) => {
        if (o && o.label && o.workflow) {
          allOptionsForDiagnostic.push({
            label: o.label,
            workflow: o.workflow,
          });
        }
      });
    }
  });

  // Generate diagnostic answers in batch (or via vector search if adminId present)
  const diagnosticMap = await generateDiagnosticAnswers(
    allOptionsForDiagnostic,
    contextText,
    adminId,
    businessName,
  );

  // Apply diagnostic answers back to options
  const finalQuestions = processedQuestions.map((q) => {
    if (q && Array.isArray(q.options)) {
      q.options = q.options.map((o: any) => {
        const key = `${o.label}::${o.workflow}`;
        const res = diagnosticMap[key];
        if (res) {
          if (!res.options || res.options.length === 0) {
            // console.warn removed
          }
          return {
            ...o,
            diagnostic_answer: res.answer,
            diagnostic_option_details:
              Array.isArray(res.optionDetails) && res.optionDetails.length > 0
                ? res.optionDetails
                : o.diagnostic_option_details,
            diagnostic_options:
              Array.isArray(res.options) && res.options.length > 0
                ? res.options
                : ["View Details", "Contact Sales", "Read Documentation"],
          };
        }
        return o;
      });
    }
    return q;
  });

  return finalQuestions;
}

export async function enrichStructuredSummary(
  summary: any,
  contextText: string = "",
  adminId?: string,
) {
  if (!summary || !Array.isArray(summary.sections)) return summary;

  const enrichedSections = await Promise.all(
    summary.sections.map(async (section: any) => {
      // Process Lead Questions
      if (Array.isArray(section.leadQuestions)) {
        section.leadQuestions = await processQuestionsWithTags(
          section.leadQuestions,
          contextText,
          adminId,
        );
      }
      // Process Sales Questions
      if (Array.isArray(section.salesQuestions)) {
        section.salesQuestions = await processQuestionsWithTags(
          section.salesQuestions,
          contextText,
          adminId,
        );
      }
      return section;
    }),
  );

  return { ...summary, sections: enrichedSections };
}

export function normalizeStructuredSummary(raw: any) {
  if (!raw || typeof raw !== "object") return raw;
  const result: any = { ...raw };
  if (!Array.isArray(result.sections)) {
    if (result.sections && typeof result.sections === "object") {
      result.sections = [result.sections];
    } else {
      result.sections = [];
    }
  }

  // Create a new array for sections
  result.sections = result.sections.map((section: any) => {
    // Explicitly copy all properties including sectionContent and chunkIndices
    const s: any = { ...section };

    // Ensure sectionContent is preserved (paranoid check)
    if (section.sectionContent) {
      s.sectionContent = section.sectionContent;
    }

    // Ensure chunkIndices is preserved
    if (section.chunkIndices) {
      s.chunkIndices = section.chunkIndices;
    }

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
            const tags =
              Array.isArray(o.tags) && o.tags.length === 2
                ? o.tags.map((t: any) =>
                    String(t)
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, ""),
                  )
                : ["unknown_state", "low_risk"];

            return {
              label: String(o.label),
              tags,
              workflow:
                typeof o.workflow === "string" ? o.workflow : "education_path",
              diagnostic_answer:
                typeof o.diagnostic_answer === "string"
                  ? o.diagnostic_answer
                  : undefined,
              diagnostic_options: Array.isArray(o.diagnostic_options)
                ? o.diagnostic_options
                : undefined,
              diagnostic_option_details: Array.isArray(
                o.diagnostic_option_details,
              )
                ? o.diagnostic_option_details
                : undefined,
            };
          }
          const label = String(o || "");
          return {
            label,
            tags: ["unknown_state", "low_risk"],
            workflow: "education_path",
          };
        });
        return {
          question: q && q.question ? q.question : "",
          options,
          tags: [],
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
            const tags =
              Array.isArray(o.tags) && o.tags.length === 2
                ? o.tags.map((t: any) =>
                    String(t)
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, ""),
                  )
                : ["unknown_state", "low_risk"];

            return {
              label: o.label,
              tags,
              workflow:
                typeof o.workflow === "string"
                  ? o.workflow
                  : "optimization_workflow",
              diagnostic_answer:
                typeof o.diagnostic_answer === "string"
                  ? o.diagnostic_answer
                  : undefined,
              diagnostic_options: Array.isArray(o.diagnostic_options)
                ? o.diagnostic_options
                : undefined,
              diagnostic_option_details: Array.isArray(
                o.diagnostic_option_details,
              )
                ? o.diagnostic_option_details
                : undefined,
            };
          }
          const label = String(o || "");
          return {
            label,
            tags: ["unknown_state", "low_risk"],
            workflow: "optimization_workflow",
          };
        });
        return {
          question: q && q.question ? q.question : "",
          options,
          tags: [],
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
        options:
          idx === 0
            ? ["Just exploring", "Actively evaluating", "Ready to get started"]
            : ["Learn more", "Compare options", "Talk to sales"],
        tags: [baseTitle.toLowerCase()],
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
        options:
          idx === 0
            ? ["In the next month", "In 1-3 months", "Just researching"]
            : ["Just researching", "Shortlisting options", "Ready to decide"],
        tags: [baseTitle.toLowerCase(), "sales"],
        workflow: "diagnostic_response",
        optionFlows: [],
      });
    }
    s.leadQuestions = s.leadQuestions.slice(0, 2).map((q: any) => {
      let opts = Array.isArray(q.options) ? q.options : [];
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
