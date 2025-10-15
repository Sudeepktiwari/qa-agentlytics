import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { querySimilarChunks } from "@/lib/chroma";
import { getDb } from "@/lib/mongo";
import { getChunksByPageUrl } from "@/lib/chroma";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { chunkText } from "@/lib/chunkText";
import { addChunks } from "@/lib/chroma";
import { verifyApiKey, verifyAdminAccessFromCookie } from "@/lib/auth";
import { createOrUpdateLead } from "@/lib/leads";
import { enhanceChatWithBookingDetection } from "@/services/bookingDetection";
import { bookingService } from "@/services/bookingService";
import { onboardingService } from "@/services/onboardingService";
import { getAdminSettings, OnboardingSettings } from "@/lib/adminSettings";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🎯 PHASE 1: Booking Status Management
// Helper function to check session booking status
async function getSessionBookingStatus(sessionId: string, adminId?: string) {
  try {
    const db = await getDb();
    const bookings = db.collection("bookings");
    const chats = db.collection("chats");
    const conversations = db.collection("conversations");

    // Helper: determine if a booking is in the future (same timezone) and active
    function isFuturePendingOrConfirmed(booking: any): boolean {
      if (!booking || !["pending", "confirmed"].includes(booking.status)) {
        return false;
      }

      const tz = booking.timezone || "America/New_York";
      const bookingDate = new Date(booking.preferredDate);
      const now = new Date();

      const getDateKey = (d: Date) => {
        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).formatToParts(d);
        const year = parseInt(parts.find((p) => p.type === "year")?.value || "0", 10);
        const month = parseInt(parts.find((p) => p.type === "month")?.value || "0", 10);
        const day = parseInt(parts.find((p) => p.type === "day")?.value || "0", 10);
        return year * 10000 + month * 100 + day;
      };

      const bookingDateKey = getDateKey(bookingDate);
      const nowDateKey = getDateKey(now);

      if (bookingDateKey > nowDateKey) return true;
      if (bookingDateKey < nowDateKey) return false;

      const getTimeHM = (d: Date) => {
        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).formatToParts(d);
        const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
        const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
        return hour * 60 + minute;
      };

      const nowHM = getTimeHM(now);
      const [hStr, mStr] = String(booking.preferredTime || "00:00").split(":");
      const bookingHM = (parseInt(hStr || "0", 10) * 60) + parseInt(mStr || "0", 10);

      return bookingHM >= nowHM;
    }

    // Query active bookings for this session
    const activeBookings = await bookings
      .find({
        sessionId,
        status: { $in: ["confirmed", "pending"] },
        ...(adminId && { adminId }),
      })
      .sort({ createdAt: -1 })
      .toArray();

    if (activeBookings.length === 0) {
      // Fallback: Try to find bookings by email linked to this session
      try {
        let fallbackEmail: string | null = null;
        const lastEmailMsg = await chats.findOne(
          { sessionId, email: { $exists: true } },
          { sort: { createdAt: -1 } }
        );
        if (lastEmailMsg?.email) fallbackEmail = lastEmailMsg.email;

        if (!fallbackEmail) {
          const convo = await conversations.findOne({ sessionId });
          if (convo && typeof convo.userEmail === "string") {
            fallbackEmail = convo.userEmail;
          }
        }

        if (fallbackEmail) {
          // Try lookup with admin filter first
          let emailBookings = await bookings
            .find({
              email: fallbackEmail.toLowerCase(),
              status: { $in: ["confirmed", "pending"] },
              ...(adminId && { adminId }),
            })
            .sort({ createdAt: -1 })
            .toArray();

          // If none found and adminId was provided, try without admin filter
          if (emailBookings.length === 0 && adminId) {
            emailBookings = await bookings
              .find({
                email: fallbackEmail.toLowerCase(),
                status: { $in: ["confirmed", "pending"] },
              })
              .sort({ createdAt: -1 })
              .toArray();
          }

          if (emailBookings.length > 0) {
            const currentBooking = emailBookings[0];
            const hasValidShape = Boolean(
              currentBooking &&
                currentBooking.preferredDate &&
                !isNaN(new Date(currentBooking.preferredDate).getTime()) &&
                typeof currentBooking.preferredTime === "string" &&
                currentBooking.preferredTime.length >= 4 &&
                typeof currentBooking.requestType === "string" &&
                currentBooking.requestType.length > 0 &&
                typeof currentBooking.email === "string" &&
                currentBooking.email.length > 3 &&
                typeof currentBooking.confirmationNumber === "string" &&
                currentBooking.confirmationNumber.length > 0
            );

            if (hasValidShape) {
              const canBookAgain = !isFuturePendingOrConfirmed(currentBooking);

              return {
                hasActiveBooking: !canBookAgain,
                currentBooking,
                canBookAgain,
                allBookings: emailBookings,
                bookingDetails: {
                  type: currentBooking.requestType,
                  date: currentBooking.preferredDate,
                  time: currentBooking.preferredTime,
                  confirmation: currentBooking.confirmationNumber,
                  status: currentBooking.status,
                },
              };
            }
          }
        }
      } catch (fallbackErr) {
        console.log("[Booking Status] Email fallback lookup failed:", fallbackErr);
      }

      return {
        hasActiveBooking: false,
        currentBooking: null,
        canBookAgain: true,
        allBookings: [],
      };
    }

    const currentBooking = activeBookings[0]; // Most recent

    // Validate booking shape; if invalid, treat as no active booking
    const hasValidShape = Boolean(
      currentBooking &&
        currentBooking.preferredDate &&
        !isNaN(new Date(currentBooking.preferredDate).getTime()) &&
        typeof currentBooking.preferredTime === "string" &&
        currentBooking.preferredTime.length >= 4 &&
        typeof currentBooking.requestType === "string" &&
        currentBooking.requestType.length > 0 &&
        typeof currentBooking.email === "string" &&
        currentBooking.email.length > 3 &&
        typeof currentBooking.confirmationNumber === "string" &&
        currentBooking.confirmationNumber.length > 0
    );
    if (!hasValidShape) {
      return {
        hasActiveBooking: false,
        currentBooking: null,
        canBookAgain: true,
        allBookings: activeBookings,
      };
    }
    // Only skip calendar if booking is future and active
    const canBookAgain = !isFuturePendingOrConfirmed(currentBooking);

    return {
      hasActiveBooking: !canBookAgain,
      currentBooking,
      canBookAgain,
      allBookings: activeBookings,
      bookingDetails: {
        type: currentBooking.requestType,
        date: currentBooking.preferredDate,
        time: currentBooking.preferredTime,
        confirmation: currentBooking.confirmationNumber,
        status: currentBooking.status,
      },
    };
  } catch (error) {
    console.error("[Booking Status] Error checking booking status:", error);
    return {
      hasActiveBooking: false,
      currentBooking: null,
      canBookAgain: true,
      allBookings: [],
    };
  }
}

// Smart button filter function to remove booking-related buttons when user has active booking
function filterButtonsBasedOnBooking(buttons: string[], bookingStatus: any) {
  if (!bookingStatus.hasActiveBooking) {
    return buttons; // No filtering needed
  }

  // Booking-related keywords to filter out
  const bookingKeywords = [
    "book",
    "schedule",
    "demo",
    "call",
    "meeting",
    "appointment",
    "consultation",
    "talk to sales",
  ];

  // Filter out booking-related buttons
  const filteredButtons = buttons.filter((button) => {
    const lowerButton = button.toLowerCase();
    return !bookingKeywords.some((keyword) => lowerButton.includes(keyword));
  });

  // Add booking management buttons if we have few remaining buttons
  if (filteredButtons.length < 2) {
    const managementButtons = [
      "View Full Details",
      "Reschedule",
      "Cancel Booking",
    ];

    // Return original filtered buttons + management options
    return [
      ...filteredButtons,
      ...managementButtons.slice(0, 3 - filteredButtons.length),
    ];
  }

  return filteredButtons;
}

// Generate booking-aware response when user has active booking
function generateBookingAwareResponse(
  originalResponse: any,
  bookingStatus: any,
  userQuestion: string
) {
  if (!bookingStatus.hasActiveBooking || !bookingStatus.currentBooking) {
    return originalResponse; // No modification needed
  }

  const booking = bookingStatus.currentBooking;
  const bookingDate = new Date(booking.preferredDate).toLocaleDateString();
  const bookingTime = booking.preferredTime;

  // Check if user is asking for another booking
  const isBookingRequest =
    /\b(book|schedule|demo|call|meeting|appointment|consultation|talk to sales)\b/i.test(
      userQuestion
    );

  if (isBookingRequest) {
    // Show comprehensive booking details instead of calendar
    return {
      mainText: `📅 <strong>You already have an appointment scheduled!</strong><br><br>` +
                `📅 <strong>Date:</strong> ${bookingDate}<br>` +
                `⏰ <strong>Time:</strong> ${bookingTime}<br>` +
                `📋 <strong>Type:</strong> ${booking.requestType || 'Appointment'}<br>` +
                `🎫 <strong>Confirmation:</strong> ${booking.confirmationNumber || 'N/A'}<br>` +
                `📧 <strong>Contact:</strong> ${booking.email || 'N/A'}<br>` +
                `📊 <strong>Status:</strong> ${booking.status || 'Confirmed'}<br><br>` +
                `Would you like to manage this appointment or need something else?`,
      buttons: ["View Full Details", "Reschedule", "Cancel Booking", "Add to Calendar"],
      emailPrompt: "",
      showBookingCalendar: false,
      existingBooking: true,
      bookingDetails: {
        date: bookingDate,
        time: bookingTime,
        type: booking.requestType || 'Appointment',
        confirmationNumber: booking.confirmationNumber || 'N/A',
        email: booking.email || 'N/A',
        status: booking.status || 'Confirmed',
        fullBooking: booking
      },
    };
  }

  // For non-booking questions, just filter buttons
  return {
    ...originalResponse,
    // When a valid active booking exists, suppress calendar unless explicitly rescheduling
    showBookingCalendar: false,
    bookingType: undefined,
    buttons: filterButtonsBasedOnBooking(
      originalResponse.buttons || [],
      bookingStatus
    ),
  };
}

// 🎯 PHASE 2: Enhanced Booking Integration Functions

// Store booking reference in chat messages
async function updateChatWithBookingReference(
  sessionId: string,
  bookingId: string,
  hasActiveBooking: boolean,
  adminId?: string
) {
  try {
    const db = await getDb();
    const chats = db.collection("chats");

    // Update all messages in this session with booking reference
    await chats.updateMany(
      { sessionId },
      {
        $set: {
          bookingId: bookingId,
          hasActiveBooking: hasActiveBooking,
          bookingLastChecked: new Date(),
        },
      }
    );

    console.log(
      `[Booking] Updated chat messages for session ${sessionId} with booking ${bookingId}`
    );
  } catch (error) {
    console.error(
      "[Booking] Error updating chat with booking reference:",
      error
    );
  }
}

// Generate booking management response for specific actions
function generateBookingManagementResponse(action: string, booking: any) {
  if (!booking) return null;

  // Validate booking before generating response
  const valid = Boolean(
    booking.preferredDate &&
      !isNaN(new Date(booking.preferredDate).getTime()) &&
      typeof booking.preferredTime === "string" &&
      booking.preferredTime.length >= 4 &&
      typeof booking.requestType === "string" &&
      booking.requestType.length > 0
  );
  if (!valid) return null;
  const bookingDate = new Date(booking.preferredDate).toLocaleDateString();
  const bookingTime = booking.preferredTime;

  switch (action.toLowerCase()) {
    case "view details":
    case "view booking details":
    case "view full details":
      return {
        mainText: `📅 <strong>Your ${booking.requestType} Details:</strong><br><br>📅 <strong>Date:</strong> ${bookingDate}<br>⏰ <strong>Time:</strong> ${bookingTime}<br>🎫 <strong>Confirmation:</strong> ${booking.confirmationNumber}<br>📧 <strong>Contact:</strong> ${booking.email}<br><br>We'll send you a reminder 24 hours before your appointment!`,
        buttons: ["Reschedule", "Cancel Booking", "Add to Calendar"],
        emailPrompt: "",
        showBookingCalendar: false,
        bookingAction: "view_details",
      };

    case "reschedule":
      return {
        mainText: `I'll help you reschedule your ${booking.requestType} from ${bookingDate} at ${bookingTime}. Please select a new time that works better for you.`,
        buttons: ["Pick New Time", "Cancel Booking", "Keep Current"],
        emailPrompt: "",
        showBookingCalendar: true,
        bookingType: booking.requestType,
        bookingAction: "reschedule",
        currentBooking: booking,
      };

    case "add to calendar":
      return {
        mainText: `📅 Ready to add your ${booking.requestType} to your calendar!<br><br><strong>Event Details:</strong><br>📅 ${bookingDate} at ${bookingTime}<br>🎫 Confirmation: ${booking.confirmationNumber}<br><br>Click below to add to your preferred calendar.`,
        buttons: ["Google Calendar", "Outlook", "Apple Calendar"],
        emailPrompt: "",
        showBookingCalendar: false,
        bookingAction: "add_to_calendar",
        calendarData: {
          title: `${booking.requestType} - ${booking.confirmationNumber}`,
          date: booking.preferredDate,
          time: booking.preferredTime,
          description: `${booking.requestType} appointment. Confirmation: ${booking.confirmationNumber}`,
        },
      };

    case "cancel booking":
      return {
        mainText:
          "I can cancel your booking. Are you sure you want to proceed?",
        buttons: ["Confirm Cancel", "Keep Booking", "View Full Details"],
        emailPrompt: "",
        showBookingCalendar: false,
        bookingAction: "cancel_booking",
      };

    default:
      return {
        mainText: `I can help you manage your ${booking.requestType} scheduled for ${bookingDate} at ${bookingTime}. What would you like to do?`,
        buttons: ["View Full Details", "Reschedule", "Cancel Booking"],
        emailPrompt: "",
        showBookingCalendar: false,
        bookingAction: "manage",
      };
  }
}

// 🔰 Onboarding helpers
function detectOnboardingIntent(text?: string): boolean {
  if (!text) return false;
  const re = /\b(sign up|register|create account|get started|onboard)\b/i;
  return re.test(text);
}

function promptForField(field: any): string {
  const base = field.label || field.key;
  switch (field.type) {
    case "email":
      return `What is your ${base.toLowerCase()}?`;
    case "phone":
      return `Please share your ${base.toLowerCase()} (digits only).`;
    case "select":
      return `Choose your ${base.toLowerCase()}${field.options ? `: ${field.options.join(", ")}` : ""}.`;
    case "checkbox":
      return `Do you consent to ${base.toLowerCase()}? Reply yes or no.`;
    default:
      return `What is your ${base.toLowerCase()}?`;
  }
}

// Retrieve relevant documentation context from Pinecone for the current onboarding field
async function buildOnboardingDocContext(field: any, adminId?: string): Promise<string> {
  try {
    const label = field.label || field.key || "information";
    const query = `registration ${label} requirement`;
    const embedResp = await openai.embeddings.create({
      input: [query],
      model: "text-embedding-3-small",
    });
    const embedding = embedResp.data[0].embedding as number[];
    const chunks = await querySimilarChunks(embedding, 3, adminId || undefined);
    const snippets = chunks
      .filter((c) => typeof c === "string" && c.length > 0)
      .map((c) => c.slice(0, 400));
    if (!snippets.length) return "";
    const combined = snippets.slice(0, 2).join("\n—\n");
    return `Helpful info:\n${combined}`;
  } catch (e) {
    // If embedding or retrieval fails, silently skip context
    return "";
  }
}

function validateAnswer(field: any, answer: string): { valid: boolean; message?: string; normalized?: string } {
  const val = answer?.trim();
  if (!val) return { valid: false, message: `Please provide your ${field.label || field.key}.` };
  if (field.type === "email") {
    // Extract email from freeform text (e.g., "my email is foo@bar.com")
    const emailInText = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const match = val.match(emailInText);
    if (!match) return { valid: false, message: "That doesn’t look like a valid email." };
    return { valid: true, normalized: match[0] };
  }
  if (field.validations?.minLength && val.length < field.validations.minLength) {
    return { valid: false, message: `Please provide at least ${field.validations.minLength} characters.` };
  }
  if (field.validations?.maxLength && val.length > field.validations.maxLength) {
    return { valid: false, message: `Please keep it under ${field.validations.maxLength} characters.` };
  }
  if (field.validations?.regex) {
    try {
      const re = new RegExp(field.validations.regex);
      if (!re.test(val)) return { valid: false, message: `The format for ${field.label || field.key} is invalid.` };
    } catch {}
  }
  if (field.type === "checkbox") {
    const yn = val.toLowerCase();
    if (!["yes", "no"].includes(yn)) return { valid: false, message: "Please reply yes or no." };
  }
  if (field.type === "select" && field.options && !field.options.includes(val)) {
    return { valid: false, message: `Please select one of: ${field.options.join(", ")}.` };
  }
  return { valid: true };
}

// Advanced booking conflict detection
async function detectBookingConflicts(
  sessionId: string,
  newBookingRequest: any,
  adminId?: string
) {
  try {
    const db = await getDb();
    const bookings = db.collection("bookings");

    // Check for overlapping bookings
    const conflicts = await bookings
      .find({
        sessionId,
        status: { $in: ["confirmed", "pending"] },
        preferredDate: newBookingRequest.preferredDate,
        ...(adminId && { adminId }),
      })
      .toArray();

    if (conflicts.length > 0) {
      return {
        hasConflict: true,
        conflictingBookings: conflicts,
        suggestion:
          "You already have a booking on this date. Would you like to reschedule the existing one or choose a different time?",
      };
    }

    return {
      hasConflict: false,
      conflictingBookings: [],
      suggestion: null,
    };
  } catch (error) {
    console.error("[Booking] Error detecting conflicts:", error);
    return {
      hasConflict: false,
      conflictingBookings: [],
      suggestion: null,
    };
  }
}

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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

