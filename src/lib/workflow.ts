import { getDb } from "./mongo";
import { ObjectId } from "mongodb";

export interface WorkflowQuestion {
  question: string;
  options: string[];
  tags: string[];
  workflow: string;
}

export interface WorkflowSection {
  sectionName: string;
  leadQuestions: WorkflowQuestion[];
  salesQuestions: WorkflowQuestion[];
  scripts: {
    diagnosticAnswer: string;
    followUpQuestion: string;
    followUpOptions: string[];
    featureMappingAnswer: string;
    loopClosure: string;
  };
}

export interface SessionState {
  sessionId: string;
  currentSection?: string;
  workflowStep:
    | "idle"
    | "lead_question"
    | "sales_question"
    | "diagnostic"
    | "follow_up_question"
    | "feature_mapping"
    | "loop_closure"
    | "sales_handoff_confirm"
    | "sales_handoff_name"
    | "sales_handoff_email"
    | "sales_handoff_details"
    | "sales_handoff_timeline"
    | "sales_handoff_end";
  followUpCount: number;
  selectedLeadOption?: string;
  selectedSalesOption?: string;
  diagnosedIssue?: string;
  isHighRisk?: boolean;
  salesData?: {
    name?: string;
    email?: string;
    details?: string;
    timeline?: string;
  };
  lastUpdated: number;
  history: Array<{
    timestamp: number;
    step: string;
    section?: string;
    question?: string;
    optionSelected?: string;
    tagsApplied?: string[];
    workflowTriggered?: string;
    featureShown?: string;
    input?: string;
  }>;
}

export async function getSessionState(
  sessionId: string,
): Promise<SessionState> {
  const db = await getDb();
  const state = await db
    .collection<SessionState>("session_states")
    .findOne({ sessionId });
  if (!state) {
    return {
      sessionId,
      workflowStep: "idle",
      followUpCount: 0,
      lastUpdated: Date.now(),
      history: [],
    };
  }
  return state;
}

// Stub for alert system
async function sendAlert(sessionId: string, type: string, details: any) {
  console.log(`[ALERT] High Risk/Sales Signal in Session ${sessionId}:`, {
    type,
    details,
  });
  // TODO: Integrate email service (SendGrid/AWS SES) or Slack webhook here
}

export async function updateSessionState(
  sessionId: string,
  update: Partial<SessionState>,
) {
  const db = await getDb();
  await db.collection("session_states").updateOne(
    { sessionId },
    {
      $set: { ...update, lastUpdated: Date.now() },
      $setOnInsert: { sessionId, history: [] },
    },
    { upsert: true },
  );
}

export async function addHistoryEntry(sessionId: string, entry: any) {
  const db = await getDb();
  await db
    .collection("session_states")
    .updateOne(
      { sessionId },
      { $push: { history: { ...entry, timestamp: Date.now() } } as any },
    );
}

export async function getCrawledPageData(url: string, adminId?: string) {
  const db = await getDb();
  const query: any = { url };
  if (adminId) query.adminId = adminId;

  const page = await db
    .collection("crawled_pages")
    .findOne(query, { sort: { createdAt: -1 } });
  return page?.structuredSummary;
}

