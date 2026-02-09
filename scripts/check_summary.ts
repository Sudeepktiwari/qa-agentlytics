import * as dotenv from "dotenv";
import path from "path";

// Try to load .env.local from project root
const envPath = path.resolve(process.cwd(), ".env.local");
console.log("Loading env from:", envPath);
dotenv.config({ path: envPath });

// Import after env is loaded
const { getDb } = require("../src/lib/mongo");

async function checkSummary() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI not found!");
      process.exit(1);
    }

    const db = await getDb();
    console.log("Connected to DB:", db.databaseName);

    // Check structured_summaries
    const summary = await db
      .collection("structured_summaries")
      .findOne({}, { sort: { _id: -1 } });

    if (!summary) {
      console.log(
        "No structured summary found in structured_summaries collection.",
      );
      // Check crawled_pages as fallback
      const page = await db
        .collection("crawled_pages")
        .findOne(
          { structuredSummary: { $exists: true } },
          { sort: { createdAt: -1 } },
        );
      if (page) {
        console.log("Found summary in crawled_pages for URL:", page.url);
        printSummary(page.structuredSummary);
      } else {
        console.log("No structured summary found in crawled_pages either.");
      }
      return;
    }

    console.log("Found summary in structured_summaries for URL:", summary.url);
    printSummary(summary.structuredSummary);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

function printSummary(structuredSummary: any) {
  if (structuredSummary && structuredSummary.sections) {
    const sections = structuredSummary.sections;
    sections.forEach((sec: any, i: number) => {
      console.log(`Section ${i}: ${sec.sectionName}`);
      if (sec.salesQuestions) {
        sec.salesQuestions.forEach((q: any, j: number) => {
          console.log(`  Sales Q${j}: ${q.question}`);
          if (q.options) {
            q.options.forEach((opt: any, k: number) => {
              if (typeof opt === "string") {
                console.log(`    Opt ${k}: ${opt} (STRING)`);
              } else {
                console.log(`    Opt ${k}: ${opt.label} (OBJECT)`);
                console.log(`      Workflow: ${opt.workflow}`);
                console.log(
                  `      Diagnostic Answer: ${opt.diagnostic_answer ? "Yes" : "No"}`,
                );
                if (opt.diagnostic_answer)
                  console.log(
                    `      > ${opt.diagnostic_answer.slice(0, 50)}...`,
                  );
                console.log(
                  `      Diagnostic Options: ${JSON.stringify(opt.diagnostic_options)}`,
                );
              }
            });
          }
        });
      }
    });
  }
}

checkSummary();
