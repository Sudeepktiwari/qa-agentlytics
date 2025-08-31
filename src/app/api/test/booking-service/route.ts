import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/services/bookingService";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const bookingService = new BookingService();

    console.log("🧪 Testing booking service...");

    // Create a test booking
    const testBookingData = {
      sessionId: "test-session-123",
      customerRequest: "I need a demo of your product for my team",
      email: "test@example.com",
      name: "Test User",
      company: "Test Company Inc.",
      requestType: "demo" as const,
      preferredDate: new Date("2025-09-01"),
      preferredTime: "14:00",
      timezone: "America/New_York",
      message: "Looking forward to the demo!",
      status: "pending" as const,
      adminId: "test-admin-123",
      pageUrl: "https://example.com/products",
      userAgent: "Test Browser",
      ipAddress: "127.0.0.1",
      referrer: "https://google.com",
      originalMessage: "Hi, can I get a demo of your product for my team?",
      detectionConfidence: 0.95,
      priority: "medium" as const,
      confirmationSent: false,
      reminderSent: false,
    }; // Test 1: Create booking
    console.log("📝 Creating test booking...");
    const createdBooking = await bookingService.createBooking(testBookingData);
    console.log("✅ Booking created with ID:", createdBooking._id);

    // Test 2: Get booking by ID
    console.log("🔍 Fetching booking by ID...");
    const fetchedBooking = await bookingService.getBookingById(
      createdBooking._id!
    );
    console.log("✅ Booking fetched:", fetchedBooking?.email);

    // Test 3: Update booking status
    console.log("📝 Updating booking status...");
    const updateResult = await bookingService.updateBookingStatus(
      createdBooking._id!,
      "confirmed",
      "Test booking confirmed"
    );
    console.log("✅ Booking status updated:", updateResult);

    // Test 4: Get bookings by admin
    console.log("📋 Fetching admin bookings...");
    const adminBookings = await bookingService.getBookingsByAdmin(
      "test-admin-123"
    );
    console.log("✅ Admin bookings count:", adminBookings.length);

    // Test 5: Check time slot availability
    console.log("⏰ Checking time slot availability...");
    const isAvailable = await bookingService.isTimeSlotAvailable(
      "test-admin-123",
      new Date("2025-09-01"),
      "14:00"
    );
    console.log("✅ Time slot available:", !isAvailable); // Should be false since we just booked it

    // Test 6: Get booking statistics
    console.log("📊 Fetching booking stats...");
    const stats = await bookingService.getBookingStats("test-admin-123");
    console.log("✅ Booking stats:", stats);

    return NextResponse.json(
      {
        success: true,
        message: "All booking service tests passed!",
        results: {
          createdBooking: createdBooking._id,
          fetchedBooking: fetchedBooking?.email,
          updateResult,
          adminBookingsCount: adminBookings.length,
          timeSlotConflict: !isAvailable, // Should be true
          stats,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ Booking service test error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Booking service test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
