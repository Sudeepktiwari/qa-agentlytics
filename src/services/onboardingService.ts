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
  if (!settings.apiBaseUrl || !settings.registerEndpoint) return null;
  try {
    const base = settings.apiBaseUrl.endsWith("/")
      ? settings.apiBaseUrl
      : settings.apiBaseUrl + "/";
    const endpoint = settings.registerEndpoint.startsWith("/")
      ? settings.registerEndpoint.slice(1)
      : settings.registerEndpoint;
    return base + endpoint;
  } catch {
    return null;
  }
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
      // Safe fallback: store as lead locally when external registration isn't configured
      console.log("[Onboarding] No registration URL configured. Saving submission as a lead.");
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
        // If lead storage fails, still return a user-friendly result
        return { success: false, error: "Onboarding URL not configured", status: 400 };
      }

      // Treat as success so the flow completes gracefully
      return { success: true, status: 200, responseBody: { storedAsLead: true } };
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