// Helper to extract text from URL with redirect handling (same as sitemap route)
async function extractTextFromUrl(
  url: string,
  depth: number = 0
): Promise<string> {
  // Prevent infinite redirect loops
  if (depth > 5) {
    console.log(`[OnDemandCrawl] Max redirect depth reached for ${url}`);
    throw new Error(`Too many redirects for ${url}`);
  }

  const res = await fetch(url, { follow: 20 }); // Follow up to 20 HTTP redirects
  if (!res.ok) throw new Error(`Failed to fetch page: ${url}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Check for HTML meta redirects
  const metaRefresh = $('meta[http-equiv="refresh"]').attr("content");
  if (metaRefresh) {
    const match = metaRefresh.match(/url=(.+)$/i);
    if (match) {
      let redirectUrl = match[1].trim();
      console.log(
        `[OnDemandCrawl] Following meta redirect from ${url} to ${redirectUrl}`
      );

      // Handle relative URLs by converting to absolute
      if (!redirectUrl.startsWith("http")) {
        try {
          const baseUrl = new URL(url);
          redirectUrl = new URL(redirectUrl, baseUrl.origin).href;
          console.log(
            `[OnDemandCrawl] Converted relative URL to absolute: ${redirectUrl}`
          );
        } catch (urlError) {
          console.log(
            `[OnDemandCrawl] Failed to convert relative URL: ${redirectUrl}`,
            urlError
          );
          // If URL conversion fails, proceed with original content
        }
      }

      // Recursively fetch the redirect URL (with a simple depth limit)
      if (redirectUrl.startsWith("http")) {
        return extractTextFromUrl(redirectUrl, depth + 1);
      }
    }
  }

  $("script, style, noscript").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();

  // If the text is too short (likely a redirect page), log it
  if (text.length < 100) {
    console.log(
      `[OnDemandCrawl] Warning: Very short content for ${url} (${
        text.length
      } chars): ${text.substring(0, 100)}`
    );
  }

  return text;
}

// Helper to count tokens using a simple estimation (4 chars per token)
function countTokens(text: string) {
  return Math.ceil(text.length / 4);
}

// Robust AI response parser that handles multiple JSON objects and formats
function parseAIResponse(content: string): {
  mainText: string;
  buttons?: string[];
  emailPrompt?: string;
  followupQuestion?: string;
  showBookingCalendar?: boolean;
  bookingType?: string;
} {
  if (!content || content.trim() === "") {
    return {
      mainText: "I'd be happy to help you with that!",
      buttons: [],
      emailPrompt: "",
      followupQuestion: "",
      showBookingCalendar: false,
      bookingType: undefined,
    };
  }

  try {
    // Method 1: Try parsing as single JSON object first
    const singleJsonMatch = content.match(/^\s*\{[\s\S]*\}\s*$/);
    if (singleJsonMatch) {
      const parsed = JSON.parse(content);
      return {
        mainText: parsed.mainText || parsed.answer || content,
        buttons: parsed.buttons || [],
        emailPrompt: parsed.emailPrompt || "",
        followupQuestion: parsed.followupQuestion || "",
        showBookingCalendar: parsed.showBookingCalendar || false,
        bookingType: parsed.bookingType || undefined,
      };
    }

    // Method 1.5: Try to fix common AI JSON formatting errors
    const fixedContent = content
      .replace(/\}\s*\n\s*"/g, ',"') // Fix missing comma after } before "
      .replace(/\}\s*,?\s*\n\s*}/g, "}}") // Fix double closing braces
      .replace(/"\s*,?\s*\n\s*\]/g, '"]') // Fix array endings
      .replace(/,\s*\]/g, "]") // Remove trailing commas in arrays
      .replace(/,\s*\}/g, "}"); // Remove trailing commas in objects

    try {
      const fixedParsed = JSON.parse(fixedContent);
      console.log("[DEBUG] Fixed JSON parsing successful");
      return {
        mainText: fixedParsed.mainText || fixedParsed.answer || content,
        buttons: fixedParsed.buttons || [],
        emailPrompt: fixedParsed.emailPrompt || "",
        followupQuestion: fixedParsed.followupQuestion || "",
        showBookingCalendar: fixedParsed.showBookingCalendar || false,
        bookingType: fixedParsed.bookingType || undefined,
      };
    } catch (fixError) {
      console.log(
        "[DEBUG] Fixed JSON parsing also failed, continuing to method 2"
      );
    }

    // Method 2: Extract multiple JSON objects from the response
    const result: any = {};

    // Extract mainText from first JSON object (handle escaped quotes and newlines)
    const mainTextMatch = content.match(
      /\{\s*"mainText":\s*"([^"]*(?:\\.[^"]*)*)"/
    );
    if (mainTextMatch) {
      result.mainText = mainTextMatch[1]
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\")
        .replace(/•/g, "•"); // Handle bullet points
    }

    // Extract buttons array - handle both array format and individual strings
    const buttonsMatch = content.match(/\{\s*"buttons":\s*(\[[^\]]*\])\s*\}/);
    if (buttonsMatch) {
      try {
        result.buttons = JSON.parse(buttonsMatch[1]);
      } catch (e) {
        // Fallback: extract button strings manually
        const buttonStrings = buttonsMatch[1].match(/"([^"]+)"/g);
        if (buttonStrings) {
          result.buttons = buttonStrings.map((str) => str.slice(1, -1));
        }
      }
    }

    // Extract emailPrompt
    const emailMatch = content.match(
      /\{\s*"emailPrompt":\s*"([^"]*(?:\\.[^"]*)*)"/
    );
    if (emailMatch) {
      result.emailPrompt = emailMatch[1]
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }

    // Extract followupQuestion
    const followupMatch = content.match(
      /\{\s*"followupQuestion":\s*"([^"]*(?:\\.[^"]*)*)"/
    );
    if (followupMatch) {
      result.followupQuestion = followupMatch[1]
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }

    // If we found mainText, process markdown and return the parsed result
    if (result.mainText) {
      // Process markdown formatting
      result.mainText = result.mainText
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **bold**
        .replace(/\*(.*?)\*/g, "<em>$1</em>") // *italic*
        .replace(/\n\n/g, "<br><br>") // Double line breaks
        .replace(/\n/g, "<br>") // Single line breaks
        .trim();

      return {
        mainText: result.mainText,
        buttons: result.buttons || [],
        emailPrompt: result.emailPrompt || "",
        followupQuestion: result.followupQuestion || "",
        showBookingCalendar: result.showBookingCalendar || false,
        bookingType: result.bookingType || undefined,
      };
    }

    // Method 3: Try combining multiple JSON objects into one
    const jsonObjects = content.match(/\{[^{}]*\}/g);
    if (jsonObjects && jsonObjects.length > 1) {
      const combined: any = {};

      jsonObjects.forEach((jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr);
          Object.assign(combined, parsed);
        } catch (e) {
          // Skip invalid JSON objects
          console.log("[DEBUG] Skipping invalid JSON object:", jsonStr);
        }
      });

      if (combined.mainText || Object.keys(combined).length > 0) {
        // Process markdown formatting
        if (combined.mainText) {
          combined.mainText = combined.mainText
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/\n\n/g, "<br><br>")
            .replace(/\n/g, "<br>")
            .trim();
        }

        return {
          mainText: combined.mainText || "I'd be happy to help you with that!",
          buttons: combined.buttons || [],
          emailPrompt: combined.emailPrompt || "",
          followupQuestion: combined.followupQuestion || "",
          showBookingCalendar: combined.showBookingCalendar || false,
          bookingType: combined.bookingType || undefined,
        };
      }
    }

    // Method 4: Extract content from between JSON objects as fallback
    let extractedText = content;

    // Remove JSON objects and extract readable text
    extractedText = extractedText
      .replace(/\{[^}]*\}/g, "") // Remove JSON objects
      .replace(/^\s*[\{\}]\s*/gm, "") // Remove standalone braces
      .replace(/^\s*"[^"]*":\s*/gm, "") // Remove JSON keys
      .replace(/,\s*$/gm, "") // Remove trailing commas
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    if (extractedText && extractedText.length > 5) {
      // Process markdown formatting
      extractedText = extractedText
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\n\n/g, "<br><br>")
        .replace(/\n/g, "<br>")
        .trim();

      return {
        mainText: extractedText,
        buttons: [],
        emailPrompt: "",
        followupQuestion: "",
        showBookingCalendar: false,
        bookingType: undefined,
      };
    }

    // Ultimate fallback
    return {
      mainText: "I'd be happy to help you with that!",
      buttons: [],
      emailPrompt: "",
      followupQuestion: "",
      showBookingCalendar: false,
      bookingType: undefined,
    };
  } catch (error) {
    console.warn(
      "⚠️ AI response parsing failed completely, using ultimate fallback:",
      error
    );

    // Clean up the content as much as possible
    const cleanText = content
      .replace(/\{[^}]*\}/g, " ") // Remove JSON objects
      .replace(/[{}"\[\]]/g, " ") // Remove JSON syntax
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    return {
      mainText: cleanText || "I'd be happy to help you with that!",
      buttons: [],
      emailPrompt: "",
      followupQuestion: "",
      showBookingCalendar: false,
      bookingType: undefined,
    };
  }
}

// Helper to detect industry/vertical from page URL and content
function detectVertical(pageUrl: string, pageContent: string = ""): string {
  const url = pageUrl.toLowerCase();
  const content = pageContent.toLowerCase();

  console.log(`[VERTICAL DEBUG] Analyzing pageUrl: ${pageUrl}`);
  console.log(`[VERTICAL DEBUG] Content length: ${pageContent.length} chars`);
  console.log(
    `[VERTICAL DEBUG] Content preview: ${content.substring(0, 200)}...`
  );

  // URL-based detection
  if (url.includes("/consulting") || url.includes("/consultant")) {
    console.log(`[VERTICAL DEBUG] Detected 'consulting' from URL: ${pageUrl}`);
    return "consulting";
  }
  if (
    url.includes("/legal") ||
    url.includes("/law") ||
    url.includes("/attorney")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'legal' from URL: ${pageUrl}`);
    return "legal";
  }
  if (
    url.includes("/accounting") ||
    url.includes("/finance") ||
    url.includes("/bookkeeping")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'accounting' from URL: ${pageUrl}`);
    return "accounting";
  }
  if (
    url.includes("/staffing") ||
    url.includes("/recruiting") ||
    url.includes("/hr")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'staffing' from URL: ${pageUrl}`);
    return "staffing";
  }
  if (
    url.includes("/healthcare") ||
    url.includes("/medical") ||
    url.includes("/clinic")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'healthcare' from URL: ${pageUrl}`);
    return "healthcare";
  }
  if (
    url.includes("/education") ||
    url.includes("/school") ||
    url.includes("/university")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'education' from URL: ${pageUrl}`);
    return "education";
  }
  if (
    url.includes("/real-estate") ||
    url.includes("/realty") ||
    url.includes("/property")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'real_estate' from URL: ${pageUrl}`);
    return "real_estate";
  }
  if (
    url.includes("/technology") ||
    url.includes("/software") ||
    url.includes("/saas")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'technology' from URL: ${pageUrl}`);
    return "technology";
  }
  if (
    url.includes("/retail") ||
    url.includes("/ecommerce") ||
    url.includes("/store")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'retail' from URL: ${pageUrl}`);
    return "retail";
  }

  // Content-based detection (basic keyword matching)
  if (content.includes("consultation") || content.includes("advisory")) {
    console.log(`[VERTICAL DEBUG] Detected 'consulting' from content keywords`);
    return "consulting";
  }
  if (
    content.includes("legal") ||
    content.includes("litigation") ||
    content.includes("attorney")
  ) {
    console.log(
      `[VERTICAL DEBUG] Detected 'legal' from content keywords: legal=${content.includes(
        "legal"
      )}, litigation=${content.includes(
        "litigation"
      )}, attorney=${content.includes("attorney")}`
    );
    return "legal";
  }
  if (
    content.includes("accounting") ||
    content.includes("bookkeeping") ||
    content.includes("tax")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'accounting' from content keywords`);
    return "accounting";
  }
  if (
    content.includes("recruiting") ||
    content.includes("staffing") ||
    content.includes("candidates")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'staffing' from content keywords`);
    return "staffing";
  }
  if (
    content.includes("patients") ||
    content.includes("medical") ||
    content.includes("healthcare")
  ) {
    console.log(`[VERTICAL DEBUG] Detected 'healthcare' from content keywords`);
    return "healthcare";
  }

  console.log(`[VERTICAL DEBUG] No vertical detected, returning 'general'`);
  return "general";
}

// Helper to generate vertical-specific messaging
function getVerticalMessage(
  vertical: string,
  productName: string = "our platform"
): {
  message: string;
  buttons: string[];
} {
  const verticalMessages: Record<
    string,
    { message: string; buttons: string[] }
  > = {
    consulting: {
      message: `Consulting teams use ${productName} to eliminate back‑and‑forth scheduling, increase billable hours, and onboard clients faster.`,
      buttons: ["Law Firms", "Accounting", "Staffing", "General Consulting"],
    },
    legal: {
      message: `Law firms eliminate manual scheduling so attorneys can focus on cases, reduce no‑shows, and automate intake—leading to higher billable hours.`,
      buttons: ["Case Studies", "Law Demo", "ROI Calculator"],
    },
    accounting: {
      message: `Accounting firms save hours on coordination using intake forms and automated reminders. Focus on client work, take on more clients efficiently.`,
      buttons: ["Accounting Demo", "ROI Data", "Integration Options"],
    },
    staffing: {
      message: `Staffing teams streamline candidate calls, interviews, and coordination with round‑robin scheduling and reduced coordination loops.`,
      buttons: ["ATS Integrations", "Staffing Demo", "Success Stories"],
    },
    healthcare: {
      message: `Healthcare practices reduce no-shows by 60% with automated reminders and streamlined patient scheduling workflows.`,
      buttons: ["Healthcare Demo", "HIPAA Compliance", "Patient Stories"],
    },
    technology: {
      message: `Tech teams eliminate scheduling friction for demos, onboarding, and support calls. Integrate with your existing tools seamlessly.`,
      buttons: ["Tech Integrations", "API Demo", "Developer Docs"],
    },
    general: {
      message: `Teams across industries use ${productName} to eliminate scheduling friction and boost productivity. See how it works for your field.`,
      buttons: ["Explore Industries", "Quick Demo", "Success Stories"],
    },
  };

  return verticalMessages[vertical] || verticalMessages.general;
}

// Helper to generate conversion-oriented buttons based on vertical and visitor status
function getConversionButtons(
  vertical: string,
  isReturningVisitor: boolean = false
): string[] {
  const conversionButtons: Record<
    string,
    { new: string[]; returning: string[] }
  > = {
    consulting: {
      new: ["Book Demo", "See ROI", "Law Firm Case Study"],
      returning: ["Schedule Call", "Pricing Details", "Implementation"],
    },
    legal: {
      new: ["Legal Demo", "Case Studies", "ROI Calculator"],
      returning: ["Book Consultation", "Security Overview", "Get Quote"],
    },
    accounting: {
      new: ["Accounting Demo", "ROI Data", "Free Trial"],
      returning: ["Schedule Setup", "Pricing Call", "Implementation"],
    },
    staffing: {
      new: ["Staffing Demo", "ATS Integration", "Success Stories"],
      returning: ["Book Demo", "Integration Call", "Custom Quote"],
    },
    healthcare: {
      new: ["Healthcare Demo", "HIPAA Overview", "Patient Stories"],
      returning: ["Compliance Call", "Implementation", "Get Quote"],
    },
    technology: {
      new: ["Tech Demo", "API Docs", "Integration Guide"],
      returning: ["Developer Call", "Custom Setup", "Enterprise Demo"],
    },
    general: {
      new: ["Book Demo", "Quick Tour", "Success Stories"],
      returning: ["Schedule Call", "Get Quote", "Implementation"],
    },
  };

  const buttons = conversionButtons[vertical] || conversionButtons.general;
  return isReturningVisitor ? buttons.returning : buttons.new;
}

// Helper to track SDR events for analytics
async function trackSDREvent(
  eventType: string,
  sessionId: string,
  email?: string,
  vertical?: string,
  pageUrl?: string,
  adminId?: string
) {
  try {
    const db = await getDb();
    const events = db.collection("sdr_events");

    await events.insertOne({
      eventType,
      sessionId,
      email: email || null,
      vertical: vertical || null,
      pageUrl: pageUrl || null,
      adminId: adminId || null,
      timestamp: new Date(),
    });

    console.log(
      `[SDR Analytics] Tracked event: ${eventType} for session ${sessionId}`
    );
  } catch (error) {
    console.error("[SDR Analytics] Failed to track event:", error);
    // Don't break the flow if analytics fails
  }
}

// Detect user persona from conversation history and page behavior
async function detectUserPersona(
  sessionId: string,
  messages: any[],
  pageUrl: string,
  adminId: string
): Promise<any | null> {
  try {
    const db = await getDb();
    const personas = db.collection("customer_personas");

    // Get admin's persona data
    const personaData = await personas.findOne({ adminId });
    if (!personaData || !personaData.targetAudiences) {
      return null;
    }

    // Analyze conversation for persona signals
    const conversationText = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const signals = {
      // Company size indicators
      mentionsTeam: /team|staff|employees|colleagues/i.test(conversationText),
      mentionsEnterprise:
        /enterprise|corporation|department|organization/i.test(
          conversationText
        ),
      mentionsSmallBiz: /small business|startup|freelance|solo/i.test(
        conversationText
      ),

      // Budget sensitivity
      asksPricing: /cost|price|budget|affordable|expensive|cheap/i.test(
        conversationText
      ),
      mentionsBudget: /\$|budget|cost|price|expensive|affordable/i.test(
        conversationText
      ),

      // Technical level
      asksTechnical: /api|integration|webhook|sso|technical|developer/i.test(
        conversationText
      ),
      mentionsIntegration: /integrate|connection|sync|api|plugin/i.test(
        conversationText
      ),

      // Urgency level
      urgentWords: /urgent|asap|immediately|quickly|soon|deadline/i.test(
        conversationText
      ),
      exploratory: /wondering|curious|exploring|looking into|considering/i.test(
        conversationText
      ),

      // Decision making
      decisionLanguage: /decide|decision|choose|purchase|buy|implement/i.test(
        conversationText
      ),
      exploringLanguage: /learn|understand|know more|information|details/i.test(
        conversationText
      ),

      // Page behavior
      onPricingPage: pageUrl.toLowerCase().includes("pricing"),
      onEnterprisePage: pageUrl.toLowerCase().includes("enterprise"),
      onContactPage: pageUrl.toLowerCase().includes("contact"),
    };

    // Score each persona against detected signals
    let bestMatch = null;
    let bestScore = 0;

    for (const persona of personaData.targetAudiences) {
      let score = 0;

      // Company size matching
      if (
        persona.companySize === "1-10" &&
        (signals.mentionsSmallBiz || !signals.mentionsTeam)
      )
        score += 2;
      if (
        persona.companySize === "11-50" &&
        signals.mentionsTeam &&
        !signals.mentionsEnterprise
      )
        score += 2;
      if (persona.companySize === "200+" && signals.mentionsEnterprise)
        score += 3;

      // Technical level matching
      if (persona.technicalLevel === "advanced" && signals.asksTechnical)
        score += 2;
      if (persona.technicalLevel === "beginner" && !signals.asksTechnical)
        score += 1;

      // Budget matching
      if (persona.budget === "under_500" && signals.asksPricing) score += 1;
      if (persona.budget === "10000_plus" && signals.onEnterprisePage)
        score += 2;

      // Urgency matching
      if (persona.urgency === "high" && signals.urgentWords) score += 2;
      if (persona.urgency === "low" && signals.exploratory) score += 1;

      // Decision maker matching
      if (persona.decisionMaker && signals.decisionLanguage) score += 2;
      if (!persona.decisionMaker && signals.exploringLanguage) score += 1;

      // Page context matching
      if (signals.onPricingPage && persona.budget) score += 1;
      if (signals.onEnterprisePage && persona.type === "enterprise") score += 2;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = persona;
      }
    }

    // Only return persona if we have a reasonable confidence level
    if (bestScore >= 3) {
      console.log(
        `[Persona] Detected persona: ${bestMatch.name} (score: ${bestScore})`
      );
      return bestMatch;
    }

    console.log(
      `[Persona] No strong persona match found (best score: ${bestScore})`
    );
    return null;
  } catch (error) {
    console.error("[Persona] Error detecting user persona:", error);
    return null;
  }
}

// Generate persona-specific followup message
async function generatePersonaBasedFollowup(
  detectedPersona: any,
  pageContext: string,
  currentPage: string,
  conversationHistory: string,
  followupCount: number
): Promise<any> {
  try {
    const systemPrompt = `
You are a sales assistant specialized in understanding different customer segments. Generate a followup message that resonates with this specific customer type without using personal names.

Customer Segment Profile:
- Segment: ${detectedPersona.type} (${detectedPersona.companySize} company)
- Key Pain Points: ${detectedPersona.painPoints.join(", ")}
- Preferred Features: ${detectedPersona.preferredFeatures.join(", ")}
- Budget Range: ${detectedPersona.budget}
- Technical Level: ${detectedPersona.technicalLevel}
- Urgency: ${detectedPersona.urgency}
- Decision Maker: ${detectedPersona.decisionMaker ? "Yes" : "No"}

IMPORTANT: Do NOT assume or reference any specific industry, business type, or profession unless the customer has explicitly mentioned it in the conversation. Stay generic and focus on the pain points and features instead.

Current Context:
- Page: ${currentPage}
- Followup #: ${followupCount + 1}
- Page Content: ${pageContext.slice(0, 500)}
- Conversation: ${conversationHistory.slice(-500)}

Generate your response in JSON format:
{
  "mainText": "<Under 30 words. Inform about a specific important item on the page and invite a quick response. End with: 'Please tap an option below.' No personal names>",
  "buttons": ["<Generate exactly 3 short options (2-4 words) that are actionable and specific to the page>"] ,
  "emailPrompt": "<ONLY include this if followupCount >= 2 AND user hasn't provided email yet. Otherwise empty string>"
}

STYLE GUIDELINES (no hard blacklist):
- Prefer informative openings that highlight a concrete feature, benefit, or update from the current page.
- Vary openings and sentence structures; avoid repeating the same pattern as the last message.
- Keep tone helpful and business-focused; avoid negative or accusatory phrasing.
- Stay specific to the page content and segment needs; avoid generic scheduling language.

LEAD GENERATION BUTTON STRATEGY - 3-Button Framework (PERSONA-BASED):
1) Persona Pain Point  2) Persona Solution  3) Persona Requirement
- Extract these directly from page content where possible.
- Buttons must be 2-4 words, actionable, and distinct.

Conversation Flow Intelligence:
- Reference actual page content (features, solutions, use cases) and avoid repetition from the last 1-2 messages.
- Build logically from the previous message; introduce new details.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: "Generate the persona-specific followup message.",
        },
      ],
      temperature: 0.7,
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  } catch (error) {
    console.error("[Persona] Error generating persona-based followup:", error);
    return null;
  }
}

