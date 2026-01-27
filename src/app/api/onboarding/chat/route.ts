import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyApiKey } from "@/lib/auth";
import { createOrUpdateLead } from "@/lib/leads";
import { getAdminSettings } from "@/lib/adminSettings";
import {
  onboardingService,
  enrichFieldsWithReasons,
} from "@/services/onboardingService";

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
        { status: 401, headers: corsHeaders },
      );
    }

    const adminId = keyInfo.adminId;
    const body = await request.json();
    const action = String(body.action || "");
    const payload = (body.payload || {}) as Record<string, any>;

    if (action === "get_initial_fields") {
      const settings = await getAdminSettings(adminId);
      let fields = (settings.onboarding as any)?.initialFields || [];
      let additionalSteps = settings.onboarding?.additionalSteps || [];

      // Enrich fields with reasons from docs
      try {
        fields = await enrichFieldsWithReasons(adminId, fields);
        if (additionalSteps.length > 0) {
          additionalSteps = await Promise.all(
            additionalSteps.map(async (step: any) => {
              if (step.fields && step.fields.length > 0) {
                return {
                  ...step,
                  fields: await enrichFieldsWithReasons(adminId, step.fields),
                };
              }
              return step;
            }),
          );
        }
      } catch (e) {
        console.error("Failed to enrich fields with reasons", e);
      }

      return NextResponse.json(
        { success: true, fields, additionalSteps },
        { status: 200, headers: corsHeaders },
      );
    }

    if (action === "answer_question") {
      const question = String(payload.question || "");
      if (!question) {
        return NextResponse.json(
          { success: false, error: "Question required" },
          { status: 400, headers: corsHeaders },
        );
      }
      const answer = await onboardingService.answerQuestion(adminId, question);
      return NextResponse.json(
        { success: true, answer },
        { status: 200, headers: corsHeaders },
      );
    }

    if (action === "additional_step") {
      const stepId = String(body.stepId || "");
      if (!stepId) {
        return NextResponse.json(
          { success: false, error: "stepId required" },
          { status: 400, headers: corsHeaders },
        );
      }
      const result = await onboardingService.executeAdditionalStep(
        stepId,
        payload,
        adminId,
      );

      if (result.success) {
        try {
          const { __authToken, __apiKey, __sessionId, ...safePayload } =
            payload;
          const sessionId = String(
            (payload as any)?.__sessionId || `onboarding_${Date.now()}`,
          );
          const db = await (await import("@/lib/mongo")).getDb();
          const sessions = db.collection("onboardingSessions");
          await sessions.updateOne(
            { sessionId },
            {
              $push: {
                stepsExecuted: {
                  stepId,
                  timestamp: new Date(),
                  payload: safePayload,
                  response: result.responseBody,
                },
              } as any,
              $set: {
                updatedAt: new Date(),
              },
              $setOnInsert: {
                createdAt: new Date(),
                adminId,
                status: "in_progress",
              },
            },
            { upsert: true },
          );
        } catch (e) {
          console.error("[Onboarding] Failed to persist additional step", e);
        }
      }

      return NextResponse.json(result, {
        status: result.status || 200,
        headers: corsHeaders,
      });
    }

    if (action === "register") {
      const result = await onboardingService.register(payload, adminId);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || "Registration failed" },
          { status: result.status || 400, headers: corsHeaders },
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

      let initialFields = (settings.onboarding as any)?.initialFields || [];
      let additionalSteps = settings.onboarding?.additionalSteps || [];

      // Enrich fields with reasons from docs
      try {
        initialFields = await enrichFieldsWithReasons(adminId, initialFields);
        if (additionalSteps.length > 0) {
          additionalSteps = await Promise.all(
            additionalSteps.map(async (step: any) => {
              if (step.fields && step.fields.length > 0) {
                return {
                  ...step,
                  fields: await enrichFieldsWithReasons(adminId, step.fields),
                };
              }
              return step;
            }),
          );
        }
      } catch (e) {
        console.error("Failed to enrich fields with reasons", e);
      }

      return NextResponse.json(
        {
          success: true,
          authToken: authToken || null,
          authApiKey: authApiKey || null,
          authType: authType || null,
          authDebug: hasAuth && authRes?.debug ? authRes.debug : null,
          initialFields,
          additionalSteps,
        },
        { status: 200, headers: corsHeaders },
      );
    }

    if (action === "initial_setup") {
      const result = await onboardingService.initialSetup(payload, adminId);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || "Initial setup failed" },
          { status: result.status || 400, headers: corsHeaders },
        );
      }
      try {
        const emailCandidates: string[] = [];
        for (const [k, v] of Object.entries(payload || {})) {
          const lk = String(k).toLowerCase();
          if (
            typeof v === "string" &&
            v.includes("@") &&
            lk.includes("email")
          ) {
            emailCandidates.push(v);
          }
        }
        const email =
          emailCandidates[0] ||
          String(
            (payload as any)?.__userEmail || (payload as any)?.email || "",
          ).trim();
        const sessionId = String(
          (payload as any)?.__sessionId || `onboarding_${Date.now()}`,
        );
        const EmailSchema = z.string().email().max(254);
        if (email && EmailSchema.safeParse(email).success) {
          await createOrUpdateLead(
            adminId,
            email,
            sessionId,
            null,
            undefined,
            "Initial setup completed",
            { detectedIntent: "onboarding_initial_setup" },
          );
        }
        // Persist onboarding session state regardless of email presence
        try {
          const db = await (await import("@/lib/mongo")).getDb();
          const sessions = db.collection("onboardingSessions");
          await sessions.updateOne(
            { sessionId },
            {
              $set: {
                sessionId,
                adminId,
                status: "completed",
                collectedData: payload,
                updatedAt: new Date(),
              },
              $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true },
          );
        } catch (sessErr) {
          console.error("[Onboarding] Session persistence error", sessErr);
        }
        console.log(
          "[Onboarding] Lead persistence attempted for adminId",
          adminId,
        );
      } catch (e) {
        console.error("[Onboarding] Lead persistence error", e);
      }
      return NextResponse.json(
        { success: true, responseBody: result.responseBody || null },
        { status: 200, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      { success: false, error: "Unknown action" },
      { status: 400, headers: corsHeaders },
    );
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Server error" },
      { status: 500, headers: corsHeaders },
    );
  }
}
