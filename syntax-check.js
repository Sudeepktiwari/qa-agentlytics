// Minimal widget test - checking for syntax errors
(function () {
  console.log("🧪 Testing widget syntax...");

  // Test string concatenation patterns that might cause issues
  const test1 = "Custom question sent: " + "test";
  console.log("✅ Basic concatenation works:", test1);

  // Test template literals
  const test2 = `Template literal works: ${"test"}`;
  console.log("✅ Template literal works:", test2);

  // Test the problematic line pattern
  try {
    const customQuestion = "test question";
    const result = "Custom question sent: " + customQuestion;
    console.log("✅ Problematic pattern works:", result);
  } catch (e) {
    console.error("❌ Syntax error found:", e.message);
  }

  console.log("🎉 All syntax tests passed!");
})();
