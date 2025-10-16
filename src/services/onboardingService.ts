import { getAdminSettings, OnboardingSettings } from "@/lib/adminSettings";
import { createOrUpdateLead } from "@/lib/leads";
import { getChunksByPageUrl, querySimilarChunks } from "@/lib/chroma";
import OpenAI from "openai";

export interface RegistrationResult {
  success: boolean;
  userId?: string;
  error?: string;
  status?: number;
  responseBody?: any;
}

function buildAuthHeader(settings: OnboardingSettings): Record<string, string> {
  const headers: Record<string, string> = {};
  if (settings.apiKey) {
    const headerKey = settings.authHeaderKey || "Authorization";
    headers[headerKey] = settings.apiKey;
  }
  return headers;
}

function resolveUrl(settings: OnboardingSettings): string | null {
  const base = settings.apiBaseUrl || "";
  const endpoint = settings.registerEndpoint || "";

  const isAbsolute = (u: string) => /^https?:\/\//i.test(u);

  // If the endpoint is a full URL, use it directly
  if (endpoint && isAbsolute(endpoint)) {
    return endpoint;
  }

  // If base is a full URL and endpoint provided (relative), combine
  if (base && isAbsolute(base) && endpoint) {
    try {
      const baseStr = base.endsWith("/") ? base : base + "/";
      const epStr = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
      return baseStr + epStr;
    } catch {
      return null;
    }
  }

  // If base is a full URL and endpoint missing, treat base as full registration URL
  if (base && isAbsolute(base) && !endpoint) {
    return base;
  }

  // Missing or invalid URL configuration
  return null;
}

function extractDocKeys(chunks: string[]): string[] {
  const keys = new Set<string>();
  for (const chunk of chunks) {
    const text = (chunk || "").slice(0, 2000);
    const jsonKeyMatches = [...text.matchAll(/\b["']([a-zA-Z_][a-zA-Z0-9_\-]*)["']\s*:/g)];
    for (const m of jsonKeyMatches) {
      const k = m[1];
      if (k && k.length <= 50) keys.add(k);
    }
    const paramMatches = [...text.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_\-]*)\s*=/g)];
    for (const m of paramMatches) {
      const k = m[1];
      if (k && k.length <= 50) keys.add(k);
    }
  }
  return Array.from(keys).slice(0, 50);
}

function inferContentType(chunks: string[]): "application/json" | "application/x-www-form-urlencoded" {
  const hint = chunks.join("\n").toLowerCase();
  if (hint.includes("application/x-www-form-urlencoded") || hint.includes("form-urlencoded")) {
    return "application/x-www-form-urlencoded";
  }
  return "application/json";
}

function buildFieldMappings(docKeys: string[]): Record<string, string> {
  const keysLower = new Set(docKeys.map((k) => k.toLowerCase()));
  const pick = (candidates: string[], fallback: string) => {
    for (const c of candidates) {
      if (keysLower.has(c.toLowerCase())) return c;
    }
    return fallback;
  };
  const mappings: Record<string, string> = {};
  const emailKey = pick(["email", "user_email", "email_address", "mail"], "email");
  const firstNameKey = pick(["first_name", "firstName", "given_name", "fname"], "firstName");
  const lastNameKey = pick(["last_name", "lastName", "surname", "lname"], "lastName");
  const phoneKey = pick(["phone", "phone_number", "mobile", "contact_number"], "phone");
  const companyKey = pick(["company", "organization", "org", "business"], "company");
  const consentKey = pick(["consent", "gdpr_consent", "agree_terms", "accept"], "consent");

  mappings["email"] = emailKey;
  mappings["firstName"] = firstNameKey;
  mappings["lastName"] = lastNameKey;
  mappings["phone"] = phoneKey;
  mappings["company"] = companyKey;
  mappings["consent"] = consentKey;

  return mappings;
}

async function inferRequestFormatFromDocs(adminId: string, docsUrl?: string) {
  let chunks: string[] = [];
  try {
    if (docsUrl) {
      const pageChunks = await getChunksByPageUrl(adminId, docsUrl);
      if (Array.isArray(pageChunks) && pageChunks.length > 0) {
        chunks = pageChunks as string[];
      }
    }
  } catch {}

  if (!chunks || chunks.length === 0) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const embedResp = await openai.embeddings.create({
        input: ["registration required fields and content-type"],
        model: "text-embedding-3-small",
      });
      const embedding = embedResp.data[0].embedding as number[];
      const similar = await querySimilarChunks(embedding, 5, adminId);
      chunks = similar as string[];
    } catch {}
  }

  const docKeys = extractDocKeys(chunks);
  const contentType = inferContentType(chunks);
  const fieldMappings = buildFieldMappings(docKeys);

  return { contentType, fieldMappings };
}

