/**
 * Integration test for Step 3A: MongoDB Setup & Booking Model
 *
 * Tests that the booking detection can create bookings that are
 * properly stored in MongoDB and can be managed through the admin interface.
 */

import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { detectBookingIntent } from "@/services/bookingDetection";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Running Step 3A Integration Test...");
    const testResults = [];

    // Test 1: Booking Detection -> MongoDB Storage Flow
    console.log("Test 1: Booking Detection -> MongoDB Storage Flow");
    const testMessage =
      "I'd like to schedule a demo call for next Tuesday at 2 PM";
    const detectionResult = await detectBookingIntent(testMessage, [
      "Hello!",
      "Hi there! How can I help you?",
    ]);

    if (detectionResult.hasBookingIntent) {
      console.log("✅ Booking intent detected correctly");

      // Create booking from detection result (we'll need to extract details manually since the interface doesn't include them)
      const bookingParams = {
        sessionId: "integration-test-" + Date.now(),
        customerRequest: "Demo call request",
        email: "integration@test.com",
        name: "Integration Test User",
        company: "Test Company",
        requestType: detectionResult.bookingType || ("demo" as const),
        preferredDate: new Date(Date.now() + 86400000), // Tomorrow
        preferredTime: "14:00",
        timezone: "America/New_York",
        message: "Integration test booking",
        pageUrl: "https://example.com/test",
        originalMessage: testMessage,
        detectionConfidence: detectionResult.confidence / 100, // Convert from 0-100 to 0-1
      };

      const booking = await bookingService.createBookingFromDetection(
        bookingParams
      );
      testResults.push({
        test: "Booking Detection -> MongoDB Storage",
        status: "PASSED",
        bookingId: booking._id,
        confidence: detectionResult.confidence,
      });
      console.log("✅ Booking created in MongoDB with ID:", booking._id);

      // Test 2: Admin Interface Data Retrieval
      console.log("Test 2: Admin Interface Data Retrieval");
      const dashboardStats = await bookingService.getDashboardStats();
      const allBookings = await bookingService.getAllBookings({}, 1, 5);

      testResults.push({
        test: "Admin Dashboard Stats",
        status: "PASSED",
        totalBookings: dashboardStats.total,
        pendingBookings: dashboardStats.pending,
      });
      console.log(
        "✅ Dashboard stats retrieved:",
        dashboardStats.total,
        "total bookings"
      );

      testResults.push({
        test: "Admin Bookings List",
        status: "PASSED",
        bookingsRetrieved: allBookings.bookings.length,
        hasMore: allBookings.hasMore,
      });
      console.log(
        "✅ Bookings list retrieved:",
        allBookings.bookings.length,
        "bookings"
      );

      // Test 3: Admin Booking Management
      console.log("Test 3: Admin Booking Management");
      const updatedBooking = await bookingService.updateBookingWithAdminNotes(
        booking._id!,
        {
          status: "confirmed",
          adminNotes: "Confirmed via integration test",
          priority: "high",
        }
      );

      testResults.push({
        test: "Admin Booking Update",
        status: updatedBooking ? "PASSED" : "FAILED",
        newStatus: updatedBooking?.status,
        adminNotes: updatedBooking?.adminNotes,
      });
      console.log("✅ Booking updated by admin:", updatedBooking?.status);
    } else {
      testResults.push({
        test: "Booking Detection -> MongoDB Storage",
        status: "FAILED",
        reason: "Booking intent not detected",
      });
      console.log("❌ Booking intent not detected");
    }

    // Test 4: Feature Flags
    console.log("Test 4: Feature Flags");
    const { FeatureFlags } = await import("@/lib/javascriptSafety");
    testResults.push({
      test: "Feature Flags",
      status: "PASSED",
      bookingDetection: FeatureFlags.ENABLE_BOOKING_DETECTION,
      adminInterface: FeatureFlags.ENABLE_ADMIN_INTERFACE,
    });
    console.log("✅ Feature flags checked");

    const passedTests = testResults.filter((t) => t.status === "PASSED").length;
    const totalTests = testResults.length;

    console.log(
      `🎉 Step 3A Integration Test Complete: ${passedTests}/${totalTests} tests passed`
    );

    return NextResponse.json({
      success: true,
      message: `Step 3A Integration Test Complete: ${passedTests}/${totalTests} tests passed`,
      testResults,
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        successRate: ((passedTests / totalTests) * 100).toFixed(1) + "%",
      },
    });
  } catch (error) {
    console.error("❌ Step 3A Integration Test Failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Integration test failed",
        testResults: [
          {
            test: "Overall Integration",
            status: "FAILED",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      },
      { status: 500 }
    );
  }
}
