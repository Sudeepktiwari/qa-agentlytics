import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import path from "path";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Mock formatMainText from route.ts
function formatMainText(text: string): string {
  if (typeof text !== "string") return text;
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>")
    .trim();
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    const db = client.db("chatbot");
    const adminSettings = db.collection("adminSettings");

    const adminId = "696f2e5be447e8e99df153ea";
    const allSettings = await adminSettings
      .find({}, { projection: { adminId: 1 } })
      .toArray();
    console.log(
      "Available adminIds:",
      allSettings.map((s) => s.adminId),
    );

    const settings = await adminSettings.findOne({ adminId: adminId });

    if (!settings) {
      console.error("Settings not found for admin:", adminId);
      return;
    }

    const onboardingConfig = settings.onboarding;
    console.log(
      "Onboarding Config loaded:",
      JSON.stringify(onboardingConfig, null, 2),
    );

    const closingMsg = (onboardingConfig as any)?.closingMessage;
    console.log("[DEBUG] closingMsg:", closingMsg);

    const externalMsg2 = undefined; // Simulate no external message
    const baseMsg = externalMsg2
      ? `✅ ${externalMsg2}`
      : "✅ You’re all set! Your account has been created.";

    const resp = {
      mainText: formatMainText(
        closingMsg ? `${baseMsg}\n\n${closingMsg}` : baseMsg,
      ),
      buttons: ["Log In", "Talk to Sales"],
      emailPrompt: "",
      showBookingCalendar: false,
      onboardingAction: "completed",
    };

    console.log("Final Response MainText:");
    console.log(resp.mainText);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

run();