// Generate topic-based followup message
async function generateTopicBasedFollowup(
  followupTopic: string,
  pageContent: string,
  pageUrl: string,
  previousQnA: string,
  followupCount: number
) {
  try {
    const topicPrompts = {
      pricing_plans: {
        mainFocus: "pricing plans, costs, and budget considerations",
        buttons: ["View Pricing", "Compare Plans", "Request Quote"],
      },
      integration_options: {
        mainFocus: "integrations with existing tools and platforms",
        buttons: ["See Integrations", "API Documentation", "Setup Help"],
      },
      advanced_features: {
        mainFocus: "advanced features and capabilities",
        buttons: ["Feature Details", "Demo Request", "Use Cases"],
      },
      use_cases: {
        mainFocus: "real-world use cases and success stories",
        buttons: ["Success Stories", "Case Studies", "Industry Examples"],
      },
      customization: {
        mainFocus: "customization options and personalization",
        buttons: ["Customization Options", "Setup Guide", "Templates"],
      },
      support_resources: {
        mainFocus: "support, documentation, and getting started",
        buttons: ["Help Center", "Documentation", "Contact Support"],
      },
    };

    const topicInfo =
      (topicPrompts as any)[followupTopic] || topicPrompts.pricing_plans;

    const systemPrompt = `You are a sales assistant focused specifically on ${
      topicInfo.mainFocus
    }. 
    Generate a helpful followup message that addresses this specific topic area.
    
    Context:
    - Page URL: ${pageUrl}
    - Followup Number: ${followupCount + 1}
    - Focus Area: ${topicInfo.mainFocus}
    
    Previous Conversation:
    ${previousQnA || "No previous conversation"}
    
    Page Content:
    ${pageContent}
    
    Generate a response that:
    1. Focuses specifically on ${topicInfo.mainFocus}
    2. Is helpful and informative
    3. Encourages engagement
    4. Includes relevant action buttons
    
    Return JSON in this exact format:
    {
      "mainText": "<your focused message about ${topicInfo.mainFocus}>",
      "buttons": ${JSON.stringify(topicInfo.buttons)},
      "emailPrompt": "<ONLY include this if followupCount >= 2 AND user hasn't provided email yet. Otherwise empty string>"
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "Generate the topic-specific followup message.",
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error("No response text from OpenAI");
    }
    const parsed = JSON.parse(responseText);

    console.log(
      `[FOLLOWUP] Generated topic-based followup for ${followupTopic}:`,
      parsed
    );
    return parsed;
  } catch (error) {
    console.error("[FOLLOWUP] Error generating topic-based followup:", error);
    return null;
  }
}

// Helper to split text into ~n-token chunks
async function splitTextIntoTokenChunks(text: string, chunkSize: number) {
  const words = text.split(" ");
  const chunks = [];
  let currentChunk = [];
  let currentTokenCount = 0;
  for (const word of words) {
    const wordTokenCount = countTokens(word);
    if (currentTokenCount + wordTokenCount > chunkSize) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [];
      currentTokenCount = 0;
    }
    currentChunk.push(word);
    currentTokenCount += wordTokenCount;
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }
  return chunks;
}

// Types for chat messages and mainText-like objects
type ChatMessage = {
  role: "user" | "assistant";
  content:
    | string
    | { mainText: string; buttons?: string[]; emailPrompt?: string };
  [key: string]: unknown;
};

type MainTextLike = string | { mainText: string };

// Add a comprehensive intent detection function
function detectIntent({
  question,
  pageUrl,
}: {
  question?: string;
  pageUrl?: string;
}): string {
  const lowerQ = (question || "").toLowerCase();
  const lowerUrl = (pageUrl || "").toLowerCase();

  // Page-based intent detection (prioritized)
  if (lowerUrl.includes("pricing") || lowerUrl.includes("plans")) {
    return "comparing pricing options";
  }
  if (lowerUrl.includes("features") || lowerUrl.includes("capabilities")) {
    return "exploring features";
  }
  if (lowerUrl.includes("about") || lowerUrl.includes("company")) {
    return "learning about the company";
  }
  if (lowerUrl.includes("contact") || lowerUrl.includes("get-started")) {
    return "ready to get started";
  }
  if (lowerUrl.includes("demo") || lowerUrl.includes("trial")) {
    return "requesting a demo";
  }
  if (lowerUrl.includes("services") || lowerUrl.includes("solutions")) {
    return "exploring services";
  }
  if (lowerUrl.includes("support") || lowerUrl.includes("help")) {
    return "seeking support";
  }
  if (lowerUrl.includes("blog") || lowerUrl.includes("resources")) {
    return "researching information";
  }
  if (lowerUrl.includes("team") || lowerUrl.includes("leadership")) {
    return "learning about the team";
  }
  if (lowerUrl.includes("careers") || lowerUrl.includes("jobs")) {
    return "exploring career opportunities";
  }

  // Question-based intent detection (fallback)
  if (lowerQ.includes("how") || lowerQ.includes("works")) {
    return "understanding how it works";
  }
  if (lowerQ.includes("pricing") || lowerQ.includes("cost")) {
    return "pricing information";
  }
  if (lowerQ.includes("demo") || lowerQ.includes("demonstration")) {
    return "requesting a demo";
  }
  if (lowerQ.includes("features") || lowerQ.includes("capabilities")) {
    return "exploring features";
  }
  if (lowerQ.includes("contact") || lowerQ.includes("talk")) {
    return "wanting to connect";
  }

  // Default based on common page patterns
  return "exploring services";
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    question,
    sessionId,
    pageUrl,
    proactive,
    adminId: adminIdFromBody,
    followup,
    hasBeenGreeted = false,
    proactiveMessageCount = 0,
    visitedPages = [],
    contextualQuestionGeneration = false,
    contextualPageContext = null,
    autoResponse = false,
    contextualQuestion = null,
    // Customer Intelligence / User Profile Update parameters
    updateUserProfile = false,
    userEmail: profileUserEmail = null,
    userName: profileUserName = null,
    leadSource = null,
    bookingIntent = null,
    bookingConfirmed = false,
    bookingType = null,
    bookingDate = null,
    bookingTime = null,
    confirmationNumber = null,
    leadStatus = null,
  } = body;

  // Add request ID for debugging
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[Chat API ${requestId}] Processing request:`, {
    question: question ? `"${question}"` : undefined,
    sessionId,
    pageUrl,
    proactive,
    followup,
    contextualQuestionGeneration,
    autoResponse,
    timestamp: new Date().toISOString(),
  });

  if (
    (!question &&
      !proactive &&
      !followup &&
      !contextualQuestionGeneration &&
      !autoResponse) ||
    !sessionId
  )
    return NextResponse.json(
      {
        error:
          "No question, proactive, followup, contextualQuestionGeneration, or autoResponse flag, or no sessionId provided",
      },
      { status: 400, headers: corsHeaders }
    );

  // Check for API key authentication (for external widget usage)
  const apiKey = req.headers.get("x-api-key");
  let apiAuth = null;
  if (apiKey) {
    apiAuth = await verifyApiKey(apiKey);
    console.log("[DEBUG] apiAuth result:", apiAuth);
    if (!apiAuth) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401, headers: corsHeaders }
      );
    }
  }

  // 🔥 HANDLE USER PROFILE UPDATE FOR CUSTOMER INTELLIGENCE
  if (updateUserProfile && profileUserEmail) {
    try {
      console.log(
        `[Chat API ${requestId}] 📊 Updating user profile for customer intelligence`
      );
      console.log(`[Chat API ${requestId}] 📊 Profile data:`, {
        sessionId,
        userEmail: profileUserEmail,
        userName: profileUserName,
        leadSource,
        bookingIntent,
        bookingConfirmed,
        bookingType,
        bookingDate,
        bookingTime,
        confirmationNumber,
        leadStatus,
      });

      const db = await getDb();
      const conversationsCollection = db.collection("conversations");

      // Update or create conversation record with user profile data
      const profileUpdateData = {
        sessionId,
        userEmail: profileUserEmail,
        userName: profileUserName || "Anonymous User",
        pageUrl,
        lastActivity: new Date(),
        profileUpdated: true,
        ...(leadSource && { leadSource }),
        ...(bookingIntent && { bookingIntent }),
        ...(bookingConfirmed && { bookingConfirmed }),
        ...(bookingType && { bookingType }),
        ...(bookingDate && { bookingDate }),
        ...(bookingTime && { bookingTime }),
        ...(confirmationNumber && { confirmationNumber }),
        ...(leadStatus && { leadStatus }),
      };

      await conversationsCollection.updateOne(
        { sessionId },
        {
          $set: profileUpdateData,
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );

      // Also create/update lead record
      if (profileUserEmail) {
        const adminId = apiAuth?.adminId || "default-admin";
        const leadRequirements = bookingIntent
          ? `${bookingType} booking for ${bookingDate} at ${bookingTime}`
          : question || "Calendar booking";

        await createOrUpdateLead(
          adminId,
          profileUserEmail,
          sessionId,
          leadRequirements,
          pageUrl,
          question || `User provided email for ${bookingType} booking`,
          {
            detectedIntent: bookingIntent || "booking",
            userResponses: [
              `Email: ${profileUserEmail}`,
              `Name: ${profileUserName}`,
            ],
            visitedPages: [pageUrl],
          }
        );
      }

      console.log(
        `[Chat API ${requestId}] ✅ User profile updated successfully`
      );

      // Return early for profile update requests
      return NextResponse.json(
        {
          success: true,
          message: "User profile updated successfully",
          profileData: profileUpdateData,
        },
        { headers: corsHeaders }
      );
    } catch (error) {
      console.error(
        `[Chat API ${requestId}] ❌ Error updating user profile:`,
        error
      );
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500, headers: corsHeaders }
      );
    }
  }

  // Handle contextual question generation request
  if (contextualQuestionGeneration && contextualPageContext) {
    try {
      console.log("[DEBUG] Handling contextual question generation");

      const contextualPrompt = `You are an intelligent business assistant analyzing a webpage to generate contextual questions. 

Page Context:
${JSON.stringify(contextualPageContext, null, 2)}

CRITICAL REQUIREMENTS:
1. You MUST respond with ONLY valid JSON - no additional text or formatting
2. The JSON MUST have exactly these fields: mainText, buttons, emailPrompt
3. mainText should be a friendly, contextual question based on the page content
4. buttons should be an array of 2-3 relevant follow-up options
5. emailPrompt should be empty string "" (not used for contextual questions)

Examples of proper JSON response:
{"mainText": "I see you're exploring our pricing options! What's most important to you - getting started quickly or finding the most cost-effective solution?", "buttons": ["Quick Start Options", "Cost Comparison", "Feature Details"], "emailPrompt": ""}

Based on the page context, create an intelligent contextual question that demonstrates understanding of the page content and helps the user explore their needs.`;

      const contextualResp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are an expert at creating contextual business questions. You MUST respond with valid JSON only. No additional text, explanations, or markdown formatting. Just pure JSON with mainText, buttons, and emailPrompt fields.",
          },
          { role: "user", content: contextualPrompt },
        ],
      });

      const aiResponse =
        contextualResp.choices[0].message.content?.trim() || "";
      console.log(
        "[DEBUG] Raw AI response for contextual question:",
        aiResponse
      );

      // Clean up AI response to handle HTML entities and formatting issues
      let cleanedResponse = aiResponse;

      // Remove common AI formatting issues
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, ""); // Remove ```json
      cleanedResponse = cleanedResponse.replace(/```\s*$/g, ""); // Remove closing ```
      cleanedResponse = cleanedResponse.replace(/<br\s*\/?>/gi, "\\n"); // Convert <br> to \n
      cleanedResponse = cleanedResponse.replace(/&quot;/g, '"'); // Convert &quot; to "
      cleanedResponse = cleanedResponse.replace(/&amp;/g, "&"); // Convert &amp; to &
      cleanedResponse = cleanedResponse.trim();

      console.log("[DEBUG] Cleaned AI response:", cleanedResponse);

      // Parse the AI response with robust error handling
      let parsed;
      try {
        parsed = JSON.parse(cleanedResponse);

        // Validate required fields
        if (!parsed.mainText || !Array.isArray(parsed.buttons)) {
          throw new Error("Invalid response structure");
        }

        // Ensure emailPrompt exists
        if (!parsed.hasOwnProperty("emailPrompt")) {
          parsed.emailPrompt = "";
        }

        console.log("[DEBUG] Successfully parsed contextual question:", parsed);
      } catch (parseError) {
        console.error(
          "[DEBUG] Failed to parse AI response, using fallback:",
          parseError
        );
        console.log(
          "[DEBUG] Attempting to extract content from malformed response..."
        );

        // Try to extract content from malformed response
        let extractedMainText =
          "I notice you're exploring this page. What would you like to know more about?";
        let extractedButtons = ["Learn More", "Get Started", "Contact Us"];

        // Look for mainText in the response
        const mainTextMatch = cleanedResponse.match(/"mainText":\s*"([^"]+)"/);
        if (mainTextMatch) {
          extractedMainText = mainTextMatch[1].replace(/\\n/g, "\n");
          console.log("[DEBUG] Extracted mainText:", extractedMainText);
        }

        // Look for buttons array in the response
        const buttonsMatch = cleanedResponse.match(/"buttons":\s*\[([^\]]+)\]/);
        if (buttonsMatch) {
          try {
            const buttonsPart = "[" + buttonsMatch[1] + "]";
            extractedButtons = JSON.parse(buttonsPart);
            console.log("[DEBUG] Extracted buttons:", extractedButtons);
          } catch (buttonError) {
            console.log("[DEBUG] Could not parse buttons, using defaults");
          }
        }

        // Fallback response with extracted or default content
        parsed = {
          mainText: extractedMainText,
          buttons: extractedButtons,
          emailPrompt: "",
        };

        console.log(
          "[DEBUG] Using fallback response with extracted content:",
          parsed
        );
      }

      // Check for booking detection for contextual questions
      let enhancedResponse = parsed;
      try {
        const bookingEnhancement = await enhanceChatWithBookingDetection(
          question || "",
          [], // conversation history - could be enhanced later
          `Page URL: ${pageUrl || "unknown"}`
        );

        if (bookingEnhancement.chatResponse.showBookingCalendar) {
          console.log(
            "[Chat API] Booking detected in contextual question - enhancing response with calendar"
          );
          enhancedResponse = {
            ...parsed,
            showBookingCalendar: true,
            bookingType: bookingEnhancement.chatResponse.bookingType || "demo",
            // Override mainText with booking-specific response
            mainText: bookingEnhancement.chatResponse.reply || parsed.mainText,
          };
        }
      } catch (error) {
        console.warn(
          "[Chat API] Booking detection failed for contextual question:",
          error
        );
        // Continue with original response if booking detection fails
      }

      // Add bot mode
      const botMode = "lead_generation"; // Contextual questions are for lead generation
      const responseWithMode = {
        ...enhancedResponse,
        botMode,
        userEmail: null,
      };

      console.log(
        "[DEBUG] Returning contextual question response:",
        responseWithMode
      );

      return NextResponse.json(responseWithMode, { headers: corsHeaders });
    } catch (error) {
      console.error("[DEBUG] Error in contextual question generation:", error);

      // Return fallback response
      const fallbackResponse = {
        mainText:
          "I'm here to help! What would you like to know about our services?",
        buttons: ["Learn More", "Get Started", "Contact Us"],
        emailPrompt: "",
        botMode: "lead_generation",
        userEmail: null,
      };

      return NextResponse.json(fallbackResponse, { headers: corsHeaders });
    }
  }

  // Handle auto-response for contextual questions
  if (autoResponse && contextualQuestion) {
    try {
      console.log(
        "[DEBUG] Generating auto-response for contextual question:",
        contextualQuestion
      );

      const autoResponsePrompt = `You are a helpful business assistant. A user was shown this contextual question but didn't respond: "${contextualQuestion}"

Please provide a helpful, informative answer to this question that would be valuable to the user. After your answer, naturally transition to asking for their email address so you can send them more detailed information.

CRITICAL REQUIREMENTS:
1. You MUST respond with ONLY valid JSON - no additional text or formatting
2. The JSON MUST have exactly these fields: mainText, emailPrompt
3. mainText should be your helpful answer (2-3 sentences) followed by a natural transition to email collection
4. emailPrompt should be a natural request for their email address

Example of proper JSON response:
{"mainText": "Based on your interest in our pricing, I'd recommend starting with our Professional plan as it offers the best balance of features and value. Most businesses see ROI within 3 months. I'd love to send you a detailed comparison guide and pricing breakdown.", "emailPrompt": "What's your email address so I can send you the complete pricing guide?"}

Keep the response conversational and helpful, focusing on providing value before asking for contact information.`;

      const autoResponseResult = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 250,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are an expert at creating helpful auto-responses that provide value before requesting contact information. You MUST respond with valid JSON only. No additional text, explanations, or markdown formatting. Just pure JSON with mainText and emailPrompt fields.",
          },
          { role: "user", content: autoResponsePrompt },
        ],
      });

      const aiResponse =
        autoResponseResult.choices[0]?.message?.content?.trim() || "";
      console.log("[DEBUG] Raw AI response for auto-response:", aiResponse);

      // Parse the AI response with robust error handling
      let parsed;
      try {
        parsed = JSON.parse(aiResponse);

        // Validate required fields
        if (!parsed.mainText || !parsed.emailPrompt) {
          throw new Error("Invalid auto-response structure");
        }

        console.log("[DEBUG] Successfully parsed auto-response:", parsed);
      } catch (parseError) {
        console.error(
          "[DEBUG] Failed to parse auto-response, using fallback:",
          parseError
        );

        // Fallback response if AI doesn't return valid JSON
        parsed = {
          mainText:
            "Thanks for your interest! I'd be happy to provide you with more detailed information about our services that could help with your specific needs.",
          emailPrompt:
            "What's your email address so I can send you more personalized information?",
        };
      }

      // Check for booking detection in auto-response
      let enhancedAutoResponse = parsed;
      try {
        const bookingEnhancement = await enhanceChatWithBookingDetection(
          contextualQuestion || "",
          [], // conversation history - could be enhanced later
          `Page URL: ${pageUrl || "unknown"}`
        );

        if (bookingEnhancement.chatResponse.showBookingCalendar) {
          console.log(
            "[Chat API] Booking detected in auto-response - enhancing response with calendar"
          );
          enhancedAutoResponse = {
            ...parsed,
            showBookingCalendar: true,
            bookingType: bookingEnhancement.chatResponse.bookingType || "demo",
            // Override mainText with booking-specific response
            mainText: bookingEnhancement.chatResponse.reply || parsed.mainText,
          };
        }
      } catch (error) {
        console.warn(
          "[Chat API] Booking detection failed for auto-response:",
          error
        );
        // Continue with original response if booking detection fails
      }

      // Add additional fields for auto-response
      const autoResponseData = {
        ...enhancedAutoResponse,
        isAutoResponse: true,
        botMode: "lead_generation",
        userEmail: null,
      };

      console.log("[DEBUG] Returning auto-response:", autoResponseData);

      return NextResponse.json(autoResponseData, { headers: corsHeaders });
    } catch (error) {
      console.error("[DEBUG] Error in auto-response generation:", error);

      // Return fallback auto-response
      const fallbackAutoResponse = {
        mainText:
          "Thanks for your interest! I'd love to share more information about how our services can help you achieve your goals.",
        emailPrompt:
          "Could you share your email address so I can send you more details?",
        isAutoResponse: true,
        botMode: "lead_generation",
        userEmail: null,
      };

      return NextResponse.json(fallbackAutoResponse, { headers: corsHeaders });
    }
  }

  // Email detection from freeform text in conversation
  const emailInText = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  let detectedEmail: string | null = null;
  if (question) {
    const match = question.match(emailInText);
    if (match) detectedEmail = match[0];
  }

  // Save to MongoDB
  const db = await getDb();
  const chats = db.collection("chats");
  const now = new Date();

  // Get adminId if available (prioritize API key auth, then request body, then previous chat)
  let adminId: string | null = null;
  if (apiAuth) {
    // Use adminId from API key authentication (highest priority)
    adminId = apiAuth.adminId;
    console.log(`[DEBUG] Using adminId from API key: ${adminId}`);
  } else if (adminIdFromBody) {
    adminId = adminIdFromBody;
    console.log(`[DEBUG] Using adminId from request body: ${adminId}`);
  } else {
    // Try cookie-based admin resolution
    try {
      const cookieAccess = verifyAdminAccessFromCookie(req);
      if (cookieAccess?.isValid && cookieAccess.adminId) {
        adminId = cookieAccess.adminId;
        console.log(`[DEBUG] Using adminId from cookie: ${adminId}`);
      }
    } catch (err) {
      console.log(`[DEBUG] Cookie-based adminId resolution failed:`, err);
    }

    // Fallback to previous chat history
    if (!adminId) {
      const lastMsg = await chats.findOne({
        sessionId,
        adminId: { $exists: true },
      });
      if (lastMsg && lastMsg.adminId) {
        adminId = lastMsg.adminId;
        console.log(`[DEBUG] Using adminId from previous chat: ${adminId}`);
      }
    }
  }

  // 🔥 PHASE 1: CHECK BOOKING STATUS
  const bookingStatus = await getSessionBookingStatus(
    sessionId,
    adminId || undefined
  );
  console.log(
    `[Chat API ${requestId}] Booking status for session ${sessionId}:`,
    {
      hasActiveBooking: bookingStatus.hasActiveBooking,
      bookingType: bookingStatus.currentBooking?.requestType,
      bookingDate: bookingStatus.currentBooking?.preferredDate,
      canBookAgain: bookingStatus.canBookAgain,
    }
  );

  // 🔰 Onboarding flow entry
  let onboardingConfig: OnboardingSettings | undefined = undefined;
  if (adminId) {
    try {
      const settings = await getAdminSettings(adminId);
      onboardingConfig = settings.onboarding;
    } catch (e) {
      console.log("[Onboarding] Failed to load admin onboarding settings:", e);
    }
  }

  const onboardingEnabled = !!onboardingConfig?.enabled;
  const sessionsCollection = db.collection("onboardingSessions");
  const existingOnboarding = await sessionsCollection.findOne({ sessionId });
  const isOnboardingAction = question && /\bcancel onboarding\b/i.test(question || "");
  const isOnboardingIntent = onboardingEnabled && (detectOnboardingIntent(question) || existingOnboarding?.status === "in_progress" || isOnboardingAction);

  if (isOnboardingIntent) {
    const fields = (onboardingConfig?.fields && onboardingConfig.fields.length > 0)
      ? onboardingConfig.fields
      : [
          { key: "email", label: "Email", required: true, type: "email" },
          { key: "firstName", label: "First Name", required: true, type: "text" },
          { key: "lastName", label: "Last Name", required: false, type: "text" },
        ];

    // Ask only relevant (required) questions by default
    const sessionFields = fields.filter((f: any) => f.required) as any[];
    const fieldsToAsk = sessionFields.length > 0 ? sessionFields : fields;

    // Cancel flow
    if (isOnboardingAction) {
      await sessionsCollection.updateOne(
        { sessionId },
        { $set: { status: "cancelled", updatedAt: now } },
        { upsert: true }
      );

      const resp = {
        mainText: "Okay, I’ve cancelled onboarding. Would you like sales or support?",
        buttons: ["Talk to Sales", "Contact Support"],
        emailPrompt: "",
        showBookingCalendar: false,
        onboardingAction: "cancelled",
      };
      return NextResponse.json(resp, { headers: corsHeaders });
    }

    // Start if no session or completed/cancelled
    let sessionDoc = existingOnboarding;
    if (!sessionDoc || ["completed", "cancelled"].includes(sessionDoc.status)) {
      const doc = {
        sessionId,
        adminId: adminId || "",
        status: "in_progress",
        stageIndex: 0,
        collectedData: {},
        requiredKeys: fieldsToAsk.map((f: any) => f.key),
        fields: fieldsToAsk,
        createdAt: now,
        updatedAt: now,
      };
      await sessionsCollection.updateOne({ sessionId }, { $set: doc }, { upsert: true });
      sessionDoc = doc as any;

      const intro = onboardingConfig?.docsUrl
        ? `I’ll help create your account. I may ask a few details. You can also check the docs here: ${onboardingConfig.docsUrl}`
        : `I’ll help create your account. I’ll ask a few quick details.`;

      const prompt = promptForField(fieldsToAsk[0]);
      const docContext = await buildOnboardingDocContext(fieldsToAsk[0], adminId || undefined);
      const resp = {
        mainText: `${intro}${docContext ? `\n\n${docContext}` : ""}\n\n${prompt}`,
        buttons: ["Cancel Onboarding"],
        emailPrompt: "",
        showBookingCalendar: false,
        onboardingAction: "start",
      };
      return NextResponse.json(resp, { headers: corsHeaders });
    }

    // Continue: accept answer for current field
    const idx = sessionDoc.stageIndex || 0;
    const currentField = sessionDoc.fields[idx];
    if (!currentField) {
      // No more fields; submit
      const payload = sessionDoc.collectedData || {};
      const result = adminId ? await onboardingService.register(payload, adminId) : { success: false, error: "Missing adminId" };

      const newStatus = result.success ? "completed" : "error";
      await sessionsCollection.updateOne(
        { sessionId },
        { $set: { status: newStatus, updatedAt: now, registeredUserId: result.userId || null, lastError: result.error || null } }
      );

      const resp = result.success
        ? {
            mainText: "✅ You’re all set! Your account has been created.",
            buttons: ["Log In", "Talk to Sales"],
            emailPrompt: "",
            showBookingCalendar: false,
            onboardingAction: "completed",
          }
        : {
            mainText: `⚠️ We couldn’t complete registration: ${result.error || "Unknown error"}.`,
            buttons: ["Try Again", "Contact Support"],
            emailPrompt: "",
            showBookingCalendar: false,
            onboardingAction: "error",
          };

      return NextResponse.json(resp, { headers: corsHeaders });
    }

    // Validate and store answer
    const ans = (question || "").trim();
    const check = validateAnswer(currentField, ans);
    if (!check.valid) {
      const docContext = await buildOnboardingDocContext(currentField, adminId || undefined);
      const resp = {
        mainText: `${docContext ? `${docContext}\n\n` : ""}${check.message || `Please provide your ${currentField.label || currentField.key}.`}`,
        buttons: ["Cancel Onboarding"],
        emailPrompt: "",
        showBookingCalendar: false,
        onboardingAction: "ask_again",
      };
      return NextResponse.json(resp, { headers: corsHeaders });
    }

    const updated = {
      ...sessionDoc.collectedData,
      [currentField.key]: currentField.type === "email" && check.normalized ? check.normalized : ans,
    };
    const nextIndex = idx + 1;
    await sessionsCollection.updateOne(
      { sessionId },
      { $set: { collectedData: updated, stageIndex: nextIndex, updatedAt: now } }
    );

    const nextField = sessionDoc.fields[nextIndex];
    if (!nextField) {
      // All done: submit
      const payload = updated;
      const result = adminId ? await onboardingService.register(payload, adminId) : { success: false, error: "Missing adminId" };

      const newStatus = result.success ? "completed" : "error";
      await sessionsCollection.updateOne(
        { sessionId },
        { $set: { status: newStatus, updatedAt: now, registeredUserId: result.userId || null, lastError: result.error || null } }
      );

      const resp = result.success
        ? {
            mainText: "✅ You’re all set! Your account has been created.",
            buttons: ["Log In", "Talk to Sales"],
            emailPrompt: "",
            showBookingCalendar: false,
            onboardingAction: "completed",
          }
        : {
            mainText: `⚠️ We couldn’t complete registration: ${result.error || "Unknown error"}.`,
            buttons: ["Try Again", "Contact Support"],
            emailPrompt: "",
            showBookingCalendar: false,
            onboardingAction: "error",
          };

      return NextResponse.json(resp, { headers: corsHeaders });
    }

    const prompt = promptForField(nextField);
    const docContext = await buildOnboardingDocContext(nextField, adminId || undefined);
    const resp = {
      mainText: `${docContext ? `${docContext}\n\n` : ""}${prompt}`,
      buttons: ["Cancel Onboarding"],
      emailPrompt: "",
      showBookingCalendar: false,
      onboardingAction: "ask_next",
    };
    return NextResponse.json(resp, { headers: corsHeaders });
  }

  // If email detected, update all previous messages in this session with email and adminId
  if (detectedEmail) {
    const updateData: {
      email: string;
      adminId?: string;
      requirements?: string;
    } = {
      email: detectedEmail,
    };
    if (adminId) {
      updateData.adminId = adminId;
    }

    // Extract customer requirements using AI
    let extractedRequirements: string | null = null;
    let conversationHistory: {
      role: string;
      content: string;
      createdAt: Date;
    }[] = [];

    try {
      const historyDocs = await chats
        .find({ sessionId })
        .sort({ createdAt: 1 })
        .toArray();

      conversationHistory = historyDocs.map((doc) => ({
        role: doc.role as string,
        content: doc.content as string,
        createdAt: doc.createdAt as Date,
      }));

      const conversation = conversationHistory
        .map(
          (msg) =>
            `${msg.role === "user" ? "Customer" : "Assistant"}: ${msg.content}`
        )
        .join("\n");

      if (conversation.length > 50) {
        // Only analyze if there's meaningful conversation
        const requirementsPrompt = `Analyze this customer conversation and extract their key requirements, needs, or interests in 2-3 bullet points. Be specific and business-focused. If no clear requirements are mentioned, respond with "General inquiry".

Conversation:
${conversation}

Customer: ${question}

Extract key requirements (2-3 bullet points max, be concise):`;

        const requirementsResp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 150,
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content:
                "You are an expert at analyzing customer conversations to extract business requirements. Focus on specific needs, use cases, budget constraints, timeline requirements, technical specifications, or business goals. Be concise and actionable.",
            },
            { role: "user", content: requirementsPrompt },
          ],
        });

        extractedRequirements =
          requirementsResp.choices[0].message.content?.trim() || null;
        if (
          extractedRequirements &&
          extractedRequirements !== "General inquiry"
        ) {
          updateData.requirements = extractedRequirements;
          console.log(
            `[LeadGen] Extracted requirements for ${detectedEmail}: ${extractedRequirements}`
          );
        }
      }
    } catch (error) {
      console.error("[LeadGen] Error extracting requirements:", error);
      // Continue without requirements if AI analysis fails
    }

    // Update chat messages with email and adminId
    await chats.updateMany({ sessionId }, { $set: updateData });

    // Create or update lead in separate collection
    if (adminId) {
      try {
        const firstMessage =
          conversationHistory.length > 0
            ? conversationHistory[0].content
            : question || "";

        // Gather context for lead enrichment
        let pageContext = {};

        // Try to detect intent and vertical for current context
        if (pageUrl) {
          try {
            const detectedIntent = detectIntent({ question, pageUrl });
            let detectedVertical = "general";
            let pageContent = "";

            // Get page content if available for better vertical detection
            if (adminId) {
              const pageChunks = await getChunksByPageUrl(adminId, pageUrl);
              if (pageChunks.length > 0) {
                pageContent = pageChunks.slice(0, 10).join("\n");
                detectedVertical = detectVertical(pageUrl, pageContent);
              }
            }

            // Get visited pages from session
            const sessionMessages = await chats.find({ sessionId }).toArray();
            const visitedPages = [
              ...new Set(
                sessionMessages
                  .map((m) => m.pageUrl)
                  .filter((url) => url && url !== pageUrl)
              ),
            ];

            // Extract any questions asked and user responses
            const proactiveQuestions = sessionMessages
              .filter(
                (m) =>
                  m.role === "assistant" && m.content && m.content.includes("?")
              )
              .map((m) => m.content);

            const userResponses = sessionMessages
              .filter((m) => m.role === "user")
              .map((m) => m.content);

            pageContext = {
              pageContent: pageContent.substring(0, 500), // Limit size
              detectedIntent,
              detectedVertical,
              proactiveQuestions: proactiveQuestions.slice(-3), // Last 3 questions
              userResponses: userResponses.slice(-5), // Last 5 responses
              visitedPages: visitedPages.slice(-10), // Last 10 unique pages
            };

            console.log(
              `[LeadGen] Enhanced context: intent=${detectedIntent}, vertical=${detectedVertical}, pages=${visitedPages.length}`
            );
          } catch (contextError) {
            console.error("[LeadGen] Error gathering context:", contextError);
            // Continue with basic context
          }
        }

        await createOrUpdateLead(
          adminId,
          detectedEmail,
          sessionId,
          extractedRequirements,
          pageUrl || undefined,
          firstMessage,
          pageContext
        );

        console.log(
          `[LeadGen] Created/updated lead record for ${detectedEmail} with adminId: ${adminId}`
        );
      } catch (error) {
        console.error("[LeadGen] Error creating lead record:", error);
        // Continue even if lead creation fails
      }
    }

    // Log for verification
    console.log(
      `[LeadGen] Stored email for session ${sessionId}: ${detectedEmail} with adminId: ${adminId}`
    );

    // Track email capture event
    await trackSDREvent(
      "email_captured",
      sessionId,
      detectedEmail,
      undefined,
      pageUrl || undefined,
      adminId || undefined
    );

    // Immediate SDR-style activation message after email detection
    const companyName = "Your Company"; // TODO: Make this dynamic from admin settings
    const productName = "our platform"; // TODO: Make this dynamic from admin settings

    const activationMessage = {
      mainText: `Hi! I'm ${companyName}'s friendly assistant. I'm here to show how ${productName} can boost your productivity and streamline your workflow.`,
      buttons: ["Explore Solutions", "See Use Cases", "Book Quick Demo"],
      emailPrompt: "",
      botMode: "sales",
      userEmail: detectedEmail,
    };

    // Store the activation message immediately
    await chats.insertOne({
      sessionId,
      role: "assistant",
      content: activationMessage.mainText,
      buttons: activationMessage.buttons,
      emailPrompt: activationMessage.emailPrompt,
      botMode: activationMessage.botMode,
      userEmail: detectedEmail,
      email: detectedEmail,
      adminId,
      createdAt: now,
      apiKey,
      pageUrl,
    });

    // Return activation message immediately (this becomes the bot's response to the email)
    return NextResponse.json(activationMessage, { headers: corsHeaders });
  }

  // ===== INTELLIGENT CUSTOMER PROFILING =====
  // Strategic profile updates - not on every message, but on smart triggers
  if (adminId && sessionId) {
    try {
      // Get conversation history for profiling analysis
      const historyDocs = await chats
        .find({ sessionId })
        .sort({ createdAt: 1 })
        .toArray();

      const conversationForProfiling = historyDocs.map((doc) => ({
        role: doc.role as string,
        content: doc.content as string,
        createdAt: doc.createdAt as Date,
      }));

      // Add current message to conversation
      if (question) {
        conversationForProfiling.push({
          role: "user",
          content: question,
          createdAt: now,
        });
      }

      const messageCount = conversationForProfiling.length;
      const timeInSession = visitedPages?.length ? visitedPages.length * 60 : 0; // Rough estimate
      const pageTransitions = visitedPages || [];

      // Call customer profiling API to determine if update is needed
      const profileResponse = await fetch(
        `${req.nextUrl.origin}/api/customer-profiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey || "",
          },
          body: JSON.stringify({
            sessionId,
            email: detectedEmail,
            conversation: conversationForProfiling,
            messageCount,
            timeInSession,
            pageTransitions,
            pageUrl,
            trigger: detectedEmail ? "email_detection" : undefined,
          }),
        }
      );

      if (profileResponse.ok) {
        const profileResult = (await profileResponse.json()) as any;
        if (profileResult.updated) {
          console.log(
            `[CustomerProfiling] Profile updated via ${profileResult.trigger} - Confidence: ${profileResult.confidence}`
          );

          // Store profile data for potential use in response generation
          if (profileResult.profile?.intelligenceProfile?.buyingReadiness) {
            console.log(
              `[CustomerProfiling] Buying readiness: ${profileResult.profile.intelligenceProfile.buyingReadiness}`
            );
          }
        }
      } else {
        console.log(
          "[CustomerProfiling] Profile update request failed:",
          profileResponse.status
        );
      }
    } catch (error) {
      console.error(
        "[CustomerProfiling] Error in profile update process:",
        error
      );
      // Continue with normal chat flow - profiling failures shouldn't break the conversation
    }
  }

  // 🔥 PHASE 1: HANDLE BOOKING-AWARE RESPONSES
  if (question && !detectedEmail) {
    // Check if user is asking for booking but already has one
    const bookingAwareResponse = generateBookingAwareResponse(
      { mainText: "", buttons: [] }, // Will be filled by AI if needed
      bookingStatus,
      question
    );

    if (bookingAwareResponse.existingBooking) {
      console.log(
        `[Chat API ${requestId}] 🔒 User has active booking, returning booking-aware response`
      );

      // Store user message
      await chats.insertOne({
        sessionId,
        role: "user",
        content: question,
        createdAt: now,
        adminId,
        apiKey,
        pageUrl,
        hasActiveBooking: bookingStatus.hasActiveBooking,
        bookingId: bookingStatus.currentBooking?._id,
      });

      // Store booking-aware response
      await chats.insertOne({
        sessionId,
        role: "assistant",
        content: bookingAwareResponse.mainText,
        buttons: bookingAwareResponse.buttons,
        createdAt: new Date(now.getTime() + 1),
        adminId,
        apiKey,
        pageUrl,
        hasActiveBooking: bookingStatus.hasActiveBooking,
        bookingId: bookingStatus.currentBooking?._id,
        existingBooking: true,
      });

      return NextResponse.json(bookingAwareResponse, { headers: corsHeaders });
    }

    // 🔥 PHASE 2: Handle booking management actions
    const bookingActions = [
      "view details",
      "view booking details",
      "view full details",
      "reschedule",
      "add to calendar",
      "cancel booking",
    ];
    const isBookingAction = bookingActions.some((action) =>
      question.toLowerCase().includes(action.toLowerCase())
    );

    if (isBookingAction && bookingStatus.hasActiveBooking) {
      console.log(
        `[Chat API ${requestId}] 🎛️ Handling booking management action: ${question}`
      );

      // Determine which action was requested
      let requestedAction = "manage"; // default
      for (const action of bookingActions) {
        if (question.toLowerCase().includes(action.toLowerCase())) {
          requestedAction = action;
          break;
        }
      }

      // Special handling: perform real cancellation
      if (requestedAction === "cancel booking" && bookingStatus.currentBooking?._id) {
        try {
          const cancelled = await bookingService.cancelBooking(
            bookingStatus.currentBooking._id.toString(),
            adminId || undefined
          );

          // Store user message
          await chats.insertOne({
            sessionId,
            role: "user",
            content: question,
            createdAt: now,
            adminId,
            apiKey,
            pageUrl,
            hasActiveBooking: bookingStatus.hasActiveBooking,
            bookingId: bookingStatus.currentBooking?._id,
            bookingAction: requestedAction,
          });

          if (cancelled) {
            await updateChatWithBookingReference(
              sessionId,
              bookingStatus.currentBooking._id.toString(),
              false,
              adminId || undefined
            );

            const response = {
              mainText:
                "✅ Your appointment has been cancelled. Would you like to book a new time or need assistance?",
              buttons: ["Schedule Now", "Contact Support"],
              emailPrompt: "",
              showBookingCalendar: false,
              bookingAction: "cancel_booking",
              cancelled: true,
            };

            await chats.insertOne({
              sessionId,
              role: "assistant",
              content: response.mainText,
              buttons: response.buttons,
              createdAt: new Date(now.getTime() + 1),
              adminId,
              apiKey,
              pageUrl,
              hasActiveBooking: false,
              bookingId: bookingStatus.currentBooking?._id,
              bookingAction: "cancel_booking",
            });

            return NextResponse.json(response, { headers: corsHeaders });
          } else {
            const response = {
              mainText:
                "❌ Sorry, I couldn’t cancel that booking. It may already be cancelled or not found. Please try again.",
              buttons: ["View Full Details", "Reschedule", "Contact Support"],
              emailPrompt: "",
              showBookingCalendar: false,
              bookingAction: "cancel_booking_failed",
              cancelled: false,
            };

            await chats.insertOne({
              sessionId,
              role: "assistant",
              content: response.mainText,
              buttons: response.buttons,
              createdAt: new Date(now.getTime() + 1),
              adminId,
              apiKey,
              pageUrl,
              hasActiveBooking: bookingStatus.hasActiveBooking,
              bookingId: bookingStatus.currentBooking?._id,
              bookingAction: "cancel_booking_failed",
            });

            return NextResponse.json(response, { headers: corsHeaders });
          }
        } catch (err) {
          const response = {
            mainText:
              "❌ Sorry, something went wrong while cancelling. Please try again or contact support.",
            buttons: ["View Full Details", "Reschedule", "Contact Support"],
            emailPrompt: "",
            showBookingCalendar: false,
            bookingAction: "cancel_booking_error",
            cancelled: false,
          };

          await chats.insertOne({
            sessionId,
            role: "assistant",
            content: response.mainText,
            buttons: response.buttons,
            createdAt: new Date(now.getTime() + 1),
            adminId,
            apiKey,
            pageUrl,
            hasActiveBooking: bookingStatus.hasActiveBooking,
            bookingId: bookingStatus.currentBooking?._id,
            bookingAction: "cancel_booking_error",
          });

          return NextResponse.json(response, { headers: corsHeaders });
        }
      }

      const managementResponse = generateBookingManagementResponse(
        requestedAction,
        bookingStatus.currentBooking
      );

      // Store user message
      await chats.insertOne({
        sessionId,
        role: "user",
        content: question,
        createdAt: now,
        adminId,
        apiKey,
        pageUrl,
        hasActiveBooking: bookingStatus.hasActiveBooking,
        bookingId: bookingStatus.currentBooking?._id,
        bookingAction: requestedAction,
      });

      // Store management response (if generated)
      if (managementResponse) {
        await chats.insertOne({
          sessionId,
          role: "assistant",
          content: managementResponse.mainText,
          buttons: managementResponse.buttons,
          createdAt: new Date(now.getTime() + 1),
          adminId,
          apiKey,
          pageUrl,
          hasActiveBooking: bookingStatus.hasActiveBooking,
          bookingId: bookingStatus.currentBooking?._id,
          bookingAction: requestedAction,
        });
        return NextResponse.json(managementResponse, { headers: corsHeaders });
      }
    }
  }

  // Optionally, you could extract adminId from a cookie/JWT if you want admin-specific context

  // Proactive page-aware message
  if ((proactive || followup) && pageUrl) {
    console.log(
      `[DEBUG] Proactive request - pageUrl: ${pageUrl}, adminId: ${adminId}, proactive: ${proactive}, followup: ${followup}`
    );

    let pageChunks: string[] = [];
    if (adminId) {
      console.log(
        `[DEBUG] AdminId found: ${adminId}, checking sitemap for pageUrl: ${pageUrl}`
      );
      // Check if pageUrl is in sitemap_urls and if it's crawled
      const sitemapUrls = db.collection("sitemap_urls");
      const sitemapEntry = await sitemapUrls.findOne({ adminId, url: pageUrl });
      // LOG: adminId, pageUrl, sitemapEntry
      console.log(
        "[Proactive] adminId:",
        adminId,
        "pageUrl:",
        pageUrl,
        "sitemapEntry:",
        sitemapEntry
      );

      if (!sitemapEntry) {
        console.log(
          `[DEBUG] No sitemap entry found for pageUrl: ${pageUrl} with adminId: ${adminId}`
        );
        console.log(
          `[DEBUG] This means the page is not in your sitemap. Add it via admin panel.`
        );
      } else if (!sitemapEntry.crawled) {
        console.log(
          `[DEBUG] Sitemap entry found but page not crawled yet. Will crawl now.`
        );
      } else {
        console.log(`[DEBUG] Page found and crawled. Getting chunks...`);
      }
      if (sitemapEntry && !sitemapEntry.crawled) {
        // Crawl the page on demand with redirect handling
        try {
          console.log(`[OnDemandCrawl] Starting to crawl: ${pageUrl}`);
          const text = await extractTextFromUrl(pageUrl);
          console.log(
            `[OnDemandCrawl] Extracted text for ${pageUrl}: ${
              text.length
            } chars, first 100: ${text.slice(0, 100)}`
          );

          // Store in crawled_pages
          await db.collection("crawled_pages").insertOne({
            adminId,
            url: pageUrl,
            text,
            filename: pageUrl,
            createdAt: new Date(),
          });
          // Mark as crawled in sitemap_urls
          await sitemapUrls.updateOne(
            { adminId, url: pageUrl },
            { $set: { crawled: true, crawledAt: new Date() } }
          );
          // Chunk and embed for ChromaDB
          const chunks = chunkText(text);
          if (chunks.length > 0) {
            const embedResp = await openai.embeddings.create({
              input: chunks,
              model: "text-embedding-3-small",
            });
            const embeddings = embedResp.data.map(
              (d: { embedding: number[] }) => d.embedding
            );
            const metadata = chunks.map((_, i) => ({
              filename: pageUrl,
              adminId,
              url: pageUrl,
              chunkIndex: i,
            }));
            await addChunks(chunks, embeddings, metadata);
            pageChunks = chunks;
            console.log(
              `[OnDemandCrawl] Successfully processed ${pageUrl}: ${chunks.length} chunks`
            );
          } else {
            console.log(
              `[OnDemandCrawl] No chunks created for ${pageUrl} - content may be too short or empty`
            );
          }
        } catch (err) {
          console.error(`[OnDemandCrawl] Failed for ${pageUrl}:`, err);
          // If crawl fails, fallback to no info
        }
      } else if (sitemapEntry && sitemapEntry.crawled) {
        pageChunks = await getChunksByPageUrl(adminId, pageUrl);
        // LOG: pageChunks result
        console.log("[Proactive] getChunksByPageUrl result:", pageChunks);
      }
    } else {
      // LOG: No adminId found for session
      console.log("[Proactive] No adminId found for sessionId:", sessionId);
      console.log(
        "[DEBUG] This means your API key is not properly mapped to an adminId"
      );
      console.log(
        "[DEBUG] Check that your API key exists in the users collection"
      );
    }
    let pageSummary = "(No specific information found for this page.)";
    if (pageChunks.length > 0) {
      if (proactive) {
        // Summarize the page content and ask a relevant question
        let summaryContext = pageChunks.slice(0, 10).join("\n---\n");
        const fullPageText = pageChunks.join(" ");
        const tokenCount = countTokens(fullPageText);
        console.log(`[Proactive] Page content token count: ${tokenCount}`);
        if (tokenCount > 20000) {
          // Split into 5k-token chunks and summarize each
          const chunkSize = 5000;
          const textChunks = await splitTextIntoTokenChunks(
            fullPageText,
            chunkSize
          );
          console.log(
            `[Proactive] Splitting into ${textChunks.length} chunks of ~${chunkSize} tokens each`
          );
          const summaries = [];
          for (let i = 0; i < textChunks.length; i++) {
            const chunk = textChunks[i];
            console.log(
              `[Proactive] Summarizing chunk ${i + 1}/${textChunks.length}`
            );
            const summaryResp = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `You are a proactive assistant. Your goal is to help users plan or organize their next steps. Create engaging, emoji-enhanced messages with proper formatting. MANDATORY: Use emojis strategically with double line breaks \\n\\n after them. Break content into digestible sections with proper spacing. Always use **bold** for important keywords and features.`,
                },
                { role: "user", content: chunk },
              ],
            });
            summaries.push(summaryResp.choices[0].message.content || "");
          }
          summaryContext = summaries.join("\n");
          console.log(
            `[Proactive] Combined summary length: ${summaryContext.length} chars`
          );
        }
        const detectedIntent = detectIntent({ pageUrl });
        const detectedVertical = detectVertical(pageUrl, summaryContext);
        const verticalInfo = getVerticalMessage(detectedVertical);

        console.log(
          `[DEBUG] Detected intent for pageUrl "${pageUrl}": "${detectedIntent}"`
        );
        console.log(`[DEBUG] Detected vertical: "${detectedVertical}"`);
        console.log(
          `[DEBUG] Conversation state: hasBeenGreeted=${hasBeenGreeted}, proactiveCount=${proactiveMessageCount}, visitedPages=${visitedPages.length}`
        );

        // Track vertical detection if it's not 'general'
        if (detectedVertical !== "general") {
          await trackSDREvent(
            "vertical_detected",
            sessionId,
            undefined,
            detectedVertical,
            pageUrl || undefined,
            adminId || undefined
          );
        }

        let summaryPrompt;

        if (!hasBeenGreeted) {
          // Check if user already has email (sales mode activation) or preserved SDR status
          const existingEmail = await chats.findOne(
            { sessionId, email: { $exists: true } },
            { sort: { createdAt: -1 } }
          );

          if (existingEmail && existingEmail.email) {
            // User has email - use SDR activation with vertical messaging
            const companyName = "Your Company"; // TODO: Make dynamic
            const productName = "our platform"; // TODO: Make dynamic

            // Enhanced SDR message based on page navigation patterns
            const isReturningVisitor = existingEmail.preservedStatus;
            const conversionButtons = getConversionButtons(
              detectedVertical,
              isReturningVisitor
            );

            const sdrMessage = {
              mainText: isReturningVisitor
                ? `Welcome back! Let's continue exploring how ${productName} can help. ${verticalInfo.message}`
                : `Hi! I'm ${companyName}'s friendly assistant. ${verticalInfo.message}`,
              buttons: conversionButtons,
            };

            // Store the SDR continuation message
            await chats.insertOne({
              sessionId,
              role: "assistant",
              content: sdrMessage.mainText,
              buttons: sdrMessage.buttons,
              botMode: "sales",
              userEmail: existingEmail.email,
              email: existingEmail.email,
              adminId: existingEmail.adminId,
              createdAt: new Date(),
              pageUrl,
              sdrContinuation: true,
            });

            return NextResponse.json(
              {
                answer: sdrMessage.mainText,
                buttons: sdrMessage.buttons,
                botMode: "sales",
                userEmail: existingEmail.email,
              },
              { headers: corsHeaders }
            );
          }

          // First time greeting - create intelligent, page-specific messages
          summaryPrompt = `CONTEXT ANALYSIS:
Page URL: ${pageUrl}
User Intent: ${detectedIntent}
Industry Detected: ${detectedVertical}
Page Content Preview: ${summaryContext.substring(0, 800)}...

TASK: Create an intelligent proactive message that demonstrates understanding of this specific page and asks a contextual question to understand the user's needs.

ANALYSIS REQUIRED:
1. What is this page actually about? (features, pricing, use cases, etc.)
2. What would someone visiting this page likely be trying to accomplish?
3. What questions would help understand their specific needs or situation?
4. What are the most relevant next actions available on this page?

Generate response in JSON format:
{
  "mainText": "<Context-aware message (under 30 words) that shows you understand what they're viewing and asks a specific question about their needs/situation>",
  "buttons": ["<3-4 short options (2-4 words) based on actual page content. They should read like tappable choices>"]
}

EXAMPLE APPROACH:
Instead of: "Hi! How can I help?"
Create: "I see you're exploring [specific feature/page]. Are you looking to solve [specific problem] or are you in the [situation] phase?"

MAINTEXT REQUIREMENTS:
- Reference the actual page content or purpose
- Ask a specific question that helps understand their situation, needs, or goals
- Be conversational and natural (like a knowledgeable consultant would ask)
- Under 30 words total
- End with a question that reveals their intent/needs
- Show understanding of what they're viewing

CREATIVE VARIETY ENFORCEMENT - AVOID THESE BANNED PATTERNS:
- "Tired of..." (BANNED - overused)
- "Struggling with..." (BANNED - overused)
- "Managing..." (BANNED - becoming repetitive)
- "Ready to..." (BANNED - if used recently)
- "Looking to..." (BANNED - if used recently)
- "Need help with..." (BANNED - generic)
- "Noticed you're..." (BANNED - becoming repetitive)
- "Exhausted from..." (BANNED - similar to tired)
- "Sick of..." (BANNED - similar to tired)

PREFERRED CREATIVE OPENINGS:
- Question-based: "Growing fast?", "Exploring options?", "Time for an upgrade?"
- Benefit-focused: "Save 15 hours weekly...", "Double your efficiency..."
- Industry-specific: "For [industry]...", "Most [role] find...", "Popular with..."
- Problem-solving: "No more...", "Skip the...", "Avoid...", "Eliminate..."
- Achievement: "Join [others] who...", "Like [similar companies]..."
- Direct benefit: "Automate your...", "Transform your...", "Optimize your..."
- Social proof: "Over 1000 companies...", "Top brands rely on..."

BUTTONS REQUIREMENTS:
- Based on actual functionality/content available on this page
- Help them accomplish what they likely came to do
- Be specific and actionable (not generic categories)
- Match what a user would naturally want to do next on this specific page

${
  detectedVertical !== "general"
    ? `Industry Context: This appears to be a ${detectedVertical} business, so tailor the question and options accordingly.`
    : ""
}`;
        } else {
          // Follow-up proactive message - deeper context analysis
          const isRevisit = visitedPages.some((page: string) =>
            pageUrl.includes(page)
          );

          summaryPrompt = `FOLLOW-UP CONTEXT ANALYSIS:
Current Page: ${pageUrl}
User Journey: Message #${proactiveMessageCount + 1}, visited ${
            visitedPages.length
          } pages
Page Content: ${summaryContext.substring(0, 600)}...
Revisiting Similar Page: ${isRevisit}

TASK: Create an intelligent follow-up that builds on their browsing behavior and asks a deeper question about their specific needs or decision process.

BEHAVIORAL ANALYSIS:
1. They've been exploring for a while - what might they be comparing or deciding between?
2. Based on this specific page content, what stage of evaluation/decision are they in?
3. What specific concern or question would help them move forward?
4. What obstacles or uncertainties might they have at this point?

Generate response in JSON format:
{
  "mainText": "<Context-aware follow-up (under 30 words) that acknowledges their exploration and asks about specific needs/concerns>",
  "buttons": ["<3 short options (2-4 words) relevant to their current evaluation stage. End mainText by asking the user to tap one>"]
}

FOLLOW-UP APPROACH:
Instead of: "Need help with anything?"
Create: "I see you're comparing [feature/option]. What's most important for your [specific situation]?" or "Since you're exploring [specific area], are you trying to [specific goal] or [alternative goal]?"

MAINTEXT REQUIREMENTS:
- Acknowledge they've been exploring (no repetitive greetings)
- Reference the specific page/content they're viewing
- Ask about their decision criteria, priorities, or specific concerns

CREATIVE VARIETY ENFORCEMENT - AVOID THESE BANNED PATTERNS:
- "Tired of..." (BANNED - overused)
- "Struggling with..." (BANNED - overused)
- "Managing..." (BANNED - becoming repetitive)
- "Ready to..." (BANNED - if used recently)
- "Looking to..." (BANNED - if used recently)
- "Need help with..." (BANNED - generic)
- "Noticed you're..." (BANNED - becoming repetitive)
- "Exhausted from..." (BANNED - similar to tired)
- "Sick of..." (BANNED - similar to tired)

PREFERRED CREATIVE OPENINGS FOR FOLLOW-UPS:
- Progress-based: "I see you're comparing...", "Since you're exploring..."
- Decision-focused: "What's most important for your...", "Which matters more..."
- Situation-aware: "For your [type] business...", "At your growth stage..."
- Solution-oriented: "Most companies like yours...", "The top choice for..."
- Stage-specific: "Ready to decide?", "Still evaluating?", "Need specifics on..."
- Under 25 words total
- Show progression in the conversation (building on their journey)
- Ask questions that reveal decision factors or obstacles

BUTTONS REQUIREMENTS:
- Match their current evaluation stage (comparing, learning details, etc.)
- Provide specific resources or actions that help with decision-making
- Based on actual page content and functionality
- Help them get answers to likely concerns at this stage`;
        }
        const summaryResp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an intelligent sales consultant that creates personalized, context-aware messages. Your expertise is understanding what users are viewing and asking the right questions to uncover their specific needs and decision criteria.

