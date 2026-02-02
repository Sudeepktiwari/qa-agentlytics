const { MongoClient } = require("mongodb");

function normalizeStructuredSummary(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const result = { ...raw };
  if (!Array.isArray(result.sections)) {
    if (result.sections && typeof result.sections === "object") {
      result.sections = [result.sections];
    } else {
      result.sections = [];
    }
  }
  result.sections = result.sections.map((section) => {
    const s = { ...section };
    if (s.leadQuestions && !Array.isArray(s.leadQuestions)) {
      s.leadQuestions = [s.leadQuestions];
    }
    if (!Array.isArray(s.leadQuestions)) {
      const arr = [];
      if (s.leadQuestion) {
        arr.push({
          question: s.leadQuestion,
          options: Array.isArray(s.leadOptions) ? s.leadOptions : [],
          tags: Array.isArray(s.leadTags) ? s.leadTags : [],
          workflow:
            typeof s.leadWorkflow === "string" ? s.leadWorkflow : "legacy",
        });
      }
      s.leadQuestions = arr;
    } else {
      s.leadQuestions = s.leadQuestions.map((q) => ({
        question: q && q.question ? q.question : "",
        options: Array.isArray(q && q.options) ? q.options : [],
        tags: Array.isArray(q && q.tags) ? q.tags : [],
        workflow: typeof (q && q.workflow) === "string" ? q.workflow : "",
      }));
    }
    if (s.salesQuestions && !Array.isArray(s.salesQuestions)) {
      s.salesQuestions = [s.salesQuestions];
    }
    if (!Array.isArray(s.salesQuestions)) {
      const arr = [];
      if (s.salesQuestion) {
        arr.push({
          question: s.salesQuestion,
          options: Array.isArray(s.salesOptions) ? s.salesOptions : [],
          tags: Array.isArray(s.salesTags) ? s.salesTags : [],
          workflow:
            typeof s.salesWorkflow === "string"
              ? s.salesWorkflow
              : "diagnostic_response",
        });
      }
      s.salesQuestions = arr;
    } else {
      s.salesQuestions = s.salesQuestions.map((q) => ({
        question: q && q.question ? q.question : "",
        options: Array.isArray(q && q.options) ? q.options : [],
        tags: Array.isArray(q && q.tags) ? q.tags : [],
        workflow:
          typeof (q && q.workflow) === "string"
            ? q.workflow
            : "diagnostic_response",
      }));
    }
    return s;
  });
  return result;
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("crawled_pages");
    const cursor = collection.find({
      structuredSummary: { $exists: true },
    });
    let processed = 0;
    let updated = 0;
    // eslint-disable-next-line no-await-in-loop
    while (await cursor.hasNext()) {
      // eslint-disable-next-line no-await-in-loop
      const doc = await cursor.next();
      if (!doc || !doc.structuredSummary) {
        continue;
      }
      const normalized = normalizeStructuredSummary(doc.structuredSummary);
      const before = JSON.stringify(doc.structuredSummary);
      const after = JSON.stringify(normalized);
      if (before !== after) {
        // eslint-disable-next-line no-await-in-loop
        await collection.updateOne(
          { _id: doc._id },
          { $set: { structuredSummary: normalized } },
        );
        updated += 1;
      }
      processed += 1;
    }
    console.log(
      JSON.stringify({
        processed,
        updated,
      }),
    );
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();

