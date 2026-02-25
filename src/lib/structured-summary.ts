import OpenAI from "openai";
import { parseSectionBlocks, mergeSmallSectionBlocks } from "@/lib/parsing";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface SectionBlock {
  title: string;
  body: string;
}

export interface StructuredSummary {
  pageType: string;
  businessVertical: string;
  primaryFeatures: string[];
  painPointsAddressed: string[];
  solutions: string[];
  targetCustomers: string[];
  businessOutcomes: string[];
  competitiveAdvantages: string[];
  industryTerms: string[];
  pricePoints: string[];
  integrations: string[];
  useCases: string[];
  callsToAction: string[];
  trustSignals: string[];
  sections: SectionDetail[];
  summaryGeneratedAt?: Date;
}

export interface SectionDetail {
  sectionName: string;
  sectionSummary: string;
  sectionContent: string;
  leadQuestions: any[];
  salesQuestions: any[];
}

export async function generateStructuredSummaryFromText(
  text: string,
): Promise<StructuredSummary | null> {
  if (!text || text.trim().length === 0) return null;

  try {
    // 1. Parse and Merge Sections
    const rawBlocks = parseSectionBlocks(text);
    // Use a lower threshold (30 chars) to preserve valid small sections
    const blocks =
      rawBlocks.length > 0 ? mergeSmallSectionBlocks(rawBlocks, 30) : rawBlocks;

    // If no blocks parsed, treat whole text as one block
    if (blocks.length === 0) {
      blocks.push({ title: "General Content", body: text });
    }

    // 2. Step 1: Generate Global Metadata (Page Type, Vertical, Features, etc.)
    // We use the first 8000 chars of text + all section titles for context
    const contextText = text.substring(0, 12000);
    const sectionTitles = blocks.map((b) => b.title).join(", ");

    const metadataPrompt = `Analyze this web page content and extract key business intelligence.
    
    Section Titles: ${sectionTitles}
    
    Content Preview:
    ${contextText}
    
    Return a JSON object with this exact structure:
    {
      "pageType": "homepage|pricing|features|about|contact|blog|product|service",
      "businessVertical": "fitness|healthcare|legal|restaurant|saas|ecommerce|consulting|other",
      "primaryFeatures": ["feature1", "feature2", "feature3"],
      "painPointsAddressed": ["pain1", "pain2", "pain3"],
      "solutions": ["solution1", "solution2", "solution3"],
      "targetCustomers": ["small business", "enterprise", "startups"],
      "businessOutcomes": ["outcome1", "outcome2"],
      "competitiveAdvantages": ["advantage1", "advantage2"],
      "industryTerms": ["term1", "term2", "term3"],
      "pricePoints": ["free", "$X/month", "enterprise"],
      "integrations": ["tool1", "tool2"],
      "useCases": ["usecase1", "usecase2"],
      "callsToAction": ["Get Started", "Book Demo"],
      "trustSignals": ["testimonial", "certification", "clientcount"]
    }
    
    REQUIREMENTS:
    1. Do NOT leave arrays empty if information can be inferred. Populate them with at least 3 items each where possible.
    2. Be specific and use terminology from the content.
    `;

    const metadataResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert web page analyzer. Return ONLY valid JSON.",
        },
        { role: "user", content: metadataPrompt },
      ],
      temperature: 0.3,
    });

    let metadata: Partial<StructuredSummary> = {};
    try {
      metadata = JSON.parse(
        metadataResponse.choices[0]?.message?.content || "{}",
      );
    } catch (e) {
      console.error("[StructuredSummary] Failed to parse metadata JSON", e);
    }

    // 3. Step 2: Generate Questions for Each Section
    const sections: SectionDetail[] = [];
    const concurrency = 5; // Process 5 sections at a time

    for (let i = 0; i < blocks.length; i += concurrency) {
      const batch = blocks.slice(i, i + concurrency);

      const batchPromises = batch.map(async (block) => {
        const prompt = `Analyze this specific website section and generate HIGHLY SPECIFIC lead/sales questions.
        
        Section Title: "${block.title}"
        Section Content:
        "${block.body.substring(0, 8000)}" 
        
        Return a JSON object with:
        {
          "sectionSummary": "Brief summary of this section",
          "leadQuestions": [
            { "question": "Problem Recognition Question", "options": ["Opt1", "Opt2"], "tags": ["primary_tag", "modifier_tag"], "workflow": "sales_alert" },
            { "question": "Problem Recognition Question 2", "options": ["Opt1", "Opt2"], "tags": ["primary_tag", "modifier_tag"], "workflow": "sales_alert" }
          ],
          "salesQuestions": [
             { 
               "question": "Diagnostic Question", 
               "options": ["Opt1", "Opt2"], 
               "tags": ["primary_tag", "modifier_tag"], 
               "workflow": "diagnostic_response",
               "optionFlows": [
                 {
                   "forOption": "Opt1",
                   "diagnosticAnswer": "Diagnostic response script",
                   "followUpQuestion": "Follow up question script",
                   "featureMappingAnswer": "Feature mapping script",
                   "loopClosure": "Loop closure script"
                 }
               ]
             },
             { 
               "question": "Diagnostic Question 2", 
               "options": ["Opt1", "Opt2"], 
               "tags": ["primary_tag", "modifier_tag"], 
               "workflow": "diagnostic_response",
               "optionFlows": [
                 {
                   "forOption": "Opt1",
                   "diagnosticAnswer": "Diagnostic response script",
                   "followUpQuestion": "Follow up question script",
                   "featureMappingAnswer": "Feature mapping script",
                   "loopClosure": "Loop closure script"
                 }
               ]
             }
          ]
        }
        
        REQUIREMENTS:
        1. EXACTLY 2 Lead Questions and 2 Sales Questions.
        2. Questions MUST be directly derived from the specific content of this section (e.g., if section is "Lead Scoring", ask about lead prioritization).
        3. Do NOT use generic phrasing like "What are you interested in?" or "How can we help?".
        4. Use specific terminology found in the Section Content.
        5. For Lead Questions: Ask about the user's current challenges related to "${block.title}".
        6. For Sales Questions: Ask about the urgency or specific use case for "${block.title}".
        7. For each Sales Question, generate an 'optionFlows' entry for EACH option.
        8. 'diagnosticAnswer' should be an empathetic/validating response.
        9. 'followUpQuestion' should deepen the diagnosis.
        10. 'featureMappingAnswer' should map the problem to a specific feature mentioned in the section.
        11. 'loopClosure' should summarize and move to next steps.
        12. TAG TAXONOMY (Use EXACTLY 2 tags per option: 1 Primary + 1 Secondary):
            Primary (Problem/Readiness): manual_scheduling, scheduling_gap, onboarding_delay, onboarding_dropoff, pipeline_leakage, inconsistent_process, handoff_friction, visibility_gap, no_show_risk, late_engagement, stakeholder_coordination, capacity_constraint, validated_flow, optimization_ready, awareness_missing, unknown_state, low_friction
            Secondary (Risk/Modifier): low_risk, conversion_risk, high_risk, critical_risk, validated_flow, optimization_ready, awareness_missing
        13. WORKFLOWS: sales_alert (if risk), optimization_workflow (if friction), validation_path (if good), diagnostic_education (if unknown).
        `;

        try {
          const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "You are an expert sales strategist. Return ONLY valid JSON.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
          });

          const data = JSON.parse(res.choices[0]?.message?.content || "{}");
          return {
            sectionName: block.title,
            sectionContent: block.body, // EXPLICITLY SET HERE
            sectionSummary: data.sectionSummary || "No summary available",
            leadQuestions: data.leadQuestions || [],
            salesQuestions: data.salesQuestions || [],
          };
        } catch (err) {
          console.error(
            `[StructuredSummary] Failed to process section '${block.title}'`,
            err,
          );
          return {
            sectionName: block.title,
            sectionContent: block.body,
            sectionSummary: "Analysis failed",
            leadQuestions: [],
            salesQuestions: [],
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      sections.push(...batchResults);
    }

    // 4. Assemble Final Object
    return {
      pageType: metadata.pageType || "other",
      businessVertical: metadata.businessVertical || "other",
      primaryFeatures: metadata.primaryFeatures || [],
      painPointsAddressed: metadata.painPointsAddressed || [],
      solutions: metadata.solutions || [],
      targetCustomers: metadata.targetCustomers || [],
      businessOutcomes: metadata.businessOutcomes || [],
      competitiveAdvantages: metadata.competitiveAdvantages || [],
      industryTerms: metadata.industryTerms || [],
      pricePoints: metadata.pricePoints || [],
      integrations: metadata.integrations || [],
      useCases: metadata.useCases || [],
      callsToAction: metadata.callsToAction || [],
      trustSignals: metadata.trustSignals || [],
      sections: sections,
      summaryGeneratedAt: new Date(),
    };
  } catch (error) {
    console.error("[StructuredSummary] Fatal error generating summary", error);
    return null;
  }
}
