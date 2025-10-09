import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";

/**
 * POST /api/booking/[id]/reschedule/init
 * Initialize the reschedule process for a booking
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookingId = id;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get the booking to verify it exists and can be rescheduled
    const booking = await bookingService.getBookingById(bookingId);
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking can be rescheduled (not cancelled or completed)
    if (["cancelled", "completed"].includes(booking.status)) {
      return NextResponse.json(
        { success: false, error: "Cannot reschedule a cancelled or completed booking" },
        { status: 400 }
      );
    }

    // Return success to indicate reschedule process can begin
    return NextResponse.json({ 
      success: true, 
      message: "Reschedule process initiated",
      data: {
        bookingId,
        currentDate: booking.preferredDate,
        currentTime: booking.preferredTime,
        status: booking.status
      }
    });
  } catch (error) {
    console.error("❌ Booking reschedule init error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to initialize reschedule process",
      },
      { status: 500 }
    );
  }
}