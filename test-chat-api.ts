import { NextRequest } from "next/server";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Mock NextRequest
class MockRequest extends NextRequest {
  constructor(body: any, headers: any = {}) {
    super("http://localhost:3000/api/chat", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        ...headers,
      }),
      body: JSON.stringify(body),
    });
  }
}

async function test() {
  try {
    console.log("Testing /api/chat endpoint...");

    // Dynamic import to ensure env vars are loaded first
    const { POST } = await import("./src/app/api/chat/route");

    // Test with a question that should return sources
    const req = new MockRequest({
      question: "how do I register?",
      sessionId: "test-session-" + Date.now(),
      pageUrl: "http://localhost:3000",
      adminId: "683d367c34f91e34254f2914", // Use a valid adminId from Pinecone
    });
    const res = await POST(req);
    const data = await res.json();
    console.log("Response status:", res.status);
    console.log("Full Response Body:", JSON.stringify(data, null, 2));

    if (
      data.sources &&
      Array.isArray(data.sources) &&
      data.sources.length > 0
    ) {
      console.log("✅ Sources returned successfully!");
      console.log("Sources:", data.sources);
      process.exit(0);
    } else {
      console.log("❌ No sources returned.");
      console.log("Sources field:", data.sources);
      process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

test();
