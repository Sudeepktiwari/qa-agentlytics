import {
  getAdminSettings,
  OnboardingSettings,
  OnboardingField,
} from "@/lib/adminSettings";
import {
  parseCurlRegistrationSpec,
  buildBodyFromCurl,
  redactHeadersForLog,
  extractBodyKeysFromCurl,
} from "@/lib/curl";
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
  tokenType?: "token" | "apiKey";
  error?: string;
  status?: number;
  responseBody?: any;
  debug?: {
    request?: {
      url?: string;
      method?: string;
      contentType?: string;
      headerKeys?: string[];
      headers?: Record<string, string>;
      payloadKeys?: string[];
      payload?: Record<string, any>;
    };
    response?: any;
  };
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

function resolveInitialSetupUrl(settings: OnboardingSettings): string | null {
  const base = settings.apiBaseUrl || "";
  const endpoint = (settings as any).initialSetupEndpoint || "";
  const isAbsolute = (u: string) => /^https?:\/\//i.test(u);
  if (endpoint && isAbsolute(endpoint)) {
    return endpoint;
  }
  if (base && isAbsolute(base) && endpoint) {
    try {
      const baseStr = base.endsWith("/") ? base : base + "/";
      const epStr = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
      return baseStr + epStr;
    } catch {
      return null;
    }
  }
  if (base && isAbsolute(base) && !endpoint) {
    return base;
  }
  return null;
}

function applyRegistrationFieldDefaults(
  payload: Record<string, any>,
  settings: OnboardingSettings,
): Record<string, any> {
  const fields = (settings.registrationFields || []) as OnboardingField[];
  if (!fields || fields.length === 0) {
    return payload;
  }
  const next: Record<string, any> = { ...payload };
  for (const field of fields) {
    const key = field.key;
    if (!key) continue;
    const hasDefault =
      typeof field.defaultValue === "string" &&
      field.defaultValue.trim().length > 0;
    if (!hasDefault) continue;
    if (field.required) continue;
    const current = next[key];
    const hasValue =
      current !== undefined &&
      current !== null &&
      (typeof current !== "string" || current.trim().length > 0);
    if (!hasValue) {
      next[key] = field.defaultValue;
    }
  }
  return next;
}

function applyInitialFieldDefaults(
  payload: Record<string, any>,
  settings: OnboardingSettings,
): Record<string, any> {
  const fields = (settings.initialFields || []) as OnboardingField[];
  if (!fields || fields.length === 0) {
    return payload;
  }
  const next: Record<string, any> = { ...payload };
  for (const field of fields) {
    const key = field.key;
    if (!key) continue;
    const hasDefault =
      typeof field.defaultValue === "string" &&
      field.defaultValue.trim().length > 0;
    if (!hasDefault) continue;
    if (field.required) continue;
    const current = next[key];
    const hasValue =
      current !== undefined &&
      current !== null &&
      (typeof current !== "string" || current.trim().length > 0);
    if (!hasValue) {
      next[key] = field.defaultValue;
    }
  }
  return next;
}

function extractDocKeys(chunks: string[]): string[] {
  const keys = new Set<string>();
  for (const chunk of chunks) {
    const text = (chunk || "").slice(0, 2000);
    const jsonKeyMatches = [
      ...text.matchAll(/\b["']([a-zA-Z_][a-zA-Z0-9_\-]*)["']\s*:/g),
    ];
    for (const m of jsonKeyMatches) {
      const k = m[1];
      if (k && k.length <= 50) keys.add(k);
    }
    const paramMatches = [
      ...text.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_\-]*)\s*=/g),
    ];
    for (const m of paramMatches) {
      const k = m[1];
      if (k && k.length <= 50) keys.add(k);
    }
  }
  return Array.from(keys).slice(0, 50);
}

function inferContentType(
  chunks: string[],
): "application/json" | "application/x-www-form-urlencoded" {
  const hint = chunks.join("\n").toLowerCase();
  if (
    hint.includes("application/x-www-form-urlencoded") ||
    hint.includes("form-urlencoded")
  ) {
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
  const emailKey = pick(
    ["email", "user_email", "email_address", "mail"],
    "email",
  );
  const firstNameKey = pick(
    ["first_name", "firstName", "given_name", "fname"],
    "firstName",
  );
  const lastNameKey = pick(
    ["last_name", "lastName", "surname", "lname"],
    "lastName",
  );
  const phoneKey = pick(
    ["phone", "phone_number", "mobile", "contact_number"],
    "phone",
  );
  const companyKey = pick(
    ["company", "organization", "org", "business"],
    "company",
  );
  const consentKey = pick(
    ["consent", "gdpr_consent", "agree_terms", "accept"],
    "consent",
  );

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
      chunks = similar.map((s) => s.text);
    } catch {}
  }

  const docKeys = extractDocKeys(chunks);
  const contentType = inferContentType(chunks);
  const fieldMappings = buildFieldMappings(docKeys);

  return { contentType, fieldMappings };
}

function applyFieldMappings(
  data: Record<string, any>,
  mappings: Record<string, string>,
) {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const targetKey = mappings[key] || key;
    out[targetKey] = value;
  }
  return out;
}

function getValueByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path
    .replace(/\[([^\]]+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  let cur: any = obj;
  for (const part of parts) {
    if (cur === null || cur === undefined) return undefined;
    if (Array.isArray(cur)) {
      const idx = Number(part);
      if (Number.isNaN(idx)) return undefined;
      cur = cur[idx];
    } else {
      cur = (cur as any)[part];
    }
  }
  return cur;
}

export const onboardingService = {
  async executeAdditionalStep(
    stepId: string,
    data: Record<string, any>,
    adminId: string,
  ): Promise<{
    success: boolean;
    error?: string;
    status?: number;
    responseBody?: any;
    debug?: any;
  }> {
    const settings = await getAdminSettings(adminId);
    const onboarding = settings.onboarding;
    const step = (onboarding?.additionalSteps || []).find(
      (s) => s.id === stepId,
    );

    if (!step) {
      return { success: false, error: "Step not found", status: 404 };
    }

    const redactKeys = [
      "password",
      "pass",
      "secret",
      "token",
      "apikey",
      "api_key",
      "key",
    ];

    let url: string | undefined;
    let method = step.method || "POST";
    let headers: Record<string, string> = {};
    let payload: Record<string, any> = { ...data };

    // Parse cURL if available
    if (step.curlCommand && step.curlCommand.trim().length > 0) {
      const parsed = parseCurlRegistrationSpec(step.curlCommand);
      if (parsed.url) {
        url = parsed.url;
        method = (parsed.method as any) || method;
        headers = { ...parsed.headers };
        const contentType = (parsed.contentType as any) || "application/json";
        headers["Content-Type"] = contentType;

        // Map body fields from cURL
        const { body } = buildBodyFromCurl(parsed, { ...data });
        // If parsed body is valid JSON, use it, otherwise fallback to data
        try {
          payload = JSON.parse(body);
        } catch {
          // If body is not JSON (e.g. form-urlencoded), keep payload as is for now
          // or rely on buildBodyFromCurl logic if it handles non-JSON
        }
      }
    }

    // Fallback to manual configuration if cURL didn't provide URL
    if (!url) {
      url = step.endpoint;
    }

    if (!url) {
      return { success: false, error: "Endpoint not configured", status: 400 };
    }

    // Auth injection
    const tokenFromFlow = (data as any).__authToken as string | undefined;
    const apiKeyFromFlow = (data as any).__apiKey as string | undefined;
    const headerKey = (onboarding as any).authHeaderKey || "Authorization";
    const apiKeyHeaderKey = (onboarding as any).apiKeyHeaderKey || "X-API-Key";

    if (tokenFromFlow) {
      headers[headerKey] =
        headerKey.toLowerCase() === "authorization"
          ? `Bearer ${tokenFromFlow}`
          : tokenFromFlow;
    }
    if (apiKeyFromFlow) {
      headers[apiKeyHeaderKey] = apiKeyFromFlow;
    }

    // Filter payload to only include fields defined in the step (security/cleanliness)
    const allowedKeys = new Set(
      (step.fields || []).map((f: any) => String(f.key || "")),
    );
    // Also allow keys found in cURL body if any
    if ((step as any).parsed?.bodyKeys) {
      ((step as any).parsed.bodyKeys || []).forEach((k: any) =>
        allowedKeys.add(k),
      );
    }

    const filtered: Record<string, any> = {};
    for (const [k, v] of Object.entries(payload)) {
      if (allowedKeys.has(String(k))) filtered[k] = v;
    }

    const safePayloadForLog = Object.fromEntries(
      Object.entries(filtered).map(([k, v]) => {
        const kl = k.toLowerCase();
        const isSensitive = redactKeys.some((rk) => kl.includes(rk));
        return [k, isSensitive ? "***" : v];
      }),
    );

    console.log(
      `[Onboarding] Executing additional step ${step.name} (${step.id})`,
      {
        url,
        method,
        payload: safePayloadForLog,
      },
    );

    try {
      const bodyStr = JSON.stringify(filtered);
      const res = await fetch(url, { method, headers, body: bodyStr });
      const bodyText = await res.text();
      let parsedResp: any = null;
      try {
        parsedResp = JSON.parse(bodyText);
      } catch {
        parsedResp = bodyText;
      }

      if (!res.ok) {
        const errorMessage =
          (parsedResp as any)?.error ||
          (parsedResp as any)?.message ||
          "Step execution failed";

        console.error(`[Onboarding] ❌ Step ${step.name} failed`, {
          status: res.status,
          error: errorMessage,
          response: parsedResp,
        });

        return {
          success: false,
          error: errorMessage,
          status: res.status,
          responseBody: parsedResp,
        };
      }

      console.log(`[Onboarding] ✅ Step ${step.name} succeeded`, {
        status: res.status,
      });

      return {
        success: true,
        status: res.status,
        responseBody: parsedResp,
      };
    } catch (error: any) {
      console.error(`[Onboarding] ❌ Step ${step.name} execution error`, error);
      return {
        success: false,
        error: error.message || "Execution error",
        status: 500,
      };
    }
  },

  async authenticate(
    data: Record<string, any>,
    adminId: string,
  ): Promise<AuthResult> {
    const settings = await getAdminSettings(adminId);
    const onboarding = settings.onboarding || { enabled: false };

    if (!onboarding.enabled) {
      return { success: false, error: "Onboarding is disabled", status: 400 };
    }

    // Require an authentication cURL command to be configured
    const authCurl = (onboarding as any).authCurlCommand as string | undefined;
    if (!authCurl || authCurl.trim().length === 0) {
      return {
        success: false,
        error: "Authentication cURL not configured",
        status: 400,
      };
    }

    const redactKeys = [
      "password",
      "pass",
      "secret",
      "token",
      "apikey",
      "api_key",
      "key",
    ];

    try {
      const parsed = parseCurlRegistrationSpec(authCurl);
      const url = parsed.url;
      const method = (parsed.method as any) || "POST";
      const contentType = (parsed.contentType as any) || "application/json";

      if (!url) {
        console.error(
          "[Onboarding] ❌ cURL parsing failed for authentication: no URL found",
          {
            adminId,
            curlSnippet: (authCurl || "").slice(0, 200),
          },
        );
        return {
          success: false,
          error: "Auth URL not found in cURL command",
          status: 400,
        };
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
        }),
      );

      const payloadUsedLog = Object.fromEntries(
        (keysUsed || []).map((k: string) => {
          const lk = String(k || "").toLowerCase();
          const isSensitive = redactKeys.some((rk) => lk.includes(rk));
          return [k, isSensitive ? "***" : (data as any)[k]];
        }),
      );
      const requestDebug = {
        url,
        method,
        contentType,
        headerKeys: Object.keys(headers),
        headers: redactHeadersForLog(headers),
        payloadKeys: keysUsed,
        payload: payloadUsedLog,
      };
      console.log(
        "[Onboarding] Calling external auth API via cURL:",
        requestDebug,
      );

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
          if (!parsedResp || typeof parsedResp !== "object")
            return "Authentication failed";
          const topLevel =
            (parsedResp as any).error || (parsedResp as any).message;
          const nestedData =
            (parsedResp as any)?.data?.error ||
            (parsedResp as any)?.data?.message;
          const arrayErrors = Array.isArray((parsedResp as any)?.errors)
            ? (parsedResp as any).errors
                .map((e: any) => e?.message || e)
                .filter(Boolean)
                .join("; ")
            : undefined;
          return (
            topLevel || nestedData || arrayErrors || "Authentication failed"
          );
        })();

        console.error("[Onboarding] ❌ External authentication failed", {
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
          debug: { request: requestDebug, response: parsedResp },
        };
      }

      // Try common token field names
      let tokenType: "token" | "apiKey" | undefined;
      const token = (() => {
        if (parsedResp && typeof parsedResp === "object") {
          const explicitTokenPath = (onboarding as any)?.authResponseMappings
            ?.tokenPath as string | undefined;
          const explicitApiKeyPath = (onboarding as any)?.authResponseMappings
            ?.apiKeyPath as string | undefined;
          if (explicitTokenPath) {
            const v = getValueByPath(parsedResp, explicitTokenPath);
            if (typeof v === "string" && v.length > 0) {
              tokenType = "token";
              return v;
            }
          }
          if (explicitApiKeyPath) {
            const v = getValueByPath(parsedResp, explicitApiKeyPath);
            if (typeof v === "string" && v.length > 0) {
              tokenType = "apiKey";
              return v;
            }
          }
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
            (parsedResp as any)?.user?.apiKey,
            (parsedResp as any)?.user?.token,
            (parsedResp as any)?.user?.access_token,
          ];
          const found = candidates.find(
            (t: any) => typeof t === "string" && t.length > 0,
          );
          if (found) {
            const lowerKeys = Object.keys(parsedResp as any).map((k) =>
              k.toLowerCase(),
            );
            const lowerDataKeys = Object.keys(
              ((parsedResp as any)?.data || {}) as any,
            ).map((k) => k.toLowerCase());
            const lowerUserKeys = Object.keys(
              ((parsedResp as any)?.user || {}) as any,
            ).map((k) => k.toLowerCase());
            const isApiKey =
              lowerKeys.includes("apikey") ||
              lowerKeys.includes("api_key") ||
              lowerKeys.includes("key") ||
              lowerDataKeys.includes("apikey") ||
              lowerDataKeys.includes("api_key") ||
              lowerDataKeys.includes("key") ||
              lowerUserKeys.includes("apikey") ||
              lowerUserKeys.includes("api_key") ||
              lowerUserKeys.includes("key");
            tokenType = isApiKey ? "apiKey" : "token";
          }
          return found;
        }
        return undefined;
      })();

      // If not found in body, try response headers
      let headerToken: string | undefined;
      try {
        const authHeader =
          res.headers.get("authorization") || res.headers.get("Authorization");
        const apiKeyHeader =
          res.headers.get("x-api-key") ||
          res.headers.get("X-API-Key") ||
          res.headers.get("api-key") ||
          res.headers.get("Api-Key") ||
          res.headers.get("apikey") ||
          res.headers.get("ApiKey");
        if (authHeader && !token) {
          const m = String(authHeader).match(/Bearer\s+(.+)/i);
          headerToken = m ? m[1] : String(authHeader);
          tokenType = "token";
        } else if (apiKeyHeader && !token) {
          headerToken = String(apiKeyHeader);
          tokenType = "apiKey";
        }
      } catch {}

      const finalToken = (token || headerToken || "")
        .toString()
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!finalToken) {
        console.warn(
          "[Onboarding] ⚠️ Auth response did not include a token field",
          {
            adminId,
            url,
            responseBodyType: typeof parsedResp,
          },
        );
      }

      const respSummary = (() => {
        if (parsedResp && typeof parsedResp === "object") {
          const flat: Record<string, any> = {};
          const stack: Array<{ o: any; p: string; d: number }> = [
            { o: parsedResp as any, p: "", d: 0 },
          ];
          while (stack.length > 0) {
            const { o, p, d } = stack.pop() as { o: any; p: string; d: number };
            if (d > 3) continue;
            if (o && typeof o === "object" && !Array.isArray(o)) {
              for (const k of Object.keys(o)) {
                const np = p ? `${p}.${k}` : k;
                const v = o[k];
                if (v && typeof v === "object") {
                  stack.push({ o: v, p: np, d: d + 1 });
                } else {
                  flat[np] = v;
                }
              }
            } else if (Array.isArray(o)) {
              const np = p || "";
              flat[np] = "[array]";
            } else {
              flat[p] = o;
            }
          }
          const keys = Object.keys(flat);
          const redacted = Object.fromEntries(
            keys.slice(0, 40).map((k) => {
              const lk = k.toLowerCase();
              const isSensitive = redactKeys.some((rk) => lk.includes(rk));
              const v = flat[k];
              return [k, isSensitive ? "***" : v];
            }),
          );
          return { keys, preview: redacted };
        }
        const txt = String(parsedResp || "");
        return { previewText: txt.slice(0, 200), length: txt.length };
      })();
      console.log("[Onboarding] ✅ External authentication succeeded", {
        status: res.status,
        adminId,
        tokenPresent: !!token,
        response: respSummary,
      });
      return {
        success: true,
        status: res.status,
        token: finalToken || undefined,
        tokenType,
        responseBody: parsedResp,
        debug: { request: requestDebug, response: respSummary },
      };
    } catch (error: any) {
      console.error("[Onboarding] ❌ External authentication error", {
        adminId,
        message: error?.message || String(error),
        stack: error?.stack,
      });
      return {
        success: false,
        error: error?.message || String(error),
        status: 500,
      };
    }
  },
  async initialSetup(
    data: Record<string, any>,
    adminId: string,
  ): Promise<RegistrationResult> {
    const settings = await getAdminSettings(adminId);
    const onboarding = settings.onboarding || { enabled: false };

    if (!onboarding.enabled) {
      return { success: false, error: "Onboarding is disabled", status: 400 };
    }

    const redactKeys = [
      "password",
      "pass",
      "secret",
      "token",
      "apikey",
      "api_key",
      "key",
    ];

    const hasCurl = !!onboarding.initialSetupCurlCommand;
    let url: string | null = null;
    let method =
      ((onboarding as any).initialSetupMethod as any) ||
      onboarding.method ||
      "POST";
    let headers: Record<string, string> = {};
    let contentType: "application/json" | "application/x-www-form-urlencoded" =
      "application/json";
    let payload: Record<string, any> = { ...data };
    payload = applyInitialFieldDefaults(payload, onboarding);

    if (hasCurl) {
      const parsed = parseCurlRegistrationSpec(
        onboarding.initialSetupCurlCommand as string,
      );
      url = parsed.url;
      method = (parsed.method as any) || method;
      contentType = (parsed.contentType as any) || contentType;
      headers = {
        ...parsed.headers,
        "Content-Type": contentType,
      };

      // If auth secret was attached to data by the chat flow, set appropriate headers
      const tokenFromFlow = (data as any).__authToken as string | undefined;
      const apiKeyFromFlow = (data as any).__apiKey as string | undefined;
      const authHeaderKey =
        (onboarding as any).authHeaderKey || "Authorization";
      const apiKeyHeaderKey =
        (onboarding as any).apiKeyHeaderKey || "X-API-Key";
      if (tokenFromFlow) {
        const tok = String(tokenFromFlow).trim();
        if (String(authHeaderKey).toLowerCase() === "authorization") {
          headers[authHeaderKey] = /^Bearer\s+/i.test(tok)
            ? tok
            : `Bearer ${tok}`;
        } else {
          headers[authHeaderKey] = tok;
        }
      }
      if (apiKeyFromFlow) {
        headers[apiKeyHeaderKey] = apiKeyFromFlow;
      }

      try {
        const setupFields = ((onboarding as any).initialFields as any[]) || [];
        const setupHeaderFields =
          ((onboarding as any).initialHeaderFields as any[]) || [];
        if (Array.isArray(setupFields)) {
          if (tokenFromFlow) {
            const tokenField = setupFields.find((f: any) =>
              /^(token|access[_-]?token|authToken)$/i.test(
                String(f?.key || ""),
              ),
            );
            if (tokenField?.key && !payload[tokenField.key]) {
              payload[tokenField.key] = tokenFromFlow;
            }
          }
          if (apiKeyFromFlow) {
            const keyField = setupFields.find((f: any) =>
              /^(api[_-]?key|apiKey|key)$/i.test(String(f?.key || "")),
            );
            if (keyField?.key && !payload[keyField.key]) {
              payload[keyField.key] = apiKeyFromFlow;
            }
          }
          for (const f of setupFields) {
            const src = String((f as any).source || "none");
            if (src === "token" && tokenFromFlow) {
              payload[String(f.key || "")] = tokenFromFlow;
            } else if (src === "apiKey" && apiKeyFromFlow) {
              payload[String(f.key || "")] = apiKeyFromFlow;
            }
          }
        }
        if (Array.isArray(setupHeaderFields)) {
          for (const hf of setupHeaderFields) {
            const src = String((hf as any).source || "none");
            const hk = String((hf as any).key || "");
            if (!hk) continue;
            if (src === "token" && tokenFromFlow) {
              const tok = String(tokenFromFlow).trim();
              if (hk.toLowerCase() === "authorization") {
                headers[hk] = /^Bearer\s+/i.test(tok) ? tok : `Bearer ${tok}`;
              } else {
                headers[hk] = tok;
              }
            } else if (src === "apiKey" && apiKeyFromFlow) {
              headers[hk] = apiKeyFromFlow;
            } else if ((hf as any).defaultValue) {
              headers[hk] = String((hf as any).defaultValue);
            }
          }
        }
      } catch {}

      if (!url) {
        console.error(
          "[Onboarding] ❌ cURL parsing failed for initial setup: no URL found",
          {
            adminId,
            curlSnippet: (onboarding.initialSetupCurlCommand || "").slice(
              0,
              200,
            ),
          },
        );
        return {
          success: false,
          error: "Initial setup URL not found in cURL command",
          status: 400,
        };
      }

      if (
        onboarding.idempotencyKeyField &&
        data[onboarding.idempotencyKeyField]
      ) {
        headers["Idempotency-Key"] = String(
          data[onboarding.idempotencyKeyField],
        );
      }

      const { body, keysUsed } = buildBodyFromCurl(parsed, payload);

      const safePayloadForLog = Object.fromEntries(
        Object.entries(payload).map(([k, v]) => {
          const kl = k.toLowerCase();
          const isSensitive = redactKeys.some((rk) => kl.includes(rk));
          return [k, isSensitive ? "***" : v];
        }),
      );

      try {
        console.log(
          "[Onboarding] Calling external initial setup API via cURL:",
          {
            url,
            method,
            contentType,
            headerKeys: Object.keys(headers),
            headers: redactHeadersForLog(headers),
            payloadKeys: keysUsed,
          },
        );

        let res = await fetch(url as string, { method, headers, body });

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
            if (!parsedResp || typeof parsedResp !== "object")
              return "Initial setup failed";
            const topLevel =
              (parsedResp as any).error || (parsedResp as any).message;
            const nestedData =
              (parsedResp as any)?.data?.error ||
              (parsedResp as any)?.data?.message;
            const arrayErrors = Array.isArray((parsedResp as any)?.errors)
              ? (parsedResp as any).errors
                  .map((e: any) => e?.message || e)
                  .filter(Boolean)
                  .join("; ")
              : undefined;
            return (
              topLevel || nestedData || arrayErrors || "Initial setup failed"
            );
          })();
          const shouldRetry =
            res.status === 401 ||
            /invalid\s*(token|api\s*key)/i.test(String(errorMessage));
          if (shouldRetry) {
            try {
              const altHeaders = { ...headers };
              const hkAuth = String(
                (onboarding as any).authHeaderKey || "Authorization",
              );
              const hkApi = String(
                (onboarding as any).apiKeyHeaderKey || "X-API-Key",
              );
              const tok = String((data as any).__authToken || "")
                .replace(/^\s*Bearer\s+/i, "")
                .trim();
              const key = String((data as any).__apiKey || "").trim();
              if (tok && hkAuth.toLowerCase() === "authorization") {
                altHeaders[hkAuth] = tok;
              } else if (key && hkApi.toLowerCase() === "x-api-key") {
                altHeaders[hkApi] = key;
                altHeaders[hkAuth] = `Bearer ${key}`;
              }
              res = await fetch(url as string, {
                method,
                headers: altHeaders,
                body,
              });
              const retryText = await res.text();
              let retryParsed: any = null;
              try {
                retryParsed = JSON.parse(retryText);
              } catch {
                retryParsed = retryText;
              }
              if (!res.ok) {
                console.error("[Onboarding] ❌ External initial setup failed", {
                  status: res.status,
                  adminId,
                  url,
                  responseBody: retryParsed,
                  payload: safePayloadForLog,
                  errorMessage,
                });
                return {
                  success: false,
                  error: errorMessage,
                  status: res.status,
                  responseBody: retryParsed,
                };
              }
              console.log(
                "[Onboarding] ✅ External initial setup succeeded (retry)",
                {
                  status: res.status,
                  adminId,
                },
              );
              return {
                success: true,
                status: res.status,
                responseBody: retryParsed,
              };
            } catch {
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
          }
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
            }),
          ),
        });
        return {
          success: false,
          error: error?.message || String(error),
          status: 500,
        };
      }
    }

    const resolved = resolveInitialSetupUrl(onboarding);
    url = resolved;
    if (!url) {
      return {
        success: false,
        error: "Initial setup URL not configured",
        status: 400,
      };
    }
    const setupFields = ((onboarding as any).initialFields as any[]) || [];
    if (!Array.isArray(setupFields) || setupFields.length === 0) {
      return {
        success: false,
        error: "Initial setup fields not configured",
        status: 400,
      };
    }
    const headerKey = onboarding.authHeaderKey || "Authorization";
    headers = {
      "Content-Type": contentType,
      ...buildAuthHeader(onboarding),
    };
    const tokenFromFlow = (data as any).__authToken as string | undefined;
    const apiKeyFromFlow = (data as any).__apiKey as string | undefined;
    if (tokenFromFlow) {
      const tok = String(tokenFromFlow).trim();
      if (headerKey.toLowerCase() === "authorization") {
        headers[headerKey] = /^Bearer\s+/i.test(tok) ? tok : `Bearer ${tok}`;
      } else {
        headers[headerKey] = tok;
      }
    }
    if (apiKeyFromFlow) {
      const apiKeyHeaderKey =
        (onboarding as any).apiKeyHeaderKey || "X-API-Key";
      headers[apiKeyHeaderKey] = apiKeyFromFlow;
    }
    try {
      if (Array.isArray(setupFields)) {
        if (tokenFromFlow) {
          const tokenField = setupFields.find((f: any) =>
            /^(token|access[_-]?token|authToken)$/i.test(String(f?.key || "")),
          );
          if (tokenField?.key && !payload[tokenField.key]) {
            payload[tokenField.key] = tokenFromFlow;
          }
        }
        if (apiKeyFromFlow) {
          const keyField = setupFields.find((f: any) =>
            /^(api[_-]?key|apiKey|key)$/i.test(String(f?.key || "")),
          );
          if (keyField?.key && !payload[keyField.key]) {
            payload[keyField.key] = apiKeyFromFlow;
          }
        }
        for (const f of setupFields) {
          const src = String((f as any).source || "none");
          if (src === "token" && tokenFromFlow) {
            payload[String(f.key || "")] = tokenFromFlow;
          } else if (src === "apiKey" && apiKeyFromFlow) {
            payload[String(f.key || "")] = apiKeyFromFlow;
          }
        }
      }
    } catch {}
    const setupHeaderFields =
      ((onboarding as any).initialHeaderFields as any[]) || [];
    if (Array.isArray(setupHeaderFields)) {
      for (const hf of setupHeaderFields) {
        const src = String((hf as any).source || "none");
        const hk = String((hf as any).key || "");
        if (!hk) continue;
        if (src === "token" && tokenFromFlow) {
          const tok = String(tokenFromFlow).trim();
          if (hk.toLowerCase() === "authorization") {
            headers[hk] = /^Bearer\s+/i.test(tok) ? tok : `Bearer ${tok}`;
          } else {
            headers[hk] = tok;
          }
        } else if (src === "apiKey" && apiKeyFromFlow) {
          headers[hk] = apiKeyFromFlow;
        } else if ((hf as any).defaultValue) {
          headers[hk] = String((hf as any).defaultValue);
        }
      }
    }
    if (
      onboarding.idempotencyKeyField &&
      data[onboarding.idempotencyKeyField]
    ) {
      headers["Idempotency-Key"] = String(data[onboarding.idempotencyKeyField]);
    }
    const allowedKeys = new Set(
      setupFields.map((f: any) => String(f.key || "")),
    );
    const filtered: Record<string, any> = {};
    for (const [k, v] of Object.entries(payload)) {
      if (allowedKeys.has(String(k))) filtered[k] = v;
    }
    const safePayloadForLog = Object.fromEntries(
      Object.entries(filtered).map(([k, v]) => {
        const kl = k.toLowerCase();
        const isSensitive = redactKeys.some((rk) => kl.includes(rk));
        return [k, isSensitive ? "***" : v];
      }),
    );
    try {
      const body = JSON.stringify(filtered);
      let res = await fetch(url as string, { method, headers, body });
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
          if (!parsedResp || typeof parsedResp !== "object")
            return "Initial setup failed";
          const topLevel =
            (parsedResp as any).error || (parsedResp as any).message;
          const nestedData =
            (parsedResp as any)?.data?.error ||
            (parsedResp as any)?.data?.message;
          const arrayErrors = Array.isArray((parsedResp as any)?.errors)
            ? (parsedResp as any).errors
                .map((e: any) => e?.message || e)
                .filter(Boolean)
                .join("; ")
            : undefined;
          return (
            topLevel || nestedData || arrayErrors || "Initial setup failed"
          );
        })();
        const shouldRetry =
          res.status === 401 ||
          /invalid\s*(token|api\s*key)/i.test(String(errorMessage));
        if (shouldRetry) {
          try {
            const altHeaders = { ...headers };
            const hkAuth = String(onboarding.authHeaderKey || "Authorization");
            const hkApi = String(
              (onboarding as any).apiKeyHeaderKey || "X-API-Key",
            );
            const tok = String((data as any).__authToken || "")
              .replace(/^\s*Bearer\s+/i, "")
              .trim();
            const key = String((data as any).__apiKey || "").trim();
            if (tok && hkAuth.toLowerCase() === "authorization") {
              altHeaders[hkAuth] = tok;
            } else if (key && hkApi.toLowerCase() === "x-api-key") {
              altHeaders[hkApi] = key;
              altHeaders[hkAuth] = `Bearer ${key}`;
            }
            res = await fetch(url as string, {
              method,
              headers: altHeaders,
              body,
            });
            const retryText = await res.text();
            let retryParsed: any = null;
            try {
              retryParsed = JSON.parse(retryText);
            } catch {
              retryParsed = retryText;
            }
            if (!res.ok) {
              return {
                success: false,
                error: errorMessage,
                status: res.status,
                responseBody: retryParsed,
              };
            }
            return {
              success: true,
              status: res.status,
              responseBody: retryParsed,
            };
          } catch {}
        }
        return {
          success: false,
          error: errorMessage,
          status: res.status,
          responseBody: parsedResp,
        };
      }
      return { success: true, status: res.status, responseBody: parsedResp };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || String(error),
        status: 500,
      };
    }
  },
  async register(
    data: Record<string, any>,
    adminId: string,
  ): Promise<RegistrationResult> {
    const settings = await getAdminSettings(adminId);
    const onboarding = settings.onboarding || { enabled: false };

    if (!onboarding.enabled) {
      return { success: false, error: "Onboarding is disabled", status: 400 };
    }

    // Sensitive keys we should redact in logs
    const redactKeys = [
      "password",
      "pass",
      "secret",
      "token",
      "apikey",
      "api_key",
      "key",
    ];

    // Prefer cURL configuration if provided by admin
    const hasCurl = !!onboarding.curlCommand;
    let url: string | null = null;
    let method = onboarding.method || "POST";
    let headers: Record<string, string> = {};
    let contentType: "application/json" | "application/x-www-form-urlencoded" =
      "application/json";
    let payload: Record<string, any> = { ...data };
    payload = applyRegistrationFieldDefaults(payload, onboarding);
    if (!payload.action) {
      payload.action = "register";
    }
    const fn1 =
      payload.firstName ||
      payload.firstname ||
      payload.given_name ||
      payload.fname ||
      payload.name;
    const ln1 =
      payload.lastName || payload.lastname || payload.surname || payload.lname;
    if (!payload.name && fn1) {
      payload.name = ln1 ? `${fn1} ${ln1}` : fn1;
    }

    if (hasCurl) {
      const parsed = parseCurlRegistrationSpec(
        onboarding.curlCommand as string,
      );
      url = parsed.url;
      method = (parsed.method as any) || method;
      contentType = (parsed.contentType as any) || contentType;
      headers = {
        ...parsed.headers,
        "Content-Type": contentType,
      };

      if (!url) {
        console.error(
          "[Onboarding] ❌ cURL parsing failed for registration: no URL found",
          {
            adminId,
            curlSnippet: (onboarding.curlCommand || "").slice(0, 200),
          },
        );
        return {
          success: false,
          error: "Registration URL not found in cURL command",
          status: 400,
        };
      }

      if (
        onboarding.idempotencyKeyField &&
        data[onboarding.idempotencyKeyField]
      ) {
        headers["Idempotency-Key"] = String(
          data[onboarding.idempotencyKeyField],
        );
      }

      const { body, keysUsed } = buildBodyFromCurl(parsed, payload);

      const safePayloadForLog = Object.fromEntries(
        Object.entries(payload).map(([k, v]) => {
          const kl = k.toLowerCase();
          const isSensitive = redactKeys.some((rk) => kl.includes(rk));
          return [k, isSensitive ? "***" : v];
        }),
      );

      try {
        console.log(
          "[Onboarding] Calling external registration API via cURL:",
          {
            url,
            method,
            contentType,
            headerKeys: Object.keys(headers),
            headers: redactHeadersForLog(headers),
            payloadKeys: keysUsed,
          },
        );

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
            if (!parsedResp || typeof parsedResp !== "object")
              return "Registration failed";
            const topLevel =
              (parsedResp as any).error || (parsedResp as any).message;
            const nestedData =
              (parsedResp as any)?.data?.error ||
              (parsedResp as any)?.data?.message;
            const arrayErrors = Array.isArray((parsedResp as any)?.errors)
              ? (parsedResp as any).errors
                  .map((e: any) => e?.message || e)
                  .filter(Boolean)
                  .join("; ")
              : undefined;
            return (
              topLevel || nestedData || arrayErrors || "Registration failed"
            );
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
            }),
          ),
        });
        return {
          success: false,
          error: error?.message || String(error),
          status: 500,
        };
      }
    }

    const baseUrl = resolveUrl(onboarding);
    url = baseUrl;
    if (!url) {
      return {
        success: false,
        error: "Registration URL not configured",
        status: 400,
      };
    }

    const { contentType: inferredContentType, fieldMappings } =
      await inferRequestFormatFromDocs(adminId, onboarding.docsUrl);
    contentType = inferredContentType;
    headers = {
      "Content-Type": contentType,
      ...buildAuthHeader(onboarding),
    };

    if (
      onboarding.idempotencyKeyField &&
      data[onboarding.idempotencyKeyField]
    ) {
      headers["Idempotency-Key"] = String(data[onboarding.idempotencyKeyField]);
    }

    payload = applyFieldMappings(data, fieldMappings);
    payload = applyRegistrationFieldDefaults(payload, onboarding);
    const fn2 =
      payload.firstName ||
      payload.firstname ||
      payload.given_name ||
      payload.fname ||
      payload.name;
    const ln2 =
      payload.lastName || payload.lastname || payload.surname || payload.lname;
    if (!payload.name && fn2) {
      payload.name = ln2 ? `${fn2} ${ln2}` : fn2;
    }

    const safePayloadForLog = Object.fromEntries(
      Object.entries(payload).map(([k, v]) => {
        const kl = k.toLowerCase();
        const isSensitive = redactKeys.some((rk) => kl.includes(rk));
        return [k, isSensitive ? "***" : v];
      }),
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
      const body =
        contentType === "application/x-www-form-urlencoded"
          ? new URLSearchParams(
              Object.entries(payload).reduce(
                (acc, [k, v]) => {
                  acc[k] = typeof v === "string" ? v : JSON.stringify(v);
                  return acc;
                },
                {} as Record<string, string>,
              ),
            ).toString()
          : JSON.stringify(payload);

      let res = await fetch(url as string, {
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
          if (!parsedResp || typeof parsedResp !== "object")
            return "Registration failed";
          const topLevel =
            (parsedResp as any).error || (parsedResp as any).message;
          const nestedData =
            (parsedResp as any)?.data?.error ||
            (parsedResp as any)?.data?.message;
          const arrayErrors = Array.isArray((parsedResp as any)?.errors)
            ? (parsedResp as any).errors
                .map((e: any) => e?.message || e)
                .filter(Boolean)
                .join("; ")
            : undefined;
          return topLevel || nestedData || arrayErrors || "Registration failed";
        })();
        const shouldRetry =
          res.status === 401 ||
          /invalid\s*(token|api\s*key)/i.test(String(errorMessage));
        if (shouldRetry) {
          try {
            const altHeaders = { ...headers };
            const hkAuth = String(onboarding.authHeaderKey || "Authorization");
            const tok = String((data as any).__authToken || "")
              .replace(/^\s*Bearer\s+/i, "")
              .trim();
            if (tok && hkAuth.toLowerCase() === "authorization") {
              altHeaders[hkAuth] = tok;
              res = await fetch(url as string, {
                method,
                headers: altHeaders,
                body,
              });
              const retryText = await res.text();
              let retryParsed: any = null;
              try {
                retryParsed = JSON.parse(retryText);
              } catch {
                retryParsed = retryText;
              }
              if (!res.ok) {
                console.error("[Onboarding] ❌ External registration failed", {
                  status: res.status,
                  adminId,
                  url,
                  responseBody: retryParsed,
                  payload: safePayloadForLog,
                  errorMessage,
                });
                return {
                  success: false,
                  error: errorMessage,
                  status: res.status,
                  responseBody: retryParsed,
                };
              }
              console.log(
                "[Onboarding] ✅ External registration succeeded (retry)",
                {
                  status: res.status,
                  adminId,
                },
              );
              return {
                success: true,
                status: res.status,
                responseBody: retryParsed,
              };
            }
          } catch {}
        }
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
          }),
        ),
      });
      return {
        success: false,
        error: error?.message || String(error),
        status: 500,
      };
    }
  },
};

