import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/auth";
import { getAdminSettings } from "@/lib/adminSettings";
import { onboardingService } from "@/services/onboardingService";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key") || "";
    const keyInfo = await verifyApiKey(apiKey);
    if (!keyInfo?.adminId) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401, headers: corsHeaders }
      );
    }

    const adminId = keyInfo.adminId;
    const body = await request.json();
    const action = String(body.action || "");
    const payload = (body.payload || {}) as Record<string, any>;

    if (action === "get_initial_fields") {
      const settings = await getAdminSettings(adminId);
      const fields = (settings.onboarding as any)?.initialFields || [];
      return NextResponse.json(
        { success: true, fields },
        { status: 200, headers: corsHeaders }
      );
    }

    if (action === "register") {
      const result = await onboardingService.register(payload, adminId);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || "Registration failed" },
          { status: result.status || 400, headers: corsHeaders }
        );
      }

      let authToken: string | undefined;
      let authApiKey: string | undefined;
      let authType: "token" | "apiKey" | undefined;
      let authRes: any = null;
      const settings = await getAdminSettings(adminId);
      const hasAuth = Boolean((settings.onboarding as any)?.authCurlCommand);
      if (hasAuth) {
        authRes = await onboardingService.authenticate(payload, adminId);
        if (authRes.success && authRes.token) {
          if (authRes.tokenType === "apiKey") {
            authApiKey = authRes.token;
            authType = "apiKey";
          } else {
            authToken = authRes.token;
            authType = "token";
          }
        }
      }

      const initialFields = (settings.onboarding as any)?.initialFields || [];
      return NextResponse.json(
        {
          success: true,
          authToken: authToken || null,
          authApiKey: authApiKey || null,
          authType: authType || null,
          authDebug: hasAuth && authRes?.debug ? authRes.debug : null,
          initialFields,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    if (action === "initial_setup") {
      const result = await onboardingService.initialSetup(payload, adminId);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || "Initial setup failed" },
          { status: result.status || 400, headers: corsHeaders }
        );
      }
      return NextResponse.json(
        { success: true, responseBody: result.responseBody || null },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, error: "Unknown action" },
      { status: 400, headers: corsHeaders }
    );
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
