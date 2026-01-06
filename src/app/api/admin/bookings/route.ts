import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { verifyAdminAccessFromCookie } from "@/lib/auth";
import type { BookingFilters } from "@/services/bookingService";
import { z } from "zod";
import { assertBodyConstraints } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";

/**
 * Admin API for managing bookings
 * GET: Retrieve bookings with filtering and pagination
 * PUT: Update booking status and admin notes
 * DELETE: Delete a booking
 */

export async function GET(request: NextRequest) {
  try {
    const rl = await rateLimit(request, "auth");
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }
    console.log("📋 Admin Bookings - GET request received");

    // Verify admin authentication
    const authResult = verifyAdminAccessFromCookie(request);
    console.log("🔍 Admin Bookings - Auth result:", authResult);

    if (!authResult.isValid) {
      console.log(
        "❌ Admin Bookings - Authentication failed:",
        authResult.error
      );
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    console.log(
      "✅ Admin Bookings - Authentication successful for admin:",
      authResult.adminId
    );

    const authenticatedAdminId = authResult.adminId!;

    const { searchParams } = new URL(request.url);

    // Extract and validate query parameters against allowed literals
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const allowedStatus = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
    ] as const;
    const allowedRequestTypes = [
      "demo",
      "call",
      "support",
      "consultation",
    ] as const;
    const allowedPriority = ["low", "medium", "high", "urgent"] as const;

    const rawStatus = searchParams.get("status");
    const status =
      rawStatus && (allowedStatus as readonly string[]).includes(rawStatus)
        ? (rawStatus as (typeof allowedStatus)[number])
        : undefined;

    const rawRequestType = searchParams.get("requestType");
    const requestType =
      rawRequestType &&
      (allowedRequestTypes as readonly string[]).includes(rawRequestType)
        ? (rawRequestType as (typeof allowedRequestTypes)[number])
        : undefined;

    const rawPriority = searchParams.get("priority");
    const priority =
      rawPriority &&
      (allowedPriority as readonly string[]).includes(rawPriority)
        ? (rawPriority as (typeof allowedPriority)[number])
        : undefined;

    const searchTerm = searchParams.get("search") || undefined;

    // SECURITY: Force adminId to be the authenticated admin's ID
    // This ensures admins can only see their own bookings
    const adminId = authenticatedAdminId;

    // Date range filtering
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    let dateRange = undefined as BookingFilters["dateRange"];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        dateRange = { start, end };
      }
    }

    const filters: BookingFilters = {
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
    const rl = await rateLimit(request, "auth");
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }
    // Verify admin authentication
    const authResult = verifyAdminAccessFromCookie(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error || "Authentication required" },
        { status: 401 }
      );
    }

    const authenticatedAdminId = authResult.adminId!;

    const body = await request.json();
    assertBodyConstraints(body, { maxBytes: 64 * 1024, maxDepth: 6 });
    const BodySchema = z
      .object({
        bookingId: z.string().min(1).max(64),
        updates: z
          .object({
            status: z.string().min(1).max(32).optional(),
            notes: z.string().min(0).max(2000).optional(),
            priority: z.string().min(1).max(16).optional(),
          })
          .passthrough(),
      })
      .strict();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { bookingId, updates } = parsed.data;

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

    // SECURITY: Ensure admin can only update their own bookings
    // First verify the booking belongs to this admin
    const existingBooking = await bookingService.getBookingById(bookingId);
    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking belongs to authenticated admin
    if (
      existingBooking.adminId &&
      existingBooking.adminId !== authenticatedAdminId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied: You can only modify your own bookings",
        },
        { status: 403 }
      );
    }

    const allowedStatus = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
    ] as const;
    const allowedPriority = ["low", "medium", "high", "urgent"] as const;
    const sanitizedStatus =
      updates.status &&
      (allowedStatus as readonly string[]).includes(updates.status)
        ? (updates.status as (typeof allowedStatus)[number])
        : undefined;
    const sanitizedPriority =
      updates.priority &&
      (allowedPriority as readonly string[]).includes(updates.priority)
        ? (updates.priority as (typeof allowedPriority)[number])
        : undefined;

    const secureUpdates = {
      adminId: authenticatedAdminId,
      status: sanitizedStatus,
      priority: sanitizedPriority,
      adminNotes: updates.notes,
    };

    const updatedBooking = await bookingService.updateBookingWithAdminNotes(
      bookingId,
      secureUpdates
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
    // Verify admin authentication
    const authResult = verifyAdminAccessFromCookie(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error || "Authentication required" },
        { status: 401 }
      );
    }

    const authenticatedAdminId = authResult.adminId!;

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // SECURITY: Verify booking belongs to authenticated admin before deletion
    const existingBooking = await bookingService.getBookingById(bookingId);
    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking belongs to authenticated admin
    if (
      existingBooking.adminId &&
      existingBooking.adminId !== authenticatedAdminId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied: You can only delete your own bookings",
        },
        { status: 403 }
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
