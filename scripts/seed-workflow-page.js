const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function seedPage() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Please set MONGODB_URI in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("test"); // Matches src/lib/mongo.ts

    const collection = db.collection("crawled_pages");

    const testUrl = "https://example.com/pricing";
    const adminId = "default-admin";

    const mockData = {
      url: testUrl,
      adminId: adminId,
      createdAt: new Date(),
      status: "completed",
      structuredSummary: {
        sections: [
          {
            sectionName: "Pricing Plans",
            leadQuestion:
              "Are you looking for a plan for an individual or a team?",
            leadOptions: ["Individual", "Team", "Enterprise"],
            leadTags: ["b2c", "b2b_smb", "high_risk_enterprise"],
            leadWorkflow: "ask_sales_question", // For Team/Enterprise
            salesQuestion: "How large is your team currently?",
            salesOptions: ["1-10", "11-50", "50+"],
            salesTags: ["size_small", "size_medium", "high_risk_large"],
            salesWorkflow: "diagnostic_response",
            scripts: {
              diagnosticAnswer:
                "For teams of that size, our Growth plan is usually the best fit.",
              followUpQuestion: "Does your team need SSO integration?",
              followUpOptions: ["Yes", "No"],
              featureMappingAnswer:
                "Great, our Growth plan includes SSO and advanced security.",
              loopClosure:
                "I can help you set up a demo for the Growth plan if you're interested.",
            },
          },
        ],
      },
    };

    // Clean up old test data
    await collection.deleteMany({ url: testUrl });

    // Insert new
    await collection.insertOne(mockData);

    console.log(`Seeded mock page for URL: ${testUrl}`);
    console.log(
      "Sections configured:",
      mockData.structuredSummary.sections.length,
    );
  } catch (e) {
    console.error("Error seeding:", e);
  } finally {
    await client.close();
  }
}

seedPage();
