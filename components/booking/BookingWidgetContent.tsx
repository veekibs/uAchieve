"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { formatTimeRange } from "@/lib/time";

interface BookingWidgetContentProps {
  isMobile?: boolean;
  price: string;
  courseTitle: string;
  slug: string; // Add slug prop
  courseId: string; // Add courseId prop
  sessions: any[]; // Add sessions prop
}

export default function BookingWidgetContent({ isMobile = false, price, courseTitle, slug, courseId, sessions }: BookingWidgetContentProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for the currently viewed month/year in the calendar
  const [viewDate, setViewDate] = useState(() => 
    sessions.length > 0 ? new Date(sessions[0].date) : new Date()
  );

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  
  const today = new Date();
  const isCurrentOrPastMonth = 
    currentYear < today.getFullYear() || 
    (currentYear === today.getFullYear() && currentMonth <= today.getMonth());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (isCurrentOrPastMonth) return;
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
  };

  const calendarDays = useMemo(() => {
    const d = [];
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      d.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) d.push(i);
    return d;
  }, [daysInMonth, firstDayOfMonth]);

  const selectedSession = useMemo(() => {
    if (selectedDate === null) return null;
    return sessions.find(s => {
      const d = new Date(s.date);
      return d.getDate() === selectedDate && 
             d.getMonth() === currentMonth && 
             d.getFullYear() === currentYear;
    }) || null;
  }, [selectedDate, currentMonth, currentYear, sessions]);

  const formattedTimeRange = useMemo(() => {
    if (!selectedSession || !selectedSession.start_time || !selectedSession.end_time) return null;
    return formatTimeRange(selectedSession.start_time, selectedSession.end_time);
  }, [selectedSession]);

  const handleContinue = () => {
    if (selectedDate === null || !selectedSession) {
      setError("Please select an available date to continue.");
      return;
    }

    setError(null);
    const queryParams = new URLSearchParams({
      slug,
      courseId,
      sessionId: selectedSession.id,
      date: new Date(selectedSession.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
      time: formattedTimeRange || ''
    }).toString();

    router.push(`/book/step1?${queryParams}`);
  };

  return (
    <div className={`flex flex-col gap-5 ${!isMobile ? 'bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6 border border-[#E5E7EB]' : 'pb-8'}`}>
      
      {/* Price Header (Desktop Only, or as part of drawer content) */}
      {!isMobile && (
        <div className="border-b border-[#F0F4F8] pb-6">
          <div className="flex items-baseline gap-2 font-['Plus Jakarta Sans']">
            <span className="text-[40px] font-bold text-[#1A2E3B]">{price}</span>
            <span className="text-[#9CA3AF] text-[14px] font-['Plus Jakarta Sans']">Per person</span>
          </div>
          <span className="text-[#4A5568] text-[14px]">Certificate included</span>
        </div>
      )}

      {/* Course Title (Mobile Drawer Only) */}
      {isMobile && (
        <div className="flex flex-col gap-1 mb-2">
            <span className="text-[#9CA3AF] text-xs uppercase tracking-wide font-['Plus Jakarta Sans']">Course</span>
            <span className="text-[#1A2E3B] text-base font-bold font-['Plus Jakarta Sans']">{courseTitle}</span>
        </div>        
      )}

      {/* Date Picker */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[#29ABE2]" />
          <span className="text-[12px] uppercase tracking-[0.08em] font-bold text-[#9CA3AF] flex items-center gap-2 font-['Plus Jakarta Sans'] leading-4">
            Select Date
          </span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#E5E7EB] flex flex-col gap-3">
          {/* Month Navigation */}
          <div className="flex justify-between items-center">
            <button 
              onClick={handlePrevMonth}
              disabled={isCurrentOrPastMonth}
              aria-label="Previous month"
              className={`p-1 rounded-lg transition-all ${
                isCurrentOrPastMonth 
                  ? "opacity-20 cursor-not-allowed pointer-events-none" 
                  : "hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <ChevronLeft size={16} className="text-[#4A5568]"/>
            </button>
            <span className="text-[#1A2E3B] text-sm font-bold font-['Plus Jakarta Sans'] leading-5">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button 
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} className="text-[#4A5568]"/>
            </button>
          </div>
          {/* Days Grid Header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S','M','T','W','T','F','S'].map((d, i) => <span key={i} className="text-[#9CA3AF] text-xs font-semibold font-['Plus Jakarta Sans'] leading-4">{d}</span>)}
          </div>
          {/* Days Grid Content */}
          <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="py-1.5" />; // Empty cell
              }
              
              // Find if there is actually a session in the database for this specific day
              const sessionForDay = sessions.find(s => {
                const d = new Date(s.date);
                return d.getDate() === day && 
                       d.getMonth() === currentMonth && 
                       d.getFullYear() === currentYear;
              });

              const isSaturday = new Date(currentYear, currentMonth, day).getDay() === 6;
              const isSelected = selectedDate === day;
              const isFullyBooked = sessionForDay ? ((sessionForDay.bookedCount || 0) >= (sessionForDay.maxCapacity || sessionForDay.max_capacity || 12)) : false;
              const isAvailable = sessionForDay && !isFullyBooked;

              if (sessionForDay || isSaturday) {
                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (isFullyBooked) {
                        setError("This session is fully booked. Please select another date.");
                      } else if (sessionForDay) {
                        setSelectedDate(day);
                        setError(null);
                      } else {
                        setError("No session available for this Saturday.");
                      }
                    }}
                    disabled={isFullyBooked}
                    className={`py-1.5 rounded-lg transition-colors font-['Plus Jakarta Sans'] leading-5 ${
                      isSelected 
                        ? 'bg-[#29ABE2] text-white font-bold shadow-sm' 
                        : (isAvailable 
                            ? 'bg-[#29ABE2]/10 text-[#29ABE2] font-semibold hover:bg-[#29ABE2]/20 cursor-pointer' 
                            : (isFullyBooked 
                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-50 line-through' 
                                : 'text-[#D1D5DB] cursor-not-allowed hover:bg-gray-50'))
                    }`}
                  >
                    {day}
                  </button>
                );
              } else {
                // Other days are not selectable
                return (
                  <div
                    key={day}
                    className="text-[#D1D5DB] opacity-30 py-1.5 font-['Plus Jakarta Sans'] leading-5 cursor-not-allowed"
                  >
                    {day}
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>

      {/* Time Display */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#29ABE2]" />
          <span className="text-[#9CA3AF] text-xs font-bold font-['Plus Jakarta Sans'] uppercase leading-4 tracking-wide">Session Hours</span>
        </div>
        <div className="flex flex-col gap-3">
          {selectedSession && formattedTimeRange ? (
            <div className="w-full py-3.5 px-4 text-sm font-semibold font-['Plus Jakarta Sans'] leading-5 rounded-xl bg-[rgba(41,171,226,0.08)] border border-[#29ABE2] text-[#29ABE2] flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-[#29ABE2]">Session Time</span>
              <span className="font-bold text-sm">{formattedTimeRange}</span>
            </div>
          ) : (
            <div className="w-full py-3.5 px-4 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-[#9CA3AF] text-center">
              Select an available date above
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-[#9CA3AF] text-xs font-normal font-['Plus Jakarta Sans'] leading-4">Flexible scheduling available for groups</span>
          <span className="text-[#29ABE2] text-xs font-medium font-['Plus Jakarta Sans'] leading-4">
            {selectedSession && formattedTimeRange
              ? `${selectedDate} ${viewDate.toLocaleString('default', { month: 'short' })}, ${formattedTimeRange}`
              : "Please select a date"}
          </span>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="p-4 bg-[#F8FAFB] rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
        {[
          { icon: ShieldCheck, text: "Secure via Stripe" },
          { icon: CheckCircle2, text: "Instant Booking" },
          { icon: CheckCircle2, text: "Free Cancellation" },
          { icon: CheckCircle2, text: "Same-day Cert" }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <item.icon size={14} className="text-[#8DC63F] shrink-0" />
            <span className="text-[#4A5568] text-[11px] font-medium font-['Plus Jakarta Sans'] leading-tight">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium font-['Plus Jakarta Sans']">
          {error}
        </div>
      )}

      <div className="h-px bg-[#F0F4F8] w-full" />

      {/* Continue CTA */}
      <button
        onClick={handleContinue}
        className="w-full bg-[#8DC63F] text-white text-base font-bold font-['Plus Jakarta Sans'] leading-6 h-14 rounded-xl shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10),_0px_1px_3px_0px_rgba(0,0,0,0.10)] inline-flex justify-center items-center gap-2 transition-all hover:bg-[#7AB32E] hover:shadow-[0_0_28px_rgba(141,198,63,0.35)] active:scale-[0.98]"
      >
        Continue to Book
        <ChevronRight size={18} />
      </button>

      {/* Contact us */}
      <div className="flex justify-center mt-1">
        <Link href="/contact" className="flex items-center gap-2 text-[#29ABE2] text-sm font-semibold font-['Plus Jakarta Sans'] leading-5 hover:underline">
          <MessageSquare size={16} />
          Questions? Contact us
        </Link>
      </div>
    </div>
  );
}
