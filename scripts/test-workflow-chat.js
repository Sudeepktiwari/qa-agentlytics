const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function testWorkflow() {
  const baseUrl = "http://localhost:3000/api/chat";
  const testUrl = "https://example.com/pricing";
  const sessionId = "test-session-" + Date.now();
  const adminId = "default-admin";

  console.log(`Starting workflow test for Session ID: ${sessionId}`);

  // Helper to send message
  async function sendMessage(question, stepName) {
    console.log(`\n--- Step: ${stepName} ---`);
    console.log(
      `Sending: "${question || (question === null ? "NULL (Proactive)" : "EMPTY")}"`,
    );

    // Prepare body
    const body = {
      sessionId: sessionId,
      pageUrl: testUrl,
      proactive: question === null, // true if null
      adminId: adminId,
      messageType: "question",
    };

    if (question !== null) {
      body.question = question;
    }

    try {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error(`Error: ${res.status} ${res.statusText}`);
        const txt = await res.text();
        console.error("Response:", txt);
        return null;
      }

      const data = await res.json();
      console.log("Response Status:", res.status);
      console.log("Workflow Step:", data.workflowStep);
      console.log("Message:", data.mainText);
      console.log("Options:", data.buttons);
      return data;
    } catch (e) {
      console.error("Fetch error:", e);
      return null;
    }
  }

  // 1. Trigger Proactive / Start (Idle -> Lead Question)
  // Sending null question to simulate proactive trigger or first load
  let res = await sendMessage(null, "1. Initial Trigger");

  if (!res || res.workflowStep !== "lead_question") {
    console.error("FAILED: Expected lead_question step");
    // If it failed, maybe because proactive logic in chat/route needs 'proactive: true' explicitly?
    // Let's try sending a dummy question if null failed, but workflow.ts handles null userMessage.
    // In chat/route.ts, we pass: const workflowUserMessage = (proactive || !question) ? null : question;
    return;
  }

  // 2. Answer Lead Question (Lead Question -> Sales Question)
  // Option: "Team" -> triggers sales workflow
  res = await sendMessage(
    "I am looking for a Team plan",
    "2. Answer Lead Question",
  );

  if (!res || res.workflowStep !== "sales_question") {
    console.error("FAILED: Expected sales_question step");
    return;
  }

  // 3. Answer Sales Question (Sales Question -> Diagnostic -> Follow Up)
  // Option: "11-50"
  res = await sendMessage(
    "We have about 20 people (11-50)",
    "3. Answer Sales Question",
  );

  if (!res || res.workflowStep !== "follow_up_question") {
    console.error(
      "FAILED: Expected follow_up_question step (diagnostic displayed)",
    );
    return;
  }

  // 4. Answer Follow Up (Follow Up -> Feature Mapping -> Loop Closure)
  // Option: "Yes"
  res = await sendMessage("Yes, we need SSO", "4. Answer Follow Up");

  if (!res || res.workflowStep !== "loop_closure") {
    console.error("FAILED: Expected loop_closure step");
    return;
  }

  console.log("\n✅ WORKFLOW TEST COMPLETED SUCCESSFULLY");
}

testWorkflow();
