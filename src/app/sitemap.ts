import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const baseUrl = "https://agentlytics.advancelytics.com";

// Directories to exclude from sitemap
const EXCLUDED_DIRS = [
  "api",
  "admin",
  "sa", // Super admin
  "test",
  "components",
  "lib",
  "services",
  "hooks",
  "types",
  "utils",
  "styles",
];

function getRoutes(dir: string, baseRoute: string = ""): string[] {
  const routes: string[] = [];
  
  if (!fs.existsSync(dir)) return routes;

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      const name = item.name;
      
      // Skip hidden files, dynamic routes (start with [), route groups (start with (), and private folders (start with _)
      if (
        name.startsWith(".") || 
        name.startsWith("[") || 
        name.startsWith("(") || 
        name.startsWith("_")
      ) continue;
      
      // Check exclusion list (only for top-level mostly, but good to check always if meaningful)
      // We mainly care about top-level exclusions like 'api' or 'admin'
      if (baseRoute === "" && EXCLUDED_DIRS.includes(name)) continue;

      const fullPath = path.join(dir, name);
      const routePath = `${baseRoute}/${name}`;

      // Check if this directory has a page.tsx (it's a valid route)
      if (fs.existsSync(path.join(fullPath, "page.tsx"))) {
        routes.push(routePath + "/");
      }

      // Recurse to find nested pages (e.g. /help/onboarding-setup)
      routes.push(...getRoutes(fullPath, routePath));
    }
  }
  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // 1. Root page
  const routes = ["/"];

  // 2. Auto-discover pages from src/app
  try {
    const appDir = path.join(process.cwd(), "src/app");
    if (fs.existsSync(appDir)) {
      routes.push(...getRoutes(appDir));
    }
  } catch (error) {
    console.error("Error auto-discovering sitemap routes:", error);
    // Fallback to basic routes if something goes wrong
    routes.push("/about/", "/pricing/", "/contact/"); 
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
