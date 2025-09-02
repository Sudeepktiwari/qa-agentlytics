/**
 * Calendar API for booking availability management
 * Provides endpoints for calendar display, availability checking, and timexport async function GET(request: NextRequest) {
  try {
    // Extract admin ID from request
    const apiKey = request.headers.get("x-api-key");
    const adminId = extractAdminId(apiKey || undefined, request);
    
    // Check if calendar widget is enabled for this admin
    const calendarEnabled = await isFeatureEnabled(adminId, "calendarWidget");
    if (!calendarEnabled) {
      return NextResponse.json(
        { error: "Calendar widget is not enabled for this admin" },
        { status: 503, headers: corsHeaders }
      );
    }anagement
 */

import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { calendarService } from "@/services/calendarService";
import { extractAdminId, isFeatureEnabled } from "@/lib/adminSettings";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

interface CalendarRequest {
  month: number; // 1-12
  year: number;
  timezone?: string;
  adminId?: string;
  bookingType?: "demo" | "call" | "support" | "consultation";
}

interface TimeSlot {
  time: string; // HH:MM format
  available: boolean;
  reason?: string; // Why unavailable
}

interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  available: boolean;
  timeSlots: TimeSlot[];
  isBlocked?: boolean;
  blockReason?: string;
}

interface CalendarResponse {
  month: number;
  year: number;
  timezone: string;
  days: CalendarDay[];
  businessHours: {
    start: string;
    end: string;
    timeZone: string;
  };
  availableSlots: number;
}

/**
 * GET /api/calendar/availability
 * Returns calendar availability for a specific month
 */