CORE INTELLIGENCE:
1. CONTENT ANALYSIS: Deeply understand what's on the page (features, benefits, use cases, pricing, etc.)
2. USER PSYCHOLOGY: Consider what someone viewing this content is trying to accomplish
3. NEEDS DISCOVERY: Ask questions that reveal their situation, priorities, and decision factors
4. CONTEXTUAL RELEVANCE: Reference specific elements they can actually see and interact with

CONVERSATION PRINCIPLES:
- Act like a knowledgeable consultant who's reviewed their current page
- Ask questions that sales professionals would ask to understand needs
- Show you understand their current context and exploration process
- Help them identify what matters most for their specific situation
- Guide toward meaningful next steps based on their actual needs

QUESTION STRATEGY:
- Ask about their current situation or challenges
- Understand their decision criteria or priorities
- Identify their timeline or urgency
- Uncover what's most important to them
- Help them compare or evaluate options

RESPONSE FORMAT:
- Always return valid JSON with "mainText" and "buttons"
- Keep responses conversational and consultative
- Reference actual page content when relevant
- Ask questions that lead to meaningful lead qualification
- Provide buttons that help them get specific answers or take relevant actions
- NEVER use personal names (no "Hi John", "Hello Sarah", etc.)
- Use situational language instead ("Running a startup?", "Managing a team?")

