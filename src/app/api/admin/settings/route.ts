/**
 * Admin Settings API
 * Manage feature flags and preferences per admin
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSettings,
  updateAdminSettings,
  createDefaultAdminSettings,
} from "@/lib/adminSettings";
import { verifyAdminAccessFromCookie } from "@/lib/auth";

// CORS headers for admin panel
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-admin-id, Authorization",
  "Access-Control-Max-Age": "86400",
};

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/admin/settings
 * Get admin settings (single admin or all admins)
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🏥 Admin settings GET request received");
    
    // Verify admin access using cookies
    const adminVerification = await verifyAdminAccessFromCookie(request);
    if (!adminVerification.isValid || !adminVerification.adminId) {
      console.log("❌ Admin verification failed:", adminVerification.error);
      return NextResponse.json(
        { success: false, error: adminVerification.error || "Authentication failed" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");

    // If specific adminId requested, return that admin's settings
    if (adminId) {
      console.log(`📋 Getting settings for specific admin: ${adminId}`);
      const settings = await getAdminSettings(adminId);
      return NextResponse.json({
        success: true,
        data: settings,
      }, { headers: corsHeaders });
    }

    // Get current admin's settings
    console.log(`📋 Getting settings for current admin: ${adminVerification.adminId}`);
    const settings = await getAdminSettings(adminVerification.adminId);

    return NextResponse.json({
      success: true,
      data: settings,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("❌ Admin settings GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get admin settings",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Update admin settings
 */
export async function PUT(request: NextRequest) {
  try {
    console.log("🏥 Admin settings PUT request received");
    
    // Verify admin access using cookies
    const adminVerification = await verifyAdminAccessFromCookie(request);
    if (!adminVerification.isValid || !adminVerification.adminId) {
      console.log("❌ Admin verification failed:", adminVerification.error);
      return NextResponse.json(
        { success: false, error: adminVerification.error || "Authentication failed" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { adminId, updates } = body;

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Admin ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!updates) {
      return NextResponse.json(
        { success: false, error: "Updates are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`📝 Updating settings for admin: ${adminId}, by: ${adminVerification.adminId}`);

    // Update the settings
    const updatedSettings = await updateAdminSettings(adminId, updates, adminVerification.adminId);

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: "Admin settings updated successfully",
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("❌ Admin settings PUT error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update admin settings",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/admin/settings
 * Create new admin settings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, email } = body;

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Admin ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if admin settings already exist
    try {
      const existingSettings = await getAdminSettings(adminId);
      if (existingSettings && !existingSettings._id?.startsWith("default-")) {
        return NextResponse.json(
          { success: false, error: "Admin settings already exist" },
          { status: 409, headers: corsHeaders }
        );
      }
    } catch (error) {
      // If getAdminSettings fails, proceed with creation
    }

    // Create new admin settings
    const newSettings = await createDefaultAdminSettings(adminId, email);

    return NextResponse.json({
      success: true,
      data: newSettings,
      message: "Admin settings created successfully",
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("❌ Admin settings POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create admin settings",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PATCH /api/admin/settings
 * Update specific feature flags
 */
export async function PATCH(request: NextRequest) {
  try {
    console.log("🏥 Admin settings PATCH request received");
    
    // Verify admin access using cookies
    const adminVerification = await verifyAdminAccessFromCookie(request);
    if (!adminVerification.isValid || !adminVerification.adminId) {
      console.log("❌ Admin verification failed:", adminVerification.error);
      return NextResponse.json(
        { success: false, error: adminVerification.error || "Authentication failed" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { adminId, feature, enabled } = body;

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Admin ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!feature) {
      return NextResponse.json(
        { success: false, error: "Feature name is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Enabled must be a boolean" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`🎛️ Updating feature ${feature} = ${enabled} for admin: ${adminId}, by: ${adminVerification.adminId}`);

    // Get current settings
    const currentSettings = await getAdminSettings(adminId);
    
    // Update the specific feature
    const updates = {
      features: {
        ...currentSettings.features,
        [feature]: enabled,
      },
    };

    const updatedSettings = await updateAdminSettings(adminId, updates, adminVerification.adminId);

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: `Feature ${feature} ${enabled ? "enabled" : "disabled"} successfully`,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("❌ Admin settings PATCH error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update feature flag",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