export async function deriveFieldsFromDocsForAdmin(
  adminId: string,
  docsUrl?: string,
  mode?: "registration" | "auth" | "initial" | string,
): Promise<OnboardingField[]> {
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
        input: [
          mode === "auth"
            ? "login authentication request body required fields and content-type"
            : mode === "initial"
              ? "initial setup request body required fields including nested keys and headers"
              : "registration request body required fields and content-type",
        ],
        model: "text-embedding-3-small",
      });
      const embedding = embedResp.data[0].embedding as number[];
      const similar = await querySimilarChunks(embedding, 5, adminId);
      chunks = similar.map((s) => s.text);
    } catch {}
  }
  const scoreChunk = (t: string): number => {
    let s = 0;
    const m = mode || "registration";
    if (m === "auth") {
      if (/login|authenticate|auth\s*\/login|users\s*\/login/i.test(t)) s += 4;
    } else if (m === "initial") {
      if (/setup|initial/i.test(t)) s += 3;
    } else {
      if (/register|signup|sign\s*up|create\s*account/i.test(t)) s += 3;
      if (/users?\s*\/register|\bPOST\b[^\n]*\/register/i.test(t)) s += 3;
    }
    if (/\bPOST\b|request\s*details|request\s*body|body\b/i.test(t)) s += 2;
    if (m === "registration") {
      if (/email/i.test(t)) s += 2;
      if (/password/i.test(t)) s += 2;
    }
    if (/Content-Type|application\/json|x-www-form-urlencoded/i.test(t)) s += 1;
    return s;
  };
  const sorted = [...chunks]
    .map((c) => ({ c, s: scoreChunk((c || "").slice(0, 2000)) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c);
  const pick = sorted.length > 0 ? sorted : chunks;
  const keys = new Set<string>();
  const addKeysFromText = (text: string) => {
    const t = (text || "").slice(0, 4000);
    const hasRequestHint =
      /\bcurl\b|request\s*details|request\s*body|^\s*body\b/i.test(t);
    // Only trust structured JSON near request body hints; avoid free-text lists
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
    if (jsonObj && hasRequestHint) {
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
    // Do not scrape bare assignments or parameter lists; reduces false positives
  };
  for (const chunk of pick) addKeysFromText(chunk || "");
  const filtered = Array.from(keys);
  const toType = (k: string): OnboardingField["type"] =>
    /email/i.test(k) ? "email" : /phone/i.test(k) ? "phone" : "text";
  const toLabel = (k: string) =>
    k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return filtered.slice(0, 50).map((k) => ({
    key: k,
    label: toLabel(k),
    required: true,
    type: toType(k),
  }));
}

export async function deriveSpecFromDocsForAdmin(
  adminId: string,
  docsUrl?: string,
  mode?: "registration" | "auth" | "initial" | string,
  curlCommand?: string,
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
      chunks = similar.map((s) => s.text);
    } catch {}
  }
  const score = (t: string): number => {
    let s = 0;
    if (/register|signup|create\s*account|login|authenticate|setup/i.test(t))
      s += 3;
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
    .map((x) => x.t);

  // Seed response keys from docs (allow-list for LLM)
  const respAllowedSeed = new Set<string>();
  const seedRespFromText = (t: string) => {
    const hint = /response|returns|200\s*OK|example\s*response/i.test(t);
    const i = t.indexOf("{");
    if (i === -1 || !hint) return;
    try {
      let d = 0;
      let s1 = false,
        s2 = false,
        s3 = false;
      let end = -1;
      for (let j = i; j < t.length; j++) {
        const ch = t[j];
        if (ch === "'" && !s2 && !s3) s1 = !s1;
        else if (ch === '"' && !s1 && !s3) s2 = !s2;
        else if (ch === "`" && !s1 && !s2) s3 = !s3;
        if (s1 || s2 || s3) continue;
        if (ch === "{") d++;
        else if (ch === "}") {
          d--;
          if (d === 0) {
            end = j;
            break;
          }
        }
      }
      if (end === -1) return;
      const jsonCandidate = t.slice(i, end + 1);
      const obj = JSON.parse(jsonCandidate);
      const walk = (o: any, p: string) => {
        if (!o || typeof o !== "object") return;
        if (Array.isArray(o)) {
          respAllowedSeed.add(p || "array");
          return;
        }
        for (const [k, v] of Object.entries(o)) {
          const np = p ? `${p}.${k}` : String(k);
          respAllowedSeed.add(np);
          if (v && typeof v === "object") walk(v as any, np);
        }
      };
      walk(obj, "");
    } catch {}
  };
  for (const t of ranked) seedRespFromText(t);

  let endpointHint = "";
  try {
    if (curlCommand && curlCommand.trim().length > 0) {
      const p = parseCurlRegistrationSpec(curlCommand);
      endpointHint = `${p.method || "POST"} ${p.url || ""}`;
    } else if (docsUrl) {
      const urlObj = new URL(docsUrl);
      const path = urlObj.pathname;
      endpointHint = `UNKNOWN ${path}`;
    }
  } catch {}

  const headersSet = new Set<string>();
  for (const t of ranked) {
    const colonHeaders = [...t.matchAll(/\b([A-Za-z-]{2,}):\s*[^\n]+/g)].map(
      (m) => m[1],
    );
    for (const h of colonHeaders) headersSet.add(h);
  }

  // Include header keys from cURL
  const curlHeaderKeys: string[] = (() => {
    try {
      if (curlCommand && curlCommand.trim().length > 0) {
        const p = parseCurlRegistrationSpec(curlCommand);
        return Object.keys(p.headers || {});
      }
    } catch {}
    return [];
  })();
  for (const h of curlHeaderKeys) headersSet.add(h);

  let bodyFields = await deriveFieldsFromDocsForAdmin(adminId, docsUrl, mode);
  const toType = (k: string): OnboardingField["type"] =>
    /email/i.test(String(k))
      ? "email"
      : /phone/i.test(String(k))
        ? "phone"
        : "text";
  const toLabel = (k: string) =>
    String(k)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  let curlKeys: string[] = [];
  try {
    if (curlCommand && curlCommand.trim().length > 0) {
      curlKeys = extractBodyKeysFromCurl(curlCommand) || [];
    }
  } catch {}
  if ((bodyFields || []).length === 0 && (curlKeys || []).length > 0) {
    bodyFields = curlKeys.map((k) => ({
      key: k,
      label: toLabel(k),
      required: true,
      type: toType(k),
    }));
  }

  const respSet = new Set<string>();
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const allowedKeys = Array.from(
      new Set([...bodyFields.map((f) => String(f.key)), ...(curlKeys || [])]),
    );
    const allowedHeaders = Array.from(headersSet);
    const system =
      mode === "auth"
        ? `From the documentation chunks provided, extract ONLY the login/authentication request spec in strict JSON: headers[], body[{key,label,required,type}], response[]. Prefer nested dotted keys (e.g., user.apiKey). Use only the given chunks; do not invent fields. Only use keys from ALLOWED_KEYS. Only use headers from ALLOWED_HEADERS. Only use response keys from ALLOWED_RESPONSE_KEYS. ALLOWED_KEYS: ${allowedKeys.join(
            ",",
          )}\nALLOWED_HEADERS: ${allowedHeaders.join(
            ",",
          )}\nALLOWED_RESPONSE_KEYS: ${Array.from(respAllowedSeed).join(",")}`
        : mode === "registration"
          ? `From the documentation chunks provided, extract ONLY the registration request spec in strict JSON: headers[], body[{key,label,required,type}], response[]. Use only the given chunks; do not invent fields. Only use keys from ALLOWED_KEYS. Only use headers from ALLOWED_HEADERS. Only use response keys from ALLOWED_RESPONSE_KEYS. ALLOWED_KEYS: ${allowedKeys.join(
              ",",
            )}\nALLOWED_HEADERS: ${allowedHeaders.join(
              ",",
            )}\nALLOWED_RESPONSE_KEYS: ${Array.from(respAllowedSeed).join(",")}`
          : mode === "initial"
            ? `From the documentation chunks provided, extract ONLY the initial setup request spec in strict JSON: headers[], body[{key,label,required,type}], response[]. Prefer nested keys (e.g., crisp.websiteId). Use only the given chunks; do not invent fields. Only use keys from ALLOWED_KEYS. Only use headers from ALLOWED_HEADERS. Only use response keys from ALLOWED_RESPONSE_KEYS. ALLOWED_KEYS: ${allowedKeys.join(
                ",",
              )}\nALLOWED_HEADERS: ${allowedHeaders.join(
                ",",
              )}\nALLOWED_RESPONSE_KEYS: ${Array.from(respAllowedSeed).join(",")}`
            : `From the documentation chunks provided, extract ONLY the request spec for ${mode} in strict JSON: headers[], body[{key,label,required,type}], response[]. Prefer nested keys. Use only the given chunks; do not invent fields. Only use keys from ALLOWED_KEYS. Only use headers from ALLOWED_HEADERS. Only use response keys from ALLOWED_RESPONSE_KEYS. ALLOWED_KEYS: ${allowedKeys.join(
                ",",
              )}\nALLOWED_HEADERS: ${allowedHeaders.join(
                ",",
              )}\nALLOWED_RESPONSE_KEYS: ${Array.from(respAllowedSeed).join(",")}`;
    const promptHeader = `Endpoint hint: ${endpointHint}\nDocs URL: ${
      docsUrl || ""
    }\n\nChunks:\n`;
    const user = (promptHeader + ranked.join("\n\n")).slice(0, 12000);
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ApiSpec",
          strict: true,
          schema: {
            type: "object",
            properties: {
              headers: { type: "array", items: { type: "string" } },
              body: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    key: { type: "string" },
                    label: { type: "string" },
                    required: { type: "boolean" },
                    type: {
                      type: "string",
                      enum: ["text", "email", "phone", "select", "checkbox"],
                    },
                  },
                  required: ["key"],
                  additionalProperties: false,
                },
              },
              response: { type: "array", items: { type: "string" } },
            },
            required: ["headers", "body", "response"],
            additionalProperties: false,
          },
        },
      } as any,
    });
    const text = chat.choices?.[0]?.message?.content || "";
    if (text) {
      const parsed = JSON.parse(text);
      const bodyArr: any[] = Array.isArray(parsed?.body) ? parsed.body : [];
      const llmFields: OnboardingField[] = bodyArr
        .map((f) => ({
          key: String(f.key || f.name || "").trim(),
          label: String(
            f.label || toLabel(String(f.key || f.name || "")),
          ).trim(),
          required: Boolean(f.required ?? true),
          type: /email|mail/i.test(String(f.type || f.key))
            ? "email"
            : /phone/i.test(String(f.type || f.key))
              ? "phone"
              : f.type === "select" || f.type === "checkbox"
                ? f.type
                : toType(String(f.key || "")),
        }))
        .filter((f) => f.key);
      if (llmFields.length > 0) {
        const baseSet = new Set([
          ...bodyFields.map((f) => String(f.key).toLowerCase()),
          ...(curlKeys || []).map((k) => String(k).toLowerCase()),
        ]);
        const inter = llmFields.filter((f) =>
          baseSet.has(String(f.key).toLowerCase()),
        );
        if (inter.length > 0) {
          bodyFields = inter;
        } else if ((curlKeys || []).length > 0) {
          bodyFields = (curlKeys || []).map((k) => ({
            key: k,
            label: String(k)
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            required: true,
            type: /email/i.test(String(k))
              ? "email"
              : /phone/i.test(String(k))
                ? "phone"
                : "text",
          }));
        }
      }
      const hdrs: string[] = Array.isArray(parsed?.headers)
        ? parsed.headers.map((h: any) => String(h))
        : [];
      const hdrsFiltered = hdrs.filter((h) => headersSet.has(h));
      for (const h of hdrsFiltered) headersSet.add(h);
      const resps: string[] = Array.isArray(parsed?.response)
        ? parsed.response.map((k: any) => String(k))
        : [];
      const respsFiltered =
        respAllowedSeed.size > 0
          ? resps.filter((k) => respAllowedSeed.has(k))
          : resps;
      for (const k of respsFiltered) respSet.add(k);
    }
  } catch {}

  const addRespFromText = (t: string) => {
    const hint =
      /(response|responses|returns|example\s*response|200\b|Login\s+successful)/i.test(
        t,
      );
    if (!hint) return;
    let pos = 0;
    while (pos < t.length) {
      const i = t.indexOf("{", pos);
      if (i === -1) break;
      let d = 0;
      let s1 = false,
        s2 = false,
        s3 = false;
      let end = -1;
      for (let j = i; j < t.length; j++) {
        const ch = t[j];
        if (ch === "'" && !s2 && !s3) s1 = !s1;
        else if (ch === '"' && !s1 && !s3) s2 = !s2;
        else if (ch === "`" && !s1 && !s2) s3 = !s3;
        if (s1 || s2 || s3) continue;
        if (ch === "{") d++;
        else if (ch === "}") {
          d--;
          if (d === 0) {
            end = j;
            break;
          }
        }
      }
      if (end === -1) break;
      const jsonCandidate = t.slice(i, end + 1);
      pos = end + 1;
      try {
        const obj = JSON.parse(jsonCandidate);
        const walk = (o: any, p: string) => {
          if (!o || typeof o !== "object") return;
          if (Array.isArray(o)) {
            respSet.add(p || "array");
            return;
          }
          for (const [k, v] of Object.entries(o)) {
            const np = p ? `${p}.${k}` : String(k);
            respSet.add(np);
            if (v && typeof v === "object") walk(v as any, np);
          }
        };
        walk(obj, "");
      } catch {}
    }
  };
  for (const t of ranked) addRespFromText(t);
  let filteredBody = bodyFields;
  if (
    curlCommand &&
    typeof curlCommand === "string" &&
    curlCommand.trim().length > 0
  ) {
    try {
      const ck = extractBodyKeysFromCurl(curlCommand);
      if (ck.length > 0) {
        const toType = (k: string): OnboardingField["type"] =>
          /email/i.test(k) ? "email" : /phone/i.test(k) ? "phone" : "text";
        const toLabel = (k: string) =>
          String(k)
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        filteredBody = ck.map((k) => ({
          key: String(k),
          label: toLabel(String(k)),
          required: true,
          type: toType(String(k)),
        }));
      }
    } catch {}
  }
  const filteredResp = Array.from(respSet);
  return {
    headers: Array.from(headersSet).slice(0, 20),
    body: filteredBody,
    response: filteredResp.slice(0, 50),
  };
}

