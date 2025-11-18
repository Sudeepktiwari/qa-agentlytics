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
import { deriveFieldsFromDocsForAdmin, deriveSpecFromDocsForAdmin } from "@/services/onboardingService";

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
      if (!withParsed.registrationParsed?.bodyKeys || withParsed.registrationParsed.bodyKeys.length === 0) {
        let keysFromDocs: string[] = [];
        if ((withParsed.registrationFields || []).length > 0) {
          keysFromDocs = (withParsed.registrationFields || []).map((f) => f.key);
        } else {
          const spec = await deriveSpecFromDocsForAdmin(adminId, withParsed.docsUrl, "registration", withParsed.curlCommand);
          keysFromDocs = spec.body.map((f) => f.key);
        }
        withParsed.registrationParsed = {
          ...(withParsed.registrationParsed || { method: "POST" }),
          bodyKeys: keysFromDocs,
        };
      }
      // Derive registration fields only when undefined (first-run)
      {
        const needBody = typeof withParsed.registrationFields === "undefined";
        const needHeaders = typeof (withParsed as any).registrationHeaders === "undefined";
        const needResp = typeof (withParsed as any).registrationResponseFields === "undefined";
        if (needBody || needHeaders || needResp) {
          const spec = await deriveSpecFromDocsForAdmin(adminId, withParsed.docsUrl, "registration", withParsed.curlCommand);
          if (needBody) withParsed.registrationFields = spec.body;
          if (needHeaders) (withParsed as any).registrationHeaders = spec.headers;
          if (needResp) (withParsed as any).registrationResponseFields = spec.response;
          if (withParsed.registrationParsed && (!withParsed.registrationParsed.bodyKeys || withParsed.registrationParsed.bodyKeys.length === 0)) {
            withParsed.registrationParsed = {
              ...withParsed.registrationParsed,
              bodyKeys: spec.body.map((f) => f.key),
            };
          }
        }
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
      if (!withParsed.authParsed?.bodyKeys || withParsed.authParsed.bodyKeys.length === 0) {
        let keysFromDocs: string[] = [];
        if ((withParsed.authFields || []).length > 0) {
          keysFromDocs = (withParsed.authFields || []).map((f) => f.key);
        } else {
          const spec = await deriveSpecFromDocsForAdmin(adminId, (withParsed as any).authDocsUrl, "auth", (withParsed as any).authCurlCommand as string);
          keysFromDocs = spec.body.map((f) => f.key);
        }
        withParsed.authParsed = {
          ...(withParsed.authParsed || { method: "POST" }),
          bodyKeys: keysFromDocs,
        } as any;
      }
      {
        const needBody = typeof withParsed.authFields === "undefined";
        const needHeaders = typeof (withParsed as any).authHeaders === "undefined";
        const needResp = typeof (withParsed as any).authResponseFields === "undefined";
        if (needBody || needHeaders || needResp) {
          const spec = await deriveSpecFromDocsForAdmin(adminId, (withParsed as any).authDocsUrl, "auth", (withParsed as any).authCurlCommand as string);
          if (needBody) withParsed.authFields = spec.body;
          if (needHeaders) (withParsed as any).authHeaders = spec.headers;
          if (needResp) (withParsed as any).authResponseFields = spec.response;
          if (withParsed.authParsed && (!withParsed.authParsed.bodyKeys || withParsed.authParsed.bodyKeys.length === 0)) {
            withParsed.authParsed = {
              ...withParsed.authParsed,
              bodyKeys: spec.body.map((f) => f.key),
            };
          }
        }
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
      if (!withParsed.initialParsed?.bodyKeys || withParsed.initialParsed.bodyKeys.length === 0) {
        let keysFromDocs: string[] = [];
        if ((withParsed.initialFields || []).length > 0) {
          keysFromDocs = (withParsed.initialFields || []).map((f) => f.key);
        } else {
          const spec = await deriveSpecFromDocsForAdmin(adminId, withParsed.initialSetupDocsUrl, "initial", withParsed.initialSetupCurlCommand);
          keysFromDocs = spec.body.map((f) => f.key);
        }
        withParsed.initialParsed = {
          ...(withParsed.initialParsed || { method: "POST" }),
          bodyKeys: keysFromDocs,
        };
      }
      {
        const needBody = typeof withParsed.initialFields === "undefined";
        const needHeaders = typeof (withParsed as any).initialHeaders === "undefined";
        const needResp = typeof (withParsed as any).initialResponseFields === "undefined";
        if (needBody || needHeaders || needResp) {
          const spec = await deriveSpecFromDocsForAdmin(adminId, withParsed.initialSetupDocsUrl, "initial", withParsed.initialSetupCurlCommand);
          if (needBody) withParsed.initialFields = spec.body;
          if (needHeaders) (withParsed as any).initialHeaders = spec.headers;
          if (needResp) (withParsed as any).initialResponseFields = spec.response;
          if (withParsed.initialParsed && (!withParsed.initialParsed.bodyKeys || withParsed.initialParsed.bodyKeys.length === 0)) {
            withParsed.initialParsed = {
              ...withParsed.initialParsed,
              bodyKeys: spec.body.map((f) => f.key),
            };
          }
        }
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

    // Explicit regeneration flags: force re-derivation of body fields
    try {
      const flags = onboardingUpdates as any;
      if (flags?.regenRegistration === true) {
        (merged as any).registrationFields = undefined;
        (merged as any).registrationHeaders = undefined;
        (merged as any).registrationResponseFields = undefined;
      }
      if (flags?.regenAuth === true) {
        (merged as any).authFields = undefined;
        (merged as any).authHeaders = undefined;
        (merged as any).authResponseFields = undefined;
      }
      if (flags?.regenInitial === true) {
        (merged as any).initialFields = undefined;
        (merged as any).initialHeaders = undefined;
        (merged as any).initialResponseFields = undefined;
      }
    } catch {}

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
      {
        const needBody = typeof merged.registrationFields === "undefined";
        const needHeaders = typeof (merged as any).registrationHeaders === "undefined";
        const needResp = typeof (merged as any).registrationResponseFields === "undefined";
        if (needBody || needHeaders || needResp) {
          try {
            const spec = await deriveSpecFromDocsForAdmin(adminId, merged.docsUrl, "registration", merged.curlCommand);
            if (needBody) merged.registrationFields = spec.body;
            if (needHeaders) (merged as any).registrationHeaders = spec.headers;
            if (needResp) (merged as any).registrationResponseFields = spec.response;
            const flags = onboardingUpdates as any;
            if (flags?.regenRegistration === true) {
              merged.registrationParsed = {
                ...(merged.registrationParsed || { method: "POST" }),
                bodyKeys: spec.body.map((f) => f.key),
              };
            } else if (merged.registrationParsed && (!merged.registrationParsed.bodyKeys || merged.registrationParsed.bodyKeys.length === 0)) {
              merged.registrationParsed = {
                ...merged.registrationParsed,
                bodyKeys: spec.body.map((f) => f.key),
              };
            }
          } catch {}
        }
      }
      {
        const needBody = typeof merged.authFields === "undefined";
        const needHeaders = typeof (merged as any).authHeaders === "undefined";
        const needResp = typeof (merged as any).authResponseFields === "undefined";
        if (needBody || needHeaders || needResp) {
          try {
            const spec = await deriveSpecFromDocsForAdmin(adminId, (merged as any).authDocsUrl, "auth", (merged as any).authCurlCommand as string);
            if (needBody) merged.authFields = spec.body;
            if (needHeaders) (merged as any).authHeaders = spec.headers;
            if (needResp) (merged as any).authResponseFields = spec.response;
            const flags2 = onboardingUpdates as any;
            if (flags2?.regenAuth === true) {
              merged.authParsed = {
                ...(merged.authParsed || { method: "POST" }),
                bodyKeys: spec.body.map((f) => f.key),
              } as any;
            } else if (merged.authParsed && (!merged.authParsed.bodyKeys || merged.authParsed.bodyKeys.length === 0)) {
              merged.authParsed = {
                ...merged.authParsed,
                bodyKeys: spec.body.map((f) => f.key),
              } as any;
            }
          } catch {}
        }
      }
      {
        const needBody = typeof merged.initialFields === "undefined";
        const needHeaders = typeof (merged as any).initialHeaders === "undefined";
        const needResp = typeof (merged as any).initialResponseFields === "undefined";
        if (needBody || needHeaders || needResp) {
          try {
            const spec = await deriveSpecFromDocsForAdmin(adminId, merged.initialSetupDocsUrl, "initial", merged.initialSetupCurlCommand);
            if (needBody) merged.initialFields = spec.body;
            if (needHeaders) (merged as any).initialHeaders = spec.headers;
            if (needResp) (merged as any).initialResponseFields = spec.response;
            const flags3 = onboardingUpdates as any;
            if (flags3?.regenInitial === true) {
              merged.initialParsed = {
                ...(merged.initialParsed || { method: "POST" }),
                bodyKeys: spec.body.map((f) => f.key),
              };
            } else if (merged.initialParsed && (!merged.initialParsed.bodyKeys || merged.initialParsed.bodyKeys.length === 0)) {
              merged.initialParsed = {
                ...merged.initialParsed,
                bodyKeys: spec.body.map((f) => f.key),
              };
            }
          } catch {}
        }
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
