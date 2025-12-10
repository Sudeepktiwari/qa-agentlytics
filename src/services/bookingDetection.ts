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
import { isFeatureEnabled } from "@/lib/adminSettings";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyzes a user message for booking intent
 */
export async function detectBookingIntent(
  message: string,
  conversationHistory: string[] = [],
  pageContext?: string,
  adminId: string = "default"
): Promise<BookingIntentResult> {
  try {
    // Check if booking detection is enabled (core feature - always enabled in new system)
    const isEnabled = await isFeatureEnabled(adminId, 'bookingDetection');
    if (!isEnabled) {
      console.log("[BookingDetection] Feature disabled via admin settings");
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

CRITICAL: You MUST respond with ONLY valid JSON in this EXACT format. No additional text, explanations, or markdown formatting:

{"hasBookingIntent":true,"confidence":95,"bookingType":"demo","reasoning":"User explicitly requested to book a demo","suggestedResponse":"I'd be happy to help you schedule a demo! Let me show you available time slots."}

CONFIDENCE SCORING:
- 90-100: Explicit booking requests ("schedule a demo", "book a call", "book a demo")
- 70-89: Strong intent ("I'd like to talk", "can we meet")  
- 50-69: Moderate intent ("interested in learning more", "want to discuss")
- 30-49: Weak intent ("maybe", "considering")
- 0-29: No clear booking intent

Only return confidence > 50 for genuine booking interest.

EXAMPLES:
Input: "book a demo"
Output: {"hasBookingIntent":true,"confidence":95,"bookingType":"demo","reasoning":"Explicit demo booking request","suggestedResponse":"I'd be happy to help you schedule a demo! Let me show you available time slots."}

Input: "what are your prices"
Output: {"hasBookingIntent":false,"confidence":10,"bookingType":null,"reasoning":"General pricing inquiry, no booking intent","suggestedResponse":null}

Remember: ONLY return the JSON object, nothing else.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze this message for booking intent: "${sanitizedMessage}"`,
        },
      ],
      temperature: 0.1, // Lower temperature for more consistent responses
      max_tokens: 200, // Reduced for more focused responses
      response_format: { type: "json_object" }, // Force JSON response
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Robust JSON parsing with multiple fallback strategies
    let parsed: any;
    try {
      console.log("[BookingDetection] Raw AI response:", aiResponse);

      // Strategy 1: Direct JSON parsing
      try {
        parsed = JSON.parse(aiResponse);
        console.log(
          "[BookingDetection] ✅ Direct JSON parse successful:",
          parsed
        );
      } catch (directParseError) {
        console.log(
          "[BookingDetection] Direct parse failed, trying cleanup strategies..."
        );

        // Strategy 2: Clean up common AI formatting issues
        let cleanedResponse = aiResponse
          .trim()
          .replace(/```json\s*/gi, "") // Remove ```json
          .replace(/```\s*$/g, "") // Remove closing ```
          .replace(/\n\s*/g, "") // Remove newlines and spaces
          .replace(/,\s*}/g, "}") // Remove trailing commas
          .replace(/,\s*]/g, "]"); // Remove trailing commas in arrays

        // Extract JSON object from mixed content
        const jsonStart = cleanedResponse.indexOf("{");
        const jsonEnd = cleanedResponse.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        }

        try {
          parsed = JSON.parse(cleanedResponse);
          console.log(
            "[BookingDetection] ✅ Cleaned JSON parse successful:",
            parsed
          );
        } catch (cleanedParseError) {
          console.log(
            "[BookingDetection] Cleaned parse failed, trying regex extraction..."
          );

          // Strategy 3: Regex extraction of JSON-like content
          const jsonMatch = aiResponse.match(
            /\{[^{}]*"hasBookingIntent"[^{}]*\}/
          );
          if (jsonMatch) {
            try {
              parsed = JSON.parse(jsonMatch[0]);
              console.log(
                "[BookingDetection] ✅ Regex extraction successful:",
                parsed
              );
            } catch (regexParseError) {
              throw new Error("All parsing strategies failed");
            }
          } else {
            throw new Error("No JSON pattern found in response");
          }
        }
      }

      // Validate that we have the required fields
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Parsed result is not an object");
      }

      // Ensure all required fields exist with defaults
      parsed = {
        hasBookingIntent: Boolean(parsed.hasBookingIntent || false),
        confidence: Number(parsed.confidence) || 0,
        bookingType: parsed.bookingType || null,
        reasoning: parsed.reasoning || "No reasoning provided",
        suggestedResponse: parsed.suggestedResponse || null,
      };

      console.log("[BookingDetection] ✅ Final validated response:", parsed);
    } catch (parseError) {
      console.error(
        "[BookingDetection] All JSON parsing strategies failed:",
        parseError
      );
      console.log("[BookingDetection] Falling back to keyword detection");

      // Fallback: Simple keyword detection for obvious booking requests
      const message = sanitizedMessage.toLowerCase();
      const bookingKeywords = [
        "book a demo",
        "book demo",
        "schedule a demo",
        "schedule demo",
        "request a demo",
        "request demo",
        "want a demo",
        "need a demo",
        "book a call",
        "book call",
        "schedule a call",
        "schedule call",
        "arrange a call",
        "set up a call",
        "sales call",
        "talk to sales",
        "talk to an agent",
        "speak to an agent",
        "speak with sales",
        "connect with sales",
        "contact sales",
        "talk to a specialist",
        "book a consultation",
        "schedule a consultation",
        "arrange a consultation",
        "set up a consultation",
      ];

      for (const keyword of bookingKeywords) {
        if (message.includes(keyword)) {
          const bookingType = keyword.includes("demo")
            ? "demo"
            : keyword.includes("call")
            ? "call"
            : "consultation";
          console.log(
            `[BookingDetection] ✅ Keyword fallback detected: "${keyword}" -> ${bookingType}`
          );
          return {
            hasBookingIntent: true,
            confidence: 95,
            bookingType: bookingType as BookingType,
            suggestedResponse: `I'd be happy to help you schedule a ${bookingType}! Let me show you available time slots.`,
            reasoning: `Keyword fallback detection: "${keyword}"`,
          };
        }
      }

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

    // Secondary fallback: Check for obvious booking keywords if AI gave low confidence
    if (!result.hasBookingIntent || result.confidence < 60) {
      const message = sanitizedMessage.toLowerCase();
      const obviousBookingPhrases = [
        "book a demo",
        "book demo",
        "schedule a demo",
        "schedule demo",
        "request a demo",
        "request demo",
        "want a demo",
        "need a demo",
        "book a call",
        "book call",
        "schedule a call",
        "schedule call",
        "arrange a call",
        "set up a call",
        "sales call",
        "talk to sales",
        "talk to an agent",
        "speak to an agent",
        "speak with sales",
        "connect with sales",
        "contact sales",
        "talk to a specialist",
        "book a consultation",
        "schedule a consultation",
        "arrange a consultation",
        "set up a consultation",
      ];

      for (const phrase of obviousBookingPhrases) {
        if (message.includes(phrase)) {
          const bookingType = phrase.includes("demo") ? "demo" : "call";
          console.log(
            `[BookingDetection] AI underconfident (${result.confidence}%), overriding with keyword detection: "${phrase}" -> ${bookingType}`
          );
          result.hasBookingIntent = true;
          result.confidence = 95;
          result.bookingType = bookingType as BookingType;
          result.suggestedResponse = `I'd be happy to help you schedule a ${bookingType}! Let me show you available time slots.`;
          result.reasoning = `Keyword override: AI gave ${result.confidence}% but found obvious phrase "${phrase}"`;
          break;
        }
      }
    }

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