export async function getReasonFromDocs(
  adminId: string,
  fieldKey: string,
  fieldLabel: string,
): Promise<string | null> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const query = `Why is the field "${fieldLabel || fieldKey}" required in the API request?`;

    const embedResp = await openai.embeddings.create({
      input: [query],
      model: "text-embedding-3-small",
    });
    const embedding = embedResp.data[0].embedding as number[];
    const similar = await querySimilarChunks(embedding, 3, adminId);

    if (!similar || similar.length === 0) return null;

    const context = similar.map((s) => s.text).join("\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Explain briefly (one sentence, max 20 words) why the specific field is needed based on the API documentation context. If the context doesn't mention it, return empty string. Do not start with 'The field is needed because...', just state the reason directly like 'Used to identify the user.'",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: Why is the field "${
            fieldLabel || fieldKey
          }" needed?`,
        },
      ],
      max_tokens: 60,
    });

    const reason = completion.choices[0].message.content?.trim();
    if (
      reason &&
      reason.length > 0 &&
      !reason.toLowerCase().includes("context doesn't mention")
    ) {
      return reason;
    }
    return null;
  } catch (e) {
    console.error("Error getting reason from docs:", e);
    return null;
  }
}

export async function getGenericReason(
  fieldKey: string,
  fieldLabel: string,
): Promise<string | null> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful UX writer for a chatbot. Explain briefly (one sentence, max 20 words) why the specific field is typically needed in an onboarding or registration flow. Do not start with 'The field is needed because...', just state the reason directly like 'Used to verify your identity.'",
        },
        {
          role: "user",
          content: `Field Key: ${fieldKey}\nField Label: ${
            fieldLabel || fieldKey
          }\n\nQuestion: Why is this field needed?`,
        },
      ],
      max_tokens: 60,
    });
    return completion.choices[0].message.content?.trim() || null;
  } catch (e) {
    console.error("Error getting generic reason:", e);
    return null;
  }
}

