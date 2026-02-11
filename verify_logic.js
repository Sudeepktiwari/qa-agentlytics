// const { parseSectionBlocks } = require('./src/lib/parsing.ts'); // We'll mock this or read the file
// Mock normalizeStructuredSummary based on what I read
function normalizeStructuredSummary(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const result = { ...raw };
  if (!Array.isArray(result.sections)) {
    result.sections = [];
  }

  // Create a new array for sections
  result.sections = result.sections.map((section) => {
    // Explicitly copy all properties including sectionContent and chunkIndices
    const s = { ...section };

    // Ensure sectionContent is preserved (paranoid check)
    if (section.sectionContent) {
      s.sectionContent = section.sectionContent;
    }

    return s;
  });
  return result;
}

// Mock generateSummaryFromSections logic
async function generateSummaryFromSections(blocks) {
  const sections = blocks.map((block) => {
    return {
      sectionName: block.title,
      sectionContent: block.body, // EXPLICITLY SET HERE
      sectionSummary: "Summary...",
      leadQuestions: [],
      salesQuestions: [],
    };
  });

  const finalSummary = {
    pageType: "test",
    sections,
  };

  const normalized = normalizeStructuredSummary(finalSummary);
  return normalized;
}

// Test Data
const text = `[SECTION 1] Hero
This is the hero section content.

[SECTION 2] Features
This is the features section content.`;

// Mock parseSectionBlocks
function mockParseSectionBlocks(text) {
  const blocks = [];
  const regex =
    /\[SECTION\s+(\d+)\]\s*([^\n]*)\n?([\s\S]*?)(?=(\[SECTION\s+\d+\])|$)/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    blocks.push({
      title: (m[2] || "").trim(),
      body: (m[3] || "").trim(),
    });
  }
  return blocks;
}

async function run() {
  const blocks = mockParseSectionBlocks(text);
  console.log("Blocks:", blocks);

  const summary = await generateSummaryFromSections(blocks);
  console.log("Summary Sections:", JSON.stringify(summary.sections, null, 2));

  if (
    summary.sections[0].sectionContent === "This is the hero section content."
  ) {
    console.log("SUCCESS: sectionContent preserved.");
  } else {
    console.log("FAILURE: sectionContent missing or incorrect.");
  }
}

run();
