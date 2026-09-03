'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Calendar, Clock, MapPin, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { formatTimeRange } from '@/lib/time';

function RebookContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setError('Missing rebook security token. Please check your email link.');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/bookings/rebook/validate?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Invalid or expired rebook link.');
          setLoading(false);
          return;
        }

        setBookingData(data.booking);
        setSessions(data.availableSessions || []);
        setLoading(false);
      } catch (err) {
        console.error('Validation fetch error:', err);
        setError('Failed to load rebooking details. Please try again.');
        setLoading(false);
      }
    };

    fetchDetails();
  }, [token]);

  const handleConfirmRebook = async () => {
    if (!selectedSessionId || !token) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings/rebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          targetSessionId: selectedSessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to complete rebooking.');
        setSubmitting(false);
        return;
      }

      setSuccessBooking(data.booking);
      setSubmitting(false);
    } catch (err) {
      console.error('Rebook submission error:', err);
      setError('An error occurred during transfer. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <Loader2 className="animate-spin text-[#29ABE2] size-10 mb-4" />
        <p className="text-slate-600 font-medium">Validating your rebooking token...</p>
      </div>
    );
  }

  if (successBooking) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-['Plus_Jakarta_Sans']">
        <Navbar />
        <main className="flex-1 max-w-3xl w-full mx-auto px-6 pt-[120px] pb-20">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 text-center">
            <div className="size-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={36} className="text-[#8DC63F]" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Rebooking Confirmed!</h1>
            <p className="text-slate-600 mb-6">
              Your training session has been successfully transferred to the new date. A confirmation email has been sent to your inbox.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium text-sm">Course:</span>
                <span className="text-slate-800 font-bold text-sm">{successBooking.session.course.title}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium text-sm">New Reference:</span>
                <span className="text-[#29ABE2] font-bold font-mono text-sm">{successBooking.booking_reference}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium text-sm">Date:</span>
                <span className="text-slate-800 font-bold text-sm">
                  {new Date(successBooking.session.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium text-sm">Venue:</span>
                <span className="text-slate-800 font-bold text-sm">{successBooking.session.venue_name}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-[#29ABE2] text-white font-bold rounded-xl hover:bg-sky-600 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !bookingData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-['Plus_Jakarta_Sans']">
        <Navbar />
        <main className="flex-1 max-w-xl w-full mx-auto px-6 pt-[140px] pb-20">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-200 text-center">
            <div className="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Rebooking Error</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-['Plus_Jakarta_Sans']">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-[120px] pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Select Your New Training Date</h1>
          <p className="text-slate-600">
            Rebooking for: <strong className="text-slate-800">{bookingData?.session?.course?.title}</strong> ({bookingData?.user?.email})
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 flex items-center gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-8" role="radiogroup" aria-label="Available training sessions">
          {sessions.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-slate-600">
              No upcoming available dates found for this course right now. Please check back soon or contact support at <a href="mailto:info@uachieve.co.uk" className="text-sky-600 font-semibold underline">info@uachieve.co.uk</a>.
            </div>
          ) : (
            sessions.map((s) => {
              const isFull = s.bookedCount >= s.maxCapacity;
              const isSelected = selectedSessionId === s.id;

              return (
                <div
                  key={s.id}
                  role="radio"
                  aria-checked={isSelected}
                  aria-disabled={isFull}
                  tabIndex={isFull ? -1 : 0}
                  onClick={() => {
                    if (!isFull) {
                      setSelectedSessionId(s.id);
                      setError(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (!isFull && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setSelectedSessionId(s.id);
                      setError(null);
                    }
                  }}
                  className={`p-6 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-h-[56px] focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none ${
                    isFull
                      ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-sky-50 border-[#29ABE2] ring-2 ring-[#29ABE2]'
                      : 'bg-white border-gray-200 hover:border-sky-300 cursor-pointer'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Calendar size={18} className="text-[#29ABE2] shrink-0" />
                      <span className="font-bold text-slate-900 text-base">
                        {new Date(s.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      {isFull && (
                        <span className="px-2.5 py-0.5 bg-red-100 text-red-800 font-bold text-xs rounded-full">
                          Fully Booked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock size={14} className="text-[#29ABE2]" />
                        {formatTimeRange(s.start_time, s.end_time)}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin size={14} className="text-[#29ABE2]" />
                        {s.venue_name}
                      </span>
                    </div>
                  </div>

                  {!isFull && (
                    <div className={`size-6 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-[#29ABE2] bg-[#29ABE2]' : 'border-gray-300'}`}>
                      {isSelected && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={handleConfirmRebook}
          disabled={!selectedSessionId || submitting}
          className="w-full min-h-[52px] py-4 bg-[#8DC63F] hover:bg-[#7AB32E] text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-[0_0_24px_rgba(141,198,63,0.35)] focus-visible:ring-2 focus-visible:ring-[#8DC63F] focus-visible:ring-offset-2 focus-visible:outline-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="animate-spin" size={20} />}
          {submitting ? 'Transferring Booking...' : 'Confirm Rebooking (No Extra Charge)'}
        </button>
      </main>
      <Footer />
    </div>
  );
}

export default function RebookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader2 className="animate-spin text-[#29ABE2] size-10" />
      </div>
    }>
      <RebookContent />
    </Suspense>
  );
}

