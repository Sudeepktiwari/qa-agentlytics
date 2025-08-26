// Test widget injection after reset
// This should work with the reset commit 5e2c9d7

(function () {
  console.log("🧪 Testing widget injection after reset...");

  // Remove any existing widgets
  document.querySelectorAll('[id*="chatbot"], [id*="widget"]').forEach((el) => {
    console.log("🗑️ Removing existing widget:", el);
    el.remove();
  });

  // Create script element
  const script = document.createElement("script");
  script.src = "https://sample-chatbot-nine.vercel.app/api/widget";

  // Set essential attributes
  script.setAttribute(
    "data-api-key",
    "ak_e9c3475fd9b9371577ab09f5a0a7fcd1c635ef055b7e66374ed424162d80c9ac"
  );
  script.setAttribute("data-theme", "blue");
  script.setAttribute("data-size", "large");

  // Log what we're doing
  console.log("📜 Creating script element with:");
  console.log("  src:", script.src);
  console.log("  data-api-key:", script.getAttribute("data-api-key"));
  console.log("  data-theme:", script.getAttribute("data-theme"));

  // Add event handlers
  script.onload = function () {
    console.log("✅ Widget script loaded successfully!");
  };

  script.onerror = function (error) {
    console.error("❌ Widget script failed to load:", error);
  };

  // Add to DOM
  document.head.appendChild(script);
  console.log("🚀 Script added to DOM. Waiting for widget to initialize...");

  // Check for widget initialization after a delay
  setTimeout(() => {
    const widget = document.querySelector('[id*="chatbot"], [id*="widget"]');
    if (widget) {
      console.log("🎉 Widget found in DOM:", widget);
    } else {
      console.warn("⚠️ Widget not found in DOM after 3 seconds");
    }
  }, 3000);
})();
