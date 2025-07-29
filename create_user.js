require("dotenv").config({ path: ".env.local" });
const { MongoClient, ObjectId } = require("mongodb");

async function createUser() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("chatbot_db");
    const users = db.collection("users");

    const apiKey =
      "ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345";

    // Check if user already exists
    const existingUser = await users.findOne({ apiKey });
    if (existingUser) {
      console.log("User already exists:", existingUser);
      return existingUser._id.toString();
    }

    // Create new user
    const result = await users.insertOne({
      email: "test@example.com",
      apiKey: apiKey,
      name: "Test User",
      createdAt: new Date(),
    });

    console.log("Created user with _id:", result.insertedId.toString());
    return result.insertedId.toString();
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

createUser();
