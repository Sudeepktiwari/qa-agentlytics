import { getDb } from "./mongo";

const MAILEROO_API_KEY = process.env.MAILEROO_API_KEY;
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  "http://localhost:3000";

export async function sendVerificationEmail(
  user: { email: string; name?: string },
  token: string,
) {
  if (!MAILEROO_API_KEY) {
    console.warn("⚠️ MAILEROO_API_KEY is not set. Skipping email sending.");
    return;
  }

  const verificationLink = `${APP_URL}/api/auth/verify-email?token=${token}`;

  try {
    const res = await fetch("https://api.maileroo.com/v1/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAILEROO_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Agentlytics <noreply@agentlytics.com>", // You might want to make this configurable
        to: user.email,
        subject: "Verify your email address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome!</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>Click the link below to verify your email address and activate your account:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a 
                href="${verificationLink}" 
                style="background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600;font-size:16px;"
              >
                Verify Email
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">This link expires in 15 minutes.</p>
            <p style="color: #888; font-size: 12px; margin-top: 30px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Maileroo error:", data);
      throw new Error("Verification email failed to send");
    }

    console.log(`✅ Verification email sent to ${user.email}`);
    return data;
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    // Don't throw here to avoid failing the whole registration if email fails (optional)
    // But usually we want to know. For now, I'll log and rethrow or let it slide depending on preference.
    // The user instruction implies it's critical ("only then user should be able to login"), so I should probably ensure it sends.
    throw error;
  }
}
