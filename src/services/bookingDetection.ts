/**
 * Booking Detection Service
 *
 * This service analyzes user messages for booking intent using AI
 * and returns safely validated responses using our JavaScript safety utilities.
 */

import OpenAI from "openai";
import {
  JavaScriptSafetyUtils,
  ResponseValidator,
  FeatureFlags,
  type SafeChatResponse,
  type BookingType,
} from "@/lib/javascriptSafety";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyzes a user message for booking intent
 */
export async function detectBookingIntent(
  message: string,
  conversationHistory: string[] = [],
  pageContext?: string
): Promise<BookingIntentResult> {
  try {
    // Check if booking detection is enabled
    if (!FeatureFlags.isEnabled("BOOKING_DETECTION")) {
      console.log("[BookingDetection] Feature disabled via feature flag");
      return {
        hasBookingIntent: false,
        confidence: 0,
        bookingType: null,
        suggestedResponse: null,
      };
    }

    // Validate and sanitize inputs
    const sanitizedMessage = JavaScriptSafetyUtils.sanitizeString(
      message,
      1000
    );
    if (!JavaScriptSafetyUtils.validateJavaScriptString(sanitizedMessage)) {
      console.warn("[BookingDetection] Message failed safety validation");
      return {
        hasBookingIntent: false,
        confidence: 0,
        bookingType: null,
        suggestedResponse: null,
      };
    }

    // Create context for AI analysis
    const conversationContext = conversationHistory
      .slice(-5) // Last 5 messages for context
      .map((msg) => JavaScriptSafetyUtils.sanitizeString(msg, 200))
      .join("\n");

    const pageContextSafe = pageContext
      ? JavaScriptSafetyUtils.sanitizeString(pageContext, 500)
      : "";

    // AI prompt for booking intent detection
    const systemPrompt = `You are an expert at detecting booking and appointment intent in customer messages.

Analyze the user's message for any indication they want to:
- Schedule a meeting, demo, call, or appointment
- Book a consultation or discovery session
- Set up time to talk or meet
- Request a calendar invite or scheduling
- Want to speak with someone on the team
- Need help getting started with setup/onboarding

BOOKING TYPES:
- "demo": Product demonstration requests
- "call": General call/meeting requests  
- "consultation": Business consultation requests
- "support": Support or setup assistance requests

CONTEXT:
Conversation History: ${conversationContext}
Page Context: ${pageContextSafe}
Current Message: ${sanitizedMessage}

Respond with ONLY valid JSON in this exact format:
{
  "hasBookingIntent": boolean,
  "confidence": number (0-100),
  "bookingType": "demo" | "call" | "consultation" | "support" | null,
  "reasoning": "brief explanation of why you detected this intent",
  "suggestedResponse": "helpful response acknowledging their intent and next steps"
}

CONFIDENCE SCORING:
- 90-100: Explicit booking requests ("schedule a demo", "book a call")
- 70-89: Strong intent ("I'd like to talk", "can we meet")  
- 50-69: Moderate intent ("interested in learning more", "want to discuss")
- 30-49: Weak intent ("maybe", "considering")
- 0-29: No clear booking intent

Only return confidence > 50 for genuine booking interest.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: sanitizedMessage },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse and validate AI response
    let parsed: any;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error(
        "[BookingDetection] Failed to parse AI response:",
        parseError
      );
      return {
        hasBookingIntent: false,
        confidence: 0,
        bookingType: null,
        suggestedResponse: null,
      };
    }

    // Validate the parsed response structure
    const result: BookingIntentResult = {
      hasBookingIntent: Boolean(parsed.hasBookingIntent),
      confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 0)),
      bookingType: ResponseValidator.validateBookingType(parsed.bookingType),
      suggestedResponse: parsed.suggestedResponse
        ? ResponseValidator.sanitizeReply(parsed.suggestedResponse)
        : null,
      reasoning: parsed.reasoning
        ? JavaScriptSafetyUtils.sanitizeString(parsed.reasoning, 200)
        : undefined,
    };

    console.log(
      `[BookingDetection] Analysis complete: intent=${result.hasBookingIntent}, confidence=${result.confidence}, type=${result.bookingType}`
    );

    return result;
  } catch (error) {
    console.error("[BookingDetection] Error in detectBookingIntent:", error);
    return {
      hasBookingIntent: false,
      confidence: 0,
      bookingType: null,
      suggestedResponse: null,
    };
  }
}

/**
 * Generates a safe chat response for booking intent
 */
export async function generateBookingResponse(
  bookingIntent: BookingIntentResult,
  userMessage: string,
  pageContext?: string
): Promise<SafeChatResponse> {
  try {
    if (!bookingIntent.hasBookingIntent || bookingIntent.confidence < 50) {
      // No booking intent detected, return standard response
      return {
        reply: "I'd be happy to help you learn more about our services!",
        showBookingCalendar: false,
        bookingType: null,
      };
    }

    // Generate contextual booking response
    const sanitizedMessage = JavaScriptSafetyUtils.sanitizeString(
      userMessage,
      500
    );
    const pageContextSafe = pageContext
      ? JavaScriptSafetyUtils.sanitizeString(pageContext, 300)
      : "";

    const systemPrompt = `You are a helpful booking assistant. The user has expressed interest in scheduling something.

User wants to book: ${bookingIntent.bookingType}
Confidence level: ${bookingIntent.confidence}%
User message: ${sanitizedMessage}
Page context: ${pageContextSafe}

Generate a helpful response that:
1. Acknowledges their booking interest
2. Explains what they can expect
3. Guides them to the next step

Respond with ONLY valid JSON:
{
  "reply": "helpful message about booking process (max 150 words)",
  "showBookingCalendar": true,
  "bookingType": "${bookingIntent.bookingType}"
}

Keep the reply conversational and helpful. Focus on the value they'll get from the booking.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate booking response for: ${sanitizedMessage}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      // Fallback response
      return {
        reply: `Great! I'd love to help you schedule a ${bookingIntent.bookingType}. Let's find a time that works for you.`,
        showBookingCalendar: true,
        bookingType: bookingIntent.bookingType,
      };
    }

    // Parse and validate the response
    let parsed: any;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (parseError) {
      console.warn(
        "[BookingDetection] Failed to parse booking response, using fallback"
      );
      return {
        reply: `Perfect! I can help you schedule a ${bookingIntent.bookingType}. Let's find a convenient time.`,
        showBookingCalendar: true,
        bookingType: bookingIntent.bookingType,
      };
    }

    // Validate and sanitize the parsed response
    const safeResponse = ResponseValidator.validateAndSanitize({
      reply: parsed.reply,
      showBookingCalendar: parsed.showBookingCalendar,
      bookingType: parsed.bookingType,
    });

    console.log(
      `[BookingDetection] Generated safe booking response for ${bookingIntent.bookingType}`
    );

    return safeResponse;
  } catch (error) {
    console.error(
      "[BookingDetection] Error generating booking response:",
      error
    );

    // Safe fallback response
    return {
      reply:
        "I'd be happy to help you schedule some time to connect! Let me get that set up for you.",
      showBookingCalendar: true,
      bookingType: bookingIntent.bookingType || "call",
    };
  }
}

