import { getUsersCollection } from "@/lib/mongo";

// Utility function to verify API key
export async function verifyApiKey(apiKey: string) {
  if (!apiKey || !apiKey.startsWith("ak_")) {
    return null;
  }

  try {
    const users = await getUsersCollection();
    const user = await users.findOne({ apiKey });

    if (!user) {
      return null;
    }

    return {
      adminId: user._id.toString(),
      email: user.email,
    };
  } catch {
    return null;
  }
}
