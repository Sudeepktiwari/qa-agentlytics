import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";

/**
 * Admin Bulk Actions API
 * POST: Perform bulk operations on bookings
 */

export async function POST(request: NextRequest) {
  try {
    // Admin interface is always enabled (core feature)

    const body = await request.json();
    const { action, bookingIds, updates } = body;

    if (!action || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Action and booking IDs are required" },
        { status: 400 }
      );
    }

    let result;
    let message;

    switch (action) {
      case "updateStatus":
        if (!updates?.status) {
          return NextResponse.json(
            {
              success: false,
              error: "Status is required for updateStatus action",
            },
            { status: 400 }
          );
        }
        result = await bookingService.bulkUpdateStatus(
          bookingIds,
          updates.status
        );
        message = `Updated ${result} bookings to ${updates.status}`;
        break;

      case "delete":
        let deleteCount = 0;
        for (const bookingId of bookingIds) {
          const deleted = await bookingService.deleteBooking(bookingId);
          if (deleted) deleteCount++;
        }
        result = deleteCount;
        message = `Deleted ${deleteCount} bookings`;
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Supported: updateStatus, delete",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: { affectedCount: result },
      message,
    });
  } catch (error) {
    console.error("❌ Admin bulk actions API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to perform bulk action",
      },
      { status: 500 }
    );
  }
}
