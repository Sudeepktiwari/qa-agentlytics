import { getDb } from "@/lib/mongo";

// Utility function to verify API key
export async function verifyApiKey(apiKey: string) {
  if (!apiKey || !apiKey.startsWith("ak_")) {
    return null;
  }

  try {
    const db = await getDb();
    const users = db.collection("users");
    const keyRecord = await users.findOne({ apiKey });

    if (!keyRecord) {
      return null;
    }

    return {
      adminId: keyRecord.adminId || keyRecord._id.toString(), // use ObjectId as adminId if no explicit adminId
      email: keyRecord.email,
    };
  } catch {
    return null;
  }
}