LEAD QUALIFICATION FOCUS:
- Company size or role (when relevant to the page content)
- Specific use cases or challenges they're trying to solve
- Decision timeline and process
- Budget considerations (when contextually appropriate)
- Technical requirements or preferences
- Current solutions or alternatives they're considering

MESSAGING APPROACH:
- Use business/situational context, not personal identity
- Address their likely role or company stage
- Reference their business challenges, not personal details
- Focus on what they're trying to accomplish professionally

CORE PRINCIPLES:
1. Analyze the actual page content to understand what's available
2. Create messages that feel natural and conversational
3. Avoid repetitive patterns or formulaic responses
4. Be specific to the actual content, not generic page types
5. Generate buttons based on real functionality or information available
6. Keep responses short but meaningful
7. Sound like a helpful human, not a script

RESPONSE FORMAT:
- Always return valid JSON with "mainText" and "buttons" fields
- Keep mainText under 30 words for greetings, 30 words for follow-ups
- Generate 3-4 buttons that are 2-3 words each
- Base everything on the actual page content provided
- Be genuinely helpful based on what the user can actually do

AVOID:
- Hardcoded examples or patterns
- Generic "Learn More" type buttons unless specific
- Repetitive greeting styles
- Formulaic responses
- Long feature lists or bullet points
- Overly enthusiastic or salesy tone

