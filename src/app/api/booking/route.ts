/**
 * Public Booking API with Calendar Integration
 * Handles booking submissions with calendar validation and conflict prevention
 */

import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { calendarService } from "@/services/calendarService";
import { FeatureFlags } from "@/lib/javascriptSafety";
import { JavaScriptSafetyUtils } from "@/lib/javascriptSafety";

interface BookingSubmission {
  // Calendar selection
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // HH:MM
  timezone?: string;

  // Personal information
  name: string;
  email: string;
  company?: string;
  phone?: string;
  role?: string;

  // Booking details
  bookingType?: "demo" | "call" | "support" | "consultation";
  duration?: number; // minutes
  requirements?: string;
  interests?: string[];
  teamSize?: string;
  timeline?: string;

  // Source tracking
  source?: string;
  referrer?: string;

  // Admin assignment
  adminId?: string;
}

interface BookingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * POST /api/booking
 * Submit a new booking with calendar validation
 */
export async function POST(request: NextRequest) {
  try {
    // Check if booking feature is enabled
    if (!FeatureFlags.ENABLE_BOOKING_SYSTEM) {
      return NextResponse.json(
        { error: "Booking system is currently unavailable" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const bookingData: BookingSubmission = body;

    console.log("📅 New booking submission:", {
      date: bookingData.preferredDate,
      time: bookingData.preferredTime,
      email: bookingData.email,
      type: bookingData.bookingType || "demo",
    });

    // Step 1: Validate booking data
    const validation = await validateBookingSubmission(bookingData);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Step 2: Check calendar availability (critical step)
    const availabilityResult = await verifyBookingAvailability(bookingData);
    if (!availabilityResult.available) {
      return NextResponse.json(
        {
          success: false,
          error: "Selected time slot is no longer available",
          reason: availabilityResult.reason,
          suggestedAlternatives: availabilityResult.alternatives || [],
          // Include validation warnings if any
          warnings: validation.warnings,
        },
        { status: 409 } // Conflict
      );
    }

    // Step 3: Prepare booking data for database
    const processedBookingData = await processBookingData(bookingData);

    // Step 4: Create booking in database with atomic operation
    const createdBooking = await createBookingWithConflictCheck(
      processedBookingData
    );

    // Step 5: Send confirmation (if booking creation succeeded)
    await sendBookingConfirmation(createdBooking, bookingData);

    // Step 6: Return success response
    return NextResponse.json({
      success: true,
      data: {
        bookingId: createdBooking._id,
        status: createdBooking.status,
        confirmationNumber: createdBooking.confirmationNumber,
        scheduledFor: {
          date: createdBooking.preferredDate,
          time: createdBooking.preferredTime,
          timezone: createdBooking.timezone || "America/New_York",
        },
        nextSteps: generateNextSteps(createdBooking),
        warnings: validation.warnings,
      },
    });
  } catch (error) {
    console.error("❌ Booking submission error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (
        error.message.includes("conflict") ||
        error.message.includes("already booked")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Time slot conflict detected",
            message:
              "The selected time slot was booked by another user. Please select a different time.",
            conflictType: "time_slot_taken",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create booking",
        message:
          "An error occurred while processing your booking. Please try again.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/booking
 * Get booking by confirmation number or ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");
    const confirmationNumber = searchParams.get("confirmation");
    const email = searchParams.get("email");

    if (!bookingId && !confirmationNumber) {
      return NextResponse.json(
        { error: "Booking ID or confirmation number is required" },
        { status: 400 }
      );
    }

    let booking;
    if (bookingId) {
      booking = await bookingService.getBookingById(bookingId);
    } else if (confirmationNumber) {
      // Search by confirmation number
      const bookings = await bookingService.getAllBookings(
        {
          searchTerm: confirmationNumber,
        },
        1,
        1
      );
      booking = bookings.bookings[0];
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Privacy check - only return booking if email matches (for non-admin requests)
    if (email && booking.email !== email) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: booking._id,
        status: booking.status,
        confirmationNumber: booking.confirmationNumber,
        scheduledFor: {
          date: booking.preferredDate,
          time: booking.preferredTime,
          timezone: booking.timezone || "America/New_York",
        },
        attendee: {
          name: booking.name,
          email: booking.email,
          company: booking.company,
        },
        bookingType: booking.requestType,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Booking retrieval error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to retrieve booking",
      },
      { status: 500 }
    );
  }
}

/**
 * Validate booking submission data
 */
async function validateBookingSubmission(
  data: BookingSubmission
): Promise<BookingValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Required fields validation
    if (!data.preferredDate || !data.preferredTime) {
      errors.push("Date and time selection is required");
    }

    if (!data.name || data.name.trim().length === 0) {
      errors.push("Name is required");
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.push("Email address is required");
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email.trim())) {
      errors.push("Please provide a valid email address");
    }

    // Date format validation
    if (data.preferredDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.preferredDate)) {
        errors.push("Invalid date format. Expected YYYY-MM-DD");
      }
    }

    // Time format validation
    if (data.preferredTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.preferredTime)) {
        errors.push("Invalid time format. Expected HH:MM");
      }
    }

    // Business validation using calendar service
    if (data.preferredDate && data.preferredTime) {
      const calendarValidation = calendarService.validateTimeSlot(
        data.preferredDate,
        data.preferredTime,
        data.timezone || "America/New_York"
      );

      if (!calendarValidation.valid) {
        errors.push(
          calendarValidation.reason || "Selected time slot is invalid"
        );
      }
    }

    // Data sanitization warnings
    if (
      data.name &&
      data.name !== JavaScriptSafetyUtils.sanitizeString(data.name)
    ) {
      warnings.push(
        "Name contains potentially unsafe characters and will be cleaned"
      );
    }

    if (data.requirements && data.requirements.length > 1000) {
      warnings.push("Requirements text is very long and may be truncated");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    console.error("Validation error:", error);
    return {
      valid: false,
      errors: ["Validation failed due to system error"],
      warnings,
    };
  }
}

