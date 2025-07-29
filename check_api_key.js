require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function checkApiKey() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("chatbot_db");
    const users = db.collection("users");

    const apiKey =
      "ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345";
    const user = await users.findOne({ apiKey });

    if (user) {
      console.log("Found user:", user);
      console.log("Real adminId (_id):", user._id.toString());
    } else {
      console.log("No user found with this API key");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkApiKey();