Focus on being genuinely useful based on what the user is actually viewing.`,
            },
            { role: "user", content: summaryPrompt },
          ],
        });
        pageSummary = summaryResp.choices[0].message.content || "";

        // Parse the JSON response from the AI
        let proactiveResponse;
        try {
          proactiveResponse = JSON.parse(pageSummary);
        } catch (error) {
          // Dynamic fallback based on page content
          console.log(
            "[Proactive] Failed to parse JSON, creating dynamic fallback"
          );

          // Extract key info from page context for fallback
          const contextKeywords = summaryContext.toLowerCase();
          let fallbackMessage =
            "How can I help you with what you're looking for?";
          let fallbackButtons = ["Get Help", "Ask Questions", "Learn More"];

          // Create contextual fallback based on actual content
          if (
            contextKeywords.includes("pricing") ||
            contextKeywords.includes("plan")
          ) {
            fallbackMessage = "Questions about our options?";
            fallbackButtons = ["See Plans", "Get Quote", "Ask Questions"];
          } else if (
            contextKeywords.includes("demo") ||
            contextKeywords.includes("trial")
          ) {
            fallbackMessage = "Ready to try it out?";
            fallbackButtons = ["Start Demo", "Book Call", "Learn More"];
          } else if (
            contextKeywords.includes("contact") ||
            contextKeywords.includes("support")
          ) {
            fallbackMessage = "Need assistance?";
            fallbackButtons = ["Get Help", "Contact Us", "Ask Questions"];
          }

          proactiveResponse = {
            mainText: fallbackMessage,
            buttons: fallbackButtons,
          };
        }

        const proactiveMsg = proactiveResponse.mainText;
        const buttons = proactiveResponse.buttons || [];

        // Determine bot mode for proactive message
        let userEmail: string | null = null;
        const lastEmailMsg = await chats.findOne(
          { sessionId, email: { $exists: true } },
          { sort: { createdAt: -1 } }
        );
        if (lastEmailMsg && lastEmailMsg.email) userEmail = lastEmailMsg.email;
        const botMode = userEmail ? "sales" : "lead_generation";

        // Check for booking detection in proactive message
        let enhancedProactiveData: any = {
          answer: proactiveMsg,
          buttons: buttons,
          botMode,
          userEmail: userEmail || null,
          showBookingCalendar: false,
          bookingType: null,
        };

        try {
          const bookingEnhancement = await enhanceChatWithBookingDetection(
            proactiveMsg || "",
            [], // conversation history - could be enhanced later
            `Page URL: ${pageUrl || "unknown"}`
          );

          if (bookingEnhancement.chatResponse.showBookingCalendar) {
            console.log(
              "[Chat API] Booking detected in proactive message - enhancing response with calendar"
            );
            enhancedProactiveData = {
              ...enhancedProactiveData,
              showBookingCalendar: true,
              bookingType:
                bookingEnhancement.chatResponse.bookingType || "demo",
              // Override answer with booking-specific response
              answer: bookingEnhancement.chatResponse.reply || proactiveMsg,
            };
          }
        } catch (error) {
          console.warn(
            "[Chat API] Booking detection failed for proactive message:",
            error
          );
          // Continue with original response if booking detection fails
        }

        console.log("[Chat API] Proactive response:", {
          botMode,
          userEmail: userEmail || null,
          hasProactiveMsg: !!proactiveMsg,
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json(enhancedProactiveData, {
          headers: corsHeaders,
        });
      } else if (followup) {
        // For follow-up, use the same JSON-output system prompt as main chat
        const previousChats = await chats
          .find({ sessionId })
          .sort({ createdAt: 1 })
          .toArray();
        const previousQnA = previousChats
          .filter(
            (msg) =>
              (msg as unknown as ChatMessage).role === "assistant" ||
              (msg as unknown as ChatMessage).role === "user"
          )
          .map((msg) => {
            const m = msg as unknown as ChatMessage;
            return `${m.role === "user" ? "User" : "Bot"}: ${m.content}`;
          })
          .join("\n");
        const prevQuestions = previousChats
          .filter((msg) => (msg as unknown as ChatMessage).role === "assistant")
          .map((msg) => (msg as unknown as ChatMessage).content);
        const lastFewQuestions = prevQuestions.slice(-3);

        // Helper functions needed for followup processing
        function getText(val: MainTextLike): string {
          if (typeof val === "string") return val;
          if (val && typeof val === "object" && "mainText" in val)
            return val.mainText || "";
          return "";
        }

        function isTooSimilar(
          newQ: MainTextLike,
          prevQs: MainTextLike[]
        ): boolean {
          const newText = getText(newQ);
          if (!newText || newText.length < 10) return true; // Skip very short responses

          // Check for banned patterns FIRST
          const bannedPatterns = [
            "tired of",
            "struggling with",
            "managing",
            "exhausted from",
            "sick of",
            "need help with",
            "noticed you're",
            "ready to",
          ];

          const lowerText = newText.toLowerCase();
          const hasBannedPattern = bannedPatterns.some(
            (pattern) =>
              lowerText.startsWith(pattern) || lowerText.includes(pattern)
          );

          if (hasBannedPattern) {
            console.log(
              `[VARIETY] Rejected message for banned pattern: "${newText}"`
            );
            return true; // Reject this message as too similar
          }

          const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
          const normalizedNew = norm(newText);

          return prevQs.some((q: MainTextLike) => {
            const prevText = getText(q);
            if (!prevText) return false;
            const normalizedPrev = norm(prevText);

            // Only consider it similar if there's significant overlap (>70% of the shorter text)
            const overlapThreshold = 0.7;
            const minLength = Math.min(
              normalizedNew.length,
              normalizedPrev.length
            );

            if (
              normalizedNew.includes(normalizedPrev) &&
              normalizedPrev.length > minLength * overlapThreshold
            ) {
              return true;
            }
            if (
              normalizedPrev.includes(normalizedNew) &&
              normalizedNew.length > minLength * overlapThreshold
            ) {
              return true;
            }

            return false;
          });
        }

        // Detect intent from last user message or pageUrl
        const detectedIntent = detectIntent({ question, pageUrl });
        // Use followupCount from request body to determine follow-up stage
        const followupCount =
          typeof body.followupCount === "number" ? body.followupCount : 0;
        const followupTopic = body.followupTopic || "general";

        console.log(
          "[FOLLOWUP] Generating followup message for topic:",
          followupTopic
        );

        // Check if user already has email (sales mode)
        const lastEmailMsg = await chats.findOne(
          { sessionId, email: { $exists: true } },
          { sort: { createdAt: -1 } }
        );
        const userHasEmail = lastEmailMsg && lastEmailMsg.email;

        // Try persona-based followup first
        console.log(
          `[Persona] Attempting persona detection for followup ${followupCount}`
        );
        const detectedPersona = await detectUserPersona(
          sessionId,
          previousChats,
          pageUrl,
          adminId || ""
        );

        // Build summary-first page context for prompts
        let pageContextForPrompt = pageChunks.slice(0, 10).join("\n---\n");
        if (adminId && pageUrl) {
          try {
            const db = await getDb();
            const pageDoc = await db
              .collection("crawled_pages")
              .findOne({ adminId, url: pageUrl });
            const ss: any = pageDoc?.structuredSummary;
            if (ss && typeof ss === "object") {
              const parts: string[] = [];
              if (ss.pageType) parts.push(`Page Type: ${ss.pageType}`);
              if (
                Array.isArray(ss.primaryFeatures) &&
                ss.primaryFeatures.length
              )
                parts.push(`Features: ${ss.primaryFeatures.join(", ")}`);
              if (
                Array.isArray(ss.painPointsAddressed) &&
                ss.painPointsAddressed.length
              )
                parts.push(`Pain Points: ${ss.painPointsAddressed.join(", ")}`);
              if (Array.isArray(ss.solutions) && ss.solutions.length)
                parts.push(`Solutions: ${ss.solutions.join(", ")}`);
              if (Array.isArray(ss.useCases) && ss.useCases.length)
                parts.push(`Use Cases: ${ss.useCases.join(", ")}`);
              if (
                Array.isArray(ss.businessOutcomes) &&
                ss.businessOutcomes.length
              )
                parts.push(`Outcomes: ${ss.businessOutcomes.join(", ")}`);
              if (Array.isArray(ss.pricePoints) && ss.pricePoints.length)
                parts.push(`Price Points: ${ss.pricePoints.join(", ")}`);
              if (Array.isArray(ss.integrations) && ss.integrations.length)
                parts.push(`Integrations: ${ss.integrations.join(", ")}`);
              if (Array.isArray(ss.callsToAction) && ss.callsToAction.length)
                parts.push(`CTAs: ${ss.callsToAction.join(", ")}`);
              const summaryCtx = parts.join("\n").trim();
              if (summaryCtx) pageContextForPrompt = summaryCtx;
            }
          } catch (e) {
            console.log(
              "[Followup] Summary-first context build failed, using chunks",
              e
            );
          }
        }

        let personaFollowup = null;

        // Generate topic-based followup message
        if (followupTopic !== "general") {
          console.log(
            `[FOLLOWUP] Generating topic-based followup for: ${followupTopic}`
          );
          personaFollowup = await generateTopicBasedFollowup(
            followupTopic,
            pageContextForPrompt,
            pageUrl,
            previousQnA,
            followupCount
          );
        } else if (detectedPersona && pageChunks.length > 0) {
          console.log(
            `[Persona] Generating persona-based followup for: ${detectedPersona.name}`
          );
          personaFollowup = await generatePersonaBasedFollowup(
            detectedPersona,
            pageContextForPrompt,
            pageUrl,
            previousQnA,
            followupCount
          );
        }

        let followupSystemPrompt = "";
        let followupUserPrompt = "";

        // Use persona-based followup if available, otherwise fall back to generic
        if (personaFollowup && personaFollowup.mainText) {
          console.log(
            `[Persona] Using persona-based followup for ${detectedPersona.name}`
          );

          let userEmail: string | null = null;
          if (lastEmailMsg && lastEmailMsg.email)
            userEmail = lastEmailMsg.email;
          const botMode = userEmail ? "sales" : "lead_generation";

          // Respect lead progression - only ask for email on 3rd followup
          // Check for booking detection in persona followup
          let enhancedPersonaFollowup = personaFollowup;
          try {
            const bookingEnhancement = await enhanceChatWithBookingDetection(
              question || "",
              [], // conversation history - could be enhanced later
              `Page URL: ${pageUrl || "unknown"}`
            );

            if (bookingEnhancement.chatResponse.showBookingCalendar) {
              console.log(
                "[Chat API] Booking detected in persona followup - enhancing response with calendar"
              );
              enhancedPersonaFollowup = {
                ...personaFollowup,
                showBookingCalendar: true,
                bookingType:
                  bookingEnhancement.chatResponse.bookingType || "demo",
                // Override mainText with booking-specific response
                mainText:
                  bookingEnhancement.chatResponse.reply ||
                  personaFollowup.mainText,
              };
            }
          } catch (error) {
            console.warn(
              "[Chat API] Booking detection failed for persona followup:",
              error
            );
            // Continue with original response if booking detection fails
          }

          const shouldAskForEmail =
            followupCount >= 2 &&
            !userEmail &&
            enhancedPersonaFollowup.emailPrompt;

          const followupWithMode = {
            ...enhancedPersonaFollowup,
            emailPrompt: shouldAskForEmail
              ? enhancedPersonaFollowup.emailPrompt
              : "",
            botMode,
            userEmail: userEmail || null,
          };

          return NextResponse.json(followupWithMode, { headers: corsHeaders });
        }

        // Fall back to generic followup logic
        console.log(
          `[Persona] No persona detected or persona followup failed, using generic followup`
        );

        if (followupCount === 0) {
          // First follow-up: Check if there's a user message to base it on

          // Get the last user message from conversation history
          const lastUserMessage = previousChats
            .filter((msg) => (msg as unknown as ChatMessage).role === "user")
            .slice(-1)[0]; // Get the most recent user message

          const lastUserContent = lastUserMessage
            ? typeof lastUserMessage.content === "string"
              ? lastUserMessage.content
              : lastUserMessage.content.mainText || ""
            : "";

          if (lastUserContent && lastUserContent.trim() !== "") {
            // User has sent a message - base followup ONLY on their last message
            console.log(
              `[Followup] First followup based on last user message: "${lastUserContent}"`
            );

            followupSystemPrompt = `
You are a helpful sales assistant. The user has not provided an email yet.

FOLLOWUP #1 GOAL: Generate a followup based ONLY on the user's last message, not the page content. Create a response that directly relates to what they just said.

LAST USER MESSAGE: "${lastUserContent}"

CONTENT RULES:
- Focus ONLY on the user's last message content - ignore page context completely
- Ask a follow-up question or provide information directly related to what they just asked
- Keep "mainText" under 30 words; be specific to their message
- Generate EXACTLY 3 concise, actionable buttons (2-4 words) related to their last message
- Do NOT reference page content, features visible on page, or general website information
- Base your response entirely on understanding and expanding on their specific question/comment

**EXAMPLES OF MESSAGE-BASED FOLLOWUPS:**

If user said: "How much does this cost?"
✅ GOOD: "What's your budget range?" with buttons like "Under $100", "$100-500", "Over $500"

If user said: "I need help with scheduling"
✅ GOOD: "What type of scheduling?" with buttons like "Appointments", "Team Meetings", "Events"

If user said: "Can this integrate with Salesforce?"
✅ GOOD: "Which Salesforce features?" with buttons like "Contacts", "Leads", "Opportunities"

If user said: "I'm looking for a solution"
✅ GOOD: "What's your main challenge?" with buttons like "Time Management", "Team Coordination", "Customer Service"

**LAST MESSAGE ANALYSIS:**
1. **What did they specifically ask about?** (pricing, features, integrations, etc.)
2. **What follow-up question would help clarify their need?**
3. **What are 3 logical next questions related to their specific inquiry?**
4. **How can you help them get more specific about what they need?**

CREATIVE OPENING PATTERNS - Use variety, avoid repetition:
- Clarification: "What type of...", "Which specific...", "What's your main..."
- Expansion: "Tell me more about...", "Help me understand...", "What's most important..."
- Options: "Are you looking for...", "Do you need...", "Would you prefer..."
- Context: "For your situation...", "In your case...", "Based on that..."

VARIETY GUIDELINES:
- Directly address what they just said
- Ask for clarification or more details about their specific inquiry
- Don't make assumptions about their business or industry
- Focus on understanding their immediate need better

