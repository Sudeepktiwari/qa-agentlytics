import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSettings,
  updateAdminSettings,
  OnboardingSettings,
  OnboardingField,
} from "@/lib/adminSettings";
import {
  parseCurlRegistrationSpec,
  deriveOnboardingFieldsFromCurl,
  extractBodyKeysFromCurl,
  redactHeadersForLog,
} from "@/lib/curl";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import OpenAI from "openai";
import { getChunksByPageUrl, querySimilarChunks } from "@/lib/chroma";

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

async function deriveFieldsFromDocs(
  adminId: string,
  docsUrl?: string
): Promise<OnboardingField[]> {
  let chunks: string[] = [];
  try {
    if (docsUrl) {
      const pageChunks = await getChunksByPageUrl(adminId, docsUrl);
      if (Array.isArray(pageChunks) && pageChunks.length > 0)
        chunks = pageChunks as string[];
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
  const keys = new Set<string>();
  for (const chunk of chunks) {
    const text = (chunk || "").slice(0, 2000);
    const jsonKeyMatches = [
      ...text.matchAll(/\b["']([a-zA-Z_][a-zA-Z0-9_\-]*)["']\s*:/g),
    ];
    for (const m of jsonKeyMatches) keys.add(m[1]);
    const paramMatches = [
      ...text.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_\-]*)\s*=/g),
    ];
    for (const m of paramMatches) keys.add(m[1]);
  }
  const toType = (k: string): OnboardingField["type"] =>
    /email/i.test(k) ? "email" : /phone/i.test(k) ? "phone" : "text";
  const toLabel = (k: string) =>
    k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return Array.from(keys)
    .slice(0, 50)
    .map(
      (k) =>
        ({
          key: k,
          label: toLabel(k),
          required: true,
          type: toType(k),
        } as OnboardingField)
    );
}

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
      // Fallback: derive registration fields from docs if empty and no body keys
      if (
        !withParsed.registrationFields ||
        withParsed.registrationFields.length === 0
      ) {
        const keys = withParsed.registrationParsed?.bodyKeys || [];
        if (!keys || keys.length === 0) {
          withParsed.registrationFields = await deriveFieldsFromDocs(
            adminId,
            withParsed.docsUrl
          );
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
      if (!withParsed.authFields || withParsed.authFields.length === 0) {
        const keys = withParsed.authParsed?.bodyKeys || [];
        if (!keys || keys.length === 0) {
          withParsed.authFields = await deriveFieldsFromDocs(
            adminId,
            (withParsed as any).authDocsUrl
          );
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
      if (!withParsed.initialFields || withParsed.initialFields.length === 0) {
        const keys = withParsed.initialParsed?.bodyKeys || [];
        if (!keys || keys.length === 0) {
          withParsed.initialFields = await deriveFieldsFromDocs(
            adminId,
            withParsed.initialSetupDocsUrl
          );
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
          registrationFields:
            merged.registrationFields && merged.registrationFields.length > 0
              ? merged.registrationFields
              : bodyKeys.length > 0
              ? (deriveOnboardingFieldsFromCurl(merged.curlCommand).map(
                  (f) => ({
                    key: f.key,
                    label: f.label,
                    required: f.required,
                    type: f.type,
                  })
                ) as OnboardingField[])
              : merged.registrationFields || [],
        };
        // If existing fields don't match cURL-derived keys, and cURL has keys, replace with cURL-derived
        if (
          bodyKeys.length > 0 &&
          merged.registrationFields &&
          merged.registrationFields.length > 0
        ) {
          const existingKeys = new Set(
            merged.registrationFields.map((f) => f.key)
          );
          const derived = merged.curlCommand
            ? deriveOnboardingFieldsFromCurl(merged.curlCommand)
            : [];
          const derivedKeys = new Set(derived.map((f) => f.key));
          const mismatch =
            bodyKeys.some((k) => !existingKeys.has(k)) ||
            merged.registrationFields.some((f) => !derivedKeys.has(f.key));
          if (mismatch) {
            merged.registrationFields = derived.map((f) => ({
              key: f.key,
              label: f.label,
              required: f.required,
              type: f.type,
            }));
          }
        }
        if (
          (!merged.registrationFields ||
            merged.registrationFields.length === 0) &&
          bodyKeys.length === 0
        ) {
          merged.registrationFields = await (async () => {
            let docsFields: OnboardingField[] = [];
            try {
              docsFields = await deriveFieldsFromDocs(adminId, merged.docsUrl);
            } catch {}
            return docsFields;
          })();
        }
      }
      if ((merged as any).authCurlCommand) {
        const ac = (merged as any).authCurlCommand as string;
        const p = parseCurlRegistrationSpec(ac);
        const bodyKeys = extractBodyKeysFromCurl(ac);
        const defaultAuthFields: OnboardingField[] = bodyKeys.map((k) => ({
          key: k,
          label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          required: true,
          type: (/email/i.test(k)
            ? "email"
            : /phone/i.test(k)
            ? "phone"
            : "text") as OnboardingField["type"],
        }));
        merged = {
          ...merged,
          authParsed: {
            method: p.method,
            url: p.url,
            contentType: p.contentType,
            headersRedacted: redactHeadersForLog(p.headers),
            bodyKeys,
          },
          authFields:
            merged.authFields && merged.authFields.length > 0
              ? merged.authFields
              : bodyKeys.length > 0
              ? defaultAuthFields
              : merged.authFields || [],
        };
        if (
          bodyKeys.length > 0 &&
          merged.authFields &&
          merged.authFields.length > 0
        ) {
          const existingKeys = new Set(merged.authFields.map((f) => f.key));
          const derived = deriveOnboardingFieldsFromCurl(ac);
          const derivedKeys = new Set(derived.map((f) => f.key));
          const mismatch =
            bodyKeys.some((k) => !existingKeys.has(k)) ||
            merged.authFields.some((f) => !derivedKeys.has(f.key));
          if (mismatch) {
            merged.authFields = derived.map((f) => ({
              key: f.key,
              label: f.label,
              required: f.required,
              type: f.type,
            }));
          }
        }
        if (
          (!merged.authFields || merged.authFields.length === 0) &&
          bodyKeys.length === 0
        ) {
          try {
            merged.authFields = await deriveFieldsFromDocs(
              adminId,
              (merged as any).authDocsUrl
            );
          } catch {}
        }
      }
      if (merged.initialSetupCurlCommand) {
        const ic = merged.initialSetupCurlCommand;
        const p = parseCurlRegistrationSpec(ic);
        const bodyKeys = extractBodyKeysFromCurl(ic);
        const defaultInitialFields: OnboardingField[] = bodyKeys.map((k) => ({
          key: k,
          label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          required: true,
          type: (/email/i.test(k)
            ? "email"
            : /phone/i.test(k)
            ? "phone"
            : "text") as OnboardingField["type"],
        }));
        merged = {
          ...merged,
          initialParsed: {
            method: p.method,
            url: p.url,
            contentType: p.contentType,
            headersRedacted: redactHeadersForLog(p.headers),
            bodyKeys,
          },
          initialFields:
            merged.initialFields && merged.initialFields.length > 0
              ? merged.initialFields
              : bodyKeys.length > 0
              ? defaultInitialFields
              : merged.initialFields || [],
        };
        if (
          bodyKeys.length > 0 &&
          merged.initialFields &&
          merged.initialFields.length > 0
        ) {
          const existingKeys = new Set(merged.initialFields.map((f) => f.key));
          const derived = deriveOnboardingFieldsFromCurl(ic);
          const derivedKeys = new Set(derived.map((f) => f.key));
          const mismatch =
            bodyKeys.some((k) => !existingKeys.has(k)) ||
            merged.initialFields.some((f) => !derivedKeys.has(f.key));
          if (mismatch) {
            merged.initialFields = derived.map((f) => ({
              key: f.key,
              label: f.label,
              required: f.required,
              type: f.type,
            }));
          }
        }
        if (
          (!merged.initialFields || merged.initialFields.length === 0) &&
          bodyKeys.length === 0
        ) {
          try {
            merged.initialFields = await deriveFieldsFromDocs(
              adminId,
              merged.initialSetupDocsUrl
            );
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
