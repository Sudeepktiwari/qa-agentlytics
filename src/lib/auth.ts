import { getDb } from "@/lib/mongo";

// Utility function to verify API key
export async function verifyApiKey(apiKey: string) {
  if (!apiKey || !apiKey.startsWith("ak_")) {
    return null;
  }

  try {
    const db = await getDb();
    const apiKeys = db.collection("api_keys");
    const keyRecord = await apiKeys.findOne({ apiKey });

    if (!keyRecord) {
      return null;
    }

    return {
      adminId: keyRecord.adminId,
      email: keyRecord.email,
    };
  } catch {
    return null;
  }
}