export async function GET(request: NextRequest) {
  try {
    // Extract admin ID from request headers
    const apiKey = request.headers.get("x-api-key");
    const requestAdminId = extractAdminId(apiKey || undefined, request);
    
    // Check if calendar widget is enabled for this admin
    const calendarEnabled = await isFeatureEnabled(requestAdminId, "calendarWidget");
    if (!calendarEnabled) {
      return NextResponse.json(
        { error: "Calendar widget is not enabled for this admin" },
        { status: 503, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(request.url);

    const month = parseInt(
      searchParams.get("month") || new Date().getMonth() + 1 + ""
    );
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear() + ""
    );
    const timezone = searchParams.get("timezone") || "America/New_York";
    const adminId = searchParams.get("adminId") || undefined;
    const bookingType =
      (searchParams.get("bookingType") as CalendarRequest["bookingType"]) ||
      "demo";

    // Validate month and year
    if (month < 1 || month > 12 || year < 2025 || year > 2030) {
      return NextResponse.json(
        { error: "Invalid month or year parameter" },
        { status: 400, headers: corsHeaders }
      );
    }

    const calendarData = await generateCalendarAvailability({
      month,
      year,
      timezone,
      adminId,
      bookingType,
    });

    return NextResponse.json({
      success: true,
      data: calendarData,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("❌ Calendar availability API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch calendar availability",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/calendar/availability
 * Check specific time slot availability
 */
export async function POST(request: NextRequest) {
  try {
    // Extract admin ID from request
    const apiKey = request.headers.get("x-api-key");
    const requestAdminId = extractAdminId(apiKey || undefined, request);
    
    // Check if calendar widget is enabled for this admin
    const calendarEnabled = await isFeatureEnabled(requestAdminId, "calendarWidget");
    if (!calendarEnabled) {
      return NextResponse.json(
        { error: "Calendar widget is not enabled for this admin" },
        { status: 503, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { date, time, timezone, adminId } = body;

    if (!date || !time) {
      return NextResponse.json(
        { error: "Date and time are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: "Invalid time format. Use HH:MM" },
        { status: 400, headers: corsHeaders }
      );
    }

    const availabilityResult = await checkSpecificTimeSlot({
      date,
      time,
      timezone: timezone || "America/New_York",
      adminId,
    });

    return NextResponse.json({
      success: true,
      data: {
        date,
        time,
        timezone: timezone || "America/New_York",
        available: availabilityResult.available,
        reason: availabilityResult.reason,
        suggestedAlternatives: availabilityResult.alternatives || [],
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("❌ Time slot check API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check time slot availability",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Generate calendar availability for a specific month using CalendarService
 */
async function generateCalendarAvailability(
  params: CalendarRequest
): Promise<CalendarResponse> {
  const { month, year, timezone = "America/New_York", adminId } = params;

  // Get all existing bookings for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month

  const existingBookings = await bookingService.getAllBookings(
    {
      adminId,
      dateRange: { start: startDate, end: endDate },
    },
    1,
    1000
  ); // Get all bookings for the month

  // Use calendar service to format the data
  return calendarService.formatCalendarData(
    month,
    year,
    timezone,
    existingBookings.bookings
  );
}

/**
 * Check availability for a specific time slot using CalendarService
 */
async function checkSpecificTimeSlot(params: {
  date: string;
  time: string;
  adminId?: string;
  timezone?: string;
}): Promise<{ available: boolean; reason?: string; alternatives?: string[] }> {
  const { date, time, adminId, timezone = "America/New_York" } = params;

  // Use calendar service to validate the time slot
  const validationResult = calendarService.validateTimeSlot(
    date,
    time,
    timezone
  );
  if (!validationResult.valid) {
    return {
      available: false,
      reason: validationResult.reason,
    };
  }

  // Check if already booked
  const requestedDateTime = new Date(`${date}T${time}:00`);
  const existingBookings = await bookingService.getAllBookings(
    {
      adminId,
      dateRange: { start: requestedDateTime, end: requestedDateTime },
    },
    1,
    1000
  );

  const isBooked = existingBookings.bookings.some((booking) => {
    const bookingDate = new Date(booking.preferredDate);
    return (
      bookingDate.toDateString() === requestedDateTime.toDateString() &&
      booking.preferredTime === time &&
      ["pending", "confirmed"].includes(booking.status)
    );
  });

  if (isBooked) {
    // Generate alternative time slots using calendar service
    const alternativeSlots = calendarService.getSuggestedAlternatives(
      date,
      time,
      existingBookings.bookings
    );
    const alternatives = alternativeSlots.map(
      (slot) => `${slot.date} ${slot.time}`
    );
    return {
      available: false,
      reason: "Time slot already booked",
      alternatives,
    };
  }

  return { available: true };
}

/**
 * Get suggested alternative time slots
 */
function getSuggestedAlternatives(
  requestedDate: Date,
  requestedTime: string,
  count: number
): string[] {
  const alternatives: string[] = [];
  const [requestedHour, requestedMin] = requestedTime.split(":").map(Number);
  const currentDate = new Date(requestedDate);

  // Look for alternatives in the next 7 days
  for (
    let dayOffset = 0;
    dayOffset < 7 && alternatives.length < count;
    dayOffset++
  ) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() + dayOffset);

    // Skip weekends
    if (checkDate.getDay() === 0 || checkDate.getDay() === 6) {
      continue;
    }

    // Generate time slots around the requested time
    const timeSlots = [
      requestedTime,
      `${(requestedHour + 1).toString().padStart(2, "0")}:${requestedMin
        .toString()
        .padStart(2, "0")}`,
      `${(requestedHour - 1).toString().padStart(2, "0")}:${requestedMin
        .toString()
        .padStart(2, "0")}`,
      `${requestedHour.toString().padStart(2, "0")}:${(requestedMin + 30)
        .toString()
        .padStart(2, "0")}`,
    ].filter((time) => {
      const [hour] = time.split(":").map(Number);
      return hour >= 9 && hour < 17; // Business hours only
    });

    for (const timeSlot of timeSlots) {
      if (alternatives.length >= count) break;

      const alternativeDateTime =
        checkDate.toISOString().split("T")[0] + " " + timeSlot;
      if (dayOffset > 0 || timeSlot !== requestedTime) {
        alternatives.push(alternativeDateTime);
      }
    }
  }

  return alternatives;
}
