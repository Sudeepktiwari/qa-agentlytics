import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { verifyAdminAccess } from "@/lib/auth";

/**
 * Admin Dashboard Statistics API
 * GET: Retrieve booking statistics for admin dashboard
 */

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication and get adminId
    const authResult = verifyAdminAccess(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error || "Authentication required" },
        { status: 401 }
      );
    }

    const authenticatedAdminId = authResult.adminId!;

    // Get stats filtered by admin ID to ensure tenant isolation
    const stats = await bookingService.getDashboardStats(authenticatedAdminId);

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
