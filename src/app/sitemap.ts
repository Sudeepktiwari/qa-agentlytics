import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://agentlytics.advancelytics.com";
  const lastModified = new Date();

  const routes = [
    "/",
    "/about/",
    "/pricing/",
    "/contact/",
    "/services/",
    "/developers/",
    "/knowledge-base/",
    "/ai-chatbots/",
    "/bant-based-qualification/",
    "/behavioral-trigger/",
    "/built-in-scheduling/",
    "/crm-and-analytics-sync/",
    "/customer-support-ai/",
    "/cx-analytics-dashboard/",
    "/knowledge-automation/",
    "/lead-generation-basics/",
    "/multipersona/",
    "/onboarding-ai-bot/",
    "/onboarding-automation/",
    "/sales-conversion-ai/",
    "/shopify/",
    "/agentlytics+drift/",
    "/agentlytics+agentforce/",
    "/agentlytics+freshworks/",
    "/agentlytics+hubspot/",
    "/agentlytics+intercom/",
    "/agentlytics+zoho/",
    "/demo/",
  ];

  // Dynamically add help articles
  try {
    const helpDir = path.join(process.cwd(), "src/app/help");
    if (fs.existsSync(helpDir)) {
      // Add main help page
      if (fs.existsSync(path.join(helpDir, "page.tsx"))) {
        routes.push("/help/");
      }

      // Add sub-pages
      const items = fs.readdirSync(helpDir, { withFileTypes: true });
      for (const item of items) {
        if (
          item.isDirectory() &&
          fs.existsSync(path.join(helpDir, item.name, "page.tsx"))
        ) {
          routes.push(`/help/${item.name}/`);
        }
      }
    }
  } catch (e) {
    console.error("Error generating dynamic sitemap routes:", e);
  }

  // Deduplicate routes
  const uniqueRoutes = Array.from(new Set(routes));

  return uniqueRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
