"use client";

import React, { useState, useEffect, useCallback } from "react";

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

interface CalendarDay {
  date: string;
  dayOfWeek: number;
  available: boolean;
  timeSlots: TimeSlot[];
  isBlocked?: boolean;
  blockReason?: string;
}

interface CalendarData {
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

interface BookingCalendarProps {
  bookingType?: "demo" | "call" | "support" | "consultation";
  timezone?: string;
  adminId?: string;
  onTimeSelect?: (date: string, time: string) => void;
  selectedDateTime?: { date: string; time: string } | null;
  className?: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookingType = "demo",
  timezone = "America/New_York",
  adminId,
  onTimeSelect,
  selectedDateTime,
  className = "",
}) => {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch calendar data
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        month: currentMonth.toString(),
        year: currentYear.toString(),
        timezone,
        bookingType,
      });

      if (adminId) {
        params.append("adminId", adminId);
      }

      const response = await fetch(`/api/calendar/availability?${params}`);
      const data = await response.json();

      if (data.success) {
        setCalendarData(data.data);
      } else {
        setError(data.error || "Failed to fetch calendar data");
      }
    } catch (err) {
      setError("Failed to load calendar");
      console.error("Calendar fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear, timezone, bookingType, adminId]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "next") {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
    setSelectedDate(null);
    setShowTimeSlots(false);
  };

  const handleDateClick = (day: CalendarDay) => {
    if (!day.available || day.isBlocked) return;

    setSelectedDate(day.date);
    setShowTimeSlots(true);
  };

  const handleTimeClick = (date: string, time: string) => {
    if (onTimeSelect) {
      onTimeSelect(date, time);
    }
  };

  const getSelectedDay = (): CalendarDay | null => {
    if (!selectedDate || !calendarData) return null;
    return calendarData.days.find((day) => day.date === selectedDate) || null;
  };

  const isToday = (dateString: string): boolean => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;
    return dateString === today;
  };

  const isSelected = (dateString: string): boolean => {
    return selectedDateTime?.date === dateString;
  };

  const isTimeSelected = (time: string): boolean => {
    return (
      selectedDateTime?.time === time && selectedDateTime?.date === selectedDate
    );
  };

  if (loading) {
    return (
      <div className={`booking-calendar ${className}`}>
        <div className="calendar-loading">
          <div className="loading-spinner"></div>
          <span>Loading calendar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`booking-calendar ${className}`}>
        <div className="calendar-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={fetchCalendarData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!calendarData) {
    return (
      <div className={`booking-calendar ${className}`}>
        <div className="calendar-error">
          <span>No calendar data available</span>
        </div>
      </div>
    );
  }

  const selectedDay = getSelectedDay();

  return (
    <div className={`booking-calendar ${className}`}>
      {/* Calendar Header */}
      <div className="calendar-header">
        <button
          onClick={() => navigateMonth("prev")}
          className="nav-button prev-button"
          disabled={
            currentYear === new Date().getFullYear() &&
            currentMonth <= new Date().getMonth() + 1
          }
        >
          ‹
        </button>
        <h3 className="month-year">
          {monthNames[currentMonth - 1]} {currentYear}
        </h3>
        <button
          onClick={() => navigateMonth("next")}
          className="nav-button next-button"
          disabled={currentYear > new Date().getFullYear() + 1}
        >
          ›
        </button>
      </div>

      {/* Calendar Info */}
      <div className="calendar-info">
        <span className="available-slots">
          {calendarData.availableSlots} available slots
        </span>
        <span className="timezone">{timezone}</span>
      </div>

      {/* Day Names */}
      <div className="calendar-days-header">
        {dayNames.map((day) => (
          <div key={day} className="day-name">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Empty cells for days before month starts */}
        {Array.from(
          { length: new Date(currentYear, currentMonth - 1, 1).getDay() },
          (_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ),
        )}

        {/* Month days */}
        {calendarData.days.map((day) => (
          <div
            key={day.date}
            className={`calendar-day ${
              day.available ? "available" : "unavailable"
            } ${day.isBlocked ? "blocked" : ""} ${
              isToday(day.date) ? "today" : ""
            } ${isSelected(day.date) ? "selected" : ""} ${
              selectedDate === day.date ? "active" : ""
            }`}
            onClick={() => handleDateClick(day)}
            title={
              day.blockReason ||
              (day.available ? "Available" : "No available slots")
            }
          >
            <span className="day-number">
              {parseInt(day.date.split("-")[2], 10)}
            </span>
            {day.available && (
              <span className="available-count">
                {day.timeSlots.filter((slot) => slot.available).length}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Time Slots */}
      {showTimeSlots && selectedDay && (
        <div className="time-slots-container">
          <div className="time-slots-header">
            <h4>
              Available times for {new Date(selectedDate!).toLocaleDateString()}
            </h4>
            <button
              onClick={() => setShowTimeSlots(false)}
              className="close-button"
            >
              ×
            </button>
          </div>

          <div className="time-slots-grid">
            {selectedDay.timeSlots
              .filter((slot) => slot.available)
              .map((slot) => (
                <button
                  key={slot.time}
                  className={`time-slot ${
                    isTimeSelected(slot.time) ? "selected" : ""
                  }`}
                  onClick={() => handleTimeClick(selectedDate!, slot.time)}
                >
                  {slot.time}
                </button>
              ))}
          </div>

          {selectedDay.timeSlots.filter((slot) => slot.available).length ===
            0 && (
            <div className="no-slots">
              No available time slots for this date
            </div>
          )}
        </div>
      )}

      {/* Calendar Styles */}
      <style jsx>{`
        .booking-calendar {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          max-width: 400px;
          margin: 0 auto;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .nav-button {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
        }

        .nav-button:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .month-year {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }

        .calendar-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .calendar-days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          margin-bottom: 4px;
        }

        .day-name {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          padding: 4px;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          position: relative;
          min-height: 40px;
        }

        .calendar-day.empty {
          cursor: default;
        }

        .calendar-day.available {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          color: #0ea5e9;
        }

        .calendar-day.available:hover {
          background: #e0f2fe;
        }

        .calendar-day.unavailable {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .calendar-day.blocked {
          background: #fef2f2;
          color: #ef4444;
          cursor: not-allowed;
        }

        .calendar-day.today {
          font-weight: bold;
          box-shadow: 0 0 0 2px #3b82f6;
        }

        .calendar-day.selected {
          background: #3b82f6 !important;
          color: white !important;
        }

        .calendar-day.active {
          background: #1d4ed8 !important;
          color: white !important;
        }

        .day-number {
          font-weight: 500;
        }

        .available-count {
          font-size: 0.625rem;
          opacity: 0.8;
        }

        .time-slots-container {
          margin-top: 1rem;
          border-top: 1px solid #e5e7eb;
          padding-top: 1rem;
        }

        .time-slots-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .time-slots-header h4 {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          color: #374151;
        }

        .time-slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
          gap: 10px;
        }

        @media (min-width: 768px) {
          .time-slots-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 480px) {
          .time-slots-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .time-slot {
          background: #f9fafb;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 12px 8px;
          cursor: pointer;
          font-size: 0.875rem;
          text-align: center;
          transition: all 0.2s ease;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .time-slot:hover {
          background: #f3f4f6;
        }

        .time-slot.selected {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .no-slots {
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
          padding: 1rem;
        }

        .calendar-loading,
        .calendar-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 1rem;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-icon {
          font-size: 1.5rem;
        }

        .retry-button {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .retry-button:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default BookingCalendar;
