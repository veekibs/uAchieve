"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import confetti from 'canvas-confetti';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";

export default function Step3ConfirmationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'verifying' | 'confirmed' | 'capacity_refunded' | 'pending'>('verifying');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      // If no session_id in URL, treat as generic confirmation view
      setStatus('confirmed');
      return;
    }

    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 3;

    const verifyStatus = async () => {
      try {
        const res = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();

        if (!isMounted) return;

        if (data.status === 'confirmed' && data.booking) {
          setBookingDetails(data.booking);
          setStatus('confirmed');
          // Launch Confetti only when confirmed in DB
          triggerConfetti();
        } else if (data.status === 'capacity_refunded') {
          setErrorMessage(data.message || 'Session capacity reached. Full refund issued.');
          setStatus('capacity_refunded');
        } else if (data.status === 'payment_failed') {
          setErrorMessage('Payment failed or cancelled.');
          setStatus('pending');
        } else {
          // Status pending - poll up to maxAttempts
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(verifyStatus, 1000);
          } else {
            setStatus('pending');
          }
        }
      } catch (err) {
        console.error("Verification error:", err);
        if (isMounted) setStatus('pending');
      }
    };

    verifyStatus();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const triggerConfetti = () => {
    const duration = 2200;
    const end = Date.now() + duration;
    const colors = ["#29ABE2", "#8DC63F"];

    const frame = () => {
      confetti({ particleCount: 2, angle: 60, spread: 50, origin: { x: 0, y: 0.6 }, colors, startVelocity: 35, ticks: 100, gravity: 1.0, scalar: 0.9 });
      confetti({ particleCount: 2, angle: 120, spread: 50, origin: { x: 1, y: 0.6 }, colors, startVelocity: 35, ticks: 100, gravity: 1.0, scalar: 0.9 });
      if (Date.now() < end) requestAnimationFrame(frame);
    };

    setTimeout(() => frame(), 150);
  };

  const courseTitle = bookingDetails?.courseTitle || searchParams.get('courseName') || "Course Confirmed";

  return (
    <div className="flex flex-col min-h-screen bg-white font-['Plus_Jakarta_Sans'] relative overflow-hidden">
      <style jsx global>{`
        @media print {
          nav, footer, .no-print { display: none !important; }
          main { padding-top: 0 !important; }
        }
      `}</style>
      <div className="no-print"><Navbar /></div>

      <main className="min-h-[100dvh] flex flex-col w-full relative z-10 print:pt-0">
        <div className="max-w-7xl mx-auto px-6 w-full flex-1 flex flex-col">
          {/* Booking Stepper Presentation Layout */}
          <div className="flex justify-center items-start gap-1 mt-32 lg:mt-40 mb-12 no-print">
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 bg-[#8DC63F] rounded-full flex justify-center items-center"><CheckCircle size={16} className="text-white" /></div>
              <span className="text-[#8DC63F] text-xs font-bold font-['Plus Jakarta Sans']">Your Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mt-4 relative"><div className="absolute top-0 left-0 h-full w-full bg-[#8DC63F]" /></div>
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 bg-[#8DC63F] rounded-full flex justify-center items-center"><CheckCircle size={16} className="text-white" /></div>
              <span className="text-[#8DC63F] text-xs font-bold font-['Plus Jakarta Sans']">Payment</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mt-4 relative"><div className="absolute top-0 left-0 h-full w-full bg-[#8DC63F]" /></div>
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 bg-sky-500 rounded-full flex justify-center items-center"><span className="text-white text-sm font-bold font-['Plus Jakarta Sans']">3</span></div>
              <span className="text-slate-800 text-xs font-bold font-['Plus Jakarta Sans']">Confirmation</span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center pb-32">
            {status === 'verifying' && (
              <div className="flex flex-col items-center justify-center gap-4 text-center py-12">
                <Loader2 className="animate-spin text-[#29ABE2] size-12" />
                <h2 className="text-slate-800 text-2xl font-bold">Verifying Booking Details...</h2>
                <p className="text-slate-500 text-sm">Please wait while we confirm your transaction with Stripe and PostgreSQL.</p>
              </div>
            )}

            {status === 'confirmed' && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="size-20 p-4 bg-lime-400/10 rounded-full flex justify-center items-center">
                    <CheckCircle size={40} className="text-[#8DC63F]" />
                  </div>
                  <h2 className="text-slate-800 text-4xl font-bold leading-[54px]">Booking Confirmed!</h2>
                  <p className="text-slate-600 text-base">Your booking for <strong>{courseTitle}</strong> has been confirmed. A confirmation email has been dispatched to your inbox.</p>
                </div>

                {bookingDetails && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-slate-500 text-sm font-medium">Booking Reference:</span>
                      <span className="text-[#29ABE2] font-mono font-bold text-sm">{bookingDetails.booking_reference}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-slate-500 text-sm font-medium">Date:</span>
                      <span className="text-slate-800 font-bold text-sm">
                        {new Date(bookingDetails.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm font-medium">Venue:</span>
                      <span className="text-slate-800 font-bold text-sm">{bookingDetails.venue_name}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mt-4 no-print">
                  <Link href="/" className="flex-1 block">
                    <button className="w-full h-14 rounded-xl outline outline-1 outline-offset-[-1.11px] outline-gray-200 text-slate-600 text-base font-bold transition-all hover:bg-gray-50">
                      Return to Home
                    </button>
                  </Link>
                  <Link href="/courses" className="flex-1 block">
                    <button className="w-full h-14 bg-sky-500 rounded-xl text-white text-base font-bold transition-all hover:bg-sky-600">
                      View More Courses
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {status === 'capacity_refunded' && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-6">
                <div className="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle size={36} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-900">Session Full - Full Refund Issued</h2>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {errorMessage || 'Due to simultaneous checkouts, this session reached maximum capacity as your payment processed. A full refund has been automatically issued to your payment method.'}
                </p>
                <div className="pt-4 border-t border-red-200 text-xs text-slate-600">
                  Please allow 5-10 business days for the funds to reflect in your account. Contact us at <a href="mailto:info@uachieve.co.uk" className="text-red-700 font-bold underline">info@uachieve.co.uk</a> to select an alternative date.
                </div>
                <Link href="/courses" className="inline-block">
                  <button className="px-6 py-3 bg-red-700 text-white font-bold rounded-xl hover:bg-red-800 transition-colors">
                    Browse Other Course Dates
                  </button>
                </Link>
              </div>
            )}

            {status === 'pending' && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-6">
                <div className="size-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock size={36} className="text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-amber-900">Payment Received — Booking Finalization Pending</h2>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Your payment was received by Stripe, but our system is taking a moment to finalize your booking record.
                </p>
                
                <div className="bg-white border border-amber-200 rounded-2xl p-6 text-left space-y-3">
                  <h3 className="font-bold text-amber-900 text-sm">Next Steps:</h3>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5">
                    <li>Please check your email inbox for your booking confirmation.</li>
                    <li>If you do not receive a confirmation email within 10 minutes, please contact us at <a href="mailto:info@uachieve.co.uk" className="text-amber-800 font-bold underline">info@uachieve.co.uk</a>.</li>
                    <li>Provide your payment reference ID: <code className="bg-slate-100 px-2 py-0.5 rounded text-amber-900 font-mono text-xs">{sessionId || 'N/A'}</code></li>
                  </ul>
                </div>

                <Link href="/" className="inline-block">
                  <button className="px-6 py-3 bg-amber-800 text-white font-bold rounded-xl hover:bg-amber-900 transition-colors">
                    Return to Home
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="no-print"><Footer /></div>
    </div>
  );
}