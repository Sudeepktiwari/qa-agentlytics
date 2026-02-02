const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function runTest() {
  const baseUrl = "http://localhost:3000/api/chat";
  const sessionId = "test-session-phase4-" + Date.now();
  const pageUrl = "https://example.com/pricing";

  console.log(`Starting Phase 4 Test Session: ${sessionId}`);

  // Helper to send message
  async function sendMessage(message, stepName) {
    console.log(`\n--- [${stepName}] Sending: "${message || "INIT"}" ---`);

    const body = {
      sessionId,
      pageUrl,
      messageType: "question", // Always use 'question' to pass Zod schema
      proactive: !message, // If no message, treat as proactive/init
    };
    if (message) {
      body.question = message;
    }

    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("FULL RESPONSE:", JSON.stringify(data, null, 2));
    console.log(`Response Step: ${data.workflowStep}`);
    console.log(
      `Message: ${data.mainText ? data.mainText.substring(0, 100) : "NO MAIN TEXT"}...`,
    );
    if (data.buttons && data.buttons.length > 0) {
      console.log(`Options: [${data.buttons.join(", ")}]`);
    }
    if (data.showBookingCalendar) {
      console.log("✅ Booking Calendar Flag: TRUE");
    }
    return data;
  }

  try {
    // 1. Init (Idle -> Lead Question)
    await sendMessage(null, "INIT");

    // 2. Lead Question -> Select "Enterprise" (High Risk)
    await sendMessage("Enterprise", "LEAD_ANSWER");

    // 3. Sales Question -> Select "50+" (High Risk)
    await sendMessage("50+", "SALES_ANSWER");

    // 4. Follow-up -> Select "Yes"
    // Expectation: Because high risk was triggered, after this, it should ask to talk to sales
    const res4 = await sendMessage("Yes", "DIAGNOSTIC_ANSWER");

    // 5. Check if we are in sales_handoff_confirm or prompted
    if (
      res4.workflowStep === "sales_handoff_confirm" ||
      res4.workflowStep === "loop_closure"
    ) {
      // If it went to loop_closure but offered "Talk to Sales"
      console.log("Proceeding to Sales Handoff...");
      await sendMessage("Talk to Sales", "HANDOFF_REQUEST");
    }

    // 6. Name
    await sendMessage("John Doe", "HANDOFF_NAME");

    // 7. Email
    await sendMessage("john@enterprise.com", "HANDOFF_EMAIL");

    // 8. Details
    await sendMessage(
      "Need global deployment for 500 users",
      "HANDOFF_DETAILS",
    );

    // 9. Timeline
    const resFinal = await sendMessage("Immediately", "HANDOFF_TIMELINE");

    if (
      resFinal.workflowStep === "sales_handoff_end" &&
      resFinal.showBookingCalendar
    ) {
      console.log(
        "\n✅ PHASE 4 TEST PASSED: Sales Handoff Completed with Calendar!",
      );
    } else {
      console.log(
        "\n❌ PHASE 4 TEST FAILED: Did not reach end state or missing calendar.",
      );
      console.log("Final State:", resFinal);
    }
  } catch (e) {
    console.error("Test Error:", e);
  }
}

runTest();
