import { getAdminSettings, OnboardingSettings, OnboardingField } from "@/lib/adminSettings";
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

export interface AuthResult {
  success: boolean;
  token?: string;
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
  async authenticate(data: Record<string, any>, adminId: string): Promise<AuthResult> {
    const settings = await getAdminSettings(adminId);
    const onboarding = settings.onboarding || { enabled: false };

    if (!onboarding.enabled) {
      return { success: false, error: "Onboarding is disabled", status: 400 };
    }

    // Require an authentication cURL command to be configured
    const authCurl = (onboarding as any).authCurlCommand as string | undefined;
    if (!authCurl || authCurl.trim().length === 0) {
      return { success: false, error: "Authentication cURL not configured", status: 400 };
    }

    const redactKeys = ["password", "pass", "secret", "token", "apikey", "api_key", "key"];

    try {
      const parsed = parseCurlRegistrationSpec(authCurl);
      const url = parsed.url;
      const method = (parsed.method as any) || "POST";
      const contentType = (parsed.contentType as any) || "application/json";

      if (!url) {
        console.error("[Onboarding] ❌ cURL parsing failed for authentication: no URL found", {
          adminId,
          curlSnippet: (authCurl || "").slice(0, 200),
        });
        return { success: false, error: "Auth URL not found in cURL command", status: 400 };
      }

      const headers: Record<string, string> = {
        ...parsed.headers,
        "Content-Type": contentType,
      };

      const { body, keysUsed } = buildBodyFromCurl(parsed, { ...data });

      const safePayloadForLog = Object.fromEntries(
        Object.entries(data).map(([k, v]) => {
          const kl = k.toLowerCase();
          const isSensitive = redactKeys.some((rk) => kl.includes(rk));
          return [k, isSensitive ? "***" : v];
        })
      );

      console.log("[Onboarding] Calling external auth API via cURL:", {
        url,
        method,
        contentType,
        headerKeys: Object.keys(headers),
        headers: redactHeadersForLog(headers),
        payloadKeys: keysUsed,
      });

      const res = await fetch(url as string, { method, headers, body });
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
          if (!parsedResp || typeof parsedResp !== "object") return "Authentication failed";
          const topLevel = (parsedResp as any).error || (parsedResp as any).message;
          const nestedData = (parsedResp as any)?.data?.error || (parsedResp as any)?.data?.message;
          const arrayErrors = Array.isArray((parsedResp as any)?.errors)
            ? (parsedResp as any).errors.map((e: any) => e?.message || e).filter(Boolean).join("; ")
            : undefined;
          return topLevel || nestedData || arrayErrors || "Authentication failed";
        })();

