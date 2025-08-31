export interface BookingRequest {
  _id?: string;
  sessionId: string;
  customerRequest: string; // What the customer originally asked for (sanitized)
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  requestType: "demo" | "call" | "support" | "consultation";
  preferredDate: Date;
  preferredTime: string; // HH:MM format
  timezone: string;
  message?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  adminId?: string; // Optional for unassigned bookings
  pageUrl?: string;

  // Additional metadata for safety and tracking
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  originalMessage: string; // The exact message that triggered booking detection
  detectionConfidence: number; // 0-1 confidence score from AI detection

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;

  // Admin management
  adminNotes?: string;
  priority: "low" | "medium" | "high" | "urgent";

  // Email tracking
  confirmationSent?: boolean;
  reminderSent?: boolean;
}

export interface AdminAvailability {
  _id?: string;
  adminId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockedDate {
  _id?: string;
  adminId: string;
  blockedDate: Date;
  reason?: string;
  isAllDay: boolean;
  startTime?: string; // For partial day blocks
  endTime?: string;
  createdAt: Date;
}

export interface BookingDetectionResult {
  hasBookingRequest: boolean;
  requestType: "demo" | "call" | "support" | "consultation";
  confidence: number;
  extractedInfo: {
    preferredTimeframe?: string;
    urgency?: "low" | "medium" | "high";
  };
}
