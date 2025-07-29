const { MongoClient } = require("mongodb");

async function addSampleData() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/chatbot";
    console.log("Connecting to MongoDB...");

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();

    // Use the same adminId that exists in your system
    const adminId = "admin_672b27f0c80628c25c84c91e";

    // Sample pages with content
    const samplePages = [
      {
        adminId,
        url: "http://localhost:3000/",
        text: "Welcome to our AI-powered chatbot platform! We provide intelligent conversational AI solutions for businesses of all sizes. Our platform offers real-time customer support, lead generation, and automated responses to help streamline your customer interactions. Key features include voice integration, multi-language support, and advanced analytics to track customer engagement. Whether you're a small startup or a large enterprise, our chatbot solutions can be customized to meet your specific needs and integrate seamlessly with your existing systems.",
        filename: "http://localhost:3000/",
        createdAt: new Date(),
      },
      {
        adminId,
        url: "http://localhost:3000/services",
        text: "Our Comprehensive Services: 1. Custom Chatbot Development - We create tailored chatbot solutions that match your business needs and brand voice, ensuring seamless integration with your workflow. 2. AI Integration Services - Seamlessly integrate advanced AI capabilities into your existing systems and platforms. 3. Voice Assistant Development - Build sophisticated voice-enabled assistants for enhanced user experience across multiple channels. 4. Analytics and Reporting - Comprehensive dashboards and detailed reports to track chatbot performance, user interactions, and ROI. 5. 24/7 Technical Support - Round-the-clock technical support and maintenance to ensure your chatbot runs smoothly without interruption.",
        filename: "http://localhost:3000/services",
        createdAt: new Date(),
      },
      {
        adminId,
        url: "http://localhost:3000/pricing",
        text: "Flexible Pricing Plans: Starter Plan ($29/month) - Perfect for small businesses, includes up to 1,000 conversations per month, basic analytics dashboard, email support, and standard integrations. Professional Plan ($99/month) - Ideal for growing companies, includes up to 10,000 conversations, advanced analytics, voice features, priority support, and custom integrations. Enterprise Plan ($299/month) - Designed for large organizations, includes unlimited conversations, custom AI models, dedicated account manager, white-label options, and premium support. All plans include free setup and onboarding, SSL security, mobile optimization, and 99.9% uptime guarantee.",
        filename: "http://localhost:3000/pricing",
        createdAt: new Date(),
      },
      {
        adminId,
        url: "http://localhost:3000/about",
        text: "About Our Company: We are a leading AI technology company specializing in conversational AI solutions and intelligent automation. Founded in 2020 by a team of AI researchers and software engineers, we have successfully helped over 500 companies worldwide improve their customer engagement through intelligent chatbots and virtual assistants. Our mission is to make advanced AI technology accessible and beneficial for businesses of all sizes. We believe in transparent communication, innovative solutions, exceptional customer service, and ethical AI development. Our team consists of experienced developers, AI specialists, UX designers, and customer success managers dedicated to delivering outstanding results.",
        filename: "http://localhost:3000/about",
        createdAt: new Date(),
      },
      {
        adminId,
        url: "http://localhost:3000/contact",
        text: "Contact Information: Ready to get started or have questions about our services? Get in touch with our team for personalized assistance. Email: support@chatbot.com for general inquiries, sales@chatbot.com for new projects. Phone: +1 (555) 123-4567 during business hours. Our headquarters is located at 123 Tech Street, San Francisco, CA 94105. Business hours: Monday-Friday 9AM-6PM PST, Saturday 10AM-2PM PST. For urgent technical support, use our 24/7 live chat feature or submit a priority ticket through our support portal. We typically respond to all inquiries within 2-4 hours during business days.",
        filename: "http://localhost:3000/contact",
        createdAt: new Date(),
      },
    ];

    console.log("Clearing existing sample data...");
    // Clear existing sample data
    await db.collection("crawled_pages").deleteMany({
      adminId,
      url: { $in: samplePages.map((p) => p.url) },
    });
    await db.collection("sitemap_urls").deleteMany({
      adminId,
      url: { $in: samplePages.map((p) => p.url) },
    });

    console.log("Adding sample pages to crawled_pages...");
    // Add to crawled_pages collection
    await db.collection("crawled_pages").insertMany(samplePages);

    console.log("Adding sitemap entries...");
    // Add to sitemap_urls collection
    const sitemapEntries = samplePages.map((page) => ({
      adminId: page.adminId,
      url: page.url,
      crawled: true,
      crawledAt: new Date(),
      addedAt: new Date(),
    }));

    await db.collection("sitemap_urls").insertMany(sitemapEntries);

    await client.close();
    console.log("🎉 Sample data added successfully!");
    console.log("You can now test the widget with these URLs:");
    samplePages.forEach((page) => {
      console.log(`  - ${page.url}`);
    });
  } catch (error) {
    console.error("Error adding sample data:", error);
  }
}

addSampleData();