        console.error("[Onboarding] ❌ External authentication failed", {
          status: res.status,
          adminId,
          url,
          responseBody: parsedResp,
          payload: safePayloadForLog,
          errorMessage,
        });
        return { success: false, error: errorMessage, status: res.status, responseBody: parsedResp };
      }

      // Try common token field names
      const token = (() => {
        if (parsedResp && typeof parsedResp === "object") {
          const candidates = [
            (parsedResp as any).token,
            (parsedResp as any).access_token,
            (parsedResp as any).authToken,
            (parsedResp as any).apiKey,
            (parsedResp as any).api_key,
            (parsedResp as any).key,
            (parsedResp as any)?.data?.token,
            (parsedResp as any)?.data?.access_token,
            (parsedResp as any)?.data?.apiKey,
            (parsedResp as any)?.data?.api_key,
            (parsedResp as any)?.data?.key,
          ];
          return candidates.find((t: any) => typeof t === "string" && t.length > 0);
        }
        return undefined;
      })();

      if (!token) {
        console.warn("[Onboarding] ⚠️ Auth response did not include a token field", {
          adminId,
          url,
          responseBodyType: typeof parsedResp,
        });
      }

      console.log("[Onboarding] ✅ External authentication succeeded", {
        status: res.status,
        adminId,
        tokenPresent: !!token,
      });
      return { success: true, status: res.status, token, responseBody: parsedResp };
    } catch (error: any) {
      console.error("[Onboarding] ❌ External authentication error", {
        adminId,
        message: error?.message || String(error),
        stack: error?.stack,
      });
      return { success: false, error: error?.message || String(error), status: 500 };
    }
  },
  async initialSetup(data: Record<string, any>, adminId: string): Promise<RegistrationResult> {
    const settings = await getAdminSettings(adminId);
    const onboarding = settings.onboarding || { enabled: false };

    if (!onboarding.enabled) {
      return { success: false, error: "Onboarding is disabled", status: 400 };
    }

    const redactKeys = ["password", "pass", "secret", "token", "apikey", "api_key", "key"];

    const hasCurl = !!onboarding.initialSetupCurlCommand;
    if (!hasCurl) {
      return { success: false, error: "Initial setup cURL not configured", status: 400 };
    }
    let url: string | null = null;
    let method = onboarding.method || "POST";
    let headers: Record<string, string> = {};
    let contentType: "application/json" | "application/x-www-form-urlencoded" = "application/json";
    const payload: Record<string, any> = { ...data };

    if (hasCurl) {
      const parsed = parseCurlRegistrationSpec(onboarding.initialSetupCurlCommand as string);
      url = parsed.url;
      method = (parsed.method as any) || method;
      contentType = (parsed.contentType as any) || contentType;
      headers = {
        ...parsed.headers,
        "Content-Type": contentType,
      };

      // If auth token was attached to data by the chat flow, set header
      const tokenFromFlow = (data as any).__authToken as string | undefined;
      const headerKey = onboarding.authHeaderKey || "Authorization";
      if (tokenFromFlow) {
        headers[headerKey] = headerKey.toLowerCase() === "authorization" ? `Bearer ${tokenFromFlow}` : tokenFromFlow;
      }

      if (!url) {
        console.error("[Onboarding] ❌ cURL parsing failed for initial setup: no URL found", {
          adminId,
          curlSnippet: (onboarding.initialSetupCurlCommand || "").slice(0, 200),
        });
        return {
          success: false,
          error: "Initial setup URL not found in cURL command",
          status: 400,
        };
      }

      if (onboarding.idempotencyKeyField && data[onboarding.idempotencyKeyField]) {
        headers["Idempotency-Key"] = String(data[onboarding.idempotencyKeyField]);
      }

      const { body, keysUsed } = buildBodyFromCurl(parsed, payload);

      const safePayloadForLog = Object.fromEntries(
        Object.entries(payload).map(([k, v]) => {
          const kl = k.toLowerCase();
          const isSensitive = redactKeys.some((rk) => kl.includes(rk));
          return [k, isSensitive ? "***" : v];
        })
      );

      try {
        console.log("[Onboarding] Calling external initial setup API via cURL:", {
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
            if (!parsedResp || typeof parsedResp !== "object") return "Initial setup failed";
            const topLevel = (parsedResp as any).error || (parsedResp as any).message;
            const nestedData = (parsedResp as any)?.data?.error || (parsedResp as any)?.data?.message;
            const arrayErrors = Array.isArray((parsedResp as any)?.errors)
              ? (parsedResp as any).errors.map((e: any) => e?.message || e).filter(Boolean).join("; ")
              : undefined;
            return topLevel || nestedData || arrayErrors || "Initial setup failed";
          })();

          console.error("[Onboarding] ❌ External initial setup failed", {
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

        console.log("[Onboarding] ✅ External initial setup succeeded", {
          status: res.status,
          adminId,
        });
        return {
          success: true,
          status: res.status,
          responseBody: parsedResp,
        };
      } catch (error: any) {
        console.error("[Onboarding] ❌ External initial setup error", {
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
    return { success: false, error: "Initial setup failed", status: 500 };
  },
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
    let method = onboarding.method || "POST";
    let headers: Record<string, string> = {};
    let contentType: "application/json" | "application/x-www-form-urlencoded" = "application/json";
    let payload: Record<string, any> = { ...data };
    const fn1 = payload.firstName || payload.firstname || payload.given_name || payload.fname || payload.name;
    const ln1 = payload.lastName || payload.lastname || payload.surname || payload.lname;
    if (!payload.name && fn1) {
      payload.name = ln1 ? `${fn1} ${ln1}` : fn1;
    }

    if (hasCurl) {
      const parsed = parseCurlRegistrationSpec(onboarding.curlCommand as string);
      url = parsed.url;
      method = (parsed.method as any) || method;
      contentType = (parsed.contentType as any) || contentType;
      headers = {
        ...parsed.headers,
        "Content-Type": contentType,
      };

      if (!url) {
        console.error("[Onboarding] ❌ cURL parsing failed for registration: no URL found", {
          adminId,
          curlSnippet: (onboarding.curlCommand || "").slice(0, 200),
        });
        return {
          success: false,
          error: "Registration URL not found in cURL command",
          status: 400,
        };
      }

      if (onboarding.idempotencyKeyField && data[onboarding.idempotencyKeyField]) {
        headers["Idempotency-Key"] = String(data[onboarding.idempotencyKeyField]);
      }

      const { body, keysUsed } = buildBodyFromCurl(parsed, payload);

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

        console.log("[Onboarding] ✅ External registration succeeded", {
          status: res.status,
          adminId,
        });
        return {
          success: true,
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

    const baseUrl = resolveUrl(onboarding);
    url = baseUrl;
    if (!url) {
      return { success: false, error: "Registration URL not configured", status: 400 };
    }

    const { contentType: inferredContentType, fieldMappings } = await inferRequestFormatFromDocs(adminId, onboarding.docsUrl);
    contentType = inferredContentType;
    headers = {
      "Content-Type": contentType,
      ...buildAuthHeader(onboarding),
    };

    if (onboarding.idempotencyKeyField && data[onboarding.idempotencyKeyField]) {
      headers["Idempotency-Key"] = String(data[onboarding.idempotencyKeyField]);
    }

    payload = applyFieldMappings(data, fieldMappings);
    const fn2 = payload.firstName || payload.firstname || payload.given_name || payload.fname || payload.name;
    const ln2 = payload.lastName || payload.lastname || payload.surname || payload.lname;
    if (!payload.name && fn2) {
      payload.name = ln2 ? `${fn2} ${ln2}` : fn2;
    }

    const safePayloadForLog = Object.fromEntries(
      Object.entries(payload).map(([k, v]) => {
        const kl = k.toLowerCase();
        const isSensitive = redactKeys.some((rk) => kl.includes(rk));
        return [k, isSensitive ? "***" : v];
      })
    );

    try {
      console.log("[Onboarding] Calling external registration API:", {
        url,
        method,
        headerKeyUsed: onboarding.authHeaderKey || "Authorization",
        apiKeyPresent: !!onboarding.apiKey,
        contentType,
        payloadKeys: Object.keys(payload),
      });
      const body = contentType === "application/x-www-form-urlencoded"
        ? new URLSearchParams(Object.entries(payload).reduce((acc, [k, v]) => {
            acc[k] = typeof v === "string" ? v : JSON.stringify(v);
            return acc;
          }, {} as Record<string, string>)).toString()
        : JSON.stringify(payload);

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

      console.log("[Onboarding] ✅ External registration succeeded", {
        status: res.status,
        adminId,
      });
      return {
        success: true,
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
  },
};

export async function deriveFieldsFromDocsForAdmin(adminId: string, docsUrl?: string): Promise<OnboardingField[]> {
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
  const scoreChunk = (t: string): number => {
    let s = 0;
    if (/register|signup|sign\s*up|create\s*account/i.test(t)) s += 3;
    if (/users?\s*\/register|\bPOST\b[^\n]*\/register/i.test(t)) s += 3;
    if (/email/i.test(t)) s += 2;
    if (/password/i.test(t)) s += 2;
    if (/Content-Type|application\/json|x-www-form-urlencoded/i.test(t)) s += 1;
    return s;
  };
  const sorted = [...chunks]
    .map((c) => ({ c, s: scoreChunk((c || "").slice(0, 2000)) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c);
  const pick = sorted.length > 0 ? sorted.slice(0, Math.min(sorted.length, 3)) : chunks;
  const keys = new Set<string>();
  const addKeysFromText = (text: string) => {
    const t = (text || "").slice(0, 4000);
    const jsonObj = (() => {
      const i = t.indexOf("{");
      if (i === -1) return undefined;
      let depth = 0;
      let inS = false;
      let inD = false;
      let inB = false;
      for (let j = i; j < t.length; j++) {
        const ch = t[j];
        if (ch === "'" && !inD && !inB) inS = !inS;
        else if (ch === '"' && !inS && !inB) inD = !inD;
        else if (ch === "`" && !inS && !inD) inB = !inB;
        if (inS || inD || inB) continue;
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) return t.slice(i, j + 1);
        }
      }
      return undefined;
    })();
    if (jsonObj) {
      try {
        const obj = JSON.parse(jsonObj);
        const walk = (o: any, p: string = "") => {
          if (!o || typeof o !== "object") return;
          if (Array.isArray(o)) {
            for (const it of o) walk(it, p);
            return;
          }
          for (const [k, v] of Object.entries(o)) {
            const kk = p ? `${p}.${k}` : k;
            keys.add(kk);
            if (v && typeof v === "object") walk(v as any, kk);
          }
        };
        walk(obj);
      } catch {}
    }
    const jsonKeyMatches = [...t.matchAll(/\b["']([a-zA-Z_][a-zA-Z0-9_\-]*)["']\s*:/g)];
    for (const m of jsonKeyMatches) keys.add(m[1]);
    const paramMatches = [...t.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_\-]*)\s*=/g)];
    for (const m of paramMatches) keys.add(m[1]);
  };
  for (const chunk of pick) addKeysFromText(chunk || "");
  const filtered = Array.from(keys).filter((k) => !/(^|[-_])(token|session|rounds?|csrf)($|[-_])/i.test(k));
  const toType = (k: string): OnboardingField["type"] => (/email/i.test(k) ? "email" : /phone/i.test(k) ? "phone" : "text");
  const toLabel = (k: string) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return filtered
    .slice(0, 50)
    .map((k) => ({ key: k, label: toLabel(k), required: true, type: toType(k) }));
}

export async function deriveSpecFromDocsForAdmin(
  adminId: string,
  docsUrl?: string
): Promise<{ headers: string[]; body: OnboardingField[]; response: string[] }> {
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
  const score = (t: string): number => {
    let s = 0;
    if (/register|signup|create\s*account|login|authenticate|setup/i.test(t)) s += 3;
    if (/\bPOST\b|\bPUT\b|\bPATCH\b/i.test(t)) s += 2;
    if (/response|returns|sample\s*response|200\s*OK/i.test(t)) s += 2;
    if (/headers?|Content-Type|Authorization|X-API-Key/i.test(t)) s += 2;
    if (/email|password|token/i.test(t)) s += 1;
    return s;
  };
  const texts = [...chunks].map((c) => (c || "").slice(0, 4000));
  const ranked = texts
    .map((t) => ({ t, s: score(t) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.t)
    .slice(0, Math.min(texts.length, 5));

  const headersSet = new Set<string>();
  const headerCandidates = [
    "Content-Type",
    "Authorization",
    "X-API-Key",
    "X-Auth-Token",
    "Accept",
  ];
  for (const t of ranked) {
    for (const h of headerCandidates) {
      if (new RegExp(h, "i").test(t)) headersSet.add(h);
    }
    const colonHeaders = [...t.matchAll(/\b([A-Za-z-]{2,}):\s*[^\n]+/g)].map((m) => m[1]);
    for (const h of colonHeaders) headersSet.add(h);
  }

  const bodyFields = await deriveFieldsFromDocsForAdmin(adminId, docsUrl);

  const respSet = new Set<string>();
  const addRespFromText = (t: string) => {
    const hint = /response|returns|200\s*OK|example\s*response/i.test(t);
    const jsonCandidate = (() => {
      const i = t.indexOf("{");
      if (i === -1) return undefined;
      let d = 0;
      let s1 = false, s2 = false, s3 = false;
      for (let j = i; j < t.length; j++) {
        const ch = t[j];
        if (ch === "'" && !s2 && !s3) s1 = !s1;
        else if (ch === '"' && !s1 && !s3) s2 = !s2;
        else if (ch === "`" && !s1 && !s2) s3 = !s3;
        if (s1 || s2 || s3) continue;
        if (ch === "{") d++;
        else if (ch === "}") { d--; if (d === 0) return t.slice(i, j + 1); }
      }
      return undefined;
    })();
    if (!jsonCandidate) return;
    if (!hint) return;
    try {
      const obj = JSON.parse(jsonCandidate);
      const walk = (o: any) => {
        if (!o || typeof o !== "object") return;
        if (Array.isArray(o)) { for (const it of o) walk(it); return; }
        for (const [k, v] of Object.entries(o)) {
          respSet.add(String(k));
          if (v && typeof v === "object") walk(v as any);
        }
      };
      walk(obj);
    } catch {}
  };
  for (const t of ranked) addRespFromText(t);

  const filteredBody = bodyFields.filter((f) => !/(^|[-_])(token|session|rounds?)($|[-_])/i.test(f.key));
  return {
    headers: Array.from(headersSet).slice(0, 20),
    body: filteredBody,
    response: Array.from(respSet).slice(0, 50),
  };
}