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
    const urlObj = new URL(request.url);
    const debug = urlObj.searchParams.get("debug") === "true";
    const derive = (urlObj.searchParams.get("derive") || "").toLowerCase();
    const debugTrace: any[] = [];
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
    const sanitize = (s?: string) => {
      if (!s || typeof s !== "string") return s;
      const t = s.trim();
      return t.replace(/^`+|`+$/g, "").replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "");
    };
    const docsUrlQ = sanitize(urlObj.searchParams.get("docsUrl") || undefined);
    const curlQ = sanitize(urlObj.searchParams.get("curl") || undefined);
    const docsUrlSan = sanitize(onboarding.docsUrl);
    const authDocsUrlSan = sanitize((onboarding as any).authDocsUrl);
    const initialDocsUrlSan = sanitize(onboarding.initialSetupDocsUrl);
    const curlSan = sanitize(onboarding.curlCommand);
    const authCurlSan = sanitize((onboarding as any).authCurlCommand);
    const initialCurlSan = sanitize(onboarding.initialSetupCurlCommand);
    if (debug) {
      debugTrace.push({ step: "inputs", registration: { docsUrl: docsUrlSan }, auth: { docsUrl: authDocsUrlSan }, initial: { docsUrl: initialDocsUrlSan } });
    }

    // Derive-only mode: return spec for requested section without persisting
    if (derive === "registration" || derive === "auth" || derive === "initial") {
      try {
        const spec = await deriveSpecFromDocsForAdmin(
          adminId,
          derive === "registration" ? (docsUrlQ || docsUrlSan) : derive === "auth" ? (docsUrlQ || authDocsUrlSan) : (docsUrlQ || initialDocsUrlSan),
          derive as any,
          derive === "registration" ? (curlQ || curlSan) : derive === "auth" ? (curlQ || (authCurlSan as any)) : (curlQ || initialCurlSan)
        );
        if (debug) {
          debugTrace.push({ step: `derive_${derive}`, docsUrl: derive === "registration" ? (docsUrlQ || docsUrlSan) : derive === "auth" ? (docsUrlQ || authDocsUrlSan) : (docsUrlQ || initialDocsUrlSan), bodyCount: spec.body.length, headersCount: spec.headers.length, responseCount: spec.response.length, previewBody: spec.body.slice(0, 5) });
        }
        return NextResponse.json(
          { success: true, spec, ...(debug ? { debug: debugTrace } : {}) },
          { status: 200, headers: corsHeaders }
        );
      } catch (e) {
        return NextResponse.json(
          { success: false, error: "Failed to derive spec", ...(debug ? { debug: debugTrace } : {}) },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    const withParsed = { ...onboarding } as OnboardingSettings;
    withParsed.docsUrl = docsUrlSan;
    (withParsed as any).authDocsUrl = authDocsUrlSan;
    withParsed.initialSetupDocsUrl = initialDocsUrlSan;

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
          const spec = await deriveSpecFromDocsForAdmin(adminId, docsUrlSan, "registration", withParsed.curlCommand);
          if (debug) {
            debugTrace.push({ step: "derive_registration", docsUrl: docsUrlSan, bodyCount: spec.body.length, headersCount: spec.headers.length, responseCount: spec.response.length, previewBody: spec.body.slice(0, 5) });
          }
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
          const spec = await deriveSpecFromDocsForAdmin(adminId, docsUrlSan, "registration", withParsed.curlCommand);
          if (needBody) withParsed.registrationFields = spec.body;
          if (needHeaders) (withParsed as any).registrationHeaders = spec.headers;
          if (needResp) (withParsed as any).registrationResponseFields = spec.response;
          if (!(withParsed as any).registrationHeaderFields) {
            (withParsed as any).registrationHeaderFields = (spec.headers || []).map((h: string) => ({ key: h, label: h.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), required: true, type: "text" }));
          }
          if (!(withParsed as any).registrationResponseFieldDefs) {
            (withParsed as any).registrationResponseFieldDefs = (spec.response || []).map((k: string) => ({ key: k, label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), required: false, type: "text" }));
          }
          if (debug) {
            debugTrace.push({ step: "fill_registration_first_run", docsUrl: docsUrlSan, bodyCount: spec.body.length, headersCount: spec.headers.length, responseCount: spec.response.length });
          }
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
          const spec = await deriveSpecFromDocsForAdmin(adminId, authDocsUrlSan, "auth", (withParsed as any).authCurlCommand as string);
          if (debug) {
            debugTrace.push({ step: "derive_auth", docsUrl: authDocsUrlSan, bodyCount: spec.body.length, headersCount: spec.headers.length, responseCount: spec.response.length, previewBody: spec.body.slice(0, 5) });
          }
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
          const spec = await deriveSpecFromDocsForAdmin(adminId, authDocsUrlSan, "auth", (withParsed as any).authCurlCommand as string);
          if (needBody) withParsed.authFields = spec.body;
          if (needHeaders) (withParsed as any).authHeaders = spec.headers;
          if (needResp) (withParsed as any).authResponseFields = spec.response;
          if (!(withParsed as any).authHeaderFields) {
            (withParsed as any).authHeaderFields = (spec.headers || []).map((h: string) => ({ key: h, label: h.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), required: true, type: "text" }));
          }
          if (!(withParsed as any).authResponseFieldDefs) {
            (withParsed as any).authResponseFieldDefs = (spec.response || []).map((k: string) => ({ key: k, label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), required: false, type: "text" }));
          }
          if (debug) {
            debugTrace.push({ step: "fill_auth_first_run", docsUrl: authDocsUrlSan, bodyCount: spec.body.length, headersCount: spec.headers.length, responseCount: spec.response.length });
          }
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
          const spec = await deriveSpecFromDocsForAdmin(adminId, initialDocsUrlSan, "initial", withParsed.initialSetupCurlCommand);
          if (debug) {
            debugTrace.push({ step: "derive_initial", docsUrl: initialDocsUrlSan, bodyCount: spec.body.length, headersCount: spec.headers.length, responseCount: spec.response.length, previewBody: spec.body.slice(0, 5) });
          }
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
          const spec = await deriveSpecFromDocsForAdmin(adminId, initialDocsUrlSan, "initial", withParsed.initialSetupCurlCommand);
          if (needBody) withParsed.initialFields = spec.body;
          if (needHeaders) (withParsed as any).initialHeaders = spec.headers;
          if (needResp) (withParsed as any).initialResponseFields = spec.response;
          if (!(withParsed as any).initialHeaderFields) {
            (withParsed as any).initialHeaderFields = (spec.headers || []).map((h: string) => ({ key: h, label: h.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), required: true, type: "text" }));
          }
          if (!(withParsed as any).initialResponseFieldDefs) {
            (withParsed as any).initialResponseFieldDefs = (spec.response || []).map((k: string) => ({ key: k, label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), required: false, type: "text" }));
          }
          if (debug) {
            debugTrace.push({ step: "fill_initial_first_run", docsUrl: initialDocsUrlSan, bodyCount: spec.body.length, headersCount: spec.headers.length, responseCount: spec.response.length });
          }
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
      { success: true, onboarding: withParsed, ...(debug ? { debug: debugTrace } : {}) },
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
    const urlObj = new URL(request.url);
    const debugQuery = urlObj.searchParams.get("debug") === "true";
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
    const debugFlag = Boolean((body && body.debug) || (onboardingUpdates as any).debug || debugQuery);
    const debugTrace: any[] = [];
    const sanitize = (s?: string) => {
      if (!s || typeof s !== "string") return s;
      const t = s.trim();
      return t.replace(/^`+|`+$/g, "").replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "");
    };

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

    merged.docsUrl = sanitize(merged.docsUrl);
    (merged as any).authDocsUrl = sanitize((merged as any).authDocsUrl);
    merged.initialSetupDocsUrl = sanitize(merged.initialSetupDocsUrl);
    merged.curlCommand = sanitize(merged.curlCommand);
    (merged as any).authCurlCommand = sanitize((merged as any).authCurlCommand);
    merged.initialSetupCurlCommand = sanitize(merged.initialSetupCurlCommand);
    if (debugFlag) {
      debugTrace.push({ step: "inputs", registration: { docsUrl: merged.docsUrl, curlCommand: merged.curlCommand }, auth: { docsUrl: (merged as any).authDocsUrl, curlCommand: (merged as any).authCurlCommand }, initial: { docsUrl: merged.initialSetupDocsUrl, curlCommand: merged.initialSetupCurlCommand }, flags: { regenRegistration: (onboardingUpdates as any).regenRegistration, regenAuth: (onboardingUpdates as any).regenAuth, regenInitial: (onboardingUpdates as any).regenInitial } });
    }

    // Explicit regeneration flags: force re-derivation of body fields
    try {
      const flags = onboardingUpdates as any;
      if (flags?.regenRegistration === true) {
        (merged as any).registrationFields = undefined;
        (merged as any).registrationHeaders = undefined;
        (merged as any).registrationResponseFields = undefined;
        (merged as any).registrationHeaderFields = undefined;
        (merged as any).registrationResponseFieldDefs = undefined;
      }
      if (flags?.regenAuth === true) {
        (merged as any).authFields = undefined;
        (merged as any).authHeaders = undefined;
        (merged as any).authResponseFields = undefined;
        (merged as any).authHeaderFields = undefined;
        (merged as any).authResponseFieldDefs = undefined;
      }
      if (flags?.regenInitial === true) {
        (merged as any).initialFields = undefined;
        (merged as any).initialHeaders = undefined;
        (merged as any).initialResponseFields = undefined;
        (merged as any).initialHeaderFields = undefined;
        (merged as any).initialResponseFieldDefs = undefined;
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

      // Fill fields from docs only when undefined (first-run) or when explicitly requested via regen flags
      {
        const needBody = !Array.isArray(merged.registrationFields) || (merged.registrationFields || []).length === 0;
        const needHeaders = !Array.isArray((merged as any).registrationHeaders) || (((merged as any).registrationHeaders || []).length === 0);
        const needResp = !Array.isArray((merged as any).registrationResponseFields) || (((merged as any).registrationResponseFields || []).length === 0);
        const flags = onboardingUpdates as any;
        const explicit = flags?.regenRegistration === true || flags?.regenAuth === true || flags?.regenInitial === true;
        const shouldDerive = explicit ? flags?.regenRegistration === true : (needBody || needHeaders || needResp);
        if (shouldDerive) {
          try {
            const spec = await deriveSpecFromDocsForAdmin(adminId, merged.docsUrl, "registration", merged.curlCommand);
            if (needBody) merged.registrationFields = spec.body;
            if (needHeaders) (merged as any).registrationHeaders = spec.headers;
            if (needResp) (merged as any).registrationResponseFields = spec.response;
            if (!(merged as any).registrationHeaderFields) {
              (merged as any).registrationHeaderFields = (spec.headers || []).map((h: string) => ({ key: h, label: h.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), required: true, type: "text" }));
            }
            if (!(merged as any).registrationResponseFieldDefs) {
              (merged as any).registrationResponseFieldDefs = (spec.response || []).map((k: string) => ({ key: k, label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), required: false, type: "text" }));
            }
            if (debugFlag) {
              debugTrace.push({ step: "derive_registration", docsUrl: merged.docsUrl, curlCommand: merged.curlCommand, bodyCount: spec.body.length, headersCount: spec.headers.length, responseCount: spec.response.length, previewBody: spec.body.slice(0, 5) });
            }
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
        } else if (debugFlag) {
          debugTrace.push({ step: "skip_registration", reason: explicit ? "explicit_regen_other_section" : "not_needed" });
        }
      }
      {
        const needBody = !Array.isArray(merged.authFields) || ((merged.authFields || []).length === 0);
        const needHeaders = !Array.isArray((merged as any).authHeaders) || (((merged as any).authHeaders || []).length === 0);
        const needResp = !Array.isArray((merged as any).authResponseFields) || (((merged as any).authResponseFields || []).length === 0);
        const flags2 = onboardingUpdates as any;
        const explicit2 = flags2?.regenRegistration === true || flags2?.regenAuth === true || flags2?.regenInitial === true;
        const shouldDerive2 = explicit2 ? flags2?.regenAuth === true : (needBody || needHeaders || needResp);
        if (shouldDerive2) {
          try {
            const spec = await deriveSpecFromDocsForAdmin(adminId, (merged as any).authDocsUrl, "auth", (merged as any).authCurlCommand as string);
            if (needBody) merged.authFields = spec.body;
            if (needHeaders) (merged as any).authHeaders = spec.headers;
            if (needResp) (merged as any).authResponseFields = spec.response;
            if (!(merged as any).authHeaderFields) {
              (merged as any).authHeaderFields = (spec.headers || []).map((h: string) => ({ key: h, label: h.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), required: true, type: "text" }));
            }
            if (!(merged as any).authResponseFieldDefs) {
              (merged as any).authResponseFieldDefs = (spec.response || []).map((k: string) => ({ key: k, label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), required: false, type: "text" }));
            }
            if (debugFlag) {
              debugTrace.push({ step: "derive_auth", docsUrl: (merged as any).authDocsUrl, curlCommand: (merged as any).authCurlCommand, bodyCount: spec.body.length, headersCount: spec.headers.length, responseCount: spec.response.length, previewBody: spec.body.slice(0, 5) });
            }
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
        } else if (debugFlag) {
          debugTrace.push({ step: "skip_auth", reason: explicit2 ? "explicit_regen_other_section" : "not_needed" });
        }
      }
      {
        const needBody = !Array.isArray(merged.initialFields) || ((merged.initialFields || []).length === 0);
        const needHeaders = !Array.isArray((merged as any).initialHeaders) || (((merged as any).initialHeaders || []).length === 0);
        const needResp = !Array.isArray((merged as any).initialResponseFields) || (((merged as any).initialResponseFields || []).length === 0);
        const flags3 = onboardingUpdates as any;
        const explicit3 = flags3?.regenRegistration === true || flags3?.regenAuth === true || flags3?.regenInitial === true;
        const shouldDerive3 = explicit3 ? flags3?.regenInitial === true : (needBody || needHeaders || needResp);
        if (shouldDerive3) {
          try {
            const spec = await deriveSpecFromDocsForAdmin(adminId, merged.initialSetupDocsUrl, "initial", merged.initialSetupCurlCommand);
            if (needBody) merged.initialFields = spec.body;
            if (needHeaders) (merged as any).initialHeaders = spec.headers;
            if (needResp) (merged as any).initialResponseFields = spec.response;
            if (!(merged as any).initialHeaderFields) {
              (merged as any).initialHeaderFields = (spec.headers || []).map((h: string) => ({ key: h, label: h.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), required: true, type: "text" }));
            }
            if (!(merged as any).initialResponseFieldDefs) {
              (merged as any).initialResponseFieldDefs = (spec.response || []).map((k: string) => ({ key: k, label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), required: false, type: "text" }));
            }
            if (debugFlag) {
              debugTrace.push({ step: "derive_initial", docsUrl: merged.initialSetupDocsUrl, curlCommand: merged.initialSetupCurlCommand, bodyCount: spec.body.length, headersCount: spec.headers.length, responseCount: spec.response.length, previewBody: spec.body.slice(0, 5) });
            }
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
        } else if (debugFlag) {
          debugTrace.push({ step: "skip_initial", reason: explicit3 ? "explicit_regen_other_section" : "not_needed" });
        }
      }
    } catch {}

    const updated = await updateAdminSettings(
      adminId,
      { onboarding: merged },
      adminId
    );

    if (debugFlag) {
      debugTrace.push({ step: "final_put_state", registration: { body: (updated.onboarding as any).registrationFields || [], headers: (updated.onboarding as any).registrationHeaders || [], response: (updated.onboarding as any).registrationResponseFields || [] }, auth: { body: (updated.onboarding as any).authFields || [], headers: (updated.onboarding as any).authHeaders || [], response: (updated.onboarding as any).authResponseFields || [] }, initial: { body: (updated.onboarding as any).initialFields || [], headers: (updated.onboarding as any).initialHeaders || [], response: (updated.onboarding as any).initialResponseFields || [] } });
    }
    return NextResponse.json(
      { success: true, onboarding: updated.onboarding, ...(debugFlag ? { debug: debugTrace } : {}) },
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