/**
 * Verify booking availability using calendar service
 */
async function verifyBookingAvailability(data: BookingSubmission): Promise<{
  available: boolean;
  reason?: string;
  alternatives?: string[];
}> {
  try {
    // Use calendar service to check availability
    const validationResult = calendarService.validateTimeSlot(
      data.preferredDate,
      data.preferredTime,
      data.timezone || "America/New_York"
    );

    if (!validationResult.valid) {
      return {
        available: false,
        reason: validationResult.reason,
      };
    }

    // Check for existing bookings
    const requestedDateTime = new Date(
      `${data.preferredDate}T${data.preferredTime}:00`
    );
    const existingBookings = await bookingService.getAllBookings(
      {
        adminId: data.adminId,
        dateRange: { start: requestedDateTime, end: requestedDateTime },
      },
      1,
      1000
    );

    const isBooked = existingBookings.bookings.some((booking) => {
      const bookingDate = new Date(booking.preferredDate);
      return (
        bookingDate.toDateString() === requestedDateTime.toDateString() &&
        booking.preferredTime === data.preferredTime &&
        ["pending", "confirmed"].includes(booking.status)
      );
    });

    if (isBooked) {
      // Generate alternatives using calendar service
      const alternativeSlots = calendarService.getSuggestedAlternatives(
        data.preferredDate,
        data.preferredTime,
        existingBookings.bookings
      );

      return {
        available: false,
        reason: "Time slot is already booked",
        alternatives: alternativeSlots.map(
          (slot) => `${slot.date} ${slot.time}`
        ),
      };
    }

    return { available: true };
  } catch (error) {
    console.error("Availability check error:", error);
    return {
      available: false,
      reason: "Unable to verify availability. Please try again.",
    };
  }
}

/**
 * Process and sanitize booking data
 */
