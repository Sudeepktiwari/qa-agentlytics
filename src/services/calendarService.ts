/**
 * Calendar Service for booking system
 * Handles calendar availability, time slot management, and booking scheduling
 */

import { JavaScriptSafetyUtils } from "@/lib/javascriptSafety";

export interface CalendarConfig {
  businessHours: {
    start: string; // HH:MM
    end: string; // HH:MM
    timezone: string;
  };
  workingDays: number[]; // 0-6 (Sunday-Saturday), [1,2,3,4,5] for weekdays
  slotDuration: number; // Minutes
  bufferTime: number; // Minutes between slots
  advanceBookingDays: number; // How many days ahead can be booked
  maxBookingDays: number; // Maximum days in the future for booking
}

export interface TimeSlotAvailability {
  time: string;
  available: boolean;
  reason?: string;
  conflictingBookingId?: string;
}

export interface CalendarSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  datetime: Date;
  available: boolean;
  reason?: string;
}

export class CalendarService {
  private static instance: CalendarService;
  private config: CalendarConfig;

  private constructor() {
    // Default configuration - can be made admin-configurable
    this.config = {
      businessHours: {
        start: "09:00",
        end: "17:00",
        timezone: "America/New_York",
      },
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      slotDuration: 30, // 30-minute slots
      bufferTime: 0, // No buffer between slots
      advanceBookingDays: 1, // Can book starting tomorrow
      maxBookingDays: 30, // Can book up to 30 days ahead
    };
  }

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  /**
   * Generate available time slots for a date range
   */
  generateAvailableSlots(
    startDate: Date,
    endDate: Date,
    existingBookings: any[] = []
  ): CalendarSlot[] {
    const slots: CalendarSlot[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Skip non-working days
      if (!this.config.workingDays.includes(currentDate.getDay())) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Skip dates too far in advance
      const today = new Date();
      const diffDays = Math.ceil(
        (currentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (
        diffDays < this.config.advanceBookingDays ||
        diffDays > this.config.maxBookingDays
      ) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Generate time slots for this day
      const daySlots = this.generateDaySlots(currentDate, existingBookings);
      slots.push(...daySlots);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  /**
   * Generate time slots for a specific day
   */
  private generateDaySlots(
    date: Date,
    existingBookings: any[]
  ): CalendarSlot[] {
    const slots: CalendarSlot[] = [];
    const dateString = date.toISOString().split("T")[0];

    // Parse business hours
    const [startHour, startMin] = this.config.businessHours.start
      .split(":")
      .map(Number);
    const [endHour, endMin] = this.config.businessHours.end
      .split(":")
      .map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + this.config.slotDuration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;

      const slotDateTime = new Date(date);
      slotDateTime.setHours(hours, minutes, 0, 0);

      // Check availability
      const availability = this.checkSlotAvailability(
        dateString,
        timeString,
        slotDateTime,
        existingBookings
      );

      slots.push({
        date: dateString,
        time: timeString,
        datetime: slotDateTime,
        available: availability.available,
        reason: availability.reason,
      });

      currentMinutes += this.config.slotDuration + this.config.bufferTime;
    }

    return slots;
  }

  /**
   * Check if a specific time slot is available
   */
  private checkSlotAvailability(
    date: string,
    time: string,
    datetime: Date,
    existingBookings: any[]
  ): { available: boolean; reason?: string } {
    // Check if slot is in the past
    const now = new Date();
    if (datetime <= now) {
      return { available: false, reason: "Time slot is in the past" };
    }

    // Check for existing bookings
    const conflictingBooking = existingBookings.find((booking) => {
      const bookingDate = new Date(booking.preferredDate)
        .toISOString()
        .split("T")[0];
      return (
        bookingDate === date &&
        booking.preferredTime === time &&
        ["pending", "confirmed"].includes(booking.status)
      );
    });

    if (conflictingBooking) {
      return {
        available: false,
        reason: "Time slot is already booked",
      };
    }

    return { available: true };
  }

  /**
   * Find next available slots
   */
  findNextAvailableSlots(
    fromDate: Date,
    count: number = 5,
    existingBookings: any[] = []
  ): CalendarSlot[] {
    const endDate = new Date(fromDate);
    endDate.setDate(endDate.getDate() + this.config.maxBookingDays);

    const allSlots = this.generateAvailableSlots(
      fromDate,
      endDate,
      existingBookings
    );
    const availableSlots = allSlots.filter((slot) => slot.available);

    return availableSlots.slice(0, count);
  }

  /**
   * Get business days in a date range
   */
  getBusinessDaysInRange(startDate: Date, endDate: Date): Date[] {
    const businessDays: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (this.config.workingDays.includes(currentDate.getDay())) {
        businessDays.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return businessDays;
  }

  /**
   * Format calendar data for API response
   */
  formatCalendarData(
    month: number,
    year: number,
    timezone: string,
    existingBookings: any[] = []
  ) {
    // Get all days in the month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const slots = this.generateAvailableSlots(
      firstDay,
      lastDay,
      existingBookings
    );

    // Group slots by date
    const slotsByDate: { [date: string]: CalendarSlot[] } = {};
    slots.forEach((slot) => {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = [];
      }
      slotsByDate[slot.date].push(slot);
    });

    // Generate calendar days
    const days = [];
    const currentDate = new Date(firstDay);

    while (currentDate <= lastDay) {
      const dateString = currentDate.toISOString().split("T")[0];
      const daySlots = slotsByDate[dateString] || [];
      const availableSlots = daySlots.filter((slot) => slot.available);

      // Check if day is blocked
      const isWeekend = !this.config.workingDays.includes(currentDate.getDay());
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPast = currentDate < today;

      days.push({
        date: dateString,
        dayOfWeek: currentDate.getDay(),
        available: availableSlots.length > 0,
        timeSlots: daySlots.map((slot) => ({
          time: slot.time,
          available: slot.available,
          reason: slot.reason,
        })),
        isBlocked: isWeekend || isPast,
        blockReason: isPast ? "Past date" : isWeekend ? "Weekend" : undefined,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      month,
      year,
      timezone,
      days,
      businessHours: {
        start: this.config.businessHours.start,
        end: this.config.businessHours.end,
        timeZone: this.config.businessHours.timezone,
      },
      availableSlots: slots.filter((slot) => slot.available).length,
    };
  }

  /**
   * Validate time slot format and business rules
   */
  validateTimeSlot(
    date: string,
    time: string,
    timezone: string
  ): { valid: boolean; reason?: string } {
    try {
      // Sanitize inputs
      const sanitizedDate = JavaScriptSafetyUtils.sanitizeString(date);
      const sanitizedTime = JavaScriptSafetyUtils.sanitizeString(time);
      const sanitizedTimezone = JavaScriptSafetyUtils.sanitizeString(timezone);

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(sanitizedDate)) {
        return { valid: false, reason: "Invalid date format. Use YYYY-MM-DD" };
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(sanitizedTime)) {
        return { valid: false, reason: "Invalid time format. Use HH:MM" };
      }

      // Parse and validate date
      const slotDate = new Date(sanitizedDate + "T" + sanitizedTime + ":00");
      if (isNaN(slotDate.getTime())) {
        return { valid: false, reason: "Invalid date or time" };
      }

      // Check if date is in the past
      const now = new Date();
      if (slotDate <= now) {
        return { valid: false, reason: "Time slot cannot be in the past" };
      }

      // Check working days
      if (!this.config.workingDays.includes(slotDate.getDay())) {
        return { valid: false, reason: "Selected day is not a working day" };
      }

      // Check business hours
      const [hour, minute] = sanitizedTime.split(":").map(Number);
      const [startHour, startMin] = this.config.businessHours.start
        .split(":")
        .map(Number);
      const [endHour, endMin] = this.config.businessHours.end
        .split(":")
        .map(Number);

      const slotMinutes = hour * 60 + minute;
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (slotMinutes < startMinutes || slotMinutes >= endMinutes) {
        return {
          valid: false,
          reason: `Time must be between ${this.config.businessHours.start} and ${this.config.businessHours.end}`,
        };
      }

      // Check advance booking rules
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil(
        (slotDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays < this.config.advanceBookingDays) {
        return {
          valid: false,
          reason: `Bookings must be made at least ${this.config.advanceBookingDays} day(s) in advance`,
        };
      }

      if (diffDays > this.config.maxBookingDays) {
        return {
          valid: false,
          reason: `Bookings cannot be made more than ${this.config.maxBookingDays} days in advance`,
        };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: "Error validating time slot" };
    }
  }

  /**
   * Get configuration (for admin interface)
   */
  getConfig(): CalendarConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (for admin interface)
   */
  updateConfig(newConfig: Partial<CalendarConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get suggested alternative time slots
   */
  getSuggestedAlternatives(
    requestedDate: string,
    requestedTime: string,
    existingBookings: any[] = [],
    count: number = 3
  ): CalendarSlot[] {
    const requestedDateTime = new Date(
      requestedDate + "T" + requestedTime + ":00"
    );

    // Look for alternatives starting from the requested date
    const searchEndDate = new Date(requestedDateTime);
    searchEndDate.setDate(searchEndDate.getDate() + 7); // Look 7 days ahead

    const availableSlots = this.generateAvailableSlots(
      requestedDateTime,
      searchEndDate,
      existingBookings
    ).filter((slot) => slot.available);

    // Sort by proximity to requested time
    const [requestedHour, requestedMin] = requestedTime.split(":").map(Number);
    const requestedTotalMinutes = requestedHour * 60 + requestedMin;

    availableSlots.sort((a, b) => {
      const [aHour, aMin] = a.time.split(":").map(Number);
      const [bHour, bMin] = b.time.split(":").map(Number);

      const aTotalMinutes = aHour * 60 + aMin;
      const bTotalMinutes = bHour * 60 + bMin;

      const aTimeDiff = Math.abs(aTotalMinutes - requestedTotalMinutes);
      const bTimeDiff = Math.abs(bTotalMinutes - requestedTotalMinutes);

      // If same time difference, prefer earlier date
      if (aTimeDiff === bTimeDiff) {
        return a.datetime.getTime() - b.datetime.getTime();
      }

      return aTimeDiff - bTimeDiff;
    });

    return availableSlots.slice(0, count);
  }
}

// Export singleton instance
export const calendarService = CalendarService.getInstance();
