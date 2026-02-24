
const puppeteer = require('puppeteer');

async function debugHeaders(url) {
  console.log(`Analyzing headers for: ${url}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));
    
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
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Analyze headers
    const result = await page.evaluate(() => {
      // Remove noise
      const scripts = document.querySelectorAll(
        "script, noscript, nav, footer, aside, .site-header, .site-footer, .navbar, .global-nav, .global-header, .cookie-banner, .newsletter, .modal, .offcanvas"
      );
      scripts.forEach((el) => el.remove());

      const mainHeader = document.querySelector("body > header");
      if (mainHeader && (mainHeader.querySelector("nav") || mainHeader.tagName === "HEADER")) {
        mainHeader.remove();
      }

      const contentSelector = "h1, h2, h3, h4, h5, h6, p, li, blockquote, td, th, div, article, section, dt, summary, legend, span, button, a";
      
      const debugLogs = [];
      const sections = [];
      let currentTitle = "";
      let currentContent = [];
      let sectionCount = 0;
      let lastHeaderElement = null; // We can't pass elements back to node, but logic is inside browser
      const seenBodies = new Set();

      const normalize = (t) => t.replace(/\s+/g, " ").trim();

      const pushSection = () => {
        const rawBody = normalize(currentContent.join(" "));
        if (!rawBody || rawBody.length < 20) {
          debugLogs.push(`Skipping section '${currentTitle}' due to short body (${rawBody.length} chars): ${rawBody.substring(0, 50)}...`);
          currentTitle = "";
          currentContent = [];
          return;
        }

        const key = (currentTitle + "::" + rawBody.slice(0, 300)).toLowerCase();
        if (seenBodies.has(key)) {
          debugLogs.push(`Skipping duplicate section: ${currentTitle}`);
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
        sections.push(`[SECTION ${sectionCount}] ${title}`);
        currentTitle = "";
        currentContent = [];
      };

      const isHeaderElement = (el) => {
        const tagName = el.tagName.toLowerCase();
        const role = el.getAttribute("role");
        const className = typeof el.className === "string" ? el.className : "";
        const text = el.textContent || "";

        if (text.length > 200) return { isHeader: false, reason: "too long" };

        if (/^h[1-6]$/.test(tagName) || ["dt", "summary", "legend"].includes(tagName))
          return { isHeader: true, reason: "tag" };

        if (role === "heading") return { isHeader: true, reason: "role" };

        if (/(\s|^)(section-title|section-header|headline|title|header|heading|h[1-6]|text-(xl|2xl|3xl|4xl|5xl))(\s|$)/i.test(className)) {
          if (el.children.length === 0 || text.length < 100)
             return { isHeader: true, reason: "class" };
        }

        try {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          const fontWeight = style.fontWeight;
          const fontWeightVal = parseInt(fontWeight);
          const isBold = fontWeight === "bold" || fontWeight === "bolder" || (!isNaN(fontWeightVal) && fontWeightVal >= 600);

          if (fontSize >= 24) return { isHeader: true, reason: `fontSize ${fontSize}` };
          if (fontSize >= 18 && isBold) return { isHeader: true, reason: `fontSize ${fontSize} + bold` };
          if ((tagName === "strong" || tagName === "b") && fontSize >= 16) return { isHeader: true, reason: "strong tag" };
          
          return { isHeader: false, reason: `fontSize ${fontSize}, bold ${isBold}` };
        } catch (e) {
          return { isHeader: false, reason: "error" };
        }
      };

      const main = document.querySelector("main") || document.querySelector("[role='main']") || document.body;
      const elements = main.querySelectorAll(contentSelector);

      elements.forEach((el) => {
        // Skip logic for offsetParent for now
        
        const hasChildContentElements = el.querySelector(contentSelector) !== null;
        
        const hasDirectText = Array.from(el.childNodes).some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim().length > 0
        );

        const headerCheck = isHeaderElement(el);

        if (headerCheck.isHeader) {
           // Basic check for nested header (simplified as we can't easily check 'contains' against lastHeaderElement from previous iteration efficiently without keeping ref, which we can do)
           // But 'lastHeaderElement' logic from original code:
           // if (lastHeaderElement && lastHeaderElement.contains(el)) return;
           
           // We need to implement that logic here if we want to match exactly.
           // However, `elements` is a static NodeList. 
           // We can keep track of the last processed header element.
           
           // Wait, we need to define lastHeaderElement outside forEach.
           // Since we can't easily access previous elements in NodeList for checking containment if we don't track them.
           // But we track 'lastHeaderElement'.
           
           // Check if this element is contained in lastHeaderElement
           // We need to access the variable from outer scope.
           // It's tricky because we can't check 'contains' on the variable if it's just a reference? No, it's a DOM element.
           
           // The issue is `lastHeaderElement` is updated.
           
           // Actually, `contains` works fine.
        }
        
        // Let's log potential headers
        if (headerCheck.isHeader) {
           debugLogs.push(`Header candidate: <${el.tagName}> "${el.textContent.substring(0, 30)}..." Reason: ${headerCheck.reason}`);
        }

        if (headerCheck.isHeader) {
           // Check nesting
           // Note: This logic assumes 'lastHeaderElement' is the *immediately preceding* header.
           // But if we have H1 > Span, H1 is processed, then Span is processed.
           // H1 contains Span. So Span should be skipped.
           // But what if H1 is closed, then H2 opens? H1 does not contain H2.
           
           // We need to track the *current* header scope?
           // No, the original logic just checked `lastHeaderElement`.
           
           // Wait, `lastHeaderElement` is updated to `el` at the end of the block.
           // So if H1 is processed, lastHeaderElement = H1.
           // Next element is Span (inside H1). H1 contains Span. Skipped.
           // Next element is P (sibling). H1 does not contain P. Not a header.
           // Next element is H2. H1 does not contain H2. Processed. lastHeaderElement = H2.
           
           // But wait, `elements` contains *all* descendants.
           // So H1 is in elements. Span is in elements.
           // They appear in document order.
           // H1 comes before Span.
           
           // So `lastHeaderElement` logic works for direct containment.
           // BUT, what if H1 > Div > Span?
           // H1 processed.
           // Div processed (not header).
           // Span processed (header?). H1 contains Span. Skipped.
           
           // Wait, `lastHeaderElement` is only updated when we find a NEW header.
           // So if Div is not a header, lastHeaderElement remains H1.
           // So Span is checked against H1. Correct.
           
           // So let's replicate that logic.
           // We need a variable outside forEach.
           // I'll use a property on window or just a closure variable.
           // `let lastHeaderElement = null` is defined above.
           
           if (lastHeaderElement && lastHeaderElement.contains(el)) {
             debugLogs.push(`  -> Skipped nested header inside <${lastHeaderElement.tagName}>`);
             return;
           }

           if (currentTitle || currentContent.length > 0) pushSection();
           currentTitle = el.textContent || "";
           currentContent = [];
           lastHeaderElement = el;
        } else if (!hasChildContentElements) {
           const text = el.textContent || "";
           if (text && text.trim().length > 0) {
             currentContent.push(text);
           }
        } else if (hasDirectText) {
           // Container with text
        }
      });

      if (currentTitle || currentContent.length > 0) pushSection();
      
      return { sections, logs: debugLogs };
    });

    console.log("\n--- Debug Logs ---");
    console.log(result.logs.join("\n"));
    console.log("\n--- Detected Sections ---");
    console.log(result.sections.join("\n"));
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

debugHeaders('https://qa-agentlytics.vercel.app/sales-conversion-ai');
