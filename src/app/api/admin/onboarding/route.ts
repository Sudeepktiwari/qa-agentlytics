import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSettings,
  updateAdminSettings,
  OnboardingSettings,
  OnboardingField,
} from "@/lib/adminSettings";
import {
  parseCurlRegistrationSpec,
  extractBodyKeysFromCurl,
  redactHeadersForLog,
} from "@/lib/curl";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import { deriveFieldsFromDocsForAdmin } from "@/services/onboardingService";

// CORS headers for admin onboarding config
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-api-key, x-admin-id, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return NextResponse.json(
    { success: true },
    { status: 200, headers: corsHeaders }
  );
}

// Docs-based field derivation is handled via onboardingService

// GET /api/admin/onboarding
export async function GET(request: NextRequest) {
  try {
    const adminVerification = await verifyAdminAccessFromCookie(request);
    if (!adminVerification.isValid || !adminVerification.adminId) {
      return NextResponse.json(
        {
          success: false,
          error: adminVerification.error || "Authentication failed",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const adminId = adminVerification.adminId;
    const settings = await getAdminSettings(adminId);
    const onboarding = settings.onboarding || { enabled: false };

    const withParsed = { ...onboarding } as OnboardingSettings;

    try {
      if (withParsed.curlCommand) {
        const p = parseCurlRegistrationSpec(withParsed.curlCommand);
        const bodyKeys = extractBodyKeysFromCurl(withParsed.curlCommand);
        withParsed.registrationParsed = {
          method: p.method,
          url: p.url,
          contentType: p.contentType,
          headersRedacted: redactHeadersForLog(p.headers),
          bodyKeys,
        };
      }
      // Derive registration fields only when undefined (first-run)
      if (typeof withParsed.registrationFields === "undefined") {
        withParsed.registrationFields = await deriveFieldsFromDocsForAdmin(
          adminId,
          withParsed.docsUrl
        );
      }
      if ((withParsed as any).authCurlCommand) {
        const p = parseCurlRegistrationSpec(
          (withParsed as any).authCurlCommand as string
        );
        const bodyKeys = extractBodyKeysFromCurl(
          (withParsed as any).authCurlCommand as string
        );
        withParsed.authParsed = {
          method: p.method,
          url: p.url,
          contentType: p.contentType,
          headersRedacted: redactHeadersForLog(p.headers),
          bodyKeys,
        };
      }
      if (typeof withParsed.authFields === "undefined") {
        withParsed.authFields = await deriveFieldsFromDocsForAdmin(
          adminId,
          (withParsed as any).authDocsUrl
        );
      }
      if (withParsed.initialSetupCurlCommand) {
        const p = parseCurlRegistrationSpec(withParsed.initialSetupCurlCommand);
        const bodyKeys = extractBodyKeysFromCurl(
          withParsed.initialSetupCurlCommand
        );
        withParsed.initialParsed = {
          method: p.method,
          url: p.url,
          contentType: p.contentType,
          headersRedacted: redactHeadersForLog(p.headers),
          bodyKeys,
        };
      }
      if (typeof withParsed.initialFields === "undefined") {
        withParsed.initialFields = await deriveFieldsFromDocsForAdmin(
          adminId,
          withParsed.initialSetupDocsUrl
        );
      }
    } catch {}

    return NextResponse.json(
      { success: true, onboarding: withParsed },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ Failed to get onboarding config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load onboarding config" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT /api/admin/onboarding
export async function PUT(request: NextRequest) {
  try {
    const adminVerification = await verifyAdminAccessFromCookie(request);
    if (!adminVerification.isValid || !adminVerification.adminId) {
      return NextResponse.json(
        {
          success: false,
          error: adminVerification.error || "Authentication failed",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const adminId = adminVerification.adminId;
    const body = await request.json();
    const onboardingUpdates: Partial<OnboardingSettings> =
      body.onboarding || body;

    // Allow minimal updates: if any cURL is provided, auto-enable onboarding
    const hasCurl =
      (typeof onboardingUpdates.curlCommand === "string" &&
        onboardingUpdates.curlCommand.trim().length > 0) ||
      (typeof (onboardingUpdates as any).authCurlCommand === "string" &&
        (onboardingUpdates as any).authCurlCommand.trim().length > 0) ||
      (typeof onboardingUpdates.initialSetupCurlCommand === "string" &&
        onboardingUpdates.initialSetupCurlCommand.trim().length > 0);
    const shouldEnable =
      hasCurl || typeof onboardingUpdates.enabled === "boolean"
        ? onboardingUpdates.enabled ?? true
        : undefined;

    // Merge with existing settings to preserve defaults
    const current = await getAdminSettings(adminId);
    let merged: OnboardingSettings = {
      ...(current.onboarding || { enabled: false }),
      ...onboardingUpdates,
      ...(shouldEnable === undefined ? {} : { enabled: shouldEnable }),
    } as OnboardingSettings;

    try {
      if (merged.curlCommand) {
        const p = parseCurlRegistrationSpec(merged.curlCommand);
        const bodyKeys = extractBodyKeysFromCurl(merged.curlCommand);
        merged = {
          ...merged,
          registrationParsed: {
            method: p.method,
            url: p.url,
            contentType: p.contentType,
            headersRedacted: redactHeadersForLog(p.headers),
            bodyKeys,
          },
        };
      }
      if ((merged as any).authCurlCommand) {
        const ac = (merged as any).authCurlCommand as string;
        const p = parseCurlRegistrationSpec(ac);
        const bodyKeys = extractBodyKeysFromCurl(ac);
        merged = {
          ...merged,
          authParsed: {
            method: p.method,
            url: p.url,
            contentType: p.contentType,
            headersRedacted: redactHeadersForLog(p.headers),
            bodyKeys,
          },
        };
      }
      if (merged.initialSetupCurlCommand) {
        const ic = merged.initialSetupCurlCommand;
        const p = parseCurlRegistrationSpec(ic);
        const bodyKeys = extractBodyKeysFromCurl(ic);
        merged = {
          ...merged,
          initialParsed: {
            method: p.method,
            url: p.url,
            contentType: p.contentType,
            headersRedacted: redactHeadersForLog(p.headers),
            bodyKeys,
          },
        };
      }

      // Fill fields from docs only when undefined (first-run)
      if (typeof merged.registrationFields === "undefined") {
        try {
          merged.registrationFields = await deriveFieldsFromDocsForAdmin(
            adminId,
            merged.docsUrl
          );
        } catch {}
      }
      if (typeof merged.authFields === "undefined") {
        try {
          merged.authFields = await deriveFieldsFromDocsForAdmin(
            adminId,
            (merged as any).authDocsUrl
          );
        } catch {}
      }
      if (typeof merged.initialFields === "undefined") {
        try {
          merged.initialFields = await deriveFieldsFromDocsForAdmin(
            adminId,
            merged.initialSetupDocsUrl
          );
        } catch {}
      }
    } catch {}

    const updated = await updateAdminSettings(
      adminId,
      { onboarding: merged },
      adminId
    );

    return NextResponse.json(
      { success: true, onboarding: updated.onboarding },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ Failed to update onboarding config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update onboarding config" },
      { status: 500, headers: corsHeaders }
    );
  }
}
