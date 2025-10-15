import { getAdminSettings, OnboardingSettings } from "@/lib/adminSettings";

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