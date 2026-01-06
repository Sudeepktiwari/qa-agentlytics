import { NextRequest, NextResponse } from "next/server";
import {
  detectBookingIntent,
  generateBookingResponse,
  enhanceChatWithBookingDetection,
  type BookingIntentResult,
} from "@/services/bookingDetection";
import { ResponseValidator, FeatureFlags } from "@/lib/javascriptSafety";
import { verifyApiKey } from "@/lib/auth";
import { assertBodyConstraints } from "@/lib/validators";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log("[BookingDetectionAPI] Processing booking detection request");

    // Check if feature is enabled
    if (!FeatureFlags.isEnabled("BOOKING_DETECTION")) {
      return NextResponse.json(
        {
          error: "Booking detection feature is currently disabled",
          featureEnabled: false,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // Verify API key if provided
    const apiKey = req.headers.get("x-api-key");
    let apiAuth = null;
    if (apiKey) {
      apiAuth = await verifyApiKey(apiKey);
      if (!apiAuth) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401, headers: corsHeaders }
        );
      }
    }

  // Parse request body
    const body = await req.json();
    assertBodyConstraints(body, { maxBytes: 128 * 1024, maxDepth: 8 });
    const {
      message,
      conversationHistory = [],
      pageContext,
      sessionId,
      mode = "detect", // 'detect', 'generate', or 'enhance'
      adminId = "default"
    } = body;

    // Validate required fields
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "SessionId is required and must be a string" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(
      `[BookingDetectionAPI] Processing mode: ${mode} for session: ${sessionId}`
    );

    // Process based on mode
    switch (mode) {
      case "detect":
        // Just detect booking intent
        const bookingIntent = await detectBookingIntent(
          message,
          conversationHistory,
          pageContext,
          adminId
        );

        return NextResponse.json(
          {
            success: true,
            bookingIntent,
            sessionId,
            timestamp: new Date().toISOString(),
          },
          { headers: corsHeaders }
        );

      case "generate":
        // Detect intent and generate response
        const intent = await detectBookingIntent(
          message,
          conversationHistory,
          pageContext,
          adminId
        );

        const response = await generateBookingResponse(
          intent,
          message,
          pageContext
        );

        return NextResponse.json(
          {
            success: true,
            bookingIntent: intent,
            chatResponse: response,
            sessionId,
            timestamp: new Date().toISOString(),
          },
          { headers: corsHeaders }
        );

      case "enhance":
        // Full enhanced chat processing
        const enhancedResponse = await enhanceChatWithBookingDetection(
          message,
          conversationHistory,
          pageContext
        );

        return NextResponse.json(
          {
            success: true,
            ...enhancedResponse,
            sessionId,
            timestamp: new Date().toISOString(),
          },
          { headers: corsHeaders }
        );

      default:
        return NextResponse.json(
          { error: "Invalid mode. Must be 'detect', 'generate', or 'enhance'" },
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error("[BookingDetectionAPI] Error processing request:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during booking detection",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get feature flag status and basic info
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action");

    if (action === "status") {
      return NextResponse.json(
        {
          bookingDetectionEnabled: FeatureFlags.isEnabled("BOOKING_DETECTION"),
          calendarWidgetEnabled: FeatureFlags.isEnabled("CALENDAR_WIDGET"),
          formSubmissionEnabled: FeatureFlags.isEnabled("FORM_SUBMISSION"),
          allFeatures: FeatureFlags.getAllFlags(),
          timestamp: new Date().toISOString(),
        },
        { headers: corsHeaders }
      );
    }

    if (action === "test") {
      // Simple test endpoint to verify the service is working
      const testMessage = "I'd like to schedule a demo";
      const testResult = await detectBookingIntent(testMessage);

      return NextResponse.json(
        {
          test: true,
          testMessage,
          testResult,
          serviceWorking: true,
          timestamp: new Date().toISOString(),
        },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        message: "Booking Detection API",
        endpoints: {
          POST: "Detect booking intent and generate responses",
          "GET?action=status": "Check feature flag status",
          "GET?action=test": "Test the booking detection service",
        },
        modes: ["detect", "generate", "enhance"],
        timestamp: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("[BookingDetectionAPI] Error in GET request:", error);

    return NextResponse.json(
      {
        error: "Error processing GET request",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