// Main Workflow Engine
export async function processWorkflowStep(
  sessionId: string,
  userMessage: string | null, // null if this is a proactive/init trigger
  pageUrl: string,
  adminId?: string,
) {
  const state = await getSessionState(sessionId);
  const pageData = await getCrawledPageData(pageUrl, adminId);

  if (!pageData || !pageData.sections || !Array.isArray(pageData.sections)) {
    return null; // No structured workflow data available
  }

  const sections: WorkflowSection[] = pageData.sections;

  // Logic to determine current section (if not set)
  // For now, default to the first section if not set
  let currentSection = sections.find(
    (s) => s.sectionName === state.currentSection,
  );
  if (!currentSection) {
    currentSection = sections[0];
    await updateSessionState(sessionId, {
      currentSection: currentSection.sectionName,
    });
  }

  // State Machine
  let response = {
    message: "",
    options: [] as string[],
    workflowStep: state.workflowStep,
    showBookingCalendar: false,
  };

  // --- SALES HANDOFF WORKFLOW (PHASE 4) ---
  if (state.workflowStep.startsWith("sales_handoff_")) {
    if (state.workflowStep === "sales_handoff_confirm") {
      // Logic handled in previous step transition, but if we are here and receive input:
      if (userMessage) {
        if (
          userMessage.toLowerCase().includes("yes") ||
          userMessage.toLowerCase().includes("sure") ||
          userMessage.toLowerCase().includes("talk")
        ) {
          response.message =
            "Great! Let's get you connected. What is your name?";
          response.workflowStep = "sales_handoff_name";
          await updateSessionState(sessionId, {
            workflowStep: "sales_handoff_name",
          });
          return response;
        } else {
          // User declined
          response.message =
            "No problem. Let me know if you have any other questions!";
          response.workflowStep = "idle";
          await updateSessionState(sessionId, { workflowStep: "idle" });
          return response;
        }
      }
    } else if (state.workflowStep === "sales_handoff_name") {
      if (userMessage) {
        await updateSessionState(sessionId, {
          workflowStep: "sales_handoff_email",
          salesData: { ...state.salesData, name: userMessage },
        });
        response.message = `Nice to meet you, ${userMessage}. What is the best email address to reach you at?`;
        response.workflowStep = "sales_handoff_email";
        return response;
      }
    } else if (state.workflowStep === "sales_handoff_email") {
      if (userMessage) {
        // Basic validation could go here
        await updateSessionState(sessionId, {
          workflowStep: "sales_handoff_details",
          salesData: { ...state.salesData, email: userMessage },
        });
        response.message =
          "Thanks. Briefly, could you tell me about your main use case or team size?";
        response.workflowStep = "sales_handoff_details";
        return response;
      }
    } else if (state.workflowStep === "sales_handoff_details") {
      if (userMessage) {
        await updateSessionState(sessionId, {
          workflowStep: "sales_handoff_timeline",
          salesData: { ...state.salesData, details: userMessage },
        });
        response.message =
          "Got it. Finally, when are you looking to get started?";
        response.options = ["Immediately", "1-3 months", "Just researching"];
        response.workflowStep = "sales_handoff_timeline";
        return response;
      }
    } else if (state.workflowStep === "sales_handoff_timeline") {
      if (userMessage) {
        await updateSessionState(sessionId, {
          workflowStep: "sales_handoff_end",
          salesData: { ...state.salesData, timeline: userMessage },
        });
        // Trigger final alert
        const finalState = await getSessionState(sessionId);
        await sendAlert(
          sessionId,
          "sales_handoff_completed",
          finalState.salesData,
        );

        response.message =
          "Perfect. I've sent your details to our team. You can also book a time directly below if you prefer.";
        response.workflowStep = "sales_handoff_end";
        response.showBookingCalendar = true;
        // Reset to idle after this? Or stay in end state?
        // Let's reset to idle so they can chat more if they want, but after showing calendar.
        await updateSessionState(sessionId, { workflowStep: "idle" });
        return response;
      }
    }
    return null;
  }

  // 1. LEAD QUESTION DELIVERY
  if (state.workflowStep === "idle" || state.workflowStep === "lead_question") {
    const leadQ = currentSection.leadQuestions[0]; // Default to first question
    if (!leadQ) return null;

    // If idle, start lead question
    if (state.workflowStep === "idle") {
      response.message = leadQ.question;
      response.options = leadQ.options;
      response.workflowStep = "lead_question"; // Update response step
      await updateSessionState(sessionId, {
        workflowStep: "lead_question",
        followUpCount: 0,
      });
      await addHistoryEntry(sessionId, {
        step: "lead_question_start",
        section: currentSection.sectionName,
        question: leadQ.question,
      });
      return response;
    }

    // If already in lead_question, check if user answered
    if (userMessage) {
      // Check if user selected an option (fuzzy match)
      const selectedIndex = leadQ.options.findIndex(
        (opt) =>
          userMessage.toLowerCase().includes(opt.toLowerCase()) ||
          opt.toLowerCase().includes(userMessage.toLowerCase()),
      );

      if (selectedIndex !== -1) {
        // Option Selected -> Route
        const selectedOption = leadQ.options[selectedIndex];
        const tags = leadQ.tags;
        const tag = tags[selectedIndex] || "unknown";

        const workflow = leadQ.workflow; // "ask_sales_question" | "educational_insight" | "stop"

        // CHECK HIGH RISK
        const isHighRisk =
          tag.includes("high_risk") ||
          tag.includes("critical") ||
          tag.includes("urgent");
        if (isHighRisk) {
          await updateSessionState(sessionId, { isHighRisk: true });
          await sendAlert(sessionId, "high_risk_lead_tag", {
            tag,
            option: selectedOption,
          });
        }

        await updateSessionState(sessionId, {
          selectedLeadOption: selectedOption,
        });
        await addHistoryEntry(sessionId, {
          step: "lead_option_selected",
          optionSelected: selectedOption,
          tagsApplied: [tag],
          workflowTriggered: workflow,
        });

        if (
          workflow.includes("sales_question") ||
          workflow.includes("severity_medium") ||
          workflow.includes("severity_high")
        ) {
          // Go to Sales Question
          const salesQ = currentSection.salesQuestions[0]; // Default to first sales question
          if (salesQ) {
            response.message = salesQ.question;
            response.options = salesQ.options;
            response.workflowStep = "sales_question";
            await updateSessionState(sessionId, {
              workflowStep: "sales_question",
              followUpCount: 0,
            });
            return response;
          } else {
            // Fallback if no sales question
            response.message =
              "Could you tell me a bit more about what you're looking for?";
            response.workflowStep = "idle";
            return response;
          }
        } else {
          // Educational insight / Stop
          response.message =
            "Thanks for sharing. Based on that, you might find our resources helpful.";
          response.workflowStep = "idle";
          await updateSessionState(sessionId, { workflowStep: "idle" }); // Reset/Stop
          return response;
        }
      } else {
        // User didn't select an option -> Follow-up logic
        if (state.followUpCount < 2) {
          // Generate follow-up (simplified for now, ideally specific scripts)
          response.message =
            state.followUpCount === 0
              ? `Just to check - ${leadQ.question}` // Follow-up #1
              : `Quick nudge: ${leadQ.question}`; // Follow-up #2
          response.options = leadQ.options;
          await updateSessionState(sessionId, {
            followUpCount: state.followUpCount + 1,
          });
          await addHistoryEntry(sessionId, {
            step: "lead_followup",
            count: state.followUpCount + 1,
          });
          return response;
        } else {
          // Max follow-ups reached -> Stop
          return null; // Or generic handoff
        }
      }
    }
  }

  // 2. SALES QUESTION DELIVERY
  if (state.workflowStep === "sales_question") {
    const salesQ = currentSection.salesQuestions[0];
    if (!salesQ) return null;

    if (userMessage) {
      const selectedIndex = salesQ.options.findIndex(
        (opt) =>
          userMessage.toLowerCase().includes(opt.toLowerCase()) ||
          opt.toLowerCase().includes(userMessage.toLowerCase()),
      );

      if (selectedIndex !== -1) {
        // Option Selected -> Diagnostic Response
        const selectedOption = salesQ.options[selectedIndex];
        await updateSessionState(sessionId, {
          selectedSalesOption: selectedOption,
        });

        const tag = salesQ.tags[selectedIndex] || "unknown";

        // CHECK HIGH RISK
        const isHighRisk =
          tag.includes("high_risk") ||
          tag.includes("critical") ||
          tag.includes("urgent");
        if (isHighRisk) {
          await updateSessionState(sessionId, { isHighRisk: true });
          await sendAlert(sessionId, "high_risk_sales_tag", {
            tag,
            option: selectedOption,
          });
        }

        await addHistoryEntry(sessionId, {
          step: "sales_option_selected",
          optionSelected: selectedOption,
          tagsApplied: [tag],
          workflowTriggered: "diagnostic",
        });

        // Diagnostic Response (Step A, B, C)
        const diagnosticMsg = currentSection.scripts.diagnosticAnswer;
        const followUpMsg = currentSection.scripts.followUpQuestion; // Mandatory follow-up

        response.message = `${diagnosticMsg}\n\n${followUpMsg}`;
        response.options = currentSection.scripts.followUpOptions || [
          "Yes",
          "No",
        ];
        response.workflowStep = "follow_up_question";

        await updateSessionState(sessionId, {
          workflowStep: "follow_up_question",
        });
        return response;
      } else {
        // Follow-up logic for sales question
        if (state.followUpCount < 2) {
          response.message =
            state.followUpCount === 0
              ? `Following up: ${salesQ.question}`
              : `Just checking: ${salesQ.question}`;
          response.options = salesQ.options;
          await updateSessionState(sessionId, {
            followUpCount: state.followUpCount + 1,
          });
          await addHistoryEntry(sessionId, {
            step: "sales_followup",
            count: state.followUpCount + 1,
          });
          return response;
        } else {
          return null;
        }
      }
    }
  }

  // 3. FEATURE MAPPING
  if (state.workflowStep === "follow_up_question") {
    if (userMessage) {
      // User answered the mandatory follow-up
      // Map to ONE feature
      const featureMsg = currentSection.scripts.featureMappingAnswer;
      const loopClosureMsg = currentSection.scripts.loopClosure;

      response.message = `${featureMsg}\n\n${loopClosureMsg}`;

      // Check if high risk was flagged, maybe suggest talking to sales?
      if (state.isHighRisk) {
        response.message +=
          "\n\nGiven your requirements, I'd recommend speaking with our team.";
        response.options = ["Talk to Sales", "No thanks"];
        response.workflowStep = "sales_handoff_confirm";
        await updateSessionState(sessionId, {
          workflowStep: "sales_handoff_confirm",
        });
      } else {
        // Normal closure
        response.options = ["Talk to Sales", "Restart"]; // Optional actions
        response.workflowStep = "loop_closure";
        await updateSessionState(sessionId, { workflowStep: "loop_closure" });
      }

      await addHistoryEntry(sessionId, {
        step: "feature_mapping_closure",
        featureShown: featureMsg,
      });
      return response;
    }
  }

  // 4. LOOP CLOSURE / IDLE TRANSITION
  if (state.workflowStep === "loop_closure") {
    if (userMessage && userMessage.toLowerCase().includes("sales")) {
      response.message = "Great! Let's get you connected. What is your name?";
      response.workflowStep = "sales_handoff_name";
      await updateSessionState(sessionId, {
        workflowStep: "sales_handoff_name",
      });
      return response;
    }
    // Otherwise fallback to null to let standard chat handle it
    return null;
  }

  return null;
}
