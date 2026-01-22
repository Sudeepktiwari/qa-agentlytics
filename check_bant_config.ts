import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/sample-chatbot";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("sample-chatbot"); // Assuming default db name if not in URI
    // Check all bant configs
    const configs = await db.collection("bant_configurations").find({}).toArray();
    console.log("Found BANT configs:", JSON.stringify(configs, null, 2));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
