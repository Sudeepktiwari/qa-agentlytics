export interface BookingRequest {
  _id?: string;
  sessionId: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  requestType: 'demo' | 'call' | 'support' | 'consultation';
  preferredDate: Date;
  preferredTime: string; // HH:MM format
  timezone: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  adminId: string;
  pageUrl?: string;
  
  // Additional metadata
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Admin management
  adminNotes?: string;
  priority?: 'low' | 'medium' | 'high';
  
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
  requestType: 'demo' | 'call' | 'support' | 'consultation';
  confidence: number;
  extractedInfo: {
    preferredTimeframe?: string;
    urgency?: 'low' | 'medium' | 'high';
  };
}
