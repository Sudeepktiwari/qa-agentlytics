import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";

/**
 * Admin Dashboard Statistics API
 * GET: Retrieve booking statistics for admin dashboard
 */

export async function GET(request: NextRequest) {
  try {
    // Admin interface is always enabled (core feature)

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