export async function enrichFieldsWithReasons(
  adminId: string,
  fields: OnboardingField[],
): Promise<OnboardingField[]> {
  if (!fields || fields.length === 0) return [];

  // Use a map to keep track of results to maintain order
  const results = new Map<string, OnboardingField>();

  // Run in parallel
  await Promise.all(
    fields.map(async (f) => {
      const newF = { ...f };
      // Only fetch if description is missing
      if (!newF.description || newF.description.trim().length === 0) {
        try {
          let reason = await getReasonFromDocs(adminId, f.key, f.label);
          if (!reason) {
            reason = await getGenericReason(f.key, f.label);
          }
          if (reason) {
            newF.description = reason;
          }
        } catch {
          // Ignore error, keep original field
        }
      }
      results.set(f.key, newF);
    }),
  );

  return fields.map((f) => results.get(f.key) || f);
}

export async function answerQuestion(
  adminId: string,
  question: string,
): Promise<string | null> {
  try {
    console.log(
      `[AnswerQuestion] Question: "${question}" | AdminId: ${adminId} | SearchMode: global`,
    );

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const embedResp = await openai.embeddings.create({
      input: [question],
      model: "text-embedding-3-small",
    });
    const embedding = embedResp.data[0].embedding as number[];
    // Search globally to allow finding answers from system help docs or other public knowledge
    const similar = await querySimilarChunks(embedding, 5, adminId, "global");

    console.log(
      `[AnswerQuestion] Found ${
        similar ? similar.length : 0
      } chunks. Sources: ${similar?.map((s) => s.source).join(", ")}`,
    );

    const systemContext = `
System Knowledge (Common Onboarding Terms):
- Sitemap URL: An XML file listing all URLs on a website (e.g., https://example.com/sitemap.xml). It is needed to efficiently crawl and index your website's content so the chatbot can answer questions based on your data.
- Documentation URL: The main URL of your public documentation. Used to scrape content for the knowledge base.
- Registration URL: The URL where users sign up. Used to analyze the registration form structure to automate user onboarding.
- API Key / Auth Token: specific credentials used to authenticate with your API. Required for the chatbot to perform actions (like creating accounts) on your behalf.
- Selector / CSS Selector: A pattern (e.g., "#submit-btn", ".nav-link") used to identify specific HTML elements on a page. Needed for the bot to interact with your site (e.g., clicking buttons).
- Crawl: The process of automatically scanning your website to extract text and data.
`;

    const userContext =
      similar && similar.length > 0
        ? similar.map((s) => s.text).join("\n\n")
        : "";

    if (!userContext && !systemContext) return null;

    const context = `${systemContext}\n\n${
      userContext ? "User Documentation Context:\n" + userContext : ""
    }`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for a product onboarding process. Answer the user's question based ONLY on the provided context. If the answer is not in the context, say 'I don't have enough information to answer that.' and do not make up an answer. Keep it concise.",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
      max_tokens: 150,
    });

    return completion.choices[0].message.content?.trim() || null;
  } catch (e) {
    console.error("Error answering question:", e);
    return null;
  }
}
