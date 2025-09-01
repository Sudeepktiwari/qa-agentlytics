import { NextRequest, NextResponse } from "next/server";
import {
  detectBookingIntent,
  generateBookingResponse,
} from "@/services/bookingDetection";

/**
 * Test endpoint for booking detection
 * GET /api/test/booking-detection-direct
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const message =
    searchParams.get("message") || "I would like to schedule a demo";

  try {
    console.log("🧪 [TEST] Testing booking detection for:", message);

    // Test booking intent detection
    const bookingIntent = await detectBookingIntent(message, [], "Test page");

    console.log("🔍 [TEST] Booking intent result:", bookingIntent);

    // If booking intent detected, generate response
    let bookingResponse = null;
    if (bookingIntent.hasBookingIntent && bookingIntent.confidence >= 50) {
      bookingResponse = await generateBookingResponse(
        bookingIntent,
        message,
        "Test page"
      );
      console.log("📅 [TEST] Booking response generated:", bookingResponse);
    }

    return NextResponse.json({
      success: true,
      data: {
        input: {
          message,
          pageContext: "Test page",
        },
        bookingIntent,
        bookingResponse,
        shouldShowCalendar:
          bookingIntent.hasBookingIntent && bookingIntent.confidence >= 50,
        summary: {
          detected: bookingIntent.hasBookingIntent,
          confidence: bookingIntent.confidence,
          type: bookingIntent.bookingType,
          willShowCalendar: bookingResponse?.showBookingCalendar || false,
        },
      },
    });
  } catch (error) {
    console.error("❌ [TEST] Booking detection test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: {
          input: message,
          errorType: error?.constructor?.name || "Unknown",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test/booking-detection-direct
 * Test with custom message
 */
export async function POST(request: NextRequest) {
  try {
    const { message, pageContext, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required",
        },
        { status: 400 }
      );
    }

    console.log("🧪 [TEST] Testing booking detection (POST) for:", message);

    // Test booking intent detection
    const bookingIntent = await detectBookingIntent(
      message,
      conversationHistory || [],
      pageContext || "Test page"
    );

    console.log("🔍 [TEST] Booking intent result:", bookingIntent);

    // If booking intent detected, generate response
    let bookingResponse = null;
    if (bookingIntent.hasBookingIntent && bookingIntent.confidence >= 50) {
      bookingResponse = await generateBookingResponse(
        bookingIntent,
        message,
        pageContext || "Test page"
      );
      console.log("📅 [TEST] Booking response generated:", bookingResponse);
    }

    return NextResponse.json({
      success: true,
      data: {
        input: {
          message,
          pageContext: pageContext || "Test page",
          conversationHistory: conversationHistory || [],
        },
        bookingIntent,
        bookingResponse,
        shouldShowCalendar:
          bookingIntent.hasBookingIntent && bookingIntent.confidence >= 50,
        summary: {
          detected: bookingIntent.hasBookingIntent,
          confidence: bookingIntent.confidence,
          type: bookingIntent.bookingType,
          willShowCalendar: bookingResponse?.showBookingCalendar || false,
        },
      },
    });
  } catch (error) {
    console.error("❌ [TEST] Booking detection test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: {
          errorType: error?.constructor?.name || "Unknown",
        },
      },
      { status: 500 }
    );
  }
}