function applyFieldMappings(data: Record<string, any>, mappings: Record<string, string>) {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const targetKey = mappings[key] || key;
    out[targetKey] = value;
  }
  return out;
}

export const onboardingService = {
  async register(data: Record<string, any>, adminId: string): Promise<RegistrationResult> {
    const settings = await getAdminSettings(adminId);
    const onboarding = settings.onboarding || { enabled: false };

    if (!onboarding.enabled) {
      return { success: false, error: "Onboarding is disabled", status: 400 };
    }

    const url = resolveUrl(onboarding);
    if (!url) {
      // Enforce API-only registration: store lead for visibility but return error
      console.log("[Onboarding] No registration URL configured. Storing lead and returning error.");
      try {
        const email = typeof data.email === "string" ? data.email.trim() : "";
        const sessionId = typeof data.sessionId === "string" ? data.sessionId : `onboarding-${Date.now()}`;
        const pageUrl = typeof data.pageUrl === "string" ? data.pageUrl : undefined;

        if (email && adminId) {
          await createOrUpdateLead(
            adminId,
            email,
            sessionId,
            null,
            pageUrl,
            "Onboarding submission without external registration"
          );
        }
      } catch (e) {
        console.log("[Onboarding] Failed to store lead when URL missing:", e);
      }

      return { success: false, error: "Onboarding URL not configured", status: 400 };
    }

    const { contentType, fieldMappings } = await inferRequestFormatFromDocs(adminId, onboarding.docsUrl);
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      ...buildAuthHeader(onboarding),
    };

    // Optional idempotency
    if (onboarding.idempotencyKeyField && data[onboarding.idempotencyKeyField]) {
      headers["Idempotency-Key"] = String(data[onboarding.idempotencyKeyField]);
    }

    const method = "POST";

    // Prepare a safe-to-log version of the payload with sensitive fields redacted
    const rawPayloadForLog = applyFieldMappings(data, fieldMappings);
    const redactKeys = ["password", "pass", "secret", "token", "apikey", "api_key", "key"];
    const safePayloadForLog = Object.fromEntries(
      Object.entries(rawPayloadForLog).map(([k, v]) => {
        const kl = k.toLowerCase();
        const isSensitive = redactKeys.some((rk) => kl.includes(rk));
        return [k, isSensitive ? "***" : v];
      })
    );

    try {
      console.log(
        "[Onboarding] Calling external registration API:",
        {
          url,
          method,
          headerKeyUsed: onboarding.authHeaderKey || "Authorization",
          apiKeyPresent: !!onboarding.apiKey,
        }
      );
      const payload = applyFieldMappings(data, fieldMappings);
      const body = contentType === "application/x-www-form-urlencoded"
        ? new URLSearchParams(Object.entries(payload).reduce((acc, [k, v]) => {
            acc[k] = typeof v === "string" ? v : JSON.stringify(v);
            return acc;
          }, {} as Record<string, string>)).toString()
        : JSON.stringify(payload);

      const res = await fetch(url, {
        method,
        headers,
        body,
      });

      const bodyText = await res.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(bodyText);
      } catch {
        parsed = bodyText;
      }

      if (!res.ok) {
        console.error("[Onboarding] ❌ External registration failed", {
          status: res.status,
          adminId,
          url,
          responseBody: parsed,
          payload: safePayloadForLog,
        });
        return {
          success: false,
          error: typeof parsed === "string" ? parsed : parsed?.error || "Registration failed",
          status: res.status,
          responseBody: parsed,
        };
      }

      // Extract user id if present
      const userId =
        parsed?.userId || parsed?.id || parsed?.data?.id || parsed?.data?.userId || undefined;

      console.log("[Onboarding] ✅ External registration succeeded", {
        status: res.status,
        adminId,
        userId,
      });
      return {
        success: true,
        userId,
        status: res.status,
        responseBody: parsed,
      };
    } catch (error: any) {
      console.error("[Onboarding] ❌ External registration error", {
        adminId,
        url,
        method,
        message: error?.message || String(error),
        stack: error?.stack,
        payload: safePayloadForLog,
      });
      return { success: false, error: error?.message || String(error), status: 500 };
    }
  },
};