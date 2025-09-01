import { NextRequest, NextResponse } from "next/server";
import { enhanceChatWithBookingDetection } from "@/services/bookingDetection";

/**
 * Simplified chat endpoint that focuses on booking detection
 * Bypasses embeddings and vector search for testing
 */
export async function POST(request: NextRequest) {
  try {
    const { question, sessionId, pageUrl } = await request.json();

    if (!question || !sessionId) {
      return NextResponse.json(
        {
          error: "Question and sessionId are required",
        },
        { status: 400 }
      );
    }

    console.log("🧪 [SIMPLE CHAT] Testing message:", question);

    // Try booking detection first
    try {
      const bookingEnhancement = await enhanceChatWithBookingDetection(
        question,
        [], // conversation history
        `Page URL: ${pageUrl || "test page"}`
      );

      console.log("🔍 [SIMPLE CHAT] Booking enhancement result:", {
        isBookingFlow: bookingEnhancement.isBookingFlow,
        hasBookingIntent: bookingEnhancement.bookingIntent.hasBookingIntent,
        confidence: bookingEnhancement.bookingIntent.confidence,
        bookingType: bookingEnhancement.bookingIntent.bookingType,
        showCalendar: bookingEnhancement.chatResponse.showBookingCalendar,
      });

      if (bookingEnhancement.chatResponse.showBookingCalendar) {
        console.log(
          "📅 [SIMPLE CHAT] ✅ BOOKING DETECTED - Returning calendar response"
        );
        return NextResponse.json({
          success: true,
          mainText: bookingEnhancement.chatResponse.reply,
          showBookingCalendar: true,
          bookingType: bookingEnhancement.chatResponse.bookingType,
          isBookingFlow: true,
          debugInfo: {
            confidence: bookingEnhancement.bookingIntent.confidence,
            reasoning: bookingEnhancement.bookingIntent.reasoning,
          },
        });
      } else {
        console.log("❌ [SIMPLE CHAT] No booking intent detected");
        return NextResponse.json({
          success: true,
          mainText: "I'd be happy to help you! What would you like to know?",
          showBookingCalendar: false,
          bookingType: null,
          isBookingFlow: false,
          debugInfo: {
            confidence: bookingEnhancement.bookingIntent.confidence,
            reasoning:
              bookingEnhancement.bookingIntent.reasoning ||
              "No booking intent detected",
          },
        });
      }
    } catch (bookingError) {
      console.error("❌ [SIMPLE CHAT] Booking detection failed:", bookingError);
      return NextResponse.json({
        success: false,
        error: "Booking detection failed",
        details:
          bookingError instanceof Error
            ? bookingError.message
            : String(bookingError),
        fallbackResponse: {
          mainText: "I'd be happy to help you! What would you like to know?",
          showBookingCalendar: false,
          bookingType: null,
        },
      });
    }
  } catch (error) {
    console.error("❌ [SIMPLE CHAT] General error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Chat processing failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
