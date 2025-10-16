import { getAdminSettings, OnboardingSettings } from "@/lib/adminSettings";
import { parseCurlRegistrationSpec, buildBodyFromCurl, redactHeadersForLog } from "@/lib/curl";
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

    // Sensitive keys we should redact in logs
    const redactKeys = ["password", "pass", "secret", "token", "apikey", "api_key", "key"];

    // Prefer cURL configuration if provided by admin
    const hasCurl = !!onboarding.curlCommand;
    let url: string | null = null;
    let method = "POST";
    let headers: Record<string, string> = {};
    let contentType = "application/json";
    let payload: Record<string, any> = { ...data };

    if (hasCurl) {
      const parsed = parseCurlRegistrationSpec(onboarding.curlCommand as string);
      url = parsed.url;
      method = parsed.method || "POST";
      contentType = parsed.contentType || "application/json";
      headers = {
        ...parsed.headers,
        "Content-Type": contentType,
      };

      // Optional idempotency
      if (onboarding.idempotencyKeyField && data[onboarding.idempotencyKeyField]) {
        headers["Idempotency-Key"] = String(data[onboarding.idempotencyKeyField]);
      }

      // Common fallback: combine first/last into name if relevant
      if (!("name" in payload)) {
        const fn = payload.firstName || (payload as any).first_name || (payload as any).given_name;
        const ln = payload.lastName || (payload as any).last_name || (payload as any).surname;
        if (typeof fn === "string" && fn.trim() && typeof ln === "string" && ln.trim()) {
          payload.name = `${fn.trim()} ${ln.trim()}`;
        }
      }

      // Build body exactly from cURL data keys, substituting collected values
      const { body, keysUsed } = buildBodyFromCurl(parsed, payload);

      // Safe-to-log payload view (keys only) plus redaction
      const safePayloadForLog = Object.fromEntries(
        Object.entries(payload).map(([k, v]) => {
          const kl = k.toLowerCase();
          const isSensitive = redactKeys.some((rk) => kl.includes(rk));
          return [k, isSensitive ? "***" : v];
        })
      );

      try {
        console.log("[Onboarding] Calling external registration API via cURL:", {
          url,
          method,
          contentType,
          headerKeys: Object.keys(headers),
          headers: redactHeadersForLog(headers),
          payloadKeys: keysUsed,
        });

        const res = await fetch(url as string, {
          method,
          headers,
          body,
        });

        const bodyText = await res.text();
        let parsedResp: any = null;
        try {
          parsedResp = JSON.parse(bodyText);
        } catch {
          parsedResp = bodyText;
        }

        if (!res.ok) {
          const errorMessage = (() => {
            if (typeof parsedResp === "string") return parsedResp;
            if (!parsedResp || typeof parsedResp !== "object") return "Registration failed";
            const topLevel = (parsedResp as any).error || (parsedResp as any).message;
            const nestedData = (parsedResp as any)?.data?.error || (parsedResp as any)?.data?.message;
            const arrayErrors = Array.isArray((parsedResp as any)?.errors)
              ? (parsedResp as any).errors.map((e: any) => e?.message || e).filter(Boolean).join("; ")
              : undefined;
            return topLevel || nestedData || arrayErrors || "Registration failed";
          })();

          console.error("[Onboarding] ❌ External registration failed", {
            status: res.status,
            adminId,
            url,
            responseBody: parsedResp,
            payload: safePayloadForLog,
            errorMessage,
          });
          return {
            success: false,
            error: errorMessage,
            status: res.status,
            responseBody: parsedResp,
          };
        }

        const userId =
          parsedResp?.userId || parsedResp?.id || parsedResp?.data?.id || parsedResp?.data?.userId || undefined;

        console.log("[Onboarding] ✅ External registration succeeded", {
          status: res.status,
          adminId,
          userId,
        });
        return {
          success: true,
          userId,
          status: res.status,
          responseBody: parsedResp,
        };
      } catch (error: any) {
        console.error("[Onboarding] ❌ External registration error", {
          adminId,
          url,
          method,
          message: error?.message || String(error),
          stack: error?.stack,
          payload: Object.fromEntries(
            Object.entries(payload).map(([k, v]) => {
              const kl = k.toLowerCase();
              const isSensitive = redactKeys.some((rk) => kl.includes(rk));
              return [k, isSensitive ? "***" : v];
            })
          ),
        });
        return { success: false, error: error?.message || String(error), status: 500 };
      }
    }

    // Fallback: existing docs-based inference path
    url = resolveUrl(onboarding);
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

    const { contentType: inferredContentType, fieldMappings } = await inferRequestFormatFromDocs(adminId, onboarding.docsUrl);
    contentType = inferredContentType;
    headers = {
      "Content-Type": contentType,
      ...buildAuthHeader(onboarding),
    };

    // Optional idempotency
    if (onboarding.idempotencyKeyField && data[onboarding.idempotencyKeyField]) {
      headers["Idempotency-Key"] = String(data[onboarding.idempotencyKeyField]);
    }
    // Build payload according to doc-inferred mappings
    payload = applyFieldMappings(data, fieldMappings);

    // Common fallback: if firstName and lastName exist but name is missing, combine into name
    if (!("name" in payload)) {
      const fn = payload.firstName || payload.first_name || payload.given_name;
      const ln = payload.lastName || payload.last_name || payload.surname;
      if (typeof fn === "string" && fn.trim() && typeof ln === "string" && ln.trim()) {
        payload.name = `${fn.trim()} ${ln.trim()}`;
      }
    }

    // Build safe-to-log payload after final payload shape is determined
    const safePayloadForLog = Object.fromEntries(
      Object.entries(payload).map(([k, v]) => {
        const kl = k.toLowerCase();
        const isSensitive = redactKeys.some((rk) => kl.includes(rk));
        return [k, isSensitive ? "***" : v];
      })
    );

    try {

      // Log call metadata with payload keys for verification
      console.log(
        "[Onboarding] Calling external registration API:",
        {
          url,
          method,
          headerKeyUsed: onboarding.authHeaderKey || "Authorization",
          apiKeyPresent: !!onboarding.apiKey,
          contentType,
          payloadKeys: Object.keys(payload),
        }
      );
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
        const errorMessage = (() => {
          if (typeof parsed === "string") return parsed;
          if (!parsed || typeof parsed !== "object") return "Registration failed";
          const topLevel = (parsed as any).error || (parsed as any).message;
          const nestedData = (parsed as any)?.data?.error || (parsed as any)?.data?.message;
          const arrayErrors = Array.isArray((parsed as any)?.errors)
            ? (parsed as any).errors.map((e: any) => e?.message || e).filter(Boolean).join("; ")
            : undefined;
          return topLevel || nestedData || arrayErrors || "Registration failed";
        })();

        console.error("[Onboarding] ❌ External registration failed", {
          status: res.status,
          adminId,
          url,
          responseBody: parsed,
          payload: safePayloadForLog,
          errorMessage,
        });
        return {
          success: false,
          error: errorMessage,
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