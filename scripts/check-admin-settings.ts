import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function checkAdminSettings() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("chatbot");
    const collection = db.collection("adminSettings");

    // Check for default-admin or any admin
    const admins = await collection.find({}).toArray();
    const users = db.collection("users"); // Access users collection

    console.log(`Found ${admins.length} admin settings documents.`);

    for (const admin of admins) {
      console.log(
        `\n--- Admin: ${admin.adminId} (Type: ${typeof admin.adminId}) ---`,
      );
      if (admin.adminId && typeof admin.adminId === "object") {
        console.log(
          `Is ObjectId: ${admin.adminId.constructor.name === "ObjectId"}`,
        );
      }

      // Try to find API Key from users collection if not in settings
      let apiKey = admin.apiKey;
      if (!apiKey) {
        try {
          const user = await users.findOne({
            _id: new ObjectId(admin.adminId),
          });
          if (user && user.apiKey) {
            apiKey = user.apiKey;
          } else if (user && user.apiKeys && user.apiKeys.length > 0) {
            apiKey = user.apiKeys[0];
          }
        } catch (e) {
          // adminId might not be ObjectId
          const user = await users.findOne({ _id: admin.adminId });
          if (user && user.apiKey) apiKey = user.apiKey;
        }
      }

      if (admin.onboarding) {
        console.log("Onboarding Config found.");
        console.log("Enabled:", admin.onboarding.enabled);
        console.log(
          "Closing Message:",
          (admin.onboarding as any).closingMessage,
        );
        console.log("API Key:", apiKey);

        // Check if it's nested or mismatched
        const rawOnboarding = admin.onboarding as any;
        if (rawOnboarding.closingMsg) {
          console.log(
            "⚠️ Found 'closingMsg' (mismatch?):",
            rawOnboarding.closingMsg,
          );
        }
      } else {
        console.log("No onboarding config.");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkAdminSettings();
