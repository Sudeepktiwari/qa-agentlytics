import { getBookingsCollection, getAdminAvailabilityCollection, getBlockedDatesCollection } from '@/lib/mongo';
import { BookingRequest, AdminAvailability, BlockedDate } from '@/types/booking';
import { ObjectId } from 'mongodb';

export class BookingService {
  
  // Create a new booking request
  async createBooking(bookingData: Omit<BookingRequest, '_id' | 'createdAt' | 'updatedAt'>): Promise<BookingRequest> {
    try {
      const collection = await getBookingsCollection();
      
      const booking: Omit<BookingRequest, '_id'> = {
        ...bookingData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
        confirmationSent: false,
        reminderSent: false,
        priority: bookingData.priority || 'medium'
      };

      const result = await collection.insertOne(booking);
      
      const createdBooking = {
        ...booking,
        _id: result.insertedId.toString()
      };
      
      console.log('✅ Booking created:', createdBooking._id);
      return createdBooking;
      
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  // Get bookings for an admin with optional filters
  async getBookingsByAdmin(adminId: string, filters?: {
    status?: string;
    requestType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    skip?: number;
  }): Promise<BookingRequest[]> {
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

      const cursor = collection
        .find(query)
        .sort({ createdAt: -1 });
        
      if (filters?.limit) cursor.limit(filters.limit);
      if (filters?.skip) cursor.skip(filters.skip);

      const bookings = await cursor.toArray();
      
      return bookings.map(booking => ({
        ...booking,
        _id: booking._id.toString()
      })) as BookingRequest[];
      
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId: string, status: BookingRequest['status'], adminNotes?: string): Promise<boolean> {
    try {
      const collection = await getBookingsCollection();
      
      const updateData: any = {
        status,
        updatedAt: new Date()
      };
      
      if (adminNotes) updateData.adminNotes = adminNotes;

      const result = await collection.updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: updateData }
      );

      console.log(`✅ Booking ${bookingId} status updated to ${status}`);
      return result.modifiedCount > 0;
      
    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      throw new Error('Failed to update booking status');
    }
  }

  // Get a specific booking by ID
  async getBookingById(bookingId: string): Promise<BookingRequest | null> {
    try {
      const collection = await getBookingsCollection();
      const booking = await collection.findOne({ _id: new ObjectId(bookingId) });
      
      if (!booking) return null;
      
      return {
        ...booking,
        _id: booking._id.toString()
      } as BookingRequest;
      
    } catch (error) {
      console.error('❌ Error fetching booking:', error);
      throw new Error('Failed to fetch booking');
    }
  }

  // Check if a time slot is available
  async isTimeSlotAvailable(adminId: string, date: Date, time: string): Promise<boolean> {
    try {
      const collection = await getBookingsCollection();
      
      // Check if there's an existing booking at this time
      const existingBooking = await collection.findOne({
        adminId,
        preferredDate: date,
        preferredTime: time,
        status: { $in: ['pending', 'confirmed'] }
      });

      return !existingBooking;
      
    } catch (error) {
      console.error('❌ Error checking time slot availability:', error);
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
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const [
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        thisWeek,
        thisMonth
      ] = await Promise.all([
        collection.countDocuments({ adminId }),
        collection.countDocuments({ adminId, status: 'pending' }),
        collection.countDocuments({ adminId, status: 'confirmed' }),
        collection.countDocuments({ adminId, status: 'completed' }),
        collection.countDocuments({ adminId, status: 'cancelled' }),
        collection.countDocuments({ adminId, createdAt: { $gte: weekStart } }),
        collection.countDocuments({ adminId, createdAt: { $gte: monthStart } })
      ]);
      
      return {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        thisWeek,
        thisMonth
      };
      
    } catch (error) {
      console.error('❌ Error fetching booking stats:', error);
      throw new Error('Failed to fetch booking statistics');
    }
  }

  // Utility function to convert time string to minutes
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Utility function to convert minutes to time string
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
