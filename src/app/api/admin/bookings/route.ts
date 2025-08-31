import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { FeatureFlags } from "@/lib/javascriptSafety";

/**
 * Admin API for managing bookings
 * GET: Retrieve bookings with filtering and pagination
 * PUT: Update booking status and admin notes
 * DELETE: Delete a booking
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

    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") as any;
    const requestType = searchParams.get("requestType") as any;
    const priority = searchParams.get("priority") as any;
    const adminId = searchParams.get("adminId") || undefined;
    const searchTerm = searchParams.get("search") || undefined;

    // Date range filtering
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    let dateRange = undefined;
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    const filters = {
      status,
      requestType,
      priority,
      adminId,
      searchTerm,
      dateRange,
    };

    // Remove undefined values
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const result = await bookingService.getAllBookings(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error("❌ Admin bookings API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!FeatureFlags.ENABLE_ADMIN_INTERFACE) {
      return NextResponse.json(
        { error: "Admin interface is not enabled" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { bookingId, updates } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { success: false, error: "Updates object is required" },
        { status: 400 }
      );
    }

    const updatedBooking = await bookingService.updateBookingWithAdminNotes(
      bookingId,
      updates
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("❌ Admin booking update error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update booking",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!FeatureFlags.ENABLE_ADMIN_INTERFACE) {
      return NextResponse.json(
        { error: "Admin interface is not enabled" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const deleted = await bookingService.deleteBooking(bookingId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Booking not found or could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("❌ Admin booking delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete booking",
      },
      { status: 500 }
    );
  }
}
