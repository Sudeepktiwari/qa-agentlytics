import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSettings,
  updateAdminSettings,
  OnboardingSettings,
} from "@/lib/adminSettings";
import { verifyAdminAccessFromCookie } from "@/lib/auth";

// CORS headers for admin onboarding config
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-admin-id, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
}

// GET /api/admin/onboarding
export async function GET(request: NextRequest) {
  try {
    const adminVerification = await verifyAdminAccessFromCookie(request);
    if (!adminVerification.isValid || !adminVerification.adminId) {
      return NextResponse.json(
        { success: false, error: adminVerification.error || "Authentication failed" },
        { status: 401, headers: corsHeaders }
      );
    }

    const adminId = adminVerification.adminId;
    const settings = await getAdminSettings(adminId);

    return NextResponse.json(
      { success: true, onboarding: settings.onboarding || { enabled: false } },
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
        { success: false, error: adminVerification.error || "Authentication failed" },
        { status: 401, headers: corsHeaders }
      );
    }

    const adminId = adminVerification.adminId;
    const body = await request.json();
    const onboardingUpdates: Partial<OnboardingSettings> = body.onboarding || body;

    if (typeof onboardingUpdates.enabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "'enabled' must be provided as boolean" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Merge with existing settings to preserve defaults
    const current = await getAdminSettings(adminId);
    const merged: OnboardingSettings = {
      ...(current.onboarding || { enabled: false }),
      ...onboardingUpdates,
    } as OnboardingSettings;

    const updated = await updateAdminSettings(adminId, { onboarding: merged }, adminId);

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