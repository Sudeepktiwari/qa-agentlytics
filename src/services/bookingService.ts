import {
  getBookingsCollection,
  getAdminAvailabilityCollection,
  getBlockedDatesCollection,
} from "@/lib/mongo";
import {
  BookingRequest,
  AdminAvailability,
  BlockedDate,
} from "@/types/booking";
import { ObjectId } from "mongodb";
import { JavaScriptSafetyUtils } from "@/lib/javascriptSafety";

export interface CreateBookingParams {
  sessionId: string;
  customerRequest: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  requestType: "demo" | "call" | "support" | "consultation";
  preferredDate: Date;
  preferredTime: string;
  timezone: string;
  message?: string;
  pageUrl?: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  originalMessage: string;
  detectionConfidence: number;

  // New fields for enhanced booking
  confirmationNumber?: string;
  status?: BookingRequest["status"];
  priority?: BookingRequest["priority"];
  adminId?: string;
  source?: string;
  requirements?: string;
  interests?: string[];
  teamSize?: string;
  timeline?: string;
  role?: string;
  duration?: number;
}

export interface BookingFilters {
  status?: BookingRequest["status"];
  requestType?: BookingRequest["requestType"];
  priority?: BookingRequest["priority"];
  adminId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

export class BookingService {
  private static instance: BookingService;

  constructor() {
    // No need for instance variable since all safety methods are static
  }

  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }
  /**
   * Create a new booking with safety validation
   */
  async createBookingFromDetection(
    params: CreateBookingParams,
  ): Promise<BookingRequest> {
    try {
      // Sanitize all user inputs for safety
      const sanitizedBooking: Omit<BookingRequest, "_id"> = {
        sessionId: JavaScriptSafetyUtils.sanitizeString(params.sessionId),
        customerRequest: JavaScriptSafetyUtils.sanitizeString(
          params.customerRequest,
        ),
        email: JavaScriptSafetyUtils.sanitizeString(
          params.email.toLowerCase().trim(),
        ),
        name: params.name
          ? JavaScriptSafetyUtils.sanitizeString(params.name)
          : undefined,
        phone: params.phone
          ? JavaScriptSafetyUtils.sanitizeString(params.phone)
          : undefined,
        company: params.company
          ? JavaScriptSafetyUtils.sanitizeString(params.company)
          : undefined,
        requestType: params.requestType,
        preferredDate: new Date(params.preferredDate),
        preferredTime: JavaScriptSafetyUtils.sanitizeString(
          params.preferredTime,
        ),
        timezone: JavaScriptSafetyUtils.sanitizeString(params.timezone),
        message: params.message
          ? JavaScriptSafetyUtils.sanitizeString(params.message)
          : undefined,
        status: "pending",
        pageUrl: params.pageUrl
          ? JavaScriptSafetyUtils.sanitizeString(params.pageUrl)
          : undefined,
        userAgent: params.userAgent
          ? JavaScriptSafetyUtils.sanitizeString(params.userAgent)
          : undefined,
        ipAddress: params.ipAddress
          ? JavaScriptSafetyUtils.sanitizeString(params.ipAddress)
          : undefined,
        referrer: params.referrer
          ? JavaScriptSafetyUtils.sanitizeString(params.referrer)
          : undefined,
        originalMessage: JavaScriptSafetyUtils.sanitizeString(
          params.originalMessage,
        ),
        detectionConfidence: Math.max(
          0,
          Math.min(1, params.detectionConfidence),
        ),
        priority: "medium",
        confirmationSent: false,
        reminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedBooking.email)) {
        throw new Error("Invalid email format");
      }

      // Validate preferred time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(sanitizedBooking.preferredTime)) {
        throw new Error("Invalid time format. Use HH:MM format");
      }

      // Validate preferred date is in the future
      if (sanitizedBooking.preferredDate <= new Date()) {
        throw new Error("Preferred date must be in the future");
      }

      const collection = await getBookingsCollection();
      const result = await collection.insertOne(sanitizedBooking);