Context:
Last User Message: ${lastUserContent}
Previous Conversation (for context only, don't base response on this):
${previousQnA}

Generate response in JSON format:
{
  "mainText": "<Direct follow-up question or response to their last message (under 30 words)>",
  "buttons": ["<3 options directly related to their last message, 2-4 words each>"],
  "emailPrompt": ""
}

CRITICAL: Base your response ONLY on their last message "${lastUserContent}", not on page content or general context.`;

            followupUserPrompt = `Create a followup response based ONLY on the user's last message: "${lastUserContent}"

Do NOT use page content. Focus entirely on understanding and expanding on what they just said. Ask a clarifying question or provide options directly related to their specific inquiry.

Generate exactly 3 buttons (2-4 words each) that help them be more specific about what they asked. JSON format only.`;
          } else {
            // No user message yet - use existing page-context driven logic
            console.log(
              `[Followup] No user message found, using page-context driven first followup`
            );

            followupSystemPrompt = `
You are a helpful sales assistant. The user has not provided an email yet.

FOLLOWUP #1 GOAL: Inform about one important item (feature, solution, offer, or outcome) clearly visible on this page and invite a quick response.

CONTENT RULES:
- Pick ONE focus (feature, solution, pricing point, use case, integration, or outcome) that matters most on this page.
- Keep "mainText" under 30 words; be specific and non-generic.
- Generate EXACTLY 3 concise, actionable buttons (2-4 words) using terms from this page.
- Avoid repeating the last message's opening style or wording.
- CRITICAL: Do NOT assume or reference specific industries or business types unless the customer has explicitly mentioned their business.

**EXAMPLES OF PAGE-CONTEXTUAL FOLLOWUPS:**

If page mentions "scheduling features", "appointment booking", "calendar management":
✅ GOOD: "Ready to automate appointment booking?" with buttons like "Schedule Demo", "View Features", "Get Pricing"

If page mentions "customer management", "client tracking", "communication tools":
✅ GOOD: "Want better client tracking?" with buttons like "Client Features", "Management Tools", "Contact Sales"

If page mentions "billing features", "payment processing", "invoice management":
✅ GOOD: "Streamline payment processing?" with buttons like "Billing Features", "Payment Options", "Demo Request"

If page mentions "appointment features", "patient records", "telehealth":
✅ GOOD: "Reduce appointment no-shows?" with buttons like "Reminder Features", "Telehealth Setup", "Record Management"

**CUSTOMER PROFILING THROUGH CONTENT-BASED BUTTONS:**
Create buttons that help identify customer needs based on page content:
- **Feature Interest**: Extract 2-3 main features mentioned on page
- **Use Case Matching**: Identify specific use cases from page content
- **Business Context**: Use general business terminology from page, avoid industry-specific assumptions

**MANDATORY CONTENT EXTRACTION:**
1. **Scan page content** for specific features, tools, services mentioned
2. **Identify business context** from page content without assuming specific industries
3. **Extract pain points** specifically mentioned on the page
4. **Use actual terminology** found on the page, not generic terms
5. **Reference real solutions** described on the page

**PAGE CONTENT PROFILING STRATEGY:**
- **Button 1**: Feature/solution directly mentioned on page
- **Button 2**: Related pain point addressed by page content  
- **Button 3**: Business outcome/result mentioned on page
- **Message**: Combines page-specific terminology with customer profiling question

CREATIVE OPENING PATTERNS - Use variety, avoid repetition:
- Curiosity: "Ready to...", "Want to...", "Curious how...", "Ever wondered..."
- Benefit-focused: "Save time with...", "Boost results using...", "Double your efficiency with..."
- Question-based: "Exploring options?", "Time for an upgrade?", "Growing fast?", "Need a solution?"
- Solution-oriented: "Here's how...", "Perfect for...", "Great when...", "Ideal solution when..."
- Value proposition: "Get [benefit] in minutes", "Most users find...", "Popular choice for..."
- Achievement: "Join others who...", "Popular choice for...", "Proven to help..."
- Direct action: "Skip the hassle with...", "Automate your...", "Streamline your..."
- Numbers/proof: "Over 1000 users...", "Save 15 hours weekly...", "Cut costs by 40%..."

VARIETY GUIDELINES (no hard blacklist):
- Prefer informative openings that highlight a concrete feature, benefit, or update from the current page.
- Vary openings and sentence structures; avoid repeating the same pattern as the last message.
- Keep tone helpful and business-focused; avoid negative or accusatory phrasing.

AVOID: Starting with "Tired of...", "Struggling with..." or repetitive patterns

Context:

‼️ CRITICAL INSTRUCTION: You MUST analyze and use the following page content to create industry-specific, relevant responses. DO NOT create generic "scheduling" or "management" responses. Extract actual terms, features, and pain points from the content below:

Page Context (summary-first if available):
${pageContextForPrompt}
General Context:
${pageChunks.join(" ")}
Detected Intent:
${detectedIntent}
Previous Conversation:
${previousQnA}
- Only use the above JSON format.
- Do not answer in any other way.
- Respond with ONLY valid JSON - no additional text before or after
- NEVER include JSON objects or button arrays within the mainText field
- Your mainText must be maximum 30 words. Be creative, engaging, and specific to page context. Do NOT repeat previous questions: ${lastFewQuestions
              .map((q) => `"${getText(q)}"`)
              .join(", ")}. Do NOT include a summary or multiple questions.
- Generate exactly 3 buttons, each 3-4 words maximum. Base them on actual page content and user needs.
- Vary the nudge text for each follow-up.`;

            followupUserPrompt = `CRITICAL: You MUST create a response based on the ACTUAL page content provided above. Do NOT use generic terms like "scheduling chaos" or "auto scheduling". 

Create ONE nudge (max 30 words) that is specific to the page content and industry. Extract real features, benefits, or services from the page content provided. Do NOT repeat questions: ${lastFewQuestions
              .map((q) => `"${getText(q)}"`)
              .join(", ")}. 

Generate exactly 3 buttons (3-4 words each) using ACTUAL terms from the page content. JSON format only.`;
          }
        } else if (followupCount === 1) {
          // Second follow-up: micro-conversion nudge with enforced button differentiation

          // Get previous button concepts and main text topics from chat history
          const previousButtons = previousChats
            .filter((chat: any) => chat.buttons && Array.isArray(chat.buttons))
            .flatMap((chat: any) => chat.buttons);

          const previousMainTexts = previousChats
            .filter((chat: any) => chat.mainText)
            .map((chat: any) => chat.mainText);

          followupSystemPrompt = `
You are a helpful sales assistant. The user has not provided an email yet.

CRITICAL: This is FOLLOWUP #2 (followupCount=1). You MUST explore a COMPLETELY DIFFERENT business aspect from Followup #1.

PREVIOUS TOPICS/BUTTONS USED (ABSOLUTELY FORBIDDEN TO REPEAT):
Previous Buttons: ${
            previousButtons.length > 0
              ? previousButtons.map((btn: string) => `"${btn}"`).join(", ")
              : "None"
          }
Previous Messages: ${
            previousMainTexts.length > 0
              ? previousMainTexts
                  .slice(-2)
                  .map((text: string) => `"${text}"`)
                  .join(", ")
              : "None"
          }

FOLLOWUP #2 TOPIC DIVERSIFICATION - MUST CHOOSE DIFFERENT ANGLE:

**If Followup #1 was GROWTH/SCALE → Focus on CLIENT EXPERIENCE:**
- Message Focus: Client satisfaction, service quality, retention
- Examples: "Keeping clients happy?", "Improve client experience?", "Reduce client complaints?"
- Buttons: "Client Satisfaction", "Service Quality", "Retention Rate"

**If Followup #1 was EFFICIENCY → Focus on REVENUE:**
- Message Focus: Increasing income, pricing optimization, profit margins
- Examples: "Boost your revenue?", "Optimize pricing strategy?", "Increase profit margins?"
- Buttons: "Revenue Growth", "Pricing Strategy", "Profit Analysis"

**If Followup #1 was REVENUE → Focus on TECHNOLOGY:**
- Message Focus: Modern tools, digital solutions, competitive advantage
- Examples: "Modernize your tech stack?", "Stay competitive digitally?", "Upgrade your systems?"
- Buttons: "Tech Upgrade", "Digital Solutions", "Modern Tools"

**If Followup #1 was CLIENT EXPERIENCE → Focus on TEAM/STAFF:**
- Message Focus: Staff management, team productivity, employee satisfaction
- Examples: "Managing your team better?", "Improve staff productivity?", "Coordinate your team?"
- Buttons: "Staff Management", "Team Productivity", "Employee Tools"

**If Followup #1 was TECHNOLOGY → Focus on OPERATIONAL EFFICIENCY:**
- Message Focus: Workflow optimization, time management, process improvement
- Examples: "Streamline your processes?", "Save time on admin?", "Optimize your workflow?"
- Buttons: "Process Optimization", "Time Management", "Workflow Tools"

**If Followup #1 was STAFF/TEAM → Focus on BUSINESS GROWTH:**
- Message Focus: Expansion, market reach, scaling operations
**CRITICAL: FOLLOWUP #2 CONTENT EXTRACTION REQUIREMENTS**

**MANDATORY PAGE CONTENT ANALYSIS FOR DIFFERENT ANGLE:**
1. **Different Feature Set**: Find OTHER features/services mentioned on page (not used in Followup #1)
2. **Different Pain Points**: Identify ADDITIONAL customer problems this page addresses  
3. **Different Solutions**: Extract OTHER solutions/benefits presented on page
4. **Different Business Aspect**: Choose completely different business dimension from page content

**FOLLOWUP #2 CONTENT STRATEGY:**
- **Scan Remaining Page Content**: Look for features/benefits NOT used in Followup #1
- **Extract Different Terminology**: Use different industry-specific terms from page
- **Find Alternative Solutions**: Identify other solutions/services mentioned on page  
- **Target Different Customer Needs**: Address different customer segments mentioned on page

**BUSINESS DIMENSION ROTATION FROM PAGE CONTENT:**
If Followup #1 used growth-related content → Extract efficiency/automation content from page
If Followup #1 used revenue-related content → Extract customer experience content from page  
If Followup #1 used technology content → Extract business process content from page
If Followup #1 used features content → Extract outcomes/results content from page

**PAGE-BASED CUSTOMER PROFILING EXAMPLES:**

If page mentions "appointment scheduling + customer reviews + payment processing":
- Followup #1: "Ready to automate appointments?" (Scheduling focus)
- Followup #2: "Want to boost customer reviews?" (Customer experience focus)

If page mentions "inventory management + sales analytics + supplier integration":
- Followup #1: "Struggling with inventory control?" (Operations focus)  
- Followup #2: "Need better sales insights?" (Analytics focus)

If page mentions "team collaboration + project tracking + client communication":
- Followup #1: "Streamline team workflows?" (Internal efficiency focus)
- Followup #2: "Improve client communication?" (External relationship focus)

**CUSTOMER INTELLIGENCE GATHERING:**
- **Button 1**: Different feature interest from page content
- **Button 2**: Different business priority from page content  
- **Button 3**: Different outcome/goal from page content

**MANDATORY CONTENT EXTRACTION PROCESS:**
1. **Review Page Content**: Identify ALL features, benefits, solutions mentioned
2. **Exclude Followup #1 Terms**: Don't reuse any concepts from previous followup
3. **Select Different Angle**: Choose completely different business aspect from page
4. **Use Page Terminology**: Extract actual words/phrases from page content
5. **Customer Profiling Focus**: Create buttons that reveal different business needs

You will receive page and general context, the detected intent, and the previous conversation. Always generate your response in the following JSON format:
{
  "mainText": "<A micro-conversion nudge—small, low-friction ask. STRICT LIMITS: Maximum 30 words total. Use casual, friendly tone. Be specific to their context and what they're actually viewing.>",
  "buttons": ["<Generate exactly 3 options, each 2-4 words. They are tappable choices, specific to the page content.>"],
  "emailPrompt": ""
}

**PAGE CONTENT DEEP DIVE:**
- Look for specific problems: "no-shows", "conflicts", "coordination", "tracking"
- Find advanced features: "analytics", "reporting", "automation", "insights"
- Identify business goals: "revenue", "efficiency", "growth", "scale"

**DIFFERENTIATION FROM FOLLOWUP #1:**
- Followup #1: Basic discovery (general pain + basic solution + basic need)
- Followup #2: Deeper analysis (specific pain + advanced solution + business impact)
- NEVER use similar button concepts between followups

CREATIVE MICRO-CONVERSION PATTERNS - Use variety:
- Benefit-focused: "Save [time/money] with...", "Get [result] in minutes", "Boost efficiency by..."
- Social proof: "Join [number] who...", "Popular with [audience]", "Most [users] choose..."
- Curiosity: "See how...", "Discover why...", "Find out what...", "Learn why..."
- Value: "Free [benefit]", "Quick [solution]", "No-cost [feature]", "Instant [result]"
- Progress: "Next step:", "Here's how:", "Ready to...", "Time to..."
- Comparison: "Better than [alternative]", "Upgrade from...", "Unlike [competitor]..."
- Urgency: "Don't miss...", "Limited time...", "Quick opportunity...", "Fast track..."
- Achievement: "Unlock [benefit]...", "Access [feature]...", "Enable [capability]..."

VARIETY GUIDELINES (no hard blacklist):
- Prefer informative openings that highlight a concrete feature, benefit, or update from the current page.
- Vary openings and sentence structures; avoid repeating the same pattern as the last message.
- Keep tone helpful and business-focused; avoid negative or accusatory phrasing.

AVOID: "Tired of...", "Struggling with..." or repetitive openings from previous messages

Context:

‼️ CRITICAL INSTRUCTION: You MUST analyze and use the following page content to create industry-specific, relevant responses. DO NOT create generic "scheduling" or "management" responses. Extract actual terms, features, and pain points from the content below that are DIFFERENT from Followup #1:

Page Context (summary-first if available):
${pageContextForPrompt}
General Context:
${pageChunks.join(" ")}
Detected Intent:
${detectedIntent}
Previous Conversation:
${previousQnA}
- Only use the above JSON format.
- Do not answer in any other way.
- Respond with ONLY valid JSON - no additional text before or after
- NEVER include JSON objects or button arrays within the mainText field
- Your mainText must be a micro-conversion nudge, referencing the user's last action, detected intent, page context, or actual page content. Do NOT ask for a discovery call or email directly. Vary the nudge text for each follow-up.`;
          followupUserPrompt = `CRITICAL: You MUST create a response based on the ACTUAL page content provided above that is DIFFERENT from Followup #1. Do NOT use generic terms like "scheduling chaos" or "auto scheduling" or any similar concepts to previous followups.

Ask a micro-conversion nudge—a small, low-friction ask that's specific to the page content and represents a DIFFERENT business aspect than Followup #1. Extract real features, benefits, or services from the page content. Do NOT ask for a discovery call or email directly. 

Generate exactly 3 buttons using ACTUAL terms from the page content that are COMPLETELY DIFFERENT from previous buttons. JSON format only.`;
        } else if (followupCount === 2) {
          // Third follow-up: Value-focused with complete topic diversification

          // Get ALL previous topics to ensure maximum diversification
          const previousButtons = previousChats
            .filter((chat: any) => chat.buttons && Array.isArray(chat.buttons))
            .flatMap((chat: any) => chat.buttons);

          const previousMainTexts = previousChats
            .filter((chat: any) => chat.mainText)
            .map((chat: any) => chat.mainText);

          // Check if user already has email
          if (userHasEmail) {
            // User is in sales mode - aggressive SDR-style conversion focus
            followupSystemPrompt = `
You are a confident sales assistant. The user has already provided their email and is a qualified lead in sales mode.

CRITICAL: This is FOLLOWUP #3 (followupCount=2). You MUST extract and use a THIRD COMPLETELY DIFFERENT aspect from the actual page content.

**FOLLOWUP #3 PAGE CONTENT EXTRACTION:**
1. **Find Remaining Features**: Identify additional features/services on page not used in previous followups
2. **Extract Different Benefits**: Find other outcomes/results mentioned on page
3. **Identify Additional Use Cases**: Look for other customer scenarios described on page
4. **Use Different Terminology**: Extract fresh industry-specific terms from page content

**MANDATORY: BASE ON ACTUAL PAGE CONTENT**
- **Scan Page for Unused Elements**: Find features, benefits, outcomes not mentioned before
- **Extract Real Terminology**: Use actual words/phrases from page content
- **Different Business Focus**: Address third distinct business need from page
- **Avoid Previous Content**: Don't reuse any concepts from earlier followups

PREVIOUS TOPICS/BUTTONS USED (ABSOLUTELY FORBIDDEN):
Previous Buttons: ${
              previousButtons.length > 0
                ? previousButtons.map((btn: string) => `"${btn}"`).join(", ")
                : "None"
            }
Previous Messages: ${
              previousMainTexts.length > 0
                ? previousMainTexts
                    .slice(-3)
                    .map((text: string) => `"${text}"`)
                    .join(", ")
                : "None"
            }

You will receive page and general context, the detected intent, and the previous conversation. Always generate your response in the following JSON format:
{
  "mainText": "<Direct, value-focused message. Reference specific ROI, time savings, or competitive advantage. Be consultative but assertive. Maximum 30 words. Use numbers/statistics when possible.>",
  "buttons": ["<2-3 high-conversion actions like 'Book 15-min Demo', 'Get Custom Quote', 'Talk to Specialist', 'See ROI Calculator'>"],
  "emailPrompt": ""
}

Context:
Page Context (summary-first if available):
${pageContextForPrompt}
General Context:
${pageChunks.join(" ")}
Detected Intent:
${detectedIntent}
Previous Conversation:
${previousQnA}

SDR Guidelines:
- Reference specific business outcomes (save X hours, increase Y%, reduce Z cost)
- Create urgency with limited-time value
- Use consultative language ("Based on what you're viewing...")
- Be confident about the solution fit
- Focus on next concrete step in sales process
- Only use the above JSON format.
- Respond with ONLY valid JSON - no additional text before or after
- NEVER include JSON objects or button arrays within the mainText field`;
            followupUserPrompt = `Create an SDR-style value proposition with specific benefits. The user has email so focus on conversion. Reference ROI, time savings, or competitive advantage. Be assertive but consultative. Only output the JSON format as instructed.`;
          } else {
            // User hasn't provided email yet - value-focused followup with topic diversification
            followupSystemPrompt = `
You are a helpful sales assistant. The user has not provided an email yet.

CRITICAL: This is FOLLOWUP #3 (followupCount=2). You MUST extract and use a THIRD COMPLETELY DIFFERENT aspect from the actual page content.

**FOLLOWUP #3 PAGE CONTENT EXTRACTION REQUIREMENTS:**
1. **Scan for Remaining Content**: Find additional features, benefits, or services on page not used in previous followups
2. **Extract Different Business Value**: Identify other outcomes, ROI, or competitive advantages mentioned on page
3. **Use Fresh Page Terminology**: Extract new industry-specific terms and phrases from page content
4. **Address Different Customer Need**: Target different business pain point or opportunity mentioned on page

**MANDATORY: EXTRACT FROM ACTUAL PAGE CONTENT**
- **Find Unused Features**: Look for additional tools, services, capabilities mentioned on page
- **Identify Different Benefits**: Extract other results, outcomes, improvements described on page
- **Different Industry Focus**: Use other vertical-specific terms found on page
- **Alternative Solutions**: Reference other ways the page says it helps customers

**PAGE-BASED THIRD ANGLE EXAMPLES:**

If page content includes "scheduling + payments + analytics + integrations":
- Followup #1: Used scheduling content
- Followup #2: Used payments content  
- Followup #3: Extract analytics OR integrations content from page

If page content includes "CRM + automation + reporting + mobile access":
- Followup #1: Used CRM content
- Followup #2: Used automation content
- Followup #3: Extract reporting OR mobile access content from page

**CUSTOMER PROFILING THROUGH PAGE CONTENT:**
- **Button 1**: Different feature/tool mentioned on page
- **Button 2**: Different business outcome described on page
- **Button 3**: Different customer segment or use case from page

PREVIOUS TOPICS/BUTTONS USED (ABSOLUTELY FORBIDDEN):
Previous Buttons: ${
              previousButtons.length > 0
                ? previousButtons.map((btn: string) => `"${btn}"`).join(", ")
                : "None"
            }
Previous Messages: ${
              previousMainTexts.length > 0
                ? previousMainTexts
                    .slice(-3)
                    .map((text: string) => `"${text}"`)
                    .join(", ")
                : "None"
            }

**COST OPTIMIZATION & SAVINGS:**
- Message Focus: Reducing expenses, budget optimization, cost-effectiveness
- Examples: "Cut operational costs?", "Optimize your budget?", "Reduce overhead?"
- Buttons: "Cost Savings", "Budget Optimization", "Expense Reduction"

**INTEGRATION & CONNECTIVITY:**
- Message Focus: Connecting systems, seamless workflows, unified platform
- Examples: "Connect your tools?", "Unify your systems?", "Seamless integration?"
- Buttons: "System Integration", "Tool Connectivity", "Unified Platform"

You will receive page and general context, the detected intent, and the previous conversation. Always generate your response in the following JSON format:
{
  "mainText": "<A value-focused message highlighting specific benefits. STRICT LIMITS: Maximum 30 words total. Create curiosity about unique value they haven't considered.>",
  "buttons": ["<Generate exactly 3 options, each 2-4 words. They should read like tappable choices that convey value from your chosen angle.>"],
  "emailPrompt": "<Create a contextual email prompt that relates to your chosen topic and specific page content. Explain what specific information you'll send them.>"
}
Context:
Page Context:
${pageChunks.slice(0, 10).join("\n---\n")}
General Context:
${pageChunks.join(" ")}
Detected Intent:
${detectedIntent}
Previous Conversation:
${previousQnA}
- Only use the above JSON format.
- Do not answer in any other way.
- Respond with ONLY valid JSON - no additional text before or after
- NEVER include JSON objects or button arrays within the mainText field
- Your mainText must be a friendly, direct request for the user's email, referencing the actual page context or detected intent. Do NOT ask another qualifying question or repeat previous questions.`;
            followupUserPrompt = `Ask the user for their email in a friendly, direct way, explaining why you need it to send them setup instructions, a demo, or connect them to support for this page. Reference the page context or detected intent if possible. Do NOT ask another qualifying question. Do NOT include any buttons. Only output the JSON format as instructed.`;
          }
        } else if (followupCount === 3) {
          // Final nudge: aggressive conversion attempt for sales mode
          if (userHasEmail) {
            // User is in sales mode - final high-pressure but helpful conversion push
            followupSystemPrompt = `You are a confident sales assistant. The user has already provided their email and is a qualified lead. This is your final conversion attempt.

Always generate your response in the following JSON format:
{
  "mainText": "<Final conversion push. Create urgency with specific value proposition. Reference what they've viewed and time-sensitive opportunity. Maximum 30 words. Be direct but helpful.>",
  "buttons": ["<Generate exactly 3 conversion-focused buttons like 'Book Call Now', 'Get Quote Today', 'Priority Demo'>"],
  "emailPrompt": ""
}

Context: 
Page Context: ${pageChunks.slice(0, 10).join("\\n---\\n")} 
General Context: ${pageChunks.join(" ")} 
Detected Intent: ${detectedIntent} 
Previous Conversation: ${previousQnA} 

Final Conversion Guidelines:
- Create time-sensitive urgency ("limited spots", "this week only", "priority access")
- Reference their specific viewing behavior
- Offer exclusive value (priority support, custom setup, direct expert access)
- Use scarcity psychology appropriately
- Be confident about solution fit based on their engagement
- Focus on immediate next step that moves them to purchase/demo
- Only use the above JSON format.
- Respond with ONLY valid JSON - no additional text before or after
- NEVER include JSON objects or button arrays within the mainText field`;
            followupUserPrompt = `Make a final conversion push with urgency and exclusive value. User has email so this is pure sales conversion. Reference their page viewing and create time-sensitive opportunity. Only output the JSON format as instructed.`;
          } else {
            // User hasn't provided email yet - final summary offer
            followupSystemPrompt = `
You are a helpful sales assistant. The user has not provided an email yet and has not responded to several nudges.

You will receive page and general context, the detected intent, and the previous conversation. Always generate your response in the following JSON format:
{
  "mainText": "<Looks like you stepped away. I've saved all your options! Want a quick summary emailed? 📧 STRICT LIMITS: Maximum 30 words total. Be friendly.>",
  "buttons": ["Yes Email Me", "No Thanks", "Keep Browsing"],
  "emailPrompt": "If you'd like a summary or more help, I can email it to you."
}
Context:
Page Context:
${pageChunks.slice(0, 10).join("\n---\n")}
General Context:
${pageChunks.join(" ")}
Detected Intent:
${detectedIntent}
Previous Conversation:
${previousQnA}
- Only use the above JSON format.
- Do not answer in any other way.
- Respond with ONLY valid JSON - no additional text before or after
- NEVER include JSON objects or button arrays within the mainText field
- Your mainText must summarize the user's journey and offer to email a summary. Be natural and avoid formulaic language.`;
            followupUserPrompt = `Offer to email the user a summary of their options, summarizing their last few actions or options in a friendly way. Only output the JSON format as instructed.`;
          }
        } else {
          // No more follow-ups after 4
          console.log(
            `[Followup] No more followups after count 4 for session ${sessionId}`
          );
          return NextResponse.json({}, { headers: corsHeaders });
        }

        // Check if user has been recently active based on recent message timestamps
        const recentMessages = await chats
          .find({ sessionId })
          .sort({ createdAt: -1 })
          .limit(5)
          .toArray();

        const now = new Date();
        const recentUserActivity = recentMessages.some((msg) => {
          const msgTime = new Date(msg.createdAt);
          const timeDiff = now.getTime() - msgTime.getTime();
          return msg.role === "user" && timeDiff < 25000; // 25 seconds
        });

        if (recentUserActivity) {
          console.log(
            `[Followup] Skipping followup - user was active within last 25 seconds for session ${sessionId}`
          );
          let userEmail: string | null = null;
          const lastEmailMsg = await chats.findOne(
            { sessionId, email: { $exists: true } },
            { sort: { createdAt: -1 } }
          );
          if (lastEmailMsg && lastEmailMsg.email)
            userEmail = lastEmailMsg.email;
          return NextResponse.json(
            {
              mainText:
                "You're already active! Please continue your conversation.",
              buttons: [],
              emailPrompt: "",
              botMode: userEmail ? "sales" : "lead_generation",
              userEmail: userEmail || null,
            },
            { headers: corsHeaders }
          );
        }

        // Build a list of all previously used option labels to enforce variety
        const previousButtonsAll: string[] = previousChats
          .filter((chat: any) => chat.buttons && Array.isArray(chat.buttons))
          .flatMap((chat: any) => chat.buttons)
          .map((b: string) => (typeof b === "string" ? b.trim() : ""))
          .filter(Boolean);

        // Helper to normalize a label for comparison
        const normalizeLabel = (s: string) => s.trim().toLowerCase();

        // Start followup generation with error handling
        console.log(
          `[Followup] Starting followup generation for session ${sessionId}, count: ${followupCount}`
        );
        let followupMsg = "";
        let parsed = null;

        try {
          for (let attempt = 0; attempt < 2; attempt++) {
            console.log(
              `[Followup] Attempt ${attempt + 1}/2 for session ${sessionId}`
            );
            // For retries, add explicit constraints to avoid previously used options
            const augmentedUserPrompt =
              attempt === 0
                ? followupUserPrompt
                : `${followupUserPrompt}\n\nAVOID THESE OPTIONS ENTIRELY (use different wording and topics): ${
                    previousButtonsAll.length > 0
                      ? previousButtonsAll.map((b) => `"${b}"`).join(", ")
                      : "(none)"
                  }\nGenerate options that are DISTINCT in wording and topic.`;
            const followupResp = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: followupSystemPrompt },
                { role: "user", content: augmentedUserPrompt },
              ],
            });
            followupMsg = followupResp.choices[0].message.content || "";
            try {
              parsed = JSON.parse(followupMsg || "");
            } catch {
              parsed = { mainText: followupMsg, buttons: [], emailPrompt: "" };
            }
            // Check main text similarity and options overlap
            const tooSimilar = isTooSimilar(parsed.mainText, lastFewQuestions);
            const newButtons: string[] = Array.isArray(parsed.buttons)
              ? parsed.buttons
              : [];
            const newButtonsNorm = new Set(
              newButtons.map((b) => normalizeLabel(String(b || "")))
            );
            const prevButtonsNorm = new Set(
              previousButtonsAll.map((b) => normalizeLabel(String(b || "")))
            );
            let overlap = 0;
            for (const b of newButtonsNorm)
              if (prevButtonsNorm.has(b)) overlap++;

            if (
              !tooSimilar &&
              overlap === 0 &&
              newButtonsNorm.size === newButtons.length
            ) {
              break;
            }
          }
          // If still too similar, skip sending a new follow-up
          if (isTooSimilar(parsed.mainText, lastFewQuestions)) {
            console.log(
              `[Followup] Skipping followup - too similar to previous questions for session ${sessionId}`
            );
            let userEmail: string | null = null;
            const lastEmailMsg = await chats.findOne(
              { sessionId, email: { $exists: true } },
              { sort: { createdAt: -1 } }
            );
            if (lastEmailMsg && lastEmailMsg.email)
              userEmail = lastEmailMsg.email;
            return NextResponse.json(
              {
                mainText: "No new followups available.",
                buttons: [],
                emailPrompt: "",
                botMode: userEmail ? "sales" : "lead_generation",
                userEmail: userEmail || null,
              },
              { headers: corsHeaders }
            );
          }

          // Enforce option uniqueness by filtering out previously used labels and duplicates
          if (Array.isArray(parsed.buttons)) {
            const seen = new Set<string>();
            const prev = new Set(
              previousButtonsAll.map((b) => normalizeLabel(b))
            );
            parsed.buttons = parsed.buttons.filter((b: string) => {
              const key = normalizeLabel(String(b || ""));
              if (!key) return false;
              if (prev.has(key)) return false;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          }

          console.log(
            `[Followup] Successfully generated followup for session ${sessionId}`
          );

          // Add bot mode to followup response
          let userEmail: string | null = null;
          const lastEmailMsg = await chats.findOne(
            { sessionId, email: { $exists: true } },
            { sort: { createdAt: -1 } }
          );
          if (lastEmailMsg && lastEmailMsg.email)
            userEmail = lastEmailMsg.email;
          // Check for booking detection in generic followup
          let enhancedFollowup = parsed;
          try {
            const bookingEnhancement = await enhanceChatWithBookingDetection(
              question || "",
              [], // conversation history - could be enhanced later
              `Page URL: ${pageUrl || "unknown"}`
            );

            if (bookingEnhancement.chatResponse.showBookingCalendar) {
              console.log(
                "[Chat API] Booking detected in generic followup - enhancing response with calendar"
              );
              enhancedFollowup = {
                ...parsed,
                showBookingCalendar: true,
                bookingType:
                  bookingEnhancement.chatResponse.bookingType || "demo",
                // Override mainText with booking-specific response
                mainText:
                  bookingEnhancement.chatResponse.reply || parsed.mainText,
              };
            }
          } catch (error) {
            console.warn(
              "[Chat API] Booking detection failed for generic followup:",
              error
            );
            // Continue with original response if booking detection fails
          }

          const botMode = userEmail ? "sales" : "lead_generation";

          const followupWithMode = {
            ...enhancedFollowup,
            botMode,
            userEmail: userEmail || null,
          };

          return NextResponse.json(followupWithMode, { headers: corsHeaders });
        } catch (error) {
          console.error(
            `[Followup] Error generating followup for session ${sessionId}:`,
            error
          );
          let userEmail: string | null = null;
          const lastEmailMsg = await chats.findOne(
            { sessionId, email: { $exists: true } },
            { sort: { createdAt: -1 } }
          );
          if (lastEmailMsg && lastEmailMsg.email)
            userEmail = lastEmailMsg.email;
          return NextResponse.json(
            {
              mainText: "Sorry, something went wrong generating a followup.",
              buttons: [],
              emailPrompt: "",
              botMode: userEmail ? "sales" : "lead_generation",
              userEmail: userEmail || null,
            },
            { headers: corsHeaders }
          );
        }
      }
    }
    // Fallback if no context
    console.log(
      `[DEBUG] Falling back to generic message. pageSummary: "${pageSummary}", pageChunks.length: ${pageChunks.length}`
    );
    if (proactive) {
      console.log(
        `[DEBUG] Returning generic proactive message - no page context found`
      );

      // Generate dynamic generic message based on URL patterns
      const urlLower = pageUrl.toLowerCase();
      let contextualMessage =
        "I'm here to help you find what you're looking for.";

      if (urlLower.includes("pricing") || urlLower.includes("plan")) {
        contextualMessage =
          "I can help you understand the available options and pricing.";
      } else if (urlLower.includes("feature") || urlLower.includes("product")) {
        contextualMessage =
          "I can explain how our features work and help you get started.";
      } else if (urlLower.includes("contact") || urlLower.includes("about")) {
        contextualMessage =
          "I'm here to help you connect with our team or learn more.";
      } else if (urlLower.includes("demo") || urlLower.includes("trial")) {
        contextualMessage =
          "I can help you try our platform or schedule a demonstration.";
      } else if (urlLower.includes("support") || urlLower.includes("help")) {
        contextualMessage =
          "I'm here to provide support and answer your questions.";
      }

      const proactiveMsg = `${contextualMessage}

What specific information are you looking for? I'm here to help guide you through the available options and answer any questions you might have.`;

      // Determine bot mode for generic proactive message
      let userEmail: string | null = null;
      const lastEmailMsg = await chats.findOne(
        { sessionId, email: { $exists: true } },
        { sort: { createdAt: -1 } }
      );
      if (lastEmailMsg && lastEmailMsg.email) userEmail = lastEmailMsg.email;
      const botMode = userEmail ? "sales" : "lead_generation";

      return NextResponse.json(
        {
          mainText: proactiveMsg,
          buttons: [],
          emailPrompt: "",
          botMode,
          userEmail: userEmail || null,
        },
        { headers: corsHeaders }
      );
    } else if (followup) {
      console.log(
        `[Followup] Simple fallback followup for session ${sessionId}`
      );

      // Add bot mode to fallback followup
      let userEmail: string | null = null;
      const lastEmailMsg = await chats.findOne(
        { sessionId, email: { $exists: true } },
        { sort: { createdAt: -1 } }
      );
      if (lastEmailMsg && lastEmailMsg.email) userEmail = lastEmailMsg.email;
      const botMode = userEmail ? "sales" : "lead_generation";

      return NextResponse.json(
        {
          mainText:
            "Is there anything else you'd like to know about the available features?",
          buttons: ["Learn More Features", "Get Demo", "Contact Support"],
          emailPrompt: "",
          botMode,
          userEmail: userEmail || null,
        },
        { headers: corsHeaders }
      );
    }
  }

  // Handle followup without pageUrl (generic followup logic)
  if (followup && !pageUrl) {
    console.log(
      `[Followup] Processing followup without pageUrl for session ${sessionId}`
    );

    try {
      const followupCount =
        typeof body.followupCount === "number" ? body.followupCount : 0;

      if (followupCount < 3) {
        // Generate contextual followup based on URL or previous conversation
        const urlLower = pageUrl?.toLowerCase() || "";
        let contextualMessage = "Is there anything else you'd like to explore?";

        if (urlLower.includes("pricing") || urlLower.includes("plan")) {
          contextualMessage =
            "Would you like to discuss pricing options or compare different plans?";
        } else if (
          urlLower.includes("feature") ||
          urlLower.includes("product")
        ) {
          contextualMessage =
            "Interested in seeing how these features could work for your needs?";
        } else if (urlLower.includes("demo") || urlLower.includes("trial")) {
          contextualMessage = "Ready to experience the platform firsthand?";
        } else if (urlLower.includes("contact") || urlLower.includes("about")) {
          contextualMessage =
            "Would you like to connect with our team or learn more about our approach?";
        }

        console.log(
          `[Followup] Sending contextual followup ${followupCount} for session ${sessionId}`
        );

        // Add bot mode to generic followup
        let userEmail: string | null = null;
        const lastEmailMsg = await chats.findOne(
          { sessionId, email: { $exists: true } },
          { sort: { createdAt: -1 } }
        );
        if (lastEmailMsg && lastEmailMsg.email) userEmail = lastEmailMsg.email;
        const botMode = userEmail ? "sales" : "lead_generation";

        return NextResponse.json(
          {
            mainText: contextualMessage,
            buttons: ["Learn More", "Get Help", "Contact Us"],
            emailPrompt: "",
            botMode,
            userEmail: userEmail || null,
          },
          { headers: corsHeaders }
        );
      } else {
        console.log(
          `[Followup] No more generic followups for session ${sessionId}`
        );
        return NextResponse.json({}, { headers: corsHeaders });
      }
    } catch (error) {
      console.error(
        `[Followup] Error in generic followup for session ${sessionId}:`,
        error
      );
      return NextResponse.json({}, { headers: corsHeaders });
    }
  }

  // Embed the question - Add validation to prevent API errors
  if (!question || question.trim().length === 0) {
    console.log("[DEBUG] Empty question, returning generic response");
    return NextResponse.json(
      {
        answer: "I'm here to help! What would you like to know?",
      },
      { headers: corsHeaders }
    );
  }

  const embedResp = await openai.embeddings.create({
    input: [question.trim()],
    model: "text-embedding-3-small",
  });
  const questionEmbedding = embedResp.data[0].embedding;

  // Retrieve relevant chunks (global context for now, or filter by adminId if needed)
  const topChunks = await querySimilarChunks(
    questionEmbedding,
    5,
    adminId || undefined
  );
  const context = topChunks.join("\n---\n");

  // Also get page-specific context if available
  let pageContext = "";
  if (adminId && pageUrl) {
    const pageChunks = await getChunksByPageUrl(adminId, pageUrl);
    if (pageChunks.length > 0) {
      pageContext = pageChunks.slice(0, 10).join("\n---\n");
    }
  }

  // Detect if user is identified (has provided email)
  let userEmail: string | null = null;
  const lastEmailMsg = await chats.findOne(
    { sessionId, email: { $exists: true } },
    { sort: { createdAt: -1 } }
  );
  if (lastEmailMsg && lastEmailMsg.email) userEmail = lastEmailMsg.email;

  // If we detected an email in the current message, the user is now identified
  if (detectedEmail) {
    userEmail = detectedEmail;
    console.log(`[DEBUG] User provided email in current message: ${userEmail}`);
  }

  // Detect if the user message matches any previous assistant message's buttons
  // (currently unused but kept for future functionality)
  // let isButtonAction = false;
  if (question) {
    // Find the last assistant message with buttons
    const lastAssistantWithButtons = await chats.findOne(
      {
        sessionId,
        role: "assistant",
        "content.buttons.0": { $exists: true },
      },
      { sort: { createdAt: -1 } }
    );
    if (
      lastAssistantWithButtons &&
      lastAssistantWithButtons.content &&
      Array.isArray(lastAssistantWithButtons.content.buttons)
    ) {
      // isButtonAction = lastAssistantWithButtons.content.buttons.some(
      //   (b: string) => b.toLowerCase() === question.trim().toLowerCase()
      // );
    }
  }

  // If no context, refer to sales team and ask for contact
  if (!context.trim() && !pageContext.trim()) {
    return NextResponse.json(
      {
        answer:
          "I'm not sure about that. I'll refer your question to our sales team. Could you please share your email or phone number so we can follow up?",
      },
      { headers: corsHeaders }
    );
  }

  // Detect specific user intents for special handling
  const lowerQuestion = (question || "").toLowerCase();
  const isTalkToSupport =
    lowerQuestion.includes("talk to support") ||
    lowerQuestion.includes("contact support");
  const isEmailRequest =
    lowerQuestion.includes("email") &&
    (lowerQuestion.includes("send") || lowerQuestion.includes("share"));

  // Chat completion with sales-pitch system prompt
  let systemPrompt = "";
  const userPrompt = question;
  if (userEmail) {
    console.log(
      `[DEBUG] User has email: ${userEmail} - Switching to SALES mode`
    );
    systemPrompt = `You are a helpful sales assistant for a company. The user has provided their email (${userEmail}) and is now a qualified lead. Focus on sales, product benefits, pricing, and closing deals. Always generate your response in the following JSON format:

{
  "mainText": "<Provide sales-focused, persuasive responses about products/services, pricing, benefits, case studies, or next steps. Be enthusiastic and focus on value proposition. Use the context below to provide specific information. MANDATORY FORMATTING RULES: \n1. NEVER write long paragraphs - they are hard to read in chat\n2. Start with 1-2 short sentences (max 20 words each)\n3. Add double line break \\n\\n after intro\n4. Use bullet points with • symbol for ANY list of 2+ benefits/features\n5. Add TWO line breaks \\n\\n after each bullet point for better spacing\n6. Example format: 'Great question! Here's what makes us special:\\n\\n• Benefit 1\\n\\n• Benefit 2\\n\\n• Benefit 3'\n7. Use emojis sparingly for emphasis\n8. Never use long sentences in paragraphs - break them into bullets>",
  "buttons": ["<Generate 2-4 sales-oriented action buttons like 'Get Pricing', 'Schedule Demo', 'View Case Studies', 'Speak with Sales Rep', 'Compare Plans', etc. Make them action-oriented and sales-focused.>"],
  "emailPrompt": ""
}

Context:
Page Context:
${pageContext}

General Context:
${context}

IMPORTANT: This user is qualified (has provided email). Focus on sales, conversion, and closing. Generate sales-oriented buttons that move them towards purchase decisions. No need to ask for email again. ABSOLUTELY NO LONG PARAGRAPHS - USE BULLET POINTS WITH DOUBLE LINE BREAKS FOR SPACING.`;
  } else {
    // Special handling for different types of requests
    if (isTalkToSupport) {
      systemPrompt = `You are a helpful support assistant. The user wants to talk to support. Provide a helpful, specific support response based on the context and their needs. Always generate your response in the following JSON format:

{
  "mainText": "<A helpful, specific support response that addresses their likely needs based on the context. Be warm and professional. Provide specific next steps or information about how to get help. MANDATORY FORMATTING RULES: \n1. NEVER write long paragraphs - they are hard to read in chat\n2. Start with 1-2 short sentences (max 20 words each)\n3. Add double line break \\n\\n after intro\n4. Use bullet points with • symbol for ANY steps or multiple items\n5. Add TWO line breaks \\n\\n after each bullet point for better spacing\n6. Example format: 'I'm here to help!\\n\\n• Step 1\\n\\n• Step 2\\n\\n• Step 3'\n7. Use emojis sparingly for clarity\n8. Never use long sentences in paragraphs - break them into bullets>",
  "buttons": ["<Generate 2-3 relevant support-related actions like 'Schedule Support Call', 'Check Help Center', 'Report Technical Issue', etc. Make them specific to their context.>"],
  "emailPrompt": ""
}

Context:
Page Context:
${pageContext}

General Context:
${context}

IMPORTANT: Focus on being helpful and supportive. Don't ask for email unless it's specifically needed for support. Generate contextual support-related buttons. ABSOLUTELY NO LONG PARAGRAPHS - USE BULLET POINTS WITH DOUBLE LINE BREAKS FOR SPACING.`;
    } else if (isEmailRequest) {
      systemPrompt = `You are a helpful sales assistant. The user is asking about email or wanting something sent to their email. Always generate your response in the following JSON format:

{
  "mainText": "<Acknowledge their email request and explain what you can send them. Be specific about what information or resources you'll provide. MANDATORY FORMATTING: Use 1-2 short sentences maximum. Be direct and clear about what they'll receive. NO BULLET POINTS needed for simple email acknowledgments.>",
  "buttons": [],
  "emailPrompt": "<Create a contextual email prompt specific to what they requested. Be clear about what exactly you'll send them based on their request.>"
}

Context:
Page Context:
${pageContext}

General Context:
${context}

IMPORTANT: Don't provide other action buttons when user is requesting email. Focus on the email collection. KEEP RESPONSE BRIEF AND FOCUSED.`;
    } else {
      systemPrompt = `You are a helpful sales assistant. The user has not provided an email yet.

You will receive page and general context. Always generate your response in the following JSON format:

{
  "mainText": "<A dynamic, page-aware summary or answer, using the context below. MANDATORY FORMATTING RULES: 
1. NEVER write long paragraphs - they are hard to read in chat
2. Start with 1-2 short sentences (max 20 words each)
3. Add double line break \\n\\n after intro
4. Use bullet points with • symbol for ANY list of 2+ items
5. Add TWO line breaks \\n\\n after each bullet point for better spacing
6. Example format: 'Short intro!\\n\\n• First benefit\\n\\n• Second benefit\\n\\n• Third benefit'
7. Use emojis sparingly for emphasis
8. Never use long sentences in paragraphs - break them into bullets
9. CRITICAL: NEVER include action buttons, button lists, or JSON objects in mainText - buttons go ONLY in the buttons array
10. CRITICAL: Do NOT assume or reference specific industries, business types, or professions unless explicitly mentioned
11. CRITICAL: NEVER put JSON syntax, curly braces {}, or button arrays in the mainText field>",
  "buttons": ["<Generate 2-4 contextually relevant action buttons based on the user's question and the content you provided. These should be specific to their query and help them take the next logical step.>"],
  "emailPrompt": "<Create a contextual email prompt that relates to the specific topic discussed, offering to send more detailed information about that topic specifically.>"
}

STRICT RULES:
- You MUST respond with ONLY valid JSON in this exact format - no additional text before or after
- NEVER include JSON objects or button arrays within the mainText field  
- Use \\n\\n for line breaks and ** for bold text in mainText
- Keep mainText conversational and helpful, buttons actionable and specific
- Required JSON structure: {"mainText": "...", "buttons": [...], "emailPrompt": "..."}

Context:
Page Context:
${pageContext}

General Context:
${context}

CRITICAL: Generate buttons and email prompt that are directly related to the user's specific question. Do not use generic buttons. NEVER PUT JSON OR BUTTONS IN MAINTEXT - ONLY IN THE BUTTONS ARRAY. Respond with pure JSON only.`;
    }
  }

  const chatResp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    response_format: { type: "json_object" }, // Force JSON response format
    temperature: 0.7,
    max_tokens: 1000,
  });
  const answer = chatResp.choices[0].message.content;

  // Use robust parsing to handle multiple JSON objects and formats
  console.log("[DEBUG] Raw AI response:", answer);
  const parsed = parseAIResponse(answer || "");
  console.log("[DEBUG] Parsed AI response:", parsed);

  // Additional cleanup for parsed mainText
  if (parsed && parsed.mainText) {
    parsed.mainText = parsed.mainText
      .replace(/\\n\\n/g, "<br><br>")
      .replace(/\\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .trim();
  }

  // Save user and assistant message, including email and requirements if detected or already present
  let emailToStore = detectedEmail;
  let requirementsToStore = null;
  if (!emailToStore) {
    // Check if session already has an email
    const lastMsg = await chats.findOne({
      sessionId,
      email: { $exists: true },
    });
    if (lastMsg && lastMsg.email) {
      emailToStore = lastMsg.email;
      requirementsToStore = lastMsg.requirements || null;
    }
  } else {
    // If we just detected an email, check if we also extracted requirements
    const updatedMsg = await chats.findOne({
      sessionId,
      requirements: { $exists: true },
    });
    if (updatedMsg && updatedMsg.requirements) {
      requirementsToStore = updatedMsg.requirements;
    }
  }

  await chats.insertMany([
    {
      sessionId,
      role: "user",
      content: question,
      createdAt: now,
      ...(emailToStore ? { email: emailToStore } : {}),
      ...(requirementsToStore ? { requirements: requirementsToStore } : {}),
      ...(adminId ? { adminId } : {}),
      // 🔥 PHASE 2: Add booking information to all messages
      ...(bookingStatus.hasActiveBooking && bookingStatus.currentBooking
        ? {
            hasActiveBooking: true,
            bookingId: bookingStatus.currentBooking._id,
            bookingType: bookingStatus.currentBooking.requestType,
          }
        : {}),
    },
    {
      sessionId,
      role: "assistant",
      content: answer,
      createdAt: new Date(now.getTime() + 1),
      ...(emailToStore ? { email: emailToStore } : {}),
      ...(requirementsToStore ? { requirements: requirementsToStore } : {}),
      ...(adminId ? { adminId } : {}),
      // 🔥 PHASE 2: Add booking information to all messages
      ...(bookingStatus.hasActiveBooking && bookingStatus.currentBooking
        ? {
            hasActiveBooking: true,
            bookingId: bookingStatus.currentBooking._id,
            bookingType: bookingStatus.currentBooking.requestType,
          }
        : {}),
    },
  ]);

  // Add bot mode information to the response
  const botMode = userEmail ? "sales" : "lead_generation";

  // Check for booking detection and enhance response if needed
  let enhancedResponse = parsed;
  try {
    const bookingEnhancement = await enhanceChatWithBookingDetection(
      question || "",
      [], // conversation history - could be enhanced later
      `Page URL: ${pageUrl || "unknown"}`
    );

    if (bookingEnhancement.chatResponse.showBookingCalendar) {
      console.log(
        `[Chat API ${requestId}] Booking detected - enhancing response with calendar`
      );
      // Completely override with booking response, don't merge with potentially corrupted parsed response
      enhancedResponse = {
        mainText:
          bookingEnhancement.chatResponse.reply ||
          "I'd be happy to help you schedule some time to connect!",
        buttons: ["Schedule Now", "Learn More", "Contact Sales"],
        emailPrompt:
          "Would you like me to send you the calendar link via email?",
        followupQuestion: "",
        showBookingCalendar: true,
        bookingType: bookingEnhancement.chatResponse.bookingType || "demo",
      };
      console.log(`[Chat API ${requestId}] Enhanced response created:`, {
        showBookingCalendar: enhancedResponse.showBookingCalendar,
        bookingType: enhancedResponse.bookingType,
        hasMainText: !!enhancedResponse.mainText,
      });
    }
  } catch (error) {
    console.warn("[Chat API] Booking detection failed:", error);
    // Continue with original response if booking detection fails
  }

  const responseWithMode = {
    ...enhancedResponse,
    botMode,
    userEmail: userEmail || null, // Include for debugging
  };

  // If the user already has a valid active booking, suppress calendar prompts
  if (bookingStatus.hasActiveBooking && bookingStatus.currentBooking) {
    (responseWithMode as any).showBookingCalendar = false;
    delete (responseWithMode as any).bookingType;
  }

  // 🔥 PHASE 2: ENHANCED BOOKING-AWARE RESPONSE PROCESSING
  // First check for booking management actions
  const bookingManagementResponse =
    bookingStatus.hasActiveBooking && bookingStatus.currentBooking
      ? generateBookingManagementResponse(
          question || "",
          bookingStatus.currentBooking
        )
      : null;

  let finalResponse;
  if (bookingManagementResponse) {
    // Use booking management response (view details, reschedule, etc.)
    finalResponse = bookingManagementResponse;
    console.log(`[Chat API ${requestId}] Booking management action detected:`, {
      action: bookingManagementResponse.bookingAction,
      hasActiveBooking: bookingStatus.hasActiveBooking,
    });
  } else {
    // Use standard booking-aware filtering
    finalResponse = generateBookingAwareResponse(
      responseWithMode,
      bookingStatus,
      question || ""
    );
  }

  console.log(`[Chat API ${requestId}] Main response:`, {
    botMode,
    userEmail: userEmail || null,
    hasResponse: !!finalResponse.mainText,
    showBookingCalendar: !!finalResponse.showBookingCalendar,
    bookingType: finalResponse.bookingType || undefined,
    hasActiveBooking: bookingStatus.hasActiveBooking,
    buttonsFiltered:
      bookingStatus.hasActiveBooking &&
      responseWithMode.buttons?.length !== finalResponse.buttons?.length,
    bookingAction: finalResponse.bookingAction || undefined,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(finalResponse, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId)
    return NextResponse.json({ history: [] }, { headers: corsHeaders });
  const db = await getDb();
  const chats = db.collection("chats");
  const history = await chats
    .find({ sessionId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
  return NextResponse.json(
    { history: history.reverse() },
    { headers: corsHeaders }
  );
}

export async function DELETE(req: NextRequest) {
  try {
    const { sessionId, clearHistory } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (clearHistory) {
      const db = await getDb();
      const chats = db.collection("chats");

      // First, check if user has email (to preserve SDR status)
      const emailMessage = await chats.findOne(
        { sessionId, email: { $exists: true } },
        { sort: { createdAt: -1 } }
      );

      // Delete all chat history for this session
      const result = await chats.deleteMany({ sessionId });

      console.log(
        `[Chat] Cleared ${result.deletedCount} messages for session ${sessionId}`
      );

      // If user had email, preserve their SDR status for cross-page activation
      let preservedEmailStatus = null;
      if (emailMessage && emailMessage.email) {
        preservedEmailStatus = {
          email: emailMessage.email,
          botMode: emailMessage.botMode || "sales",
          userEmail: emailMessage.email,
          adminId: emailMessage.adminId,
        };

        console.log(
          `[Chat] Preserving SDR status for ${emailMessage.email} across page navigation`
        );

        // Store a minimal record to maintain SDR status
        await chats.insertOne({
          sessionId,
          role: "system",
          content: "SDR_STATUS_PRESERVED",
          email: emailMessage.email,
          botMode: emailMessage.botMode || "sales",
          userEmail: emailMessage.email,
          adminId: emailMessage.adminId,
          createdAt: new Date(),
          preservedStatus: true,
        });
      }

      return NextResponse.json(
        {
          success: true,
          deletedCount: result.deletedCount,
          message: "Chat history cleared successfully",
          preservedEmailStatus,
        },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[Chat] Error clearing chat history:", error);
    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500, headers: corsHeaders }
    );
  }
}
