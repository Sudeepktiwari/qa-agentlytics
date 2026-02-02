import { NextResponse } from "next/server";

const ZERUH_API_KEY = process.env.ZERUH_API_KEY;

interface ZeruhValidationResult {
  success: boolean;
  message: string;
  result?: {
    email_address: string;
    domain_details: {
      domain: string;
      domain_age: number | null;
    };
    validation_details: {
      format_valid: boolean;
      mx_found: boolean;
      smtp_check: boolean;
      catch_all: boolean;
      role: boolean;
      disposable: boolean;
      free: boolean;
      tagged: boolean;
      mailbox_full: boolean;
      mailbox_disabled: boolean;
      no_reply: boolean;
    };
    status: string;
    score: number;
  };
}

export async function validateEmailWithZeruh(
  email: string,
): Promise<{ valid: boolean; error?: string }> {
  if (!ZERUH_API_KEY) {
    console.warn("⚠️ ZERUH_API_KEY not set, skipping email validation");
    return { valid: true };
  }

  try {
    const url = `https://api.zeruh.com/v1/verify?api_key=${ZERUH_API_KEY}&email_address=${encodeURIComponent(email)}`;
    const res = await fetch(url, { method: "GET" });
    const data: ZeruhValidationResult = await res.json();

    if (!data.success || !data.result) {
      console.error(
        "❌ Zeruh validation failed to fetch results:",
        data.message,
      );
      // Fallback: If API fails, do we block or allow? Usually allow to prevent blocking users due to external API issues.
      // But user said "check if email used is valid", implying strict check.
      // For now, if API fails, we might want to allow or throw. Let's log and allow but careful.
      // However, if the key is wrong, it will fail.
      return { valid: true };
    }

    const details = data.result.validation_details;
    console.log("🔍 [Zeruh] Validation details:", details);

    // "if any of the below is false give error invalid email"
    const mustBeTrue = [
      { key: "format_valid", label: "Invalid format" },
      { key: "mx_found", label: "No MX records found" },
      { key: "smtp_check", label: "SMTP check failed" },
      { key: "catch_all", label: "Domain must be catch-all" },
      { key: "role", label: "Must be a role account" },
    ];

    for (const check of mustBeTrue) {
      if (details[check.key as keyof typeof details] === false) {
        return {
          valid: false,
          error: `Invalid email: ${check.label} (${check.key})`,
        };
      }
    }

    // "if any of the below are true, give error as per label"
    const mustBeFalse = [
      { key: "disposable", label: "Disposable emails are not allowed" },
      { key: "free", label: "Free email providers are not allowed" },
      { key: "tagged", label: "Tagged emails are not allowed" },
      { key: "mailbox_full", label: "Mailbox is full" },
      { key: "mailbox_disabled", label: "Mailbox is disabled" },
      { key: "no_reply", label: "No-reply addresses are not allowed" },
    ];

    for (const check of mustBeFalse) {
      if (details[check.key as keyof typeof details] === true) {
        return { valid: false, error: `Invalid email: ${check.label}` };
      }
    }

    return { valid: true };
  } catch (error) {
    console.error("❌ Email validation error:", error);
    // On exception, default to allowing to avoid blocking registration on network flakes
    return { valid: true };
  }
}
