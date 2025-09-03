"use client";

import React, { useState, useEffect } from 'react';
import { BookingRequest } from '@/types/booking';
import { formatDateTime } from '@/utils/dateUtils';
import { getAuthHeaders, getCurrentAdminId } from "@/lib/auth-client";

interface DashboardStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  highPriority: number;
  recentBookings: BookingRequest[];
}

interface BookingFilters {
  status?: string;
  requestType?: string;
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

interface BookingManagementSectionProps {
  adminId?: string;
}

const BookingManagementSection: React.FC<BookingManagementSectionProps> = ({
  adminId,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [filters, setFilters] = useState<BookingFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch dashboard statistics
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Fetch bookings when filters change
  useEffect(() => {
    fetchBookings();
  }, [filters, currentPage]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStats(data.data);
      } else {
        console.error("Dashboard stats error:", data.error);
        
        // If authentication failed, clear token
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
        }
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const currentAdminId = getCurrentAdminId();
      if (!currentAdminId) {
        setError("Authentication required. Please log in again.");
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10", // Smaller limit for admin panel
        ...filters,
      });

      const response = await fetch(`/api/admin/bookings?${params}`, {
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        setBookings(data.data.bookings);
        setTotalPages(data.pagination.totalPages);
        setError(null); // Clear any previous errors
      } else {
        setError(data.error || "Failed to fetch bookings");
        
        // If authentication failed, clear token and redirect
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          setError("Session expired. Please log in again.");
        }
      }
    } catch (err) {
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: string,
    adminNotes?: string
  ) => {
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bookingId,
          updates: { status, adminNotes },
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchBookings();
        fetchDashboardStats();
      } else {
        setError(data.error || "Failed to update booking");
        
        // If authentication failed, clear token
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          setError("Session expired. Please log in again.");
        }
      }
    } catch (err) {
      setError("Failed to update booking");
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedBookings.length === 0) return;

    try {
      const response = await fetch("/api/admin/bulk-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateStatus",
          bookingIds: selectedBookings,
          updates: { status },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedBookings([]);
        fetchBookings();
        fetchDashboardStats();
      } else {
        setError(data.error || "Failed to bulk update");
      }
    } catch (err) {
      setError("Failed to bulk update");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Booking Management
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Dashboard Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-800">
                {stats.total}
              </div>
              <div className="text-sm text-blue-600">Total</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-800">
                {stats.pending}
              </div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-800">
                {stats.confirmed}
              </div>
              <div className="text-sm text-green-600">Confirmed</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-800">
                {stats.completed}
              </div>
              <div className="text-sm text-blue-600">Completed</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-800">
                {stats.cancelled}
              </div>
              <div className="text-sm text-red-600">Cancelled</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-800">
                {stats.highPriority}
              </div>
              <div className="text-sm text-orange-600">High Priority</div>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: e.target.value || undefined,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Type
                </label>
                <select
                  value={filters.requestType || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      requestType: e.target.value || undefined,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="demo">Demo</option>
                  <option value="call">Call</option>
                  <option value="support">Support</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={filters.priority || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priority: e.target.value || undefined,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      search: e.target.value || undefined,
                    })
                  }
                  placeholder="Search..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">{error}</div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedBookings.length} booking(s) selected
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => bulkUpdateStatus("confirmed")}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Confirm
                </button>
                <button
                  onClick={() => bulkUpdateStatus("completed")}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Complete
                </button>
                <button
                  onClick={() => bulkUpdateStatus("cancelled")}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Bookings
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading bookings...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bookings found with current filters.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking._id!)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBookings([
                                ...selectedBookings,
                                booking._id!,
                              ]);
                            } else {
                              setSelectedBookings(
                                selectedBookings.filter(
                                  (id) => id !== booking._id
                                )
                              );
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {booking.name || "N/A"}
                            </h4>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                                booking.priority
                              )}`}
                            >
                              {booking.priority}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              {booking.requestType}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 mb-2">
                            <div>
                              <strong>Customer Request:</strong>{" "}
                              {booking.customerRequest || "N/A"}
                            </div>
                            <div>
                              <strong>Email:</strong> {booking.email}
                            </div>
                            {booking.company && (
                              <div>
                                <strong>Company:</strong> {booking.company}
                              </div>
                            )}
                            <div>
                              <strong>Date & Time:</strong>{" "}
                              {new Date(
                                booking.preferredDate
                              ).toLocaleDateString()}{" "}
                              at {booking.preferredTime} ({booking.timezone})
                            </div>
                          </div>

                          {booking.originalMessage && (
                            <div className="text-xs text-gray-500 bg-gray-100 rounded p-2 mb-2">
                              <strong>Original Message:</strong>{" "}
                              {booking.originalMessage}
                            </div>
                          )}

                          {booking.adminNotes && (
                            <div className="text-xs text-gray-600 bg-blue-50 rounded p-2">
                              <strong>Admin Notes:</strong> {booking.adminNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id!, "confirmed")
                          }
                          className="text-green-600 hover:text-green-900 text-sm px-2 py-1 rounded border border-green-200 hover:bg-green-50"
                          disabled={booking.status === "confirmed"}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id!, "completed")
                          }
                          className="text-blue-600 hover:text-blue-900 text-sm px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                          disabled={booking.status === "completed"}
                        >
                          Complete
                        </button>
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id!, "cancelled")
                          }
                          className="text-red-600 hover:text-red-900 text-sm px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                          disabled={booking.status === "cancelled"}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingManagementSection;
