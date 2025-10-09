import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";

/**
 * POST /api/booking/[id]/cancel
 * Cancel a booking by ID
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const cancelled = await bookingService.cancelBooking(bookingId);
    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: "Booking not found or already cancelled" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Booking cancelled",
      data: {
        bookingId
      }
    });
  } catch (error) {
    console.error("❌ Booking cancel error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to cancel booking",
      },
      { status: 500 }
    );
  }
}