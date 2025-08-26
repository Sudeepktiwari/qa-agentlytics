// Enhanced Content Detection Test Script
// This script tests the improved content detection capabilities

(function () {
  console.log("🧪 Testing Enhanced Content Detection...");

  // Remove any existing widgets
  document.querySelectorAll('[id*="chatbot"], [id*="widget"]').forEach((el) => {
    console.log("🗑️ Removing existing widget:", el);
    el.remove();
  });

  // Create script element with enhanced detection
  const script = document.createElement("script");
  script.src = "https://sample-chatbot-nine.vercel.app/api/widget";

  // Set essential attributes
  script.setAttribute(
    "data-api-key",
    "ak_e9c3475fd9b9371577ab09f5a0a7fcd1c635ef055b7e66374ed424162d80c9ac"
  );
  script.setAttribute("data-theme", "blue");
  script.setAttribute("data-size", "large");
  script.setAttribute("data-enhanced-detection", "true");

  // Log what we're testing
  console.log("📜 Creating script with enhanced content detection:");
  console.log("  src:", script.src);
  console.log("  data-api-key:", script.getAttribute("data-api-key"));
  console.log("  Enhanced Detection: ENABLED");

  // Add event handlers
  script.onload = function () {
    console.log("✅ Enhanced widget loaded successfully!");

    // Test content detection after widget loads
    setTimeout(() => {
      console.log("🔍 Testing enhanced content detection capabilities...");

      // Test if widget can detect current page content
      if (window.appointyWidget && window.appointyWidget.getViewportContent) {
        const content = window.appointyWidget.getViewportContent();
        console.log("📊 Detected content summary:", content.contentSummary);
        console.log(
          "📋 Visible elements found:",
          content.visibleElements.length
        );

        // Show enhanced element detection
        const elementTypes = content.visibleElements.map((el) => ({
          type: el.contentType,
          isCTA: el.isCTA,
          isPricing: el.isPricing,
          isFeature: el.isFeature,
          text: el.text.substring(0, 50) + "...",
        }));

        console.table(elementTypes);

        console.log("🎯 Content Intelligence:");
        console.log("  - Pricing detected:", content.contentSummary.hasPricing);
        console.log("  - CTAs detected:", content.contentSummary.hasCTA);
        console.log(
          "  - Features detected:",
          content.contentSummary.hasFeatures
        );
        console.log(
          "  - Testimonials detected:",
          content.contentSummary.hasTestimonials
        );
        console.log("  - Media detected:", content.contentSummary.hasMedia);
      } else {
        console.warn("⚠️ Widget API not available for testing");
      }
    }, 2000);
  };

  script.onerror = function (error) {
    console.error("❌ Enhanced widget failed to load:", error);
  };

  // Add to DOM
  document.head.appendChild(script);
  console.log(
    "🚀 Enhanced widget script added to DOM. Testing content detection..."
  );

  // Check for widget initialization after a delay
  setTimeout(() => {
    const widget = document.querySelector('[id*="chatbot"], [id*="widget"]');
    if (widget) {
      console.log("🎉 Enhanced widget found in DOM:", widget);
      console.log("🔬 Enhanced content detection should now be active!");
    } else {
      console.warn("⚠️ Enhanced widget not found in DOM after 5 seconds");
    }
  }, 5000);
})();
