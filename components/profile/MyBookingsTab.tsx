"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTimeRange } from "@/lib/time";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Eye,
  XCircle,
  BookOpen,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Check
} from "lucide-react";

interface MyBookingsTabProps {
  onSwitchTab?: (tab: string) => void;
}

export default function MyBookingsTab({ onSwitchTab }: MyBookingsTabProps) {
  const [activeModal, setActiveModal] = useState<'idle' | 'details' | 'cancel-confirm' | 'no-refund' | 'processing' | 'cancelled'>('idle');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [cancelType, setCancelType] = useState<'full' | 'partial' | 'none'>('full');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/profile/bookings');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const formatted = data.map(b => {
            const sessionDate = new Date(b.session.date);
            
            return {
              dbId: b.id,
              id: b.booking_reference,
              course: b.session.course.title,
              date: sessionDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
              time: formatTimeRange(b.session.start_time, b.session.end_time),
              venue: b.session.venue_name,
              status: b.payment_status === 'paid' ? 'Confirmed' : b.payment_status,
              month: sessionDate.toLocaleString('default', { month: 'short' }),
              day: sessionDate.getDate().toString(),
              rawDate: sessionDate,
              attendanceStatus: b.attendance_status
            };
          });
          setBookings(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const { upcomingBookings, pastBookings } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const upcoming = bookings.filter(b => b.rawDate >= now);
    const past = bookings.filter(b => b.rawDate < now);
    
    return { upcomingBookings: upcoming, pastBookings: past };
  }, [bookings]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin text-sky-500" size={32} />
      </div>
    );
  }

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setActiveModal('details');
  };

  const handleOpenCancel = (booking: any) => {
    setSelectedBooking(booking);
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = booking.rawDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 14) {
      setCancelType('full');
      setActiveModal('cancel-confirm');
    } else if (diffDays >= 7) {
      setCancelType('partial');
      setActiveModal('cancel-confirm');
    } else {
      setCancelType('none');
      setActiveModal('no-refund');
    }
  };

  const handleConfirmCancel = () => {
    startCancellation();
  };

  const startCancellation = async () => {
    setActiveModal('processing');
    try {
      const response = await fetch(`/api/profile/bookings/${selectedBooking.dbId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to cancel booking');

      setBookings(prev => prev.filter(b => b.dbId !== selectedBooking.dbId));
      setActiveModal('cancelled');
    } catch (error) {
      console.error(error);
      setActiveModal('idle');
      alert("Failed to cancel booking. Please try again or contact support.");
    }
  };

  return (
    <div className="flex flex-col gap-12 font-['Plus_Jakarta_Sans']">
      {/* Upcoming Bookings Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-6"
      >
        <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 text-center sm:text-left">
          Upcoming Bookings
        </h2>
        <div className="flex flex-col gap-4">
          {upcomingBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1.11px] outline-gray-200 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              {/* Date Badge */}
              <div className="size-20 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1.11px] outline-slate-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-gray-400 text-xs font-medium font-['Plus Jakarta Sans'] uppercase leading-5 tracking-wide">
                  {booking.month}
                </span>
                <span className="text-slate-800 text-3xl font-bold font-['Plus Jakarta Sans'] leading-8">
                  {booking.day}
                </span>
              </div>

              {/* Booking Details */}
              <div className="flex-1 flex flex-col gap-2">
                <h3 className="text-slate-800 text-base font-bold leading-6">
                  {booking.course}
                </h3>
                <span className="text-gray-400 text-xs font-normal font-mono">
                  Reference: {booking.id}
                </span>
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-x-6 gap-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400 shrink-0" />
                    <span className="text-slate-600 text-sm font-normal leading-5">
                      {booking.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400 shrink-0" />
                    <span className="text-slate-600 text-sm font-normal leading-5">
                      {booking.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400 shrink-0" />
                    <span className="text-slate-600 text-sm font-normal leading-5">
                      {booking.venue}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-[#8DC63F]/10 rounded-full w-fit flex items-center gap-1 mt-2">
                  <CheckCircle size={12} className="text-[#8DC63F]" />
                  <span className="text-[#8DC63F] text-xs font-medium leading-4">
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:ml-auto sm:text-right">
                <button 
                  onClick={() => handleViewDetails(booking)}
                  className="px-4 h-11 rounded-xl outline outline-1 outline-offset-[-1.11px] outline-gray-200 text-slate-800 text-sm font-bold leading-5 transition-all hover:bg-gray-50 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View Details
                </button>
                <button 
                  onClick={() => handleOpenCancel(booking)}
                  className="h-10 text-red-500 text-xs font-bold leading-5 hover:underline flex items-center justify-center gap-1 transition-all"
                >
                  <XCircle size={14} />
                  Cancel Booking
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Past Bookings Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col gap-4"
      >
        <h2 className="text-gray-400 text-base font-bold font-['Plus Jakarta Sans'] leading-6 text-center sm:text-left">
          Past Bookings
        </h2>
        <div className="flex flex-col gap-4">
          {pastBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl outline outline-1 outline-offset-[-1.11px] outline-slate-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-[#8DC63F]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-slate-600 text-base font-bold leading-6">
                    {booking.course}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-gray-400 text-xs font-normal leading-5">
                      {booking.date}
                    </span>
                    <span className="text-gray-400 text-xs font-normal leading-5">
                      {booking.venue}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-3 sm:mt-0">
                <div className="px-3 py-1 bg-[#8DC63F]/10 rounded-full w-fit flex items-center gap-1">
                  <CheckCircle size={12} className="text-[#8DC63F]" />
                  <span className="text-[#8DC63F] text-xs font-medium leading-4">
                    {booking.status}
                  </span>
                </div>
                <button 
                  onClick={() => onSwitchTab?.('certificates')}
                  className="text-sky-500 text-xs font-bold leading-5 hover:underline shrink-0"
                >
                  View Certificate
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Booking Details & Cancellation Modals */}
      <AnimatePresence>
        {activeModal !== 'idle' && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              {/* Step: View Details */}
              {activeModal === 'details' && (
                <>
                  <div className="bg-sky-500 p-6 flex justify-between items-start">
                    <div className="flex flex-col text-white">
                      <h3 className="text-xl font-bold leading-7">{selectedBooking.course}</h3>
                      <span className="text-xs text-white/80 font-mono mt-1">Ref: {selectedBooking.id}</span>
                    </div>
                    <button onClick={() => setActiveModal('idle')} className="size-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="p-6 flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0">
                          <Calendar size={18} className="text-sky-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tight">Date</span>
                          <span className="text-slate-800 text-sm font-bold">{selectedBooking.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0">
                          <Clock size={18} className="text-sky-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tight">Time</span>
                          <span className="text-slate-800 text-sm font-bold">{selectedBooking.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0">
                          <MapPin size={18} className="text-sky-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tight">Venue</span>
                          <span className="text-slate-800 text-sm font-bold line-clamp-1">{selectedBooking.venue}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-lime-50 rounded-xl border border-lime-100/50 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-[#8DC63F]" />
                        <span className="text-[#8DC63F] text-sm font-bold">Booking Confirmed</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed mt-1">
                        You&apos;ll receive a confirmation email 48 hours before the course with full venue details.
                      </p>
                    </div>
                    <button onClick={() => setActiveModal('idle')} className="w-full h-12 bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all">
                      Close
                    </button>
                  </div>
                </>
              )}

              {/* Step: Cancel Confirmation */}
              {activeModal === 'cancel-confirm' && (
                <div className="p-8 text-center flex flex-col items-center gap-6">
                  <div className="size-16 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertCircle size={32} className="text-red-500" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-slate-800 text-xl font-bold">Cancel Booking?</h3>
                    <p className="text-slate-500 text-sm leading-relaxed px-4">
                      Are you sure you want to cancel your booking for <span className="font-bold text-slate-700">{selectedBooking.course}</span> on {selectedBooking.date}?
                    </p>
                    {cancelType === 'full' && (
                      <p className="text-[#8DC63F] text-xs font-bold mt-1 bg-lime-50 py-2 px-3 rounded-lg border border-lime-100">100% Refund will be issued</p>
                    )}
                    {cancelType === 'partial' && (
                      <p className="text-amber-600 text-xs font-bold mt-1 bg-amber-50 py-2 px-3 rounded-lg border border-amber-100">50% Refund will be issued</p>
                    )}
                  </div>
                  <div className="flex flex-col w-full gap-3">
                    <button onClick={handleConfirmCancel} className="w-full h-12 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                      Yes, Cancel
                    </button>
                    <button onClick={() => setActiveModal('idle')} className="w-full h-12 text-slate-500 text-sm font-bold hover:bg-gray-50 rounded-xl transition-all">
                      Keep Booking
                    </button>
                  </div>
                </div>
              )}

              {/* Step: No Refund Available */}
              {activeModal === 'no-refund' && (
                <div className="p-8 text-center flex flex-col items-center gap-6">
                  <div className="size-16 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertCircle size={32} className="text-red-500" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-slate-800 text-xl font-bold">No Refund Available</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      You&apos;re cancelling less than 7 days before the course date.
                    </p>
                  </div>
                  <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3 text-left">
                    <h4 className="text-slate-800 text-xs font-bold uppercase tracking-wider">Cancellation Policy</h4>
                    <ul className="flex flex-col gap-2">
                      <li className="flex gap-2 items-start text-slate-600 text-xs leading-relaxed">
                        <Check size={14} className="text-[#8DC63F] mt-0.5 shrink-0" />
                        Unfortunately, no refund is available
                      </li>
                      <li className="flex gap-2 items-start text-slate-600 text-xs leading-relaxed">
                        <Check size={14} className="text-[#8DC63F] mt-0.5 shrink-0" />
                        However, you may rebook to another date
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col w-full gap-3">
                    <button onClick={startCancellation} className="w-full h-12 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                      Confirm Cancellation
                    </button>
                    <button onClick={() => setActiveModal('cancel-confirm')} className="w-full h-12 text-slate-500 text-sm font-bold hover:bg-gray-50 rounded-xl transition-all">
                      Go Back
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Processing */}
              {activeModal === 'processing' && (
                <div className="p-12 text-center flex flex-col items-center gap-6">
                  <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Loader2 size={32} className="text-sky-500 animate-spin" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-slate-800 text-xl font-bold">Processing...</h3>
                    <p className="text-slate-500 text-sm">Cancelling your booking</p>
                  </div>
                </div>
              )}

              {/* Step: Cancelled Success */}
              {activeModal === 'cancelled' && (
                <div className="p-8 text-center flex flex-col items-center gap-6">
                  <div className="size-16 bg-lime-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-[#8DC63F]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-slate-800 text-xl font-bold">Booking Cancelled</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Your booking has been successfully cancelled. You&apos;ll receive a confirmation email shortly.
                    </p>
                  </div>
                  <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Contact us to rebook your course to another available date.
                    </p>
                  </div>
                  <button onClick={() => setActiveModal('idle')} className="w-full h-12 bg-[#8DC63F] text-white rounded-xl font-bold shadow-lg shadow-lime-500/20 active:scale-95 transition-all">
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}