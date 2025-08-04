// Debug script to check persona extraction data
// Run this with: node debug-persona-extraction.js

console.log("🔍 Persona Extraction Debug Script");
console.log("=====================================");

// Check environment variables
console.log("\n1. Environment Variables:");
console.log(
  "OPENAI_API_KEY:",
  process.env.OPENAI_API_KEY ? "✅ Set" : "❌ Missing"
);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Missing");

// If we're in a Next.js environment, we can check the database
if (process.env.MONGODB_URI) {
  checkDatabase();
} else {
  console.log("\n❌ Cannot check database - MONGODB_URI not set");
  console.log("Please ensure environment variables are configured");
}

async function checkDatabase() {
  try {
    console.log("\n2. Database Connection Test:");

    // Use the same mongo connection as the app
    const { MongoClient } = require("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI);

    await client.connect();
    console.log("✅ MongoDB connection successful");

    const db = client.db("test"); // Same as getDb() function

    // Check for crawled pages
    console.log("\n3. Crawled Content Check:");
    const crawledPages = await db
      .collection("crawled_pages")
      .find({})
      .toArray();
    console.log(`Found ${crawledPages.length} crawled pages`);

    if (crawledPages.length > 0) {
      console.log("✅ Crawled content available");
      console.log("Sample page:", {
        url: crawledPages[0].url,
        title: crawledPages[0].title,
        contentLength: crawledPages[0].text?.length || 0,
        adminId: crawledPages[0].adminId,
      });

      // Check for admin with crawled content
      const adminIds = [...new Set(crawledPages.map((p) => p.adminId))];
      console.log(`Content from ${adminIds.length} admin(s):`, adminIds);
    } else {
      console.log("❌ No crawled content found");
      console.log(
        "Solution: Go to Admin Panel → Sitemap and crawl your website first"
      );
    }

    // Check existing personas
    console.log("\n4. Existing Personas Check:");
    const personas = await db
      .collection("customer_personas")
      .find({})
      .toArray();
    console.log(`Found ${personas.length} persona records`);

    if (personas.length > 0) {
      personas.forEach((persona, i) => {
        console.log(`Persona ${i + 1}:`, {
          adminId: persona.adminId,
          websiteUrl: persona.websiteUrl,
          targetAudiences: persona.targetAudiences?.length || 0,
          extractedAt: persona.extractedAt,
        });
      });
    }

    // Check admins
    console.log("\n5. Admin Users Check:");
    const admins = await db.collection("users").find({}).toArray();
    console.log(`Found ${admins.length} admin users`);

    if (admins.length > 0) {
      admins.forEach((admin, i) => {
        console.log(`Admin ${i + 1}:`, {
          email: admin.email,
          adminId: admin._id.toString(),
          hasToken: !!admin.token,
        });
      });
    }

    await client.close();

    console.log("\n📋 Summary & Recommendations:");
    if (crawledPages.length === 0) {
      console.log("❌ MAIN ISSUE: No crawled content found");
      console.log(
        "🔧 SOLUTION: Crawl your website first using the sitemap feature"
      );
    } else if (!process.env.OPENAI_API_KEY) {
      console.log("❌ MAIN ISSUE: OpenAI API key missing");
      console.log("🔧 SOLUTION: Set OPENAI_API_KEY environment variable");
    } else {
      console.log("✅ Prerequisites met - persona extraction should work");
      console.log("🔧 Try the auto-extract button in the admin panel");
    }
  } catch (error) {
    console.error("\n❌ Database check failed:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.log(
        "🔧 SOLUTION: Start your MongoDB server or check MONGODB_URI"
      );
    } else if (error.message.includes("authentication")) {
      console.log(
        "🔧 SOLUTION: Check MongoDB connection string and credentials"
      );
    }
  }
}

// Test persona extraction logic
async function testPersonaExtraction() {
  if (!process.env.OPENAI_API_KEY) {
    console.log("\n❌ Cannot test OpenAI - API key missing");
    return;
  }

  console.log("\n6. OpenAI API Test:");

  try {
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const testContent = [
      "URL: https://example.com\nTitle: Scheduling Software for Small Businesses\nContent: Our appointment scheduling software helps small business owners manage their calendars, reduce no-shows, and improve customer experience.",
    ];

    const prompt = `Test prompt: Extract customer personas from this content: ${testContent[0]}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are testing persona extraction. Return a simple JSON object.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    console.log("✅ OpenAI API connection successful");
    console.log(
      "Response length:",
      completion.choices[0].message.content?.length || 0
    );
  } catch (error) {
    console.error("❌ OpenAI API test failed:", error.message);

    if (error.message.includes("API key")) {
      console.log("🔧 SOLUTION: Check your OpenAI API key");
    } else if (error.message.includes("quota")) {
      console.log("🔧 SOLUTION: Check your OpenAI API usage limits");
    }
  }
}

// Run OpenAI test if API key is available
if (process.env.OPENAI_API_KEY) {
  testPersonaExtraction();
}

console.log("\n🎯 To fix the persona extraction issue:");
console.log("1. Ensure website content is crawled (use sitemap feature)");
console.log("2. Verify OpenAI API key is set and has GPT-4 access");
console.log("3. Check admin authentication is working");
console.log("4. Try the auto-extract button again");
console.log(
  "\n📄 See persona-extraction-debug.html for detailed troubleshooting"
);
