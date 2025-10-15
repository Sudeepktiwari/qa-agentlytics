import { getAdminSettings, OnboardingSettings } from "@/lib/adminSettings";
import { createOrUpdateLead } from "@/lib/leads";

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

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...buildAuthHeader(onboarding),
    };

    // Optional idempotency
    if (onboarding.idempotencyKeyField && data[onboarding.idempotencyKeyField]) {
      headers["Idempotency-Key"] = String(data[onboarding.idempotencyKeyField]);
    }

    const method = onboarding.method || "POST";

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
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(data),
      });

      const bodyText = await res.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(bodyText);
      } catch {
        parsed = bodyText;
      }

      if (!res.ok) {
        console.log("[Onboarding] External registration failed with status:", res.status);
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

      console.log("[Onboarding] External registration succeeded with status:", res.status);
      return {
        success: true,
        userId,
        status: res.status,
        responseBody: parsed,
      };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), status: 500 };
    }
  },
};