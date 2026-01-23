import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.advancelytics.com";
  const lastModified = new Date();

  const routes = [
    "",
    "/about",
    "/pricing",
    "/contact",
    "/services",
    "/developers",
    "/knowledge-base",
    "/ai-chatbots",
    "/bant-based-qualification",
    "/behavioral-trigger",
    "/built-in-scheduling",
    "/crm-and-analytics-sync",
    "/customer-support-ai",
    "/cx-analytics-dashboard",
    "/knowledge-automation",
    "/lead-generation-basics",
    "/multipersona",
    "/onboarding-ai-bot",
    "/onboarding-automation",
    "/sales-conversion-ai",
    "/shopify",
    "/agentlytics+drift",
    "/agentlytics+agentforce",
    "/agentlytics+freshworks",
    "/agentlytics+hubspot",
    "/agentlytics+intercom",
    "/agentlytics+zoho",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
