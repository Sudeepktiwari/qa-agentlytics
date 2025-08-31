import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { FeatureFlags } from "@/lib/javascriptSafety";

/**
 * Admin Dashboard Statistics API
 * GET: Retrieve booking statistics for admin dashboard
 */

export async function GET(request: NextRequest) {
  try {
    // Check if admin features are enabled
    if (!FeatureFlags.ENABLE_ADMIN_INTERFACE) {
      return NextResponse.json(
        { error: "Admin interface is not enabled" },
        { status: 503 }
      );
    }

    const stats = await bookingService.getDashboardStats();

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Admin dashboard stats API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard statistics",
      },
      { status: 500 }
    );
  }
}