      // console.log removed
      return {
        ...sanitizedBooking,
        _id: result.insertedId.toString(),
      };
    } catch (error) {
      // console.error removed
      throw error instanceof Error
        ? error
        : new Error("Failed to create booking");
    }
  }

  // Create a new booking request
  async createBooking(
    bookingData: Omit<BookingRequest, "_id" | "createdAt" | "updatedAt">,
  ): Promise<BookingRequest> {
    try {
      const collection = await getBookingsCollection();

      // Sanitize string inputs for safety
      const sanitizedData = {
        ...bookingData,
        customerRequest: JavaScriptSafetyUtils.sanitizeString(
          bookingData.customerRequest || "",
        ),
        email: JavaScriptSafetyUtils.sanitizeString(
          bookingData.email.toLowerCase().trim(),
        ),
        name: bookingData.name
          ? JavaScriptSafetyUtils.sanitizeString(bookingData.name)
          : undefined,
        phone: bookingData.phone
          ? JavaScriptSafetyUtils.sanitizeString(bookingData.phone)
          : undefined,
        company: bookingData.company
          ? JavaScriptSafetyUtils.sanitizeString(bookingData.company)
          : undefined,
        message: bookingData.message
          ? JavaScriptSafetyUtils.sanitizeString(bookingData.message)
          : undefined,
        originalMessage: JavaScriptSafetyUtils.sanitizeString(
          bookingData.originalMessage || "",
        ),
        adminNotes: bookingData.adminNotes
          ? JavaScriptSafetyUtils.sanitizeString(bookingData.adminNotes)
          : undefined,
      };

      const booking: Omit<BookingRequest, "_id"> = {
        ...sanitizedData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: bookingData.status || "pending",
        confirmationSent: false,
        reminderSent: false,
        priority: bookingData.priority || "medium",
        confirmationNumber: bookingData.confirmationNumber,
      };

      const result = await collection.insertOne(booking);

      const createdBooking = {
        ...booking,
        _id: result.insertedId.toString(),
      };

      // console.log removed
      return createdBooking;
    } catch (error) {
      // console.error removed
      throw new Error("Failed to create booking");
    }
  }

  /**
   * Get all bookings with filtering for admin interface
   */
  async getAllBookings(
    filters: BookingFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<{ bookings: BookingRequest[]; total: number; hasMore: boolean }> {
    try {
      const collection = await getBookingsCollection();
      const query: any = {};

      // Build filter query
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.requestType) {
        query.requestType = filters.requestType;
      }
      if (filters.priority) {
        query.priority = filters.priority;
      }
      if (filters.adminId) {
        query.adminId = filters.adminId;
      }
      if (filters.dateRange) {
        query.preferredDate = {
          $gte: filters.dateRange.start,
          $lte: filters.dateRange.end,
        };
      }
      if (filters.searchTerm) {
        const searchRegex = new RegExp(
          JavaScriptSafetyUtils.sanitizeString(filters.searchTerm),
          "i",
        );
        query.$or = [
          { customerRequest: searchRegex },
          { email: searchRegex },
          { name: searchRegex },
          { company: searchRegex },
          { message: searchRegex },
        ];
      }

      // Get total count
      const total = await collection.countDocuments(query);

      // Get paginated results
      const bookings = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const transformedBookings = bookings.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      })) as BookingRequest[];

      return {
        bookings: transformedBookings,
        total,
        hasMore: page * limit < total,
      };
    } catch (error) {
      // console.error removed
      throw error instanceof Error
        ? error
        : new Error("Failed to get bookings");
    }
  }

  /**
   * Get dashboard statistics for admin
   */
  async getDashboardStats(adminId?: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    highPriority: number;
    recentBookings: BookingRequest[];
  }> {
    try {
      const collection = await getBookingsCollection();

      // Create base filter for admin isolation
      const baseFilter = adminId ? { adminId } : {};

      const [stats, recentBookings] = await Promise.all([
        collection
          .aggregate([
            { $match: baseFilter }, // Filter by adminId if provided
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                pending: {
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                },
                confirmed: {
                  $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
                },
                completed: {
                  $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                },
                cancelled: {
                  $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
                },
                highPriority: {
                  $sum: {
                    $cond: [{ $in: ["$priority", ["high", "urgent"]] }, 1, 0],
                  },
                },
              },
            },
          ])
          .toArray(),
        collection.find(baseFilter).sort({ createdAt: -1 }).limit(5).toArray(),
      ]);

      const dashboardStats = stats[0] || {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        highPriority: 0,
      };

      const transformedRecentBookings = recentBookings.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      })) as BookingRequest[];

      return {
        total: dashboardStats.total,
        pending: dashboardStats.pending,
        confirmed: dashboardStats.confirmed,
        completed: dashboardStats.completed,
        cancelled: dashboardStats.cancelled,
        highPriority: dashboardStats.highPriority,
        recentBookings: transformedRecentBookings,
      };
    } catch (error) {
      // console.error removed
      throw error instanceof Error
        ? error
        : new Error("Failed to get dashboard stats");
    }
  }

  /**
   * Update booking with admin notes and status
   */
  async updateBookingWithAdminNotes(
    bookingId: string,
    updates: {
      status?: BookingRequest["status"];
      priority?: BookingRequest["priority"];
      adminNotes?: string;
      adminId?: string;
    },
  ): Promise<BookingRequest | null> {
    try {
      const collection = await getBookingsCollection();

      const sanitizedUpdates: any = {
        updatedAt: new Date(),
      };

      if (updates.status) {
        sanitizedUpdates.status = updates.status;
        if (updates.status === "confirmed") {
          sanitizedUpdates.confirmedAt = new Date();
        }
      }

      if (updates.priority) {
        sanitizedUpdates.priority = updates.priority;
      }

      if (updates.adminNotes) {
        sanitizedUpdates.adminNotes = JavaScriptSafetyUtils.sanitizeString(
          updates.adminNotes,
        );
      }

      if (updates.adminId) {
        sanitizedUpdates.adminId = JavaScriptSafetyUtils.sanitizeString(
          updates.adminId,
        );
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(bookingId) },
        { $set: sanitizedUpdates },
        { returnDocument: "after" },
      );

      if (!result) {
        return null;
      }

      // console.log removed
      return {
        ...result,
        _id: result._id.toString(),
      } as BookingRequest;
    } catch (error) {
      // console.error removed
      throw error instanceof Error
        ? error
        : new Error("Failed to update booking");
    }
  }

  /**
   * Bulk update booking statuses
   */
  async bulkUpdateStatus(
    bookingIds: string[],
    status: BookingRequest["status"],
  ): Promise<number> {
    try {
      const collection = await getBookingsCollection();
      const objectIds = bookingIds.map((id) => new ObjectId(id));

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (status === "confirmed") {
        updateData.confirmedAt = new Date();
      }

      const result = await collection.updateMany(
        { _id: { $in: objectIds } },
        { $set: updateData },
      );

      // console.log removed
      return result.modifiedCount;
    } catch (error) {
      // console.error removed
      throw error instanceof Error
        ? error
        : new Error("Failed to bulk update bookings");
    }
  }

  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<boolean> {
    try {
      const collection = await getBookingsCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      // console.log removed
      return result.deletedCount > 0;
    } catch (error) {
      // console.error removed
      throw error instanceof Error
        ? error
        : new Error("Failed to delete booking");
    }
  }

  // Get bookings for an admin with optional filters
  async getBookingsByAdmin(
    adminId: string,
    filters?: {
      status?: string;
      requestType?: string;
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      skip?: number;
    },
  ): Promise<BookingRequest[]> {
    try {
      const collection = await getBookingsCollection();

      const query: any = { adminId };

      if (filters) {
        if (filters.status) query.status = filters.status;
        if (filters.requestType) query.requestType = filters.requestType;
        if (filters.dateFrom || filters.dateTo) {
          query.preferredDate = {};
          if (filters.dateFrom) query.preferredDate.$gte = filters.dateFrom;
          if (filters.dateTo) query.preferredDate.$lte = filters.dateTo;
        }
      }

      const cursor = collection.find(query).sort({ createdAt: -1 });

      if (filters?.limit) cursor.limit(filters.limit);
      if (filters?.skip) cursor.skip(filters.skip);

      const bookings = await cursor.toArray();

      return bookings.map((booking) => ({
        ...booking,
        _id: booking._id.toString(),
      })) as BookingRequest[];
    } catch (error) {
      // console.error removed
      throw new Error("Failed to fetch bookings");
    }
  }

  // Update booking status
  async updateBookingStatus(
    bookingId: string,
    status: BookingRequest["status"],
    adminNotes?: string,
  ): Promise<boolean> {
    try {
      const collection = await getBookingsCollection();

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (adminNotes) updateData.adminNotes = adminNotes;

      const result = await collection.updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: updateData },
      );

      // console.log removed
      return result.modifiedCount > 0;
    } catch (error) {
      // console.error removed
      throw new Error("Failed to update booking status");
    }
  }

  // Get a specific booking by ID
  async getBookingById(
    bookingId: string,
    adminId?: string,
  ): Promise<BookingRequest | null> {
    try {
      const collection = await getBookingsCollection();

      const query: any = { _id: new ObjectId(bookingId) };

      // If adminId is provided, ensure the booking belongs to that admin
      if (adminId) {
        query.adminId = adminId;
      }

      const booking = await collection.findOne(query);

      if (!booking) return null;

      return {
        ...booking,
        _id: booking._id.toString(),
      } as BookingRequest;
    } catch (error) {
      // console.error removed
      throw new Error("Failed to fetch booking");
    }
  }

  // Reschedule a booking to a new date/time if available
  async rescheduleBooking(
    bookingId: string,
    adminId: string | undefined,
    newDate: Date,
    newTime: string,
  ): Promise<BookingRequest | null> {
    try {
      const collection = await getBookingsCollection();

      // Verify booking exists and (if provided) belongs to adminId
      const current = await this.getBookingById(bookingId, adminId);
      if (!current) return null;

      // Prevent rescheduling cancelled/completed
      if (["cancelled", "completed"].includes(current.status)) {
        throw new Error("Cannot reschedule a cancelled or completed booking");
      }

      // Check if new slot is available
      const isAvailable = await this.isTimeSlotAvailable(
        current.adminId || (adminId as string),
        newDate,
        newTime,
      );
      if (!isAvailable) {
        throw new Error("Selected time slot is not available");
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            preferredDate: newDate,
            preferredTime: newTime,
            updatedAt: new Date(),
            status: "confirmed",
          },
        },
        { returnDocument: "after" },
      );

      if (!result) return null;

      return {
        ...result,
        _id: result._id.toString(),
      } as BookingRequest;
    } catch (error) {
      // console.error removed
      throw error instanceof Error
        ? error
        : new Error("Failed to reschedule booking");
    }
  }

  // Cancel a booking (soft cancel by setting status)
  async cancelBooking(bookingId: string, adminId?: string): Promise<boolean> {
    try {
      const collection = await getBookingsCollection();
      const filter: any = { _id: new ObjectId(bookingId) };
      if (adminId) filter.adminId = adminId;

      const result = await collection.updateOne(filter, {
        $set: { status: "cancelled", updatedAt: new Date() },
      });

      return result.modifiedCount > 0;
    } catch (error) {
      // console.error removed
      throw new Error("Failed to cancel booking");
    }
  }

  // Check if a time slot is available
  async isTimeSlotAvailable(
    adminId: string,
    date: Date,
    time: string,
  ): Promise<boolean> {
    try {
      const collection = await getBookingsCollection();

      // Check if there's an existing booking at this time
      const existingBooking = await collection.findOne({
        adminId,
        preferredDate: date,
        preferredTime: time,
        status: { $in: ["pending", "confirmed"] },
      });

      return !existingBooking;
    } catch (error) {
      // console.error removed
      return false;
    }
  }

  // Get booking statistics for admin dashboard
  async getBookingStats(adminId: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    try {
      const collection = await getBookingsCollection();

      const now = new Date();
      const weekStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay(),
      );
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        thisWeek,
        thisMonth,
      ] = await Promise.all([
        collection.countDocuments({ adminId }),
        collection.countDocuments({ adminId, status: "pending" }),
        collection.countDocuments({ adminId, status: "confirmed" }),
        collection.countDocuments({ adminId, status: "completed" }),
        collection.countDocuments({ adminId, status: "cancelled" }),
        collection.countDocuments({ adminId, createdAt: { $gte: weekStart } }),
        collection.countDocuments({ adminId, createdAt: { $gte: monthStart } }),
      ]);

      return {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        thisWeek,
        thisMonth,
      };
    } catch (error) {
      // console.error removed
      throw new Error("Failed to fetch booking statistics");
    }
  }

  /**
   * Check for existing bookings by email address
   * Returns active bookings (pending or confirmed status)
   */
  async getExistingBookingsByEmail(email: string): Promise<{
    hasActiveBooking: boolean;
    activeBookings: BookingRequest[];
    latestBooking?: BookingRequest;
  }> {
    try {
      const collection = await getBookingsCollection();

      // Sanitize email input
      const sanitizedEmail = JavaScriptSafetyUtils.sanitizeString(
        email.toLowerCase().trim(),
      );

      // Find bookings with pending or confirmed status
      const activeBookings = await collection
        .find({
          email: sanitizedEmail,
          status: { $in: ["pending", "confirmed"] },
        })
        .sort({ createdAt: -1 })
        .toArray();

      const bookingsWithId: BookingRequest[] = activeBookings.map(
        (booking) => ({
          ...booking,
          _id: booking._id.toString(),
        }),
      ) as BookingRequest[];

      return {
        hasActiveBooking: bookingsWithId.length > 0,
        activeBookings: bookingsWithId,
        latestBooking: bookingsWithId[0] || undefined,
      };
    } catch (error) {
      // console.error removed
      return {
        hasActiveBooking: false,
        activeBookings: [],
        latestBooking: undefined,
      };
    }
  }

  // Utility function to convert time string to minutes
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // Utility function to convert minutes to time string
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  }
}

// Export singleton instance
export const bookingService = BookingService.getInstance();