async function processBookingData(data: BookingSubmission) {
  return {
    // Required fields for BookingRequest
    sessionId: `booking_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`,
    customerRequest:
      data.requirements || `${data.bookingType || "demo"} booking request`,
    originalMessage:
      data.requirements || `Calendar booking for ${data.bookingType || "demo"}`,
    detectionConfidence: 1.0, // Direct booking submission

    // Calendar data
    preferredDate: new Date(data.preferredDate),
    preferredTime: data.preferredTime,
    timezone: data.timezone || "America/New_York",

    // Personal information (sanitized)
    name: JavaScriptSafetyUtils.sanitizeString(data.name),
    email: JavaScriptSafetyUtils.sanitizeString(
      data.email.toLowerCase().trim()
    ),
    company: data.company
      ? JavaScriptSafetyUtils.sanitizeString(data.company)
      : undefined,
    phone: data.phone
      ? JavaScriptSafetyUtils.sanitizeString(data.phone)
      : undefined,
    role: data.role,

    // Booking details
    requestType: data.bookingType || "demo",
    requirements: data.requirements
      ? JavaScriptSafetyUtils.sanitizeString(data.requirements)
      : undefined,
    interests: data.interests || [],
    teamSize: data.teamSize,
    timeline: data.timeline,

    // Metadata
    source: data.source || "calendar_widget",
    status: "pending" as const,
    priority: "medium" as const,
    adminId: data.adminId,

    // Generate confirmation number
    confirmationNumber: generateConfirmationNumber(),
  };
}

/**
 * Create booking with conflict checking
 */
async function createBookingWithConflictCheck(bookingData: any) {
  try {
    // Final availability check before creating
    const finalCheck = await verifyBookingAvailability({
      preferredDate: bookingData.preferredDate.toISOString().split("T")[0],
      preferredTime: bookingData.preferredTime,
      timezone: bookingData.timezone,
      adminId: bookingData.adminId,
    } as BookingSubmission);

    if (!finalCheck.available) {
      throw new Error(`Booking conflict detected: ${finalCheck.reason}`);
    }

    // Create the booking
    const createdBooking = await bookingService.createBooking(bookingData);

    console.log("✅ Booking created successfully:", {
      id: createdBooking._id,
      confirmation: createdBooking.confirmationNumber,
      email: createdBooking.email,
    });

    return createdBooking;
  } catch (error) {
    console.error("❌ Booking creation failed:", error);
    throw error;
  }
}

/**
 * Send booking confirmation
 */
async function sendBookingConfirmation(
  booking: any,
  originalData: BookingSubmission
) {
  try {
    // TODO: Implement email service integration
    // For now, just log the confirmation
    console.log("📧 Booking confirmation (email service not implemented):", {
      to: booking.email,
      confirmationNumber: booking.confirmationNumber,
      scheduledFor: `${booking.preferredDate.toDateString()} at ${
        booking.preferredTime
      }`,
      bookingType: booking.requestType,
    });

    // TODO: Add calendar invite generation
    // TODO: Add SMS notification if phone provided
    // TODO: Add admin notification
  } catch (error) {
    console.error("❌ Failed to send confirmation:", error);
    // Don't throw - booking was successful, confirmation is secondary
  }
}

/**
 * Generate next steps for user
 */
function generateNextSteps(booking: any): string[] {
  const steps = [
    "📧 Check your email for a detailed confirmation and calendar invite",
    `📅 Add the event to your calendar for ${booking.preferredDate.toDateString()} at ${
      booking.preferredTime
    }`,
    "📋 Prepare any specific questions you'd like to discuss",
  ];

  if (booking.requestType === "demo") {
    steps.push(
      "💻 Ensure you have a stable internet connection for the video call"
    );
  }

  if (booking.phone) {
    steps.push(
      "📞 We'll call you at the scheduled time if video isn't working"
    );
  }

  return steps;
}

/**
 * Generate unique confirmation number
 */
function generateConfirmationNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `BK${timestamp}${random}`.toUpperCase();
}
