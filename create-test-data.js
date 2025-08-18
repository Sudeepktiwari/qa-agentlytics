const { MongoClient } = require("mongodb");
const crypto = require("crypto");

async function createTestData() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db("test");

    // Create a test admin user
    const adminId = "test_admin_123";
    const email = "test@example.com";

    await db.collection("admins").insertOne({
      adminId,
      email,
      password: "hashed_password_123", // In real app, this would be properly hashed
      createdAt: new Date(),
    });

    // Create an API key for this user
    const apiKey = "ak_" + crypto.randomBytes(16).toString("hex");
    await db.collection("api_keys").insertOne({
      apiKey,
      adminId,
      email,
      createdAt: new Date(),
    });

    // Create some test crawled pages - some with structured summaries, some without
    const testPages = [
      {
        adminId,
        url: "https://example.com/page1",
        text: "This is a comprehensive business page about our AI-powered customer service platform. We help businesses automate their customer support with intelligent chatbots.",
        summary: "AI-powered customer service platform for business automation",
        filename: "https://example.com/page1",
        createdAt: new Date(),
        structuredSummary: {
          pageType: "homepage",
          businessVertical: "saas",
          primaryFeatures: [
            "AI chatbots",
            "Customer service automation",
            "Real-time analytics",
          ],
          painPointsAddressed: [
            "High support costs",
            "Slow response times",
            "Limited availability",
          ],
          solutions: [
            "24/7 automated support",
            "Intelligent routing",
            "Cost reduction",
          ],
          targetCustomers: ["small business", "enterprise"],
          businessOutcomes: [
            "Reduced support costs",
            "Improved response times",
          ],
          competitiveAdvantages: ["Advanced AI", "Easy integration"],
          industryTerms: ["chatbot", "AI", "automation"],
          pricePoints: ["$29/month", "$99/month", "enterprise"],
          integrations: ["Slack", "Zendesk", "Salesforce"],
          useCases: [
            "Customer support",
            "Lead qualification",
            "FAQ automation",
          ],
          callsToAction: ["Get Started", "Book Demo"],
          trustSignals: ["5000+ customers", "SOC2 certified"],
        },
        summaryGeneratedAt: new Date(),
      },
      {
        adminId,
        url: "https://example.com/page2",
        text: "Our pricing page shows different tiers for small businesses and enterprises.",
        summary: "Pricing information for different business tiers",
        filename: "https://example.com/page2",
        createdAt: new Date(),
        structuredSummary: {
          pageType: "pricing",
          businessVertical: "saas",
          primaryFeatures: [
            "Tiered pricing",
            "Enterprise support",
            "Custom solutions",
          ],
          painPointsAddressed: ["Budget constraints", "Scalability needs"],
          solutions: ["Flexible pricing", "Scalable plans"],
          targetCustomers: ["small business", "enterprise"],
          businessOutcomes: ["Cost optimization", "Better ROI"],
          competitiveAdvantages: ["Competitive pricing", "No hidden fees"],
          industryTerms: ["subscription", "pricing", "plans"],
          pricePoints: ["$29/month", "$99/month", "custom pricing"],
          integrations: [],
          useCases: ["Budget planning", "Feature comparison"],
          callsToAction: ["Start Free Trial", "Contact Sales"],
          trustSignals: ["30-day money back guarantee"],
        },
        summaryGeneratedAt: new Date(),
      },
      {
        adminId,
        url: "https://example.com/page3",
        text: "Contact us for more information about our services. We are here to help.",
        summary: "Contact information and support details",
        filename: "https://example.com/page3",
        createdAt: new Date(),
        // No structuredSummary - this will test the "Generate Summary" button
      },
      {
        adminId,
        url: "https://example.com/page4",
        text: "About our company - we have been serving customers for over 10 years with innovative solutions.",
        summary: "Company information and history",
        filename: "https://example.com/page4",
        createdAt: new Date(),
        // No structuredSummary - this will test the "Generate Summary" button
      },
    ];

    await db.collection("crawled_pages").insertMany(testPages);

    console.log("✅ Test data created successfully!");
    console.log(`📧 Test email: ${email}`);
    console.log(`🔑 API Key: ${apiKey}`);
    console.log(`👤 Admin ID: ${adminId}`);
    console.log(`📄 Created ${testPages.length} test pages:`);
    testPages.forEach((page, i) => {
      console.log(
        `   ${i + 1}. ${page.url} ${
          page.structuredSummary ? "(has summary)" : "(no summary)"
        }`
      );
    });

    await client.close();
  } catch (error) {
    console.error("❌ Error creating test data:", error);
  }
}

createTestData();