/**
 * Enhanced chat processing with booking detection
 */
export async function enhanceChatWithBookingDetection(
  userMessage: string,
  conversationHistory: string[] = [],
  pageContext?: string
): Promise<EnhancedChatResponse> {
  try {
    console.log("[BookingDetection] Processing message with booking detection");

    // Step 1: Detect booking intent
    const bookingIntent = await detectBookingIntent(
      userMessage,
      conversationHistory,
      pageContext
    );

    // Step 2: Generate appropriate response
    let chatResponse: SafeChatResponse;

    if (bookingIntent.hasBookingIntent && bookingIntent.confidence >= 50) {
      // Generate booking-specific response
      chatResponse = await generateBookingResponse(
        bookingIntent,
        userMessage,
        pageContext
      );

      console.log(
        `[BookingDetection] Booking intent detected: ${bookingIntent.bookingType} (${bookingIntent.confidence}% confidence)`
      );
    } else {
      // Use suggested response from detection or default
      const reply =
        bookingIntent.suggestedResponse ||
        "I'd be happy to help you with that!";
      chatResponse = {
        reply: ResponseValidator.sanitizeReply(reply),
        showBookingCalendar: false,
        bookingType: null,
      };

      console.log(
        "[BookingDetection] No booking intent detected, using standard response"
      );
    }

    return {
      chatResponse,
      bookingIntent,
      isBookingFlow:
        bookingIntent.hasBookingIntent && bookingIntent.confidence >= 50,
    };
  } catch (error) {
    console.error(
      "[BookingDetection] Error in enhanced chat processing:",
      error
    );

    // Safe fallback
    return {
      chatResponse: {
        reply:
          "I'd be happy to help you! Could you tell me more about what you're looking for?",
        showBookingCalendar: false,
        bookingType: null,
      },
      bookingIntent: {
        hasBookingIntent: false,
        confidence: 0,
        bookingType: null,
        suggestedResponse: null,
      },
      isBookingFlow: false,
    };
  }
}

/**
 * Type definitions
 */
export interface BookingIntentResult {
  hasBookingIntent: boolean;
  confidence: number; // 0-100
  bookingType: BookingType | null;
  suggestedResponse: string | null;
  reasoning?: string;
}

export interface EnhancedChatResponse {
  chatResponse: SafeChatResponse;
  bookingIntent: BookingIntentResult;
  isBookingFlow: boolean;
}
