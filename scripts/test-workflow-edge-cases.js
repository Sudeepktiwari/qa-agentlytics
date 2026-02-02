
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function testEdgeCases() {
  const baseUrl = "http://localhost:3000/api/chat";
  const testUrl = "https://example.com/pricing";
  const nonWorkflowUrl = "https://example.com/blog/some-article";
  const sessionId = "test-session-edge-" + Date.now();
  const adminId = "default-admin";

  console.log(`Starting Edge Case Test for Session ID: ${sessionId}`);

  async function sendMessage(question, pageUrl, stepName, expectedStep) {
    console.log(`\n--- Step: ${stepName} ---`);
    console.log(`Page: ${pageUrl}`);
    console.log(`Sending: "${question}"`);
    
    const body = {
      sessionId: sessionId,
      pageUrl: pageUrl,
      proactive: question === null,
      adminId: adminId,
      messageType: "question"
    };
    if (question !== null) body.question = question;

    try {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      console.log("Status:", res.status);
      console.log("Workflow Step:", data.workflowStep);
      console.log("Message:", data.mainText?.substring(0, 50) + "...");
      
      if (expectedStep === "fallback") {
        if (data.workflowStep === undefined) {
           console.log("✅ Correctly fell back to standard chat");
        } else {
           console.error("❌ FAILED: Should have fallen back, but got workflow step: " + data.workflowStep);
        }
      } else if (expectedStep) {
        if (data.workflowStep === expectedStep) {
           console.log(`✅ Correctly in step: ${expectedStep}`);
        } else {
           console.error(`❌ FAILED: Expected ${expectedStep}, got ${data.workflowStep}`);
        }
      }
      return data;
    } catch (e) {
      console.error("Error:", e);
    }
  }

  // 1. Initial Trigger
  await sendMessage(null, testUrl, "1. Initial Trigger", "lead_question");

  // 2. Invalid Option (Should stay in lead_question but increment follow-up)
  // Current logic: returns same step, but message changes to follow-up
  await sendMessage("I want a pony", testUrl, "2. Invalid Option", "lead_question");

  // 3. Second Invalid Option (Should still be lead_question, follow-up #2)
  await sendMessage("I still want a pony", testUrl, "3. Second Invalid Option", "lead_question");

  // 4. Third Invalid Option (Max follow-ups reached -> Stop/Null)
  // If null is returned by workflow, it falls back to standard chat?
  // Let's see what happens.
  await sendMessage("Seriously, a pony", testUrl, "4. Third Invalid Option (Should Fallback)", "fallback");

  // 5. Non-Workflow Page (Should go straight to standard chat)
  const session2 = "test-session-fallback-" + Date.now();
  // Update sessionId in closure or just pass it? 
  // I'll just use a new call for simplicity, but I need to update the helper or just copy paste.
  // Re-using helper but overriding sessionId via global var is messy. 
  // Let's just do a manual call for the fallback test.
  
  console.log(`\n--- Step: 5. Non-Workflow Page ---`);
  const bodyFallback = {
    sessionId: session2,
    pageUrl: nonWorkflowUrl,
    proactive: true,
    adminId: adminId,
    messageType: "question"
  };
  
  const resFallback = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyFallback)
  });
  const dataFallback = await resFallback.json();
  console.log("Workflow Step:", dataFallback.workflowStep);
  if (dataFallback.workflowStep === undefined) {
      console.log("✅ Correctly used standard chat for non-workflow page");
  } else {
      console.error("❌ FAILED: Used workflow for non-workflow page");
  }

}

testEdgeCases();
