import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { verifyAdminAccessFromCookie } from "@/lib/auth";

/**
 * Admin Dashboard Statistics API
 * GET: Retrieve booking statistics for admin dashboard
 */

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Admin Dashboard - GET request received");
    
    // Verify admin authentication
    const authResult = verifyAdminAccessFromCookie(request);
    console.log("🔍 Admin Dashboard - Auth result:", authResult);
    
    if (!authResult.isValid) {
      console.log("❌ Admin Dashboard - Authentication failed:", authResult.error);
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    console.log("✅ Admin Dashboard - Authentication successful for admin:", authResult.adminId);

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
