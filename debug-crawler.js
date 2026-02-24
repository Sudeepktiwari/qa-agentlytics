const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://qa-agentlytics.vercel.app/sales-conversion-ai';
  console.log(`Crawling ${url}...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Wait for content
    await new Promise(r => setTimeout(r, 5000));

    // Scroll
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    
    await new Promise(r => setTimeout(r, 2000));

    // Analyze elements
    const result = await page.evaluate(() => {
      const logs = [];
      const sections = [];
      
      // Remove noise
      const scripts = document.querySelectorAll(
        "script, noscript, nav, footer, aside, .site-header, .site-footer, .navbar, .global-nav, .global-header, .cookie-banner, .newsletter, .modal, .offcanvas"
      );
      scripts.forEach((el) => el.remove());

      const mainHeader = document.querySelector("body > header");
      if (mainHeader && (mainHeader.querySelector("nav") || mainHeader.tagName === "HEADER")) {
        mainHeader.remove();
      }

      // Exact isHeaderElement logic from sitemap/route.ts
      const isHeaderElement = (el) => {
        const tagName = el.tagName.toLowerCase();
        const role = el.getAttribute("role");
        const className = typeof el.className === "string" ? el.className : "";
        const text = el.textContent || "";

        if (text.length > 200) return false;

        if (/^h[1-6]$/.test(tagName) || ["dt", "summary", "legend"].includes(tagName)) return true;
        if (role === "heading") return true;

        if (/(\s|^)(section-title|section-header|headline|title|header|heading|h[1-6]|text-(xl|2xl|3xl|4xl|5xl))(\s|$)/i.test(className)) {
          return el.children.length === 0 || text.length < 100;
        }

        try {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          const fontWeight = style.fontWeight;
          const fontWeightVal = parseInt(fontWeight);
          const isBold = fontWeight === "bold" || fontWeight === "bolder" || (!isNaN(fontWeightVal) && fontWeightVal >= 600);

          if (fontSize >= 24) return { match: true, reason: `fontSize ${fontSize} >= 24` };
          if (fontSize >= 18 && isBold) return { match: true, reason: `fontSize ${fontSize} >= 18 & bold` };
          if ((tagName === "strong" || tagName === "b") && fontSize >= 16) return { match: true, reason: `strong/b & fontSize ${fontSize}` };
        } catch (e) {}

        return false;
      };

      const main = document.querySelector("main") || document.querySelector("[role='main']") || document.body;
      const contentSelector = "h1, h2, h3, h4, h5, h6, p, li, blockquote, td, th, div, article, section, dt, summary, legend, button, a, span, strong, b";
      
      const elements = main.querySelectorAll(contentSelector);
      
      let currentTitle = "";
      let currentContent = [];
      let sectionCount = 0;
      
      const normalize = (t) => t.replace(/\s+/g, " ").trim();
      const seenBodies = new Set();

      const pushSection = () => {
        const rawBody = normalize(currentContent.join(" "));
        if (!rawBody || rawBody.length < 20) {
          currentTitle = "";
          currentContent = [];
          return;
        }
        
        const key = (currentTitle + "::" + rawBody.slice(0, 300)).toLowerCase();
        if (seenBodies.has(key)) {
          currentTitle = "";
          currentContent = [];
          return;
        }
        seenBodies.add(key);

        let title = normalize(currentTitle);
        if (!title) {
          title = rawBody.split(".")[0].split(" ").slice(0, 8).join(" ");
        }

        sectionCount++;
        sections.push(`[SECTION ${sectionCount}] ${title}\n${rawBody.substring(0, 100)}...`);
        currentTitle = "";
        currentContent = [];
      };

      elements.forEach((el) => {
        // Skip hidden (simple check)
        if (el.offsetParent === null) return;
        
        // Skip if already processed via parent
        // (Simplified logic for debug: we process everything in order)
        
        // Check header
        const headerCheck = isHeaderElement(el);
        const isHeader = headerCheck === true || (typeof headerCheck === 'object' && headerCheck.match);
        const reason = typeof headerCheck === 'object' ? headerCheck.reason : (isHeader ? 'tag/class' : 'none');
        
        const text = normalize(el.textContent || "");
        if (!text) return;

        logs.push({
          tag: el.tagName,
          class: el.className,
          text: text.substring(0, 50),
          isHeader,
          reason,
          fontSize: window.getComputedStyle(el).fontSize,
          fontWeight: window.getComputedStyle(el).fontWeight
        });

        if (isHeader) {
          if (currentTitle || currentContent.length > 0) pushSection();
          currentTitle = text;
          currentContent = [];
        } else {
          // Avoid duplicating text if parent already captured it? 
          // The original logic handles this by checking children. 
          // For debug, we just want to see if HEADERS are detected.
          currentContent.push(text);
        }
      });
      
      if (currentTitle || currentContent.length > 0) pushSection();

      return { logs, sections };
    });

    console.log("--- DEBUG LOGS (First 50 elements) ---");
    result.logs.slice(0, 50).forEach(l => {
      console.log(`[${l.isHeader ? 'HEADER' : 'TEXT'}] <${l.tag} class="${l.class}"> (${l.reason}) | Size: ${l.fontSize} | Text: "${l.text}"`);
    });

    console.log("\n--- SECTIONS FOUND ---");
    console.log(`Total Sections: ${result.sections.length}`);
    result.sections.forEach(s => console.log(s));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
})();
